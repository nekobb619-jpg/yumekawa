/* =====================================================================
   js/boss-quest.js  ---  ボスクエスト（因果関係の構築を「選択式パズル」で練習させるミッション）
   ---------------------------------------------------------------------
   読み込み順番： index.html で js/patch.js のあとに読み込むこと
   （window.saveData / window.saveGame / window.updateUI に依存するため）。

   もとは lab/探究/proto_boss_quest_causal_reasoning.html のプロトタイプ。
   画面ロジックは（#bq-progress / #bq-stage をターゲットにするよう差し替えた以外）
   ほぼそのまま移植し、本番投入用の内容に差し替え済み。
   報酬は既存のQ（済/日次上限あり）とは別枠の「かけら」を、saveData.bossQuestCleared[missionId]で
   ミッションごとに一度きりだけ付与する非消費型レイヤーにしてある（繰り返しクリアしても再付与しない）。

   ★2026-08-08追加：MISSION_LISTに複数ミッションを並べられるようにした（当初は1本のみ）。
   ★2026-08-08追加（同日）：「今日のおはなし」のように1日1題ペースで解放する方式に変更
   （saveData.bossQuestUnlockedCount/bossQuestLastUnlockDate）。遊ばなかった日があっても
   解放ぶんは貯まるので取りこぼしにはならない。メインメニューのバナーは「ボスクエスト」ではなく
   「今日のなぞとき」表記（book-bannerのすぐ下、#dailymission-banner）。
   ★2026-08-19変更：件数固定の「解放ぶんが貯まる」方式だと、MISSION_LIST.length（当時10件）を
   遊びつくすと以降ずっと同じ最後の1問がループするだけになる不具合があった（りお：全10問クリア後、
   毎日同じ最終問題が出続けていた）。book.js（おはなし）と同じ「日付 % 件数」の巡回方式に変更し、
   ミッション数を増やせば増やすほど長く遊べる・尽きたら最初から巡回、という設計に統一した。
   bossQuestUnlockedCount/bossQuestLastUnlockDateは廃止（新コードは参照しない）。
   新しいミッションを追加する場合は AGENTS.md 3.5（問題生成時の内容精査チェックリスト）を必ず適用すること。
   ===================================================================== */
