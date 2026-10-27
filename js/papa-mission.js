/* =====================================================================
   js/papa-mission.js — 👨 お父さんミッション（ホームの いちばん上に 出す カード）
   ★2026-10-28追加（保護者：りお宛に「自学ノート No.50 達成で 1000ロバックス！（ゆめかわ 毎日 やれば）」と 表示）
   ・PAPA_MISSIONS に 書いた ミッションを、あて先（to）の アカウントの ホームに 出す。
   ・saveData.papaMission[id] = { no: いまの ノート番号, days: { "2026-10-28": 1, … }, done: たっせいを LOG に 書いたか }
     no は 自学ノートで「✅ ノートに 書けた！」を おすと +1（js/jigaku-note.js の jigakuDone を つつむ）。
     ずれたら カードの −1／＋1 で なおせる（本物の ノートを お父さんに 見せて たしかめる 前提）。
     days は ゆめかわで 学習した 日（registerStudyStreak＝ステージ・探偵ラボなど）と 自学ノートを 記録した 日。
   ・ごほうび（ロバックス）は アプリでは わたさない。たっせいしたら LOG に 1行 書いて、お父さんが わたす。
   ===================================================================== */
(function () {
  var PAPA_MISSIONS = [
    { id: "jigaku50", to: "りお", start: "2026-10-28", startNo: 39, goalNo: 50,
      title: "自学ノート No.50 たっせいで 1000ロバックス！", cond: "（ゆめかわを 毎日 やれば）" }
  ];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return iso(new Date(window.currentServerTime || Date.now())); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function mine() { var id = window.playerId || ""; return PAPA_MISSIONS.filter(function (m) { return m.to === id; }); }
  function state(m) {
    var sd = window.saveData; if (!sd) return null;
    if (!sd.papaMission || typeof sd.papaMission !== "object") sd.papaMission = {};
    var s = sd.papaMission[m.id];
    if (!s || typeof s !== "object") s = sd.papaMission[m.id] = { no: m.startNo, days: {}, done: 0 };
    if (typeof s.no !== "number") s.no = m.startNo;
    if (!s.days || typeof s.days !== "object") s.days = {};
    return s;
  }
  function dayList(m) {
    var out = [], d = new Date(m.start + "T00:00:00"), end = today();
    for (var i = 0; i < 120; i++) { var k = iso(d); if (k > end) break; out.push(k); d.setDate(d.getDate() + 1); }
    return out;
  }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "👨お父さんミッション", msg: msg }); } catch (e) {} }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }

  function markToday() {
    mine().forEach(function (m) { var s = state(m); if (!s) return; var t = today(); if (t >= m.start && !s.days[t]) { s.days[t] = 1; } check(m, s); });
  }
  function check(m, s) {
    var days = dayList(m), miss = days.filter(function (k) { return !s.days[k] && k !== today(); }).length;
    if (!s.done && s.no >= m.goalNo && miss === 0) { s.done = 1; log("🎉 たっせい：" + m.title + "（No." + s.no + "・毎日 " + days.length + "日）"); }
  }

  function cardHtml(m) {
    var s = state(m); if (!s) return "";
    var days = dayList(m), t = today();
    var got = days.filter(function (k) { return s.days[k]; }).length;
    var miss = days.filter(function (k) { return !s.days[k] && k !== t; }).length;
    var left = Math.max(0, m.goalNo - s.no), pct = Math.max(0, Math.min(100, Math.round((s.no - m.startNo) / (m.goalNo - m.startNo) * 100)));
    var dots = days.slice(-21).map(function (k) {
      var ok = !!s.days[k], isT = k === t;
      return '<span title="' + k + '" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:900;' +
        (ok ? "background:#22c55e;color:#fff;" : isT ? "border:2px dashed #f59e0b;color:#b45309;" : "background:#e5e7eb;color:#9ca3af;") + '">' + (ok ? "✓" : Number(k.slice(8))) + '</span>';
    }).join("");
    var done = s.no >= m.goalNo && miss === 0;
    return '<section class="papa-mission" style="margin:10px 0;background:linear-gradient(135deg,#fff7ed,#fef3c7);border:3px solid #f59e0b;border-radius:18px;padding:12px 14px;font-family:\'Zen Maru Gothic\',sans-serif;box-shadow:0 4px 0 rgba(180,83,9,.25)">' +
      '<div style="font-size:12px;font-weight:900;color:#b45309">👨 お父さんミッション（' + esc(m.to) + 'へ）</div>' +
      '<div style="font-size:17px;font-weight:900;color:#7c2d12;margin:3px 0 0;line-height:1.4">' + esc(m.title) + '</div>' +
      '<div style="font-size:13px;font-weight:900;color:#9a3412">' + esc(m.cond) + '</div>' +
      '<div style="margin-top:8px;font-size:12.5px;font-weight:800;color:#7c2d12">📓 いまの 自学ノート：<b style="font-size:16px">No.' + s.no + '</b>' + (left ? '（あと ' + left + 'ページ）' : '（No.' + m.goalNo + ' たっせい！）') +
        ' <button type="button" data-pm="minus" style="border:1.5px solid #f59e0b;background:#fff;color:#b45309;border-radius:999px;font:900 11px \'Zen Maru Gothic\';padding:2px 8px;cursor:pointer">−1</button>' +
        ' <button type="button" data-pm="plus" style="border:1.5px solid #f59e0b;background:#fff;color:#b45309;border-radius:999px;font:900 11px \'Zen Maru Gothic\';padding:2px 8px;cursor:pointer">＋1</button></div>' +
      '<div style="height:10px;background:#fff;border-radius:999px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f59e0b,#ef4444)"></div></div>' +
      '<div style="font-size:12.5px;font-weight:800;color:#7c2d12">📅 ゆめかわ 毎日：' + esc(m.start.slice(5).replace("-", "/")) + 'から ' + days.length + '日中 <b>' + got + '日</b>' + (miss ? '　<span style="color:#dc2626">（できなかった 日 ' + miss + '日）</span>' : '　<span style="color:#16a34a">（ぜんぶ できて いる！）</span>') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:5px">' + dots + '</div>' +
      (done ? '<div style="margin-top:8px;background:#16a34a;color:#fff;border-radius:12px;padding:8px;text-align:center;font-weight:900">🎉 たっせい！ ノートを お父さんに 見せよう</div>'
            : '<div style="margin-top:6px;font-size:11px;font-weight:700;color:#92400e">自学ノートで「✅ ノートに 書けた！」を おすと ノートの 番号が ＋1。番号が ずれたら −1／＋1 で なおそう。さいごは 本物の ノートを お父さんに 見せて たしかめるよ。</div>') +
      '</section>';
  }
  function render() {
    try {
      var host = document.getElementById("tutor-plan-card"); if (!host || !host.parentNode) return;
      var old = document.getElementById("papa-mission-box");
      var ms = mine();
      if (!ms.length || !window.saveData) { if (old) old.remove(); return; }
      var box = old || document.createElement("div"); box.id = "papa-mission-box";
      box.innerHTML = ms.map(cardHtml).join("");
      if (!old) host.parentNode.insertBefore(box, host);
      box.onclick = function (e) {
        var b = e.target.closest("[data-pm]"); if (!b) return;
        var m = ms[0], s = state(m); if (!s) return;
        s.no = Math.max(1, s.no + (b.getAttribute("data-pm") === "plus" ? 1 : -1));
        log("ノートの 番号を なおした → No." + s.no); check(m, s); save(); render();
      };
    } catch (e) { console.error("papa-mission", e); }
  }
  window.renderPapaMission = render;

  function wrap(name, after) {
    var o = window[name]; if (typeof o !== "function" || o._pmWrapped) return !!(o && o._pmWrapped);
    var w = function () { var r = o.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
    w._pmWrapped = true; window[name] = w; return true;
  }
  function install() {
    var a = wrap("registerStudyStreak", function () { markToday(); render(); });
    var b = wrap("jigakuDone", function () {
      mine().forEach(function (m) { var s = state(m); if (s) { s.no += 1; log("📓 自学ノート No." + s.no); } });
      markToday(); save(); render();
    });
    var c = wrap("renderTutorPlan", function () { render(); });
    return a && b && c;
  }
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
})();
