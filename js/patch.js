/* =====================================================================
   js/patch.js  ---  content.js分割：ロジック（自動パッチ処理・既存エンジンへの合流）
   ---------------------------------------------------------------------
   読み込み順番： index.html で js/stages.js ・ js/quizzes/*.js（教科ごと）のあとに読み込むこと。
   window.CONTENT_STAGES と、教科ごとの window.CONTENT_QUIZZES_* を取得して合流させます。
   新しい教科ファイルを増やす場合は、下の quizParts に1行足すだけでよい。
   ===================================================================== */
(function () {

  var STAGES = window.CONTENT_STAGES || [];
  var quizParts = [
    window.CONTENT_QUIZZES_MATH,
    window.CONTENT_QUIZZES_SCIENCE,
    window.CONTENT_QUIZZES_JAPANESE,
    window.CONTENT_QUIZZES_SOCIAL,
    window.CONTENT_QUIZZES_KANJI,
    window.CONTENT_QUIZZES_INQUIRY,
    window.CONTENT_QUIZZES_ENGLISH
  ];
  var QUIZZES = {};
  quizParts.forEach(function (part) { if (part) Object.assign(QUIZZES, part); });


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
      // ★2026-08-03 変更：thinking:true（思考力・推論問題）の単元は最低1問を保証しつつ抽出する
      window.currentQuestions = window.pickBalancedQuestions(bundle, show);
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