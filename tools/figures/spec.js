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

const cir = (o, cap) => Object.assign({ t: "circuit", cap }, o);
const MOTOR_DIR = { t: "row", cap: "電池の 向きを 逆に → モーターも 逆に 回る", items: [cir({ load: "motor", dir: "cw", cap: "もとの 向き" }), cir({ load: "motor", dir: "ccw", flip: true, cap: "電池を 逆に" })] };
const PAR_SAME = { t: "row", cap: "並列つなぎ：明るさは 1この ときと 同じ", items: [cir({ cap: "電池 1こ" }), cir({ bat: "parallel", cap: "並列つなぎ" })] };
const SER_MOTOR = { t: "row", items: [cir({ bat: "series", load: "motor", dir: "cw", speed: "速い！", cap: "直列：速く 回る" }), cir({ bat: "parallel", load: "motor", dir: "cw", cap: "並列：1こと 同じ" })] };
const sky = (o, cap) => Object.assign({ t: "skypath", cap }, o);
const MOON_PATH = sky({ night: true, marks: [{ u: 0.1 }, { u: 0.5 }, { u: 0.9 }] }, "東から のぼり、南を 通って、西へ しずむ");
const SUMMER = { t: "stars", k: "summer", cap: "夏の大三角：デネブ・ベガ・アルタイル" };
const REFLECT = { t: "sunmoon", mode: "reflect", cap: "月は 太陽の 光を はね返して 光る" };
const STATES = { t: "states", cap: "水は 温度で すがたが 変わる" };
const BOIL = { t: "boil", cap: "あわは 水じょう気、湯気は 水のつぶ" };
const EVAP = { t: "evap", cap: "水は 水じょう気に なって 空気中へ 出ていく" };
const CUP = { t: "cup", cap: "空気中の 水じょう気が 冷やされて 水てきに" };

