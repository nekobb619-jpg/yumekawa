/* =====================================================================
   content.js  ―  「1ファイル方式」コンテンツ・バンドル ＆ 自動パッチ
   ---------------------------------------------------------------------
   ■これは何？
     ・全ステージの「一覧」と「問題データ」を、この1ファイルにまとめたもの。
     ・index.html の末尾に <script src="./content.js"></script> を1行足すだけで、
       ・ステージがメニューに自動で出る（スプレッドシートに行を足さなくてOK）
       ・問題を別々の .js ファイルで置かなくてOK（このファイルにまとまる）
     ・GAS（プレイヤーデータ・指令・ロバックス）は今まで通り。さわりません。
     ・content.js が無い/読めない時は、今まで通りの動き（./id.js 読み込み）に自動で戻ります。
   ■ステージを増やすには？
     ・下の CONTENT.stages に1行、CONTENT.quizzes に問題配列を1つ足すだけ。
     ・（このチャットで私が丸ごと最新版を作り直してお渡しします）
   ■期間限定で出したいときは？
     ・ステージの行に release_from（この日から）／release_until（この日まで）を
       "YYYY-MM-DD" の形で足すだけ。両方省略すれば今まで通りずっと表示。
     ・例："release_from: \"2026-08-01\", release_until: \"2026-08-31\""
       → 8月中だけ メニューに出て、9月になると自動で消える。
     ・「この動画URLをこの問題に貼って」「この期間だけ出して」とチャットで言ってもらえれば、
       このファイルを書きかえてお渡しします（スプレッドシート編集は不要）。
   ===================================================================== */