(function () {

  // ---- 1. 問題データ（本番投入用。小学4年生でも読める語彙・事実確認済み） ----
  var MISSION_LIST = [
    {
      id: "himawari_genki_nai_01",
      title: "🌻 ひまわりが 元気ない 事件",
      rewardKakera: 5, // ★宝島ショップのガチャ1回分（5枚消費）と同じ価値になるよう調整
      step1: {
        icon: "🌻",
        problemText: "花だんの ひまわりが、なんだか 元気がないよ…。葉っぱが しおれているみたい。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_water", icon: "💧", text: "水が たりないのかも" },
          { id: "h_light", icon: "☀️", text: "日光が たりないのかも" },
          { id: "h_soil", icon: "🌱", text: "土の えいようが たりないのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、ひまわりを しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_soil", icon: "🖐️", name: "土のしめりぐあいを みる", factId: "fact_soil_dry" },
          { id: "tool_light", icon: "☀️", name: "日当たりを たしかめる", factId: "fact_light_ok" },
          { id: "tool_fert", icon: "🌱", name: "こやし（ひりょう）の きろくを みる", factId: "fact_fert_ok" }
        ],
        facts: {
          fact_soil_dry: "しらべた けっか：土が カラカラに かわいている",
          fact_light_ok: "たしかめた けっか：日当たりは じゅうぶんだった",
          fact_fert_ok: "きろくの けっか：ひりょうは さきしゅう あげたばかりだった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        // 【根拠】は factId をキーに「事実カードの内容をそのまま言いかえたもの」にする
        // （事実と矛盾する言い回しにしない＝AGENTS.md 3.5の「誤答が明確に誤りか」に対応）。
        reasonPhrasing: {
          fact_soil_dry: "土が カラカラに かわいている",
          fact_light_ok: "日当たりは じゅうぶんだった",
          fact_fert_ok: "ひりょうは じゅうぶんだった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_water", text: "お水を たっぷり あげよう" },
          { id: "a_move_sunny", text: "日当たりの よい場所に うつそう" },
          { id: "a_add_fert", text: "ひりょうを あげよう" }
        ],
        solutions: [
          { reasonFactId: "fact_soil_dry", actionId: "a_water" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？もう一回、考えてみよう。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、ひまわりを たすけたね！",
        clearTextRepeat: "げんいんを つきとめて、ひまわりを たすけたね！"
      }
    },
    {
      // ★2026-08-08追加。小学4年生理科「電気のはたらき」単元（回路・導線・電池・豆電球）に対応する
      // 内容で、事実確認済み（電池切れ／断線／球切れのいずれかが原因、というのは回路の基本トラブル
      // シューティングとして標準的）。
      id: "mame_denkyu_tsukanai_01",
      title: "💡 豆電球が つかない 事件",
      rewardKakera: 5,
      step1: {
        icon: "💡",
        problemText: "かい中電灯（かいちゅうでんとう）の 豆電球（まめでんきゅう）が つかないよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_battery", icon: "🔋", text: "電池が きれているのかも" },
          { id: "h_wire", icon: "🔌", text: "どうせんが きれているのかも" },
          { id: "h_bulb", icon: "💡", text: "豆電球が きれているのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、回路（かいろ）を しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_battery", icon: "🔋", name: "電池チェッカーで しらべる", factId: "fact_battery_ok" },
          { id: "tool_wire", icon: "👀", name: "どうせんを 目で たどる", factId: "fact_wire_broken" },
          { id: "tool_bulb", icon: "💡", name: "べつの 豆電球と つけかえる", factId: "fact_bulb_ok" }
        ],
        facts: {
          fact_battery_ok: "しらべた けっか：電池は げんきだった",
          fact_wire_broken: "たどった けっか：どうせんが とちゅうで ちぎれていた",
          fact_bulb_ok: "つけかえた けっか：べつの 豆電球でも つかなかった（豆電球は せいじょう）"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_battery_ok: "電池は げんきだった",
          fact_wire_broken: "どうせんが とちゅうで ちぎれていた",
          fact_bulb_ok: "豆電球は せいじょうだった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_new_battery", text: "電池を あたらしく する" },
          { id: "a_fix_wire", text: "きれた どうせんを つなぎなおす" },
          { id: "a_new_bulb", text: "豆電球を あたらしく する" }
        ],
        solutions: [
          { reasonFactId: "fact_wire_broken", actionId: "a_fix_wire" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？回路は 1か所でも きれていると 電気が 流れないよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、かい中電灯を なおしたね！",
        clearTextRepeat: "げんいんを つきとめて、かい中電灯を なおしたね！"
      }
    },
    {
      // ★2026-08-08追加。日常生活の「半ドア→庫内温度が上がって食品が傷みやすくなる」は
      // 一般的な食品衛生の基礎知識として事実確認済み。
      id: "gyuunyuu_kusatta_01",
      title: "🥛 牛乳が くさった 事件",
      rewardKakera: 5,
      step1: {
        icon: "🥛",
        problemText: "れいぞうこに 入れていた 牛乳が、いつもより はやく くさってしまったよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_door", icon: "🚪", text: "ドアが きちんと しまっていなかったのかも" },
          { id: "h_temp", icon: "🌡️", text: "れいぞうこの おんどが おかしいのかも" },
          { id: "h_date", icon: "📅", text: "しょうみきげんが すぎていたのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、れいぞうこを しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_door", icon: "🚪", name: "ドアの しまりぐあいを しらべる", factId: "fact_door_open" },
          { id: "tool_temp", icon: "🌡️", name: "れいぞうこの おんどけいを みる", factId: "fact_temp_ok" },
          { id: "tool_date", icon: "📅", name: "しょうみきげんを たしかめる", factId: "fact_date_ok" }
        ],
        facts: {
          fact_door_open: "しらべた けっか：ドアが すこし あいていた（半（はん）ドア状態）",
          fact_temp_ok: "みた けっか：おんどは いつもどおり ちょうどよかった",
          fact_date_ok: "たしかめた けっか：しょうみきげんは まだ きれていなかった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_door_open: "ドアが すこし あいていた（半ドア状態）",
          fact_temp_ok: "おんどは いつもどおりだった",
          fact_date_ok: "しょうみきげんは きれていなかった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_close_door", text: "ドアを しっかり しめる" },
          { id: "a_lower_temp", text: "れいぞうこの おんどを もっと 下げる" },
          { id: "a_throw_away", text: "新しい 牛乳に かえる" }
        ],
        solutions: [
          { reasonFactId: "fact_door_open", actionId: "a_close_door" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？ドアが あいていたなら、まず しめることが 先だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、れいぞうこを 元どおりに したね！",
        clearTextRepeat: "げんいんを つきとめて、れいぞうこを 元どおりに したね！"
      }
    },
    {
      // ★2026-08-08追加。自転車のパンク・空気入れ・バルブは複数の自転車整備解説サイトで内容一致確認ずみ。
      id: "jitensha_panku_01",
      title: "🚲 タイヤが ぺしゃんこ 事件",
      rewardKakera: 5,
      step1: {
        icon: "🚲",
        problemText: "自転車の タイヤが、また ぺしゃんこに なっているよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_puncture", icon: "📌", text: "タイヤに とがった 物が ささっているのかも" },
          { id: "h_pump", icon: "🔧", text: "空気入れの つかいかたが まちがっているのかも" },
          { id: "h_valve", icon: "🔩", text: "バルブ（空気の 入り口）が ゆるんでいるのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、自転車を しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_surface", icon: "👀", name: "タイヤの ひょうめんを よく見る", factId: "fact_nail_found" },
          { id: "tool_pump", icon: "🔧", name: "空気入れの つかいかたを かくにんする", factId: "fact_pump_ok" },
          { id: "tool_valve", icon: "🔩", name: "バルブの しまりぐあいを しらべる", factId: "fact_valve_ok" }
        ],
        facts: {
          fact_nail_found: "よく見た けっか：小さな くぎのような ものが ささっていた",
          fact_pump_ok: "かくにんした けっか：空気入れの つかいかたは 正しかった",
          fact_valve_ok: "しらべた けっか：バルブは しっかり しまっていた"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_nail_found: "小さな くぎのような ものが ささっていた",
          fact_pump_ok: "空気入れの つかいかたは 正しかった",
          fact_valve_ok: "バルブは しっかり しまっていた"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_repair", text: "くぎを ぬいて、タイヤを しゅうりする" },
          { id: "a_repump", text: "もう一度 空気を 入れなおす" },
          { id: "a_tighten_valve", text: "バルブを もっと しめる" }
        ],
        solutions: [
          { reasonFactId: "fact_nail_found", actionId: "a_repair" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？くぎが ささったままだと、空気を 入れても また ぬけてしまうよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、自転車を なおしたね！",
        clearTextRepeat: "げんいんを つきとめて、自転車を なおしたね！"
      }
    },
    {
      // ★2026-08-08追加。「しつどが高いと洗濯物が乾きにくい」は気象・家庭科の基礎知識として事実確認済み。
      id: "sentakumono_kawakanai_01",
      title: "👕 せんたく物が かわかない 事件",
      rewardKakera: 5,
      step1: {
        icon: "👕",
        problemText: "きのう ほした せんたく物が、いつまでたっても かわかないよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_humidity", icon: "💦", text: "空気の しめりけ（しつど）が 高いのかも" },
          { id: "h_sun", icon: "☀️", text: "日当たりが わるいのかも" },
          { id: "h_wind", icon: "🌬️", text: "風通しが わるいのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_humidity", icon: "💦", name: "しつどけいを みる", factId: "fact_humidity_high" },
          { id: "tool_sun", icon: "☀️", name: "日当たりを たしかめる", factId: "fact_sun_ok" },
          { id: "tool_wind", icon: "🌬️", name: "風通しを たしかめる", factId: "fact_wind_ok" }
        ],
        facts: {
          fact_humidity_high: "みた けっか：しつどが とても 高かった（雨の日みたい）",
          fact_sun_ok: "たしかめた けっか：日当たりは いつもどおり よかった",
          fact_wind_ok: "たしかめた けっか：風通しは いつもどおり よかった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_humidity_high: "しつどが とても 高かった",
          fact_sun_ok: "日当たりは いつもどおり よかった",
          fact_wind_ok: "風通しは いつもどおり よかった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_dehumidify", text: "部屋の中で じょしつきを つかって かわかす" },
          { id: "a_move_sun", text: "もっと 日当たりの よい 場所に うつす" },
          { id: "a_open_window", text: "もっと 窓を あけて 風を 通す" }
        ],
        solutions: [
          { reasonFactId: "fact_humidity_high", actionId: "a_dehumidify" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？しつどが 高いのが 原因なら、しつどを 下げる ほうほうを 考えよう。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、せんたく物を かわかせたね！",
        clearTextRepeat: "げんいんを つきとめて、せんたく物を かわかせたね！"
      }
    },
    {
      // ★2026-08-08追加。小4理科「とじこめた空気や水」単元に対応。空気でっぽうの発射力は
      // つつと押し棒のすきまから空気が漏れると弱まる、という標準的な内容（複数教材で確認済み）。
      // アイコンは実在の銃器を連想させないよう🔫は使わず💨にしてある。
      id: "kuudeppou_tamadenai_01",
      title: "💨 玉が とばない 事件",
      rewardKakera: 5,
      step1: {
        icon: "💨",
        problemText: "理科の 実験で つかう 空気でっぽうの 玉が、いつもより 遠くまで とばないよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_leak", icon: "💨", text: "つつの中の 空気が もれているのかも" },
          { id: "h_ball", icon: "⚪", text: "玉の 大きさが あっていないのかも" },
          { id: "h_push", icon: "👊", text: "おしぼうを おす 力が たりないのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、空気でっぽうを しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_gap", icon: "💨", name: "つつと おしぼうの すきまを しらべる", factId: "fact_gap_found" },
          { id: "tool_ball", icon: "⚪", name: "玉の 大きさを たしかめる", factId: "fact_ball_ok" },
          { id: "tool_push", icon: "👊", name: "おす 力を たしかめる", factId: "fact_push_ok" }
        ],
        facts: {
          fact_gap_found: "しらべた けっか：つつと おしぼうの あいだに すきまが あって、空気が もれていた",
          fact_ball_ok: "たしかめた けっか：玉の 大きさは ちょうど よかった",
          fact_push_ok: "たしかめた けっか：おす 力は じゅうぶん あった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_gap_found: "つつと おしぼうの あいだに すきまが あった",
          fact_ball_ok: "玉の 大きさは ちょうど よかった",
          fact_push_ok: "おす 力は じゅうぶん あった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_fix_gap", text: "すきまが ないように、玉を しっかり つめなおす" },
          { id: "a_change_ball", text: "玉の 大きさを かえる" },
          { id: "a_push_harder", text: "もっと つよく おす" }
        ],
        solutions: [
          { reasonFactId: "fact_gap_found", actionId: "a_fix_gap" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？とじこめた 空気は、すきまが あると もれて 力が つたわらないよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、空気でっぽうを なおしたね！",
        clearTextRepeat: "げんいんを つきとめて、空気でっぽうを なおしたね！"
      }
    },
    {
      // ★2026-08-08追加。小4理科「天気と気温」単元。気温は風通しのよい日かげ（直射日光を避ける）で
      // 測るのが正しい測定方法、という標準的な内容（複数教材で確認済み）。
      id: "kion_tadashiku_hakarenai_01",
      title: "🌡️ 気温が おかしい 事件",
      rewardKakera: 5,
      step1: {
        icon: "🌡️",
        problemText: "校庭で 気温を はかったら、いつもより ずっと 高い 数字に なったよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_sun", icon: "☀️", text: "温度計に 直射日光（ちょくしゃにっこう）が 当たっているのかも" },
          { id: "h_broken", icon: "🌡️", text: "温度計が こわれているのかも" },
          { id: "h_time", icon: "🕐", text: "はかる 時間帯が おかしいのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_sun", icon: "☀️", name: "温度計の おかれている 場所を たしかめる", factId: "fact_sun_direct" },
          { id: "tool_broken", icon: "🌡️", name: "べつの 温度計でも はかってみる", factId: "fact_broken_ok" },
          { id: "tool_time", icon: "🕐", name: "はかった 時間を かくにんする", factId: "fact_time_ok" }
        ],
        facts: {
          fact_sun_direct: "たしかめた けっか：温度計に 日光が 直接 当たっていた",
          fact_broken_ok: "はかった けっか：べつの 温度計でも おなじ 数字だった（温度計は こわれていない）",
          fact_time_ok: "かくにんした けっか：いつもと おなじ 時間帯だった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_sun_direct: "温度計に 日光が 直接 当たっていた",
          fact_broken_ok: "温度計は こわれていなかった",
          fact_time_ok: "いつもと おなじ 時間帯だった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_shade", text: "日かげに うつして、正しく はかりなおす" },
          { id: "a_new_thermometer", text: "新しい 温度計に かえる" },
          { id: "a_change_time", text: "はかる 時間を かえる" }
        ],
        solutions: [
          { reasonFactId: "fact_sun_direct", actionId: "a_shade" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？気温は 風通しの よい 日かげで はかるのが 正しい はかり方だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、気温を 正しく はかれたね！",
        clearTextRepeat: "げんいんを つきとめて、気温を 正しく はかれたね！"
      }
    },

    // ★2026-08-08追加：なぞなぞ（type:"riddle"）。因果推論ミッションとは別の軽いコンテンツとして、
    // 同じ「今日のなぞとき」ローテーションに混ぜる。いずれも有名・定番のなぞなぞで、正誤があいまいに
    // ならないよう選択肢式（4択）にしてある（AGENTS.md 3.5適用）。
    {
      id: "nazonazo_furaipan_01",
      type: "riddle",
      title: "🍞 なぞなぞ：たべられない パン",
      rewardKakera: 5,
      icon: "🍞",
      riddleText: "パンは パンでも、たべられない パンは なぁんだ？",
      choices: [
        { id: "c1", text: "フライパン" },
        { id: "c2", text: "ロールパン" },
        { id: "c3", text: "しょくパン" },
        { id: "c4", text: "メロンパン" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「フライパン」！ 名前に「パン」が つくけど、たべものの パンじゃないよね。ことばの おもしろさを つかった「だじゃれなぞなぞ」だよ。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },
    {
      id: "nazonazo_sphinx_01",
      type: "riddle",
      title: "🦁 なぞなぞ：あしの かず",
      rewardKakera: 5,
      icon: "🦁",
      riddleText: "あさは 4本あしで あるき、ひるは 2本あしで あるき、よるは 3本あしで あるく いきものは なぁんだ？（大むかしの ギリシャに つたわる、ゆうめいな なぞなぞだよ）",
      choices: [
        { id: "c1", text: "人間（にんげん）" },
        { id: "c2", text: "ねこ" },
        { id: "c3", text: "ぞう" },
        { id: "c4", text: "とり" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「人間（にんげん）」！ 赤ちゃんの ときは はいはいで 4本あし（朝）、おとなに なると 2本あしで あるき（昼）、としを とると つえを ついて 3本あしに なる（夜）ことを たとえているよ。大むかしの ギリシャの「スフィンクス」が 出した なぞなぞとして 有名だよ。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },
    {
      id: "nazonazo_kame_01",
      type: "riddle",
      title: "🐢 なぞなぞ：わたしは だぁれ",
      rewardKakera: 5,
      icon: "🐢",
      riddleText: "たまごから うまれるよ。せなかに かたい こうらが あるよ。水の中でも 陸（りく）の上でも いきられるよ。わたしは だぁれ？",
      choices: [
        { id: "c1", text: "かめ" },
        { id: "c2", text: "さかな" },
        { id: "c3", text: "かえる" },
        { id: "c4", text: "とかげ" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「かめ（亀）」！ たまごから うまれて、せなかに かたい こうらが あって、水の中でも 陸の上でも いきられる いきものだよ。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },

    // ★2026-08-19追加：巡回方式への変更にあわせてプールを10→20件に倍増（AGENTS.md 3.5チェック済み）。
    {
      id: "kingyo_genki_nai_01",
      title: "🐠 金魚が 元気ない 事件",
      rewardKakera: 5,
      step1: {
        icon: "🐠",
        problemText: "水そうの 金魚が、なんだか 元気がないよ…。水面近くで じっとして あまり うごかないみたい。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_water", icon: "💧", text: "水が よごれているのかも" },
          { id: "h_food", icon: "🍚", text: "エサを あげすぎたのかも" },
          { id: "h_temp", icon: "🌡️", text: "水の おんどが 高すぎるのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、水そうを しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_water", icon: "🔍", name: "水の にごりぐあいを しらべる", factId: "fact_water_dirty" },
          { id: "tool_food", icon: "🍚", name: "エサの りょうを かくにんする", factId: "fact_food_ok" },
          { id: "tool_temp", icon: "🌡️", name: "水そうの おんどけいを みる", factId: "fact_temp_ok" }
        ],
        facts: {
          fact_water_dirty: "しらべた けっか：水が にごっていて、ろか装置（そうち）が つまっていた",
          fact_food_ok: "かくにんした けっか：エサの りょうは いつもどおりだった",
          fact_temp_ok: "みた けっか：水の おんどは ちょうど よかった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_water_dirty: "水が にごっていて、ろか装置が つまっていた",
          fact_food_ok: "エサの りょうは いつもどおりだった",
          fact_temp_ok: "水の おんどは ちょうど よかった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_clean", text: "水を きれいに かえて、ろか装置も そうじする" },
          { id: "a_less_food", text: "エサの りょうを へらす" },
          { id: "a_adjust_temp", text: "水の おんどを ちょうせいする" }
        ],
        solutions: [
          { reasonFactId: "fact_water_dirty", actionId: "a_clean" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？水が よごれているなら、水を きれいに することが 先だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、金魚を げんきに したね！",
        clearTextRepeat: "げんいんを つきとめて、金魚を げんきに したね！"
      }
    },
    {
      id: "jyuuden_dekinai_01",
      title: "🔌 じゅうでんが できない 事件",
      rewardKakera: 5,
      step1: {
        icon: "🔌",
        problemText: "タブレットを じゅうでんしていたのに、あさに なっても バッテリーが ぜんぜん ふえていないよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_cable", icon: "🔌", text: "コードが きちんと ささっていないのかも" },
          { id: "h_outlet", icon: "🏠", text: "コンセントの スイッチが 切れているのかも" },
          { id: "h_battery", icon: "🔋", text: "タブレットの バッテリーが こわれているのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_cable", icon: "🔍", name: "コードが おくまで ささっているか たしかめる", factId: "fact_cable_loose" },
          { id: "tool_outlet", icon: "🏠", name: "コンセントの スイッチを たしかめる", factId: "fact_outlet_ok" },
          { id: "tool_battery", icon: "🔋", name: "べつの コードで じゅうでんできるか ためす", factId: "fact_battery_ok" }
        ],
        facts: {
          fact_cable_loose: "たしかめた けっか：コードが とちゅうまでしか ささっておらず、ゆるんでいた",
          fact_outlet_ok: "たしかめた けっか：コンセントの スイッチは ちゃんと 入っていた",
          fact_battery_ok: "ためした けっか：べつの コードなら ふつうに じゅうでんできた（タブレット本体は こわれていない）"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_cable_loose: "コードが とちゅうまでしか ささっておらず、ゆるんでいた",
          fact_outlet_ok: "コンセントの スイッチは ちゃんと 入っていた",
          fact_battery_ok: "べつの コードなら ふつうに じゅうでんできた"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_replug", text: "コードを おくまで しっかり さしなおす" },
          { id: "a_switch_on", text: "コンセントの スイッチを 入れる" },
          { id: "a_new_tablet", text: "あたらしい タブレットに かえる" }
        ],
        solutions: [
          { reasonFactId: "fact_cable_loose", actionId: "a_replug" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？コードが ゆるんでいたなら、しっかり さしなおすことが 先だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、ちゃんと じゅうでんできるように したね！",
        clearTextRepeat: "げんいんを つきとめて、ちゃんと じゅうでんできるように したね！"
      }
    },
    {
      id: "mushimegane_ookiku_mienai_01",
      title: "🔍 虫めがねで 字が 見えない 事件",
      rewardKakera: 5,
      step1: {
        icon: "🔍",
        problemText: "虫めがねで きょうかしょの 字を 見ても、ぜんぜん 大きく 見えないよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_distance", icon: "📏", text: "虫めがねと 字の きょりが あっていないのかも" },
          { id: "h_dirty", icon: "💧", text: "レンズが よごれているのかも" },
          { id: "h_light", icon: "💡", text: "へやが くらいのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_distance", icon: "📏", name: "虫めがねと 字の きょりを 動かして たしかめる", factId: "fact_distance_wrong" },
          { id: "tool_dirty", icon: "💧", name: "レンズの よごれを たしかめる", factId: "fact_lens_clean" },
          { id: "tool_light", icon: "💡", name: "へやの 明るさを たしかめる", factId: "fact_room_bright" }
        ],
        facts: {
          fact_distance_wrong: "たしかめた けっか：虫めがねを 字に くっつけすぎていて、ピントが あっていなかった",
          fact_lens_clean: "たしかめた けっか：レンズは きれいで、よごれていなかった",
          fact_room_bright: "たしかめた けっか：へやは じゅうぶん 明るかった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_distance_wrong: "虫めがねを 字に くっつけすぎていて、ピントが あっていなかった",
          fact_lens_clean: "レンズは きれいで、よごれていなかった",
          fact_room_bright: "へやは じゅうぶん 明るかった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_adjust_distance", text: "虫めがねを 字から 少し はなして、ピントを あわせる" },
          { id: "a_clean_lens", text: "レンズを きれいに ふく" },
          { id: "a_turn_light", text: "電気を つけて 明るく する" }
        ],
        solutions: [
          { reasonFactId: "fact_distance_wrong", actionId: "a_adjust_distance" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？ピントが あっていないなら、きょりを かえることが 先だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、虫めがねで 字を 大きく 見られるように したね！",
        clearTextRepeat: "げんいんを つきとめて、虫めがねで 字を 大きく 見られるように したね！"
      }
    },
    {
      id: "ice_tokeru_01",
      title: "🍦 アイスが すぐ とけた 事件",
      rewardKakera: 5,
      step1: {
        icon: "🍦",
        problemText: "れいとうこから 出した アイスクリームが、いつもより ずっと はやく とけてしまったよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_freezer_temp", icon: "🌡️", text: "れいとうこの おんどが 高いのかも" },
          { id: "h_left_out", icon: "⏰", text: "出したまま 長い時間 おいていたのかも" },
          { id: "h_flavor", icon: "🍨", text: "アイスの 種類（しゅるい）が ちがうのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_temp", icon: "🌡️", name: "れいとうこの おんどけいを みる", factId: "fact_freezer_temp_high" },
          { id: "tool_time", icon: "⏰", name: "出してから どれくらい 時間が たったか かくにんする", factId: "fact_time_short" },
          { id: "tool_flavor", icon: "🍨", name: "いつもと おなじ 種類か たしかめる", factId: "fact_flavor_same" }
        ],
        facts: {
          fact_freezer_temp_high: "みた けっか：れいとうこの おんどが いつもより ずっと 高かった",
          fact_time_short: "かくにんした けっか：出してから まだ 少ししか たっていなかった",
          fact_flavor_same: "たしかめた けっか：いつもと おなじ 種類の アイスだった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_freezer_temp_high: "れいとうこの おんどが いつもより ずっと 高かった",
          fact_time_short: "出してから まだ 少ししか たっていなかった",
          fact_flavor_same: "いつもと おなじ 種類の アイスだった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_lower_temp", text: "れいとうこの おんどを もっと 下げる" },
          { id: "a_eat_fast", text: "とける前に すぐ 食べる" },
          { id: "a_change_flavor", text: "べつの 種類に かえる" }
        ],
        solutions: [
          { reasonFactId: "fact_freezer_temp_high", actionId: "a_lower_temp" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？おんどが 高いのが 原因なら、おんどを 下げることが 先だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、アイスを ちゃんと れいとうできるように したね！",
        clearTextRepeat: "げんいんを つきとめて、アイスを ちゃんと れいとうできるように したね！"
      }
    },
    {
      // ★4年理科「月と星」単元対応。満月は日ぼつ前後に東からのぼり夜通し見えるが、雲でかくれる／
      //   方角や時間がずれると見えない、という標準的な内容（複数教材で確認済み）。
      id: "tsuki_mienai_01",
      title: "🌕 まん月が 見えない 事件",
      rewardKakera: 5,
      step1: {
        icon: "🌕",
        problemText: "きょうは まん月のはずなのに、空を 見ても 月が ぜんぜん 見えないよ…。いったい 何が 起きているんだろう？"
      },
      step2: {
        prompt: "まず、原因は なんだと思う？よそうしてみよう（ここは 自由に選んでOK）。",
        hypotheses: [
          { id: "h_cloud", icon: "☁️", text: "雲に かくれているのかも" },
          { id: "h_direction", icon: "🧭", text: "見ている 方角が ちがうのかも" },
          { id: "h_time", icon: "🕐", text: "月が のぼる 時間に なっていないのかも" }
        ]
      },
      step3: {
        prompt: "道具を つかって、しらべてみよう。ぜんぶ タップしてね。",
        tools: [
          { id: "tool_cloud", icon: "☁️", name: "空の ようすを たしかめる", factId: "fact_sky_cloudy" },
          { id: "tool_direction", icon: "🧭", name: "ほういじしんで 見ている 方角を たしかめる", factId: "fact_direction_ok" },
          { id: "tool_time", icon: "🕐", name: "今の 時こくを たしかめる", factId: "fact_time_ok" }
        ],
        facts: {
          fact_sky_cloudy: "たしかめた けっか：空が あつい 雲で おおわれていた",
          fact_direction_ok: "たしかめた けっか：見ている 方角は まちがっていなかった",
          fact_time_ok: "たしかめた けっか：もう 月が のぼっている はずの 時こくだった"
        }
      },
      step4: {
        prompt: "集めた事実から、正しい文章を組み立てよう！",
        reasonPhrasing: {
          fact_sky_cloudy: "空が あつい 雲で おおわれていた",
          fact_direction_ok: "見ている 方角は まちがっていなかった",
          fact_time_ok: "もう 月が のぼっている はずの 時こくだった"
        },
        connectorText: "ので、",
        actions: [
          { id: "a_wait_cloud", text: "雲が なくなるまで まって、また 空を 見る" },
          { id: "a_change_direction", text: "見る 方角を かえる" },
          { id: "a_wait_more", text: "もっと おそい 時間まで まつ" }
        ],
        solutions: [
          { reasonFactId: "fact_sky_cloudy", actionId: "a_wait_cloud" }
        ],
        hints: {
          reason: "その理由、しらべた結果と ちがう気がするよ。もう一回、事実カードを見なおしてみよう！",
          action: "そのたいさく、理由と つながっていないかも？雲に かくれているなら、雲が 晴れるのを まつことが 先だよ。"
        }
      },
      step5: {
        clearText: "げんいんを つきとめて、まん月を 見られたね！",
        clearTextRepeat: "げんいんを つきとめて、まん月を 見られたね！"
      }
    },
    {
      id: "nazonazo_shashin_01",
      type: "riddle",
      title: "📷 なぞなぞ：なくならないもの",
      rewardKakera: 5,
      icon: "📷",
      riddleText: "とっても とっても なくならない ものは なぁんだ？（「とる」を べつの いみで かんがえてみよう）",
      choices: [
        { id: "c1", text: "しゃしん" },
        { id: "c2", text: "おかし" },
        { id: "c3", text: "えんぴつ" },
        { id: "c4", text: "けしゴム" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「しゃしん」！ 写真を「とる（撮る）」は、おかしなどを「とる（食べる・使う）」のとは ちがう いみだよ。写真は なんかい とっても、へらないよね。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },
    {
      id: "nazonazo_shitajiki_01",
      type: "riddle",
      title: "📋 なぞなぞ：うえにあるのに",
      rewardKakera: 5,
      icon: "📋",
      riddleText: "つくえの 上で つかうのに、名前に「下」の 字が つく ものは なぁんだ？",
      choices: [
        { id: "c1", text: "下じき" },
        { id: "c2", text: "上ばき" },
        { id: "c3", text: "じょうぎ" },
        { id: "c4", text: "ノート" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「下じき」！ つくえの 上に おいて つかう どうぐなのに、名前に「下」の字が 入っているね。おもしろい 名前の なぞなぞだよ。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },
    {
      id: "nazonazo_taiko_oto_01",
      type: "riddle",
      title: "🥁 なぞなぞ：たたくと出るもの",
      rewardKakera: 5,
      icon: "🥁",
      riddleText: "たいこを たたけば たたくほど、たくさん 出てくる ものは なぁんだ？",
      choices: [
        { id: "c1", text: "おと" },
        { id: "c2", text: "あな" },
        { id: "c3", text: "けむり" },
        { id: "c4", text: "水" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「音（おと）」！ たいこを たたくと、たたいた ぶんだけ 音が 出てくるね。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },
    {
      id: "nazonazo_zou_01",
      type: "riddle",
      title: "🐘 なぞなぞ：わたしは だぁれ",
      rewardKakera: 5,
      icon: "🐘",
      riddleText: "はなが とても 長くて、耳も 大きいよ。体も とても 大きいよ。鼻を つかって 水や 食べ物を つかむよ。わたしは だぁれ？",
      choices: [
        { id: "c1", text: "ぞう" },
        { id: "c2", text: "カバ" },
        { id: "c3", text: "サイ" },
        { id: "c4", text: "キリン" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「ぞう（象）」！ 長い 鼻と 大きな 耳が とくちょうの どうぶつだよ。鼻を 手のように つかって、水を のんだり 食べ物を つかんだり できるよ。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    },
    {
      id: "nazonazo_kirin_01",
      type: "riddle",
      title: "🦒 なぞなぞ：わたしは だぁれ",
      rewardKakera: 5,
      icon: "🦒",
      riddleText: "くびが とても 長いよ。高い 木の 上の 方の 葉っぱを たべるよ。体には あみの目みたいな もようが あるよ。わたしは だぁれ？",
      choices: [
        { id: "c1", text: "きりん" },
        { id: "c2", text: "しまうま" },
        { id: "c3", text: "らくだ" },
        { id: "c4", text: "ぞう" }
      ],
      correctChoiceId: "c1",
      explanation: "こたえは「きりん」！ 長い くびで 高い 木の 上の 方の 葉っぱを たべられるよ。あみの目の ような もようが とくちょうだよ。",
      step5: {
        clearText: "なぞなぞ かいけつ！ たのしかったね！",
        clearTextRepeat: "なぞなぞ かいけつ！"
      }
    }
  ];

  var STEP_COUNT = 5;
  var state = null;
  var currentMission = null;

  function isMissionCleared(missionId) {
    return !!(window.saveData && window.saveData.bossQuestCleared && window.saveData.bossQuestCleared[missionId]);
  }

  function todayStr_() {
    var now = window.currentServerTime ? new Date(window.currentServerTime) : new Date();
    return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  }

  // ★2026-08-19追加：book.jsのgetTodaysStoryと同じ「日付を通し日数に変換してmod」方式。
  function dayIndexFromDateStr_(str) {
    var parts = String(str).split("-").map(Number);
    var y = parts[0], m = parts[1], d = parts[2];
    if (!y || !m || !d) return 0;
    return Math.floor(new Date(y, m - 1, d).getTime() / 86400000);
  }

  // ★2026-08-19変更：「今日のなぞとき」＝日付を件数で割った余りで決まる巡回方式（おはなしと同じ）。
  // 解放数を貯める仕組みは廃止。ミッションを追加するほど、同じ問題に戻ってくるまでの周期が延びる。
  function todaysMission_() {
    var idx = ((dayIndexFromDateStr_(todayStr_()) % MISSION_LIST.length) + MISSION_LIST.length) % MISSION_LIST.length;
    return MISSION_LIST[idx];
  }

  function pickMission() {
    return todaysMission_();
  }

  // メインメニューのバナー（book-bannerのすぐ下）を更新する。index.htmlのrefreshBookBanner()と
  // 同じタイミング（ログイン成功後・データ更新後）で呼ばれる想定。
  window.refreshDailyMissionBanner = function () {
    var banner = document.getElementById("dailymission-banner");
    var sub = document.getElementById("dailymission-banner-sub");
    var badge = document.getElementById("dailymission-banner-badge");
    if (!banner || !window.saveData) return;

    var today = todaysMission_();
    var todayCleared = isMissionCleared(today.id);
    var allDone = MISSION_LIST.every(function (m) { return isMissionCleared(m.id); });

    if (!todayCleared) {
      banner.classList.remove("done-today");
      if (sub) sub.textContent = today.title;
      if (badge) badge.textContent = "🆕 なぞ発生中";
    } else if (allDone) {
      banner.classList.add("done-today");
      if (sub) sub.textContent = "ぜんぶ かいけつずみ！すごい！";
      if (badge) badge.textContent = "🏆 コンプリート";
    } else {
      banner.classList.add("done-today");
      if (sub) sub.textContent = "きょうの ぶんは かいけつずみ。またあした！";
      if (badge) badge.textContent = "✅ かいけつずみ";
    }
  };

  function freshState() {
    return {
      step: 1,
      hypothesisId: null,
      collectedFacts: [],
      selection: { reasonFactId: null, actionId: null }
    };
  }

  window.launchBossQuest = function () {
    currentMission = pickMission();
    state = freshState();
    document.getElementById("boss-quest-modal").classList.add("open");
    render();
  };

  window.closeBossQuest = function () {
    document.getElementById("boss-quest-modal").classList.remove("open");
    window.refreshDailyMissionBanner();
  };

  function renderProgress() {
    var progressEl = document.getElementById("bq-progress");
    progressEl.innerHTML = "";
    // ★2026-08-08追加：なぞなぞ（type:"riddle"）は「問題→こたえ」の2ステップだけなので、
    //   因果推論ミッション（5ステップ）とドット数を出し分ける。
    var totalSteps = currentMission && currentMission.type === "riddle" ? 2 : STEP_COUNT;
    for (var i = 1; i <= totalSteps; i++) {
      var dot = document.createElement("div");
      dot.className = "bq-dot" + (i === state.step ? " active" : i < state.step ? " done" : "");
      progressEl.appendChild(dot);
    }
  }

  function goToStep(n) {
    state.step = n;
    render();
  }

  function render() {
    renderProgress();
    if (currentMission.type === "riddle") {
      // ★なぞなぞは「問題(1)→こたえ合わせ画面(2、renderStep5を再利用)」のみ
      if (state.step === 1) renderRiddleQuestion();
      else renderStep5();
      return;
    }
    if (state.step === 1) renderStep1();
    else if (state.step === 2) renderStep2();
    else if (state.step === 3) renderStep3();
    else if (state.step === 4) renderStep4();
    else if (state.step === 5) renderStep5();
  }

  // ★2026-08-08追加：なぞなぞ（type:"riddle"）の出題画面。因果推論ミッションと違い、
  //   1問だけ選択肢から選んで正解すればクリア（ヒントバナーで再挑戦は可能）。
  function renderRiddleQuestion() {
    var m = currentMission;
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div style="text-align:center;">' +
        '<div style="font-size:64px;">' + m.icon + '</div>' +
        '<div class="navi-box" style="text-align:left;">' +
          '<div class="navi-avatar">🦄</div>' +
          '<div class="navi-text">ニコ「' + m.riddleText + '」</div>' +
        '</div>' +
      '</div>' +
      '<div class="bq-choice-grid" id="bq-riddle-choices"></div>' +
      '<div class="bq-hint-banner" id="bq-hint-banner"></div>' +
      '<button class="bq-sub-btn" id="bq-btn-close1">とじる</button>';
    var list = document.getElementById("bq-riddle-choices");
    m.choices.forEach(function (c) {
      var el = document.createElement("div");
      el.className = "bq-choice-card";
      el.innerHTML = '<span>' + c.text + '</span>';
      el.onclick = function () { judgeRiddle(c, el); };
      list.appendChild(el);
    });
    document.getElementById("bq-btn-close1").onclick = window.closeBossQuest;
  }

  function judgeRiddle(choice, chipEl) {
    var m = currentMission;
    var banner = document.getElementById("bq-hint-banner");
    if (choice.id === m.correctChoiceId) {
      if (window.speakText) window.speakText("せいかい！", "ja-JP");
      goToStep(2);
      return;
    }
    chipEl.classList.add("wrong");
    setTimeout(function () { chipEl.classList.remove("wrong"); }, 600);
    banner.textContent = "🤔 ちがうみたい。もう一回 考えてみよう！";
    banner.classList.add("show");
  }

  function renderStep1() {
    var d = currentMission.step1;
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div style="text-align:center;">' +
        '<div style="font-size:64px;">' + d.icon + '</div>' +
        '<div class="navi-box" style="text-align:left;">' +
          '<div class="navi-avatar">🦄</div>' +
          '<div class="navi-text">ニコ「' + d.problemText + '」</div>' +
        '</div>' +
      '</div>' +
      '<button class="bq-main-btn" id="bq-btn-start">さぐってみる！</button>' +
      '<button class="bq-sub-btn" id="bq-btn-close1">とじる</button>';
    document.getElementById("bq-btn-start").onclick = function () { goToStep(2); };
    document.getElementById("bq-btn-close1").onclick = window.closeBossQuest;
  }

  function renderStep2() {
    var d = currentMission.step2;
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-nico-bubble">' + d.prompt + '</div>' +
      '<div class="bq-choice-grid" id="bq-hyp-list"></div>' +
      '<button class="bq-main-btn" id="bq-btn-next" disabled>しらべに行く</button>' +
      '<button class="bq-sub-btn" id="bq-btn-back">← もどる</button>';
    var list = document.getElementById("bq-hyp-list");
    d.hypotheses.forEach(function (h) {
      var el = document.createElement("div");
      el.className = "bq-choice-card" + (state.hypothesisId === h.id ? " selected" : "");
      el.innerHTML = '<span class="bq-icon">' + h.icon + '</span><span>' + h.text + '</span>';
      el.onclick = function () { state.hypothesisId = h.id; renderStep2(); };
      list.appendChild(el);
    });
    document.getElementById("bq-btn-next").disabled = !state.hypothesisId;
    document.getElementById("bq-btn-next").onclick = function () { goToStep(3); };
    document.getElementById("bq-btn-back").onclick = function () { goToStep(1); };
  }

  function renderStep3() {
    var d = currentMission.step3;
    var allCollected = d.tools.every(function (t) { return state.collectedFacts.indexOf(t.factId) !== -1; });
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-nico-bubble">' + d.prompt + '</div>' +
      '<div class="bq-choice-grid" id="bq-tool-list"></div>' +
      '<ul class="bq-fact-list" id="bq-fact-list"></ul>' +
      '<button class="bq-main-btn" id="bq-btn-next" disabled></button>' +
      '<button class="bq-sub-btn" id="bq-btn-back">← もどる</button>';
    var toolList = document.getElementById("bq-tool-list");
    d.tools.forEach(function (t) {
      var collected = state.collectedFacts.indexOf(t.factId) !== -1;
      var el = document.createElement("div");
      el.className = "bq-choice-card" + (collected ? " collected" : "");
      el.innerHTML = '<span class="bq-icon">' + t.icon + '</span><span>' + t.name + '</span>' + (collected ? " ✅" : "");
      el.onclick = function () {
        if (state.collectedFacts.indexOf(t.factId) === -1) state.collectedFacts.push(t.factId);
        renderStep3();
      };
      toolList.appendChild(el);
    });
    var factList = document.getElementById("bq-fact-list");
    state.collectedFacts.forEach(function (factId) {
      var li = document.createElement("li");
      li.textContent = "📋 " + d.facts[factId];
      factList.appendChild(li);
    });
    var btn = document.getElementById("bq-btn-next");
    btn.disabled = !allCollected;
    btn.textContent = allCollected ? "けつろんを かんがえる" : ("あと " + (d.tools.length - state.collectedFacts.length) + " つ しらべよう");
    btn.onclick = function () { goToStep(4); };
    document.getElementById("bq-btn-back").onclick = function () { goToStep(2); };
  }

  function renderStep4() {
    var d = currentMission.step4;
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-nico-bubble">' + d.prompt + '</div>' +
      '<div class="bq-block-group">' +
        '<div class="bq-block-label">①【理由】あつめた事実から えらぶ</div>' +
        '<div class="bq-chip-row" id="bq-reason-row"></div>' +
      '</div>' +
      '<div class="bq-block-group">' +
        '<div class="bq-block-label">②【たいさく】</div>' +
        '<div class="bq-chip-row" id="bq-action-row"></div>' +
      '</div>' +
      '<div class="bq-block-label">できあがった文章</div>' +
      '<div class="bq-sentence-preview" id="bq-sentence-preview"></div>' +
      '<div class="bq-hint-banner" id="bq-hint-banner"></div>' +
      '<button class="bq-main-btn" id="bq-btn-judge" disabled>この文章で けってい！</button>' +
      '<button class="bq-sub-btn" id="bq-btn-back">← もどる</button>';

    var reasonRow = document.getElementById("bq-reason-row");
    state.collectedFacts.forEach(function (factId) {
      var chip = document.createElement("div");
      chip.className = "bq-chip" + (state.selection.reasonFactId === factId ? " selected" : "");
      chip.textContent = d.reasonPhrasing[factId];
      chip.onclick = function () { state.selection.reasonFactId = factId; renderStep4(); };
      reasonRow.appendChild(chip);
    });

    var actionRow = document.getElementById("bq-action-row");
    d.actions.forEach(function (a) {
      var chip = document.createElement("div");
      chip.className = "bq-chip" + (state.selection.actionId === a.id ? " selected" : "");
      chip.textContent = a.text;
      chip.onclick = function () { state.selection.actionId = a.id; renderStep4(); };
      actionRow.appendChild(chip);
    });

    var preview = document.getElementById("bq-sentence-preview");
    var reasonText = state.selection.reasonFactId ? d.reasonPhrasing[state.selection.reasonFactId] : null;
    var actionObj = d.actions.filter(function (a) { return a.id === state.selection.actionId; })[0];
    var actionText = actionObj ? actionObj.text : null;
    preview.innerHTML =
      (reasonText || '<span class="bq-blank">（①をえらぶ）</span>') +
      d.connectorText + " " +
      (actionText || '<span class="bq-blank">（②をえらぶ）</span>');

    document.getElementById("bq-btn-judge").disabled = !(reasonText && actionText);
    document.getElementById("bq-btn-judge").onclick = judgeStep4;
    document.getElementById("bq-btn-back").onclick = function () { goToStep(3); };
  }

  function judgeStep4() {
    var d = currentMission.step4;
    var sel = state.selection;
    var correct = d.solutions.some(function (sol) {
      return sol.reasonFactId === sel.reasonFactId && sol.actionId === sel.actionId;
    });
    var banner = document.getElementById("bq-hint-banner");

    if (correct) {
      if (window.speakText) window.speakText("げんいん はっけん！", "ja-JP");
      goToStep(5);
      return;
    }

    // ★1回のヒントは「最初に間違っている1パーツ」だけを指摘する（同時に2つ指摘すると情報過多になるため）
    var bestGuess = d.solutions[0];
    var hintKey = null;
    if (sel.reasonFactId !== bestGuess.reasonFactId) hintKey = "reason";
    else if (sel.actionId !== bestGuess.actionId) hintKey = "action";

    banner.textContent = "🤔 " + d.hints[hintKey];
    banner.classList.add("show");
  }

  function renderStep5() {
    var d = currentMission.step5;
    var firstClear = !isMissionCleared(currentMission.id);

    if (firstClear && window.saveData) {
      if (!window.saveData.bossQuestCleared) window.saveData.bossQuestCleared = {};
      window.saveData.bossQuestCleared[currentMission.id] = true;
      window.saveData.kakera = (window.saveData.kakera || 0) + currentMission.rewardKakera;
      if (window.saveGame) window.saveGame();
      if (window.updateUI) window.updateUI();
    }

    // ★2026-08-19変更：巡回方式では「今日のなぞとき」は常に1件だけなので、「つぎのミッションへ」は廃止。
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-clear-screen">' +
        '<div class="bq-big-icon">🎉</div>' +
        '<div class="navi-box" style="text-align:left;">' +
          '<div class="navi-avatar">🦄</div>' +
          '<div class="navi-text">ニコ「' + (firstClear ? d.clearText : d.clearTextRepeat) + '」</div>' +
        '</div>' +
        (currentMission.explanation ? '<div class="bq-nico-bubble">' + currentMission.explanation + '</div>' : '') +
        (firstClear ? '<div class="bq-token-count">🧩 +' + currentMission.rewardKakera + '</div>' : '') +
        '<button class="bq-main-btn" id="bq-btn-close2">とじる</button>' +
        '<button class="bq-sub-btn" id="bq-btn-restart">もう一度あそぶ</button>' +
      '</div>';
    document.getElementById("bq-btn-close2").onclick = window.closeBossQuest;
    document.getElementById("bq-btn-restart").onclick = function () {
      state = freshState();
      render();
    };
  }

})();
