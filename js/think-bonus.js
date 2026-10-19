/* =====================================================================
   js/think-bonus.js — 🧠 じっくりボーナス（うら）
   ★2026-10-19追加（保護者：ちゃんと 考えて 解いて いれば 裏で pt を ふやしたい）
   ・ふつうの ステージで「1回目で 正解」かつ「THINK_MIN_MS〜THINK_MAX_MS かけて 答えた」問題 1問ごとに +THINK_PTS pt。
     はやすぎる（読み切れない）答えと、放置（長すぎ）は 数えない。ヒントアイテムを 使った 問題も 数えない。
   ・子どもの 画面には 何も 出さない（はやく 押しても 損は しない。考えた 方が 少し 得）。
   ・1日の 上限は THINK_DAY_CAP pt。
   ・saveData.thinkBonus = { d:"2026-10-19", n:数えた問題, p:わたした pt }、
     saveData.thinkBonusLog = [{ d, n, p }]（日ごと・さいご 60日）＝ 保護者ダッシュボード用。
   ・ステージを 最後まで やった ときに LOG へ「🧠じっくりボーナス（うら） +Npt（M問）」を 1行 残す。
   ・判定は recordAnswerLog（js/adaptive-question-generator.js）が 記録した 解答だけ（特訓ラボ・SOS・遠征などは もともと 対象外）。
   ===================================================================== */
(function () {
  var THINK_MIN_MS = 3000, THINK_MAX_MS = 120000, THINK_PTS = 3, THINK_DAY_CAP = 30;
  window.THINK_BONUS_RULE = { minMs: THINK_MIN_MS, maxMs: THINK_MAX_MS, pts: THINK_PTS, dayCap: THINK_DAY_CAP };
  var session = { n: 0, p: 0 };

  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  function award() {
    var sd = window.saveData; if (!sd) return;
    var t = today();
    if (!sd.thinkBonus || sd.thinkBonus.d !== t) sd.thinkBonus = { d: t, n: 0, p: 0 };
    var tb = sd.thinkBonus, add = Math.max(0, Math.min(THINK_PTS, THINK_DAY_CAP - tb.p));
    tb.n += 1; tb.p += add;
    if (add > 0) { sd.pts = (Number(sd.pts) || 0) + add; session.p += add; }
    session.n += 1;
    var log = Array.isArray(sd.thinkBonusLog) ? sd.thinkBonusLog : [];
    var last = log[log.length - 1];
    if (last && last.d === t) { last.n = tb.n; last.p = tb.p; } else log.push({ d: t, n: tb.n, p: tb.p });
    sd.thinkBonusLog = log.slice(-60);
  }

  function install() {
    var orig = window.recordAnswerLog;
    if (typeof orig !== "function" || orig._thinkWrapped) return false;
    var w = function (current, correct) {
      var sd = window.saveData, before = sd ? (sd.totalAnswersCount || 0) : 0;
      var startedAt = window.currentQuestionStartedAt, firstTry = !!window.currentFirstTry, hint = !!window.currentQuestionHintUsed;
      var r = orig.apply(this, arguments);
      try {
        var logged = sd && (sd.totalAnswersCount || 0) > before; // recordAnswerLog が 数えた ＝ ふつうの ステージ
        var ms = typeof startedAt === "number" ? Date.now() - startedAt : null;
        if (logged && correct && firstTry && !hint && ms !== null && ms >= THINK_MIN_MS && ms <= THINK_MAX_MS) award();
      } catch (e) {}
      return r;
    };
    w._thinkWrapped = true; window.recordAnswerLog = w;
    return true;
  }

  function installExit() {
    var orig = window.exitToMainMenu;
    if (typeof orig !== "function" || orig._thinkWrapped) return false;
    var w = function () {
      var stage = window.currentActiveStageId, s = session;
      session = { n: 0, p: 0 };
      window.thinkClearCount = s.n; // クリアの メッセージで「じっくり 考えて 正解：N問」と ほめる（pt は 見せない）
      if (s.n > 0 && window.syncWithGoogleSpreadsheet) {
        try { window.syncWithGoogleSpreadsheet("LOG", { stage: stage || "🧠じっくり", msg: "🧠じっくりボーナス（うら） +" + s.p + "pt（" + s.n + "問）" }); } catch (e) {}
      }
      return orig.apply(this, arguments);
    };
    w._thinkWrapped = true; window.exitToMainMenu = w;
    return true;
  }
  // 中断（やめる）の ときは 数えた 分を そのまま にして、つぎの ステージの 分と まぜない
  function installQuit() {
    var orig = window.abortQuest;
    if (typeof orig !== "function" || orig._thinkWrapped) return false;
    var w = function () { session = { n: 0, p: 0 }; return orig.apply(this, arguments); };
    w._thinkWrapped = true; window.abortQuest = w;
    return true;
  }

  function tryAll() { var a = install(), b = installExit(), c = installQuit(); return a && b && c; }
  if (!tryAll()) {
    var tries = 0, iv = setInterval(function () { tryAll(); if (++tries > 40 || (window.recordAnswerLog && window.recordAnswerLog._thinkWrapped && window.exitToMainMenu && window.exitToMainMenu._thinkWrapped)) clearInterval(iv); }, 250);
  }
})();
