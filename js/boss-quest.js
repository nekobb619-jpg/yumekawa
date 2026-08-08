/* =====================================================================
   js/boss-quest.js  ---  ボスクエスト（因果関係の構築を「選択式パズル」で練習させるミッション）
   ---------------------------------------------------------------------
   読み込み順番： index.html で js/patch.js のあとに読み込むこと
   （window.saveData / window.saveGame / window.updateUI に依存するため）。

   もとは lab/探究/proto_boss_quest_causal_reasoning.html のプロトタイプ。
   画面ロジックは（#bq-progress / #bq-stage をターゲットにするよう差し替えた以外）
   ほぼそのまま移植し、MISSION_DATAは本番投入用の内容（ひまわりが元気ない・水やり）に差し替え済み。
   報酬は既存のQ（済/日次上限あり）とは別枠の「かけら」を、saveData.bossQuestCleared[missionId]で
   一度きりだけ付与する非消費型レイヤーにしてある（繰り返しクリアしても再付与しない）。

   問題データを差し替えるだけで別の単元（理科・社会など）のミッションに転用できるよう、
   画面ロジックとデータは分離してある。新しいミッションを追加する場合は AGENTS.md 3.5
   （問題生成時の内容精査チェックリスト）を必ず適用すること。
   ===================================================================== */
(function () {

  // ---- 1. 問題データ（本番投入用。小学4年生でも読める語彙・事実確認済み：植物は水切れでしおれ、水やりで回復する） ----
  var MISSION_DATA = {
    id: "himawari_genki_nai_01",
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
      // 日当たり・ひりょうは「問題なし」という事実なので、原因（根拠）としては選べないことに
      // 子ども自身が気づけるようにしてある。
      reasonPhrasing: {
        fact_soil_dry: "土が カラカラに かわいている",
        fact_light_ok: "日当たりは じゅうぶんだった（問題なし）",
        fact_fert_ok: "ひりょうは じゅうぶんだった（問題なし）"
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
      clearTextRepeat: "げんいんを つきとめて、ひまわりを たすけたね！（れんしゅうプレイ）"
    }
  };

  var STEP_COUNT = 5;
  var state = null;

  function freshState() {
    return {
      step: 1,
      hypothesisId: null,
      collectedFacts: [],
      selection: { reasonFactId: null, actionId: null }
    };
  }

  window.launchBossQuest = function () {
    state = freshState();
    document.getElementById("boss-quest-modal").classList.add("open");
    render();
  };

  window.closeBossQuest = function () {
    document.getElementById("boss-quest-modal").classList.remove("open");
  };

  function renderProgress() {
    var progressEl = document.getElementById("bq-progress");
    progressEl.innerHTML = "";
    for (var i = 1; i <= STEP_COUNT; i++) {
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
    if (state.step === 1) renderStep1();
    else if (state.step === 2) renderStep2();
    else if (state.step === 3) renderStep3();
    else if (state.step === 4) renderStep4();
    else if (state.step === 5) renderStep5();
  }

  function renderStep1() {
    var d = MISSION_DATA.step1;
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
    var d = MISSION_DATA.step2;
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-nico-bubble">' + d.prompt + '</div>' +
      '<div class="bq-choice-grid" id="bq-hyp-list"></div>' +
      '<button class="bq-main-btn" id="bq-btn-next" disabled>しらべに行く</button>';
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
  }

  function renderStep3() {
    var d = MISSION_DATA.step3;
    var allCollected = d.tools.every(function (t) { return state.collectedFacts.indexOf(t.factId) !== -1; });
    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-nico-bubble">' + d.prompt + '</div>' +
      '<div class="bq-choice-grid" id="bq-tool-list"></div>' +
      '<ul class="bq-fact-list" id="bq-fact-list"></ul>' +
      '<button class="bq-main-btn" id="bq-btn-next" disabled></button>';
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
  }

  function renderStep4() {
    var d = MISSION_DATA.step4;
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
      '<button class="bq-main-btn" id="bq-btn-judge" disabled>この文章で けってい！</button>';

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
  }

  function judgeStep4() {
    var d = MISSION_DATA.step4;
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
    var d = MISSION_DATA.step5;
    var alreadyCleared = !!(window.saveData && window.saveData.bossQuestCleared && window.saveData.bossQuestCleared[MISSION_DATA.id]);
    var firstClear = !alreadyCleared;

    if (firstClear && window.saveData) {
      if (!window.saveData.bossQuestCleared) window.saveData.bossQuestCleared = {};
      window.saveData.bossQuestCleared[MISSION_DATA.id] = true;
      window.saveData.kakera = (window.saveData.kakera || 0) + MISSION_DATA.rewardKakera;
      if (window.saveGame) window.saveGame();
      if (window.updateUI) window.updateUI();
    }

    var stageEl = document.getElementById("bq-stage");
    stageEl.innerHTML =
      '<div class="bq-clear-screen">' +
        '<div class="bq-big-icon">🎉</div>' +
        '<div class="navi-box" style="text-align:left;">' +
          '<div class="navi-avatar">🦄</div>' +
          '<div class="navi-text">ニコ「' + (firstClear ? d.clearText : d.clearTextRepeat) + '」</div>' +
        '</div>' +
        (firstClear ? '<div class="bq-token-count">🧩 +' + MISSION_DATA.rewardKakera + '</div>' : '') +
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
