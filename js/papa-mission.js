/* =====================================================================
   js/papa-mission.js — 👨 お父さんミッション（ホームの いちばん上に 出す カード）
   ★2026-10-28追加（保護者：りお宛に「自学ノート No.50 達成で 1000ロバックス！（ゆめかわ 毎日 やれば）」と 表示）
   ★2026-10-30変更（保護者）：ノートの 番号は アプリでは ふやさない・へらさない。
     お父さんが 書いた 自学ノートの しゃしんを Claude の チャットに 送り、Claude が たしかめて 下の confirmed に 1行 足す
     （= ここの ファイルを 直して 公開する）。子どもが おす ボタン（＋1・−1・しゃしん）は ない。
     しゃしんは アプリにも ポータルにも のこさない。
   ・PAPA_MISSIONS の confirmed：[{ no: ノート番号, d: "YYYY-MM-DD"（書いた 日）, t: "題名（なくて よい）" }]。
     いまの 番号＝confirmed の いちばん 大きい no（なければ startNo）。
   ・days は ゆめかわで 学習した 日（registerStudyStreak＝ステージ・探偵ラボなど）と 自学ノートで「✅ 書けた」を おした 日。
     saveData.papaMission[id] = { days: { "2026-10-28": 1, … }, done: たっせいを LOG に 書いたか }
   ・ごほうび（ロバックス）は アプリでは わたさない。たっせいしたら LOG に 1行 書いて、お父さんが わたす。
   ===================================================================== */
