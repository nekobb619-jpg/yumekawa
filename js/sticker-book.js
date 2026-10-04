/* =====================================================================
   sticker-book.js — 🎀 シール帳（あつめる・はる・きせかえ・プレゼント）
   ★2026-10-04追加（保護者の 案。家の 毎週の シール表（おこづかい）とは べつもの＝つながない）
   - シールの ふくろ：学習を 1つ 終えると 1ふくろ。学習の 種類ごとに 1日 1ふくろまで（周回で ふえない）
       plan＝きょうのまなびプラン／stage＝ステージクリア／lab＝探偵ラボ／jigaku＝自学ノート
   - ふくろを あけると ★1〜★4 の シールが 1まい（絵は ぜんぶ オリジナルの SVG。他社の キャラクターは 使わない）
   - シール帳：3ページ。好きな 場所・大きさ・向きで はる（はった 分は 手もちから へる。はがすと もどる）
   - きせかえ：頭・顔・体・まわり の 4か所。まなびのなかま（相棒ごと）と アバターに つける。見た目だけで Q・正答率は 変わらない
   - プレゼント：りお・りさ・papa の 間で 1日 3まいまで。おくる 人の セーブに「だれに・何を」を 書き、
       うけとる 人の アプリが GAS の LOGIN（読むだけ）で それを 読んで うけとる。相手の セーブには 書きこまない。GAS の 変更なし
   - Q・pt・お金には 変えられない。記録は log_db の「🎀シール帳」
   - saveData：stickers{id:まい数}／stickerPacks／stickerDay{d,k{種類:1},g:おくった数}／stickerPages[3][{s,x,y,z,r}]／
               stickerWear{相棒id|"avatar":{head,face,body,around}}／stickerOut[{i,t,s,a}]／stickerSeen[id]
   - js/mascots.js・js/avatar-art.js より あとに 読みこむ（なかまの 絵に かざりを 重ねる ため）
   ===================================================================== */
