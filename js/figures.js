/* =====================================================================
   figures.js — 問題・解説に出す「学習用イラスト」の部品集（SVG）
   ★2026-10-02追加（「イラストで学習できるところは、イラスト化」）
   - 図は問題データ（js/quizzes/*.js）を書きかえず、js/figure-map.js の対応表（問題文→図）で付ける
       fig         … 問題文の下に出す図（見て考える問題だけ。答えが図に書いてあってはいけない）
       explain_fig … 解説に出す図（答えたあとに「図で わかる」ための図。答えを図で見せてよい）
   - window.renderFigure(spec) が SVG 文字列を返す。spec.t で種類を選ぶ
   - 色：辺＝むらさき、しるし（直角・同じ長さ・平行）＝ピンク で統一
   ===================================================================== */
(function () {
  "use strict";

  var INK = "#6b21a8", FILL = "#f5f3ff", MARK = "#db2777", SUB = "#7a6985";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function P(x, y) { return { x: x, y: y }; }
  function sub(a, b) { return P(a.x - b.x, a.y - b.y); }
  function add(a, b) { return P(a.x + b.x, a.y + b.y); }
  function mul(a, k) { return P(a.x * k, a.y * k); }
  function len(a) { return Math.sqrt(a.x * a.x + a.y * a.y); }
  function norm(a) { var l = len(a) || 1; return P(a.x / l, a.y / l); }
  function f(n) { return Math.round(n * 10) / 10; }
  function pt(p) { return f(p.x) + " " + f(p.y); }

  // ---- しるし ----
  function rightAngle(V, A, B, size) {
    size = size || 11;
    var u = mul(norm(sub(A, V)), size), w = mul(norm(sub(B, V)), size);
    return '<path d="M' + pt(add(V, u)) + ' L' + pt(add(add(V, u), w)) + ' L' + pt(add(V, w)) + '" fill="none" stroke="' + MARK + '" stroke-width="2"/>';
  }
  function ticks(A, B, n) {
    var M = mul(add(A, B), 0.5), d = norm(sub(B, A)), nr = P(-d.y, d.x), out = "";
    for (var i = 0; i < n; i++) {
      var c = add(M, mul(d, (i - (n - 1) / 2) * 5));
      out += '<path d="M' + pt(add(c, mul(nr, 6))) + ' L' + pt(add(c, mul(nr, -6))) + '" stroke="' + MARK + '" stroke-width="2.2" stroke-linecap="round"/>';
    }
    return out;
  }
  function chevrons(A, B, n) {
    var M = mul(add(A, B), 0.5), d = norm(sub(B, A)), nr = P(-d.y, d.x), out = "";
    for (var i = 0; i < n; i++) {
      var tip = add(M, mul(d, (i - (n - 1) / 2) * 7 + 3));
      out += '<path d="M' + pt(add(add(tip, mul(d, -7)), mul(nr, 5))) + ' L' + pt(tip) + ' L' + pt(add(add(tip, mul(d, -7)), mul(nr, -5))) + '" fill="none" stroke="' + MARK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return out;
  }
  function arc(V, A, B, r, n) {
    var a1 = Math.atan2(A.y - V.y, A.x - V.x), a2 = Math.atan2(B.y - V.y, B.x - V.x), out = "";
    var d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    for (var i = 0; i < (n || 1); i++) {
      var rr = r + i * 4;
      var s = add(V, P(Math.cos(a1) * rr, Math.sin(a1) * rr)), e = add(V, P(Math.cos(a1 + d) * rr, Math.sin(a1 + d) * rr));
      out += '<path d="M' + pt(s) + ' A' + rr + ' ' + rr + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + pt(e) + '" fill="none" stroke="' + MARK + '" stroke-width="2"/>';
    }
    return out;
  }
  function text(x, y, s, size, color, anchor) {
    return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + (size || 13) + '" font-weight="900" fill="' + (color || INK) + '" text-anchor="' + (anchor || "middle") + '" font-family="\'Zen Maru Gothic\',sans-serif">' + esc(s) + '</text>';
  }
  function poly(pts, opt) {
    opt = opt || {};
    return '<path d="M' + pts.map(pt).join(" L") + ' Z" fill="' + (opt.fill || FILL) + '" stroke="' + (opt.stroke || INK) + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  function line(A, B, opt) {
    opt = opt || {};
    return '<path d="M' + pt(A) + ' L' + pt(B) + '" stroke="' + (opt.color || INK) + '" stroke-width="' + (opt.w || 3) + '"' + (opt.dash ? ' stroke-dasharray="' + opt.dash + '"' : '') + ' stroke-linecap="round"/>';
  }
  function intersect(A, C, B, D) {
    var r = sub(C, A), s = sub(D, B), den = r.x * s.y - r.y * s.x;
    if (Math.abs(den) < 1e-9) return null;
    var t = ((B.x - A.x) * s.y - (B.y - A.y) * s.x) / den;
    return add(A, mul(r, t));
  }

  /* ---------------- 三角形・四角形 ---------------- */
  // 辺のしるし: e=[[i,j,"tick"|"par",n]], 直角: r=[i], 角の弧: arcs=[[i,n]]
  var SHAPES = {
    square:        { p: [P(105, 15), P(215, 15), P(215, 125), P(105, 125)], r: [0, 1, 2, 3], e: [[0, 1, "tick", 1], [1, 2, "tick", 1], [2, 3, "tick", 1], [3, 0, "tick", 1]] },
    rect:          { p: [P(60, 25), P(260, 25), P(260, 120), P(60, 120)], r: [0, 1, 2, 3], e: [[0, 1, "tick", 1], [2, 3, "tick", 1], [1, 2, "tick", 2], [3, 0, "tick", 2]] },
    rect_par:      { p: [P(60, 25), P(260, 25), P(260, 120), P(60, 120)], e: [[0, 1, "par", 1], [3, 2, "par", 1], [3, 0, "par", 2], [2, 1, "par", 2]] },
    trapezoid:     { p: [P(115, 25), P(215, 25), P(275, 120), P(45, 120)], e: [[0, 1, "par", 1], [3, 2, "par", 1]] },
    parallelogram: { p: [P(105, 25), P(275, 25), P(215, 120), P(45, 120)], e: [[0, 1, "par", 1], [3, 2, "par", 1], [3, 0, "par", 2], [2, 1, "par", 2]], arcs: [[0, 1], [2, 1], [1, 2], [3, 2]] },
    rhombus:       { p: [P(160, 10), P(245, 72), P(160, 134), P(75, 72)], e: [[0, 1, "tick", 1], [1, 2, "tick", 1], [2, 3, "tick", 1], [3, 0, "tick", 1]], arcs: [[0, 1], [2, 1], [1, 2], [3, 2]] },
    eq_tri:        { p: [P(160, 14), P(225, 127), P(95, 127)], e: [[0, 1, "tick", 1], [1, 2, "tick", 1], [2, 0, "tick", 1]], arcs: [[0, 1], [1, 1], [2, 1]] },
    iso_tri:       { p: [P(160, 10), P(212, 128), P(108, 128)], e: [[0, 1, "tick", 1], [2, 0, "tick", 1]], arcs: [[1, 1], [2, 1]] },
    right_tri:     { p: [P(95, 15), P(250, 125), P(95, 125)], r: [2] },
    right_iso_tri: { p: [P(105, 15), P(215, 125), P(105, 125)], r: [2], e: [[0, 2, "tick", 1], [2, 1, "tick", 1]] },
    scalene_tri:   { p: [P(125, 15), P(275, 125), P(55, 125)] }
  };
  function shape(spec) {
    var S = SHAPES[spec.k]; if (!S) return "";
    var p = S.p, n = p.length, out = poly(p);
    var marks = spec.marks !== false;
    if (spec.diag && n === 4) {
      var O = intersect(p[0], p[2], p[1], p[3]);
      out += line(p[0], p[2], { color: "#a78bfa", w: 2.4, dash: "6 4" }) + line(p[1], p[3], { color: "#a78bfa", w: 2.4, dash: "6 4" });
      if (O && spec.diag !== "plain") {
        var dm = spec.diag === true ? (DIAG_DEFAULT[spec.k] || {}) : spec.diag;
        if (dm.bisect) { var t2 = dm.equal ? 1 : 2; out += ticks(p[0], O, 1) + ticks(O, p[2], 1) + ticks(p[1], O, t2) + ticks(O, p[3], t2); } // 長さが同じ対角線なら4つの半分は全部同じしるし
        if (dm.equal && !dm.bisect) { out += ticks(p[0], p[2], 3) + ticks(p[1], p[3], 3); }
        if (dm.perp) out += rightAngle(O, p[0], p[1], 9);
        out += '<circle cx="' + f(O.x) + '" cy="' + f(O.y) + '" r="3" fill="' + MARK + '"/>';
      }
    }
    if (marks) {
      (S.r || []).forEach(function (i) { out += rightAngle(p[i], p[(i + 1) % n], p[(i + n - 1) % n]); });
      (S.e || []).forEach(function (e) { out += (e[2] === "tick" ? ticks : chevrons)(p[e[0]], p[e[1]], e[3]); });
      if (spec.arcs !== false) (S.arcs || []).forEach(function (a) { var i = a[0]; out += arc(p[i], p[(i + 1) % n], p[(i + n - 1) % n], 15, a[1]); });
    }
    if (spec.angleLabels) spec.angleLabels.forEach(function (lab, i) {
      if (!lab) return; var c = P(0, 0); p.forEach(function (q) { c = add(c, q); }); c = mul(c, 1 / n);
      var q = add(p[i], mul(norm(sub(c, p[i])), 30)); out += text(q.x, q.y + 4, lab, 12, MARK);
    });
    return out;
  }
  // 対角線のしるし（diag:true のとき）：平行四辺形のなかまは二等分、ひし形・正方形は垂直、長方形・正方形は長さが同じ
  var DIAG_DEFAULT = {
    square: { bisect: true, perp: true, equal: true }, rect: { bisect: true, equal: true },
    parallelogram: { bisect: true }, rhombus: { bisect: true, perp: true }, trapezoid: {}
  };

  /* ---------------- 直線（垂直・平行） ---------------- */
  function lines(spec) {
    var out = "";
    if (spec.k === "perp") {
      out += line(P(40, 80), P(280, 80)) + line(P(160, 12), P(160, 140)) + rightAngle(P(160, 80), P(280, 80), P(160, 12), 13);
    } else if (spec.k === "parallel") {
      out += line(P(30, 50), P(290, 30)) + line(P(30, 120), P(290, 100));
      out += line(P(0, 52.3), P(30, 50), { dash: "5 5", w: 2 }) + line(P(290, 30), P(320, 27.7), { dash: "5 5", w: 2 });
      out += line(P(0, 122.3), P(30, 120), { dash: "5 5", w: 2 }) + line(P(290, 100), P(320, 97.7), { dash: "5 5", w: 2 });
      out += chevrons(P(30, 50), P(290, 30), 1) + chevrons(P(30, 120), P(290, 100), 1);
      out += '<path d="M160 44 V106" stroke="' + SUB + '" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M90 50 V112" stroke="' + SUB + '" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M230 39 V101" stroke="' + SUB + '" stroke-width="1.5" stroke-dasharray="3 3"/>';
      out += text(160, 146, "はばが どこでも 同じ → 交わらない", 12, SUB);
    } else if (spec.k === "perp2") {
      out += line(P(30, 120), P(290, 120)) + line(P(110, 15), P(110, 120)) + line(P(210, 15), P(210, 120));
      out += rightAngle(P(110, 120), P(290, 120), P(110, 15), 11) + rightAngle(P(210, 120), P(290, 120), P(210, 15), 11);
      out += chevrons(P(110, 120), P(110, 15), 1) + chevrons(P(210, 120), P(210, 15), 1);
    } else if (spec.k === "grid") {
      for (var i = 0; i <= 6; i++) out += line(P(40 + i * 40, 15), P(40 + i * 40, 135), { w: 1.6, color: "#c4b5fd" });
      for (var j = 0; j <= 3; j++) out += line(P(40, 15 + j * 40), P(280, 15 + j * 40), { w: 1.6, color: "#c4b5fd" });
      out += line(P(120, 15), P(120, 135), { w: 3 }) + line(P(40, 95), P(280, 95), { w: 3 }) + rightAngle(P(120, 95), P(280, 95), P(120, 15), 12);
    } else if (spec.k === "notebook") {
      out += '<rect x="40" y="8" width="240" height="134" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>';
      for (var k = 0; k < 5; k++) { var y = 28 + k * 25; out += line(P(52, y), P(268, y), { w: 2, color: "#93c5fd" }); out += chevrons(P(52, y), P(268, y), 1); }
      if (spec.vertical) { out += line(P(120, 12), P(120, 138), { w: 3 }) + line(P(210, 12), P(210, 138), { w: 3 }); out += rightAngle(P(120, 78), P(268, 78), P(120, 12), 9) + rightAngle(P(210, 78), P(268, 78), P(210, 12), 9); }
    }
    return out;
  }

  /* ---------------- 角度 ---------------- */
  function angle(spec) {
    var deg = spec.deg, V = P(160, 120), r = 130;
    if (deg > 180) V = P(160, 78);
    var A = add(V, P(r, 0)), rad = -deg * Math.PI / 180, B = add(V, P(Math.cos(rad) * (deg > 180 ? 75 : r * 0.85), Math.sin(rad) * (deg > 180 ? 75 : r * 0.85)));
    if (deg <= 180 && B.y < 10) B = add(V, mul(sub(B, V), (V.y - 10) / (V.y - B.y)));
    var out = line(V, deg > 180 ? add(V, P(110, 0)) : A) + line(V, B);
    var rr = deg > 180 ? 26 : 30, large = deg > 180 ? 1 : 0;
    var s = add(V, P(rr, 0)), e = add(V, P(Math.cos(rad) * rr, Math.sin(rad) * rr));
    out += '<path d="M' + pt(s) + ' A' + rr + ' ' + rr + ' 0 ' + large + ' 0 ' + pt(e) + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>';
    if (deg === 90) out = line(V, A) + line(V, B) + rightAngle(V, A, B, 16);
    var mid = -deg / 2 * Math.PI / 180, lp = add(V, P(Math.cos(mid) * (rr + 22), Math.sin(mid) * (rr + 22)));
    if (spec.label !== false) out += text(lp.x, lp.y + 5, spec.label || (deg + "°"), 15, MARK);
    out += '<circle cx="' + f(V.x) + '" cy="' + f(V.y) + '" r="3.5" fill="' + INK + '"/>';
    return out;
  }

  /* ---------------- 並べて くらべる（2〜3こ）：1こずつ別のSVGにしてHTMLで横に並べる（小さくなりすぎないように） ---------------- */
  function rowHtml(spec) {
    var cells = (spec.items || []).map(function (it) {
      var one = Object.assign({}, it); delete one.cap;
      return '<div class="fig-cell">' + window.renderFigure(one) + (it.cap ? '<div class="fig-cap">' + esc(it.cap) + '</div>' : '') + '</div>';
    }).join("");
    return '<div class="fig-row">' + cells + '</div>' + (spec.cap ? '<div class="fig-cap fig-cap-main">' + esc(spec.cap) + '</div>' : '');
  }

  /* ---------------- 角度（追加）：1回転・2つに分けた角 ---------------- */
  function angle2(spec) {
    var V = P(160, 118), deg = spec.deg;
    if (deg === 360) {
      V = P(160, 78);
      var out = line(V, P(285, 78)) + '<circle cx="160" cy="78" r="3.5" fill="' + INK + '"/>';
      out += '<path d="M190 78 A30 30 0 1 0 189.5 82" fill="none" stroke="' + MARK + '" stroke-width="2.4"/><path d="M183 86 L190 80 L193 89" fill="none" stroke="' + MARK + '" stroke-width="2.4" stroke-linejoin="round"/>';
      return out + text(160, 136, spec.label || "360°", 16, MARK);
    }
    var R = 125, out2 = "";
    function ray(d) { var r = -d * Math.PI / 180; var e = add(V, P(Math.cos(r) * R, Math.sin(r) * R)); if (e.y < 8) e = add(V, mul(sub(e, V), (V.y - 8) / (V.y - e.y))); return e; }
    function arcBetween(d1, d2, rr, lab) {
      var r1 = -d1 * Math.PI / 180, r2 = -d2 * Math.PI / 180;
      var s = add(V, P(Math.cos(r1) * rr, Math.sin(r1) * rr)), e = add(V, P(Math.cos(r2) * rr, Math.sin(r2) * rr));
      var o = '<path d="M' + pt(s) + ' A' + rr + ' ' + rr + ' 0 0 0 ' + pt(e) + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>';
      if (d2 - d1 === 90) o = rightAngle(V, ray(d1), ray(d2), 14);
      var m = -(d1 + d2) / 2 * Math.PI / 180, lp = add(V, P(Math.cos(m) * (rr + 20), Math.sin(m) * (rr + 20)));
      return o + (lab ? text(lp.x, lp.y + 5, lab, 14, MARK) : "");
    }
    out2 += line(V, ray(0)) + line(V, ray(deg));
    if (spec.split) {
      out2 += line(V, ray(spec.split), { color: "#a78bfa" });
      out2 += arcBetween(0, spec.split, 28, spec.split + "°") + arcBetween(spec.split, deg, 36, (deg - spec.split) + "°");
    } else out2 += arcBetween(0, deg, 30, spec.label === false ? "" : (spec.label || deg + "°"));
    return out2 + '<circle cx="' + V.x + '" cy="' + V.y + '" r="3.5" fill="' + INK + '"/>';
  }

  /* ---------------- 角度どおりの三角形（角A・角B を指定。Cは のこり） ---------------- */
  function tri(spec) {
    var a = spec.a * Math.PI / 180, b = spec.b * Math.PI / 180;
    var A0 = P(0, 0), B0 = P(1, 0);
    var C0 = intersect(A0, P(Math.cos(a), -Math.sin(a)), B0, P(1 - Math.cos(b), -Math.sin(b)));
    var pts = [A0, B0, C0], minx = Math.min(A0.x, C0.x), maxx = Math.max(B0.x, C0.x), miny = C0.y, maxy = 0;
    var sc = Math.min(250 / (maxx - minx), 105 / (maxy - miny));
    var ox = 160 - (minx + maxx) / 2 * sc, oy = 128;
    var p = pts.map(function (q) { return P(ox + q.x * sc, oy + q.y * sc); });
    var out = poly(p);
    var labs = spec.labels || {}, names = ["A", "B", "C"], cen = mul(add(add(p[0], p[1]), p[2]), 1 / 3);
    for (var i = 0; i < 3; i++) {
      var o = p[(i + 1) % 3], q = p[(i + 2) % 3];
      out += arc(p[i], o, q, 16, 1);
      var inside = add(p[i], mul(norm(sub(cen, p[i])), 34));
      if (labs[names[i]]) out += text(inside.x, inside.y + 5, labs[names[i]], 13, labs[names[i]] === "?" ? "#2563eb" : MARK);
      if (spec.names !== false) { var outside = add(p[i], mul(norm(sub(p[i], cen)), 12)); out += text(outside.x, outside.y + 5, names[i], 12, SUB); }
    }
    return out;
  }

  /* ---------------- 多角形を 三角形に 分ける ---------------- */
  function polysplit(spec) {
    var n = spec.n, c = P(160, 76), r = 66, p = [], out = "", cols = ["#fce7f3", "#e0f2fe", "#fef9c3", "#dcfce7", "#ede9fe"];
    for (var i = 0; i < n; i++) { var ang = -Math.PI / 2 + Math.PI / n + i * 2 * Math.PI / n; p.push(add(c, P(Math.cos(ang) * r, Math.sin(ang) * r))); }
    for (var k = 1; k < n - 1; k++) {
      out += poly([p[0], p[k], p[k + 1]], { fill: cols[(k - 1) % cols.length], stroke: "#c4b5fd" });
      var tc = mul(add(add(p[0], p[k]), p[k + 1]), 1 / 3);
      if (spec.labels !== false) out += text(tc.x, tc.y + 4, "180°", 11, MARK);
    }
    return out + poly(p, { fill: "none" });
  }

  /* ---------------- 時計 ---------------- */
  function clock(spec) {
    var c = P(160, 74), r = 62, out = '<circle cx="160" cy="74" r="62" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6 - Math.PI / 2; out += line(add(c, P(Math.cos(a) * 54, Math.sin(a) * 54)), add(c, P(Math.cos(a) * 60, Math.sin(a) * 60)), { w: i % 3 === 0 ? 3 : 1.5, color: SUB }); }
    var ha = (spec.h % 12) * Math.PI / 6 - Math.PI / 2, ma = -Math.PI / 2;
    var H = add(c, P(Math.cos(ha) * 36, Math.sin(ha) * 36)), M = add(c, P(Math.cos(ma) * 52, Math.sin(ma) * 52));
    var deg = ((spec.h % 12) * 30) % 360;
    if (deg === 90) out += rightAngle(c, M, H, 14);
    else out += '<path d="M' + pt(add(c, P(0, -24))) + ' A24 24 0 ' + (deg > 180 ? 1 : 0) + ' 1 ' + pt(add(c, P(Math.cos(ha) * 24, Math.sin(ha) * 24))) + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>';
    out += line(c, M, { w: 3, color: "#334155" }) + line(c, H, { w: 5, color: "#334155" }) + '<circle cx="160" cy="74" r="4" fill="#334155"/>';
    if (spec.label) out += text(240, 80, spec.label, 16, MARK, "start");
    return out;
  }

  /* ---------------- 分数のテープ図 ---------------- */
  // d：分母、n：色をぬる数（dをこえたら2本目・3本目のテープ）、parts：[2,3] のように色分け、minus：うしろから×をつける数
  function frac(spec) {
    var d = spec.d, n = spec.n, bars = Math.max(1, Math.ceil(n / d)), out = "", W = 250, H = Math.min(30, 120 / bars - 8);
    var colors = ["#f9a8d4", "#93c5fd", "#fde047"], parts = spec.parts || [n], idx = 0, partOf = [];
    parts.forEach(function (cnt, pi) { for (var t = 0; t < cnt; t++) partOf.push(pi); });
    var y0 = 75 - (bars * (H + 8) - 8) / 2;
    for (var b = 0; b < bars; b++) {
      var y = y0 + b * (H + 8);
      for (var i = 0; i < d; i++) {
        var x = 30 + i * W / d, on = idx < n;
        out += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(W / d) + '" height="' + f(H) + '" fill="' + (on ? colors[partOf[idx] || 0] : "#fff") + '" stroke="' + INK + '" stroke-width="2"/>';
        if (spec.minus && on && idx >= n - spec.minus) out += '<path d="M' + f(x + 4) + ' ' + f(y + 4) + ' L' + f(x + W / d - 4) + ' ' + f(y + H - 4) + ' M' + f(x + W / d - 4) + ' ' + f(y + 4) + ' L' + f(x + 4) + ' ' + f(y + H - 4) + '" stroke="#2563eb" stroke-width="2.4"/>';
        idx++;
      }
      out += text(292, y + H / 2 + 5, "1", 13, SUB);
    }
    return out;
  }

  /* ---------------- 折れ線グラフ ---------------- */
  function graph(spec) {
    var xs = spec.xs, ys = spec.ys, lo = spec.ymin, hi = spec.ymax, X0 = 52, X1 = 300, Y0 = 128, Y1 = 14, out = "";
    var px = function (i) { return X0 + 10 + i * (X1 - X0 - 20) / (xs.length - 1); };
    var py = function (v) { return Y0 - (v - lo) / (hi - lo) * (Y0 - Y1); };
    for (var g = lo; g <= hi; g += (spec.step || 5)) { out += line(P(X0, py(g)), P(X1, py(g)), { w: 1, color: spec.lab && (g - lo) % spec.lab === 0 ? "#c4b5fd" : "#e9d5ff" }) + (!spec.lab || (g - lo) % spec.lab === 0 ? text(X0 - 6, py(g) + 4, g, 10, SUB, "end") : ""); } // lab: 数字を 書く 間かく（目もりを 自分で 読む 問題用）
    out += line(P(X0, Y0), P(X1, Y0), { w: 2, color: SUB }) + line(P(X0, Y0 + 14), P(X0, Y1), { w: 2, color: SUB });
    if (spec.wave) out += '<path d="M' + (X0 - 7) + ' ' + (Y0 + 6) + ' q3.5 -4 7 0 t7 0" fill="none" stroke="' + MARK + '" stroke-width="2.4"/><path d="M' + (X0 - 7) + ' ' + (Y0 + 10) + ' q3.5 -4 7 0 t7 0" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>';
    xs.forEach(function (x, i) { out += text(px(i), Y0 + 15, x, 10, SUB); });
    if (spec.xl) out += text(X1, Y0 + 15, spec.xl, 10, SUB, "end");
    if (spec.yl) out += text(X0 - 6, Y1 - 4, spec.yl, 10, SUB, "end");
    for (var i = 0; i < ys.length - 1; i++) {
      var hl = spec.hi && i >= spec.hi[0] && i < spec.hi[1];
      out += line(P(px(i), py(ys[i])), P(px(i + 1), py(ys[i + 1])), { w: hl ? 5 : 3, color: hl ? MARK : INK });
    }
    ys.forEach(function (v, i) { out += '<circle cx="' + f(px(i)) + '" cy="' + f(py(v)) + '" r="3.6" fill="#fff" stroke="' + INK + '" stroke-width="2"/>'; if (spec.vals && spec.vals.indexOf(i) !== -1) out += text(px(i), py(v) - 9, v + (spec.unit || ""), 11, MARK); });
    return out;
  }

  /* ---------------- 面積：タイル ---------------- */
  function tiles(spec) {
    var w = spec.w, h = spec.h, cell = Math.min(24, 250 / w, 112 / h), x0 = 160 - w * cell / 2 + 10, y0 = 10, out = "";
    for (var r = 0; r < h; r++) for (var c = 0; c < w; c++)
      out += '<rect x="' + f(x0 + c * cell) + '" y="' + f(y0 + r * cell) + '" width="' + f(cell) + '" height="' + f(cell) + '" fill="' + ((r + c) % 2 ? "#fbcfe8" : "#fce7f3") + '" stroke="#f472b6" stroke-width="1"/>';
    out += '<rect x="' + f(x0) + '" y="' + y0 + '" width="' + f(w * cell) + '" height="' + f(h * cell) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
    out += text(x0 + w * cell / 2, y0 + h * cell + 16, "よこ " + w + (spec.unit || ""), 12, INK) + text(x0 - 8, y0 + h * cell / 2 + 4, "たて " + h + (spec.unit || ""), 12, INK, "end");
    return out;
  }

  /* ---------------- 数直線 ---------------- */
  function dec(v, step) { var d = String(step).indexOf(".") >= 0 ? String(step).split(".")[1].length : 0; return Number(v.toFixed(d)); }
  function numline(spec) {
    var a = spec.from, b = spec.to, st = spec.step, X0 = 26, X1 = 294, Y = 86, out = "";
    var px = function (v) { return X0 + (v - a) / (b - a) * (X1 - X0); };
    if (spec.range) out += '<rect x="' + f(px(spec.range[0])) + '" y="' + (Y - 10) + '" width="' + f(px(spec.range[1]) - px(spec.range[0])) + '" height="20" fill="#fde68a" opacity=".8"/>';
    out += line(P(X0 - 8, Y), P(X1 + 8, Y), { w: 2.4, color: INK });
    var n = Math.round((b - a) / st);
    for (var i = 0; i <= n; i++) {
      var v = dec(a + i * st, st), major = spec.major ? Math.abs((v - a) / spec.major - Math.round((v - a) / spec.major)) < 1e-9 : (i === 0 || i === n);
      out += line(P(px(v), Y - (major ? 10 : 6)), P(px(v), Y + (major ? 10 : 6)), { w: major ? 2.4 : 1.4, color: INK });
      if (major) out += text(px(v), Y + 26, spec.fmt ? spec.fmt(v) : String(v), 11, SUB);
    }
    if (spec.mid !== undefined) out += line(P(px(spec.mid), Y - 14), P(px(spec.mid), Y + 32), { w: 1.6, color: "#2563eb", dash: "4 3" }) + text(px(spec.mid), Y + 46, "まん中 " + spec.mid, 11, "#2563eb");
    (spec.marks || []).forEach(function (m, k) {
      var x = px(m.v), up = 40 + (k % 2) * 16;
      out += '<path d="M' + f(x) + ' ' + (Y - 12) + ' L' + f(x - 5) + ' ' + (Y - 20) + ' L' + f(x + 5) + ' ' + (Y - 20) + 'z" fill="' + MARK + '"/>';
      out += text(x, Y - up + 12, m.label || String(m.v), 13, MARK);
    });
    return out;
  }

  /* ---------------- 位（くらい）の表 ---------------- */
  var BIG = ["千億", "百億", "十億", "一億", "千万", "百万", "十万", "一万", "千", "百", "十", "一"];
  function placevalue(spec) {
    var s = String(spec.n), out = "", labels, digits;
    if (s.indexOf(".") >= 0) {
      var parts = s.split("."); labels = ["一の位", "小数第一位", "小数第二位", "小数第三位"].slice(0, 1 + parts[1].length);
      if (parts[0].length > 1) labels = ["十の位"].concat(labels);
      digits = (parts[0] + parts[1]).split("");
    } else { digits = s.split(""); labels = BIG.slice(BIG.length - digits.length); }
    var n = digits.length, cw = Math.min(58, 300 / n), x0 = 160 - n * cw / 2, pointAfter = s.indexOf(".") >= 0 ? s.split(".")[0].length : -1;
    digits.forEach(function (d, i) {
      var x = x0 + i * cw, on = spec.hl === labels[i];
      out += '<rect x="' + f(x) + '" y="30" width="' + f(cw) + '" height="34" fill="' + (on ? "#fbcfe8" : (labels[i].indexOf("億") >= 0 ? "#ede9fe" : labels[i].indexOf("万") >= 0 ? "#e0f2fe" : "#fff")) + '" stroke="' + INK + '" stroke-width="1.6"/>';
      out += text(x + cw / 2, 23, labels[i].replace("の位", "").replace("小数第", "第"), n > 8 ? 9 : 10, on ? MARK : SUB);
      out += text(x + cw / 2, 56, d, 20, on ? MARK : INK);
      if (i + 1 === pointAfter) out += '<circle cx="' + f(x + cw) + '" cy="60" r="3.6" fill="' + MARK + '"/>';
    });
    if (spec.note) out += text(160, 96, spec.note, 13, MARK);
    if (spec.note2) out += text(160, 116, spec.note2, 12, SUB);
    return out;
  }

  /* ---------------- 小数の 筆算（小数点を そろえる） ---------------- */
  function colcalc(spec) {
    var a = String(spec.a), b = String(spec.b), ans = String(spec.ans);
    var dl = Math.max((a.split(".")[1] || "").length, (b.split(".")[1] || "").length, (ans.split(".")[1] || "").length);
    var il = Math.max(a.split(".")[0].length, b.split(".")[0].length, ans.split(".")[0].length);
    var cw = 26, xPoint = 170, out = "";
    function row(str, y, color, pad) {
      var ip = str.split(".")[0], dp = str.split(".")[1] || "", o = "";
      for (var i = 0; i < ip.length; i++) o += text(xPoint - (ip.length - i) * cw + cw / 2, y, ip[i], 22, color);
      if (str.indexOf(".") >= 0 || pad) o += text(xPoint, y, ".", 22, MARK);
      for (var j = 0; j < dl; j++) { var ch = dp[j]; if (ch === undefined) { if (!pad) continue; o += text(xPoint + j * cw + cw / 2 + 6, y, "0", 22, "#cbd5e1"); continue; } o += text(xPoint + j * cw + cw / 2 + 6, y, ch, 22, color); }
      return o;
    }
    out += row(a, 36, INK, true) + text(xPoint - il * cw - 14, 70, spec.op, 22, INK) + row(b, 70, INK, true); // 足りない けたは うすい 0 で 見せる（3 → 3.0、0.5 → 0.500）
    out += line(P(xPoint - il * cw - 24, 80), P(xPoint + dl * cw + 18, 80), { w: 2.4 }) + row(ans, 112, MARK);
    out += line(P(xPoint + 3, 14), P(xPoint + 3, 120), { w: 1.4, color: MARK, dash: "3 3" });
    out += text(258, 60, "小数点を", 11, MARK, "start") + text(258, 76, "たてに そろえる", 11, MARK, "start");
    return out;
  }

  var TYPES = { tiles: tiles, numline: numline, placevalue: placevalue, colcalc: colcalc, shape: shape, lines: lines, angle: angle, angle2: angle2, tri: tri, polysplit: polysplit, clock: clock, frac: frac, graph: graph };
  function draw(spec) { var fn = TYPES[spec && spec.t]; return fn ? fn(spec) : ""; }

  window.FIGURE_TYPES = TYPES;
  window.renderFigure = function (spec) {
    if (!spec) return "";
    if (spec.t === "row") return rowHtml(spec);
    var body = draw(spec);
    if (!body) return "";
    // 図の 高さ：ふつうは 150。日本地図や 長い 流れ図は spec.H か 種類ごとの H で 高く する
    var fn = TYPES[spec.t], h = (spec.H || (fn && fn.H) || 150) + (spec.cap ? 24 : 0);
    return '<svg class="fig-svg" viewBox="0 0 320 ' + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(spec.cap || "図") + '">' +
      body + (spec.cap ? text(160, h - 8, spec.cap, 14, INK) : "") + '</svg>';
  };

  // 問題 → 図（js/figure-map.js の window.FIGURE_MAP。キーは問題文の空白をぬいたもの。同じ文が ほかに ある 問題は「問題文‖正解」）
  function key(s) { return String(s || "").replace(/\s+/g, ""); }
  window.figuresFor = function (q) {
    if (!q || !window.FIGURE_MAP) return null;
    if (!window._figIndex) {
      window._figIndex = {};
      Object.keys(window.FIGURE_MAP).forEach(function (k) { window._figIndex[key(k)] = window.FIGURE_MAP[k]; });
    }
    // 同じ 問題文で 答えが ちがう 問題は「問題文‖正解」で 登録して ある（tools/figures/build-figure-map.js）
    var ans = q.a && q.a.length ? q.a[q.c] : (q.correct_answers || [])[0];
    return window._figIndex[key(q.q) + "‖" + key(ans)] || window._figIndex[key(q.q)] || null;
  };
  // 問題画面・解説に図を入れる（index.html から呼ぶ）
  window.appendFigure = function (container, spec, where) {
    var svg = window.renderFigure(spec);
    if (!svg || !container) return false;
    var box = document.createElement("div");
    box.className = "fig-box" + (where === "explain" ? " fig-explain" : "");
    box.innerHTML = (where === "explain" ? '<div class="fig-tag">🖼️ 図で たしかめよう</div>' : "") + svg;
    container.appendChild(box);
    return true;
  };
})();
