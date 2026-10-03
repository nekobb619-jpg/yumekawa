/* =====================================================================
   figures-kokugo.js — 国語の 学習用イラスト（js/figures.js に 種類を足す）
   ★2026-10-03追加：読む力を「図で 見える」ように する。
   - kosoado … 自分・相手・遠くの 位置と これ／それ／あれ（ここ／そこ／あそこ）
   - kotable … こそあど言葉の 表
   - refer   … 指示語（かれ・それ）から、さして いる 言葉への 矢印
   - logic   … 3つの 論理：因果（だから・なぜなら）／イコール（つまり・たとえば）／対立（しかし・一方）
   - kakari  … 主語・述語・修飾語の かかり方
   - yama    … お話の 山（はじめ → 出来事 → ヤマ場 → おわり）
   - six     … 作品読解6の 6つの 見方
   - henka   … 主人公の 変化（最初 → きっかけ → 最後）
   - conj    … つなぎ言葉の 種類
   ===================================================================== */
(function () {
  "use strict";
  var T = window.FIGURE_TYPES; if (!T) return;
  var INK = "#6b21a8", MARK = "#db2777", SUB = "#7a6985", DARK = "#334155";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function t(x, y, s, size, color, anchor, halo) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" font-weight="900" fill="' + (color || INK) + '" text-anchor="' + (anchor || "middle") + '"' +
      (halo ? ' stroke="#fff" stroke-width="3" paint-order="stroke"' : "") + ' font-family="\'Zen Maru Gothic\',sans-serif">' + esc(s) + '</text>';
  }
  function box(x, y, w, h, fill, stroke, sw, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx === undefined ? 10 : rx) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (sw || 2) + '"/>'; }
  function arrowHead(x, y, ang, c, size) {
    var k = size || 8, a1 = ang + 2.6, a2 = ang - 2.6;
    return '<path d="M' + (x + Math.cos(a1) * k).toFixed(1) + ' ' + (y + Math.sin(a1) * k).toFixed(1) + ' L' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + (x + Math.cos(a2) * k).toFixed(1) + ' ' + (y + Math.sin(a2) * k).toFixed(1) + '" stroke="' + (c || MARK) + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/>';
  }
  // 文字の 幅（全角＝1、半角＝0.55、空白＝0.4）で 折り返す
  function cw(ch) { return ch === " " ? 0.4 : (/[\x21-\x7e]/.test(ch) ? 0.55 : 1); }
  // 空白（文節の 区切り）で 折り返す。1つの かたまりが 長すぎる ときだけ 文字の 途中で 切る
  function wrap(s, per) {
    var out = [], cur = "", w = 0;
    function width(x) { var n = 0; x.split("").forEach(function (ch) { n += cw(ch); }); return n; }
    String(s).split(" ").forEach(function (tok) {
      var tw = width(tok), sep = cur ? 0.4 : 0;
      if (cur && w + sep + tw > per) { out.push(cur); cur = ""; w = 0; sep = 0; }
      if (tw > per) { tok.split("").forEach(function (ch) { var c = cw(ch); if (w + c > per && cur) { out.push(cur); cur = ""; w = 0; } cur += ch; w += c; }); return; }
      cur += (cur ? " " : "") + tok; w += sep + tw;
    });
    if (cur) out.push(cur);
    return out;
  }
  function lines(arr, x, y, size, color, anchor, gap) { return arr.map(function (l, i) { return t(x, y + i * (gap || size + 4), l, size, color, anchor); }).join(""); }

  /* ---------------- こそあど：位置の 図 ---------------- */
  function person(cx, col, label) {
    return '<path d="M' + (cx - 15) + ' 118 Q' + (cx - 15) + ' 80 ' + cx + ' 80 Q' + (cx + 15) + ' 80 ' + (cx + 15) + ' 118z" fill="' + col + '"/>' +
      '<circle cx="' + cx + '" cy="64" r="15" fill="#fff7ed" stroke="' + col + '" stroke-width="3"/>' +
      '<circle cx="' + (cx - 5) + '" cy="63" r="2" fill="' + DARK + '"/><circle cx="' + (cx + 5) + '" cy="63" r="2" fill="' + DARK + '"/>' +
      '<path d="M' + (cx - 4) + ' 69 Q' + cx + ' 72 ' + (cx + 4) + ' 69" stroke="' + DARK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      t(cx, 142, label, 10, SUB);
  }
  function book(x, y, on) { return '<rect x="' + x + '" y="' + y + '" width="20" height="15" rx="2" fill="' + (on ? "#fbcfe8" : "#ddd6fe") + '" stroke="' + (on ? MARK : INK) + '" stroke-width="2"/><path d="M' + (x + 10) + ' ' + y + ' V' + (y + 15) + '" stroke="' + (on ? MARK : INK) + '" stroke-width="1.5"/>'; }
  function kosoado(s) {
    var hl = s.hl || "", basho = s.mode === "basho", names = s.names || ["自分（話す人）", "相手（聞く人）"], out = "";
    var W = basho ? { "こ": "ここ", "そ": "そこ", "あ": "あそこ" } : { "こ": "これ", "そ": "それ", "あ": "あれ" };
    var ring = s.ring || (s.noLabels ? "" : hl);
    out += '<path d="M6 120 H314" stroke="#d6d3d1" stroke-width="2"/>';
    out += person(52, "#f9a8d4", names[0]) + person(192, "#93c5fd", names[1]);
    // 遠くの 木
    out += '<path d="M292 18 L278 50 H306z" fill="' + (ring === "あ" ? "#f9a8d4" : "#86efac") + '" stroke="' + (ring === "あ" ? MARK : "#15803d") + '" stroke-width="2"/><rect x="289" y="50" width="6" height="10" fill="#a16207"/>';
    out += t(292, 76, "遠く", 9, SUB);
    if (basho) {
      out += '<ellipse cx="52" cy="122" rx="38" ry="9" fill="' + (ring === "こ" ? "#fbcfe8" : "none") + '" stroke="' + (ring === "こ" ? MARK : "#c4b5fd") + '" stroke-width="2" stroke-dasharray="5 3" opacity=".9"/>';
      out += '<ellipse cx="192" cy="122" rx="38" ry="9" fill="' + (ring === "そ" ? "#fbcfe8" : "none") + '" stroke="' + (ring === "そ" ? MARK : "#c4b5fd") + '" stroke-width="2" stroke-dasharray="5 3"/>';
      if (ring === "あ") out += '<ellipse cx="292" cy="44" rx="24" ry="28" fill="none" stroke="' + MARK + '" stroke-width="2" stroke-dasharray="5 3"/>';
    } else {
      out += book(84, 103, ring === "こ") + book(224, 103, ring === "そ");
    }
    if (!s.noLabels) {
      var pos = basho ? { "こ": [100, 112], "そ": [240, 112], "あ": [240, 30] } : { "こ": [94, 96], "そ": [234, 96], "あ": [254, 40] };
      Object.keys(pos).forEach(function (k) { var on = hl === k; out += t(pos[k][0], pos[k][1], W[k], on ? 17 : 13, on ? MARK : INK, "middle", true); });
    }
    if (s.say || hl === "ど") {
      var say = s.say || (basho ? "どこ？" : "どれ？"), bw = say.length * 13 + 18;
      out += box(70, 14, bw, 26, "#fff", hl === "ど" ? MARK : "#c4b5fd", 2, 12) + '<path d="M78 40 L66 50 L90 40z" fill="#fff" stroke="' + (hl === "ど" ? MARK : "#c4b5fd") + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M80 39 H90" stroke="#fff" stroke-width="3"/>' + t(70 + bw / 2, 32, say, 13, hl === "ど" ? MARK : INK);
    }
    // 自分から さして いる もの への 点線
    if (s.point) {
      var to = { "こ": [94, 108], "そ": [228, 104], "あ": [284, 38] }[s.point];
      if (to) out += '<path d="M66 88 L' + (to[0] - 6) + ' ' + to[1] + '" stroke="' + MARK + '" stroke-width="1.8" stroke-dasharray="4 3" fill="none"/>';
    }
    return out;
  }

  /* ---------------- こそあど言葉の 表 ---------------- */
  function kotable(s) {
    var rows = [["こ", "近い"], ["そ", "相手"], ["あ", "遠い"], ["ど", "たずねる"]];
    var cols = [["もの", ["これ", "それ", "あれ", "どれ"]], ["場所", ["ここ", "そこ", "あそこ", "どこ"]], ["方向", ["こちら", "そちら", "あちら", "どちら"]], ["さす", ["この", "その", "あの", "どの"]], ["ようす", ["こう", "そう", "ああ", "どう"]]];
    var x0 = 8, hw = 62, cwid = 50, y0 = 8, rh = 25, out = "";
    cols.forEach(function (c, j) { var x = x0 + hw + j * cwid, on = s.col === c[0]; out += box(x + 1, y0, cwid - 2, rh - 3, on ? "#fdf2f8" : "#f5f3ff", on ? MARK : "#e9d5ff", 1.5, 6) + t(x + cwid / 2, y0 + 16, c[0], 11, on ? MARK : INK); });
    rows.forEach(function (r, i) {
      var y = y0 + rh * (i + 1), onRow = s.row === r[0];
      out += box(x0, y, hw - 4, rh - 3, onRow ? "#fdf2f8" : "#faf5ff", onRow ? MARK : "#e9d5ff", 1.5, 6) + t(x0 + 14, y + 16, r[0], 14, onRow ? MARK : INK) + t(x0 + 40, y + 15, r[1], 9, SUB);
      cols.forEach(function (c, j) {
        var x = x0 + hw + j * cwid, on = (onRow && (!s.col || s.col === c[0])) || (!s.row && s.col === c[0]);
        out += box(x + 1, y, cwid - 2, rh - 3, on ? "#fbcfe8" : "#fff", on ? MARK : "#e9d5ff", on ? 2 : 1, 6) + t(x + cwid / 2, y + 16, c[1][i], 12, on ? MARK : DARK);
      });
    });
    return out;
  }

  /* ---------------- 指示語 → さして いる 言葉 ---------------- */
  // lines の 中の [ ] が さして いる 言葉、{ } が 指示語
  function refer(s) {
    var fs = 15, out = "", spans = { ref: null, pro: null }, texts = "";
    (s.lines || []).forEach(function (line, li) {
      var x = 14, y = 34 + li * 34, mode = "", run = "", runX = x;
      function flush() { if (run) { texts += t(runX, y, run, fs, mode === "pro" ? MARK : mode === "ref" ? "#92400e" : DARK, "start"); } run = ""; runX = x; }
      line.split("").forEach(function (ch) {
        if (ch === "[" || ch === "{") { flush(); mode = ch === "[" ? "ref" : "pro"; spans[mode] = { x1: x, y: y }; return; }
        if (ch === "]" || ch === "}") { flush(); spans[mode].x2 = x; mode = ""; return; }
        if (ch === " ") { flush(); x += fs * 0.4; runX = x; return; }
        run += ch; x += fs * cw(ch);
      });
      flush();
    });
    var r = spans.ref, p = spans.pro;
    if (r) out += '<rect x="' + (r.x1 - 3) + '" y="' + (r.y - fs - 1) + '" width="' + (r.x2 - r.x1 + 6) + '" height="' + (fs + 8) + '" rx="5" fill="#fde68a"/>';
    if (p) out += '<rect x="' + (p.x1 - 3) + '" y="' + (p.y - fs - 1) + '" width="' + (p.x2 - p.x1 + 6) + '" height="' + (fs + 8) + '" rx="5" fill="#fdf2f8" stroke="' + MARK + '" stroke-width="2"/>';
    out += texts;
    if (r && p) {
      var px = (p.x1 + p.x2) / 2, rx = (r.x1 + r.x2) / 2, d;
      if (p.y === r.y) { var top = r.y - fs - 14; d = 'M' + px + ' ' + (p.y - fs - 2) + ' C' + px + ' ' + top + ' ' + rx + ' ' + top + ' ' + rx + ' ' + (r.y - fs - 3); out += '<path d="' + d + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>' + arrowHead(rx, r.y - fs - 3, Math.PI / 2); }
      else { var midY = (p.y - fs + r.y + 7) / 2; d = 'M' + px + ' ' + (p.y - fs - 2) + ' C' + px + ' ' + midY + ' ' + rx + ' ' + midY + ' ' + rx + ' ' + (r.y + 8); out += '<path d="' + d + '" fill="none" stroke="' + MARK + '" stroke-width="2.4"/>' + arrowHead(rx, r.y + 8, -Math.PI / 2); }
    }
    var ny = 34 + (s.lines || []).length * 34 + 4;
    out += '<rect x="14" y="' + (ny - 11) + '" width="14" height="12" rx="3" fill="#fdf2f8" stroke="' + MARK + '" stroke-width="1.6"/>' + t(32, ny, "指示語", 10, MARK, "start");
    out += '<rect x="90" y="' + (ny - 11) + '" width="14" height="12" rx="3" fill="#fde68a"/>' + t(108, ny, s.refLabel || "さして いる 言葉", 10, "#92400e", "start");
    return out;
  }

  /* ---------------- 3つの 論理 ---------------- */
  var LOGIC = {
    inga: { la: "原因", lb: "結果", word: "だから", sym: "down", ca: "#fef3c7", cb: "#dcfce7" },
    naze: { la: "言いたい こと", lb: "理由", word: "なぜなら", sym: "down", ca: "#dcfce7", cb: "#fef3c7" },
    tsumari: { la: "くわしく", lb: "まとめ", word: "つまり", sym: "eq", ca: "#e0f2fe", cb: "#fce7f3" },
    tatoeba: { la: "まとめ", lb: "具体例", word: "たとえば", sym: "eq", ca: "#fce7f3", cb: "#e0f2fe" },
    tairitsu: { la: "A", lb: "B", word: "しかし", sym: "vs", ca: "#e0f2fe", cb: "#fce7f3" }
  };
  function logic(s) {
    var L = LOGIC[s.k] || LOGIC.inga, la = s.la || L.la, lb = s.lb || L.lb, word = s.word || L.word, out = "";
    if (L.sym === "vs") {
      var A = wrap(s.a, 9), B = wrap(s.b, 9), hh = Math.max(A.length, B.length) * 17 + 18, y = 50;
      out += box(10, y, 124, hh, L.ca, "#7dd3fc", 2) + box(186, y, 124, hh, L.cb, "#f9a8d4", 2);
      out += t(72, y - 6, la, 11, "#0369a1") + t(248, y - 6, lb, 11, "#be185d");
      out += lines(A, 72, y + 22, 12.5, DARK, "middle", 17) + lines(B, 248, y + 22, 12.5, DARK, "middle", 17);
      var cy = y + hh / 2;
      out += '<path d="M142 ' + cy + ' H178" stroke="' + MARK + '" stroke-width="3"/>' + arrowHead(142, cy, Math.PI) + arrowHead(178, cy, 0);
      out += box(160 - (word.length * 7 + 10), 6, word.length * 14 + 20, 24, "#fff", MARK, 2, 12) + t(160, 23, word, 13, MARK);
      out += t(160, cy + 22, "反対", 10, SUB);
      return out;
    }
    var per = 16.5, A2 = wrap(s.a, per), B2 = wrap(s.b, per), ha = A2.length * 17 + 14, hb = B2.length * 17 + 14, gap = 34;
    var total = ha + gap + hb, y0 = Math.max(4, (146 - total) / 2), yb = y0 + ha + gap;
    function card(y, h, col, tag, ls, faded) {
      var o = box(14, y, 292, h, faded ? "#f5f5f4" : col, faded ? "#a8a29e" : "#c4b5fd", 2, 10);
      o += box(20, y + h / 2 - 10, 62, 20, "#fff", faded ? "#a8a29e" : INK, 1.5, 10) + t(51, y + h / 2 + 4, tag, tag.length > 4 ? 9 : 10.5, faded ? SUB : INK);
      o += lines(ls, 92, y + 20, 12.5, faded ? SUB : DARK, "start", 17);
      if (faded) o += '<rect x="14" y="' + y + '" width="292" height="' + h + '" rx="10" fill="none" stroke="#a8a29e" stroke-width="2" stroke-dasharray="6 4"/>';
      return o;
    }
    out += card(y0, ha, L.ca, la, A2) + card(yb, hb, L.cb, lb, B2, s.broken);
    var my = y0 + ha + gap / 2;
    if (L.sym === "eq") {
      out += '<path d="M146 ' + (my - 4) + ' H174 M146 ' + (my + 4) + ' H174" stroke="' + MARK + '" stroke-width="3"/>';
    } else {
      out += '<path d="M160 ' + (y0 + ha + 2) + ' V' + (yb - 3) + '" stroke="' + (s.broken ? "#a8a29e" : MARK) + '" stroke-width="3"/>' + arrowHead(160, yb - 3, Math.PI / 2, s.broken ? "#a8a29e" : MARK);
    }
    out += t(188, my + 5, word, 13, s.broken ? SUB : MARK, "start");
    if (s.broken) out += t(144, my + 7, "✖", 20, "#dc2626", "end") + t(196 + word.length * 13, my + 5, "つながらない", 10, "#dc2626", "start");
    return out;
  }

  /* ---------------- 主語・述語・修飾語の かかり方 ---------------- */
  var ROLE = { s: ["#bfdbfe", "#2563eb", "主語"], p: ["#fbcfe8", "#db2777", "述語"], m: ["#fef08a", "#ca8a04", "修飾語"] };
  function kakari(s) {
    var ws = s.words || [], fs = 13, pad = 12, gap = 9, out = "";
    var widths = ws.map(function (w) { return w.w.length * fs + pad; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (ws.length - 1);
    if (total > 304) { var k = 304 / total; fs = Math.floor(fs * k * 10) / 10; widths = widths.map(function (w) { return w * k; }); gap *= k; total = 304; }
    var x = 160 - total / 2, Y = 46, H = 28, cx = [];
    ws.forEach(function (w, i) {
      var r = ROLE[w.r] || ROLE.m, on = s.hl === i || (s.hlRole && s.hlRole === w.r);
      out += box(x, Y, widths[i], H, r[0], on ? MARK : r[1], on ? 3.2 : 1.6, 8) + t(x + widths[i] / 2, Y + 19, w.w, fs, DARK);
      cx.push(x + widths[i] / 2); x += widths[i] + gap;
    });
    // 主語 → 述語（上の 点線）
    var si = -1, pi = -1; ws.forEach(function (w, i) { if (w.r === "s") si = i; if (w.r === "p") pi = i; });
    if (si >= 0 && pi >= 0) {
      out += '<path d="M' + cx[si] + ' ' + (Y - 2) + ' Q' + ((cx[si] + cx[pi]) / 2) + ' ' + (Y - 40) + ' ' + cx[pi] + ' ' + (Y - 4) + '" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 3"/>' + arrowHead(cx[pi], Y - 4, Math.PI / 2 + 0.5, "#2563eb");
      out += t((cx[si] + cx[pi]) / 2, Y - 22, "だれが → どうする", 10, "#2563eb", "middle", true);
    }
    // 修飾語 → くわしく する 言葉（下の 矢印）
    var spans = []; ws.forEach(function (w, i) { if (typeof w.to === "number") spans.push(w.to - i); });
    var uniq = spans.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    ws.forEach(function (w, i) {
      if (typeof w.to !== "number") return;
      var depth = Math.min(2, uniq.indexOf(w.to - i)), on = s.hl === i, col = on ? MARK : "#ca8a04";
      var x1 = cx[i] + 5, x2 = cx[w.to] - 5 - depth * 4, base = Y + H + 2, ctrl = base + 26 + depth * 18;
      out += '<path d="M' + x1 + ' ' + base + ' C' + x1 + ' ' + ctrl + ' ' + x2 + ' ' + ctrl + ' ' + x2 + ' ' + (base + 2) + '" fill="none" stroke="' + col + '" stroke-width="' + (on ? 3 : 2) + '"/>' + arrowHead(x2, base + 2, -Math.PI / 2, col, 7);
      if (on && s.why) out += t((x1 + x2) / 2, ctrl - 4, s.why, 10, MARK, "middle", true);
    });
    // 色の 見本
    var lx = 70;
    ["s", "p", "m"].forEach(function (k) { out += box(lx, 136, 14, 11, ROLE[k][0], ROLE[k][1], 1.4, 3) + t(lx + 18, 146, ROLE[k][2], 10, DARK, "start"); lx += k === "m" ? 0 : 64; });
    return out;
  }

  /* ---------------- お話の 山 ---------------- */
  function yama(s) {
    var P = [[24, 112], [112, 86], [214, 50], [298, 90]], tags = ["はじめ", "出来事", "ヤマ場", "おわり"], pts = s.points || [], out = "";
    out += '<path d="M10 122 L24 112 Q70 102 112 86 Q170 62 214 50 Q262 60 298 90 L312 98" fill="none" stroke="#c4b5fd" stroke-width="5" stroke-linecap="round"/>';
    P.forEach(function (p, i) {
      var on = s.hl === i, peak = i === 2;
      out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (on ? 8 : 6) + '" fill="' + (on ? MARK : "#fff") + '" stroke="' + (on ? MARK : INK) + '" stroke-width="2.4"/>';
      var anchor = i === 0 ? "start" : i === 3 ? "end" : "middle", tx = i === 0 ? 8 : i === 3 ? 314 : p[0];
      var ty = peak ? p[1] - 14 : p[1] + 19;
      out += t(tx, ty, tags[i], 10, on ? MARK : SUB, anchor, true);
      if (pts[i]) {
        var ls = wrap(pts[i], peak ? 12 : 8), y0 = peak ? ty - 14 - (ls.length - 1) * 13 : ty + 14;
        out += lines(ls, tx, y0, 11, on ? MARK : DARK, anchor, 13).replace(/<text /g, '<text stroke="#fff" stroke-width="3" paint-order="stroke" ');
      }
    });
    return out;
  }

  /* ---------------- 作品読解6 ---------------- */
  var SIX = [["人物", "だれが 出てくる？"], ["事件", "どんな 出来事？"], ["変化", "最初 → 最後"], ["カギ", "大事な モノ・言葉"], ["価値", "伝えたい こと"], ["問い", "自分の ぎもん"]];
  function six(s) {
    var out = "";
    SIX.forEach(function (c, i) {
      var x = 8 + (i % 3) * 104, y = 8 + Math.floor(i / 3) * 70, on = s.hl === c[0];
      out += box(x, y, 96, 62, on ? "#fdf2f8" : "#faf5ff", on ? MARK : "#d8b4fe", on ? 3 : 2, 12);
      out += t(x + 14, y + 20, String(i + 1), 11, on ? MARK : SUB) + t(x + 52, y + 28, c[0], 18, on ? MARK : INK) + t(x + 48, y + 50, c[1], 9.5, DARK);
    });
    return out;
  }

  /* ---------------- 主人公の 変化 ---------------- */
  function henka(s) {
    var A = wrap(s.a, 7), B = wrap(s.b, 7), M = wrap(s.mid || "", 5), out = "";
    var h = Math.max(A.length, B.length) * 18 + 22, y = 34 + Math.max(0, (96 - h) / 2), cy = y + h / 2;
    out += t(64, y - 10, s.la || "最初", 12, SUB) + t(256, y - 10, s.lb || "最後", 12, MARK);
    out += box(8, y, 112, h, "#f5f3ff", "#c4b5fd", 2, 12) + box(200, y, 112, h, "#fdf2f8", MARK, 2.6, 12);
    out += lines(A, 64, cy - (A.length - 1) * 9 + 5, 13, DARK, "middle", 18) + lines(B, 256, cy - (B.length - 1) * 9 + 5, 13, MARK, "middle", 18);
    out += '<path d="M124 ' + cy + ' H194" stroke="' + MARK + '" stroke-width="3"/>' + arrowHead(194, cy, 0);
    if (M.length) out += lines(M, 159, cy - 8 - (M.length - 1) * 13, 10.5, INK, "middle", 13) + t(159, cy + 18, s.lm || "きっかけ", 9, SUB);
    return out;
  }

  /* ---------------- つなぎ言葉の 種類 ---------------- */
  var CONJ = [["順接", "だから・そのため", "→", "前が 理由、あとが 結果"], ["逆接", "しかし・けれど・でも", "↩", "前と 反対の ことが くる"], ["説明", "なぜなら", "←", "あとに 理由が くる"], ["言いかえ", "つまり", "＝", "まとめて 言いかえる"], ["例示", "たとえば", "＝", "れいを あげる"], ["転換", "ところで・さて", "↪", "話題を かえる"]];
  function conj(s) {
    var out = "";
    CONJ.forEach(function (c, i) {
      var y = 4 + i * 24, on = s.hl === c[0];
      out += box(4, y, 312, 21, on ? "#fdf2f8" : (i % 2 ? "#fff" : "#faf5ff"), on ? MARK : "#ede9fe", on ? 2.4 : 1, 8);
      out += t(36, y + 15, c[0], 11, on ? MARK : INK) + t(66, y + 15, c[1], 11, on ? MARK : DARK, "start") + t(188, y + 16, c[2], 14, on ? MARK : SUB) + t(200, y + 15, c[3], 9.5, on ? MARK : SUB, "start");
    });
    return out;
  }

  T.kosoado = kosoado; T.kotable = kotable; T.refer = refer; T.logic = logic; T.kakari = kakari; T.yama = yama; T.six = six; T.henka = henka; T.conj = conj;
})();
