/* =====================================================================
   js/read-guard.js — 📖 はやおしが つづいた ときだけ「読む 時間」（2026-11-12）
   保護者：問題を 読む 前に 押して いる（10/19 は 3秒未満が 81%）。ただし 10/2 に「読む 時間ロック」を 全部の 問題に
   かけた ときは「次の 問題への 移り変わりが もたつく」ので 0 に した（index.html の READ_LOCK）。
   → いつもは 今まで どおり すぐ 押せる。「読み切れない 速さ」の 答えが つづいた ときだけ、つぎの 数問に 短い 読む 時間を 入れる。
   - はやおし＝その 問題の 1回目の 答えが 400ms＋30ms×問題文の 文字数 より 早い（js/swift-combo.js の「速すぎ」、
     answerDaily の [15]「読む 前に 押した」と 同じ 目安。正解でも 数える）。
   - 直近 3問（WINDOW）の うち 2問（NEED）が はやおし → つぎの 5問（HOLD）は、その 目安の 時間だけ 選択肢が 押せない
     （さいだい MAX_MS。表示は index.html の applyChoiceReadLock「📖 問題を よく 読んでね…」を そのまま 使う）。
     5問 おわったら もとに もどる。また つづいたら また 入る。
   - 入った とき 1回だけ おしらせ（責めない 言い方）。log_db に「📖読む時間」（1日 LOG_MAX 回まで）。
   - 4択だけ（入力・図の 問題は 対象外）。⚡サバイバルは 対象外。⚡すらすら ふくしゅう・マスターチェックは 別の 画面なので 関係ない。
   - りさ など 対象外：index.html の STUDY_RULE_OFF に readGuard: true。
   - やめる とき：index.html の <script src="./js/read-guard.js"> の 行を 消す。強さは 下の 数字で 変える。
   - saveData.readGuard = { d: "YYYY-M-D", n: その日に 入った 回数 }（小さいので core 行。ここでは saveGame しない＝次の ふつうの 保存で いっしょに のこる）。
   - 注意：読む 時間が 入って いる 間は はやおしが できないので、answerDaily[15]（読む 前に 押した）は その分 へる。
     ダッシュボードで 見る ときは「📖読む時間」の 回数と いっしょに 見る。
   ===================================================================== */
(function () {
  "use strict";
  var MIN_BASE = 400, MIN_PER = 30;   // 読む 目安（js/swift-combo.js と 同じ）
  var WINDOW = 3, NEED = 2, HOLD = 5; // 直近 WINDOW 問の うち NEED 問が はやおし → つぎの HOLD 問
  var MAX_MS = 2500;                  // 1問の 読む 時間の 上限。じっくりボーナス（js/think-bonus.js・3秒〜）に 待つ だけで とどかない 長さに する
  var LOG_MAX = 3;                    // log_db に 送るのは 1日 この 回数まで

  var recent = [], left = 0, lastQ = null;

  function off() { return (window.studyRuleOff && window.studyRuleOff("readGuard")) || window.survivalModeActive; }
  function qlen(cur) { return String((cur && cur.q) || "").replace(/<[^>]*>/g, "").replace(/\s+/g, "").length; }
  function minMs(cur) { return MIN_BASE + MIN_PER * qlen(cur); }
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  function arm() {
    left = HOLD; recent = [];
    try {
      if (window.v2Toast) window.v2Toast("📖 ちょっと はやいかも。<br><span style='font-size:13px'>つぎの " + HOLD + "問は、読む 時間を すこし とるね</span>", 2600);
      var sd = window.saveData; if (!sd) return;
      var g = sd.readGuard; if (!g || typeof g !== "object" || g.d !== today()) g = sd.readGuard = { d: today(), n: 0 };
      g.n++;
      if (g.n <= LOG_MAX && window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "📖読む時間", msg: "はやおしが つづいた → つぎの " + HOLD + "問に 読む 時間（きょう " + g.n + "回目）" });
    } catch (e) {}
  }

  // 1回目の 答えの 速さを 見る（index.html の triggerCorrectAnswer / triggerWrongAnswer が recordAnswerLog を 呼ぶ）
  var origLog = window.recordAnswerLog;
  if (typeof origLog === "function" && !origLog._readGuard) {
    var wrapped = function (current, correct) {
      try {
        if (current && current !== lastQ) {
          lastQ = current;
          var t0 = window.currentQuestionStartedAt;
          if (!off() && typeof t0 === "number" && current.a && current.a.length && current.type !== "text_input") {
            var ms = Math.max(0, Date.now() - t0);
            if (left <= 0) { // 読む 時間が 入って いる 間は 数えない（その 間は はやおしが できない）
              recent.push(ms < minMs(current) ? 1 : 0);
              if (recent.length > WINDOW) recent.shift();
              if (recent.reduce(function (a, b) { return a + b; }, 0) >= NEED) arm();
            }
          }
        }
      } catch (e) {}
      return origLog.apply(this, arguments);
    };
    Object.keys(origLog).forEach(function (k) { wrapped[k] = origLog[k]; }); // ほかの js の 二重つつみ防止の しるし（_thinkWrapped・_stkWrapped）を 引きつぐ
    wrapped._readGuard = true;
    window.recordAnswerLog = wrapped;
  }

  // 選択肢を 押せない 時間（index.html の showQuestionStep → applyChoiceReadLock が 1問に 1回 呼ぶ）
  var origMs = window.computeChoiceLockMs;
  window.computeChoiceLockMs = function (current) {
    var base = 0;
    try { base = typeof origMs === "function" ? (origMs(current) || 0) : 0; } catch (e) {}
    try {
      if (left > 0 && !off()) { left--; return Math.max(base, Math.min(MAX_MS, minMs(current))); }
    } catch (e) {}
    return base;
  };

  window.readGuardState = function () { return { left: left, recent: recent.slice() }; }; // たしかめ用
})();
