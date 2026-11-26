/* 🙈 かくして もう一度（2026-11-26 新しい仕組みの日①：作戦会議 2026-11-25-chu1-kabe 案1）
   保護者が 見た 動画「中1の 壁」：答えを 見て 写すだけ を やめ、解説を 読んだ あと かくして 自力で 解き直す。
   ステージの さいごの「まちがえた 問題の ふりかえり」（index.html renderReviewChatStep。🤔なるほど？ つき）で
   「わかった！」を おした あと、同じ 問題を こたえ・解説を かくして もう一度（選択肢の ならびを かえる）。
   ・4択（a と c が ある）の 問題だけ。入力・シナリオの 問題は いつも どおり 次へ。
   ・1回の ステージで 2問まで（軽い 負荷）。「とばす」も OK（しからない）。ごほうびは なし。
   ・saveData.redo { n, ok, days:{ "YYYY-MM-DD":[n,ok] }（35日） }。週次リレーで redo 正解率（ok/n）を 見る。
   ・LOG「🙈かくしてもう一度」（1問ごと ⭕／❌）。りさ は STUDY_RULE_OFF.redo で 出ない。
   ・やめる ときは index.html の <script> の 行を 消す（reviewChatNext を つつんで いる だけ）。 */
(function () {
  "use strict";
  var MAX_PER_STAGE = 2, lastList = null, cnt = 0, cur = null;
  function off() { return !!(window.studyRuleOff && window.studyRuleOff("redo")); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function plain(s) { return String(s || "").replace(/<[^>]*>/g, ""); }
  function dayKey() { var d = new Date(window.currentServerTime || Date.now()); d = new Date(d.getTime() + 9 * 3600000); return d.toISOString().slice(0, 10); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ok4(item) { return item && Array.isArray(item.a) && item.a.length >= 2 && typeof item.c === "number" && item.a[item.c] != null && !(item.correct_answers && item.correct_answers.length); }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🙈かくしてもう一度", msg: msg }); } catch (e) {} }
  function record(ok) {
    var sd = window.saveData; if (!sd) return;
    var r = sd.redo && typeof sd.redo === "object" ? sd.redo : (sd.redo = { n: 0, ok: 0, days: {} });
    if (!r.days) r.days = {};
    r.n = (r.n || 0) + 1; if (ok) r.ok = (r.ok || 0) + 1;
    var k = dayKey(), d = r.days[k] || [0, 0]; d[0]++; if (ok) d[1]++; r.days[k] = d;
    var keys = Object.keys(r.days).sort(); while (keys.length > 35) delete r.days[keys.shift()];
    try { if (window.saveGame) window.saveGame(); } catch (e) {}
  }
  function show(item) {
    var body = document.getElementById("review-chat-body"), btn = document.getElementById("review-chat-next-btn"); if (!body || !btn) return false;
    var ord = shuffle(item.a.map(function (_, j) { return j; }));
    cur = { item: item, done: false };
    body.innerHTML = '<div class="chat-container"><div class="chat-msg left"><div class="chat-icon">🦄</div><div class="chat-bubble"><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">ニコ</div>' +
      '🙈 こたえと 解説を かくしたよ。<b>見ないで もう一度</b> とけるかな？（ならびが かわって いるよ）</div></div></div>' +
      '<div class="review-chat-qtext" style="margin-top:6px">' + esc(plain(item.q)) + '</div>' +
      '<div id="redo-choices">' + ord.map(function (j) { return '<button type="button" data-redo="' + j + '" style="display:block;width:100%;text-align:left;border:2px solid #c4b5fd;background:#fff;border-radius:14px;padding:10px 12px;margin-top:7px;font:800 14px \'Zen Maru Gothic\',sans-serif;color:#3b2f52;cursor:pointer">' + esc(plain(item.a[j])) + '</button>'; }).join("") + '</div>' +
      '<div id="redo-res" style="margin-top:8px"></div>';
    btn.textContent = "いまは とばす ▶";
    body.querySelectorAll("[data-redo]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!cur || cur.done) return; cur.done = true;
        var ok = Number(b.getAttribute("data-redo")) === item.c;
        body.querySelectorAll("[data-redo]").forEach(function (x) { x.disabled = true; x.style.opacity = Number(x.getAttribute("data-redo")) === item.c ? "1" : ".45"; if (Number(x.getAttribute("data-redo")) === item.c) x.style.borderColor = "#22c55e"; });
        document.getElementById("redo-res").innerHTML = '<div style="border-radius:14px;padding:10px 12px;font-weight:900;line-height:1.6;background:' + (ok ? "#dcfce7" : "#fee2e2") + '">' +
          (ok ? "✨ 自分で できた！ 見ないで とけたら、もう 自分の 力だよ" : "こたえは「" + esc(plain(item.a[item.c])) + "」。だいじょうぶ、また ふくしゅうで 出て くるよ") + '</div>';
        record(ok); log((ok ? "⭕ " : "❌ ") + plain(item.q).slice(0, 40));
        btn.textContent = ((window.reviewChatIdx || 0) >= (window.sessionMissedQuestions || []).length - 1) ? "とじる 🎀" : "つぎへ 🎀";
      });
    });
    return true;
  }
  function wrap() {
    var orig = window.reviewChatNext; if (typeof orig !== "function" || orig._redo) return false;
    var w = function () {
      try {
        var list = window.sessionMissedQuestions || [], item = list[window.reviewChatIdx];
        if (list !== lastList) { lastList = list; cnt = 0; }
        if (!off() && item && !item._redoDone && ok4(item) && cnt < MAX_PER_STAGE) { item._redoDone = 1; if (show(item)) { cnt++; return; } }
      } catch (e) { console.error("redo", e); }
      cur = null; return orig.apply(this, arguments);
    };
    w._redo = true; window.reviewChatNext = w; return true;
  }
  if (!wrap()) document.addEventListener("DOMContentLoaded", wrap);
  window.redoStats = function () { var r = (window.saveData || {}).redo || {}; return { n: r.n || 0, ok: r.ok || 0, days: r.days || {} }; };
})();