(function () {
  var PAPA_MISSIONS = [
    { id: "jigaku50", to: "りお", start: "2026-10-28", startNo: 39, goalNo: 50,
      title: "自学ノート No.50 たっせいで 1000ロバックス！", cond: "（ゆめかわを 毎日 やれば）",
      // お父さんが しゃしんで たしかめた ページ（Claude が 足す）
      confirmed: [
        { no: 39, d: "2026-10-21", t: "運動会の ふり返り" },
        { no: 40, d: "2026-11-07", t: "漢字（二学期の 漢字 まとめ）" },
        { no: 41, d: "2026-11-08", t: "名古屋市科学館・プラネタリウム（ラーケーション）" },
        { no: 42, d: "2026-11-09", t: "かけ算（1×2×…×10 と 12345×678910）" },
        { no: 43, d: "2026-11-10", t: "47都道府県 きょりの わ" },
        { no: 44, d: "2026-11-11", t: "作文（学校の こと・校外学習で したい こと）" },
        { no: 45, d: "2026-11-12", t: "漢字（4年の 漢字の ことば 43こ）" },
        { no: 46, d: "2026-11-17", t: "漢字（社会見学・地名・理科の ことば 48こ）" },
        { no: 47, d: "2026-11-18", t: "算数（面積くらべ「何倍の 広さ？」）" },
        { no: 48, d: "2026-11-19", t: "かけ算（分数・小数・面積・計算の 順じょ・3けた×3けた）" }
      ] }
  ];

  /* ★2026-11-21（保護者）No.50 とうたつ → りお アカウントだけに「つぎの ミッション、どうしたい？」（えらぶ だけ）。
     どれを えらんでも ごほうびは 同じ（1000ロバックス・お父さんから）。毎日の 条件は つけない（へとへとの日も ある ため）。
     saveData.papaNext = { from, pick, at, base:{ plan, kanji } }。えらんだ あと すすみが 0 の 間は えらびなおせる。
     note＝お父さんが しゃしんで たしかめた 番号（confirmed に 足して いく）、plan＝tutorPlanDoneCount、kanji＝kanjiCheckTotal（js/kanji-sheet.js の 丸つけ 回数）。
     own は お父さんと 話して 決める（決まったら この ファイルに 新しい ミッションを 足す）。 */
  var NEXT = { from: "jigaku50", reward: "1000ロバックス", opts: [
    { id: "note60", e: "📓", n: "自学ノートを あと 10さつ（No.60 まで）", goal: 10, kind: "note", unit: "さつ" },
    { id: "plan30", e: "🎯", n: "まなびプランを 30回 たっせい", goal: 30, kind: "plan", unit: "回" },
    { id: "kanji15", e: "✍️", n: "漢字シートを 15まい 丸つけ", goal: 15, kind: "kanji", unit: "まい" },
    { id: "own", e: "💬", n: "じぶんで 考えたい（お父さんと 話す）", kind: "own" }
  ] };
  function nextOpt(id) { return NEXT.opts.filter(function (o) { return o.id === id; })[0]; }
  function nextProg(m, o, nx) {
    var sd = window.saveData || {}, b = nx.base || {};
    if (o.kind === "note") return Math.max(0, curNo(m) - m.goalNo);
    if (o.kind === "plan") return Math.max(0, (sd.tutorPlanDoneCount || 0) - (b.plan || 0));
    if (o.kind === "kanji") return Math.max(0, (sd.kanjiCheckTotal || 0) - (b.kanji || 0));
    return 0;
  }
  function nextHtml(m) {
    var sd = window.saveData; if (!sd || m.id !== NEXT.from || curNo(m) < m.goalNo) return "";
    var nx = sd.papaNext && sd.papaNext.from === NEXT.from ? sd.papaNext : null, o = nx && nextOpt(nx.pick);
    var B = "border:none;border-radius:14px;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;cursor:pointer;min-height:44px;";
    var head = '<section style="margin:10px 0;background:linear-gradient(135deg,#fdf2f8,#ede9fe);border:3px solid #a855f7;border-radius:18px;padding:12px 14px;font-family:\'Zen Maru Gothic\',sans-serif;box-shadow:0 4px 0 rgba(126,34,206,.2)">';
    if (!o) {
      return head + '<div style="font-size:12px;font-weight:900;color:#7e22ce">👨 お父さんから</div>' +
        '<div style="font-size:17px;font-weight:900;color:#581c87;margin:3px 0 4px;line-height:1.4">🎉 No.' + m.goalNo + ' とうたつ！ つぎの ミッション、どうしたい？</div>' +
        '<div style="font-size:12.5px;font-weight:800;color:#6b21a8;margin-bottom:8px;line-height:1.6">どれを えらんでも、できたら <b>' + esc(NEXT.reward) + '</b>。じぶんで えらんでね。</div>' +
        '<div style="display:grid;gap:6px">' + NEXT.opts.map(function (x) {
          return '<button type="button" onclick="window.papaNextPick(\'' + x.id + '\')" style="' + B + 'text-align:left;padding:9px 12px;font-size:14px;background:#fff;border:2px solid #d8b4fe;color:#581c87">' + x.e + ' ' + esc(x.n) + '</button>';
        }).join("") + '</div></section>';
    }
    if (o.kind === "own") return head + '<div style="font-size:15px;font-weight:900;color:#581c87">💬 つぎの ミッションは じぶんで 考える</div><div style="font-size:12.5px;font-weight:800;color:#6b21a8;margin-top:4px;line-height:1.6">お父さんに「こう したい」を 話して みよう。決まったら ここに 出るよ。</div>' +
      '<button type="button" onclick="window.papaNextPick(\'\')" style="' + B + 'margin-top:6px;padding:4px 12px;min-height:36px;font-size:12px;background:transparent;color:#7e22ce;border:1.5px dashed #d8b4fe">えらびなおす</button></section>';
    var n = nextProg(m, o, nx), left = Math.max(0, o.goal - n), pct = Math.min(100, Math.round(n / o.goal * 100));
    if (!left && !nx.done) { nx.done = 1; log("🎉 たっせい：" + o.n + "（" + NEXT.reward + "）"); save(); }
    return head + '<div style="font-size:12px;font-weight:900;color:#7e22ce">👨 お父さんミッション（じぶんで えらんだ）</div>' +
      '<div style="font-size:16px;font-weight:900;color:#581c87;margin:3px 0 4px;line-height:1.4">' + o.e + ' ' + esc(o.n) + 'で ' + esc(NEXT.reward) + '！</div>' +
      '<div style="font-size:13px;font-weight:800;color:#6b21a8">いま <b style="font-size:16px">' + n + '</b> / ' + o.goal + o.unit + (left ? '（あと ' + left + o.unit + '）' : '') + '</div>' +
      '<div style="height:10px;background:#fff;border-radius:999px;overflow:hidden;margin:4px 0 6px"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#a855f7,#ec4899)"></div></div>' +
      (left ? (o.kind === "note" ? '<div style="font-size:11px;font-weight:700;color:#6b21a8">書いた ノートは お父さんに 見せてね（たしかめると ふえるよ）</div>' : '') +
        (n === 0 ? '<button type="button" onclick="window.papaNextPick(\'\')" style="' + B + 'margin-top:6px;padding:4px 12px;min-height:36px;font-size:12px;background:transparent;color:#7e22ce;border:1.5px dashed #d8b4fe">えらびなおす</button>' : '')
        : '<div style="margin-top:6px;background:#16a34a;color:#fff;border-radius:12px;padding:8px;text-align:center;font-weight:900">🎉 たっせい！ お父さんから ' + esc(NEXT.reward) + '</div>') +
      '</section>';
  }
  window.papaNextPick = function (id) {
    var sd = window.saveData; if (!sd) return;
    if (!id) { delete sd.papaNext; log("つぎの ミッションを えらびなおす"); save(); render(); return; }
    var o = nextOpt(id); if (!o) return;
    sd.papaNext = { from: NEXT.from, pick: id, at: today(), base: { plan: sd.tutorPlanDoneCount || 0, kanji: sd.kanjiCheckTotal || 0 } };
    log("つぎの ミッション（じぶんで えらんだ）：" + o.n);
    save(); render();
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return iso(new Date(window.currentServerTime || Date.now())); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function mine() { var id = window.playerId || ""; return PAPA_MISSIONS.filter(function (m) { return m.to === id; }); }
  function curNo(m) { var n = m.startNo; (m.confirmed || []).forEach(function (c) { if (c.no > n) n = c.no; }); return n; }
  function lastConf(m) { var l = (m.confirmed || []).slice().sort(function (a, b) { return a.no - b.no; }); return l[l.length - 1] || null; }
  function state(m) {
    var sd = window.saveData; if (!sd) return null;
    if (!sd.papaMission || typeof sd.papaMission !== "object") sd.papaMission = {};
    var s = sd.papaMission[m.id];
    if (!s || typeof s !== "object") s = sd.papaMission[m.id] = { days: {}, done: 0 };
    if (!s.days || typeof s.days !== "object") s.days = {};
    delete s.no; // ★2026-10-30：番号は アプリで もたない（confirmed）
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
    if (!s.done && curNo(m) >= m.goalNo && miss === 0) { s.done = 1; log("🎉 たっせい：" + m.title + "（No." + curNo(m) + "・毎日 " + days.length + "日）"); }
  }

  function cardHtml(m) {
    var s = state(m); if (!s) return "";
    var days = dayList(m), t = today(), no = curNo(m), lc = lastConf(m);
    var got = days.filter(function (k) { return s.days[k]; }).length;
    var miss = days.filter(function (k) { return !s.days[k] && k !== t; }).length;
    var left = Math.max(0, m.goalNo - no), pct = Math.max(0, Math.min(100, Math.round((no - m.startNo) / (m.goalNo - m.startNo) * 100)));
    var dots = days.slice(-21).map(function (k) {
      var ok = !!s.days[k], isT = k === t;
      return '<span title="' + k + '" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:900;' +
        (ok ? "background:#22c55e;color:#fff;" : isT ? "border:2px dashed #f59e0b;color:#b45309;" : "background:#e5e7eb;color:#9ca3af;") + '">' + (ok ? "✓" : Number(k.slice(8))) + '</span>';
    }).join("");
    var done = no >= m.goalNo && miss === 0;
    return '<section class="papa-mission" style="margin:10px 0;background:linear-gradient(135deg,#fff7ed,#fef3c7);border:3px solid #f59e0b;border-radius:18px;padding:12px 14px;font-family:\'Zen Maru Gothic\',sans-serif;box-shadow:0 4px 0 rgba(180,83,9,.25)">' +
      '<div style="font-size:12px;font-weight:900;color:#b45309">👨 お父さんミッション（' + esc(m.to) + 'へ）</div>' +
      '<div style="font-size:17px;font-weight:900;color:#7c2d12;margin:3px 0 0;line-height:1.4">' + esc(m.title) + '</div>' +
      '<div style="font-size:13px;font-weight:900;color:#9a3412">' + esc(m.cond) + '</div>' +
      '<div style="margin-top:8px;font-size:12.5px;font-weight:800;color:#7c2d12">📓 いまの 自学ノート：<b style="font-size:16px">No.' + no + '</b>' + (left ? '（あと ' + left + 'ページ）' : '（No.' + m.goalNo + ' たっせい！）') + '</div>' +
      (lc ? '<div style="font-size:11px;font-weight:700;color:#92400e">さいごに お父さんが たしかめた ページ：No.' + lc.no + (lc.t ? '「' + esc(lc.t) + '」' : '') + '（' + esc(lc.d.slice(5).replace("-", "/")) + '）</div>' : '') +
      '<div style="height:10px;background:#fff;border-radius:999px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f59e0b,#ef4444)"></div></div>' +
      '<div style="font-size:12.5px;font-weight:800;color:#7c2d12">📅 ゆめかわ 毎日：' + esc(m.start.slice(5).replace("-", "/")) + 'から ' + days.length + '日中 <b>' + got + '日</b>' + (miss ? '　<span style="color:#dc2626">（できなかった 日 ' + miss + '日）</span>' : '　<span style="color:#16a34a">（ぜんぶ できて いる！）</span>') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:5px">' + dots + '</div>' +
      (done ? '<div style="margin-top:8px;background:#16a34a;color:#fff;border-radius:12px;padding:8px;text-align:center;font-weight:900">🎉 たっせい！</div>'
            : '<div style="margin-top:6px;font-size:11px;font-weight:700;color:#92400e">自学ノートを 書いたら、お父さんに 見せてね。お父さんが たしかめると ノートの 番号が ふえるよ。</div>') +
      '</section>';
  }
  function render() {
    try {
      var host = document.getElementById("tutor-plan-card"); if (!host || !host.parentNode) return;
      var old = document.getElementById("papa-mission-box");
      var ms = mine();
      if (!ms.length || !window.saveData) { if (old) old.remove(); return; }
      var box = old || document.createElement("div"); box.id = "papa-mission-box";
      box.innerHTML = ms.map(function (m) { return cardHtml(m) + nextHtml(m); }).join("");
      if (!old) host.parentNode.insertBefore(box, host);
    } catch (e) { console.error("papa-mission", e); }
  }
  window.renderPapaMission = render;
  window.PAPA_MISSIONS = PAPA_MISSIONS;

  function wrap(name, after) {
    var o = window[name]; if (typeof o !== "function" || o._pmWrapped) return !!(o && o._pmWrapped);
    var w = function () { var r = o.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
    w._pmWrapped = true; window[name] = w; return true;
  }
  function install() {
    var a = wrap("registerStudyStreak", function () { markToday(); render(); });
    // 「✅ 書けた」では 番号は ふえない。書いた 日の ✓ と「お父さんに 見せてね」だけ
    var b = wrap("jigakuDone", function () {
      markToday(); save(); render();
      var r = document.getElementById("jigaku-result");
      if (r && mine().length) r.insertAdjacentHTML("beforeend", '<div style="margin-top:8px;background:#fff7ed;border:2px solid #fbbf24;border-radius:12px;padding:8px;text-align:center;font-size:12.5px;font-weight:900;color:#9a3412">👨 書いた ノートを お父さんに 見せよう。お父さんが たしかめると、ミッションの ノート番号が ふえるよ。</div>');
    });
    var c = wrap("renderTutorPlan", function () { render(); });
    return a && b && c;
  }
  // ★2026-10-30：前の 版（数分だけ 公開）で たんまつに のこった しゃしんを けす
  try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("kids_jigaku_photo_") === 0) localStorage.removeItem(k); }); } catch (e) {}
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
})();
