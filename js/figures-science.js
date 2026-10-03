/* =====================================================================
   figures-science.js — 理科の 学習用イラスト（js/figures.js に 種類を足す）
   ★2026-10-02追加：回路（直列・並列・スイッチ・モーター）、空の 月・星の 動き、月の形、
   太陽・地球・月のならび、星座、北極星、こぶしの角度、方位磁針、水のすがた（状態変化・ふっとう・
   水てき・じょう発・こおると体積が ふえる）
   ===================================================================== */
(function () {
  "use strict";
  var T = window.FIGURE_TYPES; if (!T) return;
  var INK = "#6b21a8", MARK = "#db2777", SUB = "#7a6985", WIRE = "#475569", BLUE = "#2563eb";

  function t(x, y, s, size, color, anchor) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" font-weight="900" fill="' + (color || INK) + '" text-anchor="' + (anchor || "middle") + '" font-family="\'Zen Maru Gothic\',sans-serif">' + String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</text>';
  }
  function L(x1, y1, x2, y2, c, w, dash) { return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + (c || WIRE) + '" stroke-width="' + (w || 2.6) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round" fill="none"/>'; }
  function arrowHead(x, y, ang, c) {
    var a1 = ang + 2.6, a2 = ang - 2.6;
    return '<path d="M' + (x + Math.cos(a1) * 8) + ' ' + (y + Math.sin(a1) * 8) + ' L' + x + ' ' + y + ' L' + (x + Math.cos(a2) * 8) + ' ' + (y + Math.sin(a2) * 8) + '" stroke="' + (c || MARK) + '" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function arrow(x1, y1, x2, y2, c, w) { return L(x1, y1, x2, y2, c || MARK, w || 2.4) + arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), c); }

  /* ---------------- 回路 ---------------- */
  // かん電池（よこ向き）。x,y は左はし・中心。plusRight=false で向きが 逆
  function battery(x, y, plusRight) {
    var w = 46, h = 20, nubX = plusRight === false ? x - 4 : x + w;
    return '<rect x="' + x + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="4" fill="#fde68a" stroke="' + WIRE + '" stroke-width="2"/>' +
      '<rect x="' + (plusRight === false ? x : x + w - 12) + '" y="' + (y - h / 2) + '" width="12" height="' + h + '" rx="3" fill="#f59e0b"/>' +
      '<rect x="' + nubX + '" y="' + (y - 4) + '" width="4" height="8" rx="1" fill="' + WIRE + '"/>' +
      t(plusRight === false ? x + 6 : x + w - 6, y + 4, "+", 12, "#7c2d12") + t(plusRight === false ? x + w - 8 : x + 8, y + 4, "−", 12, "#7c2d12");
  }
  function bulb(x, y, level, broken) {
    var on = level > 0 && !broken, out = "";
    if (on) for (var i = 0; i < 8; i++) {
      var a = -Math.PI + i * Math.PI / 7, r1 = 18, r2 = 18 + 5 + level * 4;
      out += L(x + Math.cos(a) * r1, y - 4 + Math.sin(a) * r1, x + Math.cos(a) * r2, y - 4 + Math.sin(a) * r2, "#facc15", 2.2);
    }
    out += '<circle cx="' + x + '" cy="' + (y - 4) + '" r="13" fill="' + (on ? "#fef08a" : "#f1f5f9") + '" stroke="' + WIRE + '" stroke-width="2"/>' +
      '<path d="M' + (x - 5) + ' ' + (y - 2) + ' q2.5 -6 5 0 q2.5 -6 5 0" fill="none" stroke="' + (on ? "#f97316" : "#94a3b8") + '" stroke-width="1.6"/>' +
      '<rect x="' + (x - 7) + '" y="' + (y + 7) + '" width="14" height="8" rx="2" fill="#cbd5e1" stroke="' + WIRE + '" stroke-width="1.6"/>';
    if (broken) out += L(x - 12, y - 16, x + 12, y + 8, BLUE, 3) + L(x + 12, y - 16, x - 12, y + 8, BLUE, 3);
    return out;
  }
  function motor(x, y, dir, speed) {
    var out = '<circle cx="' + x + '" cy="' + y + '" r="14" fill="#e0e7ff" stroke="' + WIRE + '" stroke-width="2"/>' + t(x, y + 5, "M", 13, WIRE) +
      L(x, y - 14, x, y - 22, WIRE, 2) + '<ellipse cx="' + (x - 13) + '" cy="' + (y - 24) + '" rx="13" ry="4" fill="#93c5fd" stroke="' + BLUE + '" stroke-width="1.4"/><ellipse cx="' + (x + 13) + '" cy="' + (y - 24) + '" rx="13" ry="4" fill="#93c5fd" stroke="' + BLUE + '" stroke-width="1.4"/>';
    if (dir) {
      var cw = dir === "cw";
      out += '<path d="M' + (x - 26) + ' ' + (y - 10) + ' A26 12 0 0 ' + (cw ? 1 : 0) + ' ' + (x + 26) + ' ' + (y - 10) + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>';
      out += cw ? arrowHead(x + 26, y - 10, Math.PI / 2 - 0.3) : arrowHead(x - 26, y - 10, Math.PI / 2 + 0.3);
      if (speed) out += t(x, y + 34, speed, 11, MARK);
    }
    return out;
  }
  function circuit(s) {
    var Lx = 50, Rx = 270, Tp = 34, Bt = s.bat === "parallel" ? 98 : 118, out = "", cx = 160;
    var level = s.on === false || s.sw === "off" ? 0 : (s.bat === "series" ? 2 : 1);
    // 上：豆電球・モーター
    if (s.bulbs) {
      var n = s.bulbs.n || 2, mode = s.bulbs.mode;
      if (mode === "series") {
        var anyBroken = s.bulbs.broken !== undefined;
        out += L(Lx, Tp, Rx, Tp);
        for (var i = 0; i < n; i++) { var bx = 110 + i * (100 / Math.max(1, n - 1)); if (n === 2) bx = 120 + i * 80; out += '<rect x="' + (bx - 15) + '" y="' + (Tp - 6) + '" width="30" height="12" fill="#fff"/>' + bulb(bx, Tp, anyBroken ? 0 : 1, s.bulbs.broken === i); }
      } else {
        var top = 16, low = 62;
        out += L(Lx, top, 230, top) + L(90, low, Rx, low) + L(Lx, top, Lx, Bt) + L(Rx, low, Rx, Bt);
        for (var j = 0; j < n; j++) { var x = 110 + j * 50; out += L(x, top, x, low) + '<rect x="' + (x - 15) + '" y="' + (top + 13) + '" width="30" height="22" fill="#fff"/>' + bulb(x, top + 25, s.bulbs.broken === j ? 0 : 1, s.bulbs.broken === j); }
        Tp = null;
      }
    } else {
      out += L(Lx, Tp, Rx, Tp);
      out += '<rect x="' + (cx - 16) + '" y="' + (Tp - 6) + '" width="32" height="12" fill="#fff"/>';
      out += s.load === "motor" ? motor(cx, Tp + 4, s.dir, s.speed) : bulb(cx, Tp, level);
    }
    if (Tp !== null) out += L(Lx, Tp, Lx, Bt) + L(Rx, Tp, Rx, Bt);
    // 下：かん電池
    if (s.bat === "series") {
      out += L(Lx, Bt, 108, Bt) + battery(108, Bt) + battery(160, Bt) + L(210, Bt, Rx, Bt);
    } else if (s.bat === "parallel") {
      var low2 = 134;
      out += L(Lx, Bt, 137, Bt) + battery(137, Bt) + L(187, Bt, Rx, Bt);
      out += L(110, Bt, 110, low2) + L(110, low2, 137, low2) + battery(137, low2) + L(187, low2, 214, low2) + L(214, low2, 214, Bt);
    } else {
      var swX = 215;
      out += L(Lx, Bt, 137, Bt) + battery(137, Bt, !s.flip) + L(187, Bt, s.sw ? swX - 14 : Rx, Bt);
      if (s.sw) {
        out += '<circle cx="' + (swX - 14) + '" cy="' + Bt + '" r="3" fill="' + WIRE + '"/><circle cx="' + (swX + 14) + '" cy="' + Bt + '" r="3" fill="' + WIRE + '"/>';
        out += s.sw === "on" ? L(swX - 14, Bt, swX + 14, Bt, WIRE, 3) : L(swX - 14, Bt, swX + 10, Bt - 16, WIRE, 3);
        out += L(swX + 14, Bt, Rx, Bt) + t(swX, Bt + 20, s.sw === "on" ? "スイッチ ON" : "スイッチ OFF", 11, s.sw === "on" ? MARK : SUB);
      }
    }
    if (s.label) out += t(160, 146, s.label, 12, SUB);
    return out;
  }

  /* ---------------- 空（南を向いて 見た 図）：東 → 南 → 西 ---------------- */
  function moonIcon(x, y, phase, r) {
    r = r || 9;
    if (phase === "full") return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/>';
    if (phase === "sun") {
      var o = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fb923c"/>';
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; o += L(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3), x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7), "#fb923c", 2); }
      return o;
    }
    if (phase === "star") return '<path d="M' + x + ' ' + (y - 8) + ' l2.4 5 5.5 .8 -4 3.9 1 5.5 -4.9 -2.6 -4.9 2.6 1 -5.5 -4 -3.9 5.5 -.8z" fill="#fde047" stroke="#ca8a04" stroke-width=".8"/>';
    // 半月：上弦（右が 光る）／下弦（左が 光る）
    var right = phase !== "last";
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#475569"/><path d="M' + x + ' ' + (y - r) + ' A' + r + ' ' + r + ' 0 0 ' + (right ? 1 : 0) + ' ' + x + ' ' + (y + r) + ' Z" fill="#fde047"/>';
  }
  function skypath(s) {
    var out = '<rect x="0" y="0" width="320" height="150" rx="10" fill="' + (s.night ? "#1e1b4b" : "#e0f2fe") + '"/>';
    out += '<path d="M0 124 H320 V150 H0z" fill="' + (s.night ? "#312e81" : "#bbf7d0") + '"/>';
    out += '<path d="M30 124 Q160 -40 290 124" fill="none" stroke="' + (s.night ? "#a5b4fc" : "#94a3b8") + '" stroke-width="2" stroke-dasharray="5 5"/>';
    var lc = s.night ? "#e0e7ff" : "#334155";
    out += t(30, 142, "東", 13, lc) + t(160, 142, "南", 13, lc) + t(290, 142, "西", 13, lc) + t(95, 142, "南東", 10, lc) + t(225, 142, "南西", 10, lc);
    // 道の上の点（0=東の地平, 1=西の地平）
    function at(u) { var x = 30 + 260 * u, k = 4 * u * (1 - u); return { x: x, y: 124 - k * 82 }; }
    (s.marks || []).forEach(function (m) {
      var p = at(m.u);
      out += moonIcon(p.x, p.y, m.icon || s.icon || "full", 9);
      if (m.label) out += t(p.x, p.y - 15, m.label, 11, s.night ? "#fde68a" : MARK);
    });
    if (s.arrow !== false) {
      var a1 = at(0.12), a2 = at(0.3), b1 = at(0.7), b2 = at(0.88);
      out += '<path d="M' + a1.x + ' ' + (a1.y - 14) + ' Q' + ((a1.x + a2.x) / 2) + ' ' + (Math.min(a1.y, a2.y) - 26) + ' ' + a2.x + ' ' + (a2.y - 14) + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>' + arrowHead(a2.x, a2.y - 14, -0.25);
      out += '<path d="M' + b1.x + ' ' + (b1.y - 14) + ' Q' + ((b1.x + b2.x) / 2) + ' ' + (Math.min(b1.y, b2.y) - 26) + ' ' + b2.x + ' ' + (b2.y - 14) + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>' + arrowHead(b2.x, b2.y - 14, 0.9);
    }
    return out;
  }

  /* ---------------- 太陽・地球・月 ---------------- */
  function sunmoon(s) {
    var out = '<rect x="0" y="0" width="320" height="150" rx="10" fill="#1e1b4b"/>';
    out += '<circle cx="34" cy="75" r="26" fill="#fb923c"/>' + t(34, 120, "太陽", 12, "#fde68a");
    for (var i = 0; i < 3; i++) out += arrow(66, 55 + i * 20, s.mode === "reflect" ? 228 : 120, 55 + i * 20, "#fde68a", 1.8);
    if (s.mode === "reflect") {
      out += '<circle cx="250" cy="75" r="18" fill="#475569"/><path d="M250 57 A18 18 0 0 0 250 93 Z" fill="#fde047"/>' + t(250, 112, "月", 12, "#fde68a");
      out += arrow(232, 92, 170, 128, "#fde68a", 1.8) + '<circle cx="150" cy="134" r="10" fill="#60a5fa"/>' + t(124, 138, "地球", 11, "#bfdbfe", "end");
      out += t(200, 20, "光って いるのは 太陽が 当たる ところ", 10, "#e0e7ff");
    } else {
      out += '<circle cx="150" cy="75" r="16" fill="#60a5fa"/><path d="M150 59 A16 16 0 0 1 150 91 Z" fill="#1e3a8a" opacity=".55"/>' + t(150, 110, "地球", 12, "#bfdbfe");
      out += '<circle cx="262" cy="75" r="14" fill="#fde047"/>' + t(262, 110, "月（満月）", 12, "#fde68a");
      out += L(66, 75, 248, 75, "#a5b4fc", 1.2, "4 4");
      out += t(206, 140, "一直線 → 地球から 見ると まんまる", 11, "#e0e7ff");
    }
    return out;
  }

  /* ---------------- 月の形（右が光る＝上弦 など） ---------------- */
  function moonshapes(s) {
    var out = '<rect x="0" y="0" width="320" height="150" rx="10" fill="#1e1b4b"/>', items = s.items, w = 320 / items.length;
    items.forEach(function (it, i) {
      var x = w * i + w / 2;
      out += moonIcon(x, 64, it.p, 26) + t(x, 116, it.label, 12, "#fde68a");
      if (i < items.length - 1) out += arrow(x + 34, 64, x + w - 34, 64, "#a5b4fc", 2);
      if (it.sub) out += t(x, 134, it.sub, 10, "#c7d2fe");
    });
    return out;
  }

  /* ---------------- 星座 ---------------- */
  function stars(s) {
    var out = '<rect x="0" y="0" width="320" height="150" rx="10" fill="#1e1b4b"/>';
    function st(x, y, r, name, hl) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (hl ? "#fde047" : "#fff") + '"/>' + (name ? t(x, y - r - 5, name, 11, hl ? "#fde047" : "#e0e7ff") : ""); }
    if (s.k === "summer") {
      // デネブ（左上・天の川の中）／ベガ（右上）／アルタイル（下）。天の川が ベガと アルタイルの 間を 通る（アプリ内の既存の問題図と そろえる）
      out += '<path d="M35 0 L79 0 L240 150 L196 150 Z" fill="#c7d2fe" opacity=".18"/>' + t(250, 140, "天の川", 10, "#c7d2fe", "end");
      out += '<path d="M100 44 L236 52 L150 124 Z" fill="none" stroke="#fde68a" stroke-width="1.6" stroke-dasharray="4 4"/>';
      out += st(100, 44, 5, "デネブ（はくちょう座）", s.hl === "deneb") + st(236, 52, 6, "ベガ（こと座）", s.hl === "vega") + st(150, 124, 5, "アルタイル（わし座）", s.hl === "altair");
      if (s.hl === "vega") out += t(236, 76, "＝おりひめ星", 11, "#fde047");
    } else if (s.k === "orion") {
      var pts = [[115, 30, 6, "ベテルギウス（赤）"], [205, 36, 4], [146, 78, 3.4], [160, 74, 3.4], [174, 70, 3.4], [120, 124, 4], [212, 118, 6, "リゲル（青白）"]];
      out += '<path d="M115 30 L146 78 L120 124 M205 36 L174 70 L212 118 M115 30 L205 36 M120 124 L212 118 M146 78 L174 70" stroke="#a5b4fc" stroke-width="1.4" fill="none"/>';
      pts.forEach(function (p, i) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + (i === 0 ? "#fca5a5" : i === 6 ? "#bfdbfe" : "#fff") + '"/>' + (p[3] ? t(p[0], p[1] - p[2] - 5, p[3], 10, "#e0e7ff") : ""); });
      out += t(62, 80, "3つ ならぶ 星 →", 10, "#fde68a");
    } else if (s.k === "cassiopeia") {
      var w = [[70, 50], [115, 95], [160, 60], [205, 100], [250, 45]];
      out += '<path d="M' + w.map(function (p) { return p.join(" "); }).join(" L") + '" stroke="#a5b4fc" stroke-width="1.6" fill="none"/>';
      w.forEach(function (p) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#fff"/>'; });
      out += t(160, 132, "Wの 形（時間で M にも 見える）", 12, "#fde68a");
    } else if (s.k === "polaris") {
      out += st(160, 75, 5, "北極星", true);
      [28, 48, 66].forEach(function (r, i) {
        out += '<path d="M' + (160 + r) + ' 75 A' + r + ' ' + r + ' 0 0 0 ' + (160 + r * Math.cos(-2.2)) + ' ' + (75 + r * Math.sin(-2.2)) + '" fill="none" stroke="#a5b4fc" stroke-width="1.6"/>';
        out += '<circle cx="' + (160 + r) + '" cy="75" r="2.6" fill="#fff"/>';
        out += arrowHead(160 + r * Math.cos(-2.2), 75 + r * Math.sin(-2.2), -2.2 - Math.PI / 2, "#a5b4fc");
      });
      out += t(160, 144, "北の 空の 星は 北極星を 中心に 回る", 11, "#fde68a");
    }
    return out;
  }

  /* ---------------- こぶし1こ分＝約10度 ---------------- */
  function fist() {
    var out = '<path d="M0 128 H320" stroke="#86efac" stroke-width="4"/>' + t(20, 144, "地平線", 10, SUB, "start");
    out += '<circle cx="40" cy="96" r="12" fill="#fde68a" stroke="' + WIRE + '" stroke-width="2"/><circle cx="45" cy="94" r="2" fill="' + WIRE + '"/>';
    out += L(52, 100, 200, 112, "#f59e0b", 6);
    for (var i = 0; i < 4; i++) {
      var y = 118 - i * 26;
      out += '<rect x="202" y="' + (y - 12) + '" width="30" height="24" rx="9" fill="#fde68a" stroke="' + WIRE + '" stroke-width="2"/>';
      out += t(250, y + 4, (i + 1) * 10 + "°", 12, MARK, "start");
    }
    out += L(46, 94, 217, 106, "#a78bfa", 1.4, "4 3") + L(46, 94, 217, 82, "#a78bfa", 1.4, "4 3");
    out += t(120, 40, "うでを まっすぐ のばして", 12, INK) + t(120, 58, "こぶし 1こ分 ＝ 約10度", 13, MARK);
    return out;
  }

  /* ---------------- 方位磁針 ---------------- */
  function compass() {
    var out = '<circle cx="160" cy="75" r="58" fill="#fff" stroke="' + WIRE + '" stroke-width="3"/>';
    out += t(160, 30, "北", 14, "#dc2626") + t(160, 132, "南", 13, SUB) + t(212, 80, "東", 13, SUB) + t(108, 80, "西", 13, SUB);
    out += '<path d="M160 36 L170 75 L150 75z" fill="#dc2626"/><path d="M160 114 L170 75 L150 75z" fill="#94a3b8"/><circle cx="160" cy="75" r="4" fill="' + WIRE + '"/>';
    out += t(258, 60, "色の ついた", 11, "#dc2626", "start") + t(258, 76, "先が 北", 12, "#dc2626", "start");
    return out;
  }

  /* ---------------- 水のすがた ---------------- */
  function states() {
    var out = "", boxes = [[18, "氷", "こ体", "#bfdbfe"], [118, "水", "えき体", "#93c5fd"], [218, "水じょう気", "気体（見えない）", "#f1f5f9"]];
    boxes.forEach(function (b) {
      out += '<rect x="' + b[0] + '" y="42" width="84" height="56" rx="12" fill="' + b[3] + '" stroke="' + INK + '" stroke-width="2"/>' + t(b[0] + 42, 68, b[1], 14, INK) + t(b[0] + 42, 88, b[2], 10, SUB);
    });
    out += arrow(104, 56, 116, 56, MARK) + arrow(116, 84, 104, 84, BLUE) + arrow(204, 56, 216, 56, MARK) + arrow(216, 84, 204, 84, BLUE);
    out += t(110, 30, "0℃", 12, INK) + t(210, 30, "100℃", 12, INK);
    out += t(160, 122, "→ あたためる（赤）", 12, MARK) + t(160, 140, "← 冷やす（青）", 12, BLUE);
    return out;
  }
  function boil() {
    var out = '<path d="M120 40 L120 112 Q120 122 130 122 L190 122 Q200 122 200 112 L200 40" fill="none" stroke="' + WIRE + '" stroke-width="2.6"/>';
    out += '<path d="M122 66 L198 66 L198 112 Q198 120 190 120 L130 120 Q122 120 122 112z" fill="#bfdbfe"/>';
    [[140, 108, 4], [160, 96, 5], [178, 110, 3.6], [150, 82, 4], [172, 84, 3]].forEach(function (b) { out += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#fff" stroke="#60a5fa" stroke-width="1.2"/>'; });
    out += '<path d="M150 136 q-4 -8 4 -14 q2 8 6 4 q4 -8 0 -14 q10 8 6 24z" fill="#f97316"/>';
    out += L(212, 92, 248, 92, MARK, 1.6) + t(252, 88, "あわ ＝", 11, MARK, "start") + t(252, 103, "水じょう気", 11, MARK, "start") + t(252, 117, "（見えない）", 10, SUB, "start");
    out += '<path d="M140 30 q-8 -8 0 -16 q8 -8 0 -16 M162 28 q-8 -8 0 -16 q8 -8 0 -14 M182 30 q-8 -8 0 -16" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
    out += L(130, 14, 100, 18, BLUE, 1.6) + t(6, 18, "湯気 ＝ 冷えた", 11, BLUE, "start") + t(6, 33, "小さな 水のつぶ", 11, BLUE, "start") + t(6, 48, "（見える）", 10, SUB, "start");
    out += t(160, 148, "100℃くらいで ふっとう", 11, INK);
    return out;
  }
  function cup(s) {
    function one(x, cold, cap) {
      var o = '<path d="M' + (x - 26) + ' 40 L' + (x - 20) + ' 118 L' + (x + 20) + ' 118 L' + (x + 26) + ' 40" fill="#e0f2fe" stroke="' + WIRE + '" stroke-width="2.4"/>';
      if (cold) { o += '<rect x="' + (x - 14) + '" y="70" width="12" height="12" rx="2" fill="#fff" stroke="#93c5fd"/><rect x="' + (x + 2) + '" y="86" width="12" height="12" rx="2" fill="#fff" stroke="#93c5fd"/>'; [[x - 27, 58], [x + 26, 66], [x - 25, 84], [x + 24, 92], [x - 23, 104]].forEach(function (d) { o += '<path d="M' + d[0] + ' ' + (d[1] - 5) + ' q3 5 0 7 q-3 -2 0 -7z" fill="#3b82f6"/>'; }); }
      return o + t(x, 136, cap, 12, cold ? BLUE : SUB);
    }
    if (s.compare) return one(90, true, "冷やした コップ：水てき") + one(230, false, "冷やさない：つかない");
    var out = one(110, true, "冷たい コップ");
    out += '<circle cx="225" cy="40" r="3" fill="#cbd5e1"/><circle cx="246" cy="58" r="3" fill="#cbd5e1"/><circle cx="214" cy="70" r="3" fill="#cbd5e1"/><circle cx="252" cy="88" r="3" fill="#cbd5e1"/>';
    out += t(238, 22, "空気中の 水じょう気", 11, SUB);
    out += arrow(206, 64, 146, 70, BLUE) + t(250, 116, "冷やされて", 11, BLUE) + t(250, 132, "水てき に もどる", 12, BLUE);
    return out;
  }
  function evap(s) {
    var out = '<rect x="70" y="40" width="120" height="86" rx="6" fill="none" stroke="' + WIRE + '" stroke-width="2.6"/>';
    out += '<rect x="72" y="80" width="116" height="44" fill="#93c5fd"/>' + L(72, 62, 188, 62, "#93c5fd", 2, "4 4") + t(64, 66, "前の 水面", 10, SUB, "end");
    [[95, 70], [130, 60], [165, 70]].forEach(function (p) { out += arrow(p[0], p[1] + 8, p[0], p[1] - 34, MARK, 2); });
    out += t(255, 30, "水 → 水じょう気", 12, MARK) + t(255, 47, "（目に 見えない）", 10, SUB) + t(255, 64, "空気中へ 出ていく", 11, MARK);
    if (s.cover) out = cover();
    return out;
  }
  function cover() {
    function beaker(x, lid, cap) {
      var o = '<path d="M' + (x - 34) + ' 46 L' + (x - 34) + ' 118 L' + (x + 34) + ' 118 L' + (x + 34) + ' 46" fill="none" stroke="' + WIRE + '" stroke-width="2.4"/>';
      o += '<rect x="' + (x - 32) + '" y="' + (lid ? 78 : 88) + '" width="64" height="' + (lid ? 38 : 28) + '" fill="#93c5fd"/>';
      if (lid) { o += '<path d="M' + (x - 40) + ' 44 Q' + x + ' 30 ' + (x + 40) + ' 44" fill="none" stroke="#a78bfa" stroke-width="3"/>'; [[x - 18, 42], [x - 2, 38], [x + 14, 40]].forEach(function (d) { o += '<path d="M' + d[0] + ' ' + d[1] + ' q3 5 0 7 q-3 -2 0 -7z" fill="#3b82f6"/>'; }); }
      return o + t(x, 136, cap, 11, lid ? BLUE : SUB);
    }
    return beaker(90, false, "ア：おおいなし → へる") + beaker(230, true, "イ：おおいの 内がわに 水てき");
  }
  function freeze() {
    function c(x, ice, cap) {
      var o = '<path d="M' + (x - 30) + ' 30 L' + (x - 30) + ' 118 L' + (x + 30) + ' 118 L' + (x + 30) + ' 30" fill="none" stroke="' + WIRE + '" stroke-width="2.4"/>';
      o += ice ? '<path d="M' + (x - 28) + ' 116 L' + (x - 28) + ' 62 Q' + x + ' 50 ' + (x + 28) + ' 62 L' + (x + 28) + ' 116z" fill="#e0f2fe" stroke="#93c5fd" stroke-width="2"/>' : '<rect x="' + (x - 28) + '" y="70" width="56" height="46" fill="#93c5fd"/>';
      return o + t(x, 136, cap, 12, ice ? BLUE : SUB);
    }
    return c(90, false, "水") + arrow(140, 80, 180, 80, BLUE) + t(160, 70, "冷やす", 11, BLUE) + c(230, true, "氷：かさが ふえる") + L(56, 70, 264, 70, MARK, 1.4, "4 4");
  }

  /* ---------------- 空気と水（注射器・空気でっぽう） ---------------- */
  function syringe(s) {
    function one(y, fill, pressed, cap) {
      var x0 = 40, x1 = 230, push = pressed ? (fill === "water" ? 0 : (fill === "mix" ? 40 : 70)) : 0, out = "";
      out += '<rect x="' + x0 + '" y="' + (y - 16) + '" width="' + (x1 - x0) + '" height="32" rx="6" fill="#fff" stroke="' + WIRE + '" stroke-width="2.4"/>';
      out += '<path d="M' + (x0 - 18) + ' ' + y + ' H' + x0 + '" stroke="' + WIRE + '" stroke-width="5"/>';
      var px = x1 - 8 - push, inner = px - x0 - 4;
      if (fill === "water") out += '<rect x="' + (x0 + 2) + '" y="' + (y - 14) + '" width="' + inner + '" height="28" fill="#93c5fd"/>';
      else if (fill === "mix") out += '<rect x="' + (x0 + 2) + '" y="' + (y - 14) + '" width="70" height="28" fill="#93c5fd"/>' + dots(x0 + 76, px - 4, y);
      else out += dots(x0 + 6, px - 4, y);
      out += '<rect x="' + px + '" y="' + (y - 14) + '" width="8" height="28" fill="#a78bfa"/><path d="M' + (px + 8) + ' ' + y + ' H' + (px + 70) + '" stroke="#a78bfa" stroke-width="6"/><rect x="' + (px + 66) + '" y="' + (y - 16) + '" width="8" height="32" rx="3" fill="#a78bfa"/>';
      if (pressed) out += arrow(px + 110, y, px + 82, y, MARK);
      return out + t(x0, y + 30, cap, 11, pressed ? MARK : SUB, "start");
    }
    function dots(a, b, y) { var o = "", n = Math.max(3, Math.round((b - a) / 14)); for (var i = 0; i < n; i++) o += '<circle cx="' + (a + (b - a) * (i + 0.5) / n) + '" cy="' + (y + (i % 2 ? 6 : -6)) + '" r="2.4" fill="#94a3b8"/>'; return o; }
    var f = s.fill || "air";
    if (f === "compare") return one(36, "air", true, "空気：おすと ちぢむ") + one(104, "water", true, "水：おしても ちぢまない");
    return one(36, f, false, f === "water" ? "水を とじこめる" : f === "mix" ? "水と 空気" : "空気を とじこめる") +
           one(104, f, true, f === "water" ? "おしても ちぢまない" : f === "mix" ? "ちぢむのは 空気だけ" : "おすと ちぢむ（手ごたえ）");
  }
  function airgun() {
    var out = '<rect x="40" y="58" width="200" height="34" rx="8" fill="#fff" stroke="' + WIRE + '" stroke-width="2.4"/>';
    out += '<circle cx="232" cy="75" r="15" fill="#fde68a" stroke="#ca8a04" stroke-width="2"/>' + '<circle cx="128" cy="75" r="15" fill="#fde68a" stroke="#ca8a04" stroke-width="2"/>';
    for (var i = 0; i < 9; i++) out += '<circle cx="' + (150 + i * 8) + '" cy="' + (68 + (i % 2) * 14) + '" r="2.2" fill="#94a3b8"/>';
    out += '<path d="M20 75 H110" stroke="#a78bfa" stroke-width="7"/>' + arrow(18, 104, 90, 104, MARK) + t(54, 124, "おす", 12, MARK);
    out += arrow(250, 75, 300, 66, "#f59e0b", 3) + t(282, 52, "ポン！", 13, "#f59e0b");
    out += t(186, 40, "ちぢめられた 空気が", 11, MARK) + t(186, 140, "もとに もどろうとして 玉を おす", 11, MARK);
    return out;
  }

  /* ---------------- あたたまり方 ---------------- */
  var HOT = ["#ef4444", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fff7ed"];
  function rod(s) {
    var out = "", n = 12, center = s.at === "center";
    for (var i = 0; i < n; i++) {
      var d = center ? Math.abs(i - (n - 1) / 2) / ((n - 1) / 2) : i / (n - 1);
      out += '<rect x="' + (30 + i * 22) + '" y="56" width="22" height="22" fill="' + HOT[Math.min(5, Math.floor(d * 6))] + '"/>';
    }
    out += '<rect x="30" y="56" width="264" height="22" fill="none" stroke="' + WIRE + '" stroke-width="2"/>';
    var fx = center ? 162 : 41;
    out += '<path d="M' + (fx - 8) + ' 112 q-4 -10 4 -18 q2 9 6 4 q4 -10 0 -16 q12 10 6 30z" fill="#f97316"/>';
    if (center) out += arrow(140, 46, 60, 46) + arrow(184, 46, 264, 46); else out += arrow(60, 46, 270, 46);
    return out + t(160, 136, center ? "熱した ところから 両はしへ 順々に" : "熱した はしから 順々に 伝わる", 12, INK);
  }
  function plate(s) {
    var out = '<rect x="90" y="10" width="140" height="120" fill="#fff7ed" stroke="' + WIRE + '" stroke-width="2"/>', cx = s.at === "center" ? 160 : 90, cy = s.at === "center" ? 70 : 130;
    out += '<clipPath id="plclip"><rect x="90" y="10" width="140" height="120"/></clipPath><g clip-path="url(#plclip)">';
    for (var i = 5; i >= 0; i--) out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (18 + i * 26) + '" fill="' + HOT[i] + '"/>';
    out += '</g><rect x="90" y="10" width="140" height="120" fill="none" stroke="' + WIRE + '" stroke-width="2"/>';
    return out + t(160, 146, s.at === "center" ? "中央から 円のように 広がる" : "熱した かどから 順々に 広がる", 12, INK);
  }
  function convection(s) {
    var out = "";
    if (s.room) {
      out += '<rect x="30" y="10" width="260" height="122" fill="#fff" stroke="' + WIRE + '" stroke-width="2.4"/>';
      if (s.ac) {
        out += '<rect x="44" y="16" width="56" height="16" rx="4" fill="#e2e8f0" stroke="' + WIRE + '" stroke-width="1.6"/>' + arrow(72, 34, 72, 104, "#ef4444", 3) + arrow(86, 34, 120, 100, "#ef4444", 3);
        out += '<path d="M120 112 H250 Q270 112 270 92 V40 Q270 22 250 22 H120" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="5 4"/>' + t(196, 58, "下に ふくと", 11, MARK) + t(196, 74, "上へ のぼって", 11, MARK) + t(196, 90, "全体が ぐるぐる", 11, MARK);
      } else {
        out += '<rect x="48" y="104" width="34" height="26" rx="4" fill="#fb923c"/>' + t(65, 146, "ストーブ", 10, SUB);
        out += arrow(65, 100, 65, 30, "#ef4444", 3) + arrow(70, 22, 250, 22, "#ef4444", 3) + arrow(270, 28, 270, 110, BLUE, 3) + arrow(250, 120, 100, 120, BLUE, 3);
        out += '<rect x="34" y="14" width="252" height="26" fill="#fecaca" opacity=".35"/>' + t(170, 54, "あたたかい 空気は 上へ", 12, "#dc2626") + t(180, 108, "つめたい 空気は 下へ", 12, BLUE);
      }
      return out;
    }
    out += '<path d="M50 20 L50 118 Q50 128 60 128 L140 128 Q150 128 150 118 L150 20" fill="#e0f2fe" stroke="' + WIRE + '" stroke-width="2.6"/>';
    out += '<path d="M100 116 V44 Q100 34 112 34 H126 Q136 34 136 46 V108 Q136 118 126 118 H112" fill="none" stroke="#ef4444" stroke-width="3"/>' + arrowHead(100, 44, -Math.PI / 2, "#ef4444") + arrowHead(136, 104, Math.PI / 2, BLUE);
    out += '<path d="M100 116 V44 Q100 34 88 34 H74 Q64 34 64 46 V108 Q64 118 74 118 H88" fill="none" stroke="#ef4444" stroke-width="3" opacity=".55"/>' + arrowHead(64, 104, Math.PI / 2, BLUE);
    out += '<path d="M92 148 q-4 -8 4 -14 q2 8 6 4 q4 -8 0 -14 q10 8 6 24z" fill="#f97316"/>';
    out += t(238, 40, "あたたまった 水は", 11, "#dc2626") + t(238, 56, "上へ のぼる", 12, "#dc2626") + t(238, 88, "つめたい 水は", 11, BLUE) + t(238, 104, "下へ", 12, BLUE) + t(238, 128, "全体が ぐるぐる（対流）", 10, INK);
    return out;
  }

  /* ---------------- 雨水 ---------------- */
  function slope(s) {
    var out = '<path d="M0 30 Q120 40 200 100 Q240 126 320 126 V150 H0z" fill="#d6b37a"/>';
    out += '<path d="M200 114 Q250 132 300 126 Q262 118 228 112z" fill="#60a5fa"/>' + t(262, 146, "水たまり（低い ところ）", 11, BLUE);
    out += arrow(40, 26, 100, 40, BLUE) + arrow(110, 46, 170, 82, BLUE) + arrow(176, 90, 214, 110, BLUE);
    out += t(60, 16, "高い", 12, INK) + t(300, 112, "低い", 12, INK);
    if (s.steep) out += t(222, 34, "かたむきが 急 → 流れが 速い", 12, MARK);
    return out;
  }
  function soil() {
    function cup(x, r, gap, name, drops, cap) {
      var o = '<path d="M' + (x - 34) + ' 20 L' + (x - 26) + ' 96 L' + (x + 26) + ' 96 L' + (x + 34) + ' 20" fill="#fff" stroke="' + WIRE + '" stroke-width="2"/>';
      for (var row = 0; row < 4; row++) for (var c = -2; c <= 2; c++) { var cx = x + c * (r * 2 + gap) + (row % 2 ? r : 0), cy = 88 - row * (r * 2 + gap - 2); if (Math.abs(cx - x) < 26) o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#d6b37a" stroke="#a16207" stroke-width=".8"/>'; }
      for (var d = 0; d < drops; d++) o += '<path d="M' + (x - 8 + d * 8) + ' 104 q3 5 0 7 q-3 -2 0 -7z" fill="#3b82f6"/>';
      return o + t(x, 128, name, 12, INK) + t(x, 144, cap, 10, drops >= 3 ? BLUE : SUB);
    }
    return cup(60, 9, 3, "ジャリ", 3, "すぐ しみこむ") + cup(160, 5, 2, "すな", 2, "しみこむ") + cup(260, 2.4, .6, "土", 1, "しみこみにくい");
  }
  function puddles() {
    var out = '<rect x="0" y="0" width="160" height="150" fill="#fef9c3"/><rect x="160" y="0" width="160" height="150" fill="#e2e8f0"/>';
    out += '<circle cx="40" cy="30" r="14" fill="#fb923c"/>' + '<ellipse cx="80" cy="112" rx="40" ry="10" fill="#60a5fa"/>' + arrow(70, 98, 70, 66, MARK) + arrow(92, 98, 92, 60, MARK) + t(80, 140, "日なた：早く かわく", 11, "#b45309");
    out += '<ellipse cx="240" cy="110" rx="56" ry="14" fill="#60a5fa"/>' + arrow(240, 94, 240, 76, MARK) + t(240, 140, "日かげ：おそい", 11, SUB);
    return out;
  }

  /* ---------------- 磁石 ---------------- */
  function bar(x, y, left, w) {
    w = w || 100; var right = left === "N" ? "S" : "N";
    var col = function (p) { return p === "N" ? "#ef4444" : "#3b82f6"; };
    return '<rect x="' + x + '" y="' + (y - 14) + '" width="' + (w / 2) + '" height="28" fill="' + col(left) + '"/><rect x="' + (x + w / 2) + '" y="' + (y - 14) + '" width="' + (w / 2) + '" height="28" fill="' + col(right) + '"/>' +
      t(x + w / 4, y + 5, left, 14, "#fff") + t(x + w * 3 / 4, y + 5, right, 14, "#fff");
  }
  function magnets(s) {
    if (s.k === "split") {
      return bar(60, 40, "N", 200) + L(160, 20, 160, 60, "#334155", 2, "4 3") + arrow(160, 66, 160, 84, MARK) +
        bar(40, 112, "N", 100) + bar(180, 112, "N", 100) + t(160, 144, "われた ところに 新しい N極と S極", 12, MARK);
    }
    // attract：左の磁石の 右はし S ／ 右の磁石の 左はし N（ちがう極）。repel：どちらも N（同じ極）
    function pair(y, attract) {
      var o = bar(20, y, attract ? "N" : "S") + bar(attract ? 138 : 196, y, "N");
      if (attract) o += arrow(250, y, 246, y, MARK) + t(285, y + 5, "ひきあう", 12, MARK);
      else o += arrow(150, y, 128, y, BLUE) + arrow(172, y, 194, y, BLUE) + t(160, y - 20, "しりぞけあう", 12, BLUE);
      return o;
    }
    var out = "";
    if (s.k !== "repel") out += pair(s.k === "attract" ? 75 : 40, true);
    if (s.k !== "attract") out += pair(s.k === "repel" ? 75 : 112, false);
    return out;
  }

  /* ---------------- うでの 骨と 筋肉 ---------------- */
  function arm(s) {
    var bent = s.bent, out = "";
    var sh = P2(44, 82), el = P2(168, 92), hand = bent ? P2(214, 20) : P2(288, 100);
    // うでの 形（はだ）
    out += '<path d="M' + sh.x + ' ' + sh.y + ' L' + el.x + ' ' + el.y + ' L' + hand.x + ' ' + hand.y + '" fill="none" stroke="#fde7d7" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>';
    out += '<circle cx="' + hand.x + '" cy="' + hand.y + '" r="17" fill="#fde7d7"/>';
    // 骨
    out += '<path d="M' + (sh.x + 4) + ' ' + sh.y + ' L' + (el.x - 6) + ' ' + (el.y - 1) + ' M' + (el.x + 4) + ' ' + (el.y - 2) + ' L' + (hand.x - (bent ? 6 : 14)) + ' ' + (hand.y + (bent ? 12 : 0)) + '" stroke="#94a3b8" stroke-width="11" stroke-linecap="round"/>';
    out += '<path d="M' + (sh.x + 4) + ' ' + sh.y + ' L' + (el.x - 6) + ' ' + (el.y - 1) + ' M' + (el.x + 4) + ' ' + (el.y - 2) + ' L' + (hand.x - (bent ? 6 : 14)) + ' ' + (hand.y + (bent ? 12 : 0)) + '" stroke="#fff" stroke-width="7" stroke-linecap="round"/>';
    // 内側の 筋肉（上）：骨から 関節を またいで 下の骨へ
    var bEnd = bent ? P2(186, 64) : P2(196, 86), bBulge = bent ? 44 : 12, bMid = P2((58 + bEnd.x) / 2, (70 + bEnd.y) / 2);
    out += '<path d="M58 72 Q' + bMid.x + ' ' + (bMid.y - bBulge) + ' ' + bEnd.x + ' ' + bEnd.y + ' Q' + bMid.x + ' ' + (bMid.y - bBulge * 0.25) + ' 58 76 Z" fill="#f87171" stroke="#b91c1c" stroke-width="1.6"/>';
    // 外側の 筋肉（下）：ひじの うしろへ
    var tBulge = bent ? 8 : 26;
    out += '<path d="M58 92 Q112 ' + (100 + tBulge) + ' 172 104 Q112 ' + (100 + tBulge * 0.3) + ' 58 96 Z" fill="#fca5a5" stroke="#b91c1c" stroke-width="1.6"/>';
    out += '<circle cx="' + el.x + '" cy="' + el.y + '" r="8" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>' + t(el.x + (bent ? 30 : 0), el.y + (bent ? 26 : 36), "関節", 12, "#ca8a04");
    out += t(100, bent ? 24 : 52, bent ? "内側：ちぢむ（力こぶ）" : "内側：のびる", 12, "#b91c1c");
    out += t(100, bent ? 128 : 140, bent ? "外側：のびる" : "外側：ちぢむ", 12, "#b91c1c");
    return out;
  }
  function P2(x, y) { return { x: x, y: y }; }

  /* ---------------- 星座の 動き（★2026-10-03追加）：同じ 星座を 2つの 時刻で くらべる ---------------- */
  // 南の 空を 見た ところ（左が 東・右が 西）。並び方は 同じまま、時間が たつと 西へ 動く
  var SCORPIUS = [[-34, -26], [-30, -16], [-24, -6], [-10, -4], [0, 6], [6, 18], [10, 30], [20, 38], [32, 36], [38, 26], [34, 18]];
  function starmove(s) {
    var out = '<rect x="0" y="0" width="320" height="150" rx="10" fill="#1e1b4b"/>';
    out += '<path d="M0 132 Q160 118 320 132 V150 H0z" fill="#334155"/>';
    out += t(18, 146, "東", 12, "#e0e7ff") + t(160, 146, "南", 12, "#e0e7ff") + t(302, 146, "西", 12, "#e0e7ff");
    function con(cx, cy, faint, label) {
      var o = '<path d="M' + SCORPIUS.map(function (p) { return (cx + p[0]) + ' ' + (cy + p[1]); }).join(" L") + '" fill="none" stroke="' + (faint ? "#6366f1" : "#a5b4fc") + '" stroke-width="1.4"' + (faint ? ' stroke-dasharray="3 3"' : "") + '/>';
      SCORPIUS.forEach(function (p, i) { var red = i === 3; o += '<circle cx="' + (cx + p[0]) + '" cy="' + (cy + p[1]) + '" r="' + (red ? 4.5 : 2.6) + '" fill="' + (red ? "#f87171" : "#fff") + '" opacity="' + (faint ? 0.55 : 1) + '"/>'; });
      return o + t(cx, cy - 36, label, 12, faint ? "#a5b4fc" : "#fde047");
    }
    out += con(98, 82, true, s.from || "午後8時") + con(222, 74, false, s.to || "午後9時");
    out += '<path d="M130 40 Q160 26 190 34" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>' + arrowHead(190, 34, 0.3, MARK);
    out += t(160, 20, s.note === false ? "西へ 動く" : "西へ 動く（ならび方は 同じ）", 11, "#f9a8d4");
    return out;
  }
  // 星の 色を くらべる
  function starcolor(s) {
    var items = s.items || [["ベガ", "こと座", "#e0f2fe", "白っぽい"], ["アンタレス", "さそり座", "#f87171", "赤っぽい"]], out = '<rect x="0" y="0" width="320" height="150" rx="10" fill="#1e1b4b"/>';
    var w = 320 / items.length;
    items.forEach(function (it, i) {
      var cx = w * i + w / 2, on = s.hl === it[0];
      out += '<circle cx="' + cx + '" cy="62" r="24" fill="' + it[2] + '" opacity=".25"/><circle cx="' + cx + '" cy="62" r="13" fill="' + it[2] + '"/>';
      out += t(cx, 112, it[0] + "（" + it[1] + "）", 12, on ? "#fde047" : "#e0e7ff") + t(cx, 132, it[3], 13, on ? "#fde047" : "#c7d2fe");
    });
    return out;
  }

  T.starmove = starmove; T.starcolor = starcolor;
  T.syringe = syringe; T.airgun = airgun; T.rod = rod; T.plate = plate; T.convection = convection;
  T.slope = slope; T.soil = soil; T.puddles = puddles; T.magnets = magnets; T.arm = arm;
  T.circuit = circuit; T.skypath = skypath; T.sunmoon = sunmoon; T.moonshapes = moonshapes; T.stars = stars;
  T.fist = fist; T.compass = compass; T.states = states; T.boil = boil; T.cup = cup; T.evap = evap; T.cover = cover; T.freeze = freeze;
})();
