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
      lab_url: ""
    }
    // ← 次のステージはここに追記
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