(function () {
  "use strict";
  var K = "#1f1b2e", P = "#7c3aed", PL = "#a78bfa", PLL = "#c4b5fd", PK = "#f472b6", PKL = "#f9a8d4", G = "#fbbf24", GL = "#fde68a", W = "#fff";
  var FAMILY = ["りお", "りさ", "papa"], GIFT_PER_DAY = 3, PAGE_MAX = 24, OUT_MAX = 90, SEEN_MAX = 300;
  var RATES = [[1, 0.58], [2, 0.28], [3, 0.11], [4, 0.03]];
  var KINDS = { plan: "まなびプラン", stage: "ステージ", lab: "探偵ラボ", jigaku: "自学ノート" };

  /* ---------------- 絵の 部品（viewBox 0 0 40 40） ---------------- */
  function n(v) { return (Math.round(v * 10) / 10); }
  function H(cx, cy, s, f, st) {
    return '<path d="M' + cx + ' ' + n(cy + s * .9) + ' C' + n(cx - s * 1.35) + ' ' + n(cy - s * .05) + ' ' + n(cx - s * .65) + ' ' + n(cy - s * 1.15) + ' ' + cx + ' ' + n(cy - s * .35) +
      ' C' + n(cx + s * .65) + ' ' + n(cy - s * 1.15) + ' ' + n(cx + s * 1.35) + ' ' + n(cy - s * .05) + ' ' + cx + ' ' + n(cy + s * .9) + 'z" fill="' + f + '"' + (st ? ' stroke="' + st + '" stroke-width="1.5" stroke-linejoin="round"' : '') + '/>';
  }
  function S5(cx, cy, R, f, st) {
    var p = [];
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .46 : R; p.push(n(cx + Math.cos(a) * r) + " " + n(cy + Math.sin(a) * r)); }
    return '<path d="M' + p.join(" L") + 'z" fill="' + f + '"' + (st ? ' stroke="' + st + '" stroke-width="1.4" stroke-linejoin="round"' : '') + '/>';
  }
  function SP(cx, cy, r, f) { return '<path d="M' + cx + ' ' + (cy - r) + ' Q' + cx + ' ' + cy + ' ' + (cx + r) + ' ' + cy + ' Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy + r) + ' Q' + cx + ' ' + cy + ' ' + (cx - r) + ' ' + cy + ' Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy - r) + 'z" fill="' + f + '"/>'; }
  function C(cx, cy, r, f, st, sw) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '"' + (st ? ' stroke="' + st + '" stroke-width="' + (sw || 1.4) + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, f, st, rot) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (st ? ' stroke="' + st + '" stroke-width="1.4"' : '') + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '/>'; }
  function PA(d, f, st, sw, extra) { return '<path d="' + d + '" fill="' + (f || "none") + '"' + (st ? ' stroke="' + st + '" stroke-width="' + (sw || 1.4) + '" stroke-linecap="round" stroke-linejoin="round"' : '') + (extra || "") + '/>'; }
  function shine(x, y) { return E(x, y, 2.2, 1.2, W, null, -30).replace('fill="#fff"', 'fill="#fff" opacity=".75"'); }
  function blush(lx, rx, y) { return E(lx, y, 2.4, 1.5, PKL).replace("/>", ' opacity=".85"/>') + E(rx, y, 2.4, 1.5, PKL).replace("/>", ' opacity=".85"/>'); }
  function tag(text, bg, fg) { return '<rect x="2" y="12" width="36" height="16" rx="8" fill="' + bg + '" stroke="' + fg + '" stroke-width="1.4"/><text x="20" y="23.4" font-size="8.4" font-weight="900" text-anchor="middle" fill="' + fg + '" font-family="\'Zen Maru Gothic\',sans-serif">' + text + '</text>'; }
  function ribbon(c, d) { return PA("M17 22 L12 35 L18 31z M23 22 L28 35 L22 31z", c, d) + PA("M20 20 L6 11 Q4 20 6 29z M20 20 L34 11 Q36 20 34 29z", c, d) + C(20, 20, 4.4, c, d); }
  function catSit() {
    return PA("M27 33 Q37 33 34 23", null, K, 3) + PA("M12 36 Q11 22 20 21 Q29 22 28 36z", K) + E(20, 14, 8, 7, K) + PA("M13 11 L13.5 3 L19 8z M27 11 L26.5 3 L21 8z", K) +
      E(16.8, 14, 1.5, 1.9, GL) + E(23.2, 14, 1.5, 1.9, GL) + PA("M14.5 20.5 Q20 23.5 25.5 20.5", null, PL, 2) + C(20, 23, 1.4, G);
  }

  var ART = {
    h_purple: function () { return H(20, 20, 13, P) + shine(13, 14); },
    h_pink: function () { return H(20, 20, 13, PK) + shine(13, 14); },
    h_black: function () { return H(20, 20, 13, K) + shine(13, 14) + SP(31, 9, 3.4, PLL); },
    h_lav: function () { return H(20, 20, 13, "#ede9fe", P) + H(20, 20.5, 6, PL); },
    s_gold: function () { return S5(20, 21, 15, G, "#d97706") + shine(15, 15); },
    s_purple: function () { return S5(20, 21, 15, PL, P) + shine(15, 15); },
    spark: function () { return SP(20, 20, 15, PL) + SP(20, 20, 8, W) + SP(33, 8, 4, G) + SP(7, 32, 3, PK); },
    cloud: function () { return PA("M10 28 Q3 28 4 21 Q5 15 12 16 Q14 8 22 10 Q29 9 30 17 Q37 17 36 23 Q36 28 30 28z", W, PL, 1.6) + C(15, 22, 1.1, K) + C(25, 22, 1.1, K) + blush(12, 28, 24.5); },
    drop: function () { return PA("M20 5 Q31 20 29 27 Q27 35 20 35 Q13 35 11 27 Q9 20 20 5z", "#7dd3fc", "#0ea5e9", 1.5) + shine(15.5, 22); },
    note: function () { return PA("M16 9 L31 6 V26", null, P, 2.6) + PA("M16 9 V29", null, P, 2.6) + PA("M16 14 L31 11", null, P, 2.6) + E(12, 29, 5, 3.8, P, null, -20) + E(27, 26, 5, 3.8, P, null, -20); },
    flower: function () { var o = ""; for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; o += C(n(20 + Math.cos(a) * 9), n(20 + Math.sin(a) * 9), 7, PKL, PK); } return o + C(20, 20, 5.4, GL, "#f59e0b"); },
    clover: function () { return PA("M20 22 Q24 34 30 36", null, "#059669", 2.2) + H(20, 12, 6, "#6ee7b7", "#059669") + '<g transform="rotate(90 20 21)">' + H(20, 12, 6, "#6ee7b7", "#059669") + '</g><g transform="rotate(-90 20 21)">' + H(20, 12, 6, "#6ee7b7", "#059669") + '</g><g transform="rotate(180 20 21)">' + H(20, 12, 6, "#6ee7b7", "#059669") + '</g>'; },
    donut: function () { return C(20, 20, 15, "#fcd9a8", "#d6a05a") + PA("M7 19 Q8 7 20 6 Q32 7 33 19 Q30 24 26 21 Q22 26 18 22 Q13 26 7 19z", PKL, PK) + C(20, 20, 4.6, W, "#d6a05a") + PA("M12 13 l2 1 M26 11 l2 -1 M28 17 l1 2 M16 9 l1 -2", null, P, 1.6) + PA("M21 10 l2 1 M11 18 l1 -2", null, G, 1.6); },
    cherry: function () { return PA("M14 26 Q16 12 27 6 M27 28 Q26 14 27 6", null, "#059669", 2) + PA("M27 6 Q34 5 36 10 Q31 12 27 6z", "#6ee7b7", "#059669") + C(13, 28, 7, "#f43f5e", "#be123c") + C(27, 30, 7, "#f43f5e", "#be123c") + shine(10.5, 25) + shine(24.5, 27); },
    berry: function () { return PA("M20 36 Q7 26 8 16 Q12 9 20 11 Q28 9 32 16 Q33 26 20 36z", "#fb7185", "#be123c", 1.5) + PA("M12 11 Q16 5 20 9 Q24 5 28 11 Q24 13 20 11 Q16 13 12 11z", "#6ee7b7", "#059669") + PA("M14 19 v1.6 M20 17 v1.6 M26 19 v1.6 M17 25 v1.6 M23 25 v1.6 M20 30 v1.6", null, GL, 1.5); },
    t_sugoi: function () { return tag("すごい！", "#ede9fe", P); },
    t_yatta: function () { return tag("やったね", "#fce7f3", "#db2777"); },
    t_daisuki: function () { return tag("だいすき", K, GL) + H(34, 9, 3.2, PK); },

    rb_purple: function () { return ribbon(PL, P); },
    rb_black: function () { return ribbon(K, P) + C(20, 20, 2, PLL); },
    rb_pink: function () { return ribbon(PKL, "#db2777"); },
    moon: function () { return PA("M25 4 A16 16 0 1 0 36 29 A13 13 0 1 1 25 4z", GL, "#f59e0b", 1.5) + SP(31, 10, 3.6, PL) + SP(34, 20, 2.2, PK); },
    rainbow: function () { return PA("M6 28 A14 14 0 0 1 34 28", null, PK, 3) + PA("M9.5 28 A10.5 10.5 0 0 1 30.5 28", null, G, 3) + PA("M13 28 A7 7 0 0 1 27 28", null, PL, 3) + C(7, 29, 4.5, W, PLL) + C(12, 30, 3.6, W, PLL) + C(33, 29, 4.5, W, PLL) + C(28, 30, 3.6, W, PLL); },
    butterfly: function () { return PA("M20 20 Q8 4 4 14 Q3 22 20 22z M20 20 Q32 4 36 14 Q37 22 20 22z", PL, P) + PA("M20 22 Q9 24 10 32 Q16 34 20 24z M20 22 Q31 24 30 32 Q24 34 20 24z", PKL, "#db2777") + E(20, 22, 1.6, 7, K) + PA("M19 15 Q16 9 14 9 M21 15 Q24 9 26 9", null, K, 1.2); },
    ice: function () { return PA("M12 20 L20 37 L28 20z", "#fcd9a8", "#d6a05a") + PA("M15 24 l8 4 M18 30 l5 -8", null, "#d6a05a", 1) + C(20, 14, 10, PLL, P) + shine(15.5, 10) + C(26, 6, 2.6, "#f43f5e", "#be123c"); },
    paw: function () { return E(20, 27, 9, 7, P) + C(9, 17, 3.6, P) + C(16, 11, 3.9, P) + C(24, 11, 3.9, P) + C(31, 17, 3.6, P) + E(20, 28, 4.4, 3.2, PKL); },
    cat_face: function () { return PA("M8 18 L9 5 L18 12z M32 18 L31 5 L22 12z", K) + PA("M10.5 14.5 L11 9 L15 12z M29.5 14.5 L29 9 L25 12z", PKL) + E(20, 23, 14, 12, K) + E(14.5, 22, 2.4, 3, GL) + E(25.5, 22, 2.4, 3, GL) + E(14.5, 22, .8, 2.4, K) + E(25.5, 22, .8, 2.4, K) + PA("M19 26.5 h2 l-1 1.5z", PKL) + blush(10.5, 29.5, 27); },
    glasses: function () { return C(11, 20, 7, "rgba(196,181,253,.35)", P, 2.4) + C(29, 20, 7, "rgba(196,181,253,.35)", P, 2.4) + PA("M18 19 q2 -2 4 0", null, P, 2.2) + PA("M7 17 l3 -2 M25 17 l3 -2", null, W, 1.4); },
    bowtie: function () { return PA("M20 20 L7 12 Q5 20 7 28z M20 20 L33 12 Q35 20 33 28z", K, P) + C(20, 20, 4, PL, P); },
    halo: function () { return E(20, 20, 13, 5, "none", G).replace('stroke-width="1.4"', 'stroke-width="3"') + SP(34, 11, 3, GL) + SP(6, 12, 2.4, GL); },
    pearls: function () { var o = ""; for (var i = 0; i < 7; i++) { var t = i / 6, x = 5 + t * 30, y = 15 + Math.sin(t * Math.PI) * 9; o += C(n(x), n(y), 2.7, W, PLL, 1); } return o + H(20, 28, 4.2, P); },
    puppy_face: function () { return E(8, 23, 5, 9, PLL, P, 12) + E(32, 23, 5, 9, PLL, P, -12) + E(20, 21, 12.5, 12, W, P) + C(15.5, 20, 1.7, K) + C(24.5, 20, 1.7, K) + E(20, 24.5, 2.3, 1.7, K) + PA("M17.6 27.6 q2.4 2 4.8 0", null, K, 1.2) + blush(12.5, 27.5, 25) + H(20, 13.2, 2.4, PL); },
    orca_tail: function () { return PA("M20 31 Q18 19 6 12 Q15 9 20 16 Q25 9 34 12 Q22 19 20 31z", K) + PA("M2 31 q4.5 -5 9 0 t9 0 t9 0 t9 0", null, "#38bdf8", 2.4) + PA("M2 36 q4.5 -4 9 0 t9 0 t9 0 t9 0", null, "#7dd3fc", 2.2) + C(8, 22, 1.4, "#7dd3fc") + C(32, 21, 1.6, "#7dd3fc"); },
    hearts_ar: function () { return H(6, 8, 4, PK) + H(34, 9, 3.4, PL) + H(5, 31, 3.2, PL) + H(35, 31, 4, PK) + H(20, 4, 2.4, PKL); },

    cat_sit: function () { return catSit(); },
    cat_walk: function () { return PA("M8 22 Q2 18 5 9", null, K, 2.8) + E(18, 24, 11, 6, K) + PA("M10 27 v8 M15 28 v7 M22 28 v7 M27 26 v9", null, K, 2.8) + C(30, 17, 6.2, K) + PA("M25.5 14 L26 6.5 L30 11z M34.5 14 L35 6.5 L31 11z", K) + E(32.2, 17, 1.2, 1.6, GL) + PA("M24.5 21.5 Q29 24 33 21.5", null, PL, 1.8); },
    orca_jump: function () { return PA("M6 26 Q1 22 2 15 Q6 20 9 22z M6 26 Q2 30 4 36 Q8 31 10 28z", K) + PA("M6 26 Q10 8 28 10 Q37 12 35 20 Q30 30 14 30 Q9 30 6 26z", K) + PA("M12 28.5 Q24 28 33.5 21 Q29 30 14 30z", W) + PA("M18 11 Q20 2 25 4 Q23 8 24 11z", K) + E(28, 15.5, 3.2, 1.6, W, null, -15) + PA("M20 27 Q20 34 26 33 Q24 29 24 27z", K) + C(31, 34, 1.6, "#7dd3fc") + C(35, 30, 1.2, "#7dd3fc") + C(27, 37, 1.2, "#7dd3fc"); },
    orca_face: function () { return PA("M17 10 Q20 1 24 4 Q22 7 23 10z", K) + E(20, 22, 14, 13, K) + PA("M8 27 Q20 39 32 27 Q20 32 8 27z", W) + E(13, 17, 4, 2.2, W, null, -15) + E(27, 17, 4, 2.2, W, null, 15) + C(14, 23, 1.6, W) + C(26, 23, 1.6, W) + PA("M17.5 26.5 q2.5 2 5 0", null, W, 1.3) + blush(10, 30, 26); },
    puppy_sit: function () { return PA("M28 33 Q36 32 35 25", null, P, 2.4) + PA("M11 37 Q10 24 20 23 Q30 24 29 37z", W, P) + E(9.5, 16, 4, 7.5, PLL, P, 14) + E(30.5, 16, 4, 7.5, PLL, P, -14) + E(20, 15, 10, 9.5, W, P) + C(16.5, 14.5, 1.5, K) + C(23.5, 14.5, 1.5, K) + E(20, 18, 2, 1.5, K) + blush(13.5, 26.5, 19) + PA("M13.5 24 Q20 27 26.5 24", null, P, 2.2) + S5(20, 27.5, 2.6, G); },
    crown: function () { return PA("M6 30 L4 12 L13 20 L20 7 L27 20 L36 12 L34 30z", G, "#d97706", 1.5) + PA("M6 30 h28 v4 h-28z", GL, "#d97706", 1.5) + C(20, 24, 2.6, P) + C(11.5, 25.5, 1.8, PK) + C(28.5, 25.5, 1.8, PK) + C(4, 12, 1.8, PK) + C(20, 7, 1.8, PL) + C(36, 12, 1.8, PK); },
    cat_ears: function () { return PA("M5 31 Q20 13 35 31", null, K, 3) + PA("M7 23 L8 7 L18 15z M33 23 L32 7 L22 15z", K) + PA("M10 19.5 L10.6 11.5 L15.6 15.5z M30 19.5 L29.4 11.5 L24.4 15.5z", PKL); },
    scarf: function () { return PA("M26 25 L30 38 L23 37 L22 27z", P, "#5b21b6") + PA("M4 16 Q20 26 36 16 L36 23 Q20 33 4 23z", P, "#5b21b6") + PA("M10 20 v6 M16 22.5 v6 M30 20 v6", null, PLL, 1.6); },
    spark_fr: function () { return SP(6, 7, 5, G) + SP(35, 8, 3.6, PLL) + SP(5, 31, 3.4, PK) + SP(35, 32, 5, G) + SP(20, 3.5, 2.6, W) + C(12, 3, 1, GL) + C(30, 36, 1, GL) + C(2, 19, 1, PLL) + C(38, 20, 1, PKL); },
    gem: function () { return PA("M10 12 h20 l6 8 L20 36 L4 20z", PLL, P, 1.5) + PA("M4 20 h32 M10 12 l5 8 l5 -8 l5 8 l5 -8 M15 20 L20 36 L25 20", null, P, 1.1) + PA("M12 14 l2.5 4", null, W, 1.6) + SP(33, 8, 3.4, G); },
    shoot: function () { return PA("M4 34 L20 20 M9 36 L22 25 M3 27 L16 17", null, PLL, 2.2) + S5(27, 13, 10, G, "#d97706") + shine(24, 10); },
    star_shades: function () { return S5(11, 20, 8.6, K) + S5(29, 20, 8.6, K) + PA("M17 19 q3 -2 6 0", null, K, 2.2) + PA("M8 17.5 l2 -1.5 M26 17.5 l2 -1.5", null, W, 1.3); },
    mona: function () { return PA("M26 9 L33 5 Q34 10 31 13z M26 9 L20 4 Q18 9 21 12z", PKL, "#db2777") + C(26, 9.5, 2.2, PK) + E(20, 23, 15, 12.5, W, "#d9d2e3") + C(14, 21.5, 2.6, K) + C(26, 21.5, 2.6, K) + C(15, 20.4, 1, W) + C(27, 20.4, 1, W) + E(20, 25.5, 1.9, 1.4, K) + PA("M17.6 28 q2.4 1.9 4.8 0", null, K, 1.2) + E(10.5, 26, 3.4, 2.2, "#fb7185").replace("/>", ' opacity=".8"/>') + E(29.5, 26, 3.4, 2.2, "#fb7185").replace("/>", ' opacity=".8"/>'); },

    cat_moon: function () { return PA("M25 3 A17 17 0 1 0 37 29 A14 14 0 1 1 25 3z", GL, "#f59e0b", 1.5) + '<g transform="translate(5 9.5) scale(.6)">' + catSit() + '</g>' + SP(32, 9, 3.6, PL) + SP(35, 19, 2.2, W) + SP(28, 16, 1.8, PK); },
    tiara: function () { return PA("M5 29 Q20 17 35 29", null, PLL, 3.2) + PA("M10 24 L12 15 L16 21 M30 24 L28 15 L24 21", PLL, P, 1.2) + PA("M16 21 L20 6 L24 21z", "#ede9fe", P, 1.3) + H(20, 15, 3.6, PK) + C(12, 15, 1.6, G) + C(28, 15, 1.6, G) + SP(20, 4.5, 2.6, G) + SP(33, 12, 2.2, W) + SP(7, 12, 2.2, W); },
    wings: function () { var o = ""; [[0, 1], [40, -1]].forEach(function (s) { var x = s[0], d = s[1]; o += PA("M" + (x + d * 10) + " 24 Q" + (x + d * 1) + " 20 " + (x + d * 2) + " 9 Q" + (x + d * 8) + " 12 " + (x + d * 11) + " 18z", W, PLL, 1.3) + PA("M" + (x + d * 10) + " 27 Q" + (x + d * 2) + " 27 " + (x + d * 1) + " 19 Q" + (x + d * 7) + " 20 " + (x + d * 11) + " 23z", W, PLL, 1.3) + PA("M" + (x + d * 10) + " 30 Q" + (x + d * 4) + " 33 " + (x + d * 2) + " 27 Q" + (x + d * 7) + " 26 " + (x + d * 11) + " 27z", W, PLL, 1.3); }); return o + SP(20, 4, 2.4, G); },
    rainbow_ar: function () { return PA("M2.5 24 A17.5 17.5 0 0 1 37.5 24", null, PK, 1.8) + PA("M4.3 24 A15.7 15.7 0 0 1 35.7 24", null, G, 1.8) + PA("M2.5 24 A17.5 17.5 0 0 0 37.5 24", null, PL, 1.8) + PA("M4.3 24 A15.7 15.7 0 0 0 35.7 24", null, "#7dd3fc", 1.8) + SP(20, 4, 3, W) + SP(4, 9, 2.6, G) + SP(36, 9, 2.6, G) + SP(5, 36, 2.4, PK) + SP(35, 36, 2.4, PL); }
  };
  var NAMES = {
    h_purple: ["むらさきの ハート", 1], h_pink: ["ピンクの ハート", 1], h_black: ["くろい ハート", 1], h_lav: ["ふたえの ハート", 1], s_gold: ["きんの ほし", 1], s_purple: ["むらさきの ほし", 1], spark: ["キラキラ", 1],
    cloud: ["くもさん", 1], drop: ["しずく", 1], note: ["おんぷ", 1], flower: ["おはな", 1], clover: ["よつばの クローバー", 1], donut: ["ドーナツ", 1], cherry: ["さくらんぼ", 1], berry: ["いちご", 1],
    t_sugoi: ["「すごい！」", 1], t_yatta: ["「やったね」", 1], t_daisuki: ["「だいすき」", 1],
    rb_purple: ["むらさきの リボン", 2, "head"], rb_black: ["くろい リボン", 2, "head"], rb_pink: ["ピンクの リボン", 2, "head"], moon: ["みかづき", 2], rainbow: ["にじ", 2], butterfly: ["ちょうちょ", 2], ice: ["アイスクリーム", 2], paw: ["にくきゅう", 2],
    cat_face: ["くろねこの かお", 2], glasses: ["まるめがね", 2, "face"], bowtie: ["ちょうネクタイ", 2, "body"], halo: ["てんしの わっか", 2, "head"], pearls: ["パールの ネックレス", 2, "body"], puppy_face: ["しろい こいぬの かお", 2], orca_tail: ["シャチの しっぽ", 2], hearts_ar: ["ハートの まわり", 2, "around"],
    cat_sit: ["おすわり くろねこ", 3], cat_walk: ["おさんぽ くろねこ", 3], orca_jump: ["ジャンプする シャチ", 3], orca_face: ["シャチの かお", 3], puppy_sit: ["おすわり こいぬ", 3], crown: ["おうかん", 3, "head"], cat_ears: ["ねこみみ", 3, "head"],
    scarf: ["むらさきの マフラー", 3, "body"], spark_fr: ["キラキラの まわり", 3, "around"], gem: ["ほうせき", 3], shoot: ["ながれぼし", 3], star_shades: ["ほしの サングラス", 3, "face"], mona: ["モナちゃん", 3],
    cat_moon: ["月と くろねこ", 4], tiara: ["ティアラ", 4, "head"], wings: ["てんしの はね", 4, "around"], rainbow_ar: ["にじの オーラ", 4, "around"]
  };
  var LIST = Object.keys(NAMES).map(function (id) { return { id: id, name: NAMES[id][0], r: NAMES[id][1], wear: NAMES[id][2] || null, art: ART[id] }; });
  var BY = {}; LIST.forEach(function (s) { BY[s.id] = s; });
  var SLOTS = [["head", "あたま"], ["face", "かお"], ["body", "からだ"], ["around", "まわり"]];
  var TF = { head: "translate(19 -1) scale(.55)", face: "translate(15.6 21.5) scale(.72)", body: "translate(18 41) scale(.6)", around: "scale(1.6)" };
  function svg(id, px) { var s = BY[id]; return s ? '<svg viewBox="0 0 40 40" width="' + (px || 40) + '" height="' + (px || 40) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + s.name + '">' + s.art() + '</svg>' : ""; }

  /* ---------------- データ ---------------- */
  function sd() { return window.saveData || {}; }
  function ensure() {
    var d = sd();
    if (!d.stickers || typeof d.stickers !== "object") d.stickers = {};
    d.stickerPacks = Number(d.stickerPacks || 0);
    if (!Array.isArray(d.stickerPages)) d.stickerPages = [[], [], []];
    while (d.stickerPages.length < 3) d.stickerPages.push([]);
    if (!d.stickerWear || typeof d.stickerWear !== "object") d.stickerWear = {};
    if (!Array.isArray(d.stickerOut)) d.stickerOut = [];
    if (!Array.isArray(d.stickerSeen)) d.stickerSeen = [];
    var t = today();
    if (!d.stickerDay || d.stickerDay.d !== t) d.stickerDay = { d: t, k: {}, g: 0 };
    if (!d.stickerDay.k) d.stickerDay.k = {};
    return d;
  }
  function today() { var x = new Date(window.currentServerTime || Date.now()); return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate(); }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet && window.saveData) window.syncWithGoogleSpreadsheet("LOG", { stage: "🎀シール帳", msg: msg }); } catch (e) {} }
  function save() { if (window.saveGame) window.saveGame(); }
  function owned(id) { return Number(ensure().stickers[id] || 0); }
  function placed(id) { var c = 0; ensure().stickerPages.forEach(function (p) { p.forEach(function (x) { if (x.s === id) c++; }); }); return c; }
  function free(id) { return Math.max(0, owned(id) - placed(id)); }
  function totalOwned() { var d = ensure(), c = 0; Object.keys(d.stickers).forEach(function (k) { if (BY[k] && d.stickers[k] > 0) c++; }); return c; }
  function toast(html) {
    var t = document.createElement("div");
    t.style.cssText = "position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:10001;background:#1f1b2e;color:#fff;border:2px solid #a78bfa;border-radius:999px;padding:9px 16px;font:900 13px 'Zen Maru Gothic',sans-serif;box-shadow:0 6px 18px rgba(31,27,46,.35);max-width:92vw;text-align:center;";
    t.innerHTML = html; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }

  /* ---------------- ふくろを もらう・あける ---------------- */
  // kind：plan／stage／lab／jigaku。同じ 日に 同じ 種類で 2ふくろ目は 出ない（周回で ふえない）
  window.grantStickerPack = function (kind, why) {
    if (!window.saveData || !KINDS[kind]) return false;
    var d = ensure();
    if (d.stickerDay.k[kind]) return false;
    d.stickerDay.k[kind] = 1; d.stickerPacks += 1;
    log("ふくろ +1（" + KINDS[kind] + (why ? "：" + why : "") + "） 所持" + d.stickerPacks);
    toast("🎀 シールの ふくろを 1つ もらったよ（" + KINDS[kind] + "）");
    return true;
  };
  function roll() {
    var r = Math.random(), acc = 0, rar = 1;
    for (var i = 0; i < RATES.length; i++) { acc += RATES[i][1]; if (r < acc) { rar = RATES[i][0]; break; } }
    var pool = LIST.filter(function (s) { return s.r === rar; });
    return pool[Math.floor(Math.random() * pool.length)];
  }
  window.openStickerPack = function () {
    var d = ensure();
    if (d.stickerPacks < 1) { toast("ふくろが ないよ。学習を 1つ 終えると もらえるよ"); return; }
    d.stickerPacks -= 1;
    var s = roll(), isNew = !d.stickers[s.id];
    d.stickers[s.id] = (d.stickers[s.id] || 0) + 1;
    save(); log("あけた ★" + s.r + " " + s.name + (isNew ? " NEW" : "") + " 所持" + d.stickers[s.id] + "まい のこり" + d.stickerPacks + "ふくろ");
    reveal(s, isNew);
  };
  function reveal(s, isNew) {
    var old = document.getElementById("stk-reveal"); if (old) old.remove();
    var w = document.createElement("div"); w.id = "stk-reveal";
    w.style.cssText = "position:fixed;inset:0;z-index:10002;background:rgba(31,27,46,.72);display:flex;align-items:center;justify-content:center;padding:16px;";
    w.innerHTML = '<div class="stk-rv r' + s.r + '"><div class="stk-rv-art">' + svg(s.id, 150) + '</div><div class="stk-rv-star">' + "★★★★".slice(0, s.r) + '</div>' +
      '<div class="stk-rv-name">' + s.name + '</div><div class="stk-rv-sub">' + (isNew ? "あたらしい シール！" : "もう 1まい ふえたよ（プレゼントに できる）") + (s.wear ? "<br>きせかえに 使えるよ" : "") + '</div>' +
      '<button type="button" class="stk-btn" id="stk-rv-ok">やったね</button></div>';
    document.body.appendChild(w);
    document.getElementById("stk-rv-ok").onclick = function () { w.remove(); render(); };
    if (window.speakText) { try { window.speakText(isNew ? "あたらしい シール！" : "シール ゲット！", "ja-JP"); } catch (e) {} }
  }

  /* ---------------- きせかえ：なかまと アバターの 絵に 重ねる ---------------- */
  function wearSvg(key) {
    var w = (sd().stickerWear || {})[key]; if (!w) return "";
    var out = "";
    ["around", "body", "face", "head"].forEach(function (slot) { var s = BY[w[slot]]; if (s && s.wear === slot && owned(s.id) > 0) out += '<g transform="' + TF[slot] + '">' + s.art() + '</g>'; });
    return out;
  }
  function deco(str, key) { if (!str || typeof str !== "string") return str; var o = wearSvg(key); return o ? str.replace(/<\/svg>\s*$/, o + "</svg>") : str; }
  function installWear() {
    if (window.MASCOTS && Array.isArray(window.MASCOTS.list)) window.MASCOTS.list.forEach(function (f) {
      if (f._stkWrapped || typeof f.svg !== "function") return;
      var orig = f.svg; f.svg = function (m) { return deco(orig(m), f.id); }; f._stkWrapped = true;
    });
    if (typeof window.avatarSvg === "function" && !window.avatarSvg._stkWrapped) {
      var a = window.avatarSvg, w = function () { return deco(a.apply(this, arguments), "avatar"); }; w._stkWrapped = true; window.avatarSvg = w;
    }
  }
  function friends() { return (window.MASCOTS && window.MASCOTS.list) || []; }
  function curFriend() { var nm = window.MASCOTS && window.MASCOTS.currentName ? window.MASCOTS.currentName() : ""; return friends().filter(function (f) { return f.name === nm; })[0] || friends()[0]; }

  /* ---------------- 画面 ---------------- */
  var ui = { tab: "book", page: 0, sel: -1, target: "friend", giftTo: "", giftPick: "", inbox: null, busy: false };
  var CSS = '#stk-modal{position:fixed;inset:0;z-index:9998;background:rgba(31,27,46,.55);display:flex;align-items:center;justify-content:center;padding:10px;font-family:"Zen Maru Gothic",sans-serif}' +
    '#stk-modal .stk-box{background:linear-gradient(165deg,#fff,#f5f3ff);border-radius:24px;padding:12px 12px 14px;max-width:430px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 10px 0 rgba(124,58,237,.28);color:#3b2f52}' +
    '.stk-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.stk-head h2{font-size:18px;font-weight:900;color:#5b21b6;margin:0;flex:1}' +
    '.stk-x{border:none;background:#ede9fe;color:#5b21b6;font:900 14px "Zen Maru Gothic";border-radius:999px;padding:7px 14px;cursor:pointer}' +
    '.stk-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px}.stk-tabs button{border:2px solid #ddd6fe;background:#fff;color:#6d28d9;font:900 12px "Zen Maru Gothic";border-radius:14px;padding:8px 2px;cursor:pointer}' +
    '.stk-tabs button[aria-pressed="true"]{background:#1f1b2e;color:#fde68a;border-color:#1f1b2e}' +
    '.stk-btn{border:none;border-radius:999px;padding:10px 20px;font:900 14px "Zen Maru Gothic";color:#fff;background:linear-gradient(135deg,#7c3aed,#db2777);box-shadow:0 4px 0 #4c1d95;cursor:pointer}.stk-btn[disabled]{background:#cbd5e1;box-shadow:none;cursor:default}' +
    '.stk-mini{border:2px solid #ddd6fe;background:#fff;color:#5b21b6;font:900 12px "Zen Maru Gothic";border-radius:999px;padding:6px 11px;cursor:pointer}.stk-mini[aria-pressed="true"]{background:#7c3aed;color:#fff;border-color:#7c3aed}.stk-mini.img[aria-pressed="true"]{background:#fff;border-color:#db2777;box-shadow:0 0 0 3px #fbcfe8}' +
    '.stk-note{font-size:11.5px;font-weight:700;color:#6b5a85;line-height:1.6}' +
    '.stk-page{position:relative;width:100%;aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:3px solid #c4b5fd;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.stk-page.p0{background:radial-gradient(#ddd6fe 1.4px,transparent 1.6px) 0 0/18px 18px,#faf5ff}.stk-page.p1{background:radial-gradient(#fde68a 1px,transparent 1.3px) 6px 9px/34px 34px,radial-gradient(#fff 1px,transparent 1.2px) 20px 24px/46px 46px,linear-gradient(170deg,#1f1b2e,#4c1d95)}.stk-page.p2{background:repeating-linear-gradient(135deg,#fdf2f8 0 14px,#fff 14px 28px)}' +
    '.stk-it{position:absolute;transform-origin:center;cursor:grab;touch-action:none;filter:drop-shadow(0 2px 2px rgba(31,27,46,.28))}.stk-it svg{width:100%;height:100%;display:block;pointer-events:none}.stk-it.sel{outline:2px dashed #db2777;outline-offset:2px;border-radius:10px}' +
    '.stk-tray{display:flex;gap:6px;overflow-x:auto;padding:8px 2px 4px}.stk-tray button{flex:0 0 auto;position:relative;border:2px solid #ddd6fe;background:#fff;border-radius:14px;padding:4px;cursor:pointer;line-height:0}.stk-tray .cnt,.stk-grid .cnt{position:absolute;right:-4px;top:-6px;background:#1f1b2e;color:#fde68a;font:900 10px "Zen Maru Gothic";border-radius:999px;padding:2px 6px;line-height:1.2}' +
    '.stk-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.stk-grid .c{position:relative;border:2px solid #ede9fe;background:#fff;border-radius:14px;padding:5px 3px 4px;text-align:center}.stk-grid .c.no svg{filter:brightness(0) opacity(.13)}.stk-grid .nm{font-size:9.5px;font-weight:800;color:#5b4b73;line-height:1.25;margin-top:2px;min-height:2.4em}' +
    '.stk-grid .c.r2{border-color:#bfdbfe}.stk-grid .c.r3{border-color:#fde68a}.stk-grid .c.r4{border-color:#f0abfc;background:linear-gradient(160deg,#fff,#fdf4ff)}.stk-grid .c.pick{border-color:#db2777;box-shadow:0 0 0 2px #fbcfe8}' +
    '.stk-h{font-size:13px;font-weight:900;color:#5b21b6;margin:12px 2px 6px}.stk-prev{display:flex;justify-content:center;background:linear-gradient(160deg,#ede9fe,#fce7f3);border-radius:18px;padding:8px}.stk-prev svg{width:150px;height:150px}' +
    '.stk-rv{background:linear-gradient(160deg,#fff,#f5f3ff);border-radius:26px;padding:20px 18px;max-width:320px;width:100%;text-align:center;border:4px solid #ddd6fe;animation:stkPop .45s ease-out}.stk-rv.r2{border-color:#93c5fd}.stk-rv.r3{border-color:#fbbf24;box-shadow:0 0 30px rgba(251,191,36,.5)}.stk-rv.r4{border-color:#e879f9;box-shadow:0 0 44px rgba(232,121,249,.7)}' +
    '.stk-rv-star{color:#f59e0b;font-weight:900;font-size:16px}.stk-rv-name{font-size:19px;font-weight:900;color:#5b21b6;margin:2px 0}.stk-rv-sub{font-size:12px;font-weight:800;color:#6b5a85;margin-bottom:12px;line-height:1.6}' +
    '@keyframes stkPop{0%{transform:scale(.4) rotate(-8deg);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}';
  function close() { var m = document.getElementById("stk-modal"); if (m) m.remove(); if (window.renderTutorPlan) { try { window.renderTutorPlan(); } catch (e) {} } }
  window.closeStickerBook = close;
  window.openStickerBook = function (tab) {
    if (!window.saveData) return;
    ensure(); installWear();
    if (!document.getElementById("stk-css")) { var st = document.createElement("style"); st.id = "stk-css"; st.textContent = CSS; document.head.appendChild(st); }
    close();
    var m = document.createElement("div"); m.id = "stk-modal";
    m.innerHTML = '<div class="stk-box"><div class="stk-head"><h2>🎀 シール帳</h2><button type="button" class="stk-x" data-a="close">とじる</button></div>' +
      '<div class="stk-tabs" role="group" aria-label="シール帳の ページ"></div><div id="stk-body"></div></div>';
    m.addEventListener("click", function (e) { if (e.target === m) { close(); return; } var b = e.target.closest("[data-a]"); if (b) act(b.getAttribute("data-a"), b.getAttribute("data-v"), b); });
    document.body.appendChild(m);
    ui.tab = tab || (sd().stickerPacks > 0 ? "get" : "book"); ui.sel = -1;
    render();
  };
  function tabsHtml() {
    var d = ensure();
    return [["book", "📖 はる"], ["get", "🎁 あつめる" + (d.stickerPacks ? "（" + d.stickerPacks + "）" : "")], ["wear", "👗 きせかえ"], ["gift", "💌 プレゼント"]].map(function (t) {
      return '<button type="button" data-a="tab" data-v="' + t[0] + '" aria-pressed="' + (ui.tab === t[0]) + '">' + t[1] + '</button>';
    }).join("");
  }
  function render() {
    var m = document.getElementById("stk-modal"); if (!m) return;
    m.querySelector(".stk-tabs").innerHTML = tabsHtml();
    var body = document.getElementById("stk-body");
    body.innerHTML = ui.tab === "book" ? bookHtml() : ui.tab === "get" ? getHtml() : ui.tab === "wear" ? wearHtml() : giftHtml();
    if (ui.tab === "book") bindPage();
  }

  /* ---- はる ---- */
  function bookHtml() {
    var d = ensure(), pg = d.stickerPages[ui.page] || [];
    var items = pg.map(function (x, i) {
      var sz = 20 * (x.z || 1);
      return '<div class="stk-it' + (i === ui.sel ? " sel" : "") + '" data-i="' + i + '" style="left:' + x.x + '%;top:' + x.y + '%;width:' + sz + '%;aspect-ratio:1;transform:translate(-50%,-50%) rotate(' + (x.r || 0) + 'deg)">' + svg(x.s, 60) + '</div>';
    }).join("");
    var tray = LIST.filter(function (s) { return free(s.id) > 0; }).map(function (s) { return '<button type="button" data-a="place" data-v="' + s.id + '" aria-label="' + s.name + 'を はる">' + svg(s.id, 44) + '<span class="cnt">' + free(s.id) + '</span></button>'; }).join("");
    var tools = ui.sel >= 0 && pg[ui.sel] ? '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px">' +
      '<button type="button" class="stk-mini" data-a="big">大きく</button><button type="button" class="stk-mini" data-a="small">小さく</button><button type="button" class="stk-mini" data-a="rot">まわす</button><button type="button" class="stk-mini" data-a="front">いちばん 上へ</button><button type="button" class="stk-mini" data-a="peel">はがす</button></div>'
      : '<div class="stk-note" style="text-align:center;margin-top:8px">下の シールを おすと ページに 出るよ。ゆびで 動かして、おすと えらべる。</div>';
    return '<div style="display:flex;gap:6px;justify-content:center;margin-bottom:8px">' + [0, 1, 2].map(function (i) { return '<button type="button" class="stk-mini" data-a="page" data-v="' + i + '" aria-pressed="' + (ui.page === i) + '">' + ["ゆめ", "よぞら", "しましま"][i] + '（' + (d.stickerPages[i] || []).length + '）</button>'; }).join("") + '</div>' +
      '<div class="stk-page p' + ui.page + '" id="stk-page">' + items + '</div>' + tools +
      '<div class="stk-h">手もちの シール</div>' + (tray ? '<div class="stk-tray">' + tray + '</div>' : '<div class="stk-note">はれる シールが ないよ。「あつめる」で ふくろを あけよう。</div>');
  }
  function bindPage() {
    var page = document.getElementById("stk-page"); if (!page) return;
    var drag = null;
    page.onpointerdown = function (e) {
      var it = e.target.closest(".stk-it");
      if (!it) { if (ui.sel !== -1) { ui.sel = -1; render(); } return; }
      var i = Number(it.getAttribute("data-i")), rc = page.getBoundingClientRect(), x = ensure().stickerPages[ui.page][i];
      drag = { i: i, el: it, rc: rc, moved: false, dx: e.clientX - (rc.left + rc.width * x.x / 100), dy: e.clientY - (rc.top + rc.height * x.y / 100) };
      try { page.setPointerCapture(e.pointerId); } catch (er) {}
      e.preventDefault();
    };
    page.onpointermove = function (e) {
      if (!drag) return;
      var x = ensure().stickerPages[ui.page][drag.i]; if (!x) return;
      var nx = Math.max(4, Math.min(96, (e.clientX - drag.dx - drag.rc.left) / drag.rc.width * 100)), ny = Math.max(4, Math.min(96, (e.clientY - drag.dy - drag.rc.top) / drag.rc.height * 100));
      if (Math.abs(nx - x.x) + Math.abs(ny - x.y) > 0.6) drag.moved = true;
      x.x = Math.round(nx * 10) / 10; x.y = Math.round(ny * 10) / 10; drag.el.style.left = x.x + "%"; drag.el.style.top = x.y + "%";
    };
    page.onpointerup = page.onpointercancel = function () {
      if (!drag) return;
      var i = drag.i, moved = drag.moved; drag = null;
      if (moved) save();
      if (ui.sel !== i) { ui.sel = i; render(); }
    };
  }

  /* ---- あつめる ---- */
  function getHtml() {
    var d = ensure(), k = d.stickerDay.k;
    var kinds = Object.keys(KINDS).map(function (id) { return '<span class="stk-mini" style="cursor:default;' + (k[id] ? "background:#ede9fe;" : "") + '">' + (k[id] ? "✓ " : "") + KINDS[id] + '</span>'; }).join(" ");
    var grid = LIST.map(function (s) { var c = owned(s.id); return '<div class="c r' + s.r + (c ? "" : " no") + '">' + svg(s.id, 46) + (c ? '<span class="cnt">' + c + '</span>' : '') + '<div class="nm">' + (c ? s.name : "？？？") + '<br>' + "★★★★".slice(0, s.r) + '</div></div>'; }).join("");
    return '<div style="text-align:center;background:linear-gradient(135deg,#1f1b2e,#4c1d95);border-radius:18px;padding:14px;color:#fff">' +
      '<div style="font-size:15px;font-weight:900;color:#fde68a">🎁 シールの ふくろ：' + d.stickerPacks + 'つ</div>' +
      '<div style="margin:10px 0"><button type="button" class="stk-btn" data-a="open"' + (d.stickerPacks ? "" : " disabled") + '>ふくろを あける</button></div>' +
      '<div style="font-size:11px;font-weight:700;line-height:1.7;color:#ddd6fe">学習を 1つ 終えると 1ふくろ。同じ 種類は 1日 1ふくろまで。<br>今日 もらった もの：</div><div style="margin-top:6px;display:flex;gap:5px;justify-content:center;flex-wrap:wrap">' + kinds + '</div></div>' +
      '<div class="stk-h">シール ずかん（' + totalOwned() + '／' + LIST.length + '）</div><div class="stk-grid">' + grid + '</div>';
  }

  /* ---- きせかえ ---- */
  function wearKey() { return ui.target === "avatar" ? "avatar" : (curFriend() ? curFriend().id : ""); }
  function wearHtml() {
    var d = ensure(), f = curFriend(), key = wearKey(), w = d.stickerWear[key] || {};
    var prev = ui.target === "avatar" ? (typeof window.avatarSvg === "function" ? (window.avatarSvg(d.selectedAvatar, "happy") || "") : "") : (f ? f.svg("happy") : "");
    var slots = SLOTS.map(function (sl) {
      var opts = LIST.filter(function (s) { return s.wear === sl[0] && owned(s.id) > 0; });
      return '<div class="stk-h">' + sl[1] + '</div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
        '<button type="button" class="stk-mini" data-a="wear" data-v="' + sl[0] + ':" aria-pressed="' + (!w[sl[0]]) + '">なし</button>' +
        (opts.length ? opts.map(function (s) { return '<button type="button" class="stk-mini img" style="padding:3px 6px;line-height:0" data-a="wear" data-v="' + sl[0] + ':' + s.id + '" aria-pressed="' + (w[sl[0]] === s.id) + '" aria-label="' + s.name + '">' + svg(s.id, 38) + '</button>'; }).join("") : '<span class="stk-note">まだ もって いないよ</span>') + '</div>';
    }).join("");
    return '<div style="display:flex;gap:6px;justify-content:center;margin-bottom:8px"><button type="button" class="stk-mini" data-a="target" data-v="friend" aria-pressed="' + (ui.target === "friend") + '">なかま（' + (f ? f.name : "") + '）</button><button type="button" class="stk-mini" data-a="target" data-v="avatar" aria-pressed="' + (ui.target === "avatar") + '">アバター</button></div>' +
      (prev ? '<div class="stk-prev">' + prev + '</div>' : '<div class="stk-note" style="text-align:center;padding:14px">この アバターは 絵が ないので かざれないよ。なかまを かざって みよう。</div>') +
      '<div class="stk-note" style="text-align:center;margin-top:6px">かざりは 見た目だけ。なかまごとに おぼえるよ。</div>' + slots;
  }

  /* ---- プレゼント ---- */
  function me() { return window.playerId || ""; }
  function others() { return FAMILY.indexOf(me()) >= 0 ? FAMILY.filter(function (x) { return x !== me(); }) : [me()]; } // 家族 いがい（テスト用）は 自分あてだけ
  function giftHtml() {
    var d = ensure(), left = Math.max(0, GIFT_PER_DAY - (d.stickerDay.g || 0)), os = others();
    if (!ui.giftTo || os.indexOf(ui.giftTo) < 0) ui.giftTo = os[0];
    var can = LIST.filter(function (s) { return free(s.id) > 0; });
    var grid = can.map(function (s) { return '<button type="button" class="c r' + s.r + (ui.giftPick === s.id ? " pick" : "") + '" style="cursor:pointer;font:inherit" data-a="gpick" data-v="' + s.id + '" aria-pressed="' + (ui.giftPick === s.id) + '">' + svg(s.id, 44) + '<span class="cnt">' + free(s.id) + '</span><div class="nm">' + s.name + '</div></button>'; }).join("");
    var inbox = ui.inbox === null ? '<button type="button" class="stk-mini" data-a="check"' + (ui.busy ? " disabled" : "") + '>' + (ui.busy ? "たしかめて います…" : "とどいて いるか たしかめる") + '</button>'
      : ui.inbox.length ? ui.inbox.map(function (o) { return '<div style="display:flex;align-items:center;gap:8px;background:#fff;border:2px solid #fbcfe8;border-radius:14px;padding:6px 10px;margin-top:6px">' + svg(o.s, 40) + '<div style="font-size:12.5px;font-weight:900">' + esc(o.from) + ' から「' + BY[o.s].name + '」が とどいたよ</div></div>'; }).join("")
        : '<div class="stk-note">今は とどいて いないよ。</div>';
    var sent = d.stickerOut.slice(-5).reverse().map(function (o) { return BY[o.s] ? '<span class="stk-mini" style="cursor:default;padding:3px 8px">' + esc(o.t) + ' へ ' + BY[o.s].name + '</span>' : ""; }).join(" ");
    return '<div class="stk-h" style="margin-top:2px">📬 とどいた プレゼント</div>' + inbox +
      '<div class="stk-h">💌 おくる（今日は あと ' + left + 'まい）</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' + os.map(function (o) { return '<button type="button" class="stk-mini" data-a="gto" data-v="' + esc(o) + '" aria-pressed="' + (ui.giftTo === o) + '">' + esc(o) + ' へ</button>'; }).join("") + '</div>' +
      (can.length ? '<div class="stk-grid">' + grid + '</div>' : '<div class="stk-note">おくれる シールが ないよ（ページに はった 分は おくれない）。</div>') +
      '<div style="text-align:center;margin-top:10px"><button type="button" class="stk-btn" data-a="send"' + (ui.giftPick && left > 0 && free(ui.giftPick) > 0 ? "" : " disabled") + '>' + (ui.giftPick && BY[ui.giftPick] ? "「" + BY[ui.giftPick].name + "」を " : "") + 'おくる</button></div>' +
      '<div class="stk-note" style="margin-top:8px">おくった シールは 手もちから 1まい へる。相手が シール帳の「プレゼント」を 開くと とどくよ。</div>' +
      (sent ? '<div class="stk-h">さいきん おくった もの</div><div style="display:flex;gap:5px;flex-wrap:wrap">' + sent + '</div>' : '');
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function sendGift() {
    var d = ensure(), id = ui.giftPick, to = ui.giftTo;
    if (!BY[id] || others().indexOf(to) < 0 || free(id) < 1 || (d.stickerDay.g || 0) >= GIFT_PER_DAY) return;
    d.stickers[id] -= 1; if (d.stickers[id] <= 0) { delete d.stickers[id]; Object.keys(d.stickerWear).forEach(function (k) { SLOTS.forEach(function (sl) { if (d.stickerWear[k][sl[0]] === id) delete d.stickerWear[k][sl[0]]; }); }); }
    d.stickerDay.g = (d.stickerDay.g || 0) + 1;
    d.stickerOut.push({ i: me() + "-" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), t: to, s: id, a: today() });
    if (d.stickerOut.length > OUT_MAX) d.stickerOut = d.stickerOut.slice(-OUT_MAX);
    save(); log("おくった → " + to + "：★" + BY[id].r + " " + BY[id].name + " のこり" + (d.stickers[id] || 0) + "まい");
    ui.giftPick = ""; toast("💌 " + esc(to) + " へ「" + BY[id].name + "」を おくったよ"); render();
  }
  // ほかの 人の セーブは 読むだけ（GAS の LOGIN は 読み取り専用）。書きこむのは 自分の セーブだけ
  function checkInbox() {
    if (ui.busy || typeof window.postToGAS !== "function") { if (typeof window.postToGAS !== "function") { ui.inbox = []; render(); } return; }
    ui.busy = true; render();
    var my = me(), got = [];
    others().reduce(function (p, who) {
      return p.then(function () { return window.postToGAS({ action: "LOGIN", playerId: who }); }).then(function (res) {
        var out = res && res.status === "SUCCESS" && res.playerData && Array.isArray(res.playerData.stickerOut) ? res.playerData.stickerOut : [];
        var d = ensure();
        out.forEach(function (o) {
          if (!o || o.t !== my || !BY[o.s] || d.stickerSeen.indexOf(o.i) >= 0) return;
          d.stickers[o.s] = (d.stickers[o.s] || 0) + 1; d.stickerSeen.push(o.i); got.push({ from: who, s: o.s });
          log("うけとった ← " + who + "：★" + BY[o.s].r + " " + BY[o.s].name);
        });
      }).catch(function (e) { console.error("[sticker] inbox", who, e); });
    }, Promise.resolve()).then(function () {
      var d = ensure(); if (d.stickerSeen.length > SEEN_MAX) d.stickerSeen = d.stickerSeen.slice(-SEEN_MAX);
      if (got.length) save();
      ui.busy = false; ui.inbox = got; render();
    });
  }

  function act(a, v) {
    var d = ensure(), pg = d.stickerPages[ui.page], x = pg && pg[ui.sel];
    if (a === "close") return close();
    if (a === "tab") { ui.tab = v; ui.sel = -1; if (v === "gift") ui.inbox = null; return render(); }
    if (a === "page") { ui.page = Number(v); ui.sel = -1; return render(); }
    if (a === "open") return window.openStickerPack();
    if (a === "place") {
      if (free(v) < 1) return; if (pg.length >= PAGE_MAX) { toast("この ページは いっぱい（" + PAGE_MAX + "まいまで）"); return; }
      pg.push({ s: v, x: 30 + Math.round(Math.random() * 40), y: 30 + Math.round(Math.random() * 40), z: 1, r: 0 }); ui.sel = pg.length - 1; save(); return render();
    }
    if (a === "target") { ui.target = v; return render(); }
    if (a === "wear") {
      var p = v.split(":"), key = wearKey(); if (!key) return;
      d.stickerWear[key] = d.stickerWear[key] || {};
      if (p[1]) d.stickerWear[key][p[0]] = p[1]; else delete d.stickerWear[key][p[0]];
      save(); return render();
    }
    if (a === "gto") { ui.giftTo = v; return render(); }
    if (a === "gpick") { ui.giftPick = ui.giftPick === v ? "" : v; return render(); }
    if (a === "send") return sendGift();
    if (a === "check") return checkInbox();
    if (!x) return;
    if (a === "big") x.z = Math.min(2.2, Math.round(((x.z || 1) + 0.2) * 10) / 10);
    if (a === "small") x.z = Math.max(0.5, Math.round(((x.z || 1) - 0.2) * 10) / 10);
    if (a === "rot") x.r = ((x.r || 0) + 15) % 360;
    if (a === "front") { pg.splice(ui.sel, 1); pg.push(x); ui.sel = pg.length - 1; }
    if (a === "peel") { pg.splice(ui.sel, 1); ui.sel = -1; }
    save(); render();
  }

  /* ---------------- 学習の 終わりに ふくろを わたす ---------------- */
  function wrapLab() {
    var o = window.finishDynamicPractice;
    if (typeof o !== "function" || o._stkWrapped) return;
    var w = function () { var r = o.apply(this, arguments); try { window.grantStickerPack("lab"); } catch (e) {} return r; };
    w._stkWrapped = true; window.finishDynamicPractice = w;
  }
  // ホームの なかまの 絵は 気分が 変わった ときしか かき直さないので、かざりが 変わったら かき直させる
  var lastSig = "";
  function wrapHome() {
    var o = window.renderTutorPlan;
    if (typeof o !== "function" || o._stkWrapped) return;
    var w = function () {
      try {
        var sig = JSON.stringify((window.saveData && window.saveData.stickerWear) || {});
        if (sig !== lastSig) { lastSig = sig; var c = document.getElementById("tplan-chara"); if (c) c.removeAttribute("data-mood"); var t = document.getElementById("friends-tile-art"); if (t) t.removeAttribute("data-f"); }
      } catch (e) {}
      return o.apply(this, arguments);
    };
    w._stkWrapped = true; window.renderTutorPlan = w;
  }
  installWear(); wrapLab(); wrapHome();
  window.STICKERS = { list: LIST, svg: svg, installWear: installWear };
})();
