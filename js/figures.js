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

  var TYPES = { shape: shape, lines: lines, angle: angle };
  function draw(spec) { var fn = TYPES[spec && spec.t]; return fn ? fn(spec) : ""; }

  window.FIGURE_TYPES = TYPES;
  window.renderFigure = function (spec) {
    if (!spec) return "";
    if (spec.t === "row") return rowHtml(spec);
    var body = draw(spec);
    if (!body) return "";
    var h = 150 + (spec.cap ? 24 : 0);
    return '<svg class="fig-svg" viewBox="0 0 320 ' + h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(spec.cap || "図") + '">' +
      body + (spec.cap ? text(160, h - 8, spec.cap, 14, INK) : "") + '</svg>';
  };

  // 問題 → 図（js/figure-map.js の window.FIGURE_MAP。キーは問題文の空白をぬいたもの）
  function key(s) { return String(s || "").replace(/\s+/g, ""); }
  window.figuresFor = function (q) {
    if (!q || !window.FIGURE_MAP) return null;
    if (!window._figIndex) {
      window._figIndex = {};
      Object.keys(window.FIGURE_MAP).forEach(function (k) { window._figIndex[key(k)] = window.FIGURE_MAP[k]; });
    }
    return window._figIndex[key(q.q)] || null;
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
