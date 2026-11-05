/* =====================================================================
   js/swift-combo.js — ⚡ すらすらコンボ（ふくしゅうで「速くて 正しい」を ほめる）
   ★2026-11-05追加（保護者：じっくり 考える 力と、ふくしゅうでは 速く 正確に 解ける 力の 両方を そだてる）
   ・あたらしい 単元は これまで どおり「じっくり」（js/think-bonus.js）。ふくしゅうの ときだけ この しくみ。
   ・数える 場面：ふくしゅう（クリアずみ ステージを 1日 いじょう あけて やる＝currentActiveStageIsReview）と ⚡すらすら ふくしゅう。
   ・数える 問題：1回目で 正解（ヒント・まちがいの あとは だめ）。読解・論理・探究・探偵ラボ・thinking・ちょっと ながい 問題・
     長い 文章題（問題文 SWIFT_MAX_LEN 文字 こえ）は 数えない（速さより すじ道が 大事）。
   ・「すらすら」：読む 時間（MIN_BASE＋MIN_PER×文字）より 長く、目安（FAST_BASE＋FAST_PER×文字）より 短い。
     速すぎ（読み切れない）タップは 当てずっぽう あつかいで コンボが 切れる。
   ・コンボ：すらすら 正解が 3問 つづくと ⚡コンボ。そこから すらすら 正解 1問 ごとに ＋PTS pts（1日 DAY_CAP ptsまで）。
     まちがい・速すぎ で 0に もどる（pts は へらさない）。ゆっくり 正解は コンボを たもつ（ふえない）。
   ・記録：saveData.swiftDay = { d, pts, ok（すらすら 正解の 数）, n（数えた 問題の 数）, best }（親の 見る 数）。LOG は 5・10 コンボと 日の おわりの 合計。
   ===================================================================== */
(function () {
  "use strict";
  var START = 3, PTS = 2, DAY_CAP = 40, SWIFT_MAX_LEN = 90;
  var MIN_BASE = 400, MIN_PER = 30, FAST_BASE = 3000, FAST_PER = 70;
  var combo = 0;

  function today() { var x = new Date(window.currentServerTime || Date.now()); return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate(); }
  function day() {
    var d = window.saveData; if (!d) return null;
    if (!d.swiftDay || d.swiftDay.d !== today()) d.swiftDay = { d: today(), pts: 0, ok: 0, n: 0, best: 0 };
    return d.swiftDay;
  }
  function plainLen(s) { return String(s || "").replace(/<[^>]+>/g, "").replace(/【Q\.\d+】/g, "").replace(/\s/g, "").length; }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "⚡すらすらコンボ", msg: msg }); } catch (e) {} }
  function toast(html, big) {
    var t = document.createElement("div");
    t.setAttribute("role", "status");
    t.style.cssText = "position:fixed;left:50%;top:" + (big ? "38%" : "14%") + ";transform:translateX(-50%);z-index:10010;background:" + (big ? "linear-gradient(135deg,#f59e0b,#ea580c)" : "#fff7ed") + ";color:" + (big ? "#fff" : "#9a3412") +
      ";border:2px solid #fb923c;border-radius:999px;padding:" + (big ? "12px 22px" : "6px 14px") + ";font:900 " + (big ? "18px" : "13px") + " 'Zen Maru Gothic',sans-serif;box-shadow:0 6px 18px rgba(154,52,18,.25);pointer-events:none;white-space:nowrap";
    t.innerHTML = html; document.body.appendChild(t); setTimeout(function () { t.remove(); }, big ? 1600 : 1100);
  }
  function eligibleQuestion(q, stageId) {
    if (!q) return false;
    if (q.thinking || q.isDetectiveBoss || q.ch) return false;
    var sid = String(stageId || "");
    if (/^(国語\/(読解|情報読解|論理)|探究\/)/.test(sid)) return false;
    if (/探偵ラボ/.test(sid)) return false;
    return plainLen(q.q) <= SWIFT_MAX_LEN;
  }
  function judge(ms, len) {
    if (typeof ms !== "number") return "slow";
    if (ms < MIN_BASE + MIN_PER * len) return "tooFast";
    return ms <= FAST_BASE + FAST_PER * len ? "swift" : "slow";
  }
  function refresh() { try { if (window.updateUI) window.updateUI(); } catch (e) {} }

  // 1問ごとに よぶ。{ ok, first, ms, q, stageId, review }
  window.swiftComboHit = function (o) {
    try {
      if (!o || !o.review || !window.saveData || !eligibleQuestion(o.q, o.stageId)) return;
      var s = day(); if (!s) return;
      s.n++;
      if (!o.ok) { combo = 0; return; }
      if (!o.first) return; // まちがえた あとの 正解は 数えない（コンボは もう 切れて いる）
      var j = judge(o.ms, plainLen(o.q.q) + plainLen((o.q.a || []).join("")) / 4);
      if (j === "tooFast") { combo = 0; return; }
      if (j === "slow") return;
      s.ok++; combo++; if (combo > s.best) s.best = combo;
      if (combo < START) { if (combo === START - 1) toast("⚡ すらすら！ あと 1問で コンボ"); return; }
      var add = Math.max(0, Math.min(PTS, DAY_CAP - s.pts));
      if (add) { window.saveData.pts = (window.saveData.pts || 0) + add; s.pts += add; window.sessionEarnedPts = (window.sessionEarnedPts || 0) + add; refresh(); }
      var big = combo === 5 || combo === 10 || (combo > 10 && combo % 10 === 0);
      toast("⚡ すらすらコンボ ×" + combo + (add ? "　+" + add + "pts" : ""), big);
      if (big) log("コンボ " + combo + "（今日 すらすら " + s.ok + "／" + s.n + "問・+" + s.pts + "pts）");
    } catch (e) { console.error("swift-combo", e); }
  };
  window.swiftComboReset = function () { combo = 0; };

  // ステージの 問題（index.html の triggerCorrectAnswer／triggerWrongAnswer）に つなぐ
  function wrap(name, ok) {
    var o = window[name]; if (typeof o !== "function" || o._swWrapped) return !!(o && o._swWrapped);
    var w = function (current) {
      var first = !!window.currentFirstTry && !window.currentQuestionHintUsed, st = window.currentQuestionStartedAt;
      var review = !!window.currentActiveStageIsReview && !window.weakAttackModeActive && !window.survivalModeActive && !window.tornadoQuizModeActive && !window.dynamicPracticeModeActive;
      var r = o.apply(this, arguments);
      window.swiftComboHit({ ok: ok, first: first, ms: typeof st === "number" ? Date.now() - st : null, q: current, stageId: window.currentActiveStageId, review: review });
      return r;
    };
    w._swWrapped = true; window[name] = w; return true;
  }
  function install() { return wrap("triggerCorrectAnswer", true) & wrap("triggerWrongAnswer", false); }
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
  // ステージが かわったら コンボは 0から
  var lastStage = null;
  setInterval(function () { if (window.currentActiveStageId !== lastStage) { lastStage = window.currentActiveStageId; combo = 0; } }, 1000);
})();
