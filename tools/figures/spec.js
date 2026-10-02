// 図の割り当て表：単元id → 問題番号（js/quizzes/*.js の配列の何番目か）→ { fig, explain_fig }
// fig は「見て考える」問題だけ（答えが図に出てはいけない）。定義を聞く問題は explain_fig（答えたあとの図）にする。
// 図の種類は js/figures.js を参照。直したら node tools/figures/build-figure-map.js で js/figure-map.js を作り直す。
const shp = (k, cap, extra) => Object.assign({ t: "shape", k, cap }, extra || {});
const ln = (k, cap, extra) => Object.assign({ t: "lines", k, cap }, extra || {});
const E = (fig) => ({ explain_fig: fig });

const PERP = ln("perp", "垂直：90度（直角）で 交わる");
const PARA = ln("parallel", "平行：どこまで のばしても 交わらない");
const PERP2 = ln("perp2", "1本の 直線に 垂直な 2本は、平行");
const RECT_SIDE = shp("rect", "となりあう 辺は 垂直（直角）");
const RECT_OPP = shp("rect_par", "向かい合う 辺は 平行");

const TRAP = shp("trapezoid", "台形：1組の 辺が 平行");
const PARAG = shp("parallelogram", "平行四辺形：2組の 辺が 平行");
const RHOM = shp("rhombus", "ひし形：4つの 辺が 同じ 長さ");
const RECT = shp("rect", "長方形：4つの 角が 直角");
const SQ = shp("square", "正方形：4つの 角が 直角 ＋ 4辺が 同じ");

const D = (k, cap, diag) => shp(k, cap, { diag: diag === undefined ? true : diag, marks: false });

const EQ = shp("eq_tri", "正三角形：3つの 辺が 同じ 長さ");
const EQ60 = shp("eq_tri", "正三角形の 角は どれも 60°", { angleLabels: ["60°", "60°", "60°"], arcs: false });
const ISO = shp("iso_tri", "二等辺三角形：2つの 辺が 同じ 長さ");
const RT = shp("right_tri", "直角三角形：1つの 角が 直角（90°）");

const ang = (deg, cap, extra) => Object.assign({ t: "angle2", deg, cap }, extra || {});
const KINDS3 = { t: "row", items: [ang(50, null, { cap: "鋭角（90°より小さい）" }), ang(90, null, { cap: "直角（90°）" }), ang(130, null, { cap: "鈍角（90°〜180°）" })] };
const tri = (a, b, labels, cap) => ({ t: "tri", a, b, labels, cap });
const TRI180 = tri(70, 50, { A: "70°", B: "50°", C: "60°" }, "70°＋50°＋60°＝180°（どんな三角形でも 180°）");
const SPLIT4 = { t: "polysplit", n: 4, cap: "三角形 2つ → 180°×2＝360°" };
const D2 = (k, cap) => Object.assign(D(k, null), { cap });
const TEMP = { xs: ["9", "10", "11", "12", "13", "14", "15"], ys: [16, 18, 21, 23, 24, 22, 20], ymin: 15, ymax: 25, xl: "（時）", yl: "（度）", wave: true };
const G = (extra, cap) => Object.assign({ t: "graph", cap }, TEMP, extra || {});
const fr = (d, n, cap, extra) => Object.assign({ t: "frac", d, n, cap }, extra || {});

