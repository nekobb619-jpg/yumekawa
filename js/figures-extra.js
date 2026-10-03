/* =====================================================================
   figures-extra.js — 追加の 図（js/figures.js に 種類を足す）
   ★2026-10-03追加（ポータルの「足りないもの」から）：
   - steps     … 計算の 順じょ：式を 1行ずつ 進め、次に 計算する ところを 色で しめす
   - distrib   … 計算の きまり：(a＋b)×c ＝ a×c＋b×c を 長方形の 面積で
   - kanjicard … 漢字 1字の カード（音・訓・熟語）
   - kanjicmp  … 同じ 読みの 言葉を ならべて くらべる（機械／機会 など）
   ===================================================================== */
(function () {
  "use strict";
  var T = window.FIGURE_TYPES; if (!T) return;
  var INK = "#6b21a8", MARK = "#db2777", SUB = "#7a6985", DARK = "#334155";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function t(x, y, s, size, color, anchor, family) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" font-weight="900" fill="' + (color || INK) + '" text-anchor="' + (anchor || "middle") + '" font-family="' + (family || "'Zen Maru Gothic',sans-serif") + '">' + esc(s) + '</text>';
  }

  /* ---------------- 計算の 順じょ ---------------- */
  // lines: ["12 ＋ [8 × 5]", "[12 ＋ 40]", "52"]  [ ] ＝ 次に 計算する ところ。notes: 行の 右に 出す 一言
  function steps(s) {
    var lines = s.lines || [], n = lines.length, gap = Math.min(40, 132 / Math.max(1, n)), y0 = 26 + (132 - gap * n) / 2, out = "";
    lines.forEach(function (ln, i) {
      var y = y0 + i * gap, parts = String(ln).split(/(\[[^\]]*\])/).filter(Boolean), last = i === n - 1;
      var spans = parts.map(function (p) {
        if (p.charAt(0) === "[") return '<tspan fill="' + MARK + '" text-decoration="underline">' + esc(p.slice(1, -1)) + '</tspan>';
        return '<tspan fill="' + (last ? MARK : DARK) + '">' + esc(p) + '</tspan>';
      }).join("");
      out += '<text x="' + (s.notes ? 132 : 160) + '" y="' + y + '" font-size="' + (last ? 22 : 19) + '" font-weight="900" text-anchor="middle" font-family="\'Zen Maru Gothic\',sans-serif" xml:space="preserve">' + (i && !s.noEq ? '<tspan fill="' + SUB + '">＝ </tspan>' : "") + spans + '</text>';
      if (s.notes && s.notes[i]) out += t(236, y - 2, s.notes[i], 10.5, INK, "start");
      if (!last) out += t(s.notes ? 30 : 40, y, "①②③④".charAt(i), 15, MARK);
    });
    return out;
  }

  /* ---------------- (a＋b)×c ＝ a×c＋b×c ---------------- */
  function distrib(s) {
    var a = s.a, b = s.b, c = s.c, W = 240, x0 = 40, y0 = 34, h = 70, wa = Math.max(50, Math.min(W - 50, W * a / (a + b))), out = "";
    out += '<rect x="' + x0 + '" y="' + y0 + '" width="' + wa + '" height="' + h + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
    out += '<rect x="' + (x0 + wa) + '" y="' + y0 + '" width="' + (W - wa) + '" height="' + h + '" fill="#fce7f3" stroke="' + MARK + '" stroke-width="2"/>';
    out += t(x0 + wa / 2, y0 - 8, a, 14, "#1d4ed8") + t(x0 + wa + (W - wa) / 2, y0 - 8, b, 14, MARK) + t(x0 - 12, y0 + h / 2 + 5, c, 14, DARK);
    out += t(x0 + wa / 2, y0 + h / 2 + 5, a + "×" + c, 14, "#1d4ed8") + t(x0 + wa + (W - wa) / 2, y0 + h / 2 + 5, b + "×" + c, 13, MARK);
    out += t(160, y0 + h + 24, "(" + a + "＋" + b + ")×" + c + " ＝ " + a + "×" + c + " ＋ " + b + "×" + c + " ＝ " + ((a + b) * c), 13, INK);
    out += t(160, y0 + h + 42, "合わせた 長方形 ＝ 2つの 長方形の 合計", 10, SUB);
    return out;
  }

  /* ---------------- 漢字カード ---------------- */
  function kanjicard(s) {
    var out = '<rect x="14" y="12" width="110" height="110" rx="14" fill="#fff" stroke="' + MARK + '" stroke-width="3"/><path d="M69 12 V122 M14 67 H124" stroke="#fbcfe8" stroke-dasharray="4 4"/>';
    out += t(69, 100, s.k, 84, DARK, "middle", "'Klee One','Zen Maru Gothic',serif");
    var y = 30;
    if (s.on) { out += t(140, y, "音", 11, "#fff", "start").replace('fill="#fff"', 'fill="' + INK + '"') + t(162, y, s.on, 15, INK, "start"); y += 26; }
    if (s.kun) { out += t(140, y, "訓", 11, MARK, "start") + t(162, y, s.kun, s.kun.length > 8 ? 11 : 15, MARK, "start"); y += 26; }
    (s.words || []).slice(0, 3).forEach(function (w) { out += t(140, y, "・" + w, 13, DARK, "start"); y += 20; });
    if (s.note) out += t(160, 144, s.note, 11, SUB);
    return out;
  }

  /* ---------------- 同じ 読みの 言葉を くらべる ---------------- */
  // items: [{ w: "機械", m: "動く しくみの ある 道具", ex: "工場の 機械" }, …]（2〜3こ）、yomi: 読み、hl: 正しい ほう
  function kanjicmp(s) {
    var items = s.items || [], n = items.length, w = (320 - 16 - (n - 1) * 8) / n, out = "";
    if (s.yomi) out += t(160, 18, "「" + s.yomi + "」", 14, INK);
    items.forEach(function (it, i) {
      var x = 8 + i * (w + 8), on = s.hl === it.w;
      out += '<rect x="' + x + '" y="28" width="' + w + '" height="112" rx="12" fill="' + (on ? "#fdf2f8" : "#faf5ff") + '" stroke="' + (on ? MARK : "#d8b4fe") + '" stroke-width="' + (on ? 3 : 2) + '"/>';
      out += t(x + w / 2, 68, it.w, it.w.length > 2 ? 24 : 30, on ? MARK : DARK, "middle", "'Klee One','Zen Maru Gothic',serif");
      out += t(x + w / 2, 94, it.m, it.m.length > 9 ? 9.5 : 11, INK);
      if (it.ex) out += t(x + w / 2, 118, "例：" + it.ex, it.ex.length > 9 ? 9 : 10, SUB);
    });
    return out;
  }

  T.steps = steps; T.distrib = distrib; T.kanjicard = kanjicard; T.kanjicmp = kanjicmp;
})();
