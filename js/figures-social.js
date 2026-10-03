/* =====================================================================
   figures-social.js — 社会の 学習用イラスト（js/figures.js に 種類を足す）
   ★2026-10-02追加：地図記号（国土地理院の記号の形に合わせる。自信の持てない記号は描かない）、
   地図の方位、流れ図（水の めぐり・浄水場・ごみ）、3R、内陸県、110番・119番、自助・共助・公助
   ===================================================================== */
(function () {
  "use strict";
  var T = window.FIGURE_TYPES; if (!T) return;
  var INK = "#6b21a8", MARK = "#db2777", SUB = "#7a6985", DARK = "#334155";

  function t(x, y, s, size, color, anchor, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" font-weight="900" fill="' + (color || INK) + '" text-anchor="' + (anchor || "middle") + '" font-family="' + (extra || "'Zen Maru Gothic',sans-serif") + '">' + String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</text>';
  }
  function L(x1, y1, x2, y2, c, w) { return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + (c || DARK) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round" fill="none"/>'; }
  function arrowHead(x, y, ang, c) {
    var a1 = ang + 2.6, a2 = ang - 2.6;
    return '<path d="M' + (x + Math.cos(a1) * 8) + ' ' + (y + Math.sin(a1) * 8) + ' L' + x + ' ' + y + ' L' + (x + Math.cos(a2) * 8) + ' ' + (y + Math.sin(a2) * 8) + '" stroke="' + (c || MARK) + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/>';
  }
  function arrow(x1, y1, x2, y2, c) { return L(x1, y1, x2, y2, c || MARK, 2.4) + arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), c); }

  /* ---------------- 地図記号 ---------------- */
  var SYM = {
    school: { name: "学校（小・中）", draw: function (x, y) { return t(x, y + 14, "文", 40, DARK, "middle", "serif"); } },
    koban: { name: "交番", draw: function (x, y) { return L(x - 16, y - 16, x + 16, y + 16) + L(x + 16, y - 16, x - 16, y + 16); } },
    police: { name: "警察署", draw: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="22" fill="none" stroke="' + DARK + '" stroke-width="3"/>' + L(x - 11, y - 11, x + 11, y + 11) + L(x + 11, y - 11, x - 11, y + 11); } },
    post: { name: "郵便局", draw: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="22" fill="none" stroke="' + DARK + '" stroke-width="3"/>' + L(x - 11, y - 10, x + 11, y - 10) + L(x - 11, y - 3, x + 11, y - 3) + L(x, y - 3, x, y + 13); } },
    fire: { name: "消防署", draw: function (x, y) { return L(x, y - 2, x, y + 20) + '<path d="M' + (x - 16) + ' ' + (y - 20) + ' Q' + (x - 14) + ' ' + (y - 2) + ' ' + x + ' ' + (y - 2) + ' Q' + (x + 14) + ' ' + (y - 2) + ' ' + (x + 16) + ' ' + (y - 20) + '" fill="none" stroke="' + DARK + '" stroke-width="3" stroke-linecap="round"/>'; } },
    cityhall: { name: "市役所", draw: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="22" fill="none" stroke="' + DARK + '" stroke-width="3"/><circle cx="' + x + '" cy="' + y + '" r="11" fill="none" stroke="' + DARK + '" stroke-width="3"/>'; } },
    rice: { name: "田", draw: function (x, y) { var o = ""; [[-12, -10], [12, -10], [0, 12]].forEach(function (d) { o += L(x + d[0] - 3, y + d[1] - 7, x + d[0] - 3, y + d[1] + 7, DARK, 2.6) + L(x + d[0] + 3, y + d[1] - 7, x + d[0] + 3, y + d[1] + 7, DARK, 2.6); }); return o; } },
    // ★2026-10-03追加：高等学校（文を ⭕で かこむ）・工場（歯車）・JR線（白と 黒が こうご）
    highschool: { name: "高等学校", draw: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="23" fill="none" stroke="' + DARK + '" stroke-width="3"/>' + t(x, y + 10, "文", 28, DARK, "middle", "serif"); } },
    factory: { name: "工場", draw: function (x, y) {
      var p = [], n = 8;
      for (var i = 0; i < n * 4; i++) { var a = (i / (n * 4)) * Math.PI * 2 - Math.PI / 2, r = (i % 4 < 2) ? 22 : 16; p.push((x + Math.cos(a) * r).toFixed(1) + " " + (y + Math.sin(a) * r).toFixed(1)); }
      return '<path d="M' + p.join(" L") + 'z" fill="none" stroke="' + DARK + '" stroke-width="3" stroke-linejoin="round"/><circle cx="' + x + '" cy="' + y + '" r="6" fill="none" stroke="' + DARK + '" stroke-width="3"/>';
    } },
    jr: { name: "JR線", draw: function (x, y) {
      var o = '<rect x="' + (x - 32) + '" y="' + (y - 5) + '" width="64" height="10" fill="#fff" stroke="' + DARK + '" stroke-width="2"/>';
      for (var i = 0; i < 4; i++) o += '<rect x="' + (x - 32 + i * 16) + '" y="' + (y - 5) + '" width="8" height="10" fill="' + DARK + '"/>';
      return o;
    } }
  };
  function mapsym(s) {
    var items = s.items, n = items.length, w = 320 / n, out = "";
    items.forEach(function (k, i) {
      var cx = w * i + w / 2, sym = SYM[k]; if (!sym) return;
      out += '<rect x="' + (cx - 40) + '" y="14" width="80" height="80" rx="12" fill="' + (s.hl === k ? "#fdf2f8" : "#fff") + '" stroke="' + (s.hl === k ? MARK : "#e9d5ff") + '" stroke-width="2"/>';
      out += sym.draw(cx, 54) + t(cx, 116, sym.name, 13, s.hl === k ? MARK : INK);
      if (s.notes && s.notes[i]) out += t(cx, 136, s.notes[i], 10, SUB);
    });
    return out;
  }

  /* ---------------- 地図の 方位（上が北） ---------------- */
  function mapdir(s) {
    var out = '<rect x="90" y="22" width="140" height="104" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>';
    out += '<path d="M110 100 H210 M160 40 V120" stroke="#d6d3d1" stroke-width="6"/><rect x="118" y="52" width="22" height="16" fill="#fde68a"/><rect x="176" y="78" width="26" height="18" fill="#bfdbfe"/>';
    var hl = s.hl || "";
    function dir(x, y, label) { var on = hl === label; return t(x, y, label, on ? 17 : 14, on ? MARK : DARK); }
    out += dir(160, 16, "北") + dir(160, 146, "南") + dir(250, 80, "東") + dir(70, 80, "西");
    out += '<path d="M282 22 L290 44 L282 39 L274 44z" fill="#dc2626"/>' + t(282, 58, "北", 11, "#dc2626");
    if (hl === "北東") out += arrow(160, 74, 222, 28, MARK) + t(258, 26, "北東", 15, MARK);
    if (hl === "東") out += '<circle cx="290" cy="110" r="12" fill="#fb923c"/>' + t(290, 138, "朝 日が のぼる", 10, "#c2410c");
    if (hl === "西") out += '<circle cx="30" cy="110" r="12" fill="#fb923c"/>' + t(30, 138, "日が しずむ", 10, "#c2410c");
    return out;
  }

  /* ---------------- 流れ図（3こずつ 折り返す） ---------------- */
  function flow(s) {
    var nodes = s.nodes, out = "", per = 3, bw = 86, bh = 40;
    function pos(i) { var row = Math.floor(i / per), col = i % per; if (row % 2 === 1) col = per - 1 - col; return { x: 20 + col * 107, y: 12 + row * 66 }; }
    nodes.forEach(function (n, i) {
      var p = pos(i), on = s.hl === i;
      out += '<rect x="' + p.x + '" y="' + p.y + '" width="' + bw + '" height="' + bh + '" rx="10" fill="' + (on ? "#fdf2f8" : (n.c || "#f5f3ff")) + '" stroke="' + (on ? MARK : "#c4b5fd") + '" stroke-width="' + (on ? 3 : 2) + '"/>';
      out += t(p.x + bw / 2, p.y + (n.sub ? 18 : 25), n.label, n.label.length > 6 ? 11 : 12, on ? MARK : INK);
      if (n.sub) out += t(p.x + bw / 2, p.y + 33, n.sub, 9, SUB);
      if (i < nodes.length - 1) {
        var q = pos(i + 1);
        if (q.y === p.y) out += q.x > p.x ? arrow(p.x + bw + 2, p.y + bh / 2, q.x - 3, q.y + bh / 2) : arrow(p.x - 2, p.y + bh / 2, q.x + bw + 3, q.y + bh / 2);
        else out += arrow(p.x + bw / 2, p.y + bh + 2, q.x + bw / 2, q.y - 3);
      }
    });
    if (s.loop) { var a = pos(nodes.length - 1), b = pos(0); out += '<path d="M' + a.x + ' ' + (a.y + bh / 2) + ' H8 V' + (b.y + bh / 2) + ' H' + (b.x - 3) + '" fill="none" stroke="' + MARK + '" stroke-width="2" stroke-dasharray="5 4"/>' + arrowHead(b.x - 3, b.y + bh / 2, 0); }
    return out;
  }

  /* ---------------- 3R ---------------- */
  function threeR(s) {
    var cards = [["reduce", "リデュース", "へらす", "マイバッグ"], ["reuse", "リユース", "くり返し 使う", "びんを あらって"], ["recycle", "リサイクル", "作りかえる", "ペットボトル→服"]], out = "";
    cards.forEach(function (c, i) {
      var x = 8 + i * 104, on = s.hl === c[0];
      out += '<rect x="' + x + '" y="10" width="96" height="124" rx="14" fill="' + (on ? "#fdf2f8" : "#f0fdf4") + '" stroke="' + (on ? MARK : "#86efac") + '" stroke-width="' + (on ? 3 : 2) + '"/>';
      out += '<circle cx="' + (x + 48) + '" cy="44" r="20" fill="' + (on ? "#fbcfe8" : "#bbf7d0") + '"/>' + t(x + 48, 51, "R", 18, on ? MARK : "#15803d");
      out += t(x + 48, 86, c[1], 13, on ? MARK : "#15803d") + t(x + 48, 104, c[2], 11, INK) + t(x + 48, 122, c[3], 9, SUB);
    });
    return out;
  }

  /* ---------------- 内陸県 ---------------- */
  function inland() {
    var out = '<rect x="0" y="0" width="320" height="150" fill="#bfdbfe"/>' + t(28, 140, "海", 13, "#1d4ed8");
    out += '<path d="M60 10 H300 V150 H40 Q20 110 50 80 Q30 40 60 10z" fill="#e7e5e4" stroke="#a8a29e" stroke-width="2"/>';
    out += '<path d="M150 20 L150 60 M60 60 H300 M120 60 L110 150 M220 60 L230 150 M260 20 L250 60" stroke="#a8a29e" stroke-width="2"/>';
    out += '<path d="M120 60 H220 L230 150 H110z" fill="#fde68a" stroke="' + MARK + '" stroke-width="3"/>' + t(170, 102, "内陸県", 15, MARK) + t(170, 120, "まわりは 陸（となりの 県）", 10, SUB);
    out += t(80, 110, "海に 面した 県", 10, SUB) + t(270, 110, "となりの 県", 10, SUB);
    return out;
  }

  /* ---------------- 110番・119番 ---------------- */
  function phones() {
    function card(x, num, col, a, b) {
      return '<rect x="' + x + '" y="14" width="140" height="120" rx="16" fill="#fff" stroke="' + col + '" stroke-width="3"/>' + t(x + 70, 64, num, 36, col) + t(x + 70, 96, a, 13, INK) + t(x + 70, 116, b, 11, SUB);
    }
    return card(12, "119", "#dc2626", "火事・急病・けが", "消防車・救急車") + card(168, "110", "#2563eb", "事件・事故", "警察");
  }

  /* ---------------- 自助・共助・公助 ---------------- */
  function jijo(s) {
    var items = [["自助", "自分で 守る", "#fde68a"], ["共助", "近所で 助け合う", "#bbf7d0"], ["公助", "市・消防・国が 助ける", "#bfdbfe"]], out = "";
    items.forEach(function (it, i) {
      var cx = 58 + i * 102, on = s.hl === it[0];
      out += '<circle cx="' + cx + '" cy="62" r="' + (on ? 46 : 40) + '" fill="' + it[2] + '" stroke="' + (on ? MARK : "#94a3b8") + '" stroke-width="' + (on ? 4 : 2) + '"/>' + t(cx, 68, it[0], 18, on ? MARK : DARK) + t(cx, 132, it[1], 10, on ? MARK : SUB);
    });
    return out;
  }


  /* ---------------- 昔と 今・前と あと（★2026-10-03追加、先人の 単元）：2つの 絵を ならべて くらべる ----------------
     s.k：dig（昔は 人の 手で ほる／今は 機械）・ta（用水路が できる 前／できた あと）・slope（用水路の かたむき）・bridge（通潤橋） */
  var WATER = "#38bdf8", SOILC = "#d6a76c", GREEN = "#4ade80";
  function panel(x, title, sub, on) {
    return '<rect x="' + x + '" y="4" width="148" height="142" rx="12" fill="' + (on ? "#fdf2f8" : "#f8fafc") + '" stroke="' + (on ? MARK : "#c4b5fd") + '" stroke-width="' + (on ? 3 : 2) + '"/>' +
      t(x + 74, 22, title, 13, on ? MARK : INK) + (sub ? t(x + 74, 138, sub, 10, SUB) : "");
  }
  function person(x, y) {
    return '<circle cx="' + x + '" cy="' + (y - 30) + '" r="7" fill="#fde7d7" stroke="' + DARK + '" stroke-width="1.6"/>' + '<path d="M' + (x - 10) + ' ' + (y - 36) + ' h20" stroke="#a16207" stroke-width="3"/>' +
      L(x, y - 23, x, y - 6, DARK, 3) + L(x, y - 6, x - 7, y + 8, DARK, 3) + L(x, y - 6, x + 7, y + 8, DARK, 3) + L(x, y - 18, x + 12, y - 12, DARK, 3);
  }
  function fields(x, y, n, wet) {
    var o = "";
    for (var i = 0; i < n; i++) {
      var fx = x + (i % 3) * 42, fy = y + Math.floor(i / 3) * 24;
      o += '<rect x="' + fx + '" y="' + fy + '" width="38" height="20" rx="3" fill="' + (wet ? "#bbf7d0" : "#fde68a") + '" stroke="' + (wet ? "#16a34a" : "#a16207") + '" stroke-width="1.4"/>';
      if (wet) for (var k = 0; k < 4; k++) o += L(fx + 6 + k * 9, fy + 16, fx + 6 + k * 9, fy + 6, "#16a34a", 1.6);
    }
    return o;
  }
  function mukashi(s) {
    var out = "";
    if (s.k === "dig") {
      out += panel(6, "むかし", "人の 手で ほって 運ぶ", s.hl === "old") + panel(166, "今", "機械で ほる", s.hl === "now");
      out += '<path d="M14 110 H146 V128 H14 Z" fill="' + SOILC + '"/><path d="M60 110 q20 18 40 0" fill="#a16207"/>';
      out += person(52, 104) + L(64, 92, 78, 116, "#92400e", 3) + '<path d="M74 114 l10 4 l-6 4 z" fill="#64748b"/>';
      out += person(118, 104) + L(104, 70, 132, 70, "#92400e", 3) + '<path d="M106 70 v14 h8 v-14 M124 70 v14 h8 v-14" fill="none" stroke="#a16207" stroke-width="2"/><ellipse cx="110" cy="86" rx="7" ry="4" fill="' + SOILC + '"/><ellipse cx="128" cy="86" rx="7" ry="4" fill="' + SOILC + '"/>';
      out += '<path d="M174 110 H306 V128 H174 Z" fill="' + SOILC + '"/><path d="M262 110 q14 16 30 0" fill="#a16207"/>';
      out += '<rect x="184" y="84" width="54" height="22" rx="4" fill="#facc15" stroke="#a16207" stroke-width="1.6"/><rect x="214" y="64" width="24" height="22" rx="3" fill="#fde68a" stroke="#a16207" stroke-width="1.6"/><rect x="180" y="104" width="62" height="8" rx="4" fill="#475569"/>';
      out += '<path d="M236 74 L268 50 L290 92" fill="none" stroke="#eab308" stroke-width="6" stroke-linejoin="round"/><path d="M282 90 l16 4 l-4 14 l-16 -4 z" fill="#64748b"/>';
      return out;
    }
    if (s.k === "ta") {
      out += panel(6, "用水路が できる 前", "水が たりず、田が 少ない", s.hl === "before") + panel(166, "できた あと", "水が とどき、田が ふえた", s.hl === "after");
      out += '<circle cx="128" cy="44" r="12" fill="#fde047"/>' + fields(18, 56, 2, false) + '<path d="M18 100 H146 V126 H18 Z" fill="#fde68a"/>' + L(40, 106, 52, 118, "#a16207", 1.6) + L(52, 118, 46, 124, "#a16207", 1.6) + L(98, 104, 110, 114, "#a16207", 1.6) + L(110, 114, 124, 112, "#a16207", 1.6);
      out += '<path d="M174 36 C220 40 240 62 300 62" stroke="' + WATER + '" stroke-width="8" fill="none"/>' + t(194, 54, "用水路", 9, "#0369a1") + fields(178, 72, 6, true);
      out += '<path d="M178 60 V70 M222 66 V70 M262 62 V70" stroke="' + WATER + '" stroke-width="3"/>';
      out += arrow(150, 76, 162, 76, MARK);
      return out;
    }
    if (s.k === "slope") {
      out += '<path d="M10 40 H60 V130 H10 Z" fill="#a7f3d0"/>' + t(35, 30, "川", 12, "#0369a1") + '<path d="M18 60 Q35 52 52 60 V130 H18 Z" fill="' + WATER + '" opacity=".7"/>';
      out += '<path d="M60 64 L290 104" stroke="' + SOILC + '" stroke-width="14"/><path d="M60 60 L290 100" stroke="' + WATER + '" stroke-width="6"/>';
      [100, 160, 220].forEach(function (x) { var y = 60 + (x - 60) * 40 / 230; out += arrow(x - 16, y - 12, x + 4, y - 9, MARK); });
      out += L(60, 60, 290, 60, "#94a3b8", 1.4).replace('fill="none"', 'fill="none" stroke-dasharray="5 4"') + t(276, 54, "同じ 高さ", 9, SUB);
      out += '<path d="M282 60 V100" stroke="' + MARK + '" stroke-width="2"/>' + arrowHead(282, 100, Math.PI / 2) + t(130, 104, "少しずつ 低く", 11, MARK);
      out += fields(206, 112, 2, true);
      return out;
    }
    if (s.k === "bridge") {
      out += '<path d="M8 40 L70 40 L104 140 L216 140 L250 40 L312 40" fill="none" stroke="#a16207" stroke-width="3"/><path d="M8 40 L70 40 L104 140 L216 140 L250 40 L312 40 V146 H8 Z" fill="#fef3c7"/>';
      out += '<path d="M70 40 H250 V62 H70 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/><path d="M96 62 V140 H224 V62 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/><path d="M110 140 V104 A50 44 0 0 1 210 104 V140 Z" fill="#fef3c7" stroke="#64748b" stroke-width="2"/>';
      out += '<path d="M8 50 H312" stroke="' + WATER + '" stroke-width="5" stroke-dasharray="10 0"/>' + t(160, 56, "← 石の 管（水の 通り道）→", 9, "#0369a1");
      out += '<path d="M160 64 Q150 84 136 100 M160 64 Q170 84 184 100" stroke="' + WATER + '" stroke-width="3" fill="none"/>' + t(160, 122, "放水（水を 出す）", 9, "#0369a1");
      out += t(36, 34, "台地", 10, DARK) + t(284, 34, "台地（田）", 10, DARK);
      return out;
    }
    return out;
  }
  T.mukashi = mukashi;
  T.mapsym = mapsym; T.mapdir = mapdir; T.flow = flow; T.threeR = threeR; T.inland = inland; T.phones = phones; T.jijo = jijo;
})();