module.exports = {
  "算数/図形/suichoku_heikou01": {
    0: E(PERP), 2: E(PARA), 4: E(PERP), 5: E(RECT_SIDE), 6: E(PERP2), 7: E(PARA),
    8: E(ln("grid", "ますめの 線は 90度で 交わる（垂直）")),
    9: E(ln("notebook", "けい線どうしは 平行")),
    10: E(ln("notebook", "けい線に 垂直な 2本の たて線は、平行", { vertical: true })),
    11: E(PERP), 12: E(PARA), 13: E(PERP2), 14: E(RECT_OPP), 15: E(RECT_SIDE)
  },
  "算数/図形/shikakukei_bunrui01": {
    0: E(TRAP), 1: E(PARAG), 4: E(RHOM), 5: E(RECT), 6: E(SQ),
    7: E({ t: "row", cap: "どちらも 4つの 角が 直角 → 正方形は 長方形の なかま", items: [shp("square", null, { cap: "正方形" }), shp("rect", null, { cap: "長方形" })] }),
    8: E(RECT),
    10: E({ t: "row", items: [shp("square", null, { cap: "正方形" }), shp("rect", null, { cap: "長方形" }), shp("rhombus", null, { cap: "ひし形" })] }),
    11: E(TRAP), 12: E(PARAG), 13: E(RHOM), 14: E(shp("rhombus", "ひし形：向かい合う 角は 等しい")), 15: E(SQ)
  },
  "算数/図形/taikakusen01": {
    0: E(D("rect", "対角線：となりあわない 頂点を むすぶ 線", "plain")),
    1: E(D("parallelogram", "平行四辺形の 対角線は 真ん中で 二等分")),
    4: E(D("trapezoid", "台形の 対角線は 真ん中で 二等分しない", "plain")),
    5: E(D("square", "正方形：垂直に 交わり、長さも 同じ")),
    6: E(D("trapezoid", "台形の 対角線は 真ん中で 二等分しない", "plain")),
    7: E(D("rect", "長方形：長さが 同じで、真ん中で 二等分")),
    8: E({ t: "row", items: [D("rhombus", null), D("rect", null)].map((x, i) => Object.assign(x, { cap: i ? "長方形：長さが 同じ" : "ひし形：垂直" })) }),
    10: E(D("rect", "長方形：二等分・長さが同じ・垂直ではない")),
    11: E(D("rect", "対角線：向かい合う 頂点を むすぶ 線", "plain")),
    12: E(D("rhombus", "ひし形の 対角線は 垂直に 交わる")),
    13: E(D("rect", "長方形の 対角線は 長さが 等しい")),
    14: E(D("square", "正方形：長さが 等しく、垂直に 交わる")),
    15: E(D("parallelogram", "平行四辺形：真ん中で 二等分"))
  },
  "算数/図形/sankaku_bunrui01": {
    0: E(EQ), 1: E(ISO), 4: E(RT), 5: E(EQ60),
    6: E({ t: "row", cap: "3辺が同じ なら、2辺も 同じ → 二等辺三角形の なかま", items: [shp("eq_tri", null, { cap: "正三角形" }), shp("iso_tri", null, { cap: "二等辺三角形" })] }),
    7: E(shp("right_tri", "●＋▲＝180°−90°＝90°", { angleLabels: ["●", "▲", ""] })),
    8: E(EQ), 9: E(shp("scalene_tri", "3つの 辺の 長さが ぜんぶ ちがう")), 10: E(EQ60),
    11: E(ISO), 12: E(EQ), 13: E(EQ60), 14: E(shp("iso_tri", "等しい 辺の 下の 2つの 角は 等しい")), 15: E(RT)
  },
  "算数/角度/kakudo01": {
    0: E(ang(90, "直角＝90°")), 1: E(ang(180, "まっすぐ（半回転）＝180°")), 2: E(ang(360, "1回転＝360°")),
    5: E(ang(180, "直角 2つ分＝180°", { split: 90 })),
    6: E({ t: "row", items: [ang(30, null, { cap: "30°（鋭角）" }), ang(90, null, { cap: "90°（直角）" })] }),
    7: E(KINDS3), 8: E(KINDS3),
    9: E({ t: "clock", h: 6, cap: "6時：はりは 一直線 → 180°" }),
    10: E(ang(120, "60°＋60°＝120°", { split: 60 })), 12: E(ang(120, "60°＋60°＝120°（鈍角）", { split: 60 })),
    13: E(ang(180, "まっすぐ＝180°")), 14: E(ang(360, "1回転＝360°")),
    16: E({ t: "clock", h: 3, cap: "3時：はりは 直角 → 90°" }),
    17: E({ t: "row", items: [ang(90, null, { cap: "直角（90°）" }), ang(110, null, { cap: "110°" })] })
  },
  "算数/図形/naikaku_wa01": {
    0: E(TRI180), 1: { fig: tri(70, 50, { A: "70°", B: "50°", C: "?" }) }, 3: { fig: tri(80, 60, { A: "80°", B: "60°", C: "?" }) },
    4: E(SPLIT4), 5: E(tri(45, 45, { A: "45°", B: "45°", C: "90°" }, "45°＋45°＋90°＝180°")), 6: E(EQ60),
    7: { fig: tri(100, 35, { A: "100°", B: "35°", C: "?" }) },
    8: E({ t: "polysplit", n: 5, cap: "三角形 3つ → 180°×3＝540°" }), 9: E(SPLIT4),
    10: { fig: { t: "polysplit", n: 6, labels: false, cap: "六角形は 三角形 4つに 分けられる" } },
    11: E(TRI180), 12: { fig: tri(50, 60, { A: "50°", B: "60°", C: "?" }) },
    13: E(shp("right_iso_tri", "直角二等辺三角形：45°・45°・90°", { angleLabels: ["45°", "45°", ""], arcs: false })),
    14: { fig: tri(50, 50, { A: "?", B: "?", C: "80°" }, "二等辺三角形（頂上の角が 80°）") }, 15: E(SPLIT4)
  },
  "算数/図形/nakama_sagashi01": {
    0: E({ t: "row", cap: "どちらも 辺が ぜんぶ 同じ 長さ", items: [shp("eq_tri", null, { cap: "正三角形" }), shp("square", null, { cap: "正方形" })] }),
    1: E({ t: "row", cap: "平行な 辺が あるのは 四角形だけ", items: [shp("trapezoid", null, { cap: "台形" }), shp("parallelogram", null, { cap: "平行四辺形" })] }),
    3: E(RHOM),
    4: E({ t: "row", cap: "どちらも かどが ぜんぶ 直角", items: [shp("square", null, { cap: "正方形" }), shp("rect", null, { cap: "長方形" })] }),
    5: E({ t: "row", cap: "どちらも 長さの 等しい 辺が ある", items: [shp("iso_tri", null, { cap: "二等辺三角形" }), shp("rhombus", null, { cap: "ひし形" })] }),
    7: E(SQ),
    8: E({ t: "row", cap: "どちらも 長さの 等しい 辺が ある", items: [shp("iso_tri", null, { cap: "二等辺三角形" }), shp("square", null, { cap: "正方形" })] }),
    9: E({ t: "row", cap: "台形は 平行な 辺が 1組だけ", items: [shp("parallelogram", null, { cap: "平行四辺形" }), shp("trapezoid", null, { cap: "台形" })] }),
    10: E({ t: "row", cap: "ひし形でも 長方形でも ある → 正方形", items: [shp("rhombus", null, { cap: "ひし形" }), shp("square", null, { cap: "正方形" }), shp("rect", null, { cap: "長方形" })] }),
    11: E({ t: "row", cap: "対角線が 垂直に 交わる", items: [D2("rhombus", "ひし形"), D2("square", "正方形")] }),
    12: E({ t: "row", cap: "対角線の 長さが 等しい", items: [D2("rect", "長方形"), D2("square", "正方形")] }),
    13: E({ t: "row", cap: "3辺が同じ なら 2辺も 同じ", items: [shp("eq_tri", null, { cap: "正三角形" }), shp("iso_tri", null, { cap: "二等辺三角形" })] })
  },
  "算数/グラフ/oresen01": {
    0: E(G({}, "時間とともに 変わる ようすが 1目で わかる")),
    1: E(G({ hi: [1, 3] }, "かたむきが 急 → 急に ふえている")),
    2: E(G({ ys: [16, 18, 22, 22, 22, 21, 19], hi: [2, 4] }, "水平（よこに まっすぐ）→ 変わっていない")),
    3: E(G({}, "気温の 変化 → 折れ線グラフ")),
    6: E(G({}, "たてのじく：気温など 数量")), 7: E(G({}, "よこのじく：時刻・月など 時間")),
    10: { fig: G({ ys: [17, 20, 23, 23, 23, 21, 19] }) },
    11: E(G({ hi: [1, 3] }, "かたむきが いちばん 急 → 変化が いちばん 大きい")),
    12: E(G({ ys: [16, 18, 22, 22, 22, 21, 19], hi: [2, 4] }, "水平 → 変化が ない")),
    13: E(G({}, "気温の 変化 → 折れ線グラフ")),
    14: E(G({}, "〰（波せん）で 0〜15度を 省略")),
    15: E(G({ xs: ["9", "10", "11", "12", "13"], ys: [18, 20, 22, 24, 25], ymin: 15, ymax: 25, vals: [0, 4], unit: "度" }, "25−18＝7度 上がった"))
  },
  "算数/分数/bunsu01": {
    0: E(fr(5, 3, "3/5：1より 小さい → 真分数")),
    1: E({ t: "row", cap: "1と 同じか、1より 大きい → 仮分数", items: [fr(5, 5, null, { cap: "5/5（＝1）" }), fr(3, 7, null, { cap: "7/3" })] }),
    2: E(fr(3, 7, "2と1/3：整数の 2 と 真分数の 1/3")),
    3: E(fr(3, 7, "7/3 → 1が 2こ と 1/3 → 2と1/3")),
    4: E(fr(5, 8, "1と3/5 → 5/5 ＋ 3/5 ＝ 8/5")),
    5: E(fr(7, 5, "2/7 ＋ 3/7 ＝ 5/7（分母は そのまま）", { parts: [2, 3] })),
    6: E(fr(9, 6, "6/9 − 2/9 ＝ 4/9", { minus: 2 })),
    7: E(fr(8, 8, "1 ＝ 8/8 → 8/8 − 3/8 ＝ 5/8", { minus: 3 }))
  }
};