const SYR = (fill, cap) => ({ t: "syringe", fill, cap });
const AIRGUN = { t: "airgun", cap: "空気でっぽう" };
const CONV = { t: "convection", cap: "対流：あたたまった 水が 上へ、つめたい 水が 下へ" };
const ROOM = { t: "convection", room: true, cap: "あたたかい 空気は 部屋の 上の ほうに 集まる" };
const ROD = { t: "rod", cap: "金属：熱した ところから 順々に 伝わる" };
const MET_VS = { t: "row", cap: "金属は 熱が 順々に、水は 動いて 全体が あたたまる", items: [{ t: "rod", cap: "金属" }, { t: "convection", cap: "水" }] };
const SOIL = { t: "soil", cap: "つぶが 大きいほど 水が しみこみやすい" };
const PUD = { t: "puddles", cap: "水は じょう発して 空気中へ" };
const SLOPE = { t: "slope", cap: "雨水は 高い ところから 低い ところへ" };
const MAG = (k, cap) => ({ t: "magnets", k, cap });
const ARM_B = { t: "arm", bent: true, cap: "うでを 曲げる：内側が ちぢむ" };
const ARM_S = { t: "arm", bent: false, cap: "うでを のばす：外側が ちぢむ" };
const ARMS = { t: "row", cap: "筋肉は ちぢんで 骨を 引っぱる", items: [{ t: "arm", bent: true, cap: "曲げる" }, { t: "arm", bent: false, cap: "のばす" }] };

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
  },
  "理科/電気/denki01": {
    0: E(cir({}, "わのように 1つの 道で つながると あかりが つく")),
    1: E({ t: "row", cap: "直列つなぎ：1この ときより 明るい", items: [cir({ cap: "電池 1こ" }), cir({ bat: "series", cap: "直列つなぎ" })] }),
    2: E(MOTOR_DIR), 4: E(cir({}, "回路：電気の 通り道（わの 形）")), 5: E(PAR_SAME), 6: E(SER_MOTOR),
    9: E(cir({ bat: "parallel" }, "並列つなぎ：電池が ならんで 道が 枝わかれ")),
    10: E(MOTOR_DIR),
    11: E(cir({ bulbs: { n: 3, mode: "parallel", broken: 1 } }, "並列：1こ 切れても のこりは つく")),
    12: E(SER_MOTOR), 13: E(MOTOR_DIR), 14: E(PAR_SAME),
    15: E({ t: "row", cap: "スイッチで 電流を つないだり 切ったり", items: [cir({ sw: "on", cap: "ON：つく" }), cir({ sw: "off", cap: "OFF：消える" })] }),
    17: E({ t: "row", cap: "直列は 道が 1本 → 1こ 切れると ぜんぶ 消える", items: [cir({ bulbs: { n: 2, mode: "series" }, cap: "直列" }), cir({ bulbs: { n: 2, mode: "series", broken: 1 }, cap: "1こ はずすと…" })] })
  },
  "理科/星/hoshi01": {
    0: E(MOON_PATH), 1: E(Object.assign({}, SUMMER, { cap: "夏の大三角（オリオン座は 冬の 星座）" })), 4: E(REFLECT),
    5: E({ t: "stars", k: "orion", cap: "オリオン座（冬）" }), 6: E({ t: "stars", k: "cassiopeia", cap: "カシオペヤ座（北の 空）" }),
    9: E(sky({ night: true, icon: "star", marks: [{ u: 0.15 }, { u: 0.5 }, { u: 0.85 }] }, "星も 東から 西へ 動いて 見える")),
    10: E(SUMMER), 12: E({ t: "sunmoon", mode: "line", cap: "太陽ー地球ー月 が 一直線 → 満月" }), 13: E(SUMMER),
    14: E(Object.assign({}, SUMMER, { hl: "vega", cap: "ベガ（こと座）＝ おりひめ星" })), 15: E(MOON_PATH), 16: E(REFLECT),
    17: E({ t: "moonshapes", cap: "半月（上弦）から 約1週間で 満月", items: [{ p: "first", label: "半月（上弦）" }, { p: "full", label: "満月", sub: "約1週間後" }] })
  },
  "理科/星/kansatsu01": {
    0: E({ t: "fist" }), 2: E({ t: "compass" }),
    3: E(sky({ icon: "first", marks: [{ u: 0.3, label: "3時" }, { u: 0.45, label: "5時" }] }, "南の ほうへ 動いて、高く なる")),
    4: E(sky({ arrow: false, marks: [{ u: 0.04, icon: "full", label: "満月" }, { u: 0.96, icon: "sun", label: "夕日" }] }, "日の入りの ころ、東から 満月が のぼる")),
    5: E(sky({ night: true, arrow: false, marks: [{ u: 0.5, label: "真夜中" }] }, "真夜中：南の 空高くに 満月")),
    8: E({ t: "stars", k: "polaris" }),
    10: E(sky({ night: true, marks: [{ u: 0.12, label: "7時 こぶし2こ" }, { u: 0.3, label: "9時 こぶし4こ" }] }, "時刻・方位・高さ を そろえて 書く"))
  },
  "理科/水のすがた/sugata01": {
    0: E(BOIL), 1: E(BOIL), 2: E(BOIL), 3: E(EVAP), 4: E(STATES), 5: E(STATES), 6: E(Object.assign({}, STATES, { cap: "温度で すがたが 変わる ＝ 状態変化" })),
    7: E({ t: "freeze", cap: "こおると 体積（かさ）が 少し ふえる" }), 8: E(CUP)
  },
  "理科/水のすがた/sugata02": {
    0: E(EVAP), 2: E(Object.assign({}, EVAP, { cap: "水じょう気は 目に 見えない" })), 3: E(EVAP), 4: E(STATES), 5: E(CUP),
    6: E({ t: "cup", compare: true, cap: "冷えて いる ことが かんけい している" }), 7: E(CUP), 8: E(CUP), 9: E(STATES),
    11: E({ t: "cover", cap: "おおいの 内がわに 水てき → 水は 空気中へ 出ていく" })
  },
  "理科/空気と水/kuki_mizu01": {
    0: E(SYR("air", "空気は おすと ちぢむ")), 1: E(SYR("air", "強く おすほど 手ごたえが 強く なる")), 3: E(AIRGUN), 4: E(AIRGUN),
    5: E(SYR("mix", "ちぢむのは 空気の 部分だけ")), 8: E(SYR("air", "もとに もどろうとする 力＝手ごたえ")),
    10: E(SYR("compare", "空気は ちぢむ、水は ちぢまない")), 11: E(SYR("air", "強く おすほど 手ごたえが 強い")), 12: E(AIRGUN),
    13: E(SYR("air", "空気の 体積は 小さく なる")), 14: E(SYR("water", "水の 体積は 変わらない")), 15: E(AIRGUN),
    16: E(SYR("air", "強く おすほど 手ごたえが 強い")), 17: E(SYR("compare", "空気は ちぢむ、水は ちぢまない"))
  },
  "理科/あたたまり方/atatamari01": {
    0: E({ t: "plate", at: "corner", cap: "金属の 板：熱した かどから 順々に" }), 1: E({ t: "rod", at: "center", cap: "まん中から 両はしへ 順々に" }),
    3: E(CONV), 4: E(ROOM), 5: E(MET_VS), 6: E(Object.assign({}, CONV, { cap: "あたたまった お湯は 上に 集まる" })),
    8: E(CONV), 9: E(ROD), 10: E(CONV), 11: E(ROOM), 12: E(MET_VS), 13: E(ROD),
    14: E({ t: "plate", at: "center", cap: "中央から 円のように 広がる" }), 15: E(CONV),
    16: E({ t: "convection", room: true, ac: true, cap: "温風は 下向き → 上に のぼって 部屋全体が あたたまる" }),
    17: E({ t: "row", cap: "水と 空気は 対流で あたたまる", items: [{ t: "convection", cap: "水" }, { t: "convection", room: true, cap: "空気" }] })
  },
  "理科/雨水/amamizu01": {
    0: E(SLOPE), 2: E(SOIL), 3: E(SOIL), 4: E(PUD), 7: E({ t: "puddles", cap: "日なたの ほうが 早く じょう発する" }), 9: E(PUD),
    10: E({ t: "puddles", cap: "日なた ＋ つぶの 大きい ジャリ → 早く 消える" }), 11: E(SLOPE),
    12: E({ t: "soil", cap: "つぶが 大きい すなの ほうが 土より しみこみやすい" }), 13: E(SOIL),
    14: E({ t: "slope", steep: true, cap: "かたむきが 急 → 流れが 速い" })
  },
  "理科/磁石/jishaku301": {
    1: E(MAG("repel", "同じ 極どうし → しりぞけあう")), 2: E(MAG("attract", "ちがう 極どうし → ひきあう")),
    9: E({ t: "compass", cap: "N極（色の ついた 先）は 北を さす" }), 11: E(MAG("split", "割っても 2本の 磁石に なる")),
    12: E(MAG("both", "ちがう極は ひきあい、同じ極は しりぞけあう")), 13: E(MAG("repel", "同じ 極どうし → しりぞけあう")),
    14: E(MAG("attract", "ちがう 極どうし → ひきあう")), 16: E({ t: "compass", cap: "N極（赤い 針）は 北を さす" })
  },
  "理科/体/karada01": {
    0: E(Object.assign({}, ARM_B, { cap: "関節：骨と 骨の つなぎ目で 曲げのばし できる" })), 1: E(ARMS), 3: E(ARM_S),
    6: E(Object.assign({}, ARM_B, { cap: "筋肉は 関節を またいで となりの 骨に つく" })), 9: E(ARM_B), 10: E(ARMS),
    12: E(ARM_B), 13: E(ARM_B), 14: E(ARM_S), 15: E(ARMS)
  }
};
