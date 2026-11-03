/* =====================================================================
   js/speed-review.js — ⚡ すらすら ふくしゅう（高速反復と メンテナンス）
   ★2026-11-04追加（保護者：復習の 反復が 大事。動画「高速反復と 維持（メンテナンス）」の 考え方）
   - 考え方：記憶の かぎは「かけた 時間」より「反復の 回数」。前に クリアした ところを、すばやく 何回も まわして わすれない 状態を たもつ。
   - 出す 問題：クリアずみの ステージの 4択だけ（図・入力・作図の 問題は 出さない）。にがて問題も まぜる。
   - 1回 10まい。正解でも 思い出すのに 時間が かかったら（SLOW_MS 以上）「あと もう少し」で 箱は 上がらない。
   - 箱（ライトナー方式）：saveData.speedRev.c[カードの 短い かぎ] = 箱×100000 ＋ 次に 出る 日（2026-01-01 から 何日め）。
     かぎは「ステージid::qid」を 6文字ほどの ハッシュに した もの（セーブの 1行 42000文字に おさめる ため。ext 行に 入れる）。
     正解（すらすら）で 箱 1つ 上へ、まちがいで 0 へ もどる。いっぱいに なったら（MAX_CARDS）仕上がった 古い カードから けす。
     次に 出る 日は BOX_DAYS[箱] 日あと。まちがえた カードは その回の さいごに もう一度 出す（すぐ くりかえす）。
   - 「すらすら（SLOW_MS より 速く 正解）」は 当てずっぽうでは なく「仕上がった しるし」として あつかう。
     この モードの 答えは answerLogs／answerDaily に 入れない（ダッシュボードの「3秒未満＝読み切れて いない」の 数字を くるわせない）。
   - 1日 さいしょの 1回を 最後まで やると シールの ふくろ（「ふくしゅう」と 同じ わく：1日 1つ）。log_db に「⚡すらすらふくしゅう」。
   ===================================================================== */
