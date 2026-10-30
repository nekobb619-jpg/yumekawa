/* =====================================================================
   js/papa-mission.js — 👨 お父さんミッション（ホームの いちばん上に 出す カード）
   ★2026-10-28追加（保護者：りお宛に「自学ノート No.50 達成で 1000ロバックス！（ゆめかわ 毎日 やれば）」と 表示）
   ・PAPA_MISSIONS に 書いた ミッションを、あて先（to）の アカウントの ホームに 出す。
   ・saveData.papaMission[id] = { no: いまの ノート番号, days: { "2026-10-28": 1, … }, done: たっせいを LOG に 書いたか }
     no は 自学ノートで「✅ ノートに 書けた！」を おすと +1（js/jigaku-note.js の jigakuDone を つつむ）。
     ずれたら カードの −1／＋1 で なおせる（本物の ノートを お父さんに 見せて たしかめる 前提）。
     days は ゆめかわで 学習した 日（registerStudyStreak＝ステージ・探偵ラボなど）と 自学ノートを 記録した 日。
   ★2026-10-30変更（保護者）：ノートの 番号が ＋1 に なるのは「自学ノートの しゃしんを つけた とき」だけ。
     「✅ ノートに 書けた」（pt）や ＋1 ボタンでは ふえない（＋1 ボタンは なくした。−1 は のこす）。
     しゃしんは 小さく して この たんまつの 中だけ（localStorage "kids_jigaku_photo_<id>"、さいご PHOTO_KEEP まい）に のこし、
     お父さんが カードの「📷 しゃしんを 見る」で たしかめる。クラウド・GAS・LOG には 送らない（LOG は「しゃしんで ＋1 No.◯」の 文字だけ）。
     1日 PHOTO_DAY まいまで。
   ・ごほうび（ロバックス）は アプリでは わたさない。たっせいしたら LOG に 1行 書いて、お父さんが わたす。
   ===================================================================== */
