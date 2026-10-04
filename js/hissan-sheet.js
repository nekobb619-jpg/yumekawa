/* =====================================================================
   hissan-sheet.js — わり算の 筆算シート（3けた÷2けた）：紙で とく → アプリで 答え合わせ
   ★2026-10-03追加：「アプリ内で完結は難しい。筆算シートや覚え書きメモがいる」（ユーザー）
   - window.HISSAN.make(no)：シート番号から 毎回 同じ 8問を 作る（印刷ページ hissan_sheet.html と アプリで 共通）
   - アプリ側：openHissanSheet() … 印刷・おぼえがきメモ・答え合わせ
   - 答え合わせの ごほうび：その日 はじめて 答え合わせした シートだけ、正解1問 ＝ 1Q（最大8Q）。log_db「✏️筆算シート」
   - わり算の ステージの 説明画面に「紙の 筆算シートで 練習」ボタンを 足す
   ★2026-10-04追加：3けた ÷ 1けた の シート（シート番号が 10000 以上）。学校で 習った 言い方
     「たてる・かける・うつす・ひく・おろす」と、横に かけ算を 書く「ほじょ計算」に そろえた（MEMO1）
   ===================================================================== */
(function () {
  "use strict";

  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  // 8問の 種類：商が1けた（見当どおり／見当の 直しが いりやすい）・商が2けた・商の 一の位が 0・わりきれる
  function isD1(no) { return Number(no) >= 10000; }
  // 3けた ÷ 1けた の 8問：商が 3けた／商が 2けた（百の位に たたない）／商の 十の位が 0／商の 一の位が 0／わりきれる
  function make1(no) {
    var r = rng(no * 104729 + 7), out = [], used = {}, guard = 0;
    function add(d, q, rem, kind) {
      var n = d * q + rem;
      if (n < 100 || n > 999 || rem >= d || used[n + "/" + d]) return false;
      used[n + "/" + d] = 1; out.push({ dividend: n, divisor: d, q: q, r: rem, kind: kind }); return true;
    }
    function loop(fn) { var ok = false; while (!ok && guard++ < 8000) ok = fn(); }
    loop(function () { var d = ri(r, 2, 4); return add(d, ri(r, 101, Math.floor(999 / d)), ri(r, 1, d - 1), "商が 3けた"); });
    loop(function () { var d = ri(r, 3, 6); var q = ri(r, 101, Math.floor(999 / d)); return q % 10 !== 0 && Math.floor(q / 10) % 10 !== 0 && add(d, q, 0, "商が 3けた（わりきれる）"); });
    loop(function () { var d = ri(r, 5, 9); return add(d, ri(r, 12, 99), ri(r, 1, d - 1), "商が 2けた"); });
    loop(function () { var d = ri(r, 6, 9); var q = ri(r, 12, 99); return d * q >= 100 && add(d, q, ri(r, 1, d - 1), "商が 2けた"); });
    loop(function () { var d = ri(r, 2, 9); var q = ri(r, 1, Math.floor(99 / d)) * 100 + ri(r, 1, 9); return add(d, q, ri(r, 0, d - 1), "商の 十の位が 0"); });
    loop(function () { var d = ri(r, 3, 8); var q = ri(r, 1, Math.floor(99 / d)) * 100 + ri(r, 1, 9); return add(d, q, ri(r, 1, d - 1), "商の 十の位が 0"); });
    loop(function () { var d = ri(r, 3, 9); var q = ri(r, 2, Math.floor(999 / d / 10)) * 10; return q % 100 !== 0 && add(d, q, ri(r, 1, d - 1), "商の 一の位が 0"); });
    loop(function () { var d = ri(r, 4, 9); return add(d, ri(r, 13, 99), 0, "商が 2けた（わりきれる）"); });
    for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }
  function make(no) {
    if (isD1(no)) return make1(no);
    var r = rng(no * 7919 + 13), out = [], used = {};
    function add(d, q, rem, kind) {
      var n = d * q + rem;
      if (n < 100 || n > 999 || rem >= d || used[n + "/" + d]) return false;
      used[n + "/" + d] = 1; out.push({ dividend: n, divisor: d, q: q, r: rem, kind: kind }); return true;
    }
    var guard = 0;
    function loop(fn) { var ok = false; while (!ok && guard++ < 5000) ok = fn(); }
    loop(function () { var d = ri(r, 21, 49); if (d % 10 > 4) return false; return add(d, ri(r, 3, 9), ri(r, 1, d - 1), "商が1けた"); });
    loop(function () { var d = ri(r, 16, 49); if (d % 10 < 6) return false; return add(d, ri(r, 3, 9), ri(r, 1, d - 1), "商が1けた（見当を 直すかも）"); });
    loop(function () { var d = ri(r, 51, 98); return add(d, ri(r, 2, 9), ri(r, 0, d - 1), "商が1けた"); });
    loop(function () { var d = ri(r, 12, 29); return add(d, ri(r, 11, Math.floor(999 / d)), ri(r, 1, d - 1), "商が2けた"); });
    loop(function () { var d = ri(r, 21, 45); return add(d, ri(r, 11, Math.floor(999 / d)), ri(r, 1, d - 1), "商が2けた"); });
    loop(function () { var d = ri(r, 13, 39); var q = ri(r, 1, Math.floor(999 / d / 10)) * 10; return q >= 10 && add(d, q, ri(r, 1, d - 1), "商の 一の位が 0"); });
    loop(function () { var d = ri(r, 12, 48); return add(d, ri(r, 11, Math.floor(999 / d)), 0, "わりきれる"); });
    loop(function () { var d = ri(r, 14, 38); if (d % 10 < 6) return false; return add(d, ri(r, 11, Math.floor(999 / d)), ri(r, 1, d - 1), "商が2けた（見当を 直すかも）"); });
    // ならびを まぜる（シートごとに ちがう 順番）
    for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }

  var MEMO = [
    ["① たてる", "商の 見当を つける。わる数を 何十と みる（34 → 30、27 → 30）。"],
    ["② かける", "たてた 商 × わる数。"],
    ["③ ひく", "わられる数から ひく。"],
    ["④ おろす", "つぎの 位の 数を おろして、① に もどる。"],
    ["🔧 なおす", "ひけない（かけた答えが 大きすぎる）→ 商を 1 小さく。ひいた答えが わる数 以上 → 商を 1 大きく。"],
    ["0 に 注意", "商が たたない 位には 0 を 書く（615 ÷ 30 ＝ 20 あまり 15）。"],
    ["✅ たしかめ", "わる数 × 商 ＋ あまり ＝ わられる数。あまり ＜ わる数 かも 見る。"]
  ];
  // 3けた ÷ 1けた 用（学校の 言い方）
  var MEMO1 = [
    ["① たてる", "商を たてる。上の 位から、わる数が 入るかを 見る。"],
    ["② かける", "たてた 商 × わる数（横に ほじょ計算を 書く）。"],
    ["③ うつす", "ほじょ計算の 答えを 下に うつす。"],
    ["④ ひく", "上の 数から ひく。答えは わる数より 小さい？"],
    ["⑤ おろす", "つぎの 位の 数を おろして、① に もどる。"],
    ["0 に 注意", "わる数が 入らない 位には、商に 0 を 書く（824 ÷ 8 ＝ 103）。"],
    ["✅ たしかめ", "わる数 × 商 ＋ あまり ＝ わられる数。あまり ＜ わる数 かも 見る。"]
  ];
  window.HISSAN = { make: make, MEMO: MEMO, MEMO1: MEMO1, isD1: isD1 };
  if (typeof document === "undefined" || !document.body || window.HISSAN_PRINT_PAGE) return; // 印刷ページでは ここまで

  /* ---------------- アプリ側 ---------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var BTN = "border:none;border-radius:14px;font-family:'Zen Maru Gothic';font-weight:900;cursor:pointer;";

  function close() { var m = document.getElementById("hissan-modal"); if (m) m.remove(); }
  window.closeHissanSheet = close;
  function shell(inner) {
    close();
    var w = document.createElement("div"); w.id = "hissan-modal";
    w.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:14px;";
    w.onclick = function (e) { if (e.target === w) close(); };
    w.innerHTML = '<div style="background:#fff;border-radius:22px;padding:16px 14px;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 10px 0 rgba(147,51,234,.22);">' + inner + '</div>';
    document.body.appendChild(w);
  }

  window.openHissanSheet = function () {
    var sd = window.saveData || {}, last = sd.hissanLastNo || "";
    var memo = MEMO1.slice(0, 5).map(function (m) { return '<b>' + m[0] + '</b>'; }).join(" → ");
    shell(
      '<div style="font-size:18px;font-weight:900;color:#6b21a8;text-align:center;">✏️ わり算の 筆算シート</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-soft);text-align:center;margin:4px 0 10px;line-height:1.6;">わり算の 筆算は、紙に 書いて とくのが いちばん。<br>印刷して とく → アプリで 答え合わせ（その日 1まい目は 1問1Q）</div>' +
      '<div style="background:#faf5ff;border-radius:14px;padding:8px 10px;font-size:12.5px;font-weight:800;color:#6b21a8;text-align:center;margin-bottom:10px;">' + memo + '</div>' +
      '<div style="display:grid;gap:8px;">' +
        '<button style="' + BTN + 'padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#0ea5e9,#6366f1);" onclick="window.printHissanSheet(1)">📄 3けた ÷ 1けた の シートを 印刷する</button>' +
        '<button style="' + BTN + 'padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#ec4899,#a855f7);" onclick="window.printHissanSheet()">📄 3けた ÷ 2けた の シートを 印刷する</button>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<button style="' + BTN + 'padding:10px 6px;font-size:12.5px;color:#075985;background:#e0f2fe;" onclick="window.open(\'./hissan_sheet.html?mode=memo&type=1\', \'_blank\')">📝 メモ（÷1けた）</button>' +
        '<button style="' + BTN + 'padding:10px 6px;font-size:12.5px;color:#92400e;background:#fef3c7;" onclick="window.open(\'./hissan_sheet.html?mode=memo\', \'_blank\')">📝 メモ（÷2けた）</button></div>' +
        '<button style="' + BTN + 'padding:11px;font-size:14px;color:#065f46;background:#d1fae5;" onclick="window.hissanCheckForm()">✅ 答え合わせ' + (last ? '（シート No.' + esc(last) + '）' : '') + '</button>' +
        '<button style="' + BTN + 'padding:9px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.closeHissanSheet()">とじる</button>' +
      '</div>'
    );
  };

  window.printHissanSheet = function (type) {
    var no = type === 1 ? 10000 + Math.floor(Math.random() * 9000) : 1000 + Math.floor(Math.random() * 9000);
    if (window.saveData) { window.saveData.hissanLastNo = no; if (window.saveGame) window.saveGame(); }
    window.open("./hissan_sheet.html?no=" + no, "_blank");
    window.openHissanSheet();
  };

  window.hissanCheckForm = function (noArg) {
    var no = noArg || (window.saveData && window.saveData.hissanLastNo) || "";
    var rows = "";
    if (no) {
      make(Number(no)).forEach(function (p, i) {
        rows += '<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px dashed #e9d5ff;font-weight:900;">' +
          '<span style="width:96px;font-size:14px;color:#4a3b52;">(' + (i + 1) + ') ' + p.dividend + '÷' + p.divisor + '</span>' +
          '<input id="hs-q' + i + '" inputmode="numeric" style="width:54px;padding:6px;border:2px solid #e9d5ff;border-radius:8px;font-size:15px;text-align:center;" placeholder="商">' +
          '<span style="font-size:12px;color:var(--text-soft);">あまり</span>' +
          '<input id="hs-r' + i + '" inputmode="numeric" style="width:48px;padding:6px;border:2px solid #e9d5ff;border-radius:8px;font-size:15px;text-align:center;" placeholder="0">' +
          '<span id="hs-m' + i + '" style="font-size:18px;"></span></div>';
      });
    }
    shell(
      '<div style="font-size:17px;font-weight:900;color:#065f46;text-align:center;">✅ 筆算シートの 答え合わせ</div>' +
      '<div style="display:flex;gap:6px;align-items:center;justify-content:center;margin:10px 0;font-weight:900;color:#4a3b52;">シート No. <input id="hs-no" inputmode="numeric" value="' + esc(no) + '" style="width:80px;padding:6px;border:2px solid #a7f3d0;border-radius:8px;font-size:15px;text-align:center;"> <button style="' + BTN + 'padding:7px 10px;font-size:12px;background:#d1fae5;color:#065f46;" onclick="window.hissanCheckForm(document.getElementById(\'hs-no\').value)">よみこむ</button></div>' +
      (no ? rows + '<div style="font-size:11px;font-weight:700;color:var(--text-soft);margin:8px 0;">わりきれた ときは あまりに 0 を 入れてね。</div>' +
        '<button style="' + BTN + 'width:100%;padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#10b981,#059669);" onclick="window.hissanCheck(' + Number(no) + ')">まるつけ する</button>' : '<div style="text-align:center;color:var(--text-soft);font-size:13px;">印刷した シートの 右上の 番号を 入れてね。</div>') +
      '<div id="hs-result" style="margin-top:10px;"></div>' +
      '<button style="' + BTN + 'display:block;margin:10px auto 0;padding:9px 22px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.openHissanSheet()">もどる</button>'
    );
  };

  window.hissanCheck = function (no) {
    var probs = make(no), ok = 0, wrongs = [];
    probs.forEach(function (p, i) {
      var q = Number((document.getElementById("hs-q" + i) || {}).value), rv = (document.getElementById("hs-r" + i) || {}).value, rr = rv === "" ? 0 : Number(rv);
      var good = q === p.q && rr === p.r, m = document.getElementById("hs-m" + i);
      if (good) ok++; else wrongs.push(i + 1);
      if (m) m.textContent = good ? "⭕" : "🔁";
    });
    var sd = window.saveData || {}, t = today(), reward = 0;
    sd.hissanChecks = Array.isArray(sd.hissanChecks) ? sd.hissanChecks : [];
    var already = sd.hissanChecks.some(function (c) { return c.no === no; });
    var rewardedToday = sd.hissanChecks.some(function (c) { return c.d === t && c.rewarded; });
    if (!already && !rewardedToday) { reward = ok; sd.q = (sd.q || 0) + reward; }
    sd.hissanChecks.push({ no: no, d: t, ok: ok, rewarded: reward > 0 });
    if (sd.hissanChecks.length > 10) sd.hissanChecks = sd.hissanChecks.slice(-10);
    if (window.saveGame) window.saveGame(); if (window.updateUI) window.updateUI();
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "✏️筆算シート", msg: (isD1(no) ? "÷1けた " : "÷2けた ") + "No." + no + " 正解" + ok + "/8" + (wrongs.length ? " ちがう:" + wrongs.join(",") : "") + " +" + reward + "Q" + (already ? "（2回目以降）" : rewardedToday ? "（きょう2まい目）" : "") });
    var res = document.getElementById("hs-result");
    if (res) res.innerHTML = '<div style="background:#ecfdf5;border-radius:14px;padding:10px;text-align:center;font-weight:900;color:#065f46;">' + ok + ' ／ 8 問 正解！' + (reward ? '　🎁 +' + reward + 'Q' : '') +
      (wrongs.length ? '<div style="font-size:12px;color:#b45309;margin-top:6px;line-height:1.6;">🔁 の 問題は、たしかめ算（わる数 × 商 ＋ あまり）で 見なおそう。<br>あまりが わる数より 大きく なって いない？</div>' : '<div style="font-size:12px;margin-top:4px;">ぜんぶ 正解！ すごい！</div>') + '</div>';
  };

  // わり算の ステージの 説明画面に ボタンを 足す
  var ob = window.openBriefing;
  if (typeof ob === "function") {
    window.openBriefing = function (stg) {
      var r = ob.apply(this, arguments);
      try {
        if (stg && /warizan|hissan/.test(String(stg.id))) {
          var z = document.getElementById("br-buttons-zone");
          if (z) { var b = document.createElement("button"); b.className = "br-btn"; b.style.cssText = "background:#fef3c7;color:#92400e;"; b.textContent = "✏️ 紙の 筆算シートで 練習する"; b.onclick = function () { window.closeBriefing(); window.openHissanSheet(); }; z.appendChild(b); }
        }
      } catch (e) {}
      return r;
    };
  }
})();