(function () {
  "use strict";
  var N = 10, SLOW_MS = 6000, BOX_DAYS = [0, 1, 2, 4, 7, 14], MAX_CARDS = 600, EPOCH = Date.UTC(2026, 0, 1);

  function sd() { return window.saveData || {}; }
  function st() {
    var d = sd();
    if (!d.speedRev || typeof d.speedRev !== "object") d.speedRev = {};
    var s = d.speedRev;
    if (!s.c || typeof s.c !== "object") s.c = {};
    return s;
  }
  function hk(k) { var h = 5381; for (var i = 0; i < k.length; i++) h = ((h << 5) + h + k.charCodeAt(i)) >>> 0; return h.toString(36); }
  function dnum(key) { return Math.round((Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) - EPOCH) / 86400000); }
  function getBox(k) { var v = st().c[hk(k)]; return v == null ? null : Math.floor(v / 100000); }
  function getDue(k) { var v = st().c[hk(k)]; return v == null ? null : v % 100000; }
  function setCard(k, b, dueKey) {
    var c = st().c; c[hk(k)] = b * 100000 + dnum(dueKey);
    var ks = Object.keys(c); if (ks.length <= MAX_CARDS) return;
    ks.sort(function (a, z) { return (Math.floor(c[z] / 100000) - Math.floor(c[a] / 100000)) || (c[a] % 100000 - c[z] % 100000); });
    ks.slice(0, ks.length - MAX_CARDS).forEach(function (x) { delete c[x]; });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dayKey(ms) { var x = new Date(ms); return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); }
  function now() { return window.currentServerTime || Date.now(); }
  function today() { return dayKey(now()); }
  function addDays(n) { return dayKey(now() + n * 86400000); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function plain(s) { return String(s || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "⚡すらすらふくしゅう", msg: msg }); } catch (e) {} }

  function allQuizzes() {
    var out = {};
    Object.keys(window).forEach(function (k) { if (k.indexOf("CONTENT_QUIZZES") === 0 && window[k] && typeof window[k] === "object") Object.keys(window[k]).forEach(function (sid) { out[sid] = window[k][sid]; }); });
    return out;
  }
  var FK = null;
  function figKeys() { if (FK) return FK; FK = {}; Object.keys(window.FIGURE_MAP || {}).forEach(function (f) { FK[plain(f.split("‖")[0]).replace(/\s+/g, "")] = 1; }); return FK; }
  function usable(q) {
    if (!q || !Array.isArray(q.a) || q.a.length < 2 || typeof q.c !== "number" || !q.a[q.c]) return false;
    if (q.type || q.canvas_code || q.diagram || q.kanjiBuild || q.correct_answers) return false;
    var t = plain(q.q); if (!t || t.length > 110 || /<svg|<img/i.test(q.q)) return false;
    if (figKeys()[t.replace(/\s+/g, "")]) return false;
    return q.a.every(function (x) { return typeof x === "string" && x.length <= 40; });
  }
  // カードの 山：クリアずみ ステージの 4択 ＋ にがて問題
  function pool() {
    var d = sd(), Q = allQuizzes(), cl = d.clearedStages || {}, out = [];
    Object.keys(cl).forEach(function (sid) {
      if (!cl[sid] || !Q[sid]) return;
      Q[sid].forEach(function (q, i) { if (usable(q)) out.push({ k: sid + "::" + (q.qid || i), sid: sid, q: q }); });
    });
    return out;
  }
  function weakSet() { var s = {}; (sd().weakQuestions || []).forEach(function (w) { s[typeof w === "string" ? w : (w && (w.id || w.key)) || ""] = 1; }); return s; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // 今日の 10まい：①にがて ②期日が きた カード（箱が ひくい 順）③まだ 一度も やって いない カード
  function pickDeck() {
    var t = dnum(today()), all = pool(), wk = weakSet();
    var weak = [], due = [], fresh = [];
    all.forEach(function (c) {
      if (wk[c.k]) weak.push(c);
      else if (getBox(c.k) != null) { if (getDue(c.k) <= t) due.push(c); }
      else fresh.push(c);
    });
    shuffle(weak); shuffle(fresh);
    due.sort(function (a, b) { return (getBox(a.k) || 0) - (getBox(b.k) || 0) || (Math.random() - 0.5); });
    var deck = weak.slice(0, 3).concat(due).slice(0, N);
    // まだの カードは いろいろな ステージから
    var bySid = {}; fresh.forEach(function (c) { (bySid[c.sid] = bySid[c.sid] || []).push(c); });
    var sids = shuffle(Object.keys(bySid)), i = 0;
    while (deck.length < N && sids.length) { var sid = sids[i % sids.length], l = bySid[sid]; if (l.length) deck.push(l.shift()); else sids.splice(i % sids.length, 1); i++; }
    return deck.slice(0, N);
  }
  function stats() {
    var all = pool(), t = dnum(today()), due = 0, done = 0, top = 0;
    all.forEach(function (c) { var b = getBox(c.k); if (b == null) return; done++; if (b >= 4) top++; if (getDue(c.k) <= t) due++; });
    return { total: all.length, seen: done, due: due, top: top };
  }

  /* ---------------- 画面 ---------------- */
  var ui = null;
  function close() { var m = document.getElementById("spd-modal"); if (m) m.remove(); document.removeEventListener("keydown", onKey, true); ui = null; if (window.renderTutorPlan) try { window.renderTutorPlan(); } catch (e) {} }
  function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
  function shell(inner) {
    var m = document.getElementById("spd-modal");
    if (!m) {
      m = document.createElement("div"); m.id = "spd-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "すらすら ふくしゅう");
      m.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:12px;font-family:'Zen Maru Gothic',sans-serif";
      m.addEventListener("click", function (e) { if (e.target === m) close(); var b = e.target.closest("[data-sp]"); if (b) act(b.getAttribute("data-sp"), b.getAttribute("data-v")); });
      document.body.appendChild(m); document.addEventListener("keydown", onKey, true);
    }
    m.innerHTML = '<div style="background:linear-gradient(165deg,#fff,#fefce8);border-radius:24px;padding:14px;max-width:440px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 10px 0 rgba(202,138,4,.3);color:#3b2f52">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:17px;font-weight:900;color:#a16207">⚡ すらすら ふくしゅう</div>' +
      '<button type="button" data-sp="close" style="border:none;background:#fef3c7;color:#a16207;font:900 14px \'Zen Maru Gothic\';border-radius:999px;padding:7px 14px;cursor:pointer">とじる</button></div>' + inner + '</div>';
    var f = m.querySelector("[data-sp='go'],[data-sp='ans'],[data-sp='next']"); if (f) try { f.focus(); } catch (e) {}
  }
  var BTN = "display:block;width:100%;text-align:left;border:2px solid #fde68a;background:#fff;border-radius:14px;padding:11px 12px;margin-top:7px;font:800 14.5px 'Zen Maru Gothic';color:#3b2f52;cursor:pointer";
  var BIG = "border:none;border-radius:999px;padding:11px 22px;font:900 15px 'Zen Maru Gothic';color:#fff;background:linear-gradient(135deg,#f59e0b,#ea580c);box-shadow:0 4px 0 #9a3412;cursor:pointer";

  function homeHtml() {
    var s = st(), x = stats(), doneToday = s.d === today();
    return '<div style="font-size:13px;font-weight:800;line-height:1.75;background:#fff;border:2px solid #fde68a;border-radius:16px;padding:10px 12px">' +
      '前に クリアした ところを、<b>すばやく 何回も</b> まわして わすれない ように する 練習だよ。<br>' +
      '💡 じっくり 1回 より、<b>すらすら たくさん</b> の 方が 記憶に のこる。<br>' +
      '⏱ 読んだら すぐ 答えが うかぶ（' + (SLOW_MS / 1000) + 'びょう いない）＝ 仕上がり。おそかったり まちがえたら、また すぐ 出て くるよ。</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px;text-align:center">' +
      '<div style="background:#fff7ed;border-radius:12px;padding:6px"><div style="font-size:11px;font-weight:800">もう一度の 日が きた</div><div style="font-size:20px;font-weight:900;color:#c2410c">' + x.due + '</div></div>' +
      '<div style="background:#fefce8;border-radius:12px;padding:6px"><div style="font-size:11px;font-weight:800">やった カード</div><div style="font-size:20px;font-weight:900;color:#a16207">' + x.seen + '<span style="font-size:11px">／' + x.total + '</span></div></div>' +
      '<div style="background:#f0fdf4;border-radius:12px;padding:6px"><div style="font-size:11px;font-weight:800">仕上がり ⭐</div><div style="font-size:20px;font-weight:900;color:#15803d">' + x.top + '</div></div></div>' +
      (x.total ? '<div style="text-align:center;margin-top:12px"><button type="button" data-sp="go" style="' + BIG + '">⚡ ' + N + 'まい はじめる</button></div>' : '<div style="text-align:center;margin-top:12px;font-weight:800">まだ クリアした ステージが ないよ。ステージを クリアすると ここに カードが ふえるよ</div>') +
      '<div style="font-size:11.5px;font-weight:700;color:#78716c;text-align:center;margin-top:8px">' + (doneToday ? "✅ 今日の 1回は できたよ。何回 やっても いいよ（くりかえすほど 強く なる）" : "今日 さいしょの 1回を 最後まで やると 🎀 シールの ふくろ（ふくしゅう）") + '</div>';
  }
  function cardHtml() {
    var c = ui.deck[ui.i], q = c.q, ord = ui.ord;
    var head = '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;color:#a16207"><span>' + (ui.i + 1) + ' ／ ' + ui.deck.length + (ui.again ? '（もう一度）' : '') + '</span><span>⭐ すらすら ' + ui.fast + '</span></div>' +
      '<div style="height:8px;background:#fef3c7;border-radius:999px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:' + Math.round(ui.i / ui.deck.length * 100) + '%;background:linear-gradient(90deg,#f59e0b,#ea580c)"></div></div>';
    var qs = '<div style="background:#fff;border:2px solid #fde68a;border-radius:16px;padding:12px;font-size:15.5px;font-weight:900;line-height:1.6">' + esc(plain(q.q)) + '</div>';
    if (ui.res) {
      var ok = ui.res.ok, slow = ui.res.slow;
      return head + qs + '<div style="margin-top:8px;border-radius:14px;padding:10px 12px;font-weight:900;line-height:1.6;background:' + (ok && !slow ? "#dcfce7" : ok ? "#fef9c3" : "#fee2e2") + '">' +
        (ok && !slow ? "⭐ すらすら！（" + (ui.res.ms / 1000).toFixed(1) + "びょう）" : ok ? "⭕ 正解。でも " + (ui.res.ms / 1000).toFixed(1) + "びょう かかったね。すらすら に なるまで また 出すよ" : "❌ 答えは「" + esc(q.a[q.c]) + "」。この カードは さいごに もう一度 出るよ") +
        (q.job_desc && !(ok && !slow) ? '<div style="font-size:12.5px;font-weight:700;margin-top:4px">' + esc(plain(q.job_desc)) + '</div>' : '') + '</div>' +
        '<div style="text-align:center;margin-top:10px"><button type="button" data-sp="next" style="' + BIG + '">つぎ ▶</button></div>';
    }
    return head + qs + ord.map(function (j) { return '<button type="button" data-sp="ans" data-v="' + j + '" style="' + BTN + '">' + esc(q.a[j]) + '</button>'; }).join("");
  }
  function endHtml() {
    var r = ui.result || {};
    return '<div style="text-align:center;font-size:42px">' + (ui.fast >= 8 ? "🏆" : ui.fast >= 5 ? "⚡" : "💪") + '</div>' +
      '<div style="text-align:center;font-size:16px;font-weight:900">' + ui.base + 'まい まわしたよ！ すらすら ⭐ ' + ui.fast + 'まい</div>' +
      '<div style="font-size:13px;font-weight:800;line-height:1.75;background:#fff;border:2px solid #fde68a;border-radius:16px;padding:10px 12px;margin-top:8px">' +
      (ui.miss ? "まちがえた カードは 明日 また 出るよ。" : "") + (ui.slowN ? "時間が かかった カードも、明日 また 出るよ。" : "") +
      "すらすら できた カードは、" + BOX_DAYS[1] + "日→" + BOX_DAYS[2] + "日→" + BOX_DAYS[3] + "日→" + BOX_DAYS[4] + "日→" + BOX_DAYS[5] + "日 と だんだん 間を あけて 出るよ。" +
      (r.pack ? "<br>🎀 シールの ふくろを 1つ もらったよ！" : "") + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px"><button type="button" data-sp="go" style="' + BIG + '">⚡ もう 1回</button><button type="button" data-sp="close" style="' + BIG + ';background:#a8a29e;box-shadow:0 4px 0 #57534e">おわる</button></div>';
  }
  function render() { if (!ui) return; shell(ui.phase === "home" ? homeHtml() : ui.phase === "end" ? endHtml() : cardHtml()); if (ui.phase === "card" && !ui.res) ui.t0 = Date.now(); }

  function start() {
    var deck = pickDeck(); if (!deck.length) return;
    ui.deck = deck; ui.base = deck.length; ui.i = 0; ui.fast = 0; ui.miss = 0; ui.slowN = 0; ui.res = null; ui.again = false; ui.retry = {};
    ui.phase = "card"; ui.ord = shuffle(deck[0].q.a.map(function (_, j) { return j; })); render();
  }
  function answer(j) {
    if (!ui || ui.res) return;
    var c = ui.deck[ui.i], ms = Date.now() - (ui.t0 || Date.now()), ok = Number(j) === c.q.c, slow = ms > SLOW_MS;
    var b = getBox(c.k) || 0;
    if (!ui.again) {
      if (ok && !slow) { b = Math.min(5, b + 1); ui.fast++; }
      else if (ok) { ui.slowN++; }
      else { b = 0; ui.miss++; }
      setCard(c.k, b, addDays(ok && !slow ? BOX_DAYS[b] : 1));
    } else if (ok && !slow) ui.fast++;
    if (!ok && !ui.retry[c.k] && !ui.again) { ui.retry[c.k] = 1; ui.deck.push(c); }
    ui.res = { ok: ok, slow: slow, ms: ms }; render();
  }
  function next() {
    if (!ui) return;
    ui.i++; ui.res = null;
    if (ui.i >= ui.deck.length) return finish();
    ui.again = ui.i >= ui.base; ui.ord = shuffle(ui.deck[ui.i].q.a.map(function (_, j) { return j; })); render();
  }
  function finish() {
    var s = st(), first = s.d !== today(), pack = false;
    s.d = today(); s.n = (s.n || 0) + 1;
    if (first && window.grantStickerPack) { try { pack = window.grantStickerPack("review", "すらすら ふくしゅう"); } catch (e) {} }
    if (window.tutorPlanMark) try { window.tutorPlanMark("speed"); } catch (e) {}
    log(ui.base + "まい・すらすら " + ui.fast + "・まちがい " + ui.miss + "・おそい " + ui.slowN + "（通算 " + s.n + "回）");
    try { if (window.saveGame) window.saveGame(); } catch (e) {}
    ui.result = { pack: pack }; ui.phase = "end"; render();
  }
  function act(a, v) {
    if (a === "close") return close();
    if (a === "go") return start();
    if (a === "ans") return answer(v);
    if (a === "next") return next();
  }
  window.openSpeedReview = function () { ui = { phase: "home" }; render(); };
  window.speedReviewStats = stats;
})();
