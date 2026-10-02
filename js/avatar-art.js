/* =====================================================================
   avatar-art.js — ガチャのアバター（ニコ19種＋はじめてのニコ）のSVGイラスト
   ★2026-10-02追加（もちくんに続き、ほかのガチャアバターもイラスト化）
   - ニコ＝ひよこの オリジナルキャラ。からだは共通、ぼうし・もちもの・表情・色で 描き分ける
   - window.avatarSvg(idまたは絵文字, mood) で SVG文字列を返す（無いものは null → 呼び出し側は絵文字のまま）
   - もちくん（e_ex_mochi / 🦭）は js/mascots.js の イラストを使う
   - saveData.selectedAvatar は絵文字で保存されている（既存仕様）。🐣 は「はじめてのニコ」と
     「ほわほわニコ(e01)」で同じ絵文字なので、e01を持っていれば ほわほわニコ の絵を出す
   ===================================================================== */
(function () {
  "use strict";

  function star4(x, y, r, color) {
    return '<path d="M' + x + ' ' + (y - r) + ' Q' + (x + r * 0.22) + ' ' + (y - r * 0.22) + ' ' + (x + r) + ' ' + y +
      ' Q' + (x + r * 0.22) + ' ' + (y + r * 0.22) + ' ' + x + ' ' + (y + r) + ' Q' + (x - r * 0.22) + ' ' + (y + r * 0.22) + ' ' + (x - r) + ' ' + y +
      ' Q' + (x - r * 0.22) + ' ' + (y - r * 0.22) + ' ' + x + ' ' + (y - r) + 'z" fill="' + (color || "#fde047") + '"/>';
  }
  function mirror(svg) { return '<g transform="translate(64 0) scale(-1 1)">' + svg + '</g>'; }

  function eyesFor(style) {
    var ink = "#2b2135";
    if (style === "happy") return '<path d="M20.5 36 q3.5 -4.5 7 0 M36.5 36 q3.5 -4.5 7 0" fill="none" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"/>';
    if (style === "sleep") return '<path d="M20.5 35 q3.5 3.2 7 0 M36.5 35 q3.5 3.2 7 0" fill="none" stroke="' + ink + '" stroke-width="2" stroke-linecap="round"/>';
    if (style === "relaxed") return '<path d="M20.8 35.4 q3.2 2.6 6.4 0 M36.8 35.4 q3.2 2.6 6.4 0" fill="none" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round"/>';
    var dots = '<circle cx="24" cy="35" r="2.7" fill="' + ink + '"/><circle cx="40" cy="35" r="2.7" fill="' + ink + '"/>' +
      '<circle cx="25" cy="34" r="1" fill="#fff"/><circle cx="41" cy="34" r="1" fill="#fff"/>';
    if (style === "determined") return dots + '<path d="M19.5 29.5 l7.5 2.6 M44.5 29.5 l-7.5 2.6" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round"/>';
    return dots;
  }

  function niko(o, mood) {
    var gid = "nkb_" + o.k;
    var c1 = o.c1 || "#fffbe0", c2 = o.c2 || "#fcd34d", st = o.st || "#f2c14e";
    var eye = (mood === "happy" || mood === "cheer") ? "happy" : (o.eyes || "dot");
    var cy = o.cy || 38, rx = o.rx || 22, ry = o.ry || 20;
    var s = '<svg class="c-buddy nk" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + o.label + '">' +
      '<defs><radialGradient id="' + gid + '" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></radialGradient>' + (o.defs || "") + '</defs>' +
      '<ellipse cx="32" cy="61.5" rx="18" ry="2.4" fill="#a855f7" opacity=".12"/>' +
      (o.back || "");
    if (!o.noFeet) s += '<ellipse cx="25" cy="58.6" rx="4.2" ry="2.1" fill="' + (o.feet || "#fb923c") + '"/><ellipse cx="39" cy="58.6" rx="4.2" ry="2.1" fill="' + (o.feet || "#fb923c") + '"/>';
    if (!o.noTuft) s += '<path d="M30.5 ' + (cy - ry + 2) + ' q-3 -8 3 -9 q-1.5 4.5 2.2 8.2z" fill="' + c2 + '" stroke="' + st + '" stroke-width="1"/>';
    s += '<ellipse cx="10.8" cy="' + (cy + 3) + '" rx="4.4" ry="7" fill="url(#' + gid + ')" stroke="' + st + '" stroke-width="1.1" transform="rotate(25 10.8 ' + (cy + 3) + ')"/>' +
         '<ellipse cx="53.2" cy="' + (cy + 3) + '" rx="4.4" ry="7" fill="url(#' + gid + ')" stroke="' + st + '" stroke-width="1.1" transform="rotate(-25 53.2 ' + (cy + 3) + ')"/>' +
         '<ellipse cx="32" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + gid + ')" stroke="' + st + '" stroke-width="1.3"/>' +
         '<ellipse cx="25" cy="' + (cy - ry * 0.55) + '" rx="6" ry="2.6" fill="#fff" opacity=".45" transform="rotate(-18 25 ' + (cy - ry * 0.55) + ')"/>' +
         eyesFor(eye) +
         '<path d="M29.4 40 L34.6 40 L32 43.6z" fill="#fb923c" stroke="#ea580c" stroke-width=".6" stroke-linejoin="round"/>' +
         '<ellipse cx="17.5" cy="41" rx="3.6" ry="2.2" fill="#f9a8d4" opacity=".8"/><ellipse cx="46.5" cy="41" rx="3.6" ry="2.2" fill="#f9a8d4" opacity=".8"/>' +
         (o.front || "") +
         (mood === "cheer" ? star4(55, 9, 4.5) : "");
    return s + '</svg>';
  }

  // ---- 1体ずつの かざり ----
  var sunRays = (function () {
    var out = "";
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2, a1 = a - 0.13, a2 = a + 0.13;
      var p = function (ang, r) { return (32 + Math.cos(ang) * r).toFixed(1) + " " + (37 + Math.sin(ang) * r).toFixed(1); };
      out += '<path d="M' + p(a1, 23) + ' L' + p(a, 31) + ' L' + p(a2, 23) + 'z" fill="#fb923c"/>';
    }
    return out;
  })();
  var rainbowWing = '<path d="M14 37 Q-2 25 5 11 Q15 19 19 33z" fill="#f9a8d4"/><path d="M14 37 Q1 28 7 17 Q15 23 19 34z" fill="#fde68a"/><path d="M14 37 Q5 30 9.5 23 Q15.5 27 19 35z" fill="#a5f3fc"/>';
  var dragonWing = '<path d="M13 35 L1 21 L4.5 31 L0 35 L6 39 L12 44z" fill="#4ade80" stroke="#16a34a" stroke-width="1" stroke-linejoin="round"/>';
  var hood = function (col) { return '<path d="M9 37 Q7 15 32 14 Q57 15 55 37 Q48 26 32 26 Q16 26 9 37z" fill="' + col + '"/>'; };

  var DEFS = {
    "default": { label: "はじめてのニコ", noFeet: true,
      front: '<path d="M9 46 L14 41 L19 47 L24 41 L29 47 L34 41 L39 47 L44 41 L49 47 L55 42 Q57 61 32 61 Q7 61 9 46z" fill="#fff" stroke="#e7e2ee" stroke-width="1.4" stroke-linejoin="round"/>' },
    e01: { label: "ほわほわニコ",
      back: '<circle cx="12" cy="31" r="5.5" fill="#fff3b0"/><circle cx="13" cy="48" r="5" fill="#fff3b0"/><circle cx="51" cy="48" r="5" fill="#fff3b0"/><circle cx="52" cy="31" r="5.5" fill="#fff3b0"/><circle cx="21" cy="21" r="5" fill="#fff3b0"/><circle cx="43" cy="21" r="5" fill="#fff3b0"/>',
      front: '<path d="M27 51 q2.5 2.4 5 0 q2.5 2.4 5 0" stroke="#f2c14e" stroke-width="1.3" fill="none" stroke-linecap="round"/>' },
    e02: { label: "ねむりニコ", eyes: "sleep", noTuft: true,
      front: '<path d="M12 28 Q18 9 40 10 Q51 11 55 20 Q51 18 48 22 Q34 19 12 28z" fill="#93c5fd"/>' +
             '<path d="M12 28 Q32 19 49 23" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="55.5" cy="21" r="3.6" fill="#fff"/>' +
             '<text x="49" y="36" font-size="8" font-weight="900" fill="#818cf8" font-family="sans-serif">z</text><text x="55" y="30" font-size="6" font-weight="900" fill="#a5b4fc" font-family="sans-serif">z</text>' },
    e03: { label: "はりきりニコ", eyes: "determined",
      front: '<path d="M11 28.5 Q32 20 53 28.5 L53 32.5 Q32 24 11 32.5z" fill="#ef4444"/><path d="M52 29.5 l8 -5 l-1.8 6.2z M52 31.5 l8 3 l-5.6 2.4z" fill="#ef4444"/>' +
             '<path d="M5 9 h6.5 l-3 6 h4.3 l-8.4 10.5 l2 -7.5 h-4.2z" fill="#facc15" stroke="#f59e0b" stroke-width=".8" stroke-linejoin="round"/>' },
    e04: { label: "のんびりニコ", eyes: "relaxed", c2: "#fbd38d",
      front: (function () {
        var cx = 43, cy = 19, out = "";
        [[0, -4], [3.8, -1.2], [2.4, 3.2], [-2.4, 3.2], [-3.8, -1.2]].forEach(function (d) { out += '<circle cx="' + (cx + d[0]) + '" cy="' + (cy + d[1]) + '" r="3.4" fill="#f9a8d4"/>'; });
        return out + '<circle cx="' + cx + '" cy="' + cy + '" r="2.6" fill="#fde047"/>';
      })() },
    e05: { label: "たべすぎニコ", rx: 24,
      front: '<path d="M48 41 Q51 41 55 48 Q58 54 54 56 L42 56 Q38 54 41 48 Q45 41 48 41z" fill="#fff" stroke="#e5e7eb" stroke-width="1"/><rect x="44" y="50" width="8" height="6" rx="1" fill="#1f2937"/>' +
             '<ellipse cx="18.5" cy="45.5" rx="1.4" ry=".9" fill="#fff" stroke="#e5e7eb" stroke-width=".4"/>' },
    e06: { label: "よるのニコ", c1: "#eef2ff", c2: "#a5b4fc", st: "#818cf8", feet: "#fbbf24",
      front: '<path d="M44 7 a7.5 7.5 0 1 0 7 11.5 a5.8 5.8 0 1 1 -7 -11.5z" fill="#fde047" stroke="#f59e0b" stroke-width=".6"/>' + star4(11, 14, 3.5) + star4(57, 34, 2.8) },
    e07: { label: "あめふりニコ", feet: "#60a5fa",
      back: '<path d="M48 9 V36" stroke="#7c3aed" stroke-width="1.8"/><path d="M33 17 Q36 3 48 3 Q60 3 63 17 Q60 14.5 57.5 16.5 Q55 13.5 52.5 16 Q50 13 48 16 Q46 13 43.5 16 Q41 13.5 38.5 16.5 Q36 14.5 33 17z" fill="#f472b6" stroke="#db2777" stroke-width=".8" stroke-linejoin="round"/>',
      front: '<path d="M8 8 q2.2 3.4 0 4.6 q-2.2 -1.2 0 -4.6z M14 15 q2 3 0 4.2 q-2 -1.2 0 -4.2z M6 22 q2 3 0 4.2 q-2 -1.2 0 -4.2z" fill="#60a5fa"/>' },
    e08: { label: "ぴかぴかニコ", c1: "#fffbeb", c2: "#fbbf24", st: "#f59e0b",
      defs: '<radialGradient id="nkGlow"><stop offset="0" stop-color="#fef9c3"/><stop offset="1" stop-color="#fef9c3" stop-opacity="0"/></radialGradient>',
      back: '<circle cx="32" cy="36" r="30" fill="url(#nkGlow)"/>',
      front: star4(9, 15, 5) + star4(55, 12, 4) + star4(57, 50, 3.4, "#fff7ae") },
    e09: { label: "りかニコ",
      front: '<path d="M11 28 Q32 21 53 28" stroke="#38bdf8" stroke-width="3" fill="none"/>' +
             '<circle cx="25" cy="25.5" r="5" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2"/><circle cx="39" cy="25.5" r="5" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2"/>' +
             '<path d="M23 23.5 l2 -1.5 M37 23.5 l2 -1.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>' +
             '<path d="M51 38 h4 v5 l5 10 q1 2 -1 2 h-12 q-2 0 -1 -2 l5 -10z" fill="#ecfeff" stroke="#0891b2" stroke-width="1"/>' +
             '<path d="M47.5 50 L58.5 50 L60 53 Q61 55 59 55 L47 55 Q45 55 46 53z" fill="#4ade80"/>' },
    e10: { label: "さんすうニコ",
      front: '<circle cx="24" cy="35" r="5.6" fill="none" stroke="#7c3aed" stroke-width="1.6"/><circle cx="40" cy="35" r="5.6" fill="none" stroke="#7c3aed" stroke-width="1.6"/><path d="M29.6 35 h4.8" stroke="#7c3aed" stroke-width="1.6"/>' +
             '<path d="M46 57 L61 57 L46 40z" fill="#c4b5fd" fill-opacity=".9" stroke="#7c3aed" stroke-width="1" stroke-linejoin="round"/><path d="M49 53 L54.5 53 L49 47z" fill="#fff"/>' +
             '<path d="M48 57 v-2 M51 57 v-2 M54 57 v-2 M57 57 v-2" stroke="#7c3aed" stroke-width=".8"/>' },
    e11: { label: "くろぽんニコ", noTuft: true,
      front: '<path d="M12 25 L10 5 L25 17z M52 25 L54 5 L39 17z" fill="#2b2135"/>' + hood("#2b2135") +
             '<path d="M13.6 20 L12.6 10 L20.6 16.5z M50.4 20 L51.4 10 L43.4 16.5z" fill="#f9a8d4"/>' +
             '<g transform="translate(47 17) rotate(18)"><path d="M0 0 L-6 -4 Q-7.5 0 -6 4z M0 0 L6 -4 Q7.5 0 6 4z" fill="#f472b6"/><circle r="2" fill="#ec4899"/></g>' },
    e12: { label: "おうちゃくニコ", eyes: "relaxed", noFeet: true, cy: 41, ry: 17,
      back: '<ellipse cx="32" cy="55" rx="29" ry="7.5" fill="#a78bfa"/><ellipse cx="32" cy="53" rx="26" ry="5.5" fill="#ddd6fe"/>',
      front: '<path d="M47 14 q2 -2.4 4 0 q2 2.4 4 0" stroke="#a78bfa" stroke-width="1.6" fill="none" stroke-linecap="round"/>' },
    e13: { label: "まほうニコ", noTuft: true,
      front: '<ellipse cx="32" cy="20.5" rx="17" ry="3.6" fill="#6d28d9"/><path d="M22 20 Q29 0 47 3 Q38 8 42 20z" fill="#8b5cf6"/>' +
             '<path d="M23 18 Q32 15.6 41.6 18" stroke="#fde047" stroke-width="2.4" fill="none"/>' + star4(33, 11, 2.8) +
             '<path d="M4 54 L12 41" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>' + star4(12.5, 38, 4.2) },
    e14: { label: "たびびとニコ", noTuft: true,
      back: '<rect x="40" y="29" width="19" height="23" rx="5" fill="#b45309"/><rect x="43.5" y="36" width="12" height="7" rx="2" fill="#d97706"/>',
      front: '<path d="M45 30 Q41 41 45 53" stroke="#92400e" stroke-width="2.6" fill="none"/>' +
             '<ellipse cx="32" cy="20" rx="18.5" ry="3.6" fill="#c9a26a"/><path d="M21 20 Q22 9 32 9 Q42 9 43 20z" fill="#e7c88f"/><rect x="21.6" y="16" width="20.8" height="3" fill="#92400e"/>' },
    e15: { label: "たいようニコ", c1: "#fff7d6", c2: "#fdba74", st: "#f97316", back: sunRays },
    e16: { label: "でんせつニコ", noTuft: true,
      back: '<path d="M15 30 Q8 50 12 60 L52 60 Q56 50 49 30z" fill="#dc2626"/><path d="M15 30 Q11 46 14 58" stroke="#fca5a5" stroke-width="1.4" fill="none"/>',
      front: '<path d="M21 21 L23 10 L28 16 L32 7 L36 16 L41 10 L43 21z" fill="#fbbf24" stroke="#d97706" stroke-width="1" stroke-linejoin="round"/>' +
             '<circle cx="32" cy="17" r="1.8" fill="#ef4444"/><circle cx="25.5" cy="18.4" r="1.3" fill="#3b82f6"/><circle cx="38.5" cy="18.4" r="1.3" fill="#22c55e"/>' },
    e17: { label: "うちゅうニコ",
      front: '<circle cx="32" cy="35" r="27" fill="#bae6fd" fill-opacity=".22" stroke="#e0f2fe" stroke-width="2.6"/>' +
             '<path d="M15 22 Q21 13 30 11" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>' +
             '<path d="M32 8 V3" stroke="#94a3b8" stroke-width="1.6"/><circle cx="32" cy="3" r="2.2" fill="#f43f5e"/>' + star4(59, 10, 3) },
    e18: { label: "りゅうのニコ", noTuft: true,
      back: dragonWing + mirror(dragonWing),
      front: '<path d="M20 19 L15 5 L25.5 15z M44 19 L49 5 L38.5 15z" fill="#fde047" stroke="#ca8a04" stroke-width=".8" stroke-linejoin="round"/>' +
             hood("#4ade80") + '<path d="M27.5 15.5 l4.5 -6.5 l4.5 6.5z" fill="#22c55e"/>' +
             '<path d="M16 30 q2 -2 4 0 M44 30 q2 -2 4 0" stroke="#16a34a" stroke-width="1" fill="none"/>' },
    e19: { label: "まぼろしにじニコ", c1: "#ffffff", c2: "#fbcfe8", st: "#f0abfc", noTuft: true,
      defs: '<linearGradient id="nkHorn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#fef08a"/></linearGradient>',
      back: rainbowWing + mirror(rainbowWing),
      front: '<path d="M29 19 L32 4 L35 19z" fill="url(#nkHorn)" stroke="#f59e0b" stroke-width=".8"/><path d="M30 14.5 L34 13 M30.8 10.5 L33.2 9.6" stroke="#f59e0b" stroke-width=".8"/>' +
             star4(8, 50, 3.4, "#f9a8d4") + star4(57, 52, 3, "#a5f3fc") }
  };

  function eggList() { return window.GACHA_EGG_LIST || []; }
  function owns(id) { return !!(window.saveData && window.saveData.gachaEggs && window.saveData.gachaEggs[id]); }
  function idFromKey(key) {
    if (!key) return null;
    if (DEFS[key] || key === "e_ex_mochi") return key;
    if (key === "🐣") return owns("e01") ? "e01" : "default";
    var hit = eggList().filter(function (e) { return e.icon === key && e.type === "char"; })[0];
    return hit ? hit.id : null;
  }

  window.avatarSvg = function (key, mood) {
    var id = idFromKey(key);
    if (!id) return null;
    if (id === "e_ex_mochi") return (window.MASCOTS && window.MASCOTS.mochikunSvg) ? window.MASCOTS.mochikunSvg(mood) : null;
    var d = DEFS[id];
    if (!d) return null;
    d.k = id;
    return niko(d, mood || "normal");
  };
  // 絵文字 or イラスト を、そのまま innerHTML に入れられる形で返す（無ければ絵文字）
  window.avatarHtml = function (key, fallback, mood) {
    var svg = window.avatarSvg(key, mood);
    return svg || (fallback != null ? fallback : (key || ""));
  };
})();