(function () {
  var PAPA_MISSIONS = [
    { id: "jigaku50", to: "りお", start: "2026-10-28", startNo: 39, goalNo: 50,
      title: "自学ノート No.50 たっせいで 1000ロバックス！", cond: "（ゆめかわを 毎日 やれば）" }
  ];

  var PHOTO_KEEP = 15, PHOTO_DAY = 3, PHOTO_W = 360;
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
        ' <button type="button" data-pm="minus" aria-label="ノートの 番号を 1つ もどす" style="border:1.5px solid #f59e0b;background:#fff;color:#b45309;border-radius:999px;font:900 11px \'Zen Maru Gothic\';padding:2px 8px;cursor:pointer">−1</button></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 2px"><button type="button" data-pm="photo" style="flex:1 1 auto;min-height:44px;border:none;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;font:900 14px \'Zen Maru Gothic\';cursor:pointer;box-shadow:0 3px 0 #b45309">📷 書いた ノートの しゃしんで ＋1</button>' +
        (photos().length ? '<button type="button" data-pm="view" style="min-height:44px;border:1.5px solid #f59e0b;background:#fff;color:#b45309;border-radius:14px;font:900 12px \'Zen Maru Gothic\';padding:4px 10px;cursor:pointer">しゃしんを 見る（' + photos().length + '）</button>' : '') + '</div>' +
      '<div style="height:10px;background:#fff;border-radius:999px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f59e0b,#ef4444)"></div></div>' +
      '<div style="font-size:12.5px;font-weight:800;color:#7c2d12">📅 ゆめかわ 毎日：' + esc(m.start.slice(5).replace("-", "/")) + 'から ' + days.length + '日中 <b>' + got + '日</b>' + (miss ? '　<span style="color:#dc2626">（できなかった 日 ' + miss + '日）</span>' : '　<span style="color:#16a34a">（ぜんぶ できて いる！）</span>') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:5px">' + dots + '</div>' +
      (done ? '<div style="margin-top:8px;background:#16a34a;color:#fff;border-radius:12px;padding:8px;text-align:center;font-weight:900">🎉 たっせい！ ノートを お父さんに 見せよう</div>'
            : '<div style="margin-top:6px;font-size:11px;font-weight:700;color:#92400e">書いた 自学ノートの しゃしんを とると、ノートの 番号が ＋1。ページ ぜんたいが うつるように とってね（名前は うつらなくて いいよ）。しゃしんは この たんまつの 中だけに のこって、お父さんが たしかめるよ。</div>') +
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
        var m = ms[0], s = state(m), act = b.getAttribute("data-pm"); if (!s) return;
        if (act === "photo") return takePhoto();
        if (act === "view") return viewPhotos();
        if (act !== "minus") return;
        s.no = Math.max(1, s.no - 1);
        log("ノートの 番号を 1つ もどした → No." + s.no); check(m, s); save(); render();
      };
    } catch (e) { console.error("papa-mission", e); }
  }
  window.renderPapaMission = render;

  /* ---- 📷 しゃしんで ＋1 ---- */
  function pkey() { return "kids_jigaku_photo_" + (window.playerId || ""); }
  function photos() { try { var a = JSON.parse(localStorage.getItem(pkey()) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function keepPhotos(a) {
    while (a.length) { try { localStorage.setItem(pkey(), JSON.stringify(a)); return true; } catch (e) { a.shift(); } } // 入らなければ 古い ものから すてる
    return false;
  }
  function takePhoto() {
    var ms = mine(); if (!ms.length) return;
    var t = today(), todayN = photos().filter(function (p) { return p.d === t; }).length;
    if (todayN >= PHOTO_DAY) { alert("📷 しゃしんは 1日 " + PHOTO_DAY + "まいまで だよ。また あした！"); return; }
    var inp = document.getElementById("pm-photo-in");
    if (!inp) { inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.setAttribute("capture", "environment"); inp.id = "pm-photo-in"; inp.style.display = "none"; document.body.appendChild(inp); }
    inp.value = "";
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        if (img.naturalWidth < 200 || img.naturalHeight < 200) { alert("しゃしんが 小さすぎるよ。ノートを もう一度 とってね"); return; }
        var sc = PHOTO_W / Math.max(img.naturalWidth, img.naturalHeight), cv = document.createElement("canvas");
        cv.width = Math.round(img.naturalWidth * Math.min(1, sc)); cv.height = Math.round(img.naturalHeight * Math.min(1, sc));
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        var data = cv.toDataURL("image/jpeg", 0.6);
        var m = ms[0], s = state(m); if (!s) return;
        s.no += 1;
        var list = photos(); list.push({ d: today(), no: s.no, at: Date.now(), img: data }); list = list.slice(-PHOTO_KEEP);
        keepPhotos(list);
        log("📷 しゃしんで ＋1 → 自学ノート No." + s.no);
        markToday(); s = state(m); check(m, s); save(); render();
        var done = s.no >= m.goalNo;
        alert(done ? "🎉 No." + s.no + "！ ノート " + m.goalNo + " たっせい！ お父さんに 見せよう" : "📓 しゃしん OK！ 自学ノート No." + s.no + "（あと " + (m.goalNo - s.no) + "ページ）");
      };
      img.onerror = function () { URL.revokeObjectURL(url); alert("しゃしんを 読みこめなかったよ。もう一度 とってね"); };
      img.src = url;
    };
    inp.click();
  }
  window.papaMissionPhoto = takePhoto;
  function viewPhotos() {
    var list = photos().slice().reverse(), old = document.getElementById("pm-photos"); if (old) old.remove();
    var w = document.createElement("div"); w.id = "pm-photos"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "自学ノートの しゃしん");
    w.style.cssText = "position:fixed;inset:0;z-index:10007;background:rgba(31,27,46,.75);display:flex;align-items:center;justify-content:center;padding:12px;font-family:'Zen Maru Gothic',sans-serif";
    w.innerHTML = '<div style="background:#fff;border-radius:20px;padding:12px;max-width:440px;width:100%;max-height:92vh;overflow-y:auto">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><b style="flex:1;color:#7c2d12;font-size:16px">📷 自学ノートの しゃしん</b><button type="button" id="pm-ph-x" style="min-height:44px;border:2px solid #fde68a;background:#fff;border-radius:12px;font:900 13px \'Zen Maru Gothic\';padding:4px 12px;cursor:pointer">とじる</button></div>' +
      '<div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:6px">この たんまつの 中だけに のこって います（さいご ' + PHOTO_KEEP + 'まい）。ちがう しゃしんだったら −1 で もどしてね。</div>' +
      (list.length ? list.map(function (p) { return '<figure style="margin:0 0 10px"><img src="' + p.img + '" alt="自学ノート No.' + p.no + ' の しゃしん" style="width:100%;border-radius:12px;border:2px solid #fde68a"><figcaption style="font-size:12px;font-weight:900;color:#7c2d12">No.' + p.no + '　' + esc(p.d) + '</figcaption></figure>'; }).join("") : '<div>まだ ありません</div>') + '</div>';
    document.body.appendChild(w);
    var x = document.getElementById("pm-ph-x"); x.onclick = function () { w.remove(); }; x.focus();
    w.addEventListener("keydown", function (e) { if (e.key === "Escape") w.remove(); });
    w.addEventListener("click", function (e) { if (e.target === w) w.remove(); });
  }

  function wrap(name, after) {
    var o = window[name]; if (typeof o !== "function" || o._pmWrapped) return !!(o && o._pmWrapped);
    var w = function () { var r = o.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
    w._pmWrapped = true; window[name] = w; return true;
  }
  function install() {
    var a = wrap("registerStudyStreak", function () { markToday(); render(); });
    // ★2026-10-30：「✅ 書けた」では 番号は ふえない（しゃしんで ふえる）。書いた 日の ✓ だけ つける
    var b = wrap("jigakuDone", function () {
      markToday(); save(); render();
      var r = document.getElementById("jigaku-result");
      if (r && mine().length) r.insertAdjacentHTML("beforeend", '<button type="button" onclick="window.papaMissionPhoto()" style="display:block;width:100%;margin-top:8px;min-height:44px;border:none;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;font:900 14px \'Zen Maru Gothic\',sans-serif;cursor:pointer">📷 ノートの しゃしんで お父さんミッション ＋1</button>');
    });
    var c = wrap("renderTutorPlan", function () { render(); });
    return a && b && c;
  }
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
})();
