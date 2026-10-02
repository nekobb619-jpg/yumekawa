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
  }
};