(function () {

  /* ================= ① ステージ一覧（メニューに出る） ================= */
  /* スプレッドシートの列と同じ意味： subject / category / id / name / reward */
  /* showCount = 1回の挑戦で出す問題数（全問数より小さくすると毎回ちがう出題に） */
  /* release_from / release_until（任意）："YYYY-MM-DD"。この期間だけメニューに表示。 */
  const STAGES = [
    {
      subject: "算数",                      // ★あなたのスプレッドシートと同じ日本語にすると同じタブに合流します
      category: "わり算（4年）",             // 算数タブの中の見出し（グループ）
      grade: "4年生",                       // ★学年タブ切り替え用
      id: "算数/わり算/hissan_amari01",       // ステージID（あなたの命名ルールに合わせた形）
      name: "わり算の筆算（あまり）",
      reward: 10,
      showCount: 10,                        // 1回に出す問題数（全10問中10問。5にすれば毎回ちがう5問）
      video_url: "",
      lab_url: "",
      created: "2026-07-17"                 // ★いつ追加したか（"🆕NEW"バッジの判定に使う）
    },
    {
      subject: "算数",
      category: "わり算（4年）",
      grade: "4年生",
      id: "算数/わり算/hissan_amari02",
      name: "わり算の筆算（2けたで わる）",
      reward: 10,
      showCount: 10,
      video_url: "",
      lab_url: "",
      created: "2026-07-19"
    },
    {
      subject: "算数",
      category: "角度（4年）",
      grade: "4年生",
      id: "算数/角度/kakudo01",
      name: "角の大きさ（角度のきほん）",
      reward: 10,
      showCount: 10,
      video_url: "",
      // ★AR角度レーダー（別タブで全画面・カメラ＆向きセンサー使用）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_ar_kakudo.html",
      created: "2026-07-18"
    },
    {
      subject: "国語",
      category: "読解（4年）",
      grade: "4年生",
      id: "国語/読解/kosoado01",
      name: "こそあど言葉（指示語）",
      reward: 10, showCount: 10, video_url: "",
      // ★3Dたんけんラボ（別タブ・ドラッグで見まわし／台座を選んでたからさがし）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/国語/lab_kosoado.html",
      created: "2026-07-18"
    },
    {
      subject: "理科",
      category: "電気のはたらき（4年）",
      grade: "4年生",
      id: "理科/電気/denki01",
      name: "電気のはたらき（かん電池と回路）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "社会",
      category: "地図（4年）",
      grade: "4年生",
      id: "社会/地図/nairiku01",
      name: "海に面していない県（内陸県）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "大きな数（4年）",
      grade: "4年生",
      id: "算数/大きな数/ookazu01",
      name: "大きな数（万・億）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "国語",
      category: "漢字（4年）",
      id: "国語/漢字/kanji01",
      name: "漢字と部首",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "国語",
      category: "漢字（4年）",
      id: "国語/漢字/jukugo01",
      name: "漢字の組み立て（熟語）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-19"
    },
    {
      subject: "国語",
      category: "言葉の表現（4年）",
      id: "国語/慣用句/kanyoku01",
      name: "慣用句・ことわざ（言葉の味わい）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      subject: "国語",
      category: "文のしくみ（4年）",
      id: "国語/修飾語/shushoku01",
      name: "主語・述語・修飾語（文の組み立て）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_1",
      name: "面積の変身 ① 初級",
      reward: 10, showCount: 10, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=1",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_2",
      name: "面積の変身 ② 中級",
      reward: 10, showCount: 10, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=2",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_3",
      name: "面積の変身 ③ 上級",
      reward: 10, showCount: 10, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=3",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（垂直・平行と四角形）4年",
      id: "算数/図形/suichoku_heikou01",
      name: "垂直と平行（すいちょくとへいこう）",
      reward: 10, showCount: 5, video_url: "",
      // ★すいちょく・へいこう はっけんラボ（線をかたむけて発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_shikakukei.html?level=1",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（垂直・平行と四角形）4年",
      id: "算数/図形/shikakukei_bunrui01",
      name: "四角形の仲間分け（台形・平行四辺形・ひし形）",
      reward: 10, showCount: 5, video_url: "",
      // ★四角形へんしんラボ（頂点をうごかして仲間分けを発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_shikakukei.html?level=2",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（垂直・平行と四角形）4年",
      id: "算数/図形/taikakusen01",
      name: "四角形の対角線（長さ・二等分・垂直）",
      reward: 10, showCount: 5, video_url: "",
      // ★対角線はっけんラボ（頂点をうごかして対角線の性質を発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_shikakukei.html?level=3",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（三角形の仲間分け）4年",
      id: "算数/図形/sankaku_bunrui01",
      name: "三角形の仲間分け（正三角形・二等辺三角形・直角三角形）",
      reward: 10, showCount: 5, video_url: "",
      // ★三角形の仲間分けラボ（頂点をうごかして仲間分けを発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_sankaku.html?level=1",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（三角形の仲間分け）4年",
      id: "算数/図形/naikaku_wa01",
      name: "三角形の内角の和",
      reward: 10, showCount: 5, video_url: "",
      // ★内角の和はっけんラボ（形をかえても180度のまま）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_sankaku.html?level=2",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（三角形の仲間分け）4年",
      id: "算数/図形/nakama_sagashi01",
      name: "三角形と四角形の仲間さがし（まとめ）",
      reward: 15, showCount: 4, video_url: "",
      // ★仲間さがしミニゲーム（ドラッグでグループ分け＋ニコと会話）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_nakama_sagashi.html",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "小数（4年）",
      id: "算数/小数/shosu01",
      name: "小数のしくみと計算",
      reward: 10, showCount: 5, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "理科",
      category: "星と月（4年）",
      id: "理科/星/hoshi01",
      name: "夏の星空と月の動き",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "理科",
      category: "季節と生き物（4年）",
      id: "理科/季節と生き物/kisetsu01",
      name: "季節と生き物のようす",
      reward: 10, showCount: 11, video_url: "", lab_url: "",
      created: "2026-07-20"
    },
    {
      subject: "理科",
      category: "空気と水の性質（4年）",
      id: "理科/空気と水/kuki_mizu01",
      name: "空気と水の力（とじこめた空気と水）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      subject: "理科",
      category: "もののあたたまり方（4年）",
      id: "理科/あたたまり方/atatamari01",
      name: "もののあたたまり方（金属・水・空気）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      subject: "社会",
      category: "ごみとくらし（4年）",
      id: "社会/ごみ/gomi01",
      name: "ごみのゆくえ（分別とリサイクル）",
      reward: 10, showCount: 5, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "社会",
      category: "都道府県（4年）",
      id: "社会/都道府県/todofuken01",
      name: "都道府県と地方区分",
      reward: 10, showCount: 11, video_url: "", lab_url: "",
      created: "2026-07-20"
    },
    {
      subject: "社会",
      category: "都道府県（4年）",
      id: "社会/都道府県/todofuken02",
      name: "都道府県の位置・地形・産業の特色",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      // ★漢字検定10級 対策（8/20の試験にむけて）。80字を8回に分けて出題。読み・書取・画数の3本立て。
      subject: "漢検",
      category: "10級 だい1回（一〜貝）",
      id: "漢検/10級/dai1kai",
      name: "10級 だい1回：一・右・雨・円・王・音・下・火・花・貝",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-19"
    },
    {
      // ★漢字検定10級 対策 だい2回。書き順の「てん・線はさいごに書く」系のひっかけを重点的に扱う
      // （九＝1画目と2画目の順、玉・犬＝てんは最後、金＝たて線の位置。いずれも複数サイトで確認ずみ）。
      subject: "漢検",
      category: "10級 だい2回（学〜見）",
      id: "漢検/10級/dai2kai",
      name: "10級 だい2回：学・気・九・休・玉・金・空・月・犬・見",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-24"
    },
    {
      // ★分岐図解トレーニング（考えを図にする汎用ツール）。もし〜なら図（if_then）とマインドマップの2テンプレート。
      subject: "探究",
      category: "図解トレーニング",
      id: "探究/分岐図解/bunki01",
      name: "分岐図解トレーニング①（もしなら図・マインドマップ）",
      reward: 10, showCount: 4, video_url: "", lab_url: "",
      created: "2026-07-19"
    },
    {
      subject: "算数",
      category: "折れ線グラフ（4年）",
      id: "算数/グラフ/oresen01",
      name: "折れ線グラフと変化（変わり方）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "漢字の特長（4年）",
      id: "国語/漢字/onyomi_kunyomi01",
      name: "漢字の音と訓（音読み・訓読み）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "理科",
      category: "水のゆくえ（4年）",
      id: "理科/雨水/amamizu01",
      name: "雨水のゆくえと地面（水たまりと土の粒）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "社会",
      category: "くらしと水（4年）",
      id: "社会/水道/josuijo01",
      name: "水はどこから（浄水場と安全な水）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "算数",
      category: "わり算のきほん（3年）",
      grade: "3年生",
      id: "算数/わり算/warizan301",
      name: "あまりのあるわり算（3年のきほん）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "言葉のきまり（3年）",
      grade: "3年生",
      id: "国語/ローマ字/romaji301",
      name: "ローマ字とキーボード（3年の言葉）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "理科",
      category: "磁石の性質（3年）",
      grade: "3年生",
      id: "理科/磁石/jishaku301",
      name: "じしゃくのふしぎ（N極・S極とひきつけるもの）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "社会",
      category: "地域のようす（3年）",
      grade: "3年生",
      id: "社会/まち探検/machi301",
      name: "わたしたちのまちと記号（地図記号と方角）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "文のしくみ（4年）",
      grade: "4年生",
      id: "国語/言葉/setsuzoku01",
      name: "接続する言葉（だから・しかし・なぜなら）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-28"
    }
  ];

  /* ================= ② 問題データ（ステージIDごと） ================= */
  const QUIZZES = {

    "算数/わり算/hissan_amari01": [
      { q:"ウォーミングアップ！ わり算の筆算では 九九が だいかつやく。\n6 × 8 は いくつ？",
        a:["48","42","54","36"], c:0,
        hint:"6のだんを 思い出そう。6, 12, 18 … と ふえていくよ。",
        speech_text:"ろく かける はち は？",
        job_title:"九九チェック クリア！",
        job_desc:"せいかい！ 6×8=48 だね。\n筆算で『たてる』とき、この九九が すぐ 出てくると とても はやいよ。" },

      { q:"87 ÷ 6 を 筆算で といたよ。\n『商（しょう）』は いくつに なる？",
        a:["14","13","15","12"], c:0,
        hint:"6 × 14 = 84。のこりが 3。あまりは わる数6より 小さいね。",
        job_title:"筆算マスターへ 一歩！",
        job_desc:"87÷6 は 商14・あまり3。\n6×14=84、87-84=3。あまり3は わる数6より 小さいので これで OK！" },

      { q:"シールが 76まい あります。\n5人で 同じ数ずつ 分けると、あまりは 何まい？",
        type:"text_input", correct_answers:["1","1まい"],
        hint:"5 × いくつ で 76に いちばん近い？ そののこりが あまりだよ。",
        rescue_hint:"5×15=75。76から75をひくと…？ のこりが あまりだよ！",
        speech_text:"あまりは なんまい かな？",
        job_title:"あまり ハンター！",
        job_desc:"76÷5＝15 あまり1。\n1人15まいずつ 分けて、1まい あまるね。あまりは わる数5より 小さいか かならず たしかめよう。" },

      { q:"ある子が『43 ÷ 5 ＝ 7 あまり 8』と こたえたよ。\nでも これは まちがい。どうして？",
        a:["あまり8は わる数5より 大きいから（まだ 分けられる）","商が 大きすぎるから","たし算を わすれたから","九九が まちがっているから"], c:0,
        hint:"だいじな きまり：『あまりは わる数より 小さい』。",
        job_title:"あまりの きまり 発見！",
        job_desc:"あまりは わる数より かならず 小さい。あまり8は5より 大きいので、まだ 分けられるね。\n正しくは 43÷5＝8 あまり3 だよ。" },

      { q:"下の 図を 見てね。〇を 4つずつ の グループに 分けると、\nグループは いくつ できて、いくつ あまる？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);var n=14;for(var i=0;i<n;i++){var x=30+(i%7)*62;var y=(i<7)?45:90;ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fillStyle=(Math.floor(i/4)%2===0)?'#b19cd9':'#ffd1dc';ctx.fill();ctx.strokeStyle='#4a3b52';ctx.lineWidth=2;ctx.stroke();}",
        a:["3グループ できて 2こ あまる","4グループ できて 0こ あまる","2グループ できて 6こ あまる","3グループ できて 4こ あまる"], c:0,
        hint:"〇は ぜんぶで 14こ。14 ÷ 4 を 考えよう。",
        job_title:"図で わかった！",
        job_desc:"14こを 4つずつ 分けると 3グループ できて 2こ あまる。\n14÷4＝3 あまり2 だね。図で 見ると あまりが わかりやすい！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"ねえねえ社長！ この もんだいを 見て！<br>『あめが 50こ。7人で 同じ数ずつ 分けると、1人 何こで 何こ あまる？』" },
          { name:"ニコ", icon:"🦄", msg:"この もんだいって、ほんとうは <b>なにが できるか</b> を たしかめたいのかな？ あててみて！" }
        ],
        a:["わり算の あまりの いみ（分けたのこり）が わかるか","大きな数が 読めるか","たし算が はやく できるか","九九を ぜんぶ 言えるか"], c:0,
        hint:"『分けて、のこりは いくつ？』を きいているね。",
        speech_text:"この もんだいの ねらいは なにかな？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"この もんだいの ねらいは『あまりの いみが わかるか』。\n50÷7＝7 あまり1。1人7こで 1こ あまるね。\nねらいが 見ぬけると、テストでも『ここを きいてるな』と わかるよ！" },

      { q:"【ニコに 教えてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"94 ÷ 6 の 筆算、ぼく やってみたよ！<br>『商は 16 で あまりは …あれ？ 6×16=96 で 94より 大きい！？』" },
          { name:"ニコ", icon:"🦄", msg:"うーん、どこで まちがえたのかな？ 社長、教えて！" }
        ],
        a:["商が 大きすぎた。6×15=90 だから 商は 15、あまりは 4","たし算を すればいい","94を 大きくすればいい","あまりを 6に すればいい"], c:0,
        hint:"6のだんで 94を こえない いちばん大きい ところは？ 6×15=90 だね。",
        job_title:"先生に なれた！",
        job_desc:"6×16=96 は 94を こえちゃう。だから 商は 15。\n94−90＝4 で あまり4。94÷6＝15 あまり4 が せいかい！\nニコに 教えられた社長は もう バッチリ わかってるね。" },

      { q:"クッキーが 65こ あります。\n1ふくろに 4こずつ 入れると、ふくろは 何ふくろ できる？\n（あまった クッキーは 入れない）",
        type:"text_input", correct_answers:["16","16ふくろ"],
        hint:"65 ÷ 4 の 商が 『できるふくろの数』だよ。あまりは 入れないよ。",
        rescue_hint:"4×16=64。65−64=1 で あまり1。ふくろの数は 商の 16だよ！",
        job_title:"文章題も クリア！",
        job_desc:"65÷4＝16 あまり1。\n4こずつ 16ふくろ できて、1こ あまる。\n『何ふくろ できる？』は 商を こたえる もんだいだね。" },

      { q:"38 ÷ 5 の 商は いくつ？",
        type:"text_input", correct_answers:["7"],
        hint:"5 × 7 = 35。5 × 8 = 40 は 38を こえちゃうね。",
        job_title:"商 ピッタリ！",
        job_desc:"38÷5＝7 あまり3。5×7=35、38−35=3。\n商は 38を こえない いちばん大きい かけ算の 数だよ。" },

      { q:"わり算の 筆算で、さいごに かならず たしかめる ことは？",
        a:["あまりが わる数より 小さいか","商が ぐうすうか","答えが 100を こえるか","九九を ぜんぶ 言えたか"], c:0,
        hint:"この単元の いちばん だいじな きまりだよ。",
        speech_text:"さいごに たしかめる ことは？",
        job_title:"🏆 わり算の筆算 マスター！",
        job_desc:"さいごの チェックは『あまり ＜ わる数』。\nこれが できていれば 筆算は バッチリ。おめでとう、わり算マスター！" },

      { q:"9 × 7 は いくつ？",
        a:["63","56","72","49"], c:0,
        hint:"9のだんを 思い出そう。9, 18, 27…",
        job_title:"九九チェック その2！",
        job_desc:"9×7＝63。筆算では この九九が すぐ 出てくると、とても はやく 計算できるよ。" },

      { q:"58 ÷ 7 を 筆算で といたよ。商は いくつ？",
        a:["8","7","9","6"], c:0,
        hint:"7×8＝56。58−56＝2で、あまりも わる数より 小さいね。",
        job_title:"筆算マスターへ さらに一歩！",
        job_desc:"58÷7は 商8・あまり2。7×8＝56、58−56＝2。あまりが わる数7より 小さいから これでOK！" },

      { q:"おりがみが 83まい あります。6人で 同じ数ずつ 分けると、あまりは 何まい？",
        type:"text_input", correct_answers:["5","5まい"],
        hint:"6 × いくつ で 83に いちばん 近い？",
        rescue_hint:"6×13＝78。83−78＝5。",
        job_title:"あまり ハンター その2！",
        job_desc:"83÷6＝13 あまり5。1人13まいずつ分けて、5まい あまるね。" },

      { q:"ある子が『61 ÷ 8 ＝ 6 あまり 13』と こたえたよ。これは まちがい。どうして？",
        a:["あまり13が わる数8より 大きいから","商が小さすぎるから","たし算を わすれたから","九九が まちがっているから"], c:0,
        hint:"だいじな きまり：『あまりは わる数より 小さい』。",
        job_title:"あまりの きまり ふたたび！",
        job_desc:"あまりは わる数より かならず 小さい。あまり13は8より 大きいので、まだ 分けられるね。正しくは 61÷8＝7 あまり5 だよ。" },

      { q:"72 ÷ 9 の 商と あまりは？",
        a:["商8・あまり0（ぴったり わりきれる）","商7・あまり9","商9・あまり0","商8・あまり9"], c:0,
        hint:"9×8＝72。ぴったり わりきれるね！",
        job_title:"わりきれる わり算！",
        job_desc:"9×8＝72で あまりが 0。あまりが 0の ときは『わりきれる』と いうよ。あまりが 出ない わり算も あるんだね。" },

      { q:"【まちがい発見！】\n『わる数より あまりが 大きくなっちゃった…』こんな とき、どう 直せば いい？",
        a:["商を 1つ 大きくして、もう一度 計算しなおす","そのままで OK","わる数を 大きくする","あまりを 無視する"], c:0,
        hint:"あまりが わる数より 大きいと いうことは、まだ 分けられる ということ。",
        job_title:"まちがい 直せた！",
        job_desc:"あまりが わる数より 大きく なってしまったら、商を 1つ ふやして 計算しなおそう。あまりが わる数より 小さく なるまで、これが 正しい 筆算の チェック方法だよ。" }
    ],

    "算数/わり算/hissan_amari02": [
      { q:"ウォーミングアップ！ 2けたの 数で わる 筆算では、さいしょに『見当（けんとう）』を つけるよ。\n63 ÷ 21 を とくとき、21を なんじゅう（何十）と みて 見当を つける？",
        a:["20","30","10","40"], c:0,
        hint:"21は 20に ちかいね。がい数（何十）で考えると 見当が つけやすいよ。",
        speech_text:"21を なんじゅうと みる？",
        job_title:"見当（けんとう）チェック クリア！",
        job_desc:"21は だいたい20と みるよ。63÷20で ざっくり 見当を つけると、商は だいたい3くらいだと わかるね。" },

      { q:"84 ÷ 21 を 筆算で といたよ。\n商（しょう）は いくつに なる？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('21',136,84);ctx.textAlign='center';ctx.fillText('8',180,84);ctx.fillText('4',212,84);",
        a:["4","3","5","6"], c:0,
        hint:"21 × 4 を 計算してみよう。ぴったり 84に なるかな？",
        job_title:"2けたわり算 マスターへ 一歩！",
        job_desc:"84÷21＝4。21×4=84で ぴったり わりきれるね。筆算では、わる数が2けたに なっても やりかたは 同じだよ。" },

      { q:"96 ÷ 23 を 筆算で といたよ。\n『商』と『あまり』は？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('23',136,84);ctx.textAlign='center';ctx.fillText('9',180,84);ctx.fillText('6',212,84);",
        a:["4あまり4","3あまり27","5あまり9","4あまり8"], c:0,
        hint:"23×4=92。96−92=？ あまりは わる数23より 小さいか たしかめよう。",
        job_title:"あまりも バッチリ！",
        job_desc:"96÷23＝4あまり4。23×4=92、96−92=4。あまり4は わる数23より 小さいので これで OK！" },

      { q:"91 ÷ 23 を といたよ。23を 20と みて 見当を つけたら、商は4かな？と 思った。\nでも 23×4を 計算したら…",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('23',136,84);ctx.textAlign='center';ctx.fillText('9',180,84);ctx.fillText('1',212,84);",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"23×4を 計算したら 92に なった！ でも 91より 大きく なっちゃった…！ どうしよう？" }
        ],
        a:["23×4=92は91より大きいから、商を1へらして3にする","そのまま4でいい","わる数23を へらす","わられる数91を ふやす"], c:0,
        hint:"見当をつけた商で かけ算した答えが、わられる数より 大きく なったら、商を1へらすんだったね。",
        speech_text:"商が大きすぎたときは どうする？",
        job_title:"見当なおし マスター！",
        job_desc:"23×4=92は91より大きいので、商は3にへらす。23×3=69、91−69=22。あまり22は23より小さいのでOK。91÷23＝3あまり22が正解！" },

      { q:"138 ÷ 23 を 筆算で といたよ（3けた ÷ 2けた）。\n商は いくつ？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',211,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(272,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('23',136,84);ctx.textAlign='center';ctx.fillText('1',180,84);ctx.fillText('3',212,84);ctx.fillText('8',244,84);",
        a:["6","5","7","8"], c:0,
        hint:"23×6を 計算してみよう。ぴったり138に なるかな？",
        job_title:"3けた÷2けたも できた！",
        job_desc:"138÷23＝6。23×6=138で ぴったり わりきれるね。3けたに なっても、見当をつけるやりかたは 同じだよ。" },

      { q:"えんぴつが 96本 あります。\n1ふくろに 24本ずつ 入れると、ふくろは 何ふくろ できる？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('24',136,84);ctx.textAlign='center';ctx.fillText('9',180,84);ctx.fillText('6',212,84);",
        type:"text_input", correct_answers:["4","4ふくろ"],
        hint:"96÷24を 筆算で といてみよう。24×いくつ が 96に なるかな？",
        rescue_hint:"24×4=96。ぴったり わりきれるね。答えは4だよ。",
        speech_text:"ふくろは なんふくろ できるかな？",
        job_title:"筆算 文章題 クリア！",
        job_desc:"96÷24＝4。24×4=96で ぴったりだね。4ふくろ できるよ。" },

      { q:"168 ÷ 31 を 筆算で といたよ（3けた ÷ 2けた、あまりあり）。\n『商』と『あまり』は？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',211,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(272,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('31',136,84);ctx.textAlign='center';ctx.fillText('1',180,84);ctx.fillText('6',212,84);ctx.fillText('8',244,84);",
        a:["5あまり13","4あまり44","6あまり12","5あまり3"], c:0,
        hint:"31×5=155。168−155=？ あまりは わる数31より 小さいか たしかめよう。",
        job_title:"むずかしい 筆算も バッチリ！",
        job_desc:"168÷31＝5あまり13。31×5=155、168−155=13。あまり13は わる数31より 小さいので これで OK！" },

      { q:"78 ÷ 13 を 筆算で といたよ。\n商は いくつに なる？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('13',136,84);ctx.textAlign='center';ctx.fillText('7',180,84);ctx.fillText('8',212,84);",
        a:["6","5","7","8"], c:0,
        hint:"13 × 6 を 計算してみよう。ぴったり 78に なるかな？",
        job_title:"わりきれる問題も バッチリ！",
        job_desc:"78÷13＝6。13×6=78で ぴったり わりきれるね。見当をつけるとき、13は10とみると、商はだいたい7〜8くらいと予想できるよ。" },

      { q:"96 ÷ 16 を 筆算で といたよ。\n商は いくつに なる？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('16',136,84);ctx.textAlign='center';ctx.fillText('9',180,84);ctx.fillText('6',212,84);",
        a:["6","5","7","4"], c:0,
        hint:"16 × 6 を 計算してみよう。ぴったり 96に なるかな？",
        job_title:"2けたわり算も れんしゅう！",
        job_desc:"96÷16＝6。16×6=96で ぴったり わりきれるね。" },

      { q:"175 ÷ 25 を 筆算で といたよ（3けた ÷ 2けた）。\n商は いくつ？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',211,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(272,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('25',136,84);ctx.textAlign='center';ctx.fillText('1',180,84);ctx.fillText('7',212,84);ctx.fillText('5',244,84);",
        a:["7","6","8","5"], c:0,
        hint:"25 × 7 を 計算してみよう。ぴったり175に なるかな？",
        job_title:"3けたでも わりきれた！",
        job_desc:"175÷25＝7。25×7=175で ぴったり わりきれるね。3けたに なっても やりかたは 同じだよ。" },

      { q:"87 ÷ 16 を 筆算で といたよ。\n『商』と『あまり』は？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('16',136,84);ctx.textAlign='center';ctx.fillText('8',180,84);ctx.fillText('7',212,84);",
        a:["5あまり7","4あまり23","6あまり9","5あまり2"], c:0,
        hint:"16×5=80。87−80=？ あまりは わる数16より 小さいか たしかめよう。",
        job_title:"あまりも きちんと！",
        job_desc:"87÷16＝5あまり7。16×5=80、87−80=7。あまり7は わる数16より 小さいので これで OK！" },

      { q:"142 ÷ 19 を 筆算で といたよ（3けた ÷ 2けた、あまりあり）。\n『商』と『あまり』は？",
        regen:{kind:"hissan_divide"},
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',211,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(272,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('19',136,84);ctx.textAlign='center';ctx.fillText('1',180,84);ctx.fillText('4',212,84);ctx.fillText('2',244,84);",
        a:["7あまり9","6あまり28","8あまり2","7あまり2"], c:0,
        hint:"19×7=133。142−133=？ あまりは わる数19より 小さいか たしかめよう。",
        job_title:"3けた＋あまりも マスター！",
        job_desc:"142÷19＝7あまり9。19×7=133、142−133=9。あまり9は わる数19より 小さいので これで OK！" },

      { q:"おり紙が 65まい あります。\n1人に 14まいずつ 配ると、何人に 配れる？（あまりが 出るよ）",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#94a3b8';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('（しょうは このスペースに 書こう）',195,18);ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(150,102);ctx.stroke();ctx.beginPath();ctx.moveTo(150,38);ctx.lineTo(240,38);ctx.stroke();ctx.fillStyle='#4a3b52';ctx.font='bold 30px sans-serif';ctx.textAlign='right';ctx.fillText('14',136,84);ctx.textAlign='center';ctx.fillText('6',180,84);ctx.fillText('5',212,84);",
        type:"text_input", correct_answers:["4","4人"],
        hint:"65÷14を 筆算で といてみよう。14×いくつが 65に いちばん近いかな？",
        rescue_hint:"14×4=56、65−56=9。あまり9は14より小さいのでOK。4人に配れて9まいあまるよ。答えは4だよ。",
        speech_text:"何人に 配れるかな？",
        job_title:"あまりのある文章題 クリア！",
        job_desc:"65÷14＝4あまり9。14×4=56、65−56=9。4人に 配れて、9まい あまるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"2けたで わる 筆算の もんだいって、いつも さいしょに『わる数を 何十と みて 見当を つけよう』って 出るよね。<br>これは <b>なにが できると OK</b>なのかな？" }
        ],
        a:["わる数を がい数（何十）とみて、商の見当を すばやく つけられるか","かけ算九九が ぜんぶ言えるか","大きな数が 読めるか","たし算が はやいか"], c:0,
        hint:"『見当を つけよう』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『わる数を がい数でみて、商の見当を すばやくつけられるか』。2けたで わる筆算では、この 見当のつけかたが いちばん 大事なんだ。" },

      { q:"【ニコに 教えてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"84 ÷ 27を といたよ！ 27を 30とみて 見当をつけたら、商は4かな…と 思って 27×4を 計算したら 108に なっちゃった！<br>あれ、84より 大きくなっちゃった…どうしよう？" }
        ],
        a:["商が大きすぎた。1へらして3にすればいい","わる数をふやせばいい","わられる数をへらせばいい","そのまま4でいい"], c:0,
        hint:"27×4=108は84より大きいね。商を1へらすと どうなるかな？",
        job_title:"先生に なれた！",
        job_desc:"27×4=108は84をこえてしまう。商を1へらして3にすると、27×3=81、84−81=3であまり3。84÷27＝3あまり3が正解！ニコに教えられた社長は、もうバッチリわかってるね。" },

      { q:"138 ÷ 23 の 商を、数字で 書こう。",
        type:"text_input", correct_answers:["6"],
        hint:"23×いくつ が 138に なるか、思い出してみよう。",
        rescue_hint:"23×6=138。答えは6だよ。",
        job_title:"だい2回 クリア！",
        job_desc:"2けたで わる 筆算、おつかれさま！ 『わる数を 何十とみて 見当をつける』『見当が大きすぎたら 商を1へらす』の 2つが 今日の ポイントだったね。" }
    ],

    "算数/角度/kakudo01": [
      { q:"直角（ちょっかく）は 何度（なんど）？",
        a:["90度","100度","80度","60度"], c:0,
        hint:"三角じょうぎの かどや、本の かどの 形だよ。",
        speech_text:"ちょっかくは なんど？",
        job_title:"直角マスター！",
        job_desc:"直角は 90度。まっすぐ たてと よこが 出あう かどの 大きさだよ。時計の 3時の 形も 直角だね。" },

      { q:"半回転（まっすぐ 一直線）の 角は 何度？",
        a:["180度","90度","360度","270度"], c:0,
        hint:"直角（90度）が 2つ ぶんだよ。",
        job_title:"半回転 わかった！",
        job_desc:"まっすぐ 一直線は 180度。90度 ＋ 90度 ＝ 180度 だね。" },

      { q:"1回転（ぐるっと 1しゅう）は 何度？",
        a:["360度","180度","400度","90度"], c:0,
        hint:"半回転（180度）が 2つ ぶんだよ。",
        job_title:"1回転 せいかい！",
        job_desc:"1回転は 360度。180度 ＋ 180度 ＝ 360度。方位（ほうい）や 時計の はりも これで 1しゅうだよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"ねえ社長！ 紙に かかれた この 角、<b>分度器（ぶんどき）を あてて 何度か 調べて</b>みて！ って もんだいだよ。" },
          { name:"ニコ", icon:"🦄", msg:"この もんだいは、ほんとうは <b>なにが できるか</b> を たしかめたいのかな？" }
        ],
        a:["分度器を つかって 角度を 正しく 読めるか","九九が 言えるか","大きい数が 読めるか","漢字が 書けるか"], c:0,
        hint:"『分度器を あてて 調べる』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『分度器で 角度を 正しく 読めるか』。\n0の 線を 角の 一辺に そろえて、まん中を 頂点（ちょうてん）に あわせて 読むよ。" },

      { q:"下の 角を 見てね。この 角は 直角（90度）より 大きい？ 小さい？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#8a5cf0';ctx.lineWidth=4;ctx.lineCap='round';var vx=240,vy=115;ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx+120,vy);ctx.stroke();var a=120*Math.PI/180;ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx+Math.cos(a)*110,vy-Math.sin(a)*110);ctx.stroke();ctx.fillStyle='#ff7fc4';ctx.beginPath();ctx.arc(vx,vy,5,0,Math.PI*2);ctx.fill();",
        a:["直角より 大きい","直角より 小さい","ちょうど 直角","わからない"], c:0,
        hint:"直角（90度）は L字の 形。それより ひらいて いる？",
        job_title:"見る目 バッチリ！",
        job_desc:"この 角は 120度くらいで、直角（90度）より 大きいね。\n90度より ひらいて いる 角を『鈍角（どんかく）』、小さい 角を『鋭角（えいかく）』と いうよ。" },

      { q:"直角 2つ分を あわせると 何度？",
        type:"text_input", correct_answers:["180","180度"],
        hint:"90度 ＋ 90度 は？",
        rescue_hint:"90 と 90 を たすと 180。だから 180度だよ！",
        job_title:"たし算で 角度！",
        job_desc:"90度 ＋ 90度 ＝ 180度。角度も たし算や ひき算が できるよ。これが できると、角を 組み合わせる もんだいも へっちゃら！" },

      { q:"三角じょうぎに ある、いちばん とがった 角(30度・60度・90度の 組の 30度)は、直角(90度)より 大きい？ 小さい？",
        a:["直角より 小さい（鋭角）","直角より 大きい（鈍角）","ちょうど直角","わからない"], c:0,
        hint:"90度より 小さい 角を『鋭角（えいかく）』と いうよ。",
        job_title:"鋭角 はっけん！",
        job_desc:"30度は 90度より 小さいから『鋭角』。とがった 角は 鋭角、ひらいた 角は『鈍角（どんかく）』だよ。" },

      { q:"90度より 大きくて、180度より 小さい 角を 何という？",
        a:["鈍角（どんかく）","鋭角（えいかく）","直角","平角"], c:0,
        hint:"『鈍（にぶ）い』は『するどくない』という いみ。ひらいた 角だよ。",
        job_title:"鈍角も おぼえた！",
        job_desc:"90度より 大きく 180度より 小さい 角は『鈍角』。直角(90度)より ひらいて いる 角の ことだよ。" },

      { q:"90度より 小さい 角を 何という？ かん字で 書こう。",
        type:"text_input", correct_answers:["鋭角","えいかく"],
        hint:"するどい かどの 角だよ。『えい○』。",
        rescue_hint:"90度より 小さい 角は『鋭角』だよ。",
        job_title:"角の名前 マスター！",
        job_desc:"90度より 小さい 角が『鋭角』、大きい 角が『鈍角』。直角(90度)は そのまま『直角』と いうよ。" },

      { q:"時計の 長い針と 短い針が『6時』を さして いるとき、2つの針の 間の 角度は 何度？",
        a:["180度","90度","360度","270度"], c:0,
        hint:"6時の 時計の 形を 思いうかべて！ 長い針と 短い針が まっすぐ 一直線に なるね。",
        job_title:"時計と角度 マスター！",
        job_desc:"6時ちょうどは、長い針と 短い針が 一直線に なるから 180度。3時なら 90度だったね。時計は 角度の べんきょうに ぴったりなんだ。" },

      { q:"60度の 角が 2つ 合わさると、ぜんぶで 何度に なる？",
        a:["120度","60度","30度","180度"], c:0,
        hint:"60 ＋ 60 は？",
        job_title:"角の たし算！",
        job_desc:"60度 ＋ 60度 ＝ 120度。角度も ふつうの 数と 同じように たし算や ひき算が できるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『同じ 角度でも、辺を 長く のばして 書いたら、角が 大きく なった 気が する…』<br>これって 本当かな？" } ],
        a:["本当じゃない。角度は 辺の長さに 関係なく、開き具合だけで きまる","本当。辺が長いほど 角度も大きくなる","場合による","わからない"], c:0,
        hint:"角度は『どれだけ ひらいて いるか』を あらわす もの。辺の長さは 関係ないよ。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"角度は 辺の長さを 変えても かわらない。開き具合（ひらきかた）だけで きまるんだ。長い辺で 書いても、短い辺で 書いても、同じ角度なら 同じ 大きさだよ。" }
    ],

    "国語/読解/kosoado01": [
      { q:"自分（話している人）の すぐ近くの ものを さす言葉は どれ？",
        a:["これ・この","それ・その","あれ・あの","どれ・どの"], c:0,
        hint:"『こ』の なかまだよ。",
        speech_text:"じぶんの ちかくは？",
        job_title:"こそあど はじめの一歩！",
        job_desc:"自分の 近くは『これ・この・ここ』。『こ』の なかまだよ。" },

      { q:"相手（聞いている人）の 近くの ものを さす言葉は どれ？",
        a:["それ・その","これ・この","あれ・あの","どれ・どの"], c:0,
        hint:"『そ』の なかま。相手の そばだよ。",
        job_title:"そのちょうし！",
        job_desc:"相手の 近くは『それ・その・そこ』。『そ』の なかまだね。" },

      { q:"自分からも 相手からも 遠い ものを さす言葉は どれ？",
        a:["あれ・あの","これ・この","それ・その","どれ・どの"], c:0,
        hint:"『あ』の なかま。とおくの ものだよ。",
        job_title:"とおくも バッチリ！",
        job_desc:"遠くの ものは『あれ・あの・あそこ』。どこか わからない ときは『どれ・どの・どこ』（『ど』の なかま）だよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『きみの となりの その本、とって！』って 言われたよ。<br>この『その本』は、<b>だれの 近くの 本</b>かな？" }
        ],
        a:["聞いている きみの 近くの本","話している ニコの 近くの本","遠くの 本","どこにも ない本"], c:0,
        hint:"『そ』は 相手（聞き手）の 近くだったね。",
        speech_text:"その、は だれの ちかく？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"『その』は『そ』の なかま＝聞いている きみの 近く。だから きみの となりの本の ことだね。こそあどは『どこに あるか』で きまるよ。" },

      { q:"『〇れ』の 形で、遠くの ものを さす言葉を ひらがなで 書こう。",
        type:"text_input", correct_answers:["あれ"],
        hint:"『あ』の なかまの ことば。",
        rescue_hint:"遠くは『あ』。『あ』＋『れ』で…？",
        job_title:"こそあど マスター！",
        job_desc:"遠くの ものは『あれ』。これ・それ・あれ・どれ、で 場所が かわるんだね。" },

      { q:"場所を さす「ここ・そこ・あそこ・どこ」の中で、相手（話を聞く人）の いる場所を さす言葉は どれ？",
        a:["そこ","ここ","あそこ","どこ"], c:0,
        hint:"『そ』は 相手の そば（ちかく）だったね。",
        job_title:"場所の指示語 バッチリ！",
        job_desc:"自分の 場所は『ここ』、相手の 場所は『そこ』、遠くは『あそこ』、わからない 場所は『どこ』だね。" },

      { q:"様子（ようす）を さす「こう・そう・ああ・どう」の中で、「このような やり方」という意味になる言葉は どれ？",
        a:["こう","そう","ああ","どう"], c:0,
        hint:"自分の 近く・手もとの 様子を さす『こ』の なかまだよ。",
        job_title:"様子の指示語 マスター！",
        job_desc:"『こう（やってごらん）』は、自分の 手もとや 様子を さすよ！『そう・ああ・どう』も 使い分けられるね。" },

      { q:"下の 図は、自分（Aさん）、相手（Bさん）、遠くの木（C）の 位置です。\n自分からも 相手からも 遠くにある Cの木を さす言葉は、①〜③の どれ？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f6fff6';ctx.fillRect(0,0,w,h);ctx.font='bold 13px sans-serif';ctx.fillStyle='#27ae60';ctx.fillText('A (自分)',30,40);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(50,70,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e74c3c';ctx.fillText('リンゴ(①これ)',20,105);ctx.fillStyle='#2980b9';ctx.fillText('B (相手)',w/2-20,40);ctx.fillStyle='#8e44ad';ctx.fillText('本(②それ)',w/2-25,105);ctx.fillStyle='#27ae60';ctx.fillText('C (木:③あれ)',w*0.75,40);ctx.beginPath();ctx.arc(w*0.82,75,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7f8c8d';ctx.fillRect(w*0.82-4,95,8,20);",
        a:["③あれ（遠くの木）","①これ（手もと）","②それ（相手の手もと）","どれ"], c:0,
        hint:"自分と 相手の どちらからも 離れている 遠くの ものだよ。",
        job_title:"図解で こそあど！",
        job_desc:"自分の 手もとは『①これ』、相手の 手もとは『②それ』、遠くの 木は『③あれ』と 言うんだよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「『あれを 取って！』って言われても、なにを 指しているのか 分からなくて 困っちゃったよ…」" }
        ],
        a:["『あれ』は 自分からも 相手からも 遠くの物を指すから、遠くや 指さしている方向を さがすといいよ！","『あれ』は 自分の 手もとの物の ことだよ","『あれ』は 本の ことしか 指さないよ","『あれ』は 特に 意味がない 言葉だよ"], c:0,
        hint:"『あれ』が どんな 場所の ものを 指すか 教えてあげよう！",
        speech_text:"ニコに『あれ』の 指すばしょを おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"『あれ』は 自分からも 相手からも 離れた「遠く」を 指す言葉だよ！相手の 目線や 指の方向を 見ると 分かるよと ニコに 教えてあげよう。" },

      { q:"わからない 場所を たずねるときに つかう、『ど』から はじまる 言葉（ど◯）を ひらがな 2文字で 書こう。",
        type:"text_input", correct_answers:["どこ"],
        hint:"『ど』＋『こ』。どこにあるの？の『どこ』だよ。",
        rescue_hint:"答えは『どこ』だよ。",
        job_title:"たずねる言葉 マスター！",
        job_desc:"どこ・どれ・どの、などの『ど』グループは、わからない 物や 場所を たずねるときに 使うんだね！" },

      { q:"『昔、小さな 村に 親切な おじいさんが いました。かれは 毎日 山へ 柴刈りに 行きました。』 この文で『かれ』が 指しているのは だれかな？",
        a:["親切な おじいさん","柴刈り","小さな 村","山"], c:0,
        hint:"『かれ』は 直前の 文に 出てきた 男の 人を 指しているよ。",
        job_title:"人をさす指示語クリア！",
        job_desc:"『かれ』や『彼女（かのじょ）』は 人を さす 指示語！ 直前の 文に出てきた 人物を さしているね。" },

      { q:"文章の中で「それ」や「これ」などの 指示語が 何を指しているかを 探すとき、どこを 見るのが 基本かな？",
        a:["指示語の 直前（すぐ前）の 文章","文章の 一番最後の 行","タイトルの 文章","裏表紙の 文章"], c:0,
        hint:"指示語は 直前に出た 言葉や 文を 受けることが 多いよ。",
        job_title:"指示語探しの極意！",
        job_desc:"指示語の 内容は『直前の 文や フレーズ』に 書かれていることが ほとんど！ 前を 読み返すと すぐ 見つかるよ。" }
    ],

    "理科/電気/denki01": [
      { q:"豆電球（まめでんきゅう）に あかりが つくのは、電気の 通り道が どうなっている とき？",
        a:["わ のように 1つの道で つながっている","とちゅうで 切れている","かん電池を つかわない","豆電球だけ ある"], c:0,
        hint:"電気は『わ（輪）』になった 道を ぐるっと 流れるよ。",
        speech_text:"あかりが つくのは？",
        job_title:"回路 わかった！",
        job_desc:"電気は、かん電池→豆電球→かん電池と『わ』になった 道（回路）を 流れて、あかりが つくよ。とちゅうが 切れていると つかないんだ。" },

      { q:"かん電池を 2こ「直列（ちょくれつ）つなぎ」に すると、豆電球の あかりは？",
        a:["1この ときより 明るくなる","くらくなる","つかなくなる","かわらない"], c:0,
        hint:"電池の 力が 合わさって 強くなるよ。",
        job_title:"直列つなぎ せいかい！",
        job_desc:"かん電池 2こを 直列つなぎに すると、電流が 強くなって、豆電球は 1この ときより 明るくなるよ。モーターなら 速く 回る。" },

      { q:"かん電池の 向きを 反対に つなぐと、モーターの 回る 向きは どうなる？",
        a:["反対に なる","もっと はやく なる","止まって しまう","かわらない"], c:0,
        hint:"電気の 流れる 向きが 反対に なるよ。",
        job_title:"電流の 向き マスター！",
        job_desc:"かん電池の 向きを 反対に すると、電流の 向きも 反対に なって、モーターは 反対回りに なるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『かん電池を 直列に して、豆電球の 明るさが かわるか 調べよう』<br>この もんだいは <b>なにを たしかめたい</b>のかな？" }
        ],
        a:["つなぎ方で 明るさ（電流の強さ）が かわると 分かっているか","九九が 言えるか","漢字が 書けるか","絵が じょうずか"], c:0,
        hint:"『つなぎ方を かえて 明るさを くらべる』が ポイント。",
        speech_text:"この じっけんの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『つなぎ方で 電流の 強さ（明るさ）が かわると 分かっているか』。直列に すると 明るく、並列（へいれつ）だと 1こと 同じくらいで 長もち するよ。" },

      { q:"電気の 通り道（かん電池・豆電球を わに つないだ 道）の ことを、かん字で 何という？",
        type:"text_input", correct_answers:["回路","かいろ"],
        hint:"『か○ろ』。電気が ぐるっと まわる 道。",
        rescue_hint:"『かいろ』。かん字だと『回路』だよ。",
        job_title:"ことば マスター！",
        job_desc:"電気の 通り道を『回路（かいろ）』と いうよ。わに なって いないと 電気は 流れないんだね。" },

      { q:"かん電池 2こを「並列（へいれつ）つなぎ」に すると、豆電球の 明るさは 1この ときと くらべて どうなる？",
        a:["1この ときと おなじ（かわらない）","2ばい 明るくなる","つかなくなる","まっくらに なる"], c:0,
        hint:"明るさは かわらないけれど、電池が 長もちするよ。",
        job_title:"並列つなぎ わかった！",
        job_desc:"並列つなぎに すると、明るさは 1この ときと かわらないけれど、かん電池が 長もちする 特徴があるんだよ。" },

      { q:"プロペラつき モーターを 回すとき、「直列つなぎ」と「並列つなぎ」で プロペラが 速く 回るのは どっち？",
        a:["直列つなぎ","並列つなぎ","どちらも 同じ","回らなくなる"], c:0,
        hint:"電流（電気の力）が 強くなる つなぎ方だよ。",
        job_title:"モーター実験 マスター！",
        job_desc:"直列つなぎの ほうが 電流が 強くなるから、プロペラは 直列つなぎの ときに 速く 回るよ！" },

      { q:"下の 図は かん電池 2この つなぎ方（A：直列つなぎ、B：並列つなぎ）です。\n電池が ながもち する『並列つなぎ』は、AとBの どちら？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f9f8fe';ctx.fillRect(0,0,w,h);ctx.font='bold 14px sans-serif';ctx.fillStyle='#333';ctx.fillText('A (直列)',30,25);ctx.fillText('B (並列)',w/2+30,25);ctx.strokeStyle='#e67e22';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(30,60);ctx.lineTo(80,60);ctx.lineTo(130,60);ctx.lineTo(130,110);ctx.lineTo(30,110);ctx.closePath();ctx.stroke();ctx.fillStyle='#e74c3c';ctx.fillRect(40,50,35,20);ctx.fillRect(85,50,35,20);ctx.fillStyle='#fff';ctx.font='11px sans-serif';ctx.fillText('+ -',45,64);ctx.fillText('+ -',90,64);ctx.beginPath();ctx.arc(80,110,8,0,Math.PI*2);ctx.fillStyle='#f1c40f';ctx.fill();ctx.strokeStyle='#f39c12';ctx.stroke();ctx.strokeStyle='#e67e22';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w/2+30,50);ctx.lineTo(w/2+130,50);ctx.lineTo(w/2+130,110);ctx.lineTo(w/2+30,110);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(w/2+30,80);ctx.lineTo(w/2+130,80);ctx.stroke();ctx.fillStyle='#3498db';ctx.fillRect(w/2+50,42,40,16);ctx.fillRect(w/2+50,72,40,16);ctx.fillStyle='#fff';ctx.fillText('+ -',w/2+58,54);ctx.fillText('+ -',w/2+58,84);ctx.beginPath();ctx.arc(w/2+80,110,8,0,Math.PI*2);ctx.fillStyle='#f1c40f';ctx.fill();ctx.strokeStyle='#f39c12';ctx.stroke();",
        a:["B（並列つなぎ）","A（直列つなぎ）","どちらも ちがう","どちらも 直列つなぎ"], c:0,
        hint:"道が 2つに 枝わかれ しているほうを さがそう。",
        job_title:"回路図 はっけん！",
        job_desc:"Bのように 道が 枝わかれ して つながっているのが『並列つなぎ』だよ。電池の 持ちが 良くなるんだ。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「直列つなぎと 並列つなぎって、どっちも 電池を2こ つかうのに、なにが ちがうの？」" }
        ],
        a:["直列は パワーが強く（明るく）なり、並列は 電池が 長もち するんだよ！","どちらも 全く 同じだよ","直列の ほうが 電池が 長もち するよ","並列は 電気が出なくなるよ"], c:0,
        hint:"直列＝パワーアップ、並列＝長もち！",
        speech_text:"ニコに つなぎ方の ちがいを おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"直列つなぎは 明るさや スピードが アップ（パワー重視）、並列つなぎは 長時間 つかえる（長もち重視）という ちがいが あるんだね！" },

      { q:"かん電池 2こを 横にならべて、それぞれの 電気が 枝わかれして 流れる つなぎ方を 何という？ ひらがなで 答えてね。",
        type:"text_input", correct_answers:["へいれつつなぎ","並列つなぎ","へいれつ","並列"],
        hint:"『へいれつ ○○ぎ』。直列の 反対だよ。",
        rescue_hint:"『へいれつつなぎ』だよ。",
        job_title:"つなぎ方 マスター！",
        job_desc:"かん電池を 横にならべる つなぎ方を『並列つなぎ（へいれつつなぎ）』と いうよ！" },

      { q:"かん電池の プラス極（＋）と マイナス極（−）を つなぐ 向きを つなぎかえると、プロペラ（モーター）の 回る 向きは どうなるかな？",
        a:["反対向きに 回る","同じ向きに 回る","動かなくなる","爆発する"], c:0,
        hint:"電流の 流れる 向きが 変わると、モーターの 回転も 反対に なるよ。",
        job_title:"電流の向きと回転！",
        job_desc:"電池の 向きを 逆（反対）に すると、電流の 向きが 変わって モーターの 回る 向きも 反対に なるんだね！" }
    ],

    "社会/地図/nairiku01": [
      { q:"海に 面して いない（まわりが 陸だけの）県を 何という？",
        a:["内陸県（ないりくけん）","海岸県（かいがんけん）","島県（しまけん）","湖県（みずうみけん）"], c:0,
        hint:"内（うち）に 陸（りく）と 書くよ。",
        speech_text:"うみが ない けんを なんという？",
        job_title:"内陸県 おぼえた！",
        job_desc:"海に 面して いない県を『内陸県』と いうよ。まわりを 陸に かこまれて いるんだ。" },

      { q:"日本で 海に 面して いない県（内陸県）は、ぜんぶで いくつ？",
        a:["8つ","4つ","15こ","0こ"], c:0,
        hint:"けっこう あるよ。10より 少し 少ないくらい。",
        job_title:"かず バッチリ！",
        job_desc:"内陸県は ぜんぶで 8つ（栃木・群馬・埼玉・山梨・長野・岐阜・滋賀・奈良）。地図で さがして みよう！" },

      { q:"次のうち、海に 面して いない（内陸の）県は どれ？",
        a:["長野県（ながのけん）","千葉県（ちばけん）","高知県（こうちけん）","青森県（あおもりけん）"], c:0,
        hint:"日本の まん中あたりで、まわりに 海が ない県は？",
        job_title:"地図の 目 バッチリ！",
        job_desc:"長野県は 内陸県で、海が ない。千葉・高知・青森は 海に 面して いるよ。地図で 場所を たしかめて みてね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『地図を 見て、海に 面して いない県を ぜんぶ 見つけよう』<br>この もんだいは <b>なにが できると OK</b>かな？" }
        ],
        a:["地図で 県の 場所と 海の あるなしを 読めるか","たし算が はやいか","漢字を たくさん 書けるか","絵が じょうずか"], c:0,
        hint:"『地図を 見て さがす』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『地図で 県の 場所と、海に 面して いるかを 読みとれるか』。地図を 読む 力は、社会で とても だいじだよ。" },

      { q:"まわりを 陸に かこまれて、海が ない県の ことを 何県という？ ひらがなで 書こう。",
        type:"text_input", correct_answers:["ないりくけん","ないりく"],
        hint:"『ない○く けん』。",
        rescue_hint:"うちがわに りく で『ないりくけん』。",
        job_title:"社会も マスター！",
        job_desc:"海の ない県は『内陸県（ないりくけん）』。日本には 8つ あったね。" }
    ],

    "算数/大きな数/ookazu01": [
      { q:"一万（10000）を 10こ あつめた 数は？",
        a:["十万","百万","千","一億"], c:0,
        hint:"10000 を 10ばい すると、0が 1つ ふえるよ。",
        speech_text:"いちまんを じゅっこ あつめると？",
        job_title:"位（くらい）が わかった！",
        job_desc:"一万を 10こ で 十万（100000）。10ばい するたびに 0が 1つ ふえて、位が 1つ 上がるよ。" },

      { q:"千万（1000万）を 10こ あつめた 数は？",
        a:["一億","十億","百万","一兆"], c:0,
        hint:"1000万 を 10ばい すると 位が 1つ 上がるよ。",
        job_title:"億（おく）とうじょう！",
        job_desc:"1000万 を 10こ で『一億』。万の つぎの 大きな 位が『億』だよ。1億 ＝ 100000000。" },

      { q:"一億（いちおく）は、0（ゼロ）が いくつ ならぶ？",
        a:["8こ","4こ","6こ","10こ"], c:0,
        hint:"100000000 と 書いて、0を かぞえて みよう。",
        job_title:"0のかず バッチリ！",
        job_desc:"一億は 100000000。0が 8こ ならぶよ。一・十・百・千・万・十万・百万・千万・億、と 位が 上がっていくんだ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『52370000 を 読みましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["大きな数の 位（くらい）を 読みとれるか","たし算が はやいか","九九が 言えるか","絵が じょうずか"], c:0,
        hint:"『読む』のが ポイント。どの 位まで あるかを 見るよ。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『大きな数の 位を 読みとれるか』。52370000 は 右から 4けたずつ 区切って『五千二百三十七万』と 読むよ。" },

      { q:"一億（1億）は、千万（1000万）の 何倍（なんばい）？",
        type:"text_input", correct_answers:["10","10倍"],
        hint:"1000万 を 何ばい すると 1億に なる？",
        rescue_hint:"1000万 × 10 ＝ 1億。だから 10倍だよ。",
        job_title:"大きな数 マスター！",
        job_desc:"1億 は 1000万 の 10倍。位が 1つ 上がると 10倍に なるきまり、おぼえておこう！" },

      { q:"百万（1000000）を 10こ あつめた 数は？",
        a:["一千万","一億","十万","百億"], c:0,
        hint:"100万 を 10ばい すると 位が 1つ 上がるよ。",
        job_title:"千万 とうじょう！",
        job_desc:"100万 を 10こ で『一千万』。10ばい するたびに 位が 1つ 上がって いくね。" },

      { q:"十億（じゅうおく）を 10こ あつめた 数は？",
        a:["百億","一億","一兆","千億"], c:0,
        hint:"10億 を 10ばい すると 位が 1つ 上がるよ。",
        job_title:"百億も バッチリ！",
        job_desc:"10億 を 10こ で『百億』。一・十・百・千・万…と 位が どんどん 上がって いくよ。" },

      { q:"「三千二百万」を 数字で 書こう。（半角数字で）",
        type:"text_input", correct_answers:["32000000"],
        hint:"三千二百万 ＝ 3200 × 10000。",
        rescue_hint:"3200万 ＝ 32000000 だよ。0の 数を まちがえないように！",
        job_title:"数字に なおせた！",
        job_desc:"「三千二百万」は 32000000。万の 位までの 数字（3200）の あとに、0を 4つ つければ OK。" },

      { q:"次のうち、いちばん 大きい 数は どれ？",
        a:["1億200万","9990万","9800万","9999万"], c:0,
        hint:"『1億』を こえて いる 数が あるかな？",
        job_title:"くらべる力 バッチリ！",
        job_desc:"1億200万は 1億を こえて いるので、9000万台の 数より ぜんぶ 大きいよ。位の 数が 多いほど、大きい 数に なるんだ。" },

      { q:"「52370000」を かん字で 読むと？",
        a:["五千二百三十七万","五十二億三千七百万","五百二十三万七千","五千二百三十七億"], c:0,
        hint:"右から 4けたずつ 区切って 読むよ。5237｜0000。",
        job_title:"大きな数を 読めた！",
        job_desc:"52370000 は 右から 4けたで 区切ると『5237, 0000』。だから『五千二百三十七万』と 読むよ。" },

      { q:"一兆（いっちょう）は、一億の 何倍？",
        type:"text_input", correct_answers:["10000","10000倍","1万倍","一万倍"],
        hint:"億→兆は、位が 4つ 上がるよ（万倍）。",
        rescue_hint:"一億の 1万倍が 一兆だよ。",
        job_title:"兆まで マスター！",
        job_desc:"一億の 1万倍が 一兆。一・万・億・兆、と 4けたごとに 新しい 大きな 単位が 出てくるんだね。" },

      { q:"ある県の 人口は「3456789人」です。この 数の『万の位』の 数字は どれ？",
        a:["5","3","4","9"], c:0,
        hint:"右から 一・十・百・千・万… の 順に 数えて みよう。3456789 → 右から5番目が 万の位。",
        job_title:"位どり マスター！",
        job_desc:"3456789 を 右から 一・十・百・千・万 と 数えると、万の位は『5』。くらいどりが わかると、大きな数も こわくないね。" }
    ],

    "国語/漢字/kanji01": [
      { q:"「協力（きょうりょく）」の いみに いちばん 近いのは？",
        a:["力を あわせて 行う こと","一人で する こと","けんかする こと","なまける こと"], c:0,
        hint:"『協』は みんなで 力を あわせる ことを あらわすよ。",
        speech_text:"きょうりょくの いみは？",
        job_title:"熟語（じゅくご）バッチリ！",
        job_desc:"『協力』は、みんなで 力を あわせて 行う こと。『協』の 字には 力（ちから）が いくつも 入っているね。" },

      { q:"「氵（さんずい）」の 部首を もつ 漢字は、何に かんけいが 深い？",
        a:["水","火","木","石"], c:0,
        hint:"『さんずい』は 水のしずくの 形から できたよ。",
        job_title:"部首の いみ 発見！",
        job_desc:"『氵（さんずい）』は 水に かんけいする 部首。海・池・活・流 など、水に つながる 漢字に つくよ。" },

      { q:"4年で ならう 漢字「愛」の 読み方は？",
        a:["あい","あん","えん","ねん"], c:0,
        hint:"大すきな 気もちを あらわす ことば。",
        job_title:"読み方 せいかい！",
        job_desc:"『愛』は『あい』と 読むよ。愛犬（あいけん）、愛読（あいどく）などで つかうね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『次の 漢字の 部首を 答えましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["漢字の 部首を 見分けられるか","たし算が できるか","走るのが はやいか","歌が じょうずか"], c:0,
        hint:"『部首を 答える』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『漢字の 部首を 見分けられるか』。部首が わかると、漢字の いみや なかまが つかみやすく なるよ。" },

      { q:"「林」という 漢字には、「木」が いくつ ありますか？ 数字で 書こう。",
        type:"text_input", correct_answers:["2","2つ","二"],
        hint:"『林』を よく 見て。木が ならんで いるよ。",
        rescue_hint:"木 ＋ 木 ＝ 林。だから 2つ だね。",
        job_title:"漢字マスター！",
        job_desc:"『林』は 木が 2つ。ちなみに 木が 3つで『森（もり）』。漢字は 形に いみが かくれて いて おもしろいね！" },

      { q:"漢字「花」や「草」の 上にある「艹」のような、漢字の 上側につく 部首の位置（名前）を 何という？",
        a:["かんむり（冠）","へん（偏）","つくり（旁）","あし（脚）"], c:0,
        hint:"頭の うえに かぶる「かんむり」と 同じ 名前だよ。",
        job_title:"部首の位置（かんむり）！",
        job_desc:"漢字の 上側につく 部首を『かんむり』と いうよ！草かんむり（艹）や 竹かんむり（⺮）などがあるね。" },

      { q:"「⺅（にんべん）」の 部首を もつ 漢字（休・体・作・仕 など）は、なにに かんけいが 深い？",
        a:["人（ひと）","金（かね）","木（き）","魚（さかな）"], c:0,
        hint:"『にんべん』の『にん』は『人（ひと）』のことだよ。",
        job_title:"にんべん はっけん！",
        job_desc:"『⺅（にんべん）』は「人」の 姿からできた 部首。人の 動作や 体に かかわる 漢字に つくよ。" },

      { q:"下の 図は 漢字の 部首の 位置（①左、②右、③上、④下）です。\n漢字「休」の「⺅（にんべん）」のように、漢字の『左側』につく 部首の位置①を 何という？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fffdf5';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#7f8c8d';ctx.lineWidth=2;ctx.strokeRect(30,30,w-60,h-60);ctx.beginPath();ctx.moveTo(w/2,30);ctx.lineTo(w/2,h-30);ctx.moveTo(30,h/2);ctx.lineTo(w-30,h/2);ctx.stroke();ctx.fillStyle='#e74c3c';ctx.font='bold 16px sans-serif';ctx.fillText('①偏(へん)',40,h/2-10);ctx.fillStyle='#2c3e50';ctx.fillText('②旁(つくり)',w/2+10,h/2-10);ctx.fillText('③冠(かんむり)',w/2-40,50);ctx.fillText('④脚(あし)',w/2-30,h-40);",
        a:["へん（偏）","つくり（旁）","かんむり（冠）","あし（脚）"], c:0,
        hint:"左が『へん』、右が『つくり』だよ。",
        job_title:"図解で 部首の位置！",
        job_desc:"漢字の 左側につく 部首を『へん（偏）』と いうよ！にんべん・さんずい・きへん などが 代表的だね。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「漢字って 覚えることが 多すぎて、たいへんだよ〜！」" }
        ],
        a:["部首の意味（さんずい＝水、にんべん＝人）を知ると、漢字の意味や形が 覚えやすくなるよ！","とにかく 丸暗記するしかないよ","漢字は 全部 ひらがなで 書けばいいよ","部首は 気にしなくて いいよ"], c:0,
        hint:"部首の意味を知ると 漢字が得意になる コツを 教えてあげよう！",
        speech_text:"ニコに 漢字を覚えるコツを おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"部首の意味（さんずい＝水に関係、にんべん＝人に関係）が 分かると、新しい漢字も『こういう意味かな？』と 覚えやすくなるんだよ！" },

      { q:"水に かんけいする 部首「氵」の よびかたを、ひらがな 4文字で 書こう。",
        type:"text_input", correct_answers:["さんずい"],
        hint:"『さ◯ずい』。水に関係する 部首だよ。",
        rescue_hint:"『さんずい』だよ。",
        job_title:"さんずい マスター！",
        job_desc:"『氵』は『さんずい』と いうよ！海・池・港・流 など 水の漢字に つくね。" },

      { q:"目標に むかって 力を つくす「努力」の「努」の 音読みは？",
        a:["ど","じょ","ろ","とう"], c:0,
        hint:"『努力（どりょく）』や『努める（つとめる）』と 読むよ。",
        job_title:"努力家マスター！",
        job_desc:"『努』は『ど』と 読むよ。目標に むかって 力を つくす『努力』などで つかうね。" },

      { q:"「絶対に かかせない」という いみの「必要」の「必」の 音読みは？",
        a:["ひつ","ふ","ひ","しん"], c:0,
        hint:"『必要（ひつよう）』や『必ず（かならず）』と 読むよ。",
        job_title:"必要マスター！",
        job_desc:"『必』は『ひつ』と 読むよ。必ず（かならず）、必勝（ひっしょう）などで つかうね。" },

      { q:"いっしょに すごす「仲間」の「仲」の 部首（へん）は どれ？",
        a:["⺅（にんべん）","氵（さんずい）","木（きへん）","扌（てへん）"], c:0,
        hint:"人と 人の つながりを あらわす 部首だよ。",
        job_title:"仲間を見ぬいた！",
        job_desc:"『仲』の 部首は『⺅（にんべん）』。人と 人の あいだ（仲）を あらわしているよ。" },

      { q:"出来上がったことを あらわす「完成」の「成」の 音読みは？",
        a:["せい","じょう","しょう","そう"], c:0,
        hint:"『成功（せいこう）』や『成長（せいちょう）』の『成』と おなじだよ。",
        job_title:"完成バッチリ！",
        job_desc:"『成』は『せい』と 読むよ。完成（かんせい）、成長（せいちょう）などで つかうね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『4年生で習う漢字「必」「努」「成」を使って 短文を作りましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["漢字の意味や 使い方を 理解して 文章の中で 使えるか","漢字を100回 ノートに 書けるか","絵を きれいに かけるか","声で 大きく 読めるか"], c:0,
        hint:"『短文を作る』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『漢字の意味や 使い方を 理解して 文章の中で 使えるか』。単に 形を 覚えるだけでなく、文章で 使えることが 大切なんだ。" },

      { q:"「必ず」という 漢字の ひらがなの 読み方を 書こう。",
        type:"text_input", correct_answers:["かならず"],
        hint:"『か◯らず』。『必要』の『必』だよ。",
        rescue_hint:"『かならず』だよ。",
        job_title:"読み方 パーフェクト！",
        job_desc:"『必』は 訓読みで『かならず』と 読むよ。しっかり 覚えておこう！" }
    ],

    "国語/漢字/jukugo01": [
      { q:"「温暖（おんだん）」という 熟語（じゅくご）の 組み立ては、次の うち どれかな？",
        a:["にた 意味の 漢字を くみ合わせたもの","はんたいの 意味の 漢字を くみ合わせたもの","上の漢字が 下の漢字を せつめいするもの","「〜を」にあたる 漢字が 下にくるもの"], c:0,
        hint:"「温（あたたかい）」と「暖（あたたかい）」は、どちらも あたたかい という 意味だね。",
        speech_text:"おんだんの 組み立ては？",
        job_title:"熟語のきほん！",
        job_desc:"せいかい！「温」も「暖」も『あたたかい』という 似た意味の 漢字。似た意味の 漢字を ならべて 意味を 強めているんだね。" },

      { q:"「勝敗（しょうはい）」という 熟語は、「勝つ（かつ）」と「敗れる（やぶれる）」の 漢字が くみ合わさって できているよ。この 組み立ては？",
        a:["はんたいの 意味の 漢字を くみ合わせたもの","にた 意味の 漢字を くみ合わせたもの","主語（しゅご）と 述語（じゅつご）の かんけい","打ち消す 意味（〜ない）を プラスするもの"], c:0,
        hint:"「勝つ」と「負ける（敗れる）」は、どんな かんけいかな？",
        job_title:"反対の組み合わせ！",
        job_desc:"せいかい！「勝つ」と「敗れる（負ける）」は はんたいの 意味だね。ほかにも「大小（だいしょう）」や「売買（ばいばい）」などが あるよ。" },

      { q:"「洋画（ようが）」という 熟語は、「洋（外国の）」という 漢字が、「画（絵画・え）」という 漢字を せつめいして『外国の え』という 意味に なっているよ。この 組み立ては？",
        a:["上の漢字が 下の漢字を せつめいするもの","下の漢字が 上の漢字を せつめいするもの","はんたいの 意味の 漢字の くみ合わせ","主語と 述語の かんけい"], c:0,
        hint:"『洋（外国の）』が『画（え）』にかかって、どんな絵かを 説明しているよ。",
        job_title:"説明する関係！",
        job_desc:"正解！「洋（西洋・外国の）」＋「画（え）」で「外国の絵」。上の漢字が 下の漢字を くわしく せつめい（修飾）しているんだね。" },

      { q:"「日没（にちぼつ）」は「日が 沈む（しずむ）」、「地震（じしん）」は「地（つち・地面）が 震える（ふるえる）」という 組み立てに なっているよ。\nこれは「〜が ◯◯する」という【主語（しゅご）と ◯◯】の 関係（かんけい）だよ。◯◯に 入る ことばを ひらがな 4文字で 書こう。",
        type:"text_input", correct_answers:["じゅつご", "述語"],
        hint:"文の 主役が「主語（しゅご）」。その主役の 動きや ようすを あらわすのが「◯◯◯◯」だよ。",
        rescue_hint:"「ひらがな 4文字」で、答えは「じゅつご」だよ。",
        job_title:"主語と述語の関係！",
        job_desc:"よくできたね！「地（主語）」が「震（述語：ふるえる）」。「〜が 〜する」という 組み立ての 熟語も たくさん あるんだよ。" },

      { q:"「読書（どくしょ）」という 熟語は、「書（ほん）を 読む」という 組み立てに なっているよ。\nこのように、日本語とは ぎゃくに、【動作（どうさ）を あらわす 漢字】が 上にきて、【「〜を」や「〜に」にあたる 漢字】が 下にくる 熟語は どれかな？",
        a:["登山（とざん）","森林（しんりん）","強弱（きょうじゃく）","地主（じぬし）"], c:0,
        hint:"「登山」を くんよみ（日本語の じゅんばん）に なおすと、「山（やま）に ◯◯」になるね。",
        job_title:"動作が先に来る！",
        job_desc:"その通り！「登山」は「山（やま）に 登る（のぼる）」。「登る（動作）」が 上にきて、「山に（〜に）」が 下にきているね。" },

      { q:"次の 3つの 熟語の うち、「道路（どうろ）」と 同じ 組み立て（にた 意味の 漢字の くみ合わせ）の 熟語は どれかな？",
        a:["絵画（かいが）","売買（ばいばい）","消火（しょうか）","地震（じしん）"], c:0,
        hint:"「道（みち）」と「路（みち・じ）」は どちらも『みち』という 意味。「絵（え）」と「画（え）」の 意味は？",
        job_title:"仲間を見つけた！",
        job_desc:"せいかい！「絵（え）」と「画（が・え）」は どちらも 絵の こと。似た意味の 漢字どうしの くみ合わせだね。ちなみに「売買」は はんたいの 意味、「消火」は「火を 消す（動作＋〜を）」だよ。" },

      { q:"「売買（ばいばい）」は「売る（うる）」と「買う（かう）」の 反対（はんたい）の 意味を くみ合わせた 熟語だよ。\nでは、「軽重（けいちょう）」は「軽い（かるい）」と「◯い」の 反対の 意味を くみ合わせたものだよ。◯に 入る 漢字 1文字を 書こう。",
        type:"text_input", correct_answers:["重", "おも"],
        hint:"「軽い（かるい）」の はんたいの 言葉は「◯い（おもい）」だね。",
        rescue_hint:"漢字 1文字で「重」と 書いてね。",
        job_title:"反対の漢字！",
        job_desc:"正解！「軽（かるい）」と「重（おもい）」で「軽重（けいちょう）」。物事の かるさ・おもさ（重要さ）を あらわす 言葉だよ。" },

      { q:"「不合格（ふごうかく）」や「非常識（ひじょうしき）」のように、上に「不」「無」「非」「未」などの 漢字が つく 熟語は、どんな 組み立てかな？",
        a:["下の漢字の 意味を 打ち消す（〜ない）もの","はんたいの 意味の 漢字を くみ合わせたもの","似た意味の 漢字を 3つ ならべたもの","主語と 述語の かんけい"], c:0,
        hint:"「不（〜ではない、〜しない）」が 下の「合格」の 意味を どうしているか 考えよう。",
        job_title:"打ち消しの意味！",
        job_desc:"せいかい！「不・無・非・未」は『〜ではない』『まだ〜していない』のように、下につく言葉の 意味を 打ち消す（否定する）はたらきが あるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『次の 熟語の うち、はんたいの 意味の 漢字を くみ合わせたものを 選びましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["漢字それぞれの 意味を 理解して、はんたいの 関係に あるか 見分けられるか","漢字の 画数（かくすう）を かぞえられるか","熟語を ローマ字で 書けるか","漢字を きれいに 書く練習が できているか"], c:0,
        hint:"熟語を 組み立てている 漢字 1文字ずつの 意味に ちゅうもく しよう。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『漢字それぞれの意味を理解して、はんたいの関係にあるか見分けられるか』。ただ 漢字を おぼえるだけでなく、意味の つながりを 考えることが 大事なんだね！" },

      { q:"漢字 2文字の 熟語には、いろいろな 組み立てが あったね。\nでは、「森林（しんりん）」という 熟語は、次の どの 組み立てに あてはまるかな？\n「にた意味」「はんたい」「上の漢字が下を説明」「動作と〜を」「主語と述語」の うち、あてはまるものを カタカナと 漢字で **「にた意味」** のように 書こう。",
        type:"text_input", correct_answers:["にた意味", "似た意味", "にた いみ", "にた意味の漢字"],
        hint:"「森（もり）」と「林（はやし）」は、どちらも 木が たくさん はえている 場所だね。",
        rescue_hint:"「森」も「林」も どちらも 木が たくさんある 場所だから、答えは「にた意味」だよ。",
        job_title:"熟語マスター！",
        job_desc:"せいかい！「森」と「林」は どちらも 木が たくさん 生えている 場所を あらわす 似た意味の 漢字。これで 熟語の 組み立ては パッチリだね！" }
    ],

    "国語/慣用句/kanyoku01": [
      { q:"「たのしみに 待つ」という意味で つかう、体の一部を つかった 慣用句（かんようく）は どれ？",
        a:["首を ながくする","耳を うたがう","足を はこぶ","手を ぬく"], c:0,
        hint:"首を 遠くへ のばすように 待つ 様子だよ。",
        speech_text:"たのしみに 待つときの かんようくは？",
        job_title:"首をながくする！",
        job_desc:"たのしみに 待つことを『首を ながくする』と いうよ！「遠足の日を 首をながくして 待つ」のように 使うね。" },

      { q:"「びっくりして 信じられない」という意味の 慣用句「◯◯を うたがう」。◯◯に 入る 体の一部は どれ？",
        a:["耳","目","鼻","口"], c:0,
        hint:"信じられないような びっくりニュースを 聞いたときだよ。",
        speech_text:"信じられないときの かんようくは？",
        job_title:"耳をうたがう！",
        job_desc:"自分の 耳で 聞いたことが 信じられないほど 驚くことを『耳を うたがう』と いうよ！" },

      { q:"「困っている人を 助ける（手伝う）」という意味の 慣用句は「手を ◯◯」。◯◯に 入る 言葉は？",
        a:["かす（貸す）","うつ（打つ）","あらう（洗う）","ぬく（抜く）"], c:0,
        hint:"自分の 手（力）を 相手に かしてあげるイメージだよ。",
        job_title:"手をかす！",
        job_desc:"手伝うことを『手を かす』と いうよ！「荷物運びの 手を かす」のように つかうんだ。" },

      { q:"大すきな ものがあって 夢中（むちゅう）に なることを「◯が ない」と 言います。◯に 入る 体のパーツは？",
        a:["目","耳","足","手"], c:0,
        hint:"「甘いものに ◯がない」のように つかうよ。",
        job_title:"目にない！",
        job_desc:"大好きなものの 前では 判断力が なくなるくらい 夢中に なることを『目が ない』と 言うよ！" },

      { q:"下の 図は 体のパーツと 慣用句の つながりです。\n「なんども 繰り返し 注意する」ことを『◯を すっぱくする』と言います。◯に入る パーツは どれ？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fff9fb';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#e84393';ctx.lineWidth=3;ctx.beginPath();ctx.arc(w/2,h/2,40,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fd79a8';ctx.font='bold 14px sans-serif';ctx.fillText('顔',w/2-7,h/2+5);ctx.fillStyle='#2d3436';ctx.font='13px sans-serif';ctx.fillText('目(目がない)',30,40);ctx.fillText('耳(耳をうたがう)',30,80);ctx.fillText('口(◯をすっぱくする)',w/2+50,40);ctx.fillText('首(首をながくする)',w/2+50,80);",
        a:["口","耳","目","首"], c:0,
        hint:"注意したり 話したりするときに つかう パーツだよ。",
        job_title:"口をすっぱくする！",
        job_desc:"何度も 繰り返し 言って聞かせる ことを『口を すっぱくする』と 言うよ！「宿題しなさいと 口をすっぱくして 言われた」のように 使うね。" },

      { q:"「ほんの 少しの ものでも、集まれば 大きなものに なる」という意味の ことわざ「ちりも つもれば ◯と なる」。◯は どれ？",
        a:["山","海","空","川"], c:0,
        hint:"ちいさな ゴミ（ちり）も、たくさん たまると 大きな たかみになるよ。",
        job_title:"ことばの知恵！",
        job_desc:"『ちりも つもれば 山となる』。毎日の コツコツした 勉強や 節約が 大きな 成果に つながる という意味だよ！" },

      { q:"1つの 行動で、2つの よい結果が 得られることを 意味する 四字熟語（ことわざ）は どれ？",
        a:["一石二鳥（いっせきにちょう）","十人十色（じゅうにんといろ）","三日坊主（みっかぼうず）","七転八起（しちてんはっき）"], c:0,
        hint:"1つの 石を 投げて、2羽の 鳥を 捕まえる という 意味だよ。",
        job_title:"一石二鳥 マスター！",
        job_desc:"『一石二鳥（いっせきにちょう）』は、1つの 行動で 2つの 得を すること！「犬の散歩で 運動もできて 一石二鳥だ」のように つかうよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『「猫の 額（ねこのひたい）」とは どんな 広さのことか 選びましょう』って もんだいだよ！" },
          { name:"ニコ", icon:"🦄", msg:"この もんだいは <b>なにが 分かっていると OK</b>かな？" }
        ],
        a:["慣用句の たとえの意味（すごく 狭いこと）が 分かっているか","猫の 顔の大きさを はかれるか","猫の 種類を知っているか","絵が 描けるか"], c:0,
        hint:"『猫の額』は 実際の 猫のことじゃなくて、場所の広さの 例え（慣用句）だね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『慣用句の たとえの意味（すごく 狭い場所のこと）が 分かっているか』。言葉通りの 意味ではなく、たとえの 意味を つかむのが ポイント！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「『頭をひねる』って、本当に 首を グルッと ひねることなの…！？」" }
        ],
        a:["首をまわすことじゃなくて『一生懸命（いっしょうけんめい）考える』という意味の 慣用句だよ！","そうだね、首をまわす練習だよ","頭を なでることだよ","髪の毛を セットすることだよ"], c:0,
        hint:"言葉通りの 意味じゃなくて、考えこむ 様子の ことだよ。",
        speech_text:"ニコに 慣用句の意味を おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"『頭をひねる』は、よい アイデアを出そうと「一生懸命 考える」こと！言葉を そのまま 受け取るんじゃなくて、慣用句の意味を 教えてあげよう。" },

      { q:"困っている人を たすける（手伝う）ことを『手を ◯◯』と言います。◯◯に 入る 言葉を ひらがなで 書いてね。",
        type:"text_input", correct_answers:["かす","貸す"],
        hint:"『か◯』。相手に 手を かしてあげるよ。",
        rescue_hint:"答えは『かす』だよ。",
        job_title:"慣用句マスター！",
        job_desc:"手伝うことを『手を かす』と 言うよ！慣用句を たくさん 覚えると、文章を 読むのも 書くのも 楽しくなるね。" }
    ],

    "国語/修飾語/shushoku01": [
      { q:"文の 骨組み「だれが／なにが」を「主語（しゅご）」、「どうする／どんなだ」を「述語（じゅつご）」といいます。\nでは、ほかの言葉を「どんな」「どのように」と くわしく説明する言葉を 何という？",
        a:["修飾語（しゅうしょくご）","接続語（せつぞくご）","感動語（かんどうご）","独立語（どくりつご）"], c:0,
        hint:"『しゅうしょく』。飾りや 説明を つける 言葉だよ。",
        speech_text:"くわしく説明する言葉は？",
        job_title:"修飾語（しゅうしょくご）おぼえた！",
        job_desc:"ほかの言葉を くわしく説明する言葉を『修飾語（しゅうしょくご）』と いうよ！文を ゆたかに するんだ。" },

      { q:"「あおい 空に 白い くもが ぽっかり うかぶ。」という文で、「くもが」に対する『述語』はどれ？",
        a:["うかぶ","あおい","白い","ぽっかり"], c:0,
        hint:"「くもが」どうする？に あたる 動きの 言葉だよ。",
        job_title:"主語と述語 はっけん！",
        job_desc:"「くもが（主語）」＋「うかぶ（述語）」。文の 骨組みは「くもが うかぶ」だね！" },

      { q:"「大きな 犬が 元気に 走る。」という文で、「元気に」は どの言葉を くわしく説明（修飾）している？",
        a:["走る（どのように 走るか）","犬が","大きな","元気に"], c:0,
        hint:"「元気に ◯◯」と つながる 言葉を さがしてみよう。",
        job_title:"かかり方 バッチリ！",
        job_desc:"「元気に」は「走る」にかかっているよ！どのように走るか（走り方）を 説明する 修飾語だね。" },

      { q:"「昨日、弟が 図書館で 面白い 本を 借りた。」という文の『主語（だれが）』は どれ？",
        a:["弟が","昨日","図書館で","本を"], c:0,
        hint: "「だれが」借りたのかを 考えよう。",
        job_title:"主語を見つけた！",
        job_desc:"主語は「弟が」。「誰が」借りたのかという 文の 主役だね。" },

      { q:"下の 図は「大きな 犬が 元気に 走る」の 文の 組み立て（かかり方）です。\n「犬が」を くわしく説明している 修飾語は どれ？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f0f4f8';ctx.fillRect(0,0,w,h);ctx.font='bold 14px sans-serif';ctx.fillStyle='#2c3e50';ctx.fillText('大きな',30,40);ctx.fillText('犬が(主語)',30,90);ctx.fillText('元気に',w/2+20,40);ctx.fillText('走る(述語)',w/2+20,90);ctx.strokeStyle='#e74c3c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(50,45);ctx.lineTo(50,70);ctx.stroke();ctx.beginPath();ctx.moveTo(w/2+40,45);ctx.lineTo(w/2+40,70);ctx.stroke();",
        a:["大きな","元気に","走る","なし"], c:0,
        hint:"「どんな 犬が」と説名している 言葉だよ。",
        job_title:"図解で 修飾語！",
        job_desc:"「大きな」は「犬が」を説明し、「元気に」は「走る」を説明しているよ！矢印で かかり方が わかるね。" },

      { q:"修飾語（しゅうしょくご）を 文に つかうと、文は どうなる？",
        a:["様子や 詳しい状況が はっきり伝わるようになる","文の意味が わからなくなる","文字数が 減って 短くなる","主語が 消えてしまう"], c:0,
        hint:"「犬が 走る」よりも「大きな犬が 元気に走る」のほうが どんな様子か よくわかるよね。",
        job_title:"修飾語の役割！",
        job_desc:"修飾語をつかうと、どんな様子か・どのようにしたかが 詳しく伝わって、生き生きした 文章に なるんだよ！" },

      { q:"「赤い りんごを おいしそうに 食べる。」の文で、「赤い」は どこにかかる？",
        a:["りんごを（どんな りんごか）","食べる","おいしそうに","赤い"], c:0,
        hint:"「赤い ◯◯」と 直接 つながる 言葉だよ。",
        job_title:"かかり先 はっけん！",
        job_desc:"「赤い」は「りんごを」を説明しているよ！「どんな りんご」かを 表す 修飾語だね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『次の文から 修飾語を すべて 見つけましょう』って もんだいが出たよ！" },
          { name:"ニコ", icon:"🦄", msg:"この もんだいは <b>なにが 分かっていると OK</b>かな？" }
        ],
        a:["どの言葉が ほかの言葉を くわしく説明しているか（かかり方）が 分かっているか","漢字の書き順が 正しいか","音読が 大きな声で できるか","漢字の 画数が 数えられるか"], c:0,
        hint:"『修飾語を見つける』は 言葉と言葉の つながりを 見ぬくことだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『どの言葉が ほかの言葉を くわしく説明しているか（修飾の関係）が 分かっているか』。文の 構造を 見抜く 力が つくよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「主語と 述語だけで『犬が 走る』って書けば、修飾語なんて いらないんじゃない？」" }
        ],
        a:["『大きな』や『元気に』などの修飾語をつけると、どんな犬が どう走っているか くわしく伝わるよ！","そうだね、修飾語は まったく 必要ないよ","主語と 述語も 書かないほうが いいよ","修飾語は 英語でしか つかわないよ"], c:0,
        hint:"修飾語があると 様子が くわしく伝わる メリットを 教えてあげよう！",
        speech_text:"ニコに 修飾語のよさを おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"修飾語があると「どんな犬」「どのように走る」という 詳しいイメージが 相手に ぴったり 伝わるんだよと ニコに 教えてあげよう。" },

      { q:"ほかの言葉を くわしく説明する言葉を『しゅうしょくご』といいます。かん字 3文字で 書いてね。",
        type:"text_input", correct_answers:["修飾語","しゅうしょくご"],
        hint:"『しゅう・しょく・ご』。かん字だと『修飾語』だよ。",
        rescue_hint:"答えは『修飾語』だよ。",
        job_title:"文のしくみ マスター！",
        job_desc:"『修飾語（しゅうしょくご）』は 文を 豊かにする 大切な 言葉！主語・述語・修飾語の かんけいを 覚えておこうね。" }
    ],

    "算数/面積/menseki_1": [
      { q:"よこ 3、たて 4の 長方形の 面積は？（タイルの 数）",
        a:["12","7","34","1"], c:0,
        hint:"よこ × たて ＝ 面積。3×4 だよ。",
        job_title:"面積の きほん！",
        job_desc:"よこ×たて＝面積。3×4＝12。かけ算は、しきつめた タイルの 数（面積）を あらわすんだ。" },
      { q:"面積が 12の 長方形で、よこが 2の とき、たては？",
        a:["6","10","24","4"], c:0,
        hint:"面積 ÷ よこ ＝ たて。12÷2 だよ。",
        job_title:"面積からの わり算！",
        job_desc:"12÷2＝6。面積と 1つの 辺が わかれば、もう1つの 辺は わり算で 出せるよ。" },
      { q:"同じ 12この タイルで、よこを 1に すると、たては いくつ？ 数字で。",
        type:"text_input", correct_answers:["12","12こ"],
        hint:"1× □ ＝ 12。",
        rescue_hint:"よこ1なら、たては 12。1×12＝12だね。",
        job_title:"変身 マスター！",
        job_desc:"よこ1・たて12。形は ほそ長いけど、タイルは やっぱり 12こ。面積は かわらないね。" },
      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『面積12・よこ3の 長方形。たては？』<br>この もんだいは <b>なにが できると OK</b>かな？" } ],
        a:["面積と 1つの 辺から、もう1つの 辺を わり算で 出せるか","たし算が はやいか","九九を 言えるか","絵が じょうずか"], c:0,
        hint:"『面積 ÷ 辺』を つかうね。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『面積÷辺＝もう1つの辺』が できるか。12÷3＝4 だね。" },

      { q:"よこ 5、たて 3の 長方形の 面積は？（タイルの 数）",
        a:["15","8","53","2"], c:0,
        hint:"よこ × たて。5×3 だよ。",
        job_title:"かけ算で 面積！",
        job_desc:"5×3＝15。よこの数と たての数を かけると、しきつめた タイルの 数（面積）に なるよ。" },

      { q:"面積が 20の 長方形で、たてが 4の とき、よこは？",
        a:["5","16","24","80"], c:0,
        hint:"面積 ÷ たて ＝ よこ。20÷4 だよ。",
        job_title:"わり算で 面積！",
        job_desc:"20÷4＝5。面積と たての長さが わかれば、よこの長さは わり算で 出せるよ。" },

      { q:"同じ 18この タイルで、よこを 2に すると、たては いくつ？ 数字で。",
        type:"text_input", correct_answers:["9","9こ"],
        hint:"2 × □ ＝ 18。",
        rescue_hint:"よこ2なら、たては 9。2×9＝18だね。",
        job_title:"変身 じょうずに できた！",
        job_desc:"よこ2・たて9。形は 細長く なったけど、タイルは やっぱり 18こ。面積は かわらないんだね。" },

      { q:"よこ4・たて6の 長方形Aと、よこ8・たて3の 長方形Bが あります。面積が 大きいのは どっち？",
        a:["同じ大きさ","Aのほうが大きい","Bのほうが大きい","くらべられない"], c:0,
        hint:"それぞれ よこ×たてを 計算して くらべてみよう。",
        job_title:"形は ちがっても…！",
        job_desc:"A＝4×6＝24。B＝8×3＝24。形は ぜんぜん ちがうのに、面積は 同じ 24なんだ。これが『面積の変身』の おもしろい ところ！" }
    ],

    "算数/面積/menseki_2": [
      { q:"面積が 24の 長方形で、よこが 6の とき、たては？",
        a:["4","3","30","18"], c:0,
        hint:"24 ÷ 6。",
        job_title:"中級 スタート！",
        job_desc:"24÷6＝4。面積が 大きくなっても、やることは 同じ。面積÷辺 だよ。" },
      { q:"よこ3・たて4の 長方形。よこも たても 両方 2倍に すると、面積は 何倍？",
        a:["4倍","2倍","6倍","8倍"], c:0,
        hint:"よこ2倍・たて2倍。2×2 を 考えよう。",
        job_title:"⚠️ ここが 落とし穴！",
        job_desc:"6×8＝48。もとは 12。48は 12の 4倍！ たて・よこ 両方 2倍だから、面積は 2×2＝4倍に なるんだ。" },
      { q:"面積が 24の 長方形で、たてが 8の とき、よこは？ 数字で。",
        type:"text_input", correct_answers:["3","3こ"],
        hint:"24 ÷ 8。",
        rescue_hint:"8×3＝24。だから よこは 3。",
        job_title:"中級 クリア！",
        job_desc:"24÷8＝3。辺が たてでも よこでも、面積÷わかっている辺 で もう一方が 出るよ。" },
      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『たて・よこ 両方を 2倍。面積は 2倍？』<br>この もんだいは <b>なにを ためして</b>いる？" } ],
        a:["両方を 2倍すると 面積は 2×2＝4倍、を 見ぬけるか","2倍の かけ算が できるか","色が わかるか","大きい数を 読めるか"], c:0,
        hint:"『2倍のワナ』だね。面積は 縦横の かけ算。",
        job_title:"🎯 ワナを 見ぬいた！",
        job_desc:"ねらいは『両方n倍で 面積は n×n倍』を 見ぬく力。ここが 面積の いちばん おもしろい ところ！" },

      { q:"面積が 32の 長方形で、よこが 8の とき、たては？",
        a:["4","24","40","256"], c:0,
        hint:"32 ÷ 8。",
        job_title:"中級 わり算！",
        job_desc:"32÷8＝4。数が 大きくなっても、面積÷辺 の やり方は 同じだよ。" },

      { q:"よこ5・たて2の 長方形。よこだけを 3倍に すると、面積は 何倍？",
        a:["3倍","6倍","9倍","2倍"], c:0,
        hint:"たての長さは かわらないよ。かわったのは よこだけ。",
        job_title:"⚠️ 片方だけ 変身！",
        job_desc:"5×2＝10。よこを3倍(15)にすると 15×2＝30。30は 10の3倍。片方だけ n倍なら、面積も そのまま n倍に なるんだ。両方 n倍する ときとは ちがうね！" },

      { q:"面積が 45の 長方形で、たてが 9の とき、よこは？ 数字で。",
        type:"text_input", correct_answers:["5","5こ"],
        hint:"45 ÷ 9。",
        rescue_hint:"9×5＝45。だから よこは 5。",
        job_title:"中級 クリア！",
        job_desc:"45÷9＝5。面積と 1つの辺が わかれば、いつでも わり算で もう1つの辺が 出せるね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『よこだけ 3倍に したら、面積も 3倍に なったよ！』<br>両方 2倍にしたら 4倍だったのに、なんで 今回は 3倍のままなのかな？" } ],
        a:["たての長さは かわっていないから","計算を まちがえたから","たまたま そうなっただけ","よこを 変えると いつも 面積は かわらないから"], c:0,
        hint:"『変えたのは どっちの辺か』を よく 見てみよう。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"片方の辺だけを n倍すると、面積も n倍。両方の辺を n倍すると、面積は n×n倍。『どっちを 変えたか』で 答えが かわる、面積の だいじな きまりだよ。" }
    ],

    "算数/面積/menseki_3": [
      { q:"よこ3・たて4の 長方形。よこも たても 両方 3倍に すると、面積は 何倍？",
        a:["9倍","3倍","6倍","12倍"], c:0,
        hint:"3×3 を 考えよう。",
        job_title:"上級 スタート！",
        job_desc:"9×12＝108。もとは 12。108は 12の 9倍！ 両方 3倍だから 3×3＝9倍。倍率も かけ算に なるんだね。" },
      { q:"（3＋2）×4 は、3×4 ＋ 2×4 と 同じ？",
        a:["同じ（分配のきまり）","ちがう","くらべられない","わからない"], c:0,
        hint:"よこ(3＋2)・たて4の 長方形を、3の 部分と 2の 部分に 分けて 考えよう。",
        job_title:"分配のきまり 発見！",
        job_desc:"（3＋2）×4＝20。3×4＋2×4＝12＋8＝20。同じ！ 長方形を 2つに 切っても 面積は かわらない＝分配のきまり。中学の 計算まで つながる 大事な 考えだよ。" },
      { q:"面積が 36の 長方形で、よこが 4の とき、たては？ 数字で。",
        type:"text_input", correct_answers:["9","9こ"],
        hint:"36 ÷ 4。",
        rescue_hint:"4×9＝36。だから たては 9。",
        job_title:"上級 クリア！",
        job_desc:"36÷4＝9。大きな 面積でも、面積÷辺 で バッチリ。" },
      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『（3＋2）×4 と 3×4＋2×4 は 同じか』<br>この もんだいは <b>なにが わかると OK</b>かな？" } ],
        a:["長方形を 分けても 面積は 同じ（分配のきまり）が わかるか","たし算だけ できるか","九九を 言えるか","絵が じょうずか"], c:0,
        hint:"面積を 2つに 分けて 考える 見方だね。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『分配のきまり（分けても 面積は 同じ）』が わかるか。面積の 見方は、こんなに 深くまで つながるんだ！" },

      { q:"よこ2・たて5の 長方形。よこも たても 両方 5倍に すると、面積は 何倍？",
        a:["25倍","10倍","5倍","50倍"], c:0,
        hint:"5×5 を 考えよう。",
        job_title:"上級 かけ算！",
        job_desc:"2×5＝10。両方5倍(10×25)にすると 10×25＝250。250は 10の25倍。両方n倍で 面積はn×n倍、5倍なら 5×5＝25倍だね。" },

      { q:"（4＋3）×5 は、4×5 ＋ 3×5 と 同じ？",
        a:["同じ（分配のきまり）","ちがう","くらべられない","わからない"], c:0,
        hint:"よこ(4＋3)・たて5の 長方形を、4の部分と 3の部分に 分けて 考えよう。",
        job_title:"分配のきまり ふたたび！",
        job_desc:"（4＋3）×5＝35。4×5＋3×5＝20＋15＝35。同じ！長方形を どこで 切っても、ぜんぶの面積を たせば もとの面積と 同じに なるんだ。" },

      { q:"面積が 54の 長方形で、たてが 6の とき、よこは？ 数字で。",
        type:"text_input", correct_answers:["9","9こ"],
        hint:"54 ÷ 6。",
        rescue_hint:"6×9＝54。だから よこは 9。",
        job_title:"上級 クリア！",
        job_desc:"54÷6＝9。大きな 面積の 数でも、面積÷辺の やり方は かわらないね。" },

      { q:"たて4cm・よこ7cmの 長方形の 紙を、たてを2倍、よこを3倍に 拡大コピーしました。新しい面積は、もとの 面積の 何倍？",
        a:["6倍","5倍","12倍","24倍"], c:0,
        hint:"たて2倍 × よこ3倍 ＝ 2×3。",
        job_title:"ちがう倍率でも できた！",
        job_desc:"もと＝4×7＝28。新しい形＝(4×2)×(7×3)＝8×21＝168。168は 28の 6倍。たてとよこで ちがう倍率でも、それぞれの倍率を かけ算すれば 面積の倍率が わかるよ。" }
    ],

    "算数/図形/suichoku_heikou01": [
      { q:"2本の直線が 交わって できる 角が 90度の とき、この2本の直線の関係を 何という？",
        a:["垂直（すいちょく）","平行（へいこう）","対角（たいかく）","直角三角形"], c:0,
        hint:"三角定規の かどの 形と 同じだよ。",
        speech_text:"すいちょくって どんな かんけい？",
        job_title:"垂直 はじめの一歩！",
        job_desc:"2本の直線が 交わって できる角が 90度の とき、この2本は「垂直」だよ。三角定規の かどが ちょうど 90度だね。" },

      { q:"下の 図を 見てね。かどに 小さい四角の しるしが ついているよ。この2本の直線の関係は？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);var cx=canvas.width/2,cy=canvas.height/2;ctx.strokeStyle='#8a5cf0';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx-100,cy);ctx.lineTo(cx+100,cy);ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy-70);ctx.lineTo(cx,cy+70);ctx.stroke();ctx.strokeStyle='#1d4ed8';ctx.lineWidth=2;ctx.strokeRect(cx,cy-14,14,14);",
        a:["垂直","平行","ただ 交わっているだけ","わからない"], c:0,
        hint:"かどに ついている 小さい四角の しるしは「ここが 90度ですよ」の めじるしだよ。",
        job_title:"しるしを 見つけた！",
        job_desc:"小さい四角の しるしは「ここが 90度ですよ」の めじるし。だから この2本は 垂直だね。" },

      { q:"どこまで のばしても 交わらない 2本の直線の関係を 何という？",
        a:["平行（へいこう）","垂直（すいちょく）","対称（たいしょう）","直線"], c:0,
        hint:"電車の レールを 思い出そう。ずっと 交わらないね。",
        job_title:"平行 マスター！",
        job_desc:"どこまで のばしても 交わらない 2本の直線は「平行」。電車の レールみたいな 関係だよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『三角定規を 2まい 使って、まっすぐな 線に 平行な 線を 引きましょう』って 先生が 言ってたよ！<br>この もんだいは <b>なにが できると OK</b>かな？" } ],
        a:["三角定規を 使って 平行な線を 正しく 引けるか","絵を きれいに かけるか","定規で まっすぐ 線が 引けるか","色を ぬれるか"], c:0,
        hint:"『平行な 線を 引く』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『三角定規を 使って 平行な線を 正しく 引けるか』。三角定規を 組み合わせると、ずれずに 平行な線が 引けるんだ。" },

      { q:"交わって できる 角が 90度の とき、この2本の直線の関係を 漢字2文字で 書こう。",
        type:"text_input", correct_answers:["垂直","すいちょく"],
        hint:"『すい〇〇』。三角定規の かどと 同じ 角度だよ。",
        rescue_hint:"90度の 交わりは『垂直』。漢字だと『垂直』と 書くよ。",
        job_title:"図形の きほん マスター！",
        job_desc:"90度で 交わる 2本の直線は『垂直』。垂直と 平行、この2つが 四角形の 仲間分けにも つながっていくよ！" },

      { q:"長方形（ちょうほうけい）の となりあう 2つの辺は、どんな関係？",
        a:["垂直（すいちょく）","平行（へいこう）","対角","ばらばら"], c:0,
        hint:"長方形は かどが みんな 直角(90度)だね。",
        job_title:"長方形の辺を 見ぬいた！",
        job_desc:"長方形の となりあう辺は、90度で 交わって いるから『垂直』。向かい合う辺は『平行』に なって いるよ。" },

      { q:"1本の直線に 垂直な 直線を 2本 引くと、その 2本の直線どうしは どんな関係に なる？",
        a:["平行（へいこう）","垂直","対角","交わる"], c:0,
        hint:"どちらも 同じ直線に 90度で 交わっているね。",
        job_title:"すいちょくから へいこうへ！",
        job_desc:"1本の直線に それぞれ垂直な 2本の直線は、たがいに『平行』に なるよ。長方形の辺が この考え方で できているんだ。" },

      { q:"どこまで のばしても 交わらない 2本の直線の関係を、かん字2文字で 書こう。",
        type:"text_input", correct_answers:["平行","へいこう"],
        hint:"『へい〇〇』。電車の レールみたいな 関係だよ。",
        rescue_hint:"交わらない 2本の直線は『平行』。かん字で『平行』と 書くよ。",
        job_title:"図形の きほん マスター！",
        job_desc:"交わらない 2本の直線は『平行』。90度で 交わるのは『垂直』。この2つが 四角形の仲間分けの もとに なるよ。" },

      { q:"「格子（こうし）もよう」の 図は、ますめ（正方形）が ならんで います。たての線と よこの線は 何度で 交わって いる？",
        a:["90度（垂直）","45度","60度","180度"], c:0,
        hint:"ますめ（正方形）の かどは みんな 直角だね。",
        job_title:"身の回りの垂直！",
        job_desc:"格子もようの たてとよこの線は 90度で 交わる、つまり『垂直』。ノートや タイルの もようにも 見つけられるよ。" },

      { q:"ノートの けい線（よこの線）どうしは、どんな関係に なって いる？",
        a:["平行（へいこう）","垂直","対角","ばらばら"], c:0,
        hint:"ノートの線は どれも 同じ向きに、交わらずに ならんで いるね。",
        job_title:"みぢかな 平行 発見！",
        job_desc:"ノートの けい線は どれも 交わらない『平行』。身の回りには 垂直や 平行が たくさん かくれているんだ。" }
    ],

    "算数/図形/shikakukei_bunrui01": [
      { q:"向かい合う 1組の辺だけが 平行な 四角形を 何という？",
        a:["台形（だいけい）","平行四辺形（へいこうしへんけい）","ひし形","長方形"], c:0,
        hint:"『1組だけ』が ポイントだよ。",
        speech_text:"1組だけ へいこうな しかくけいは？",
        job_title:"台形 はじめの一歩！",
        job_desc:"向かい合う 1組の辺だけが 平行な 四角形は『台形』。もう1組の辺は 平行じゃなくても いいんだ。" },

      { q:"向かい合う 2組の辺が どちらも 平行な 四角形を 何という？",
        a:["平行四辺形（へいこうしへんけい）","台形","ひし形だけ","長方形だけ"], c:0,
        hint:"『2組とも』 平行なのが ポイント。",
        job_title:"平行四辺形 わかった！",
        job_desc:"向かい合う 2組の辺が どちらも 平行な 四角形は『平行四辺形』。ひし形や 長方形も、じつは 平行四辺形の 仲間だよ。" },

      { q:"下の図を 見てね。4つの辺に 同じ長さの しるし（ー）が ついているよ。この 四角形は？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);var cx=canvas.width/2,cy=canvas.height/2;var pts=[[cx,cy-70],[cx+55,cy],[cx,cy+70],[cx-55,cy]];ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<4;i++){ctx.lineTo(pts[i][0],pts[i][1]);}ctx.closePath();ctx.fillStyle='#eaddf7';ctx.fill();ctx.strokeStyle='#8a5cf0';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#4a3b52';ctx.lineWidth=2;for(var j=0;j<4;j++){var a=pts[j],b=pts[(j+1)%4];var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;var dx=b[0]-a[0],dy=b[1]-a[1];var len=Math.sqrt(dx*dx+dy*dy);var nx=-dy/len*5,ny=dx/len*5;ctx.beginPath();ctx.moveTo(mx-nx,my-ny);ctx.lineTo(mx+nx,my+ny);ctx.stroke();}",
        a:["ひし形","台形","ただの四角形","長方形"], c:0,
        hint:"4つの辺の 長さが ぜんぶ 同じ しるしが ついているね。",
        job_title:"ひし形 発見！",
        job_desc:"4つの辺の 長さが ぜんぶ 等しい 四角形は『ひし形』。トランプの ◆マークの 形だよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『この四角形、辺の長さを はかったら 4つとも 同じだったよ！ じゃあ ひし形だね！』<br>でも 社長、ちょっと待って。<b>ほかに たしかめること</b>は ないかな？" } ],
        a:["向かい合う辺が ちゃんと 平行に なっているかも たしかめる","色を たしかめる","大きさを はかりなおす","なにも たしかめなくて いい"], c:0,
        hint:"ひし形は『辺の長さが同じ』だけじゃなく『2組の辺が平行』も 必要だよ。",
        speech_text:"ほかに たしかめることは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"辺の長さが 同じだけじゃ、じつは まだ ひし形と 言いきれない。向かい合う辺が 平行かどうかも 合わせて たしかめるのが、正しい 見分け方だよ。" },

      { q:"4つの辺の長さが すべて 等しく、2組の辺が 平行な 四角形を 何という？ 漢字とひらがなで 書こう。",
        type:"text_input", correct_answers:["ひし形","ひしがた"],
        hint:"トランプの ◆マークの 形だよ。",
        rescue_hint:"辺の長さが 全部同じ 四角形は『ひし形』だよ。",
        job_title:"四角形の 仲間分け マスター！",
        job_desc:"台形・平行四辺形・ひし形・長方形・正方形は、辺の 平行や 長さ、角度の 組み合わせで つながっているよ。仲間分けが できると、図形の 見え方が グッと 広がるね！" },

      { q:"4つの角が ぜんぶ 直角(90度)で、向かい合う辺の長さが 等しい 四角形を 何という？",
        a:["長方形（ちょうほうけい）","正方形","台形","ひし形"], c:0,
        hint:"教室の 黒板や 本の 形を 思い出そう。",
        job_title:"長方形 はじめの一歩！",
        job_desc:"4つの角が ぜんぶ 直角の 四角形は『長方形』。向かい合う辺の長さが 等しいのが とくちょうだよ。" },

      { q:"4つの角が ぜんぶ 直角で、4つの辺の長さも ぜんぶ 等しい 四角形を 何という？",
        a:["正方形（せいほうけい）","長方形","台形","ひし形"], c:0,
        hint:"長方形の 中でも、辺の長さまで ぜんぶ 同じ 特別な形だよ。",
        job_title:"正方形 わかった！",
        job_desc:"角が ぜんぶ直角、辺も ぜんぶ 等しい 四角形は『正方形』。長方形と ひし形、両方の とくちょうを 持っている、とくべつな形だよ。" },

      { q:"正方形は、長方形の 仲間と いえる？",
        a:["いえる（正方形は 特別な長方形）","いえない（ぜんぜん別の形）","場合による","わからない"], c:0,
        hint:"長方形の じょうけんは『角が ぜんぶ 直角』。正方形も この じょうけんに あてはまるかな？",
        job_title:"仲間の かんけい 発見！",
        job_desc:"正方形は『角が ぜんぶ直角』という 長方形の じょうけんを 満たしているから、長方形の 仲間（特別な長方形）と いえるよ。ひし形の 仲間でも あるんだ。" },

      { q:"4つの角が ぜんぶ 直角の 四角形を 何という？ かん字とひらがなで。",
        type:"text_input", correct_answers:["長方形","ちょうほうけい"],
        hint:"教室の 黒板の 形だよ。",
        rescue_hint:"角が ぜんぶ直角の 四角形は『長方形』だよ。",
        job_title:"四角形 マスター！",
        job_desc:"角が ぜんぶ直角なら『長方形』。そこに 辺の長さも ぜんぶ 等しいという じょうけんが 加わると『正方形』に なるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『ひし形は 辺の長さが ぜんぶ 同じだから、正方形と 同じだね！』<br>これ、正しいかな？" } ],
        a:["正しくない（正方形は 角も ぜんぶ直角、という じょうけんも いる）","正しい（同じ形）","わからない","ひし形の ほうが 大きい"], c:0,
        hint:"正方形の じょうけんは『辺』だけじゃ ないよ。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ひし形の じょうけんは『辺の長さが ぜんぶ 等しい』だけ。正方形は そこに『角が ぜんぶ 直角』も 必要。だから 正方形は ひし形の 中の、とくべつな 形なんだ。" }
    ],

    "算数/図形/taikakusen01": [
      { q:"四角形で、となりあわない 頂点（かど）どうしを むすんだ 線を 何という？",
        a:["対角線（たいかくせん）","辺（へん）","高さ","中心線"], c:0,
        hint:"『対角』は『向かい合う かど』という意味だよ。",
        speech_text:"となりあわない かどを むすぶ線は？",
        job_title:"対角線 はじめの一歩！",
        job_desc:"四角形の、となりあわない頂点（かど）どうしを むすぶ線を『対角線』というよ。四角形には 対角線が 2本 引けるね。" },

      { q:"平行四辺形（長方形・ひし形・正方形もふくむ）の 2本の対角線は、どんな交わり方をする？",
        a:["真ん中の点で 交わる（二等分する）","はしっこで 交わる","交わらない","いつも 直角に 交わる"], c:0,
        hint:"『平行四辺形の 仲間』なら いつも 同じ 交わり方に なるよ。",
        job_title:"二等分の きまり！",
        job_desc:"平行四辺形（長方形・ひし形・正方形もふくむ）の対角線は、いつも 真ん中の点で 交わる（＝おたがいを 二等分する）よ。" },

      { q:"下の図を 見てね。対角線が 交わる ところに、小さい四角の しるしが あるよ。この四角形は？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);var cx=canvas.width/2,cy=canvas.height/2;var pts=[[cx,cy-70],[cx+55,cy],[cx,cy+70],[cx-55,cy]];ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<4;i++){ctx.lineTo(pts[i][0],pts[i][1]);}ctx.closePath();ctx.fillStyle='#eaddf7';ctx.fill();ctx.strokeStyle='#8a5cf0';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#ff7fc4';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.stroke();ctx.beginPath();ctx.moveTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[3][0],pts[3][1]);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#1d4ed8';ctx.lineWidth=2;ctx.strokeRect(cx-7,cy-7,14,14);",
        a:["ひし形","台形","長方形","ただの四角形"], c:0,
        hint:"対角線が 垂直に 交わる 四角形は、辺の長さにも 特ちょうが あるよ。",
        job_title:"垂直な 対角線 発見！",
        job_desc:"対角線が 垂直に 交わるのは『ひし形』（正方形も ふくむ）の 特ちょう。辺の長さが ぜんぶ 等しいことと つながっているんだ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『長方形の対角線を 2本 引いて、長さを はかったら 同じだったよ！』<br>この じっけんは <b>なにを たしかめたい</b>のかな？" } ],
        a:["長方形の対角線は 長さが同じに なる、と たしかめたい","定規で 長さが はかれるか たしかめたい","色が 同じか たしかめたい","四角形が 書けるか たしかめたい"], c:0,
        hint:"『長さを はかって くらべる』が ポイントだね。",
        speech_text:"このじっけんの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『長方形の対角線は 長さが 同じになる』と 実験で たしかめること。ひし形は 長さがちがうけど 垂直、長方形は 垂直じゃないけど 長さが同じ。四角形ごとに ちがう対角線の せいしつが あるんだね。" },

      { q:"1組の辺だけが 平行な（平行四辺形の仲間じゃない）四角形では、対角線は 真ん中で 交わらないことが 多いです。この 四角形を 何という？",
        type:"text_input", correct_answers:["台形","だいけい"],
        hint:"1組の辺だけが 平行な 四角形だよ。",
        rescue_hint:"1組だけ平行な四角形は『台形』。台形は 対角線が 二等分しないことが 多いよ。",
        job_title:"四角形の 対角線 マスター！",
        job_desc:"対角線を 調べると、二等分するか・長さが同じか・垂直に交わるかで、四角形の 仲間が わかる。台形・平行四辺形・ひし形・長方形・正方形、それぞれ ちがう対角線の せいしつを 持っているんだね！" },

      { q:"正方形の 対角線は、交わる ところで どんな 交わり方に なる？",
        a:["垂直（90度）に交わり、長さも 等しい","平行に なる","交わらない","いつも 45度で 交わる"], c:0,
        hint:"正方形は 長方形の 仲間でも、ひし形の 仲間でも あったね。",
        job_title:"正方形の対角線 発見！",
        job_desc:"正方形は 長方形(長さが等しい)と ひし形(垂直)の 両方の せいしつを 持つから、対角線は 垂直に交わり、長さも 等しいんだ。" },

      { q:"台形の対角線は、長方形や 平行四辺形の 対角線と くらべて、どんな特ちょうが ある？",
        a:["真ん中で 二等分しないことが 多い","かならず 垂直に交わる","かならず 長さが等しい","対角線が 引けない"], c:0,
        hint:"台形は 1組の辺しか 平行じゃ ないね。",
        job_title:"台形の対角線 発見！",
        job_desc:"台形は 平行四辺形の 仲間じゃないから、対角線は ふつう 真ん中で 二等分しない。四角形の 種類ごとに、対角線の せいしつが ちがうんだ。" },

      { q:"対角線の長さが 等しく、しかも 真ん中で 二等分する 四角形を 何という？ 代表的な形を かん字で。",
        type:"text_input", correct_answers:["長方形","正方形"],
        hint:"ひし形とは ちがって、対角線の長さが 同じに なる 四角形だよ。",
        rescue_hint:"対角線の長さが 等しい 四角形の 代表は『長方形』（正方形も 仲間）だよ。",
        job_title:"対角線の性質 マスター！",
        job_desc:"長方形（正方形も ふくむ）の 対角線は、長さが 等しく、真ん中で 二等分するよ。ひし形は 長さは ちがうけど 垂直に交わる、という ちがいが あるね。" },

      { q:"ひし形と 長方形、どちらも 対角線が 真ん中で 二等分されます。ちがいは どこ？",
        a:["ひし形は 垂直に交わるが 長さは ふつう違う、長方形は 垂直じゃないが 長さが等しい","どちらも 全く 同じ","ひし形には 対角線が ない","長方形には 対角線が ない"], c:0,
        hint:"ひし形は『辺が同じ』、長方形は『角が直角』という もとの じょうけんの ちがいを 思い出そう。",
        job_title:"対角線で 見分けた！",
        job_desc:"ひし形の対角線は 垂直に交わり、長方形の対角線は 長さが等しい。もとの 四角形の じょうけんが、対角線の せいしつにも つながって いるんだね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『対角線を 調べれば、四角形の 種類が わかる』これって 本当かな？" } ],
        a:["本当。二等分するか・垂直か・長さが同じかで 見分けられる","うそ。対角線は 種類に 関係ない","四角形には 対角線が 引けない","色でしか わからない"], c:0,
        hint:"台形・平行四辺形・ひし形・長方形・正方形、それぞれ ちがう対角線の せいしつが あったね。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"対角線が 二等分するか、垂直に交わるか、長さが等しいか、を 調べると、四角形の 種類を 見分ける ヒントに なるよ。図形は 辺だけでなく、対角線からも 読みとけるんだ。" }
    ],

    "算数/図形/sankaku_bunrui01": [
      { q:"3つの辺の長さが すべて 等しい 三角形を 何という？",
        a:["正三角形（せいさんかくけい）","二等辺三角形","直角三角形","ふつうの三角形"], c:0,
        hint:"『正』は『ぜんぶ 同じ』という意味だよ。",
        speech_text:"3辺が ぜんぶ 同じ さんかくけいは？",
        job_title:"正三角形 はじめの一歩！",
        job_desc:"3つの辺の長さが すべて 等しい 三角形は『正三角形』。3つの角も みんな 60度で 同じだよ。" },

      { q:"2つの辺の長さが 等しい 三角形を 何という？",
        a:["二等辺三角形（にとうへんさんかくけい）","正三角形","直角三角形","台形"], c:0,
        hint:"『二等辺』は『2つの辺が 等しい』という意味だよ。",
        job_title:"二等辺三角形 わかった！",
        job_desc:"2つの辺の長さが 等しい 三角形は『二等辺三角形』。2つの角の大きさも 等しくなるよ。" },

      { q:"下の図を 見てね。かどに 小さい四角の しるしが ついているよ。この三角形は？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);var cx=canvas.width/2,cy=canvas.height/2+40;ctx.strokeStyle='#8a5cf0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-70,cy);ctx.lineTo(cx+50,cy);ctx.lineTo(cx-70,cy-90);ctx.closePath();ctx.fillStyle='#eaddf7';ctx.fill();ctx.stroke();ctx.strokeStyle='#1d4ed8';ctx.lineWidth=2;ctx.strokeRect(cx-70,cy-14,14,14);",
        a:["直角三角形","正三角形","二等辺三角形","ふつうの三角形"], c:0,
        hint:"かどに ついている 小さい四角の しるしは 90度の めじるしだよ。",
        job_title:"直角三角形 発見！",
        job_desc:"かどの1つが ちょうど90度の 三角形は『直角三角形』。三角定規にも この形が あるね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『この三角形、辺の長さを2つ はかったら 同じだったよ！ じゃあ 二等辺三角形だね！』<br>でも 社長、<b>のこり1つの辺</b>は はからなくて いいのかな？" } ],
        a:["のこりの1辺も くらべて、ちょうど2辺だけが 等しいか たしかめる","色を たしかめる","角の数を 数える","なにも たしかめなくて いい"], c:0,
        hint:"2つの辺だけじゃなく、ぜんぶの辺の関係を 見ると もっと 正確に わかるよ。",
        speech_text:"ほかにも たしかめることは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"2辺が 等しいのを 見つけたら、もう1辺も くらべてみよう。もし3辺とも 等しければ、それは 二等辺三角形じゃなくて『正三角形』。ちゃんと 確かめる力が だいじだよ。" },

      { q:"かどの1つが ちょうど90度の 三角形を 何という？ 漢字とひらがなで。",
        type:"text_input", correct_answers:["直角三角形","ちょっかくさんかくけい"],
        hint:"『直角』は 90度の こと。",
        rescue_hint:"90度のかどが ある三角形は『直角三角形』だよ。",
        job_title:"三角形の 仲間分け マスター！",
        job_desc:"正三角形・二等辺三角形・直角三角形。辺の長さと 角の大きさで、三角形も いろんな 仲間に 分けられるんだね！" },

      { q:"正三角形の 3つの角は、それぞれ 何度？",
        a:["60度","90度","45度","30度"], c:0,
        hint:"内角の和180度を 3つの 同じ角に 分けるよ。180÷3。",
        job_title:"正三角形の角 発見！",
        job_desc:"正三角形は 3辺とも 等しいので、3つの角も みんな 等しい。180÷3＝60度ずつ に なるよ。" },

      { q:"正三角形は、二等辺三角形の 仲間と いえる？",
        a:["いえる（3辺とも等しいので、2辺が等しいという条件も 満たす）","いえない（別の形）","場合による","わからない"], c:0,
        hint:"二等辺三角形の じょうけんは『2つの辺が 等しい』。正三角形は 3つとも 等しいから…？",
        job_title:"仲間の かんけい 発見！",
        job_desc:"二等辺三角形の じょうけんは『2辺が等しい』。正三角形は 3辺とも 等しいから、この じょうけんも 満たしている。だから 正三角形は 二等辺三角形の 仲間（特別な形）と いえるよ。" },

      { q:"直角三角形で、直角(90度)の かど 以外の 2つの角を たすと 何度に なる？",
        a:["90度","180度","60度","45度"], c:0,
        hint:"三角形の内角の和は180度。180−90。",
        job_title:"直角三角形の角 マスター！",
        job_desc:"三角形の内角の和は いつも180度。1つが90度なら、のこりの2つを たすと 180−90＝90度に なるね。" },

      { q:"3つの辺の長さが すべて 等しい 三角形を 何という？ かん字で。",
        type:"text_input", correct_answers:["正三角形"],
        hint:"『せい○○○けい』。",
        rescue_hint:"3辺とも 等しい 三角形は『正三角形』だよ。",
        job_title:"三角形の名前 マスター！",
        job_desc:"3辺とも 等しいのが『正三角形』、2辺だけ 等しいのが『二等辺三角形』。角の数え方や 辺の見方で、いろんな 仲間分けが できるね。" },

      { q:"3つの辺の長さが ぜんぶ ちがう 三角形を、辺の長さの ちがいから 何という？",
        a:["ふつうの三角形（不等辺三角形）","正三角形","二等辺三角形","直角三角形"], c:0,
        hint:"辺の長さが みんな ちがうんだ。",
        job_title:"不等辺三角形も おぼえた！",
        job_desc:"辺の長さが ぜんぶ ちがう 三角形は『不等辺三角形（ふとうへんさんかくけい）』とも いうよ。正三角形・二等辺三角形・不等辺三角形、辺の長さで 分けられるんだね。" }
    ],

    "算数/図形/naikaku_wa01": [
      { q:"三角形の 3つの角を ぜんぶ たすと、何度に なる？",
        a:["180度","90度","360度","270度"], c:0,
        hint:"どんな形の三角形でも 同じ 答えに なるよ。",
        speech_text:"さんかくけいの ないかくの わは？",
        job_title:"内角の和 はじめの一歩！",
        job_desc:"三角形の 3つの角（内角）を たすと、いつも『180度』に なるよ。これを『内角の和』というよ。" },

      { q:"三角形の 角Aが 70度、角Bが 50度の とき、角Cは 何度？",
        a:["60度","70度","50度","120度"], c:0,
        hint:"180から、70と50を ひいてみよう。",
        job_title:"のこりの角も バッチリ！",
        job_desc:"180−70−50＝60。内角の和が 180度だから、2つの角が わかれば のこりの角も 計算で 出せるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『すごく とがった三角形と、ぺたんこに ひらいた三角形。形が ぜんぜん ちがうから、内角の和も ちがうよね？』<br>社長は どう思う？" } ],
        a:["どんな形の三角形でも、内角の和は いつも180度で 変わらない","とがった三角形は 内角の和が 大きくなる","ひらいた三角形は 内角の和が 小さくなる","形によって 内角の和は かわる"], c:0,
        hint:"三角形なら、形が どんなに ちがっても 同じ きまりが なりたつよ。",
        speech_text:"ないかくのわは かわるかな？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"形が どんなに かわっても、三角形である かぎり 内角の和は 180度の まま。この きまりは とても大事で、四角形や 多角形の 内角の和を 考える もとにも なるんだよ。" },

      { q:"三角形の 角A＝80度、角B＝60度の とき、角Cは 何度？ 数字で。",
        type:"text_input", correct_answers:["40","40度"],
        hint:"180−80−60。",
        rescue_hint:"180−80＝100。100−60＝40。だから 角Cは 40度。",
        job_title:"角の計算 マスター！",
        job_desc:"180−80−60＝40。内角の和180度を つかえば、わからない角も ひき算で 出せるね。" },

      { q:"四角形は、対角線で 三角形2つに 分けられます。四角形の 内角の和は 何度に なる？",
        a:["360度","180度","270度","90度"], c:0,
        hint:"三角形1つ分（180度）が 2つ ぶんだよ。",
        job_title:"四角形にも つながった！",
        job_desc:"四角形は 対角線で 三角形2つに 分けられるから、内角の和は 180×2＝360度。三角形の きまりが、四角形の 理解にも つながっていくんだね！" },

      { q:"三角形の 角Aが 45度、角Bが 45度の とき、角Cは 何度？",
        a:["90度","45度","135度","180度"], c:0,
        hint:"180−45−45。",
        job_title:"直角二等辺三角形 発見！",
        job_desc:"180−45−45＝90。角Cは 直角(90度)に なるね。このような 三角形を『直角二等辺三角形』と いうよ。" },

      { q:"正三角形の 1つの角は 何度？",
        a:["60度","90度","45度","180度"], c:0,
        hint:"180度を 3つに 同じ大きさで 分けるよ。180÷3。",
        job_title:"内角の和から 正三角形へ！",
        job_desc:"180÷3＝60。正三角形は 3つの角が みんな 等しいから、内角の和180度を 3等分した 60度ずつに なるよ。" },

      { q:"三角形の 角A＝100度、角B＝35度の とき、角Cは 何度？ 数字で。",
        type:"text_input", correct_answers:["45","45度"],
        hint:"180−100−35。",
        rescue_hint:"180−100＝80。80−35＝45。だから 角Cは 45度。",
        job_title:"角の計算 バッチリ！",
        job_desc:"180−100−35＝45。角が どんな大きさでも、内角の和180度から 2つを ひけば のこりが 出せるね。" },

      { q:"五角形（ごかくけい）は、対角線を引くと 三角形3つに 分けられます。五角形の 内角の和は 何度？",
        a:["540度","360度","180度","720度"], c:0,
        hint:"三角形1つぶん(180度)が 3つ ある よ。180×3。",
        job_title:"五角形にも つながった！",
        job_desc:"五角形は 三角形3つに 分けられるから、内角の和は 180×3＝540度。四角形(360度)、五角形(540度)…と、角が増えるほど 内角の和も 増えて いくんだ。" },

      { q:"三角形の 内角の和が 180度だと わかっていれば、四角形や 五角形の 内角の和も 求められる。なぜかな？",
        a:["対角線で いくつかの三角形に 分けて、180度を たせば いいから","偶然 同じ答えに なるから","角の数だけ 180を かければ いいから","わからない"], c:0,
        hint:"四角形は 三角形2つ、五角形は 三角形3つに 分けられたね。",
        job_title:"つながりを 見ぬいた！",
        job_desc:"どんな 多角形も、対角線で 三角形に 分けられる。三角形1つの内角の和180度が わかっていれば、分けた 三角形の数ぶん 180度を たせば、多角形ぜんぶの 内角の和が わかるんだ。" }
    ],

    "算数/図形/nakama_sagashi01": [
      { q:"正三角形と 正方形に 共通する とくちょうは どれ？",
        a:["辺の長さが ぜんぶ 等しい","かどが ぜんぶ 直角","辺が 平行","色が 同じ"], c:0,
        hint:"『正』という字が つく形は、辺の長さに 共通の きまりが あるよ。",
        job_title:"仲間さがし はじめの一歩！",
        job_desc:"正三角形も 正方形も、辺の長さが ぜんぶ 等しい。『正』の つく形の 共通点だね。" },

      { q:"三角形には ぜったいに ない、四角形（台形・平行四辺形など）だけの とくちょうは どれ？",
        a:["平行な 辺の 組み合わせ","まっすぐな 辺","かど","色を ぬれること"], c:0,
        hint:"三角形は 3つの辺しか ないから、辺どうしが 平行に なることは ないんだ。",
        job_title:"三角形と四角形の ちがい 発見！",
        job_desc:"三角形は 3辺しかないので、辺どうしが 平行には ならない。平行な辺は 四角形（台形以上）ならでは の とくちょうだよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『直角三角形と 長方形、どっちも 直角が あるね！ 仲間だ！』<br>この2つの形、ほかにも 仲間って いえる ところが あるかな？" } ],
        a:["どちらも『90度のかどがある』という仲間わけが できる","色が 同じ","大きさが 同じ","名前が にている"], c:0,
        hint:"『どんな とくちょうで 仲間分けするか』が だいじだよ。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"直角三角形と 長方形は、形はちがっても『直角がある』という とくちょうでは 仲間。図形は 辺の長さ・角の大きさ・平行かどうかで、いろんな 仲間分けが できるんだ。" },

      { q:"辺の長さが ぜんぶ 等しい 四角形を 何という？ 漢字とひらがなで。",
        type:"text_input", correct_answers:["ひし形","ひしがた"],
        hint:"トランプの ◆マークの 形だよ。",
        rescue_hint:"辺の長さが 全部同じ 四角形は『ひし形』だよ。",
        job_title:"仲間さがし マスター！",
        job_desc:"三角形も 四角形も、辺の長さ・角の大きさ・平行かどうかで 仲間分けできる。この後の 仲間さがしラボで、じっさいに 形を なかま分け してみよう！" },

      { q:"正方形と 長方形に 共通する とくちょうは どれ？",
        a:["かどが ぜんぶ 直角","辺の長さが ぜんぶ 等しい","対角線が 垂直に交わる","色が 同じ"], c:0,
        hint:"どちらも 教室で よく 見る 形だね。",
        job_title:"正方形と長方形の仲間 発見！",
        job_desc:"正方形も 長方形も、かどは ぜんぶ 直角。辺の長さが ぜんぶ 等しいのは 正方形だけの とくちょうだよ。" },

      { q:"二等辺三角形と ひし形に 共通する とくちょうは どれ？",
        a:["どちらも 長さの等しい辺が ある","かどが ぜんぶ直角","辺が ぜんぶ 平行","角の数が 同じ"], c:0,
        hint:"名前に『等しい』という いみが 入っている 形は どっちも…？",
        job_title:"三角形と四角形の仲間 発見！",
        job_desc:"二等辺三角形は 2辺が等しく、ひし形は 4辺ぜんぶが 等しい。形は ちがうけど『長さの等しい辺が ある』という点は 共通だね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[ { name:"ニコ", icon:"🦄", msg:"『台形と 平行四辺形、どっちも 4本の辺が あるから 仲間だね！』<br>この考え方を、もっと くわしく 仲間分けするには、どうしたら いいかな？" } ],
        a:["平行な辺が 1組か 2組かで さらに 分けられる","色で 分ければ いい","大きさで 分ければ いい","なにも しなくて いい"], c:0,
        hint:"台形と 平行四辺形の ちがいは、平行な辺の 組の数だったね。",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"『4本の辺が ある』という 大きな 仲間分けの 中でも、平行な辺が 1組だけか 2組ともか、辺の長さは どうかで、台形・平行四辺形・ひし形・長方形・正方形と、もっと くわしく 仲間分けが できるんだ。" },

      { q:"かどが ぜんぶ 直角で、辺の長さも ぜんぶ 等しい 四角形を 何という？ かん字で。",
        type:"text_input", correct_answers:["正方形"],
        hint:"長方形と ひし形、両方の とくちょうを 持つ 形だよ。",
        rescue_hint:"角も辺も ぜんぶ そろっている 四角形は『正方形』だよ。",
        job_title:"仲間さがし マスター！",
        job_desc:"正方形は 長方形の仲間(角が直角)でも、ひし形の仲間(辺が等しい)でも ある、とくべつな 四角形。図形の 仲間分けは、いくつもの とくちょうを 組み合わせて 考えるんだね！" }
    ],

    "算数/小数/shosu01": [
      { q:"「1」を 10こに 同じ大きさに 分けた 1つ分の 数を 何という？",
        a:["0.1","0.01","10","0.2"], c:0,
        hint:"1より 小さい 数だよ。ゼロ てん…？",
        speech_text:"いちを じゅっこに わけた ひとつぶんは？",
        job_title:"小数の はじまり！",
        job_desc:"「1」を 10等分（とうぶん）した 1つ分は「0.1」。これより さらに 10等分すると「0.01」になるよ。" },

      { q:"0.01 を 34こ あつめた 数は いくつ？",
        a:["0.34","3.4","34","0.034"], c:0,
        hint:"0.01が 10こで 0.1。30こで 0.3 になるよ。",
        job_title:"位（くらい）が わかった！",
        job_desc:"0.01 が 34こ で「0.34」。\n右から 小数第二位、小数第一位 と よぶんだよ。" },

      { q:"下の メモリを 見てね。赤い 矢じるしが さしている メモリは いくつ？",
        canvas_code:"ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#4a3b52';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,80);ctx.lineTo(440,80);ctx.stroke();for(var i=0;i<=10;i++){var x=40+i*40;ctx.beginPath();ctx.moveTo(x,80);ctx.lineTo(x,i%5===0?60:70);ctx.stroke();if(i===0){ctx.fillStyle='#4a3b52';ctx.font='16px sans-serif';ctx.fillText('0',35,50);}if(i===10){ctx.fillText('0.1',x-12,50);}}ctx.fillStyle='#ef4444';ctx.beginPath();ctx.moveTo(40+4*40,95);ctx.lineTo(40+4*40+10,110);ctx.lineTo(40+4*40-10,110);ctx.fill();ctx.font='bold 16px sans-serif';ctx.fillText('ここ',40+4*40-16,128);",
        a:["0.04","0.4","4","0.004"], c:0,
        hint:"0から 0.1までの 間が、10こに 分かれているね。1メモリは 0.01 だよ。",
        job_title:"メモリの 達人！",
        job_desc:"0 と 0.1 の間を 10等分しているから、1メモリは「0.01」。矢じるしは 4メモリ目だから「0.04」だね！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「2.4 ＋ 1.35 を 筆算（ひっさん）で ときましょう」って もんだいが出たよ！" },
          { name:"ニコ", icon:"🦄", msg:"小数の 筆算って、<b>なにに 気をつけて 計算できるか</b> を たしかめたいのかな？" }
        ],
        a:["小数点の 位置（位）を たてに そろえて 計算できるか","たし算が はやく できるか","大きな 数が 読めるか","定規を つかえるか"], c:0,
        hint:"2.4 と 1.35。そのまま 右を そろえちゃうと まちがえるよ！",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"小数の 筆算の 一番の ねらいは「小数点の 位置（位）を たてに そろえる」こと！右の はしを そろえるんじゃなくて、点が おなじ 縦の列に くるように 書こう。" },

      { q:"【計算に ちょうせん！】\n3 − 1.2 ＝ ？\n（半角の 数字と ピリオドで 答えてね）",
        type:"text_input", correct_answers:["1.8"],
        hint:"3 は「3.0」と 同じだよ。3.0 − 1.2 を 筆算で 考えてみよう。",
        rescue_hint:"3.0 − 1.2。0から2は 引けないから、3から 借りてきて 10−2＝8。残った 2−1＝1。あわせて…？",
        job_title:"小数計算 マスター！",
        job_desc:"3 − 1.2 ＝ 1.8。\n整数の「3」には、見えない「.0」が かくれているよ。位を そろえて 引くのが ポイントだね！" },

      { q:"0.1 を 7こ あつめた 数は？",
        a:["0.7","7","0.07","70"], c:0,
        hint:"0.1が 7こで、0.7。",
        job_title:"小数の たし算 発見！",
        job_desc:"0.1を 7こ あつめると 0.7。0.1が いくつ あるかを 数える 見方だね。" },

      { q:"2.6 は、0.1を 何こ あつめた 数？ 数字で。",
        type:"text_input", correct_answers:["26","26こ"],
        hint:"2.6＝2＋0.6。2は 0.1が20こ、0.6は 0.1が6こ。",
        rescue_hint:"2.6は 0.1が 26こ。20＋6＝26。",
        job_title:"小数の位 マスター！",
        job_desc:"2.6は 0.1が 26こ ぶん。小数も 整数と 同じように、いくつ あつまって できているか 考えられるよ。" },

      { q:"1.45 の、小数第二位の 数字は？",
        a:["5","4","1","0"], c:0,
        hint:"1.45 → 1(一の位).4(第一位).5(第二位)。",
        job_title:"位の名前 バッチリ！",
        job_desc:"1.45の 小数第二位は『5』。小数点の すぐ右が 第一位、その次が 第二位だよ。" },

      { q:"3.7 ＋ 2.6 の 答えは いくつ？",
        a:["6.3","5.13","63","6.13"], c:0,
        hint:"筆算で、小数点を たてに そろえて 計算しよう。",
        job_title:"小数のたし算 マスター！",
        job_desc:"3.7＋2.6＝6.3。小数点を たてに そろえて 計算すれば、整数の たし算と 同じ やり方で できるね。" },

      { q:"『0.7 と 0.70 は、大きさが 同じ？』",
        a:["同じ（右はしの0は 大きさを かえない）","0.70の ほうが 大きい","0.7の ほうが 大きい","くらべられない"], c:0,
        hint:"0.70 は 0.1が 7こと、0.01が 0こ。0.7と 同じ 大きさだね。",
        job_title:"🎯 小数の見方 マスター！",
        job_desc:"0.7も 0.70も、大きさは 同じ。いちばん右に 0を つけたり けずったり しても、小数の 大きさは かわらないんだ。" }
    ],

    "理科/星/hoshi01": [
      { q:"月は、空の どの方角から のぼってきて、どの方角へ しずんでいく？",
        a:["東から のぼって、西へ しずむ","西から のぼって、東へ しずむ","北から のぼって、南へ しずむ","ずっと 動かない"], c:0,
        hint:"太陽（たいよう）と 同じ 動き方をするよ。",
        speech_text:"つきは どこから のぼる？",
        job_title:"月の 動き わかった！",
        job_desc:"月も 太陽と同じように、東の 空から のぼって、南の 空を 通り、西の 空へ 沈んでいくよ。地球が 回っているから そう見えるんだ。" },

      { q:"夏の夜空で 明るくかがやく 3つの星を 結んだものを「夏の大三角」といいます。\nこの 3つの星座の なかまじゃないのは どれ？",
        a:["オリオン座","はくちょう座","こと座","わし座"], c:0,
        hint:"オリオン座は、冬の 星座だよ。",
        job_title:"星座 はっけん！",
        job_desc:"夏の大三角は、「はくちょう座（デネブ）」「こと座（ベガ＝織姫）」「わし座（アルタイル＝彦星）」の 3つで作られるよ。オリオン座は 冬の星座だね。" },

      { q:"下の 図は「夏の大三角」です。天の川を はさんで いる 2つの星は、七夕（たなばた）の 織姫（おりひめ）と 彦星（ひこぼし）です。\nいちばん 遠くにある 左上の 星の 星座は なに？",
        canvas_code:"ctx.fillStyle='#1b1230';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(120,30);ctx.lineTo(260,100);ctx.lineTo(170,110);ctx.closePath();ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(120,30,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(260,100,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(170,110,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eaddf7';ctx.font='12px sans-serif';ctx.fillText('?',110,20);ctx.fillText('ベガ(織姫)',140,125);ctx.fillText('アルタイル(彦星)',270,105);",
        a:["はくちょう座（デネブ）","こと座（ベガ）","わし座（アルタイル）","カシオペア座"], c:0,
        hint:"七夕の 2人を 見守っているような 場所にある、鳥の なまえの 星座だよ。",
        job_title:"夏の大三角 マスター！",
        job_desc:"夏の大三角は、織姫（ベガ）・彦星（アルタイル）と、はくちょう座の「デネブ」で できているよ！天の川に 沿って 飛んでいるように 見えるんだ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「同じ木や 建物を めじるしにして、夜の 7時と 9時に 月の場所を 観察（かんさつ）しよう」って 先生が言ってたよ！" }
        ],
        a:["時間が たつと、月が 空を どう動くかを たしかめたい","月が 大きくなるかを たしかめたい","木が 育つかを たしかめたい","暗やみに なれるか たしかめたい"], c:0,
        hint:"めじるし がないと、動いたか どうか 分かりにくいよね。",
        speech_text:"この 観察の ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"「時間が たつと、月が どの向きに 動くか」を 確かめるための 観察だよ！景色（めじるし）と一緒に 記録すると、動いたことが はっきり 分かるんだ。" },

      { q:"月が 明るく 光って 見えるのは、宇宙の ある星の 光を はんしゃ しているからです。\nその 星のなまえを 漢字2文字で 書いてね。（〇〇の 光）",
        type:"text_input", correct_answers:["太陽","たいよう"],
        hint:"お昼に 出ている、いちばん あつい星だよ。",
        rescue_hint:"た〇〇う。漢字で書くと「太陽」だよ。",
        job_title:"宇宙の ふしぎ 発見！",
        job_desc:"月は 自分で 光っているわけではなく、「太陽（たいよう）」の 光を はんしゃして 光って見えるんだ。太陽と 月の 位置で、三日月や 満月に 形が かわって見えるよ。" },

      { q:"冬の夜空に かがやく 有名な 星座で、真ん中に 星が 3つ ならんでいる くびれた形の 星座は なに？",
        a:["オリオン座","はくちょう座","さそり座","ペガスス座"], c:0,
        hint:"冬の 夜空で いちばん 見つけやすい 星座だよ。",
        job_title:"オリオン座 はっけん！",
        job_desc:"真ん中に 3つの星が ならぶ『オリオン座』は、冬を 代表する とても 明るい 星座だよ！" },

      { q:"北の空に見える、アルファベットの「W」や「M」の形をした 有名な 星座は なに？",
        a:["カシオペヤ座（カシオペア座）","オリオン座","北斗七星","こと座"], c:0,
        hint:"アルファベットの W の形を 思い浮かべてみよう。",
        job_title:"カシオペヤ座 マスター！",
        job_desc:"北の空で Wの形に ならぶ『カシオペヤ座』は、北極星（ほっきょくせい）を さがす めじるしに なるんだよ。" },

      { q:"下の 図は、地球から 見える 月の形です。\nまんまるに かがやく「満月（まんげつ）」のとき、太陽と 月の位置関係は どうなっている？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#0f0c1b';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*0.3,h*0.5,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd700';ctx.font='bold 14px sans-serif';ctx.fillText('満月',w*0.3-14,h*0.88);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*0.7,h*0.5,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0f0c1b';ctx.beginPath();ctx.arc(w*0.7-10,h*0.5,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd700';ctx.fillText('三日月',w*0.7-20,h*0.88);",
        a:["地球から見て、太陽と 反対側に 月があるとき","太陽と 月が 同じ方向にあるとき","月が 太陽のかげに かくれたとき","地球の うしろに 太陽があるとき"], c:0,
        hint:"太陽の光を 正面から いっぱいに うけて 光るよ。",
        job_title:"満月の しくみ 発見！",
        job_desc:"太陽からの 光を まともに 受ける 位置（太陽—地球—月）に きたとき、地球から 丸い満月として 見えるんだよ。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「昼間（ひるま）は 星が 見えないけど、星たちは おやすみ中なのかな？」" }
        ],
        a:["太陽の光が 明るすぎて 見えないだけで、昼も 空に あるんだよ！","昼は 宇宙の はてへ 引っこしているよ","昼は 星の 電気（あかり）が 消えているよ","本当は 夜しか 存在しないよ"], c:0,
        hint:"部屋の 電気をつけていると、遠くの 小さい光が 見えなくなるのと 同じだよ。",
        speech_text:"ニコに 昼の星の ふしぎを おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"星は 昼間も ずっと 空にあるんだよ！太陽の光が すごく 明るいから、星の光が かき消されて 見えなくなっているだけなんだね。" },

      { q:"夜空の 星や 月は、時間が たつと 東の空から どちらの 方角へ 動いていく？ 漢字1文字で 書いてね。",
        type:"text_input", correct_answers:["西","にし"],
        hint:"太陽が 沈む 方角と同じだよ。『にし』。",
        rescue_hint:"『にし』。漢字で書くと『西』だよ。",
        job_title:"星の動き マスター！",
        job_desc:"星や 月も 太陽と 同じように、東から『西』へ 動いていくよ！" }
    ],

    "理科/季節と生き物/kisetsu01": [
      { q:"サクラの花が さきはじめて、南の国から ツバメが やってきて 巣（す）をつくり始めるのは、どの 季節？",
        a:["春","夏","秋","冬"], c:0,
        hint:"入学式や 花見の ころを 思い出してみよう。",
        speech_text:"サクラが さくのは どの季節？",
        job_title:"春の 生き物 わかった！",
        job_desc:"サクラの花が さき、ツバメが 南の国から日本に やってきて 巣づくりを 始めるのは『春』だよ。あたたかくなると 生き物の 活動も さかんに なるんだ。" },

      { q:"夏に なると、ヘチマの くきが ぐんぐん のびて 花が さき、セミの 鳴き声も よく聞こえるように なります。これは どの季節の ようす？",
        a:["夏","春","秋","冬"], c:0,
        hint:"気温が いちばん 高くなる 季節だね。",
        job_title:"夏の 生き物 バッチリ！",
        job_desc:"気温が 高くなる『夏』には、植物が ぐんぐん 育ち、セミなどの こん虫も 元気に 活動するよ。" },

      { q:"秋（9〜10月ごろ）に なると、日本で 子育てを した ツバメは どうする？",
        a:["南の あたたかい 国へ 渡っていく","冬眠（とうみん）する","巣の中で たまごを うみつづける","北の さむい国へ 行く"], c:0,
        hint:"寒くなる前に、あたたかい 場所へ 長い たびに出るよ。",
        job_title:"渡り鳥 はかせ！",
        job_desc:"ツバメは 秋になると、フィリピンや ベトナムなど 南の あたたかい国へ 渡っていくよ。春に また 日本へ もどってくるんだ。" },

      { q:"冬に なると、木々の 葉が おちて、こん虫たちの すがたも 見えなく なります。この ころ、こん虫たちは どうしている？",
        a:["たまご・よう虫・さなぎ・成虫など、いろいろな すがたで 冬を こしている","みんな 死に絶えて いなくなって いる","全員 南の 島に 引っこして いる","かわらず 元気に 空を 飛びまわって いる"], c:0,
        hint:"見えなく なっただけで、じつは ちがう すがたで 冬を すごしているよ。",
        job_title:"冬の こん虫 はっけん！",
        job_desc:"こん虫は 種類によって、たまご・よう虫・さなぎ・成虫の どれかの すがたで、寒い冬を じっと やり過ごしているんだよ。" },

      { q:"下の 図は、チョウが たまごから 育つ ようすです（①たまご→②よう虫→③さなぎ→④成虫）。\nモンシロチョウや アゲハチョウが 冬を こすときの すがたは、①〜④の どれ？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#eaf6ff';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#8b5e3c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*0.05,h*0.22);ctx.lineTo(w*0.95,h*0.22);ctx.stroke();var xs=[w*0.15,w*0.4,w*0.63,w*0.86];var labels=['①','②','③','④'];ctx.fillStyle='#8fce6a';ctx.beginPath();ctx.ellipse(xs[0],h*0.65,22,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fceec8';ctx.beginPath();ctx.arc(xs[0],h*0.6,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7fc97f';for(var s=0;s<4;s++){ctx.beginPath();ctx.arc(xs[1]-24+s*16,h*0.65,9,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#8b5e3c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xs[2],h*0.22);ctx.lineTo(xs[2],h*0.4);ctx.stroke();ctx.fillStyle='#c9a86a';ctx.beginPath();ctx.ellipse(xs[2],h*0.58,12,22,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2a6c1';ctx.beginPath();ctx.moveTo(xs[3],h*0.55);ctx.lineTo(xs[3]-22,h*0.42);ctx.lineTo(xs[3]-22,h*0.68);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(xs[3],h*0.55);ctx.lineTo(xs[3]+22,h*0.42);ctx.lineTo(xs[3]+22,h*0.68);ctx.closePath();ctx.fill();ctx.fillStyle='#4a3b52';ctx.beginPath();ctx.ellipse(xs[3],h*0.55,3,14,0,0,Math.PI*2);ctx.fill();for(var i=0;i<4;i++){ctx.fillStyle='#4a3b52';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText(labels[i],xs[i],h*0.92);}",
        a:["③（さなぎ）","①（たまご）","②（よう虫）","④（成虫）"], c:0,
        hint:"えだに ぶら下がっている すがたを さがしてみよう。",
        job_title:"チョウの 冬ごし マスター！",
        job_desc:"モンシロチョウや アゲハチョウは『さなぎ』の すがたで 冬を こすよ。えだなどに くっついて、春が来るまで じっと しているんだ。" },

      { q:"カマキリが 冬を こすときの すがたは？",
        a:["たまご","よう虫","さなぎ","成虫"], c:0,
        hint:"あわのような かたまりの 中に たくさん 入っているよ。",
        job_title:"カマキリ はかせ！",
        job_desc:"カマキリは あわのような 形の『たまご』を 木の えだなどに うみつけて、その すがたで 冬を こすよ。春に なると たくさんの 赤ちゃんが 出てくるんだ。" },

      { q:"テントウムシが 冬を こすときの すがたは？",
        a:["成虫","たまご","よう虫","さなぎ"], c:0,
        hint:"石の うらなどに、あつまって いる ところを 見たことが あるかな？",
        job_title:"テントウムシ はかせ！",
        job_desc:"テントウムシは『成虫』の すがたの まま、石の うらや 落ち葉の下などに 集まって、身を よせあって 冬を こすよ。" },

      { q:"秋になって ツバメが 日本を はなれるとき、どの 方角へ 向かって 飛んでいく？ 漢字1文字で 書いてね。",
        type:"text_input", correct_answers:["南","みなみ"],
        hint:"あたたかい 方角だよ。",
        rescue_hint:"『みなみ』。漢字だと『南』だよ。",
        job_title:"方角も バッチリ！",
        job_desc:"ツバメは 秋になると『南』の あたたかい国へ 渡っていくよ。日本と 南の国を 行ったり来たり しているんだね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『サクラの 木を 春・夏・秋・冬で 同じ場所から 写真に とって、くらべてみよう』って 先生が言ってたよ！" },
          { name:"ニコ", icon:"🦄", msg:"これって いったい なにを たしかめたいのかな？" }
        ],
        a:["季節（気温）が かわると、生き物の ようすも かわることに 気づけるか","写真を じょうずに とれるか","サクラの 名前を おぼえられるか","早起きが できるか"], c:0,
        hint:"『同じ場所を 季節ごとに くらべる』が ポイントだね。",
        speech_text:"この 観察の ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『季節が かわると、気温や 生き物の ようすも かわることに 気づけるか』。同じ場所を くらべることで、へんかが よく わかるんだ。" },

      { q:"【ニコに 教えてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"社長、聞いて！ テントウムシって 冬に なると 土の中で『さなぎ』に なって、春に 成虫に なるんだよね？ ぼく そう おぼえたんだけど…" }
        ],
        a:["ちがうよ。テントウムシは『成虫』の すがたの まま、物かげに あつまって 冬を こすんだよ","そうだね、それで あってるよ","テントウムシは 冬に たまごを うむんだよ","テントウムシは 冬に なると きえて しまうんだよ"], c:0,
        hint:"さなぎで 冬を こすのは、チョウの なかまだよ。テントウムシは ちがう すがたで こすよ。",
        job_title:"先生に なれた！",
        job_desc:"テントウムシは『成虫』の すがたの まま冬を こすよ。カブトムシは よう虫、チョウは さなぎ、カマキリは たまご、と むしの 種類によって 冬の すがたが ちがうんだね。ニコに 教えられた 社長は もう バッチリ わかってるね。" },

      { q:"モンシロチョウや アゲハチョウが 冬を こすときの すがたを、かん字か ひらがなで 書いてね。",
        type:"text_input", correct_answers:["さなぎ","蛹"],
        hint:"えだに ぶら下がって いる すがただよ。",
        rescue_hint:"『さなぎ』だよ。",
        job_title:"季節と生き物 マスター！",
        job_desc:"チョウは『さなぎ』の すがたで 冬を こすよ。虫によって 冬の すごし方が ちがうことを おぼえておこう！" }
    ],

    "理科/空気と水/kuki_mizu01": [
      { q:"注射器（ちゅうしゃき）や ポリエチレンの 容器に 空気を とじこめて ピストンを おすと、空気の 大きさ（体積）は どうなる？",
        a:["小さくなる（押しちぢめられる）","大きくなる","かわらない","消えてなくなる"], c:0,
        hint:"空気は ギュッと おしちぢめる ことができるよ。",
        speech_text:"とじこめた 空気を おすと どうなる？",
        job_title:"空気の 性質 わかった！",
        job_desc:"とじこめた 空気を おすと、体積（大きさ）が 小さくなって 押しちぢめられるよ！" },

      { q:"とじこめた 空気を 強く 押しちぢめるほど、手に かんじる 押し返す 力（手ごたえ）は どうなる？",
        a:["強くなる（もとにもどろうとする）","弱くなる","かわらない","まったく なくなる"], c:0,
        hint:"空気が『もとにもどりたい！』と 押し返してくるよ。",
        job_title:"手ごたえ 実感！",
        job_desc:"空気を 強く 押しちぢめるほど、元にもどろうとする 力が 強くなって、強い『手ごたえ』を かんじるんだよ。" },

      { q:"下の 図は、注射器に「空気」を いれたときと「水」を いれたときに ピストンを おした 様子です。\n注射器に『水』を いっぱいに 入れて ピストンを おすと、水の 体積（大きさ）は どうなる？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f5fbff';ctx.fillRect(0,0,w,h);ctx.font='bold 14px sans-serif';ctx.fillStyle='#333';ctx.fillText('空気(ちぢむ)',30,25);ctx.fillText('水(ちぢまない)',w/2+30,25);ctx.strokeStyle='#34495e';ctx.lineWidth=3;ctx.strokeRect(30,45,130,40);ctx.fillStyle='#eaf2f8';ctx.fillRect(31,46,65,38);ctx.fillStyle='#bdc3c7';ctx.fillRect(95,46,20,38);ctx.fillRect(115,58,40,14);ctx.strokeRect(w/2+30,45,130,40);ctx.fillStyle='#3498db';ctx.fillRect(w/2+31,46,110,38);ctx.fillStyle='#bdc3c7';ctx.fillRect(w/2+140,46,18,38);ctx.fillRect(w/2+158,58,20,14);",
        a:["まったく かわらず、押しちぢめられない","空気と おなじくらい 小さくなる","半分くらいに 小さくなる","氷に かわる"], c:0,
        hint:"水は 空気と ちがって、どんなに 強くおしても 大きさが かわらないよ。",
        job_title:"水の 性質 はっけん！",
        job_desc:"水は どんなに 強く おしても、押しちぢめることが できない（体積が かわらない）んだよ！" },

      { q:"空気でっぽうの 前と うしろに スポンジの 玉をつめて、うしろの ピストンを おすと、前の 玉が『ポン！』と 飛び出します。なぜ 飛び出すの？",
        a:["押しちぢめられた 空気が、もとにもどろうとして 玉をおすから","水が 玉を おすから","玉が じぶんで はねるから","筒の中に 風が ふくから"], c:0,
        hint:"とじこめられた 空気が ギュッと ちぢまったあと、どうなるかな？",
        job_title:"空気でっぽうの しくみ！",
        job_desc:"とじこめられた 空気が 押しちぢめられて、もとにもどろうとする 強い力が はたらくから、玉が ポン！と 飛ぶんだね。" },

      { q:"空気でっぽうの 玉を、もっと 遠くまで 勢いよく 飛ばすには、どうすれば いい？",
        a:["玉と 玉の あいだの 空気を、大きく・強く 押しちぢめる","玉を 水で ぬらしておく","ピストンを ゆっくり 動かす","筒の 横に 穴をあける"], c:0,
        hint:"空気を たくさん 押しちぢめるほど、もとにもどる パワーが つよくなるよ。",
        job_title:"飛ばし方 マスター！",
        job_desc:"玉と 玉の あいだ（筒の中）を 長くして、空気を 大きく 強く 押しちぢめるほど、押し返す パワーが 強くなって 遠くまで 飛ぶよ！" },

      { q:"注射器の 中に「水」と「すこしの空気」を いっしょに とじこめて ピストンを おすと、ちぢむのは どちら？",
        a:["空気の 部分だけが ちぢむ","水の部分だけが ちぢむ","水も 空気も 両方ちぢむ","どちらも ちぢまない"], c:0,
        hint:"ちぢむ 性質が あるほうだけが 小さくなるよ。",
        job_title:"空気と水の 実験はかせ！",
        job_desc:"水と 空気が 一緒に 入っているとき、ちぢむのは『空気の 部分だけ』だよ。水は ちぢまないんだ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『空気でっぽうの 玉と 玉の あいだを 長くして ピストンを おすと、玉の 飛び方は どう変わるか』を 実験しているよ！" },
          { name:"ニコ", icon:"🦄", msg:"この 実験は <b>なにを たしかめたい</b>のかな？" }
        ],
        a:["空気を 大きく・強く 押しちぢめるほど、押し返す力が 強くなるかを たしかめるため","筒の 色が かわるかを たしかめるため","玉の 重さを はかるため","音が 大きくなるか たしかめるため"], c:0,
        hint:"とじこめた 空気の 量と 押しちぢめ方の 関係に 注目してみよう！",
        speech_text:"この 実験の ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『空気を 大きく・強く 押しちぢめるほど、もとにもどろうとする 押し返す力が 強くなる』と たしかめることだよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「空気も 水も、注射器に入れて おすと 同じように 小さく ちぢむのかな？」" }
        ],
        a:["空気は 小さくちぢむけれど、水は ちぢまないんだよ！","水は ちぢむけれど、空気は ちぢまないよ","どちらも まったく ちぢまないよ","どちらも 同じように ちぢむよ"], c:0,
        hint:"空気と 水の 一番の ちがいを 教えてあげよう！",
        speech_text:"ニコに 空気と水の ちがいを おしえてあげよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"空気は 押しちぢめることができる（体積が小さくなる）けれど、水は 押しちぢめることができない（体積が変わらない）んだね！" },

      { q:"とじこめた 空気を おしたときに 手に かんじる、もとにもどろうとする 押し返す 力を なんという？ ひらがな 4文字で 書いてね。",
        type:"text_input", correct_answers:["てごたえ","手ごたえ"],
        hint:"『て○たえ』。おし返す 力のことだよ。",
        rescue_hint:"『てごたえ』だよ。",
        job_title:"手ごたえ マスター！",
        job_desc:"空気を おしたときに 手に かんじる 押し返す 力を『手ごたえ』と いうよ！" },

      { q:"容器の中の 空気や 水の 大きさ（かさ）の ことを、理科では 何という？ 漢字2文字で 書いてね。",
        type:"text_input", correct_answers:["体積","たいせき"],
        hint:"『たいせき』。かさ（広がり）のことだよ。",
        rescue_hint:"『たいせき』。かん字だと『体積』だよ。",
        job_title:"理科ことば マスター！",
        job_desc:"ものの 大きさ（かさ）の ことを『体積（たいせき）』と いうよ。空気は 体積が かわるけれど、水は かかわないんだね。" }
    ],

    "理科/あたたまり方/atatamari01": [
      { q:"金属（きんぞく）の 板の かどを 熱すると、熱は どのように 伝わっていく？",
        a:["熱した ところから、順々に まわりへ 伝わっていく","全体が 一瞬で いどうする","熱したところと 反対側から 温まる","金属の中は 熱が 伝わらない"], c:0,
        hint:"熱した 場所から ちかく、遠くへと 広がっていくよ。",
        speech_text:"金属の あたたまり方は？",
        job_title:"金属の伝熱 わかった！",
        job_desc:"金属は、熱した 部分から 順々に まわりに向かって 熱が 伝わっていくよ！" },

      { q:"金属の 棒（ぼう）の 真ん中を 熱すると、熱は どのように 伝わる？",
        a:["真ん中から 両はしに向かって 順々に 温まっていく","右はしに向かってだけ 温まる","左はしに向かってだけ 温まる","はしから 真ん中に 向かって 温まる"], c:0,
        hint:"熱した 真ん中から、両側へ 広がっていくよ。",
        job_title:"金属棒の 実験せいかい！",
        job_desc:"金属の 棒の 真ん中を 熱すると、熱した 場所から 左右の両はしに向かって 順々に 熱が 伝わるんだよ。" },

      { q:"下の 図は、ビーカーに 入れた 水の 底を 熱したときの 様子です。\n水の下のほうを 熱すると、温まった 水は どこへ 動いていく？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fbfdff';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#555';ctx.lineWidth=3;ctx.strokeRect(w*0.3,h*0.15,w*0.4,h*0.65);ctx.fillStyle='#d6eaf8';ctx.fillRect(w*0.3+2,h*0.2,w*0.4-4,h*0.6);ctx.strokeStyle='#e74c3c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*0.5,h*0.75);ctx.lineTo(w*0.5,h*0.3);ctx.stroke();ctx.beginPath();ctx.moveTo(w*0.5,h*0.3);ctx.lineTo(w*0.4,h*0.4);ctx.moveTo(w*0.5,h*0.3);ctx.lineTo(w*0.6,h*0.4);ctx.stroke();ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.arc(w*0.5,h*0.85,15,0,Math.PI*2);ctx.fill();",
        a:["上へのぼっていき、全体を ぐるぐる回る","底のほうに ずっと たまっている","ビーカーの 外へ 飛び出す","下のほうだけが 温まる"], c:0,
        hint:"温まった 水は かるくなって 上へあがっていくよ。",
        job_title:"水の あたたまり方 はっけん！",
        job_desc:"水は 温まると 上へのぼっていき、冷たい水が 下へさがって、全体が ぐるぐる回って（対流して）温まるんだよ。" },

      { q:"温まった 水や 空気が 上へのぼり、冷たいものが 下へ動くことで、全体が 温まる 現象を 何という？",
        a:["対流（たいりゅう）","蒸発（じょうはつ）","反射（はんしゃ）","結露（けつろ）"], c:0,
        hint:"『対（たい）流（りゅう）』。ぐるぐる 流れ回る ことだよ。",
        job_title:"対流（たいりゅう） マスター！",
        job_desc:"温まった 部分が 移動して 全体が 温まる 現象を『対流（たいりゅう）』と いうよ！水や 空気で おこるんだ。" },

      { q:"冬に 部屋で ストーブや エアコンを つけると、あたたかい 空気は 部屋の どこに 集まりやすい？",
        a:["部屋の 上のほう","部屋の 下（ゆか）のほう","部屋の 真ん中だけに とどまる","どこにも 集まらない"], c:0,
        hint:"あたたかい 空気は、水と おなじように 上へのぼっていくよ。",
        job_title:"部屋の 空気 はっけん！",
        job_desc:"あたたかい 空気は 上へのぼる 性質があるから、部屋の『上のほう』に 集まりやすいんだ。サーキュレーターなどで 回すと 全体が 温まるよ。" },

      { q:"金属の あたたまり方と、水や 空気の あたたまり方の ちがいとして 正しいものは どれ？",
        a:["金属は 熱が 順々に伝わり、水や空気は 温まったものが 移動して 全体が温まる","水や 空気は まったく 温まらない","金属の ほうが 移動して 温まる","どちらも まったく 同じように 移動する"], c:0,
        hint:"金属そのものは 動かないけれど、水や空気は 動き回るよ。",
        job_title:"あたたまり方の ちがい マスター！",
        job_desc:"金属は『じぶん自身は 移動せず 熱が伝わる』、水や空気は『温まった もの自体が 上へ移動して 全体が温まる』という 違いがあるんだね！" },

      { q:"お風呂を わかしたとき、上の お湯が あつくて、下の お湯が ぬるいことが あるのは なぜ？",
        a:["温まった お湯が 上へのぼって 集まる 性質があるから","下のお湯が 氷に なっているから","上のほうだけに お湯を いれたから","底から 冷気が でているから"], c:0,
        hint:"温まった お湯の 移動の しくみを 思い出してみよう。",
        job_title:"お風呂の ふしぎ はっけん！",
        job_desc:"温まった お湯は 上へのぼる（対流する）から、上ばかり あつくなるんだね！よく かき混ぜてから 入るのが コツだよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『金属の 棒に ろう をぬって はしを 熱したとき、ろうが どこから 溶けるか』を 観察しているよ！" },
          { name:"ニコ", icon:"🦄", msg:"この 実験の <b>ねらいは なに</b>かな？" }
        ],
        a:["熱した 場所から 順々に 熱が 伝わっていくかを たしかめるため","ろうの においを かぐため","金属棒を 曲げるため","ろうそくを 作るため"], c:0,
        hint:"ろうが 溶けた 場所を見れば、熱が どこまで 伝わったか 分かるよね！",
        speech_text:"この 実験の ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『熱した 場所から 順々に 熱が 伝わっていく様子（伝わり方）を たしかめる』ことだよ！ろうの 溶け方で 熱の進みが 目に見えるんだ。" },

      { q:"温まった 水や 空気が 上にあがり、ぐるぐる 回って 全体が 温まる 動きを 何という？ ひらがなで 答えてね。",
        type:"text_input", correct_answers:["たいりゅう","対流"],
        hint:"『た○りゅう』。流れて めぐる 動きだよ。",
        rescue_hint:"『たいりゅう』だよ。",
        job_title:"たいりゅう マスター！",
        job_desc:"水や 空気が ぐるぐる 回って 全体が 温まる 動きを『対流（たいりゅう）』と いうよ！" },

      { q:"金属・水・空気のうち、温めても 自分自身が 動き回らずに 熱だけが 順々に 伝わっていく ものは どれ？ 漢字で 書いてね。",
        type:"text_input", correct_answers:["金属","きんぞく"],
        hint:"『きんぞく』。スプーンや フライパンなどの 材料だよ。",
        rescue_hint:"『きんぞく』。かん字だと『金属』だよ。",
        job_title:"ものの性質 マスター！",
        job_desc:"温めても 自分自身が 移動しないのは『金属（きんぞく）』だよ。水や 空気は 動いて 全体が 温まるんだね！" }
    ],

    "社会/ごみ/gomi01": [
      { q:"ごみを「もえる ごみ」「もえない ごみ」「しげん ごみ」などに 分けて 出す ことを 何と いう？",
        a:["分別（ぶんべつ）","はいしゃ","しゅうしゅう","リサイクル"], c:0,
        hint:"『わ○る』みたいに、しゅるいごとに 分ける ことだよ。",
        speech_text:"ごみを しゅるいごとに 分けることを なんという？",
        job_title:"分別（ぶんべつ） おぼえた！",
        job_desc:"ごみを しゅるいごとに 分けて 出す ことを『分別』と いうよ。町ごとに ルールが 決まって いるんだ。" },

      { q:"一度 使った ものを、また 資源（しげん）として 使える ように する ことを 何と いう？",
        a:["リサイクル","ゴミしょり","しゅうしゅう","うめたて"], c:0,
        hint:"アルミかんが また かんに なったり するよ。",
        job_title:"リサイクル マスター！",
        job_desc:"リサイクルは、一度 使った ものを もう一度 資源として 使う ことだよ。ペットボトルは 服に 生まれかわる ことも あるんだ。" },

      { q:"次のうち、『しげんごみ』として 出す ものは どれ？",
        a:["空きかん・ペットボトル","生ごみ（たべのこし）","われた ガラスの 破片","古い ふとん"], c:0,
        hint:"もう一度 資源として 使える ものを えらぼう。",
        job_title:"しげんごみ わかった！",
        job_desc:"空きかんや ペットボトルは 資源ごみ。リサイクルして 新しい ものに 生まれかわるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『ごみを 正しく 分別すると、なにが いいのかな？』<br>この もんだいは <b>なにが できると OK</b>かな？" }
        ],
        a:["ごみを 分別する ことの りゆうを 考えられるか","絵を じょうずに かけるか","計算が はやいか","じかんを はかれるか"], c:0,
        hint:"『なぜ 分けるのか』を 考えるのが ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『ごみを 分別する 理由を 自分の ことばで 考えられるか』。ただ おぼえるだけじゃなく、りゆうを 考える ことが 社会では だいじだよ。" },

      { q:"ごみを しゅるいごとに 分けて 出す ことを、かん字2文字で 何と いう？",
        type:"text_input", correct_answers:["分別","ぶんべつ"],
        hint:"『わける』の 分と、『くべつ』の 別。",
        rescue_hint:"『ぶんべつ』。かん字だと『分別』だよ。",
        job_title:"社会も マスター！",
        job_desc:"ごみを しゅるいごとに 分けて 出す ことを『分別（ぶんべつ）』と いうよ。みんなで きちんと 分別すると、リサイクルが すすむんだ。" },

      { q:"ごみを へらす ための 3つの 合言葉「3R」。次の うち、3Rに 入らない ものは どれ？",
        a:["リムーブ（とりのぞく）","リデュース（へらす）","リユース（くり返し 使う）","リサイクル（作りかえる）"], c:0,
        hint:"3Rは ぜんぶ『リ』から はじまる ことばだよ。",
        job_title:"3R はかせ！",
        job_desc:"3Rは『リデュース（ごみを へらす）』『リユース（くり返し 使う）』『リサイクル（作りかえて 使う）』の 3つ。この 3つを 合わせて『3R』と いうよ。" },

      { q:"下の 図は、家で 出た ごみが 運ばれて いく 流れです。\n『家庭 → 収集車 → ？ → うめ立て地／リサイクル工場』\n『？』に 入る 場所は どこ？",
        canvas_code:"ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);function box(x,y,w,h,label,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);ctx.strokeStyle='#4a3b52';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);ctx.fillStyle='#4a3b52';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(label,x+w/2,y+h/2+5);}box(10,50,80,45,'家庭','#ffd1dc');box(105,50,80,45,'収集車','#b19cd9');box(200,50,80,45,'？','#fff2a8');ctx.strokeStyle='#4a3b52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(90,72);ctx.lineTo(103,72);ctx.stroke();ctx.beginPath();ctx.moveTo(185,72);ctx.lineTo(198,72);ctx.stroke();",
        a:["清掃工場（せいそうこうじょう）","学校","スーパーマーケット","消防署"], c:0,
        hint:"もえる ごみを 高い 熱で もやす 場所だよ。",
        job_title:"ごみの 流れ わかった！",
        job_desc:"もえる ごみは 清掃工場に 運ばれて、高い 熱で もやされるよ。もやした ときの 熱は、発電などにも 利用されるんだ。のこった 灰は うめ立て地へ 運ばれるよ。" },

      { q:"【ニコに 教えてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"社長！ ぼく さっき 牛乳パックを『もえる ごみ』に 出しちゃった！ 紙だから いいよね？" },
          { name:"ニコ", icon:"🦄", msg:"そしたら 先生に『それは ちがうよ』って 言われたの…なんでかな？ 教えて！" }
        ],
        a:["牛乳パックは 水で あらって、資源ごみ（古紙）として 出すから","もえる ごみで 正しいから","もえない ごみだから","そもそも 出しては いけないから"], c:0,
        hint:"牛乳パックは とくべつな 紙。あらえば また 紙に 生まれかわるよ。",
        job_title:"先生に なれた！",
        job_desc:"牛乳パックは 水で あらって かわかせば、資源ごみ（古紙）として リサイクルできるよ。もえる ごみに 出すのは もったいないんだ。" },

      { q:"ごみを うめる『うめ立て地』が これから いっぱいに なると、どうなる 心配が ある？",
        a:["新しく うめる 場所が なくなって しまう","ごみが かってに きえて なくなる","うめ立て地は どんどん ふえて いく","なにも 心配は いらない"], c:0,
        hint:"うめ立て地の 広さには かぎりが あるよ。",
        job_title:"うめ立て地の ひみつ！",
        job_desc:"うめ立て地に できる 広さには かぎりが あって、あと 少ししか 使えないと 言われているよ。だから ごみを へらす こと（3R）が とても だいじなんだ。" },

      { q:"ごみを『へらす・くり返し 使う・作りかえる』。この 3つの 合言葉を まとめて 何と いう？ アルファベットで 書こう。",
        type:"text_input", correct_answers:["3R","３R","3r"],
        hint:"数字の『3』と、アルファベットの『R』を くっつけてね。",
        rescue_hint:"『さんアール』。数字は 3、文字は R だよ。",
        job_title:"社会 パーフェクト！",
        job_desc:"『3R（リデュース・リユース・リサイクル）』を おぼえたね。みんなが 意識して 行動すると、ごみを ぐっと へらせるよ。" }
    ],

    "社会/都道府県/todofuken01": [
      { q:"日本には 都道府県が ぜんぶで いくつ ある？",
        a:["47","43","50","45"], c:0,
        hint:"『よん・なな』の かずだよ。",
        speech_text:"都道府県は ぜんぶで いくつ？",
        job_title:"都道府県の かず わかった！",
        job_desc:"日本には 都道府県が ぜんぶで 47 あるよ。地図帳で 1つずつ さがしてみよう！" },

      { q:"都道府県の『都・道・府・県』の 数の組み合わせで 正しいのは どれ？",
        a:["1都1道2府43県","2都1道2府42県","1都2道1府43県","1都1道1府44県"], c:0,
        hint:"『都』は 東京都だけ。『道』は 北海道だけ。『府』は 2つ あるよ。",
        job_title:"都道府県の うちわけ マスター！",
        job_desc:"正しくは『1都1道2府43県』。都は東京都、道は北海道、府は大阪府と京都府の2つ、のこりの43が県だよ。" },

      { q:"北海道は、『都・道・府・県』の うち どれに あたる？",
        a:["道","都","府","県"], c:0,
        hint:"『北海“道”』の 字を よく見てみよう。",
        job_title:"北海道 バッチリ！",
        job_desc:"北海道は『道』。日本で『都・道・府・県』の うち、『道』が つくのは 北海道だけだよ。" },

      { q:"下の 図は、日本を8つの地方に 分けたときの、地方ごとの 都道府県の数を あらわしています。\n都道府県の数が いちばん多い地方は どこ？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);var data=[{n:'北海道',c:1},{n:'東北',c:6},{n:'関東',c:7},{n:'中部',c:9},{n:'近畿',c:7},{n:'中国',c:5},{n:'四国',c:4},{n:'九州',c:8}];var maxC=9;var barW=w/(data.length*1.4);var gap=barW*0.4;var baseY=h*0.75;var maxBarH=h*0.5;data.forEach(function(d,i){var x=gap+i*(barW+gap);var bh=maxBarH*(d.c/maxC);ctx.fillStyle='#b19cd9';ctx.fillRect(x,baseY-bh,barW,bh);ctx.strokeStyle='#4a3b52';ctx.lineWidth=1;ctx.strokeRect(x,baseY-bh,barW,bh);ctx.fillStyle='#4a3b52';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(d.n,x+barW/2,baseY+12);ctx.fillText(String(d.c),x+barW/2,baseY-bh-4);});",
        a:["中部地方","関東地方","九州地方","近畿地方"], c:0,
        hint:"グラフで いちばん たかい ぼうを さがしてみよう。",
        job_title:"地方区分 はかせ！",
        job_desc:"中部地方（新潟・富山・石川・福井・山梨・長野・岐阜・静岡・愛知）は 9県で、8地方の中で いちばん 都道府県の数が 多いよ。" },

      { q:"四国地方には、都道府県が いくつ ある？",
        a:["4つ","5つ","6つ","3つ"], c:0,
        hint:"徳島・香川・愛媛・高知の 4つを 思い出そう。",
        job_title:"四国地方 わかった！",
        job_desc:"四国地方は 徳島県・香川県・愛媛県・高知県の 4つ。8地方の中では 都道府県の数が いちばん 少ない地方だよ。" },

      { q:"日本で いちばん 面積（めんせき）が 大きい 都道府県は どこ？",
        a:["北海道","東京都","沖縄県","新潟県"], c:0,
        hint:"日本地図で いちばん 大きく 見える ところだよ。",
        job_title:"面積 はかせ！",
        job_desc:"面積が いちばん 大きいのは『北海道』。とても 広くて、日本全体の 面積の やく5分の1を しめて いるんだよ。" },

      { q:"日本で いちばん 面積が 小さい 都道府県は どこ？",
        a:["香川県","大阪府","東京都","沖縄県"], c:0,
        hint:"四国地方に ある、うどんで 有名な 県だよ。",
        job_title:"面積くらべ マスター！",
        job_desc:"面積が いちばん 小さいのは『香川県』。北海道と くらべると、ずいぶん 小さいことが わかるね。" },

      { q:"東京都・北海道・大阪府・京都府 いがいの、のこり43の 都道府県を まとめて 何と いう？ かん字1文字で 書いてね。",
        type:"text_input", correct_answers:["県","けん"],
        hint:"『と・どう・ふ・○』の さいごの 文字だよ。",
        rescue_hint:"『けん』。かん字だと『県』だよ。",
        job_title:"都道府県 ことば マスター！",
        job_desc:"都・道・府 いがいの 43は すべて『県』。あわせて『都道府県』と いうんだね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『日本地図を見ながら、47都道府県を 8つの地方に色分けしてみよう』って 先生が言ってたよ！" },
          { name:"ニコ", icon:"🦄", msg:"これって いったい なにが できると OKなのかな？" }
        ],
        a:["都道府県の 場所と、どの地方に 入るかを 地図で 読みとれるか","色を きれいに ぬれるか","47という 数字を おぼえられるか","はさみを じょうずに 使えるか"], c:0,
        hint:"『地図を見て 場所と地方を 結びつける』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『都道府県の 場所と、どの地方に 入るかを 地図で 読みとれるか』。地図を くり返し見ることで、場所の 感覚が 身に つくんだ。" },

      { q:"【ニコに 教えてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"社長、聞いて！ 都道府県って ぜんぶで 50 あるんだよね？ 47より 多い気が してたんだ！" }
        ],
        a:["ちがうよ。都道府県は ぜんぶで 47だよ（1都1道2府43県）","そうだね、50で あってるよ","都道府県は 100くらい あるよ","都道府県は 40より 少ないよ"], c:0,
        hint:"1都1道2府43県を たすと いくつに なるか、計算してみよう。",
        job_title:"先生に なれた！",
        job_desc:"都道府県は ぜんぶで 47。1＋1＋2＋43＝47 だね。ニコに 教えられた 社長は もう バッチリ わかってるね。" },

      { q:"日本の 都道府県は 全部で いくつ？ 数字で 書いてね。",
        type:"text_input", correct_answers:["47","四十七"],
        hint:"『よんじゅうなな』だよ。",
        rescue_hint:"『47』だよ。1都1道2府43県を たすと この数に なるね。",
        job_title:"都道府県 マスター！",
        job_desc:"日本の 都道府県は 全部で『47』。1都（東京都）・1道（北海道）・2府（大阪府・京都府）・43県で 47だね。" }
    ],

    "社会/都道府県/todofuken02": [
      { q:"海に 面していない（まわりが すべて 陸地で かこまれている）県を 何という？",
        a:["内陸県（ないりくけん）","臨海県（りんかいけん）","島県（しまけん）","高地県（こうちけん）"], c:0,
        hint:"うみ（海）が ない『ない（内）りく（陸）』の 県だよ。",
        speech_text:"海に 面していない 県を 何という？",
        job_title:"内陸県 ハンター！",
        job_desc:"周りが すべて 陸地の 県を『内陸県』と いうよ。日本には 長野県や 埼玉県など 8つの 内陸県が あるんだ。" },

      { q:"日本で いちばん 広い 平野（へいや）である『関東平野』が 広がっているのは どの 地方？",
        a:["関東地方","東北地方","近畿地方","中部地方"], c:0,
        hint:"『かんとう（関東）』平野が ある 地方だよ。",
        job_title:"地形の 特色 マスター！",
        job_desc:"関東平野は 日本で いちばん 広い 平野で、首都の 東京都や その まわりの 県に 広がっているよ。" },

      { q:"北海道の 広い 台地で さかんな、牛を かって ミルク（牛乳）をとる 産業（さんぎょう）を 何という？",
        a:["酪農（らくのう）","栽培（さいばい）漁業","林業（りんぎょう）","伝統工芸（でんとうこうげい）"], c:0,
        hint:"『うし（牛）』や『ミルク』と かんケイが 深い よびかただよ。",
        job_title:"産業の 特色 はかせ！",
        job_desc:"北海道などの 涼しい 気候や 広い 土地を いかして 牛を 育てる 産業を『酪農』と いうよ。" },

      { q:"周りを 海で かこまれた 日本の 国の かたち（国土）の 特色は どれ？",
        a:["島国（しまぐに）","内陸国（ないりくこく）","砂漠国（さばくこく）","大陸国（たいりくこく）"], c:0,
        hint:"『しま（島）』で できている 国だよ。",
        job_title:"日本の 国土 わかった！",
        job_desc:"日本は 周りが すべて 海に かこまれた『島国』だよ。周りの 海からは たくさんの 魚が とれるね。" },

      { q:"長野県や 山梨県のように、高い 山々に かこまれた 地形を 何という？",
        a:["盆地（ぼんち）","平野（へいや）","半島（はんとう）","砂丘（さきゅう）"], c:0,
        hint:"『おぼん』のように 周りが たかい 山で かこまれた 土地だよ。",
        job_title:"盆地 マスター！",
        job_desc:"周りを 山に かこまれた 低い 土地を『盆地』と いうよ。夏は あつく、冬は さむい 特徴が あるんだ。" },

      { q:"リンゴの 生産量（とれる 量）が 日本一の、東北地方の 北にある 県は どこ？",
        a:["青森県","愛知県","福岡県","鹿児島県"], c:0,
        hint:"『あおもり（青森）』リンゴで 有名な 県だよ。",
        speech_text:"リンゴ日本一の 県は どこかな？",
        job_title:"特産品 はかせ！",
        job_desc:"青森県は 日本の リンゴの 半分以上を つくっているよ。涼しい 気候が リンゴ作りに ピッタリなんだ。" },

      { q:"みかんの 生産量が とても 多く、四国地方の 西側にある 県は どこ？",
        a:["愛媛県","北海道","石川県","東京都"], c:0,
        hint:"『えひめ（愛媛）』みかんで 有名な 県だよ。",
        job_title:"みかんの 産地 バッチリ！",
        job_desc:"愛媛県や 和歌山県は 日当たりが よく あたたかい 気候を いかして、みかんづくりが とても さかんだよ。" },

      { q:"魚を つかまえるだけでなく、タマゴから 育てて 海へ はなす『育てる 漁業』を 何という？",
        a:["栽培漁業（さいばいぎょぎょう）","沖合漁業（おきあいぎょぎょう）","遠洋漁業（えんようぎょぎょう）","酪農（らくのう）"], c:0,
        hint:"『さいばい（栽培）』は 育てる という いみだよ。",
        job_title:"海の 産業 マスター！",
        job_desc:"魚を 減らさないように 小さな 稚魚（ちぎょ）まで 育ててから 海に はなす 取り組みを『栽培漁業』と いうよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『北海道、長野県、沖縄県それぞれの 土地の様子や 気候と、さかんな 産業のつながりを 調べよう』って 社会の授業で やったよ！" },
          { name:"ニコ", icon:"🦄", msg:"これって どんな 力を たしかめる もんだいなのかな？" }
        ],
        a:["地域ごとの 自然環境（気候や地形）と 産業の 特色や くらしの 関わりを 理解できているか","日本の 都道府県の 名前を 暗記できているか","県庁所在地を すばやく 言えるか","地図記号を たくさん おぼえているか"], c:0,
        hint:"『土地の 特徴（自然）と 産業（くらし）の つながり』が ポイント！",
        speech_text:"この もんだいの ねらいは なにかな？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『地域の 気候や 地形などの 自然環境と、そこで さかんな 産業の つながりを 考える 力』。丸暗記ではなく『なぜ その 産業が さかんなのか』を 考えるのが 社会の かぎだよ！" },

      { q:"【ニコに 教えてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"社長！『日本で いちばん 広い 平野は どこ？』って 聞かれたんだけど、『山梨県の 盆地！』って 答えたら ニコ まちがえちゃった…！" }
        ],
        a:["広い 平野は『関東平野』だよ。盆地は 周りが 山に かこまれた 土地のことだよ！","山梨県が 日本で いちばん 広いよ","平野と 盆地は おなじ いみだよ","北海道が 平野だよ"], c:0,
        hint:"日本一 広い 平野は『関東平野』だね。盆地は 山に かこまれた 土地だよ。",
        job_title:"先生に なれた！",
        job_desc:"日本一 広い 平野は『関東平野』！ 盆地は 周りを 山に かこまれた 土地だから、平野とは かたちが ちがうんだね。ニコに 教えてあげられて さすが 社長！" },

      { q:"海に まったく 面していない 県のことを 何県と いう？ ひらがな または かん字で 書いてね。",
        type:"text_input", correct_answers:["内陸県","ないりくけん","ないりく"],
        hint:"『ないりくけん』。うみが ない『内陸』の 県だよ。",
        rescue_hint:"『内陸県（ないりくけん）』だよ。",
        job_title:"社会 パーフェクト！",
        job_desc:"周りが すべて 陸地の 県は『内陸県』。長野・岐阜・群馬・栃木・埼玉・山梨・滋賀・奈良の 8県が 内陸県だよ。" }
    ],

    // ★漢検の問題文には読みがなを書かない（読み方そのものを問う問題なので、ふりがなを出すと答えが漏れてしまう）。
    // ★書き順（筆順）は、複数の専門サイト（kakijun.jp 等）で内容が一致した、確実に正しいと確認できたものだけを出題。
    //   （「王」の1画目のように、サイトによって説明が食いちがう＝あいまいなものは出題しない）
    "漢検/10級/dai1kai": [
      // --- 読み（4問・ふりがな無し） ---
      { q:"「一年生」の「一」の 読み方は？",
        a:["いち","に","さん","し"], c:0,
        hint:"かずを かぞえる とき、いちばん さいしょに 言う かず。",
        speech_text:"一年生の 一の よみかたは？",
        job_title:"「一」バッチリ！",
        job_desc:"「一」は「いち」と 読むよ。「一（ひと）つ」のように「ひと」と 読む ときも あるよ。" },

      { q:"「右手」の「右」の 読み方は？",
        a:["みぎ","ひだり","うえ","した"], c:0,
        hint:"おはしを もつ ほうの 手… だいたい こっちが「みぎ」だよ。",
        job_title:"「右」バッチリ！",
        job_desc:"「右」は「みぎ」と 読むよ。反対の ことばは「左（ひだり）」だね。" },

      { q:"「雨が ふる」の「雨」の 読み方は？",
        a:["あめ","ゆき","かぜ","くも"], c:0,
        hint:"空から しずくが ふってくる お天気だよ。",
        job_title:"「雨」バッチリ！",
        job_desc:"「雨」は「あめ」と 読むよ。かん字の 形も、空から しずくが 降っている ようすに にているね。" },

      { q:"「火よう日」の「火」の 読み方は？",
        a:["か","すい","もく","きん"], c:0,
        hint:"1週間の 2番目の 曜日だよ。月・火・水・木・金・土・日。",
        job_title:"「火」バッチリ！",
        job_desc:"「火」は「か」とも「ひ」とも 読むよ。曜日では「か（火よう日）」と 読むね。" },

      // --- 書取（3問・ひらがな→かん字） ---
      { q:"「えん」を あらわす かん字は どれ？（まるい 形の「えん」）",
        a:["円","王","雨","右"], c:0,
        hint:"100円玉の「円」だよ。まるい 形を している ね。",
        job_title:"「円」を 見つけた！",
        job_desc:"まるい 形を あらわす「えん」は「円」。100円、500円のように お金の 単位にも つかうよ。" },

      { q:"「した」を あらわす かん字は どれ？",
        a:["下","右","一","貝"], c:0,
        hint:"上（うえ）の 反対の ことばだよ。",
        job_title:"「下」を 見つけた！",
        job_desc:"「した」を あらわす かん字は「下」。反対の ことばは「上（うえ）」だね。" },

      { q:"「おと」を あらわす かん字は どれ？",
        a:["音","花","王","雨"], c:0,
        hint:"耳（みみ）で 聞く もの。ドレミも これの なかま。",
        job_title:"「音」を 見つけた！",
        job_desc:"「おと」を あらわす かん字は「音」。「音楽（おんがく）」の「音」でもあるよ。" },

      // --- 書き順（4問・新規。すべて複数サイトで内容が一致した確実なものだけ出題） ---
      { q:"「右」と「左」は にている 字だけど、さいしょに 書く 画が ちがうよ。「右」の 1画目は どれ？",
        a:["ノ（ひだり下に はらう）","一（よこ線）","｜（たて線）","口（四角）"], c:0,
        hint:"「右」は 手の 形（ノ）が さき、「左」は うでの 形（一）が さきだよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「右」は 1画目が「ノ」、2画目が「一」、そのあと「口」の じゅん。「左」は 1画目が「一」で 反対だよ。まぎらわしいので 要チェック！" },

      { q:"「火」を 書く ただしい じゅんばんは どれ？",
        a:["ひだり点 → みぎ点 → 人の形","みぎ点 → ひだり点 → 人の形","人の形 → ひだり点 → みぎ点","たて線 → よこ線 → 人の形"], c:0,
        hint:"さきに 左右の 点、さいごに まん中の「人」の 形を 書くよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「火」は「ひだり点→みぎ点→人の形」の じゅんで、ぜんぶで 4画。あかりや たき火の 「ひ」を あらわす かん字だよ。" },

      { q:"「雨」の 1画目は どれ？",
        a:["横線（一）","たて線（｜）","てん（点）","コの形"], c:0,
        hint:"「横線、かまえて（コの形）、たて線、てんてん」の じゅんばんだよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「雨」は 1画目が「横線」。そのあと まわりの「コの形」→まん中の「たて線」→さいごに 点を 4つ 書いて、ぜんぶで 8画だよ。" },

      { q:"「円」を 書くとき、さいしょに 書くのは どっち？",
        a:["そとがわの わく（けいがまえ）","中の 横線","下の はらい","右上の てん"], c:0,
        hint:"外がわの わく（けいがまえ）が さき、中は あとだよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「円」は「そとがわの わく」を さきに 書いてから、中を 書くよ。外がわを つつむように 書く かん字は、この じゅんばんが 多いんだ。" },

      // --- 画数（2問） ---
      { q:"「王」は 何画で 書く かん字？",
        a:["4画","3画","5画","6画"], c:0,
        hint:"横・横・たて・横。ゆっくり かぞえてみよう。",
        job_title:"画数（かくすう）マスター！",
        job_desc:"「王」は 4画。かん字を 書く ときの 線の 数を「画数」と いうよ。" },

      { q:"「貝」は 何画で 書く かん字？",
        a:["7画","5画","9画","6画"], c:0,
        hint:"上の「目」みたいな 形が ６画、下に 2画 たすよ。",
        job_title:"画数（かくすう）マスター！",
        job_desc:"「貝」は 7画。海に いる、あの「かい」だね。「貝」が つく かん字（海・貯 など）は たくさん あるよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"漢検10級の もんだいは、大きく分けて「①読み」「②書取」「③書き順・画数」の 3しゅるいが 出るよ。<br>この 3つを 出す もんだいの ねらいは、なにかな？" }
        ],
        a:["かん字を 読める・書ける・正しく書けるか、まんべんなく たしかめる","絵が じょうずに かけるか たしかめる","走るのが はやいか たしかめる","歌が じょうずか たしかめる"], c:0,
        hint:"「読み」「書取」「書き順・画数」、この 3つを 思い出してみよう。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"漢検では『読み・書取・書き順や画数』の 3つを まんべんなく 聞かれるよ。1つだけ 得意でも、ぜんぶ バランスよく できるのが 合格への ちかみちだよ。" },

      { q:"「右」の 読み方を ひらがなで 1つ 書こう。",
        type:"text_input", correct_answers:["みぎ"],
        hint:"おはしを もつ ほうの 手、だいたい こっち。",
        rescue_hint:"「みぎ」だよ。反対は「ひだり」。",
        job_title:"だい1回 クリア！",
        job_desc:"「一・右・雨・円・王・音・下・火・花・貝」の 10字、おつかれさま！ 8/20の 漢検10級 合格に むけて、また つぎの 10字も がんばろうね。" }
    ],

    // ★だい2回：学・気・九・休・玉・金・空・月・犬・見。画数・書き順は kakijun.jp / kanji.jitenon.jp /
    //   kanjitisiki.com 等、複数サイトの内容が一致したものだけを出題（食いちがいは無し・全字確認ずみ）。
    "漢検/10級/dai2kai": [
      // --- 読み（4問・ふりがな無し） ---
      { q:"「学校」の「学」の 読み方は？",
        a:["がく","こう","せい","ねん"], c:0,
        hint:"べんきょうを する ところだね。「がっこう」の さいしょの 字だよ。",
        job_title:"「学」バッチリ！",
        job_desc:"「学」は「がく」と 読むよ。「学校（がっこう）」「学ぶ（まなぶ）」のように 使うよ。" },

      { q:"「天気」の「気」の 読み方は？",
        a:["き","てん","くう","がく"], c:0,
        hint:"はれ・くもり・あめ など、空の ようすを あらわす ことばの 後半だよ。",
        job_title:"「気」バッチリ！",
        job_desc:"「気」は「き」と 読むよ。「天気（てんき）」「元気（げんき）」のように 使うよ。" },

      { q:"「休み時間」の「休」の 読み方は？",
        a:["やすみ","あそび","ひるね","ねむり"], c:0,
        hint:"がっこうで べんきょうの あいまに とる、あの じかんだよ。",
        job_title:"「休」バッチリ！",
        job_desc:"「休」は「やすみ・やすむ」と 読むよ。「休日（きゅうじつ）」のように「きゅう」と 読む ときも あるよ。" },

      { q:"「見る」の「見」の 読み方は？",
        a:["みる","きく","はなす","さわる"], c:0,
        hint:"目を つかって する ことだよ。",
        job_title:"「見」バッチリ！",
        job_desc:"「見」は「みる」と 読むよ。「見学（けんがく）」のように「けん」と 読む ときも あるよ。" },

      // --- 書取（3問・ひらがな→かん字） ---
      { q:"「たま」を あらわす かん字は どれ？（まるい 形の おもちゃなどにも つかう）",
        a:["玉","王","五","三"], c:0,
        hint:"「王」に てんが ついた かん字だよ。ビー玉の「たま」。",
        job_title:"「玉」を 見つけた！",
        job_desc:"「たま」を あらわす かん字は「玉」。「王」に てんを 足すと「玉」に なるよ。100円玉の「玉」でもあるね。" },

      { q:"「そら」を あらわす かん字は どれ？",
        a:["空","雨","気","九"], c:0,
        hint:"鳥が とんでいる、あおい あそこだよ。",
        job_title:"「空」を 見つけた！",
        job_desc:"「そら」を あらわす かん字は「空」。「空気（くうき）」「青空（あおぞら）」のように 使うよ。" },

      { q:"「いぬ」を あらわす かん字は どれ？",
        a:["犬","九","休","見"], c:0,
        hint:"ワンワン なく どうぶつだよ。",
        job_title:"「犬」を 見つけた！",
        job_desc:"「いぬ」を あらわす かん字は「犬」。「大」に てんを 足すと「犬」に なるよ。" },

      // --- 書き順（4問・「てん・線はさいごに書く」ひっかけを重点的に） ---
      { q:"「九」を 書く ただしい じゅんばんは どれ？",
        a:["ノ（はらい）→ 曲がって はねる 線","曲がって はねる 線 → ノ（はらい）","たて線 → よこ線","よこ線 → たて線"], c:0,
        hint:"さきに ななめの「ノ」を 書いて、そのあと 曲がる 線を 書くよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「九」は 1画目が「ノ（はらい）」、2画目が「曲がって はねる 線」。ぜんぶで 2画。じゅんばんを 逆にしやすいので 要チェック！" },

      { q:"「玉」の てん（丶）は、いつ 書く？",
        a:["いちばん さいご（5画目）","1画目","王を 書く とちゅう","2画目"], c:0,
        hint:"さきに「王」の 形を ぜんぶ 書いてから、さいごに てんを 足すよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「玉」は「王」の 4画を 書いたあと、さいご（5画目）に 右下へ てんを 書くよ。ぜんぶで 5画。" },

      { q:"「犬」の てん（丶）は、いつ 書く？",
        a:["「大」を 書き終えたあと、さいご（4画目）","1画目","2画目","3画目の とちゅう"], c:0,
        hint:"さきに「大」の 形を ぜんぶ 書いてから、さいごに てんを 足すよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「犬」は「大」の 3画を 書いたあと、さいご（4画目）に 右上へ てんを 書くよ。ぜんぶで 4画。「玉」と おなじで「てんは さいご」だね。" },

      { q:"「金」の まん中の たて線は、何画目に 書く？",
        a:["5画目","2画目","8画目（さいご）","1画目"], c:0,
        hint:"「人」の 形 → 横線２本 → たて線 → てん２つ → いちばん下の 横線、の じゅんばんだよ。",
        job_title:"書き順（かきじゅん）マスター！",
        job_desc:"「金」は「人」の 形（2画）→ 横線２本（2画）→ たて線（1画）→ てん２つ（2画）→ 一番下の 長い 横線（1画）で ぜんぶ 8画。たて線は 5画目だよ。" },

      // --- 画数（2問） ---
      { q:"「空」は 何画で 書く かん字？",
        a:["8画","6画","7画","9画"], c:0,
        hint:"上の「あなかんむり」が 5画、下の「エ」が 3画。あわせて…？",
        job_title:"画数（かくすう）マスター！",
        job_desc:"「空」は 8画。下の 部分は「土」に 見えるけど、じつは「エ」だよ。「空気（くうき）」「空（そら）」など、いろんな 読み方が あるね。" },

      { q:"「月」は 何画で 書く かん字？",
        a:["4画","3画","5画","6画"], c:0,
        hint:"とても シンプルな 形。ゆっくり かぞえてみよう。",
        job_title:"画数（かくすう）マスター！",
        job_desc:"「月」は 4画。右がわの「かこみ」の 部分は、じつは 1画で つながって 書くんだよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"だい2回は「九」「玉」「犬」「金」の 書き順で、てんや 線を『さいごに 書く』ものが 多かったね。<br>こういう もんだいを 出す ねらいは、なにかな？" }
        ],
        a:["形が にている 字ほど、書く じゅんばんを まちがえやすいから、しっかり かくにんする","絵を じょうずに かく ため","計算を はやく する ため","字を たくさん おぼえる ため"], c:0,
        hint:"「九」「玉」「犬」「金」、どれも じゅんばんを まちがえやすい かん字だったね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"にている 形の かん字ほど、書く じゅんばんを まちがえやすいよ。「玉」と「犬」は どちらも『てんは さいご』が ポイントだったね。ちがいに 気づく ちからが、正しい 書き順への ちかみちだよ。" },

      { q:"「見る」を ぜんぶ ひらがなで 書こう。",
        type:"text_input", correct_answers:["みる"],
        hint:"目を つかって する ことだよ。「見」の 読み方＋「る」を つなげてね。",
        rescue_hint:"「みる」だよ。",
        job_title:"だい2回 クリア！",
        job_desc:"「学・気・九・休・玉・金・空・月・犬・見」の 10字、おつかれさま！ だい3回（口・校・左・三・山・子・四・糸・字・耳）も がんばろうね。" }
    ],

    "探究/分岐図解/bunki01": [
      { q:"【新しい ツール】分岐図解トレーニング って なに？",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"社長！ 今日は 新しい ツールを しょうかいするよ！<br>『分岐図解（ぶんきずかい）』は、<b>考えを 図に して 整理する</b> れんしゅうなんだ。" },
          { name:"ニコ", icon:"🦄", msg:"『もし～なら、こうする』の 矢印を たどる図や、まん中の テーマから 考えを 広げる図など、いろんな 図に チャレンジ できるよ！" }
        ],
        a:["考えを図にして整理するちから","絵を上手にかくちから","計算を速くするちから","漢字をきれいに書くちから"], c:0,
        hint:"『分岐（ぶんき）』は『わかれ道』の いみだよ。",
        job_title:"分岐図解トレーニング スタート！",
        job_desc:"分岐図解は、考えを『図』にして 整理する れんしゅうだよ。矢印を たどりながら、あたまの中を せいりする 力を きたえよう！" },

      { q:"下の 図の ？に あう ことばを えらんで、図を かんせいさせよう！",
        type:"branch_diagram",
        diagram:{
          template:"if_then",
          nodes:[
            { id:"start", label:"見当を つけて\n計算する" },
            { id:"cond", label:"こたえが\nわられる数より\n大きい？" },
            { id:"yes", kind:"blank", blankId:"b1" },
            { id:"no", label:"そのままでOK！\nつぎに すすむ" }
          ],
          blanks:[
            { id:"b1", promptLabel:"①「はい」の ときは、どうする？", options:["商を1へらして、もう一度 計算する","商を1ふやして、もう一度 計算する","わる数を へらす","さいしょから やりなおす"], correct:0 }
          ]
        },
        hint:"見当の商で かけ算した答えが 大きすぎたときは、商を どうする？",
        job_title:"分岐図解① クリア！",
        job_desc:"わり算の 筆算で、見当をつけた商で かけ算した答えが わられる数より 大きくなったら、商を1へらして 計算しなおすんだったね。図に すると、流れが よく わかるね！" },

      { q:"こんどは べつの『もし～なら』図に チャレンジ！\n？に あう ことばを えらぼう。",
        type:"branch_diagram",
        diagram:{
          template:"if_then",
          nodes:[
            { id:"start", label:"わり算の筆算が\nおわった" },
            { id:"cond", label:"あまりは\nわる数より\n小さい？" },
            { id:"yes", label:"OK！商とあまりが\nこたえだよ" },
            { id:"no", kind:"blank", blankId:"b2" }
          ],
          blanks:[
            { id:"b2", promptLabel:"①「いいえ」の ときは、どうする？", options:["商を1ふやして、計算しなおす","商を1へらして、計算しなおす","あまりを わる数で わる","わり算を やめる"], correct:0 }
          ]
        },
        hint:"あまりが わる数より 大きいままだと、商が 小さすぎたってこと。",
        job_title:"分岐図解② クリア！",
        job_desc:"あまりが わる数より 大きい（小さくない）ときは、商が 小さすぎたということ。商を1ふやして 計算しなおすと、正しい答えに なるよ。" },

      { q:"さいごは マインドマップに チャレンジ！\nまん中の テーマから 広がる ？に あう ことばを えらぼう。",
        type:"branch_diagram",
        diagram:{
          template:"mindmap",
          nodes:[
            { id:"center", label:"文章題を\nとく ながれ" },
            { id:"n1", slot:"top", kind:"blank", blankId:"b3" },
            { id:"n2", slot:"left", kind:"blank", blankId:"b4" },
            { id:"n3", slot:"right", label:"計算する\n（筆算など）" },
            { id:"n4", slot:"bottom", label:"答えに たんいを\nつけて 書く" }
          ],
          blanks:[
            { id:"b3", promptLabel:"①上の ？は？", options:["何が わかっていて、何を 聞かれているか よむ","はやく 答えを 書く","計算を 3回 くりかえす","絵を かく"], correct:0 },
            { id:"b4", promptLabel:"②左の ？は？", options:["しき（式）を たてる","答えを おぼえる","漢字で 書く","声に出して 読む"], correct:0 }
          ]
        },
        hint:"文章題を とくときの じゅんばんを 思い出してみよう。",
        job_title:"🎯 分岐図解 マスター！",
        job_desc:"文章題を とくときは、①何が わかっていて 何を 聞かれているか よむ →②しきを たてる →③計算する →④たんいを つけて 答えを書く、の じゅんばんが 大事だよ。マインドマップに すると、全体の 流れが 一目で わかるね！" }
    ],

    "算数/グラフ/oresen01": [
      { q:"折れ線グラフは、どんな 変化（へんか）を 表すのに むいているかな？",
        a:["時間とともに かわる 数量の変化","全体の中の 割合","部分の 大きさの 比較","合計の かず"], c:0,
        hint:"時間とともに「増えたり・減ったり」する 様子を見るよ。",
        job_title:"グラフの特徴発見！",
        job_desc:"折れ線グラフは、時間の 経過に ともなう 数量の 変化を 表すのに ぴったりな グラフだよ。" },

      { q:"折れ線グラフの 傾き（かたむき）が 上に 急（きゅう）になっている とき、数量は どうなっている？",
        a:["急激（きゅうげき）に 増えている","あまり 変わっていない","へっている","止まっている"], c:0,
        hint:"傾きが 上に 大きく 傾いていると…？",
        job_title:"傾きマスター！",
        job_desc:"傾きが 上に 急なときは「急激に増えている」ことを 表しているよ！" },

      { q:"折れ線グラフの 線が 横（水平）に まっすぐになっている とき、数量は どうなっている？",
        a:["変化していない（同じ）","すごく 増えている","すごく へっている","ゼロになった"], c:0,
        hint:"上がっても 下がっても いないね。",
        job_title:"水平な線を見ぬいた！",
        job_desc:"線が 横（水平）のときは、数量が 変化していない（変わっていない）ことを あらわすよ。" },

      { q:"1日の中の「気温（きおん）の変化」を 調べるとき、いちばん ふさわしい グラフは どれ？",
        a:["折れ線グラフ","棒グラフ","円グラフ","絵グラフ"], c:0,
        hint:"時刻とともに 変わる 気温を見るなら？",
        job_title:"気温のグラフ発見！",
        job_desc:"気温のように 時間とともに 変わるものを 表すときは、折れ線グラフが いちばん 見やすいね！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『1時間ごとの 気温を 測って、折れ線グラフに かきましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["時間の経過による 気温の変化を グラフで 表せるか","計算を はやく できるか","言葉の いみを 覚えているか","絵を きれいに かけるか"], c:0,
        hint:"『折れ線グラフに かく』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『時間の経過による 気温の変化を グラフで 表せるか』。時間の流れと 変化の様子を 結びつけることが 大切なんだ。" },

      { q:"下の 折れ線グラフは 1日の 気温の変化を 表しています。気温が いちばん 高かったのは 何時？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);var temps=[15,18,24,22,19];var times=['9時','11時','13時','15時','17時'];var startX=50,endX=w-30,startY=h-40,endY=30;ctx.strokeStyle='#ccc';ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(endX,startY);ctx.moveTo(startX,startY);ctx.lineTo(startX,endY);ctx.stroke();ctx.strokeStyle='#ff6b6b';ctx.lineWidth=3;ctx.beginPath();temps.forEach(function(t,i){var x=startX+i*(endX-startX)/(temps.length-1);var y=startY-(t-10)*(startY-endY)/20;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();temps.forEach(function(t,i){var x=startX+i*(endX-startX)/(temps.length-1);var y=startY-(t-10)*(startY-endY)/20;ctx.fillStyle='#ff6b6b';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#333';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(times[i],x,startY+15);ctx.fillText(t+'℃',x,y-8);});",
        a:["13時","11時","15時","9時"], c:0,
        hint:"グラフの 点が いちばん 上に ある 時刻を さがそう。",
        job_title:"グラフの読み取り成功！",
        job_desc:"13時の 点が 24℃で いちばん 上に あるね！昼すぎが 気温の ピークに なることが グラフから 読めるよ。" },

      { q:"折れ線グラフで、縦（たて）の じく（目盛り）は 何を あらわすことが 多い？",
        a:["数量（気温や かず）","月や 時間","人の 名前","場所"], c:0,
        hint:"たて軸は 数字（量や 温度）を 表すよ。",
        job_title:"目盛りマスター！",
        job_desc:"たて軸は 数量（気温・体温・水量など）を 表し、よこ軸は 時間や 月日を 表すのが 基本だよ。" },

      { q:"折れ線グラフで、横（よこ）の じくは 何を あらわすことが 多い？",
        a:["時刻や 月などの 時間","数量（重さや 長さ）","金額","温度"], c:0,
        hint:"時間の 経過（流れ）を見るよ。",
        job_title:"よこ軸マスター！",
        job_desc:"よこ軸は 時刻や 日時・月などの『時間』を 表すよ。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「棒グラフと 折れ線グラフって、どう 使い分ければ いいの？」" }
        ],
        a:["量の大きさを 比べるときは棒グラフ、変化の様子を見るときは折れ線グラフを使うと 分かりやすいよ！","どっちを使っても まったく 同じだよ","折れ線グラフは 使わないほうがいいよ","棒グラフは 変化を見るときに使うよ"], c:0,
        hint:"大きさの比較か、変化の様子か！",
        speech_text:"ニコに グラフの使い分けを おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"比べるときは『棒グラフ』、変わり方（変化）を 見るときは『折れ線グラフ』。目的によって 使い分けると 発表が すごく 分かりやすく なるんだよ！" },

      { q:"折れ線グラフで、数量が ふえたり へったり する 様子のことを ひらがな3文字で「〇〇〇」というよ。書こう。",
        type:"text_input", correct_answers:["へんか","変化"],
        hint:"『へ◯か』。時間とともに かわっていく ことだよ。",
        rescue_hint:"『へんか』だよ。",
        job_title:"折れ線グラフ パーフェクト！",
        job_desc:"折れ線グラフは『変化』を 見るための 最強の ツールだよ！" }
    ],

    "国語/漢字/onyomi_kunyomi01": [
      { q:"漢字の読み方のうち、昔の 中国から 伝わった 読み方を 何という？",
        a:["音読み（おんよみ）","訓読み（くんよみ）","大和言葉（やまとことば）","英語読み"], c:0,
        hint:"漢字が 中国から 日本に 伝わったときの 読み方だよ。",
        job_title:"音読みを発見！",
        job_desc:"中国から 伝わった 読み方を『音読み』と いうよ。単独では 意味が 分かりにくいことが 多いね。" },

      { q:"漢字の読み方のうち、もともと 日本にあった 言葉の 意味にあてはめた 読み方を 何という？",
        a:["訓読み（くんよみ）","音読み（おんよみ）","中国読み","音訓"], c:0,
        hint:"日本に もともと あった 言葉（やまとことば）を あてた 読み方。",
        job_title:"訓読みを発見！",
        job_desc:"日本の 言葉の 意味を あてはめた 読み方を『訓読み』と いうよ。" },

      { q:"「山（やま）」のように、その 漢字1文字だけで 意味が つうじる 読み方は どちらかな？",
        a:["訓読み","音読み","音訓どちらも","どちらでもない"], c:0,
        hint:"「やま」「みず」「き」のように 1文字で 意味が わかるよ。",
        job_title:"訓読みの特長！",
        job_desc:"訓読みは 1文字だけで 意味が 相手に つたわる 読み方が 多いよ！" },

      { q:"「山脈（サンミャク）」の「サン」のように、他の 漢字と くみあわせて 使うことが多い 読み方は？",
        a:["音読み","訓読み","熟語読み","日本読み"], c:0,
        hint:"「サン」「スイ」「モク」のように 単独だと 意味が ピンとこない読み。",
        job_title:"音読みの特長！",
        job_desc:"音読みは 他の 漢字と くみあわせて 熟語（じゅくご）に して 使うことが 多いよ。" },

      { q:"漢字「水」の「みず」という 読み方は、音読み・訓読みの どちらかな？",
        a:["訓読み","音読み","音訓どちらでもない","外国語"], c:0,
        hint:"「みず」と 言うだけで 意味が わかるね。",
        job_title:"水のみず！",
        job_desc:"「みず」は 訓読み。「スイ（水曜日・水泳）」が 音読みだよ。" },

      { q:"漢字「水」の「スイ（水泳・水曜日など）」という 読み方は、どちらかな？",
        a:["音読み","訓読み","大和言葉","日本読み"], c:0,
        hint:"「スイ」と 熟語で 使うよ。",
        job_title:"水泳のスイ！",
        job_desc:"「スイ」は 音読み。「水泳（スイエイ）」「海水（カイスイ）」などで 使うね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『次の 漢字の 音読みと 訓読みを それぞれ 答えましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["漢字の 音読み（中国伝来）と 訓読み（日本固有）を 見分けられるか","漢字を きれいに 書けるか","原稿用紙の使い方を知っているか","物語の 気持ちが わかるか"], c:0,
        hint:"『音読みと 訓読みを 答える』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『音読みと 訓読みを 見分けられるか』。音と 訓が 分かると、辞書を 引くときや 熟語の 意味を 考えるときに とても 役に立つよ！" },

      { q:"国語辞典で 音読みと 訓読みを 調べるとき、カタカナで 書かれて いるのは どっち？",
        a:["音読み","訓読み","どちらもカタカナ","どちらもひらがな"], c:0,
        hint:"辞書では 音読みは カタカナ、訓読みは ひらがなで 表す 約束が あるよ。",
        job_title:"辞書の約束マスター！",
        job_desc:"辞書では 音読みが『カタカナ』、訓読みが『ひらがな』で 書かれているよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「音読みと 訓読みの 見分け方の コツって あるの？」" }
        ],
        a:["1文字で聞いて『みず』『やま』と意味がピンとくるのが訓読み、『スイ』『サン』と単独で分かりにくいのが音読みだよ！","全部丸暗記するしかないよ","送り仮名がつくのが音読みだよ","ひらがなで書くのが音読みだよ"], c:0,
        hint:"1文字で聞いて 意味が ピンと くるかどうか！",
        speech_text:"ニコに 音訓の見分け方を おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"『みず』『やま』のように 単独で 意味が ピンとくるのが 訓読み！『スイ』『サン』のように 熟語に して 使うのが 音読みだよ。" },

      { q:"漢字「赤」の「あか（あかい）」という 読み方は、ひらがなで「〇〇よみ」というよ。書こう。",
        type:"text_input", correct_answers:["くんよみ","くん"],
        hint:"『く◯よみ』。日本のもともとの 言葉だよ。",
        rescue_hint:"『くんよみ』だよ。",
        job_title:"音と訓 パーフェクト！",
        job_desc:"「あか」は 訓読み。「セキ（赤信号など）」が 音読みだよ。" }
    ],

    "理科/雨水/amamizu01": [
      { q:"雨が ふったあと、水たまりが できやすいのは どんな 場所かな？",
        a:["まわりより 低くなっている 場所","まわりより 高くなっている 場所","坂の とちゅう","平らで 高い 場所"], c:0,
        hint:"水は 高いところから 低いところへ 流れるね。",
        job_title:"水たまり発見！",
        job_desc:"雨水は くぼんだ 低い場所に あつまるから、まわりより 低い場所に 水たまりが できるよ。" },

      { q:"地面に たまった 雨水は、時間が たつと どこへ いくかな？ 2つの ゆくえとして 正しいのは？",
        a:["土の中に しみこむ・空気中に じょうはつする","消えて なくなる・地下深くに 固まる","石に かわる・宇宙へ いく","全部 そのまま 残る"], c:0,
        hint:"地面に しみこむか、空気中に 消えるか！",
        job_title:"水のゆくえ解明！",
        job_desc:"たまった 雨水は『土の中へ しみこむ』か『空気中へ 蒸発（じょうはつ）する』の 2つの 行き先が あるよ。" },

      { q:"「砂（すな）」と「土（つち）」と「ジャリ（砂利）」の うち、いちばん 水が しみこみやすい（水通りが良い）のは どれ？",
        a:["ジャリ（粒が いちばん 大きい）","土（粒が いちばん 小さい）","砂（粒が 中くらい）","どれも 同じ"], c:0,
        hint:"粒が 大きいほうが、すきまが 大きくて 水が とおりやすいよ。",
        job_title:"粒の大きさと水通り！",
        job_desc:"ジャリは 粒が いちばん 大きいので、すきまが 大きく、水が いちばん すみやかに しみこむよ！" },

      { q:"土の 粒（つぶ）の 大きさと、水の しみこみやすさの 関係で 正しいのは どれ？",
        a:["粒が 大きいほど 水が すみやかに しみこむ","粒が 小さいほど 水が すぐ しみこむ","粒の 大きさは 関係ない","粒が 大きいと 水を はじく"], c:0,
        hint:"粒の 大きさと すきまの 大きさの関係。",
        job_title:"実験のまとめ成功！",
        job_desc:"粒が 大きいほど すきまが 大きくなり、水が すみやかに しみこむんだよ！" },

      { q:"水たまりの水が 空気に ふれて、目に見えない 水蒸気（すいちょうき）になって 消えていく 現象を 何という？",
        a:["蒸発（じょうはつ）","結露（けつろ）","沸騰（ふっとう）","ろ過（ろか）"], c:0,
        hint:"『じょうはつ』と 読むよ。",
        job_title:"蒸発マスター！",
        job_desc:"水が 水蒸気になって 空気中に 出ていくことを『蒸発（じょうはつ）』と いうよ。" },

      { q:"雨水が 地面を ながれる とき、水は どちらから どちらへ ながれるかな？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#eaf6ff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#8d6e63';ctx.beginPath();ctx.moveTo(30,h-30);ctx.lineTo(w-30,h-80);ctx.lineTo(w-30,h-20);ctx.lineTo(30,h-20);ctx.closePath();ctx.fill();ctx.strokeStyle='#2980b9';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w-50,h-85);ctx.lineTo(50,h-35);ctx.stroke();ctx.fillStyle='#2980b9';ctx.font='bold 14px sans-serif';ctx.fillText('高いところ',w-100,h-95);ctx.fillText('低いところ',40,h-10);ctx.fillText('水のはたらき ➔',w/2-40,h/2-20);",
        a:["高いところから 低いところへ","低いところから 高いところへ","右から 左へ ランダムに","うごかない"], c:0,
        hint:"坂道を 水が ながれるのを 思い出そう。",
        job_title:"流れる向き見ぬいた！",
        job_desc:"水は かならず『高いところから 低いところへ』傾きに そって 流れるよ！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『砂と 土を 容器に入れて、水を かけたときの しみこみ方の ちがいを くらべましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["土の 粒の 大きさによって 水の しみこみやすさが ちがうことを 実験で 確かめられるか","水を たくさん のめるか","砂城を きれいに つくれるか","天気を 予報できるか"], c:0,
        hint:"『しみこみ方の ちがいを くらべる』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『土の 粒の 大きさによって 水の しみこみやすさが ちがうことを 実験で 確かめられるか』だよ！" },

      { q:"日かげの 水たまりと、日なたの 水たまり。早く かわく（蒸発する）のは どっち？",
        a:["日なたの 水たまり（あたたかいから）","日かげの 水たまり","どちらも 同じ 速さ","風がないほう"], c:0,
        hint:"太陽の 光が あたって 温度が 高いほうが 蒸発しやすいよ。",
        job_title:"蒸発の条件発見！",
        job_desc:"温度が 高いほう（日なた）が、水蒸気に なって 蒸発する スピードが はやいよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「校庭の 水たまりって、どこへ 消えちゃったの？」" }
        ],
        a:["土の すきまを通って 地中にしみこんだり、太陽の熱で 水蒸気になって 空気中にじょうはつしたんだよ！","水が マジックで 消えたんだよ","全部 地球の反対側に ぬけたんだよ","地面が 吸収して なくなっただけだよ"], c:0,
        hint:"地中へのしみこみ と 蒸発！",
        speech_text:"ニコに 水のゆくえを おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"水たまりの 水は『土の中に しみこむ』のと『水蒸気に なって 空へ 蒸発する』の 2つの ルートで 消えるんだよ！" },

      { q:"水が 水蒸気になって 空気中に のぼっていく ことを ひらがな5文字で「〇〇〇〇〇」というよ。書こう。",
        type:"text_input", correct_answers:["じょうはつ","蒸発"],
        hint:"『じょうはつ』。水たまりが かわく 原因だよ。",
        rescue_hint:"『じょうはつ』だよ。",
        job_title:"雨水のゆくえ パーフェクト！",
        job_desc:"蒸発（じょうはつ）した 水は、空へ のぼって 云（くも）や 雨に なるんだね！" }
    ],

    "社会/水道/josuijo01": [
      { q:"じゃぐちを ひねると 出る 安全な 水は、どこから 運ばれて くるかな？",
        a:["浄水場（じょうすいじょう）","ごみ処理場","警察署","消防署"], c:0,
        hint:"きれいで 安全な 水を つくる 施設だよ。",
        job_title:"浄水場を発見！",
        job_desc:"じゃぐちの 水は、浄水場（じょうすいじょう）で きれいに されてから 家に 届くよ。" },

      { q:"川や ダムから 取った 水を、飲むことができる 清潔で 安全な 水に 変える 施設は どれ？",
        a:["浄水場（じょうすいじょう）","発電所","役所","公園"], c:0,
        hint:"「きれいな 水（浄水）」にする 場所だよ。",
        job_title:"浄水場の役割！",
        job_desc:"川や ダムの 水を 薬や フィルターで 消毒・ろ過して 安全な 水にするのが 浄水場だよ。" },

      { q:"浄水場で、水の中の 細かい ゴミや ドロを 沈めて 取りのぞく ために 行う 処理は どれ？",
        a:["ろ過（ろか）や 薬で ゴミを かたまりにして 沈める","水をごっつんと ぶつける","火で あぶって かわかす","そのまま 放置する"], c:0,
        hint:"ゴミを 大きく 固めて 底に 沈めるよ。",
        job_title:"水づくりのくふう！",
        job_desc:"ゴミを かたまりにして 沈め、砂や スナの 層で『ろ過』して ドロや ゴミを のぞくんだ。" },

      { q:"浄水場から 出た あと、安全な 水を 蓄えて（たくわえて）まちに 送り出す 大きな 施設は？",
        a:["配水場（はいすいじょう） / 配水池","プール","井戸","給食センター"], c:0,
        hint:"「水を くばる（配る）」場所だよ。",
        job_title:"配水場を発見！",
        job_desc:"配水場（はいすいじょう）に たくわえられた 水が、パイプ（水道管）を 通って 家や 学校に 送られるよ。" },

      { q:"私たちが 使ったあとの 汚れた 水（生活排水）を きれいにして 川や 海に もどす 施設は どれ？",
        a:["下水処理場（げすいしょりじょう）","浄水場","ダム","清掃工場"], c:0,
        hint:"「下水（げすい）」を きれいにする 場所。",
        job_title:"下水処理場を発見！",
        job_desc:"使ったあとの 水は 下水処理場（げすいしょりじょう）で 微生物の 力を 借りて きれいにしてから 川や 海に かえすよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『浄水場で 水が きれいに される しくみを 調べましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["安全な 水が 届くまでの 工夫や 努力を 理解できるか","水を 無駄使い できるか","川で 魚を つれるか","水泳が とくいになるか"], c:0,
        hint:"『安全な 水が 届くまでの くふう』だね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『安全な 水が 届くまでの 工夫や 努力を 理解できるか』。たくさんの 人の 努力で いつでも 安全な 水が 飲めるんだね。" },

      { q:"水の じゅんかん（めぐり）の 順番として 正しいのは どれ？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f4f9f9';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2c3e50';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('川・ダム ➔ 浄水場 ➔ 家（使う） ➔ 下水処理場 ➔ 川・海',w/2,h/2-10);ctx.strokeStyle='#3498db';ctx.lineWidth=3;ctx.beginPath();ctx.arc(w/2,h/2+15,40,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#3498db';ctx.fillText('水のめぐり',w/2,h/2+20);",
        a:["川・ダム ➔ 浄水場 ➔ 家 ➔ 下水処理場 ➔ 川・海","家 ➔ 浄水場 ➔ 川 ➔ 下水処理場","海 ➔ 家 ➔ 浄水場 ➔ ダム","下水処理場 ➔ 家 ➔ 浄水場"], c:0,
        hint:"川から 取って 浄水場で きれいにして 家で 使って 下水処理場で きれいに戻すよ。",
        job_title:"水の循環マスター！",
        job_desc:"水は 自然から 取って 人が 使い、きれいに 戻して また 自然へ かえる『循環（じゅんかん）』を しているよ！" },

      { q:"日本のように、じゃぐちの 水が そのまま 飲める 国は 世界に どれくらい あるかな？",
        a:["10〜15か国程度（とても 珍しい）","ほぼ 全ての 国","半分以上の 国","1つも ない"], c:0,
        hint:"水道水が そのまま 飲める 国は 世界でも ごくわずかだよ。",
        job_title:"日本の水道のすごさ！",
        job_desc:"水道水が そのまま 飲める 国は 世界で わずか 10〜15か国ほど！ 日本の 浄水技術と 管理は 世界トップレベルなんだ。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「じゃぐちを ひねると 当たり前に 水が出るけど、どうして安全なの？」" }
        ],
        a:["浄水場で 24時間体制で ゴミをのぞき、消毒して 安全を たしかめているからだよ！大切に使おうね。","勝手にきれいになるからだよ","魔法で浄化されているからだよ","ペットボトルの水を流しているからだよ"], c:0,
        hint:"浄水場での 24時間の くふうと 努力！",
        speech_text:"ニコに 水の安全のひみつを おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"浄水場では 24時間体制で 水質を チェックし、消毒して 安全を たもっているんだ。感謝して 大切に 使おうね！" },

      { q:"川の水を 消毒して 安全な 水にする 施設を ひらがな8文字で「〇〇〇〇〇〇〇〇」というよ。書こう。",
        type:"text_input", correct_answers:["じょうすいじょう","浄水場"],
        hint:"『じょうすいじょう』。きれいな 水をつくるよ。",
        rescue_hint:"『じょうすいじょう』だよ。",
        job_title:"くらしと水 パーフェクト！",
        job_desc:"浄水場（じょうすいじょう）のおかげで、毎日 安全で おいしい 水が 飲めるんだね！" }
    ],

    "算数/わり算/warizan301": [
      { q:"17この あめを 3人に おなじ数ずつ 分けると、1人なんこになって、なんこ あまるかな？",
        a:["1人5こで 2にあまる","1人5こで あまりなし","1人6こで 1にあまる","1人4こで 5にあまる"], c:0,
        hint:"3の だんの 九九で 17を こえない いちばん 大きな 数を さがそう（3×5＝15）。",
        job_title:"あまりのあるわり算クリア！",
        job_desc:"17 ÷ 3 ＝ 5 あまり 2。3×5＝15、17−15＝2 だね。あまりの 2は わる数(3)より 小さいから 正解だよ！" },

      { q:"わり算で「あまり」は、わる数より どうなっていないと いけないかな？",
        a:["わる数より 小さくないといけない","わる数より 大きくないといけない","わる数と 同じでないといけない","どちらでもよい"], c:0,
        hint:"もし あまりのほうが 大きかったら、まだ 分けられるね。",
        job_title:"あまりの大事なルール！",
        job_desc:"あまりは かならず『わる数より 小さい』ことが 大事な 約束だよ！" },

      { q:"【確かめの 式】「19 ÷ 4 ＝ 4 あまり 3」が 正しいか たしかめる 式は どれかな？",
        a:["4 × 4 ＋ 3 ＝ 19","4 × 3 ＋ 4 ＝ 16","19 − 3 ＝ 16","4 ＋ 4 ＋ 3 ＝ 11"], c:0,
        hint:"（わる数 × 商）＋ あまり ＝ (わられる数) に なるか たしかめよう。",
        job_title:"確かめの式マスター！",
        job_desc:"4×4＝16、16＋3＝19。わられる数(19)に 戻ったから、計算が 正しいことが たしかめられたね！" },

      { q:"23 ÷ 5 ＝ 4 あまり 3。この とき、あまりの「3」は わる数の「5」より 小さいかな？",
        a:["小さい（正しく 計算できている）","大きい（まちがえている）","同じ大きさ","わからない"], c:0,
        hint:"3 と 5 どちらが 小さいか くらべよう。",
        job_title:"あまりのチェック成功！",
        job_desc:"あまり(3) ＜ わる数(5) だから、正しく 計算できているね！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『あまりのある わり算で、計算が 合っているか 確かめの式を つくりましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["(わる数×商) ＋ あまり ＝ (わられる数) の 関係を つかって 確かめられるか","九九を 暗記できているか","たし算だけ できるか","字を きれいに かけるか"], c:0,
        hint:"『確かめの式を つくる』が ポイントだね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『(わる数×商)＋あまり＝わられる数 の 関係を使って 自分で 計算を チェックできるか』だよ！" },

      { q:"下のお皿の りんご。14こを 3こずつ お皿に いれると、何皿できて 何こ あまるかな？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fffdf5';ctx.fillRect(0,0,w,h);ctx.fillStyle='#4a3b52';ctx.font='bold 14px sans-serif';ctx.fillText('🍎 14この りんごを 3こずつ 分けるよ',20,25);for(var i=0;i<14;i++){var x=35+(i%5)*45;var y=55+Math.floor(i/5)*40;ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fillStyle='#ff4757';ctx.fill();ctx.strokeStyle='#2f3542';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#fff';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(i+1,x,y+4);}",
        a:["4皿できて 2こあまる","4皿できて 1こあまる","3皿できて 5こあまる","5皿できて あまりなし"], c:0,
        hint:"14 ÷ 3 の 計算を してみよう。",
        job_title:"絵でみるあまりのわり算！",
        job_desc:"14 ÷ 3 ＝ 4 あまり 2。3こ入りの お皿が 4皿できて、2こ あまるね！" },

      { q:"29 ÷ 6 の 商（こたえ）と あまりの くみあわせで 正しいのは どれ？",
        a:["商 4 あまり 5","商 5 あまり 1","商 4 あまり 3","商 3 あまり 11"], c:0,
        hint:"6×4＝24、29−24＝5。",
        job_title:"わり算計算クリア！",
        job_desc:"6×4＝24、29−24＝5。あまりの5は わる数(6)より 小さいので、商 4 あまり 5 が 正解！" },

      { q:"35 ÷ 4 の 計算で、あまりが「5」に なりました。この 計算は どこが まちがっているかな？",
        a:["あまりが わる数(4)より 大きいので、まだ わけられる（商を1ふやす）","あまりが 小さすぎる","計算は 合っている","たし算を まちがえている"], c:0,
        hint:"あまり(5)は わる数(4)より 大きいね。",
        job_title:"ひっかけを見ぬいた！",
        job_desc:"あまりが わる数より 大きいときは、商を 1つ 増やせる証拠。35 ÷ 4 ＝ 8 あまり 3 が 正しいね。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「あまりのある わり算って、どうやって 確かめれば いいの？」" }
        ],
        a:["『わる数 × 商 ＋ あまり』を 計算して、さいしょの わられる数に もどれば 大丈夫だよ！","もう一度 勘で 計算するよ","あまりは 無視すれば いいよ","たし算だけ すれば いいよ"], c:0,
        hint:"わる数×商＋あまり！",
        speech_text:"ニコに 確かめの方法を おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"『わる数 × 商 ＋ あまり』が わられる数に もどるか チェック！ この 確かめができると 算数が ぐーんと 得意になるよ！" },

      { q:"15 ÷ 4 ＝ 3 あまり 〇。あまりの 数を 半角数字で 書こう。",
        type:"text_input", correct_answers:["3"],
        hint:"4 × 3 ＝ 12。15 − 12 ＝ ？",
        rescue_hint:"15 − 12 ＝ 3 だよ。",
        job_title:"わり算きほん パーフェクト！",
        job_desc:"15 ÷ 4 ＝ 3 あまり 3。あまりのある わり算は、4年生の『筆算』の 土台になる 大切な 単元だよ！" }
    ],

    "国語/ローマ字/romaji301": [
      { q:"ローマ字で 母音（ぼいん）にあたる「あ・い・う・え・お」の 5つの アルファベットは どれ？",
        a:["A・I・U・E・O","K・S・T・N・H","A・B・C・D・E","X・Y・Z・O・U"], c:0,
        hint:"「あ＝A、い＝I、う＝U、え＝E、お＝O」だよ。",
        job_title:"母音（ぼいん）マスター！",
        job_desc:"A・I・U・E・O は ローマ字の 土台（母音）。ここが 分かると ローマ字が すぐ 読めるようになるよ！" },

      { q:"「か・き・く・け・こ」を ローマ字で 表すとき、さいしょに つく 子音（しいん）の 文字は どれ？",
        a:["K","S","T","N"], c:0,
        hint:"KA, KI, KU, KE, KO の 最初の 文字。",
        job_title:"子音（しいん）発見！",
        job_desc:"か行は「K」＋ 母音（A I U E O）。KA・KI・KU・KE・KO に なるんだね。" },

      { q:"「さくら（Sakura）」の「さ」を ローマ字で 表すと どれかな？",
        a:["SA","KA","TA","NA"], c:0,
        hint:"さ行は「S」＋「A」＝ SA。",
        job_title:"ローマ字で単語！",
        job_desc:"「さ」は S＋A＝SA。Sakura（さくら）など、身の回りの 言葉を ローマ字で 書いてみよう！" },

      { q:"「し」を 表す ローマ字（SI または SHI）で、母音にあたる 文字は どれ？",
        a:["I","S","H","U"], c:0,
        hint:"「い」の 音にあたる アルファベットだよ。",
        job_title:"母音を見ぬいた！",
        job_desc:"「し」の 母音は「I」。S＋I（または S＋H＋I）で「し」の 音に なるね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『ひらがな「たのしい」を ローマ字「tanosii」で 書きましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["日本語の 音を ローマ字（アルファベット）で 正しく 表せるか","英語で 会話できるか","漢字を たくさん 書けるか","タイピングスピードが 世界一か"], c:0,
        hint:"『日本語の音を ローマ字で書く』だね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『日本語の 音を ローマ字で 正しく 表せるか』。パソコンの タイピングや キーボード入力にも 欠かせない ちからだよ！" },

      { q:"パソコンの キーボードで「N」の つぎに「A」を おすと、画面に なんと 表示されるかな？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f1f2f6';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2f3542';ctx.font='bold 14px sans-serif';ctx.fillText('⌨️ キーボードで [ N ] + [ A ]',25,30);ctx.fillStyle='#fff';ctx.strokeStyle='#747d8c';ctx.lineWidth=2;ctx.strokeRect(40,45,50,45);ctx.fillRect(40,45,50,45);ctx.strokeRect(110,45,50,45);ctx.fillRect(110,45,50,45);ctx.fillStyle='#2f3542';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('N',65,73);ctx.fillText('A',135,73);",
        a:["な","に","ぬ","ね"], c:0,
        hint:"な行の「N」＋「A」＝？",
        job_title:"タイピング名人！",
        job_desc:"N＋A ＝「な」！ ローマ字入力の 基本だね。" },

      { q:"「山（yama）」の「やま」を ローマ字で 表すと どれかな？",
        a:["YAMA","KAMA","TAMA","RAMA"], c:0,
        hint:"や（YA）＋ ま（MA）＝？",
        job_title:"単語をローマ字で！",
        job_desc:"や（YA）＋ ま（MA）＝ YAMA。自分の 名前や 住んでいる まちの 名前も ローマ字で 書いてみよう！" },

      { q:"「つなみ（tsunami）」の「つ」の ローマ字表記として 正しいのは どれ？",
        a:["TSU（または TU）","SU","KU","MU"], c:0,
        hint:"た行の「つ」は TSU または TU と 書くよ。",
        job_title:"つ の表記クリア！",
        job_desc:"「つ」は TSU または TU。ローマ字には ヘボン式と 訓令式の 2つの 表し方が あるよ。" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「ローマ字を 覚えると、どんな いいことが あるの？」" }
        ],
        a:["パソコンや スマホで 日本語を タイピング入力できるようになって、世界の 人とも 名前を 伝えあえるよ！","英語の テストが 全部 100点になるよ","漢字を 書かなくて よくなるよ","特に なにも いいことは ないよ"], c:0,
        hint:"タイピング入力 や 世界への発信！",
        speech_text:"ニコに ローマ字の利点を おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"ローマ字を 覚えると、パソコンで タイピングが スイスイ できるように なって、Web検索や プログラミングにも 大活躍するんだよ！" },

      { q:"ひらがな「いぬ」を 小文字の ローマ字で 書こう。（例：inu）",
        type:"text_input", correct_answers:["inu","INU"],
        hint:"い（i）＋ ぬ（nu）＝ inu。",
        rescue_hint:"『inu』だよ。",
        job_title:"ローマ字 パーフェクト！",
        job_desc:"い（i）＋ ぬ（nu）＝ inu。これで ローマ字の きほんは バッチリ！" }
    ],

    "理科/磁石/jishaku301": [
      { q:"磁石（じしゃく）が ひきつける（くっつく） 金属は どれかな？",
        a:["鉄（てつ）","アルミニウム（1円玉）","銅（10円玉）","プラスチック"], c:0,
        hint:"クリップや 釘（くぎ）に 使われている 金属だよ。",
        job_title:"磁石につくもの発見！",
        job_desc:"磁石が 引きつける 金属は『鉄（てつ）』！ アルミニウムや 銅（10円玉）は 金属だけど 磁石には つかないよ。" },

      { q:"棒じしゃくの N極と N極（おなじ極どうし）を 近づけると どうなるかな？",
        a:["しりぞけあう（はなれる）","ひきあう（くっつく）","なにも 起きない","磁石が こわれる"], c:0,
        hint:"同じ極どうし（NとN、SとS）は…？",
        job_title:"磁石の極の実験！",
        job_desc:"同じ極どうし（NとN、SとS）は『しりぞけあう』！ 手で 近づけると 手ごたえが あるね。" },

      { q:"N極と S極（ちがう極どうし）を 近づけると どうなるかな？",
        a:["ひきあう（強く くっつく）","しりぞけあう（はなれる）","遠ざかる","消える"], c:0,
        hint:"ちがう極どうし（NとS）は…？",
        job_title:"引き合う極を発見！",
        job_desc:"ちがう極どうし（N極とS極）は『ひきあう』！ カチッと 強く くっつくよ。" },

      { q:"磁石に つくものを つぎの中から 1つ えらぼう。",
        a:["クリップ（鉄製）","ガラスの コップ","木ブロック","折り紙"], c:0,
        hint:"鉄で できているものを さがそう。",
        job_title:"磁石につく物マスター！",
        job_desc:"鉄製の クリップは 磁石に つくよ。木・ガラス・紙・プラスチックは 磁石に つかないね。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『色々な 物に 磁石を 近づけて、つくものと つかないものを グループ分けしましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["磁石は 鉄を ひきつける 性質が あることを 実験で たしかめられるか","磁石を 投げるのが うまいか","金属の 重さを はかれるか","電気を ながせるか"], c:0,
        hint:"『つくものと つかないものを 実験で確かめる』だね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『磁石は 鉄を 引きつける 性質が あることを 実験で 確かめられるか』だよ！" },

      { q:"下の 2つの 磁石。S極と N極を 近づけると、磁石は どうなるかな？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ff4757';ctx.fillRect(30,40,60,35);ctx.fillStyle='#1e90ff';ctx.fillRect(90,40,60,35);ctx.fillStyle='#ff4757';ctx.fillRect(170,40,60,35);ctx.fillStyle='#1e90ff';ctx.fillRect(230,40,60,35);ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('N',60,63);ctx.fillText('S',120,63);ctx.fillText('N',200,63);ctx.fillText('S',260,63);ctx.fillStyle='#2f3542';ctx.font='bold 14px sans-serif';ctx.fillText('S極 ➔  ⬅️ N極',145,95);",
        a:["ひきあう（引き合って くっつく）","しりぞけあう（はなれる）","うごかない","ひっくりかえる"], c:0,
        hint:"S極 と N極（ちがう極どうし）だよ。",
        job_title:"磁石の力 イラスト解説！",
        job_desc:"S極と N極は『ひきあう』！ 磁石の 両はし（極）に いちばん 強い 力が 働くよ。" },

      { q:"水を入れた プラスチック容器の 底にある 鉄の クリップ。容器の外から 磁石を 近づけると どうなる？",
        a:["プラスチックや 水を とおしても 磁石の 力で 引きつけられる","水の中では 磁石の 力が 消える","プラスチックで 磁石が こわれる","何も おきない"], c:0,
        hint:"紙や プラスチック・水を とおしても 磁石の力は 届くかな？",
        job_title:"磁石の力がとおる！",
        job_desc:"磁石の 力は、紙・木・プラスチック・水などを とおしても 鉄に 届くんだよ！" },

      { q:"鉄の 釘（くぎ）に 磁石を なんかいも こすりつけると、釘は どうなるかな？",
        a:["釘自身も 磁石の 性質を もつ（磁化する）","釘が とける","釘が 軽くなる","何も かわらない"], c:0,
        hint:"釘に 磁石の力が うつって、他の クリップが つくようになるよ。",
        job_title:"磁化（じか）を発見！",
        job_desc:"鉄に 磁石を こすりつけると、鉄自身も 磁石の 性質を つける（磁化する）んだよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「方位磁針（ほういじしん）の 針が いつも 北を さすのは どうして？」" }
        ],
        a:["地球自体が 大きな 磁石になっていて、針のN極が 北（S極の性質）に ひきつけられるからだよ！","風が 北から ふいているからだよ","北のほうが つめたいからだよ","電池が 入っているからだよ"], c:0,
        hint:"地球自体が 大きな 磁石！",
        speech_text:"ニコに 方位磁針の秘密を おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"じつは 地球自体が 大きな 磁石！ だから 方位磁針の 針（N極）は いつも 北を さすんだね。" },

      { q:"じしゃくの N極の「N」は、英語の North（北）の かしら文字だよ。ひらがな2文字で「〇〇」と書こう。",
        type:"text_input", correct_answers:["きた","北"],
        hint:"『き◯』。方位磁針が さす 方角だよ。",
        rescue_hint:"『きた』だよ。",
        job_title:"磁石のふしぎ パーフェクト！",
        job_desc:"N極は『北（North）』、S極は『南（South）』を あらわしているよ！" }
    ],

    "社会/まち探検/machi301": [
      { q:"地図で 上の方角（方向）は、ふつう どちらの 方角を あらわしているかな？",
        a:["北（きた）","南（みなみ）","東（ひがし）","西（にし）"], c:0,
        hint:"「上が 北、下が 南」が 地図の 基本ルールだよ。",
        job_title:"地図の方角マスター！",
        job_desc:"地図は 原則として『上が 北』！ 上が北のとき、下が南、右が東、左が西に なるよ。" },

      { q:"地図記号で「文」という 文字の 記号は、何の 施設を あらわしているかな？",
        a:["小学校・中学校・高校","図書館","交番","病院"], c:0,
        hint:"文字の「文」は 学校（学問）を あらわすよ。",
        job_title:"学校の地図記号！",
        job_desc:"「文」は 小学校・中学校・高校を あらわす 地図記号だよ！" },

      { q:"地図記号で「⭕の中に❌（ばってん）」が入った 記号は、何の 施設かな？",
        a:["交番（こうばん）","消防署","警察署","郵便局"], c:0,
        hint:"昔の 警察官が もっていた 警棒（けいぼう）を 交差させた 形だよ。",
        job_title:"交番の地図記号！",
        job_desc:"⭕の中に❌は『交番』！ ちなみに 警察署は ⭕の中に❌の まわりに 菱形が つくよ。" },

      { q:"「〒」の マークの 地図記号は、何を あらわしているかな？",
        a:["郵便局（ゆうびんきょく）","銀行","駅","工場"], c:0,
        hint:"手紙や パックを 届けてくれる 場所。",
        job_title:"郵便局の地図記号！",
        job_desc:"「〒」は 郵便局（ゆうびんきょく）の 地図記号だよ！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『たんけんマップを つくって、学校の 周りの 施設を 地図記号で かきこみましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["まちの 様子や 施設の 場所を 方角や 地図記号を つかって 表せるか","絵を かんペキに かけるか","走るのが はやいか","建物を たてられるか"], c:0,
        hint:"『方角や 地図記号を つかって まちの様子を表す』だね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『まちの 様子や 施設の 場所を 方角や 地図記号を 使って 分かりやすく 表せるか』だよ！" },

      { q:"下の 地図記号。赤い 十字（＋）の マークは、何の 施設を あらわしているかな？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#747d8c';ctx.lineWidth=2;ctx.strokeRect(20,20,w-40,h-40);ctx.fillStyle='#ff4757';ctx.fillRect(w/2-25,h/2-8,50,16);ctx.fillRect(w/2-8,h/2-25,16,50);ctx.fillStyle='#2f3542';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('この 地図記号は？',w/2,h-15);",
        a:["病院（びょういん）","交番","消防署","学校"], c:0,
        hint:"病気や けがの ときに 行く 場所だよ。",
        job_title:"病院の地図記号！",
        job_desc:"赤や 黒の 十字マークは『病院』を あらわしているよ！" },

      { q:"4つの 基本の方角「東・西・南・北」の うち、太陽が 朝 のぼってくる 方角は どこ？",
        a:["東（ひがし）","西（にし）","南（みなみ）","北（きた）"], c:0,
        hint:"太陽は「ひがし」から のぼって、「にし」へ 沈むよ。",
        job_title:"太陽と方角！",
        job_desc:"太陽は かならず『東（ひがし）』から のぼり、『西（にし）』へ 沈むよ！" },

      { q:"地図記号で、火の 炎のような マーク（または 昔の 刺股 Yの形）は 何の 施設を あらわしているかな？",
        a:["消防署（しょうぼうしょ）","警察署","工場","神社"], c:0,
        hint:"火事を けす 火消し道具（さすまた）の 形から できたよ。",
        job_title:"消防署の地図記号！",
        job_desc:"Yの形（刺股）の マークは『消防署』を あらわす 地図記号だよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「どうして 地図には 本物の 建物の 絵じゃなくて『地図記号』を つかうの？」" }
        ],
        a:["小さな 地図でも 見やすく、誰が見ても 一目で 場所や 施設が 分かるように するためだよ！","絵を かくのが 面倒だからだよ","秘密にするためだよ","記号のほうが かっこいいからだよ"], c:0,
        hint:"見やすさと 誰が見ても一目で分かる工夫！",
        speech_text:"ニコに 地図記号の理由を おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"地図記号を つかうと、小さな 地図でも すっきり 見やすくなって、誰が見ても 一目で 建物の 種類が 分かるんだよ！" },

      { q:"地図で 上が「北」のとき、右側の 方角を ひらがな2文字で「〇〇」と書こう。",
        type:"text_input", correct_answers:["ひがし","東"],
        hint:"『ひ◯し』。太陽が のぼる 方角だよ。",
        rescue_hint:"『ひがし』だよ。",
        job_title:"まち探検 パーフェクト！",
        job_desc:"上が『北』のとき、右が『東』、左が『西』、下が『南』。これで 地図も 探検も バッチリだね！" }
    ],

    "国語/言葉/setsuzoku01": [
      { q:"「あいにくの 雨だった。＿＿＿＿、運動会は 中止になった。」 空らんに入る つなぎ言葉は どれかな？",
        a:["だから（そのため）","しかし","なぜなら","ところで"], c:0,
        hint:"前が 理由（雨）で、あとが 結果（中止）だよ。",
        job_title:"順接（じゅんせつ）クリア！",
        job_desc:"『だから』は 前の 理由から 自然な 結果に つながる ときに 使う言葉（順接）だよ！" },

      { q:"「一生懸命 練習した。＿＿＿＿、試合には 負けてしまった。」 空らんに入る つなぎ言葉は？",
        a:["しかし（けれど）","だから","また","たとえば"], c:0,
        hint:"予想と 反対の 結果が 来るとき。逆接（ぎゃくせつ）だよ。",
        job_title:"逆接（ぎゃくせつ）発見！",
        job_desc:"『しかし』は 予想と 反対の ことが 来るときに 使う言葉（逆接）だよ！" },

      { q:"「ぼくが この本を おすすめする理由は 2つある。＿＿＿＿、主人公が かっこいいことだ。」に入るのは？",
        a:["まず（1つ目は）","しかし","だから","つまり"], c:0,
        hint:"順番に 理由を あげていく とき。",
        job_title:"順序を表す言葉！",
        job_desc:"『まず』や『次に』は 順番を 整理して 分かりやすく 伝える ときに 使うよ！" },

      { q:"前で述べたことの「理由」を あとから 説明するときに 使う つなぎ言葉は どれかな？",
        a:["なぜなら（なぜなら〜だからだ）","しかし","だから","ところで"], c:0,
        hint:"「なぜなら、◯◯だからだ」の 形だよ。",
        job_title:"理由の説明マスター！",
        job_desc:"『なぜなら』を使うと、自分の 意見の 理由を はっきり 相手に 伝えられるよ！" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『文章の中の「しかし」や「だから」などの つなぎ言葉に 注目して 読みましょう』って もんだい。<br>これは <b>なにが できると OK</b>かな？" }
        ],
        a:["文と文の つながりや 筆者の 考えの 変化を 正確に 読み取れるか","漢字を 100文字 書けるか","声を 大きく 読めるか","文章を 覚えられるか"], c:0,
        hint:"『文と文の つながりを 読み取る』だね。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『つなぎ言葉（接続語）に 注目して、文と文の 関係や 展開を 正確に 読み取れるか』だよ！" },

      { q:"下の 文章の 関係。「雨が ふった」➔【？】➔「傘を さした」。【？】に入る つなぎ言葉は？",
        canvas_code:"var w=canvas.width,h=canvas.height;ctx.fillStyle='#f8f9fa';ctx.fillRect(0,0,w,h);ctx.fillStyle='#212529';ctx.font='bold 14px sans-serif';ctx.fillText('🌧️ 雨が ふった',25,45);ctx.fillText('☔ 傘を さした',210,45);ctx.strokeStyle='#495057';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(125,40);ctx.lineTo(200,40);ctx.stroke();ctx.fillStyle='#007bff';ctx.font='bold 12px sans-serif';ctx.fillText('【 ？？？ 】',130,30);",
        a:["だから（理由➔結果）","しかし","なぜなら","ところで"], c:0,
        hint:"原因から 自然な 結果に つながるよ。",
        job_title:"接続語 図解クリア！",
        job_desc:"『雨が ふった。だから 傘を さした』。原因と 結果が きれいに つながるね！" },

      { q:"話の 話題を まったく 別の 話題に 変えるときに 使う つなぎ言葉は どれ？",
        a:["ところで（さて）","だから","つまり","しかし"], c:0,
        hint:"話の 転換（てんかん）だよ。",
        job_title:"話題を変える言葉！",
        job_desc:"『ところで』は 新しい 話題に 切り替える ときに 活躍する言葉だよ！" },

      { q:"「野菜を たべよう。＿＿＿＿、ニンジンや トマトなどだ。」に入る つなぎ言葉は？",
        a:["たとえば","しかし","だから","なぜなら"], c:0,
        hint:"具体的な 例を あげるとき。",
        job_title:"例えを表す言葉！",
        job_desc:"『たとえば』を使って 具体例を あげると、話が ぐっと 分かりやすくなるよ！" },

      { q:"【ニコに おしえてあげよう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"「『しかし』と『だから』って、どうやって 使い分ければ いいの？」" }
        ],
        a:["『だから』は 前の結果（順接）、『しかし』は 予想と 反対のこと（逆接）が 来るときに 使うんだよ！","どちらを使っても 同じ意味だよ","好きな方を 適当に 選べばいいよ","文章の 最後に 使うものだよ"], c:0,
        hint:"順接と 逆接の つかいわけ！",
        speech_text:"ニコに つなぎ言葉のひみつを おしえよう！",
        job_title:"🎓 ニコに おしえた！",
        job_desc:"『だから』は 素直な つながり、『しかし』は ひっくり返す つながり！ この 使い分けが できると 作文も ぐーんと 上手になるよ！" },

      { q:"「一生懸命 勉強した。◯◯◯、テストで 100点が 取れた。」ひらがな3文字で「◯◯◯」と書こう。",
        type:"text_input", correct_answers:["だから"],
        hint:"『だ◯◯』。努力のあとの 嬉しい 結果だよ。",
        rescue_hint:"『だから』だよ。",
        job_title:"接続語 パーフェクト！",
        job_desc:"『だから』が バッチリ決まったね！ つなぎ言葉を マスターすると 長い 文章も らくらく 読めるようになるよ！" }
    ]

  };

  /* ②-b 各問題に「並び順が変わってもズレない」安定id（qid）を自動で振る。
     苦手リスト（weakQuestions）は今までステージid＋配列インデックス番号で問題を指していたため、
     途中に新しい問題を差しこむと指し先がズレるという弱点があった（2026-07-19に発覚）。
     job_title・hint・q冒頭の文字列というほぼ変化しない材料からハッシュを作り、
     STAGES/QUIZZESの中身を書きかえずに済むようにしている。
     ★数値をその場で再生成する（regen）問題は、q/hintが実行時に変わるので、
       このハッシュの元になる「基準文字列」は変化しない部分（job_titleと問題の並び位置）だけを使う。 */
  function stableQid(q, fallbackIdx) {
    var basis = (q.job_title || "") + "|" + (q.regen ? "regen" + fallbackIdx : (q.hint || "") + "|" + (q.q || "").slice(0, 14));
    var h = 5381;
    for (var i = 0; i < basis.length; i++) { h = ((h << 5) + h) + basis.charCodeAt(i); h = h & 0xffffffff; }
    return "h" + (h >>> 0).toString(36);
  }
  Object.keys(QUIZZES).forEach(function (stageId) {
    QUIZZES[stageId].forEach(function (q, idx) { if (!q.qid) q.qid = stableQid(q, idx); });
  });

  /* 公開 */
  window.CONTENT = { stages: STAGES, quizzes: QUIZZES };

  /* ②-c 苦手リストの旧形式（ステージid_q_インデックス番号）を、新形式（ステージid::qid）へ移行する。
     旧形式のまま残っている要素だけを対象に、現在のバンドルからqidを引いて書きかえる。
     何度実行しても安全（新形式はこの正規表現にマッチしないのでスキップされる）。 */
  window.migrateWeakQuestionIds = function () {
    if (!window.saveData || !window.saveData.weakQuestions || window.saveData.weakQuestions.length === 0) return;
    var changed = false;
    window.saveData.weakQuestions = window.saveData.weakQuestions.map(function (weakId) {
      var m = /^(.*)_q_(\d+)$/.exec(weakId);
      if (!m) return weakId; // 新形式（::区切り）や不明な形式はそのまま
      var stId = m[1], qIdx = parseInt(m[2], 10);
      var bundle = QUIZZES[stId];
      if (bundle && bundle[qIdx] && bundle[qIdx].qid) {
        changed = true;
        return stId + "::" + bundle[qIdx].qid;
      }
      return weakId; // 解決できない（ステージが無い等）ものは、ひとまず旧形式のまま残す
    });
    if (changed && typeof window.saveGame === "function") window.saveGame();
  };

  /* ②-d 問題が追加された単元は、すでに「済」になっていても自動で解除する。
     これにより、同じ単元の内容が増えたときにユーザーへ通知し、クリア済み状態を外す。 */
  window.ensureStageQuestionCountTracking = function () {
    if (!window.saveData || !window.CONTENT || !window.CONTENT.quizzes) return false;
    if (!window.saveData.clearedStages) window.saveData.clearedStages = {};
    if (!window.saveData.stageQuestionCounts) window.saveData.stageQuestionCounts = {};
    var updated = false;
    Object.keys(window.CONTENT.quizzes).forEach(function (stageId) {
      var bundle = window.CONTENT.quizzes[stageId];
      var count = Array.isArray(bundle) ? bundle.length : 0;
      var prevCount = window.saveData.stageQuestionCounts[stageId];
      if (prevCount === undefined) {
        window.saveData.stageQuestionCounts[stageId] = count;
        updated = true;
        return;
      }
      if (count > prevCount && window.saveData.clearedStages[stageId]) {
        delete window.saveData.clearedStages[stageId];
        updated = true;
        var stgMeta = null;
        if (window.CONTENT.stages) {
          stgMeta = window.CONTENT.stages.filter(function (s) { return s.id === stageId; })[0];
        }
        var label = (stgMeta && stgMeta.name) ? stgMeta.name : stageId;
        alert("📚 「" + label + "」に新しい問題が追加されたので、これまでの「済」を外しておいたよ！");
      }
      window.saveData.stageQuestionCounts[stageId] = count;
    });
    if (updated) {
      try {
        var snapshot = JSON.stringify(window.saveData);
        localStorage.setItem("kids_lab_v12_pro_" + (window.playerId || ""), snapshot);
        if (window.playerId === "りお" || window.playerId === "りさ") {
          localStorage.setItem("kids_lab_v12_pro_papa", snapshot);
        }
      } catch (e) {}
      if (typeof window.updateUI === "function") window.updateUI();
      if (typeof window.renderStageMaps === "function") window.renderStageMaps();
      if (typeof window.renderSubjectsNav === "function") window.renderSubjectsNav();
    }
    return updated;
  };
  // ★ここでは呼ばない：content.js の実行タイミングでは window.saveData に
  //   まだ実際のセーブデータ（localStorage/GAS由来）が入っていないため（読み込みは非同期）。
  //   実際の呼び出しは index.html の loadGameLocal() / performLogin() 成功時に行う。

  /* ================= ③ 自動パッチ（既存エンジンにそっと乗せる） ================= */

  // 今日の日付（YYYY-MM-DD）。端末の時計を使う。
  function todayStr() {
    var d = new Date();
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  // release_from / release_until の期間内かどうか（どちらも無ければ常に true＝ずっと表示）
  function isStageActive(stg) {
    var t = todayStr();
    if (stg.release_from && t < stg.release_from) return false;   // まだ公開前
    if (stg.release_until && t > stg.release_until) return false; // もう公開終了
    return true;
  }
  window.isStageActive = isStageActive; // テスト用に公開

  // (a) content.js のステージをメニューに合流させる（期間限定ステージは自動で出し入れ）
  window.injectContentStages = function () {
    if (!window.CONTENT || !window.CONTENT.stages) return;
    if (!window.globalStageMaster) window.globalStageMaster = {};
    if (!window.availableSubjects) window.availableSubjects = [];

    // ①期限切れ／まだ公開前になった content.js 由来のステージを取りのぞく（GAS由来はさわらない）
    Object.keys(window.globalStageMaster).forEach(function (sub) {
      Object.keys(window.globalStageMaster[sub]).forEach(function (cat) {
        window.globalStageMaster[sub][cat] = window.globalStageMaster[sub][cat].filter(function (s) {
          if (!s._fromContent) return true;
          var live = window.CONTENT.stages.filter(function (cs) { return cs.id === s.id; })[0];
          return !!live && isStageActive(live);
        });
      });
    });

    // ②いま公開中の content.js ステージを合流させる
    window.CONTENT.stages.forEach(function (stg) {
      if (!isStageActive(stg)) return;
      var sub = String(stg.subject || "japanese").toLowerCase().trim();
      var cat = stg.category || "📚 ステージ";
      if (!window.globalStageMaster[sub]) window.globalStageMaster[sub] = {};
      if (!window.globalStageMaster[sub][cat]) window.globalStageMaster[sub][cat] = [];
      var exists = window.globalStageMaster[sub][cat].some(function (s) { return s.id === stg.id; });
      if (!exists) {
        var tagged = Object.assign({}, stg, { _fromContent: true });
        window.globalStageMaster[sub][cat].push(tagged);
      }
      if (window.availableSubjects.indexOf(sub) === -1) window.availableSubjects.push(sub);
    });
    if (typeof window.refreshGradeAwareSubjects === "function") {
      window.refreshGradeAwareSubjects();
    }
  };

  // (b) 描画のたびにステージを合流させる（GAS読み込みの成功/失敗どちらでも出る）
  if (typeof window.renderSubjectsNav === "function") {
    var _origNav = window.renderSubjectsNav;
    window.renderSubjectsNav = function () { window.injectContentStages(); return _origNav.apply(this, arguments); };
  }
  if (typeof window.renderStageMaps === "function") {
    var _origMaps = window.renderStageMaps;
    window.renderStageMaps = function () { window.injectContentStages(); return _origMaps.apply(this, arguments); };
  }

  // (c) クイズ開始：バンドルに問題があればファイル読み込みせず即スタート
  if (typeof window.launchQuest === "function") {
    var _origLaunch = window.launchQuest;
    window.launchQuest = function () {
      var stg = window.currentStage;
      var bundle = (window.CONTENT && window.CONTENT.quizzes && stg) ? window.CONTENT.quizzes[stg.id] : null;
      if (!bundle) { return _origLaunch(); }
      window.closeBriefing(); window.currentQIdx = 0; window.totalMistakes = 0; window.sessionMissedQuestions = [];
      window.activeItemBuff = null; window.activeBoostMultiplier = 1.0;
      window.currentActiveStageId = stg.id;
      window.currentActiveStageReward = (stg.reward !== undefined && stg.reward !== "") ? Number(stg.reward) : 10;
      window.currentActiveStageIsReview = stg.isReview || false;
      window.currentActiveStageIsMaster = stg.isMaster || false;
      window.quizPool = bundle;
      var show = (stg.showCount && stg.showCount > 0) ? stg.showCount : 10;
      window.currentQuestions = bundle.slice().sort(function () { return Math.random() - 0.5; }).slice(0, show);
      document.getElementById("game-screen").style.display = "block";
      var invBtn = document.getElementById("item-use-in-game-btn");
      if (invBtn) invBtn.style.display = (window.saveData.inventory && window.saveData.inventory.length >= 1) ? "block" : "none";
      window.showQuestionStep();
    };
  }

  // (d) 苦手撃破ラボ：バンドルに元問題があればファイル読み込みせず動かす
  if (typeof window.launchWeakAttackLab === "function") {
    var _origWeak = window.launchWeakAttackLab;
    window.launchWeakAttackLab = function () {
      if (!window.saveData.weakQuestions || window.saveData.weakQuestions.length === 0) { alert("🤖 にがて問題は1つも溜まっていないよ！パーフェクト大社長だね！"); return; }
      // ★複数ステージにまたがる「にがて問題」もぜんぶ集めて1回のラボで消化できるようにする
      // （以前は weakQuestions[0] の教科だけを見ていたため、他ステージ由来のにがてが
      //   何度ラボをやっても消化されずに残り続けるバグがあった）
      var targetWeakList = [];
      var resolvedStages = {};
      window.saveData.weakQuestions.forEach(function (weakId) {
        var stId = null, b = null, hit = null;
        if (weakId.indexOf("::") !== -1) {
          // 新形式：ステージid::qid（並び順が変わってもズレない）
          var sepPos = weakId.indexOf("::");
          stId = weakId.slice(0, sepPos);
          var qid = weakId.slice(sepPos + 2);
          b = (window.CONTENT && window.CONTENT.quizzes) ? window.CONTENT.quizzes[stId] : null;
          if (b) { for (var i = 0; i < b.length; i++) { if (b[i].qid === qid) { hit = b[i]; break; } } }
        } else {
          // 旧形式（未移行分の保険）：ステージid_q_インデックス番号
          var sepIdx = weakId.lastIndexOf("_q_");
          if (sepIdx !== -1) {
            stId = weakId.slice(0, sepIdx);
            var qIdx = parseInt(weakId.slice(sepIdx + 3), 10);
            b = (window.CONTENT && window.CONTENT.quizzes) ? window.CONTENT.quizzes[stId] : null;
            if (b && b[qIdx]) hit = b[qIdx];
          }
        }
        if (hit) {
          var o = Object.assign({}, hit);
          o.isRealWeak = true; o.rawWeakId = weakId; o._originStgId = stId;
          targetWeakList.push(o);
          resolvedStages[stId] = b;
        }
      });
      // content.js側に1つも見つからなかった場合だけ、旧来の単一ステージ読み込み方式にゆずる
      if (targetWeakList.length === 0) { return _origWeak(); }
      window.weakAttackModeActive = true; window.totalMistakes = 0;
      window.weakInitialCountAtLaunch = window.saveData.weakQuestions.length; window.weakEarnedQInSession = 0;
      window.activeItemBuff = null; window.activeBoostMultiplier = 1.0; window.currentActiveStageId = null;
      if (targetWeakList.length < 3) {
        var real = targetWeakList[0];
        var srcBundle = resolvedStages[real._originStgId];
        if (srcBundle && srcBundle.length > 1) {
          var dummies = srcBundle.slice().sort(function () { return Math.random() - 0.5; }).filter(function (q) { return q.q !== real.q; }).slice(0, 3 - targetWeakList.length);
          dummies.forEach(function (dq, idx) { targetWeakList.push(Object.assign({}, dq, { isRealWeak: false, rawWeakId: "dummy_fade_" + idx })); });
        }
      }
      window.currentQuestions = targetWeakList.sort(function () { return Math.random() - 0.5; }); window.currentQIdx = 0;
      var hint = document.getElementById("game-hint-text"); if (hint) hint.textContent = "🧬 苦手撃破ラボ：弱点を克服してトークンを両替しよう！";
      document.getElementById("game-screen").style.display = "block";
      var invBtn2 = document.getElementById("item-use-in-game-btn");
      if (invBtn2) invBtn2.style.display = (window.saveData.inventory && window.saveData.inventory.length >= 1) ? "block" : "none";
      window.showQuestionStep();
    };
  }

  console.log("[content.js] 読み込み完了：ステージ " + STAGES.length + " 件 / 問題バンドル " + Object.keys(QUIZZES).length + " 件");
})();