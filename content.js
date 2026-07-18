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
   ===================================================================== */
(function () {

  /* ================= ① ステージ一覧（メニューに出る） ================= */
  /* スプレッドシートの列と同じ意味： subject / category / id / name / reward */
  /* showCount = 1回の挑戦で出す問題数（全問数より小さくすると毎回ちがう出題に） */
  const STAGES = [
    {
      subject: "算数",                      // ★あなたのスプレッドシートと同じ日本語にすると同じタブに合流します
      category: "わり算（4年）",             // 算数タブの中の見出し（グループ）
      id: "算数/わり算/hissan_amari01",       // ステージID（あなたの命名ルールに合わせた形）
      name: "わり算の筆算（あまり）",
      reward: 10,
      showCount: 10,                        // 1回に出す問題数（全10問中10問。5にすれば毎回ちがう5問）
      video_url: "",
      lab_url: ""
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
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_ar_kakudo.html"
    },
    {
      subject: "国語",
      category: "読解（4年）",
      id: "国語/読解/kosoado01",
      name: "こそあど言葉（指示語）",
      reward: 10, showCount: 10, video_url: "",
      // ★3Dたんけんラボ（別タブ・ドラッグで見まわし／台座を選んでたからさがし）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/国語/lab_kosoado.html"
    },
    {
      subject: "理科",
      category: "電気のはたらき（4年）",
      id: "理科/電気/denki01",
      name: "電気のはたらき（かん電池と回路）",
      reward: 10, showCount: 10, video_url: "", lab_url: ""
    },
    {
      subject: "社会",
      category: "地図（4年）",
      id: "社会/地図/nairiku01",
      name: "海に面していない県（内陸県）",
      reward: 10, showCount: 10, video_url: "", lab_url: ""
    },
    {
      subject: "算数",
      category: "大きな数（4年）",
      id: "算数/大きな数/ookazu01",
      name: "大きな数（万・億）",
      reward: 10, showCount: 10, video_url: "", lab_url: ""
    },
    {
      subject: "国語",
      category: "漢字（4年）",
      id: "国語/漢字/kanji01",
      name: "漢字と部首",
      reward: 10, showCount: 10, video_url: "", lab_url: ""
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_1",
      name: "面積の変身 ① 初級",
      reward: 10, showCount: 10, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=1"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_2",
      name: "面積の変身 ② 中級",
      reward: 10, showCount: 10, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=2"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_3",
      name: "面積の変身 ③ 上級",
      reward: 10, showCount: 10, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=3"
    },
    {
      subject: "算数",
      category: "小数（4年）",
      id: "算数/小数/shosu01",
      name: "小数のしくみと計算",
      reward: 10, showCount: 5, video_url: "", lab_url: ""
    },
    {
      subject: "理科",
      category: "星と月（4年）",
      id: "理科/星/hoshi01",
      name: "夏の星空と月の動き",
      reward: 10, showCount: 5, video_url: "", lab_url: ""
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
    ]

  };

  /* 公開 */
  window.CONTENT = { stages: STAGES, quizzes: QUIZZES };

  /* ================= ③ 自動パッチ（既存エンジンにそっと乗せる） ================= */

  // (a) content.js のステージをメニューに合流させる
  window.injectContentStages = function () {
    if (!window.CONTENT || !window.CONTENT.stages) return;
    if (!window.globalStageMaster) window.globalStageMaster = {};
    if (!window.availableSubjects) window.availableSubjects = [];
    window.CONTENT.stages.forEach(function (stg) {
      var sub = String(stg.subject || "japanese").toLowerCase().trim();
      var cat = stg.category || "📚 ステージ";
      if (!window.globalStageMaster[sub]) window.globalStageMaster[sub] = {};
      if (!window.globalStageMaster[sub][cat]) window.globalStageMaster[sub][cat] = [];
      var exists = window.globalStageMaster[sub][cat].some(function (s) { return s.id === stg.id; });
      if (!exists) window.globalStageMaster[sub][cat].push(stg);
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
      window.closeBriefing(); window.currentQIdx = 0; window.totalMistakes = 0;
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
      var stageId = window.saveData.weakQuestions[0].split("_q_")[0];
      var bundle = (window.CONTENT && window.CONTENT.quizzes) ? window.CONTENT.quizzes[stageId] : null;
      if (!bundle) { return _origWeak(); }
      window.weakAttackModeActive = true; window.totalMistakes = 0;
      window.weakInitialCountAtLaunch = window.saveData.weakQuestions.length; window.weakEarnedQInSession = 0;
      window.activeItemBuff = null; window.activeBoostMultiplier = 1.0; window.currentActiveStageId = stageId;
      window.quizPool = bundle;
      var allPoolMap = {}; bundle.forEach(function (q, i) { allPoolMap[stageId + "_q_" + i] = q; });
      var targetWeakList = [];
      window.saveData.weakQuestions.forEach(function (weakId) {
        if (allPoolMap[weakId]) { var o = Object.assign({}, allPoolMap[weakId]); o.isRealWeak = true; o.rawWeakId = weakId; o._originStgId = stageId; targetWeakList.push(o); }
      });
      if (targetWeakList.length > 0 && targetWeakList.length < 3 && bundle.length > targetWeakList.length) {
        var real = targetWeakList[0];
        var dummies = bundle.slice().sort(function () { return Math.random() - 0.5; }).filter(function (q) { return q.q !== real.q; }).slice(0, 3 - targetWeakList.length);
        dummies.forEach(function (dq, idx) { targetWeakList.push(Object.assign({}, dq, { isRealWeak: false, rawWeakId: "dummy_fade_" + idx })); });
      }
      if (targetWeakList.length === 0) { alert("🤖 対象の苦手データが見つからなかったよ！"); window.quitQuest(); return; }
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