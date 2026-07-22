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
      id: "理科/電気/denki01",
      name: "電気のはたらき（かん電池と回路）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "社会",
      category: "地図（4年）",
      id: "社会/地図/nairiku01",
      name: "海に面していない県（内陸県）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "大きな数（4年）",
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
      reward: 10, showCount: 5, video_url: "", lab_url: "",
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
      // ★漢字検定10級 対策（8/20の試験にむけて）。80字を8回に分けて出題。読み・書取・画数の3本立て。
      subject: "漢検",
      category: "10級 だい1回（一〜貝）",
      id: "漢検/10級/dai1kai",
      name: "10級 だい1回：一・右・雨・円・王・音・下・火・花・貝",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-19"
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
      subject: "国語",
      category: "言葉（4年）",
      id: "国語/言葉/setsuboku01",
      name: "文のつながり（つなぎ言葉・接続詞）",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-22"
    },
    {
      // ★漢字検定10級 対策（8/20の試験にむけて）。80字を8回に分けて出題。読み・書取・画数の3本立て。
      subject: "漢検",
      category: "10級 だい2回（学〜見）",
      id: "漢検/10級/dai2kai",
      name: "10級 だい2回：学・気・九・休・玉・金・空・月・犬・見",
      reward: 10, showCount: 10, video_url: "", lab_url: "",
      created: "2026-07-22"
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
        job_desc:"さいごの チェックは『あまり ＜ わる数』。\nこれが できていれば 筆算は バッチリ。おめでとう、わり算マスター！" }
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
        job_desc:"90度 ＋ 90度 ＝ 180度。角度も たし算や ひき算が できるよ。これが できると、角を 組み合わせる もんだいも へっちゃら！" }
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
        job_desc:"遠くの ものは『あれ』。これ・それ・あれ・どれ、で 場所が かわるんだね。" }
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
        job_desc:"電気の 通り道を『回路（かいろ）』と いうよ。わに なって いないと 電気は 流れないんだね。" }
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
        job_desc:"1億 は 1000万 の 10倍。位が 1つ 上がると 10倍に なるきまり、おぼえておこう！" }
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
        job_desc:"『林』は 木が 2つ。ちなみに 木が 3つで『森（もり）』。漢字は 形に いみが かくれて いて おもしろいね！" }
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
        job_desc:"ねらいは『面積÷辺＝もう1つの辺』が できるか。12÷3＝4 だね。" }
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
        job_desc:"ねらいは『両方n倍で 面積は n×n倍』を 見ぬく力。ここが 面積の いちばん おもしろい ところ！" }
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
        job_desc:"ねらいは『分配のきまり（分けても 面積は 同じ）』が わかるか。面積の 見方は、こんなに 深くまで つながるんだ！" }
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
        job_desc:"90度で 交わる 2本の直線は『垂直』。垂直と 平行、この2つが 四角形の 仲間分けにも つながっていくよ！" }
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
        job_desc:"台形・平行四辺形・ひし形・長方形・正方形は、辺の 平行や 長さ、角度の 組み合わせで つながっているよ。仲間分けが できると、図形の 見え方が グッと 広がるね！" }
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
        job_desc:"対角線を 調べると、二等分するか・長さが同じか・垂直に交わるかで、四角形の 仲間が わかる。台形・平行四辺形・ひし形・長方形・正方形、それぞれ ちがう対角線の せいしつを 持っているんだね！" }
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
        job_desc:"正三角形・二等辺三角形・直角三角形。辺の長さと 角の大きさで、三角形も いろんな 仲間に 分けられるんだね！" }
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
        job_desc:"四角形は 対角線で 三角形2つに 分けられるから、内角の和は 180×2＝360度。三角形の きまりが、四角形の 理解にも つながっていくんだね！" }
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
        job_desc:"三角形も 四角形も、辺の長さ・角の大きさ・平行かどうかで 仲間分けできる。この後の 仲間さがしラボで、じっさいに 形を なかま分け してみよう！" }
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
        job_desc:"3 − 1.2 ＝ 1.8。\n整数の「3」には、見えない「.0」が かくれているよ。位を そろえて 引くのが ポイントだね！" }
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
        job_desc:"月は 自分で 光っているわけではなく、「太陽（たいよう）」の 光を はんしゃして 光って見えるんだ。太陽と 月の 位置で、三日月や 満月に 形が かわって見えるよ。" }
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

    "国語/言葉/setsuboku01": [
      { q:"【つなぎ言葉】前とあとの文の かんけいを 考えよう。\n「雨が ふってきた。（　）、かさを さした。」\n（　）に 入る いちばん よい 言葉は どれかな？",
        a:["だから","しかし","なぜなら","たとえば"], c:0,
        hint:"前が 理由（わけ）で、あとが その 結果（けっか）に なっているよ。",
        speech_text:"雨が ふってきた、かっこ、かさを さした。カッコに 入る 言葉は どれかな？",
        job_title:"原因と結果のつながり！",
        job_desc:"正解！「雨がふった（原因）」→「だから」→「かさをさした（結果）」。前の文が 理由に なるときは『だから』を 使うね。" },

      { q:"「いっしょうけんめい 走った。（　）、1位には なれなかった。」\n（　）に 入る いちばん よい 言葉は どれかな？",
        a:["しかし","だから","すると","また"], c:0,
        hint:"前の文から 予想される こととは 反対の 結果に なっているよ。",
        speech_text:"いっしょうけんめい 走った、かっこ、いちいに は なれなかった。カッコに 入る 言葉は どれかな？",
        job_title:"反対のつながり（逆接）！",
        job_desc:"正解！「走った」けれど「1位になれなかった」という 反対（予想とちがう）結果の ときは『しかし（けれども）』を 使うよ。" },

      { q:"「きょうは 早おきを した。（　）、楽しみに していた 遠足が あるからだ。」\n（　）に 入る いちばん よい 言葉は どれかな？",
        a:["なぜなら","だから","けれども","そのうえ"], c:0,
        hint:"あとの文で 理由（〜からだ）を せつめい しているよ。",
        speech_text:"きょうは 早おきを した、かっこ、楽しみに していた 遠足が あるからだ。カッコに 入る 言葉は どれかな？",
        job_title:"理由をくわしく！",
        job_desc:"正解！ あとから 理由を つけくわえる ときは『なぜなら（〜からだ）』を 使うよ。" },

      { q:"「わたしは くだものが 大すきだ。（　）、りんごや いちごなどが 好きだ。」\n（　）に 入る いちばん よい 言葉は どれかな？",
        a:["たとえば","しかし","だから","つまり"], c:0,
        hint:"具体例（ぐたいれい＝まとまった例）を あげているよ。",
        speech_text:"わたしは くだものが 大すきだ、かっこ、りんごや いちごなどが 好きだ。カッコに 入る 言葉は どれかな？",
        job_title:"具体例を出す！",
        job_desc:"正解！ くだものの 具体例（りんご・いちご）を あげているので『たとえば』が ぴったりだね。" },

      { q:"「図書室で 本を 借りた。（　）、ノートも 買ってきた。」\n（　）に 入る いちばん よい 言葉は どれかな？",
        a:["また","しかし","なぜなら","したがって"], c:0,
        hint:"もうひとつ 別の ことを つけくわえて（並べて）いるよ。",
        speech_text:"図書室で 本を 借りた、かっこ、ノートも 買ってきた。カッコに 入る 言葉は どれかな？",
        job_title:"付け加えるつながり！",
        job_desc:"正解！ 別の 出来事を つけくわえる（付け足す）ときは『また（さらに・そのうえ）』を 使うよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『雨が ふった。（　）、かさを さした』の（　）を えらぶ問題！<br>この もんだいは <b>なにを たしかめたい</b>のかな？" }
        ],
        a:["前とあとの文の 関係（原因と結果）を 正しく 理解しているか","漢字を たくさん 書けるか","計算が はやいか","声が 大きいか"], c:0,
        hint:"『つなぎ言葉で 文と文の 関係を つなぐ』のが ポイント。",
        speech_text:"この もんだいの ねらいは なにかな？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『文と文の 関係（原因と結果、反対、理由など）を 読めているか』。つなぎ言葉が つかめると 長い文章も すらすら 読めるように なるよ！" },

      { q:"「話し合いが おわった。（　）、明日の 天気は どうかな？」\n話題（わだい＝話のテーマ）を ガラリと かえる ときに 使う 言葉は？",
        a:["ところで","だから","なぜなら","けれども"], c:0,
        hint:"話の むきを かえる ときに 使う言葉だよ。",
        speech_text:"話し合いが おわった、かっこ、あしたの てんきは どうかな？ 話題を かえる ときに 使う 言葉は？",
        job_title:"話題をかえる！",
        job_desc:"正解！ 話の テーマを 全く 別の 話に かえる（転換する）ときは『ところで』を 使うよ。" },

      { q:"「彼は 毎日 練習し、大会で 優勝した。（　）、努力（どりょく）の 人だ。」\n前までの 話を ひとことで まとめるときに 使う 言葉は？",
        a:["つまり","けれども","たとえば","また"], c:0,
        hint:"『要するに（言いかえると）』という まとめの 言葉だよ。",
        speech_text:"かれは まいにち れんしゅうし 大会で ゆうしょうした、かっこ、どりょくの ひとだ。前までの 話を まとめるときに 使う 言葉は？",
        job_title:"まとめの言葉！",
        job_desc:"正解！ ここまでの 話を ギュッと まとめたり 言いかえたり するときは『つまり（要するに）』を 使うよ。" },

      { q:"「前とあとの 文が 反対（はんたい・予想とちがう）に なるときに 使う つなぎ言葉」は どれかな？",
        a:["しかし","だから","また","なぜなら"], c:0,
        hint:"「〜した。けれども〜だった」という 使い方だよ。",
        speech_text:"反対の ときは？",
        job_title:"つなぎ言葉の分類！",
        job_desc:"正解！『しかし・けれども・だが』は 前の文と 反対の ことを つなぐ 言葉（逆接）だよ。" },

      { q:"「雨が ふった。（　）、運動会は えんきに なった。」\n（　）に 入る ひらがな3文字の つなぎ言葉を 書こう。（「だ」から はじまるよ）",
        type:"text_input", correct_answers:["だから"],
        hint:"「だ○か」の ひらがな 3文字だよ。",
        rescue_hint:"原因と結果をつなぐ『だから』だよ。",
        speech_text:"雨が ふった、かっこ、うんどうかいは えんきに なった。カッコに 入る つなぎ言葉を 書こう。",
        job_title:"つなぎ言葉 マスター！",
        job_desc:"正解！『だから』は 理由と 結果を つなぐ だいじな 言葉。作文でも たくさん つかえるね！" }
    ],

    "漢検/10級/dai2kai": [
      { q:"漢字の 読み方を 答えよう。\n「学校に 行く。」の「学」の 読み方は？",
        a:["がっ","こう","まな","せい"], c:0,
        hint:"「学」と「校」で「がっこう」と 読むよ。",
        speech_text:"学校に 行く、の、学の 読み方は？",
        job_title:"音読み（オンヨミ）せいかい！",
        job_desc:"正解！「学校」の「学」は「がっ（がく）」と 読むよ。「まなぶ」とも 読むね。" },

      { q:"漢字の 読み方を 答えよう。\n「元気が いい。」の「気」の 読み方は？",
        a:["き","け","きん","く"], c:0,
        hint:"「元」と「気」で「げんき」だよ。",
        job_title:"元気いっぱい！",
        job_desc:"正解！「気」は「き（元気・気もち）」と 読むよ。" },

      { q:"漢字の 読み方を 答えよう。\n「青空が 広がる。」の「空」の 読み方は？",
        a:["ぞら（そら）","くう","あ","から"], c:0,
        hint:"「青」と「空」で「あおぞら」と 読むよ。",
        job_title:"青空すっきり！",
        job_desc:"正解！「空」は「そら（あおぞら）」「くう（空気）」などと 読むよ。" },

      { q:"漢字の 読み方を 答えよう。\n「映画を 見る。」の「見」の 読み方は？",
        a:["み","けん","みせ","かん"], c:0,
        hint:"「見る」の「見」だよ。",
        job_title:"見つけるの「み」！",
        job_desc:"正解！「見」は「みる」「けん（見学）」と 読むよ。" },

      { q:"（ひらがな）を 漢字に 直そう。\n「チョコを （九こ） 買った。」の「九」は どれかな？",
        a:["九","丸","力","七"], c:0,
        hint:"「きゅう・く・ここのつ」の かん字だよ。",
        job_title:"数字の かん字！",
        job_desc:"正解！「九」は 2画の かん字。「九こ（ここのつ）」と 読むね。" },

      { q:"（ひらがな）を 漢字に 直そう。\n「日曜日は （やすむ）。」の「休む」は どれかな？",
        a:["休","体","保","本"], c:0,
        hint:"人が 木の そばで やすんでいる 形から できたよ。",
        job_title:"休む 漢字！",
        job_desc:"正解！「休」は 人（イ）が 木の かげで やすむ 様子から できた 漢字だよ。" },

      { q:"（ひらがな）を 漢字に 直そう。\n「かわいい （いぬ）を かう。」の「犬」は どれかな？",
        a:["犬","太","大","天"], c:0,
        hint:"「大」の 右上に チョン（点）が つくよ。",
        job_title:"犬（いぬ）の 漢字！",
        job_desc:"正解！「犬」は「大」の 右上に 点を つけるよ。「太（ふとい）」と まちがえないようにね！" },

      { q:"「金」という 漢字の 画数（かくすう）は 何画かな？",
        a:["8画","7画","9画","6画"], c:0,
        hint:"人（2画）＋ 王（4画）＋ てんふたつ（2画）＝ 8画。",
        job_title:"画数バッチリ！",
        job_desc:"正解！「金」は ぜんぶで 8画。お金や 金曜日で つかうね。" },

      { q:"「玉」という 漢字の 画数（かくすう）は 何画かな？",
        a:["5画","4画","6画","3画"], c:0,
        hint:"「王（4画）」の 右下に テン（1画）を たすよ。",
        job_title:"玉（たま）の 画数！",
        job_desc:"正解！「玉」は 5画。「王」に テンを 1つ 足すと「玉」に なるよ。" },

      { q:"「九」という 漢字の 1画目は どこかな？",
        a:["左はらい（ノ）","右への かがり（乙）","横ぼう","たてぼう"], c:0,
        hint:"まず 左斜め下に スッと はらう（ノ）よ。",
        job_title:"書き順マスター！",
        job_desc:"正解！「九」の 1画目は 左はらい（ノ）。2画目が 横から 下に曲がって はねる（乙）だよ。" },

      { q:"「休」という 漢字の 左がわの 部首（ぶしゅ）は 何かな？",
        a:["にんべん（人）","きへん（木）","さんずい","たてぼう"], c:0,
        hint:"人が たっている 形「イ」だよ。",
        job_title:"部首はっけん！",
        job_desc:"正解！「休」の 左側「イ」は「にんべん（人）」。人が 木の 横で やすむから「休」なんだね。" },

      { q:"「犬」という 漢字の てん（点）は、何画目（なんかくめ）に 書くかな？",
        a:["4画目（さいご）","1画目","2画目","3画目"], c:0,
        hint:"「大」を 3画で 書いた あとに、右上に チョンと 書くよ。",
        job_title:"書き順バッチリ！",
        job_desc:"正解！「犬」は「大」を 書いてから（1〜3画）、さいごの 4画目に 右上の てん（点）を 書くよ。" },

      { q:"「玉」という 漢字の てん（点）は、何画目（なんかくめ）に 書くかな？",
        a:["5画目（さいご）","1画目","3画目","4画目"], c:0,
        hint:"「王」を 4画で 書いた あとに、右下に チョンと 書くよ。",
        job_title:"玉の書き順！",
        job_desc:"正解！「玉」は「王」を 4画で 書いたあと、さいごの 5画目に 右下の てん（点）を 書くよ。" },

      { q:"【問題の ねらいを 見ぬこう】",
        scenario:[
          { name:"ニコ", icon:"🦄", msg:"『休』という 漢字の 左がわ『イ』は『人』を あらわしているんだって！<br>この もんだいは <b>なにを たしかめたい</b>のかな？" }
        ],
        a:["漢字の 成り立ちや 部首の いみを 知っているか","足が はやいか","水泳が とくいか","九九が 言えるか"], c:0,
        hint:"『漢字の 部首や 成り立ち（でき方）』が ポイント。",
        speech_text:"この もんだいの ねらいは？",
        job_title:"🎯 ねらいを 見ぬいた！",
        job_desc:"ねらいは『漢字の 成り立ちや 部首の 意味を 知っているか』。意味が わかると 漢字が おぼえやすく なるよ！" },

      { q:"「青空」を 漢字で 書くとき、「青」の つぎに くる 漢字は なにかな？ 漢字 1文字で 書こう。",
        type:"text_input", correct_answers:["空"],
        hint:"「あおぞら」の「そら」の かん字だよ。",
        rescue_hint:"穴かんむりに 工 で「空」だよ。",
        job_title:"漢検10級マスター！",
        job_desc:"正解！「青空」は「青」＋「空」。漢検10級 合格に むかって 一歩 前進だね！" }
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