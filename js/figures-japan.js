/* =====================================================================
   figures-japan.js — 日本地図（マス目の 地図）と 地図の 読み方の 図（js/figures.js に 種類を足す）
   ★2026-10-03追加：
   - japan    … 47都道府県を 1県 1マスで ならべた 地図（形では なく「どのあたりか」と「となり」を 見る 図）。
                 地方の 色分け・県の 強調・内陸県の 点線わく・左上の 説明わく（県庁所在地など）
   - terrain  … 土地の 高さの 色分け（山地＝こい茶色 … 平野＝緑）と 川の 流れ
   - scale    … 縮尺（1cm＝1km の ものさし／同じ 紙で 1km と 10km の くらべ）
   - compass8 … 8方位
   マスの 位置は 本当の 地図の「となり」に 近く なるように 決めた（形や 大きさは 本当とは ちがう）。
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
  function arrowHead(x, y, ang, c) {
    var a1 = ang + 2.6, a2 = ang - 2.6;
    return '<path d="M' + (x + Math.cos(a1) * 8).toFixed(1) + ' ' + (y + Math.sin(a1) * 8).toFixed(1) + ' L' + x + ' ' + y + ' L' + (x + Math.cos(a2) * 8).toFixed(1) + ' ' + (y + Math.sin(a2) * 8).toFixed(1) + '" stroke="' + (c || MARK) + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/>';
  }

  /* ---------------- 日本地図（マス目） ---------------- */
  // [県名, 列, 行, 地方]（北海道は 横に 2マス）
  var PREF = [
    ["北海道", 12, 0, "北海道"],
    ["青森", 12, 1, "東北"], ["秋田", 12, 2, "東北"], ["岩手", 13, 2, "東北"], ["山形", 12, 3, "東北"], ["宮城", 13, 3, "東北"], ["福島", 12, 4, "東北"],
    ["群馬", 11, 5, "関東"], ["栃木", 12, 5, "関東"], ["茨城", 13, 5, "関東"], ["埼玉", 11, 6, "関東"], ["東京", 12, 6, "関東"], ["千葉", 13, 6, "関東"], ["神奈川", 11, 7, "関東"],
    ["福井", 8, 4, "中部"], ["石川", 9, 4, "中部"], ["富山", 10, 4, "中部"], ["新潟", 11, 4, "中部"], ["岐阜", 9, 5, "中部"], ["長野", 10, 5, "中部"], ["愛知", 9, 6, "中部"], ["山梨", 10, 6, "中部"], ["静岡", 10, 7, "中部"],
    ["兵庫", 6, 5, "近畿"], ["京都", 7, 5, "近畿"], ["滋賀", 8, 5, "近畿"], ["大阪", 6, 6, "近畿"], ["奈良", 7, 6, "近畿"], ["三重", 8, 6, "近畿"], ["和歌山", 7, 7, "近畿"],
    ["島根", 4, 4, "中国"], ["鳥取", 5, 4, "中国"], ["山口", 3, 5, "中国"], ["広島", 4, 5, "中国"], ["岡山", 5, 5, "中国"],
    ["愛媛", 3, 6, "四国"], ["香川", 4, 6, "四国"], ["高知", 3, 7, "四国"], ["徳島", 4, 7, "四国"],
    ["長崎", 0, 5, "九州"], ["佐賀", 1, 5, "九州"], ["福岡", 2, 5, "九州"], ["熊本", 1, 6, "九州"], ["大分", 2, 6, "九州"], ["鹿児島", 1, 7, "九州"], ["宮崎", 2, 7, "九州"], ["沖縄", 0, 8, "九州"]
  ];
  var REGION = { "北海道": "#bae6fd", "東北": "#c7d2fe", "関東": "#fbcfe8", "中部": "#bbf7d0", "近畿": "#fde68a", "中国": "#fed7aa", "四国": "#ddd6fe", "九州": "#fecaca" };
  var REGION_INK = { "北海道": "#0369a1", "東北": "#4338ca", "関東": "#be185d", "中部": "#15803d", "近畿": "#a16207", "中国": "#c2410c", "四国": "#6d28d9", "九州": "#b91c1c" };
  var REGION_N = { "北海道": 1, "東北": 6, "関東": 7, "中部": 9, "近畿": 7, "中国": 5, "四国": 4, "九州": 8 };
  var INLAND = ["栃木", "群馬", "埼玉", "山梨", "長野", "岐阜", "滋賀", "奈良"];
  var S = 22, X0 = 6, Y0 = 6;
  function cell(p) { return { x: X0 + p[1] * S, y: Y0 + p[2] * S, w: (p[0] === "北海道" ? 2 * S : S) - 2, h: S - 2 }; }
  function find(name) { for (var i = 0; i < PREF.length; i++) if (PREF[i][0] === name) return PREF[i]; return null; }
  function has(list, v) { return (list || []).indexOf(v) >= 0; }

  function japan(s) {
    var out = '<rect x="0" y="0" width="320" height="' + japan.H + '" rx="10" fill="#eff6ff"/>';
    var hl = s.hl || [], sub = s.sub || [], mode = s.mode || "";
    PREF.forEach(function (p) {
      // ふつうは 地方ごとの うすい 色＋全部の 県名（どこが どこか 分かるように）
      var c = cell(p), name = p[0], fill = REGION[p[3]], op = 0.55, stroke = "#fff", ink = "#475569", sw = 1, dash = "", bold = false;
      if (mode === "region") { op = 1; ink = REGION_INK[p[3]]; }
      if (mode === "todofuken") {
        var kind = name === "東京" ? "都" : name === "北海道" ? "道" : (name === "大阪" || name === "京都") ? "府" : "県";
        fill = kind === "県" ? "#ede9fe" : { "都": "#f472b6", "道": "#38bdf8", "府": "#fbbf24" }[kind]; op = 1; ink = kind === "県" ? "#7c6f8a" : "#fff"; bold = kind !== "県";
      }
      if (s.region) { if (p[3] === s.region) { op = 1; stroke = REGION_INK[p[3]]; ink = REGION_INK[p[3]]; sw = 1.6; bold = true; } else { fill = "#f1f5f9"; op = 1; ink = "#94a3b8"; } }
      if (s.inland && has(INLAND, name)) { fill = "#fce7f3"; op = 1; stroke = MARK; sw = 1.8; dash = "3 2"; ink = "#9d174d"; }
      if (has(sub, name)) { fill = "#fbcfe8"; op = 1; stroke = MARK; ink = "#9d174d"; sw = 1.6; dash = ""; bold = true; }
      if (has(hl, name)) { fill = MARK; op = 1; stroke = "#9d174d"; ink = "#fff"; sw = 2; dash = ""; bold = true; }
      out += '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" rx="4" fill="' + fill + '" fill-opacity="' + op + '" stroke="' + stroke + '" stroke-width="' + sw + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>';
      var cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      if (name.length >= 3 && name !== "北海道") out += t(cx, cy - 1, name.slice(0, 2), 7.5, ink) + t(cx, cy + 7.5, name.slice(2), 7.5, ink);
      else out += t(cx, cy + (bold ? 3.6 : 3.2), name, bold ? 9.5 : 8.5, ink);
    });
    out += t(314, Y0 + 8 * S + 14, "1県を 1マスで ならべた 地図（形・大きさは 本当と ちがう）", 7.5, "#94a3b8", "end");
    // 左上の あいた ところ（日本海の あたり）に 説明わく
    var lines = s.box || [];
    if (mode === "region") {
      var keys = Object.keys(REGION);
      keys.forEach(function (k, i) {
        var x = 10 + (i % 4) * 62, y = 10 + Math.floor(i / 4) * 24, on = s.region === k;
        out += '<rect x="' + x + '" y="' + y + '" width="58" height="20" rx="6" fill="' + REGION[k] + '" stroke="' + (on ? MARK : "#fff") + '" stroke-width="' + (on ? 2.4 : 1) + '"/>' +
          t(x + 29, y + 14, k + " " + REGION_N[k], 10, REGION_INK[k]);
      });
      if (!lines.length) lines = ["8つの 地方（数字は 都道府県の 数）"];
      out += t(10, 74, lines[0], 10.5, INK, "start");
      return out;
    }
    if (mode === "todofuken" && !lines.length) lines = ["都 1・道 1・府 2・県 43", "＝ 47 都道府県"];
    if (s.inland && !lines.length) lines = ["点線の 県 ＝ 内陸県", "海に 面して いない 県（8つ）"];
    if (lines.length) {
      var w = 0; lines.forEach(function (l) { w = Math.max(w, l.length); });
      var bw = Math.min(250, w * 12.5 + 20), bh = 12 + lines.length * 18;
      out += '<rect x="8" y="8" width="' + bw + '" height="' + bh + '" rx="10" fill="#fff" stroke="' + (hl.length ? MARK : "#c4b5fd") + '" stroke-width="2"/>';
      lines.forEach(function (l, i) { out += t(18, 26 + i * 18, l, i === 0 ? 13 : 11.5, i === 0 ? (hl.length ? MARK : INK) : INK, "start"); });
      // 説明わくから 強調した 県へ 点線
      var target = hl.length === 1 ? find(hl[0]) : null;
      if (target && !s.noLeader) {
        var c = cell(target), tx = c.x + c.w / 2, ty = c.y + 2, sx = Math.min(8 + bw, Math.max(20, tx)), sy = 8 + bh;
        if (tx > 8 + bw) { sx = 8 + bw; sy = 8 + bh / 2; }
        out += '<path d="M' + sx + ' ' + sy + ' L' + tx + ' ' + ty + '" stroke="' + MARK + '" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/>';
      }
    }
    return out;
  }
  japan.H = Y0 + 9 * S + 2;

  /* ---------------- 土地の 高さ（色分け）と 川 ---------------- */
  function terrain(s) {
    var hl = s.hl || "", out = "";
    var bands = [["#a0632a", 0, 72], ["#e0b07a", 72, 128], ["#fde68a", 128, 178], ["#86efac", 178, 252]];
    out += '<rect x="0" y="6" width="320" height="104" rx="8" fill="#93c5fd"/>';
    bands.forEach(function (b, i) {
      var x1 = b[1], x2 = b[2];
      out += '<path d="M' + x1 + ' 6 H' + x2 + ' Q' + (x2 + 10) + ' 32 ' + (x2 - 4) + ' 58 Q' + (x2 - 12) + ' 86 ' + (x2 + 4) + ' 110 H' + x1 + 'z" fill="' + b[0] + '"/>';
    });
    // 山の 木・平野の 家
    [[22, 30], [46, 52], [20, 80], [52, 92], [100, 28]].forEach(function (p) { out += '<path d="M' + p[0] + ' ' + (p[1] - 9) + ' L' + (p[0] - 7) + ' ' + (p[1] + 4) + ' H' + (p[0] + 7) + 'z" fill="#166534"/>'; });
    [[196, 30], [214, 42], [232, 30], [200, 82], [228, 78]].forEach(function (p) { out += '<path d="M' + (p[0] - 6) + ' ' + p[1] + ' L' + p[0] + ' ' + (p[1] - 6) + ' L' + (p[0] + 6) + ' ' + p[1] + ' V' + (p[1] + 7) + ' H' + (p[0] - 6) + 'z" fill="#fff" stroke="' + DARK + '" stroke-width="1.2"/>'; });
    // 川（山から 海へ）
    var river = hl === "river";
    out += '<path d="M30 14 Q70 40 110 52 T190 64 Q230 70 262 66" fill="none" stroke="' + (river ? "#1d4ed8" : "#3b82f6") + '" stroke-width="' + (river ? 6 : 4) + '" stroke-linecap="round"/>';
    if (river) { out += arrowHead(110, 52, 0.25, "#fff") + arrowHead(192, 64, 0.08, "#fff") + arrowHead(258, 66, -0.05, "#fff"); }
    out += t(36, 66, "山地", 13, "#fff", "middle") + t(36, 102, hl === "forest" ? "森林が 多い" : "", 10, "#fff");
    out += t(215, 66, "平野", 13, "#166534", "middle", true) + t(215, 106, hl === "town" ? "町・田畑" : "", 10, "#166534", "middle", true);
    out += t(292, 60, "海", 14, "#1e3a8a");
    if (hl === "high") out += '<path d="M0 6 H72 Q82 32 68 58 Q60 86 76 110 H0z" fill="none" stroke="' + MARK + '" stroke-width="3"/>';
    if (hl === "low") out += '<path d="M178 6 H252 Q262 32 248 58 Q240 86 256 110 H178 Q188 86 174 58 Q166 32 178 6z" fill="none" stroke="' + MARK + '" stroke-width="3"/>';
    if (hl === "forest") out += '<rect x="2" y="8" width="72" height="100" rx="6" fill="none" stroke="' + MARK + '" stroke-width="3"/>';
    if (hl === "town") out += '<rect x="182" y="16" width="66" height="90" rx="6" fill="none" stroke="' + MARK + '" stroke-width="3"/>';
    // 色の 見本（高い → 低い）
    var leg = [["#a0632a", "高い"], ["#e0b07a", ""], ["#fde68a", ""], ["#86efac", "低い"], ["#93c5fd", "海"]];
    leg.forEach(function (l, i) { out += '<rect x="' + (40 + i * 48) + '" y="120" width="44" height="12" rx="3" fill="' + l[0] + '"/>' + (l[1] ? t(62 + i * 48, 147, l[1], 10, DARK) : ""); });
    return out;
  }

  /* ---------------- 縮尺 ---------------- */
  function scale(s) {
    var out = "";
    if (s.k === "ruler") {
      var n = s.n || 3, seg = Math.min(80, 260 / n), x0 = 160 - seg * n / 2;
      out += '<circle cx="' + x0 + '" cy="70" r="7" fill="#fbcfe8" stroke="' + MARK + '" stroke-width="2"/><circle cx="' + (x0 + seg * n) + '" cy="70" r="7" fill="#fbcfe8" stroke="' + MARK + '" stroke-width="2"/>';
      for (var i = 0; i < n; i++) {
        var x = x0 + seg * i;
        out += '<rect x="' + x + '" y="64" width="' + seg + '" height="12" fill="' + (i % 2 ? "#fff" : DARK) + '" stroke="' + DARK + '" stroke-width="1.5"/>';
        out += t(x + seg / 2, 54, "1cm", 12, INK) + t(x + seg / 2, 98, "1km", 12, MARK);
      }
      out += t(160, 26, "地図の 上で " + n + "cm", 14, INK) + t(160, 128, "本当の きょりは " + n + "km", 14, MARK);
      return out;
    }
    // compare：同じ 大きさの 紙に、1cm＝1km（せまい・くわしい）と 1cm＝10km（広い）
    function frame(x, label, on) { return '<rect x="' + x + '" y="24" width="130" height="104" rx="6" fill="#f0fdf4" stroke="' + (on ? MARK : "#86efac") + '" stroke-width="' + (on ? 3 : 2) + '"/>' + t(x + 65, 16, label, 12, on ? MARK : INK); }
    out += frame(20, "1cm＝1km", s.hl === "small") + frame(170, "1cm＝10km", s.hl === "wide");
    // 左：町の ようすが くわしい
    out += '<path d="M28 76 H142 M84 30 V122" stroke="#d6d3d1" stroke-width="8"/>';
    [[40, 40], [58, 40], [104, 92], [122, 92], [40, 94]].forEach(function (p) { out += '<rect x="' + p[0] + '" y="' + p[1] + '" width="12" height="12" fill="#fde68a" stroke="' + DARK + '" stroke-width="1"/>'; });
    out += '<rect x="100" y="36" width="34" height="24" rx="3" fill="#bfdbfe" stroke="' + DARK + '" stroke-width="1"/>' + t(117, 53, "学校", 9, DARK);
    out += t(85, 144, "せまい・くわしい", 11, SUB);
    // 右：広い はんい（町は 小さな 点に）
    out += '<path d="M290 24 Q270 70 300 128 H170 V24z" fill="#e7e5e4"/><path d="M290 24 Q270 70 300 128" fill="none" stroke="#60a5fa" stroke-width="3"/>';
    out += '<path d="M190 70 L204 46 L218 70z M206 70 L222 40 L238 70z" fill="#a0632a"/>';
    [[200, 100], [236, 90], [258, 112], [250, 54]].forEach(function (p) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="' + DARK + '"/>'; });
    out += '<rect x="230" y="84" width="12" height="12" fill="none" stroke="' + MARK + '" stroke-width="1.6" stroke-dasharray="3 2"/>';
    out += t(235, 144, "広い はんいが のる", 11, s.hl === "wide" ? MARK : SUB);
    return out;
  }

  /* ---------------- 8方位 ---------------- */
  function compass8(s) {
    var cx = 160, cy = 76, out = "", names = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
    names.forEach(function (n, i) {
      var a = i * Math.PI / 4 - Math.PI / 2, main = i % 2 === 0, on = s.hl === n, r = main ? 50 : 38;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      out += '<path d="M' + cx + ' ' + cy + ' L' + x.toFixed(1) + ' ' + y.toFixed(1) + '" stroke="' + (on ? MARK : main ? DARK : "#a8a29e") + '" stroke-width="' + (on ? 4 : main ? 3 : 2) + '" stroke-linecap="round"/>';
      if (on) out += arrowHead(+x.toFixed(1), +y.toFixed(1), a, MARK);
      var lr = main ? 64 : 56, lx = cx + Math.cos(a) * lr * (main ? 1 : 1.25), ly = cy + Math.sin(a) * lr + 5;
      out += t(lx.toFixed(1), ly.toFixed(1), n, on ? 16 : main ? 14 : 12, on ? MARK : main ? DARK : SUB, "middle", true);
    });
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + INK + '"/>';
    return out;
  }

  T.japan = japan; T.terrain = terrain; T.scale = scale; T.compass8 = compass8;
  window.JAPAN_PREFS = PREF.map(function (p) { return p[0]; });
})();
