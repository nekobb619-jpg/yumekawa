// こども学習サポートポータル（claude.ai の非公開ページ）の「単元カレンダー」用データを作る。
// node tools/portal/build-units.js [出力先.json]
// 教科書の年間計画（.knowledge/curriculum-grade4-by-term.md）の 単元ごとに、アプリの ステージ・問題数・図・ラボ・自学ネタ を 数える。
// 日付は 2026年度（2026-04〜2027-03）の めやす。実際の 学校予定（配布物の 写真から）で ずれたら ポータル側で 直す。
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "..");
global.window = {};
eval(fs.readFileSync(path.join(root, "js/stages.js"), "utf8"));
for (const f of fs.readdirSync(path.join(root, "js/quizzes"))) eval(fs.readFileSync(path.join(root, "js/quizzes", f), "utf8"));
eval(fs.readFileSync(path.join(root, "js/figure-map.js"), "utf8"));
const Q = {}; for (const k of Object.keys(window)) if (k.startsWith("CONTENT_QUIZZES")) Object.assign(Q, window[k]);
const STAGES = window.CONTENT_STAGES, FIG = window.FIGURE_MAP;
const jig = fs.readFileSync(path.join(root, "js/jigaku-note.js"), "utf8");
const JIGAKU = [...jig.matchAll(/(?:quiz\("|id: ")([a-z_0-9]+)", (?:"([^"]+)"|kind: "\w+", title: "([^"]+)")/g)].map((m) => ({ id: m[1], title: m[2] || m[3] }));

// [教科, 学期, 単元名, 開始, 終了, アプリのステージid, 自学ネタid]
const U = [
  ["算数", 1, "角とその大きさ", "2026-04-08", "2026-04-24", ["算数/角度/kakudo01", "算数/角度/kakudo_zu01", "算数/角度/setsumei01"], []],
  ["算数", 1, "折れ線グラフ", "2026-04-20", "2026-05-08", ["算数/グラフ/oresen01"], []],
  ["算数", 1, "1けたでわるわり算の筆算", "2026-05-08", "2026-05-29", ["算数/わり算/hissan_amari01", "算数/わり算/hissan_amari02", "算数/わり算/warizan301"], []],
  ["算数", 1, "一億をこえる数", "2026-05-25", "2026-06-10", ["算数/大きな数/ookazu01"], []],
  ["算数", 1, "垂直・平行と四角形", "2026-06-08", "2026-06-30", ["算数/図形/suichoku_heikou01", "算数/図形/shikakukei_bunrui01", "算数/図形/taikakusen01"], []],
  ["算数", 1, "小数（しくみ・たし算ひき算）", "2026-06-24", "2026-07-17", ["算数/小数/shosu01", "算数/小数/shosu_keisan01"], []],
  ["算数", 2, "2けたでわるわり算の筆算", "2026-09-01", "2026-09-30", ["算数/わり算/hissan_2digit01", "算数/わり算/warizan_challenge01"], []],
  ["算数", 2, "式と計算の順じょ", "2026-09-24", "2026-10-16", [], []],
  ["算数", 2, "面積", "2026-10-14", "2026-10-30", ["算数/面積/menseki_1", "算数/面積/menseki_2", "算数/面積/menseki_3"], []],
  ["算数", 2, "がい数とその計算", "2026-11-02", "2026-11-18", ["算数/がい数/gaisu01"], []],
  ["算数", 2, "小数のかけ算・わり算", "2026-11-16", "2026-12-18", [], []],
  ["算数", 3, "調べ方と整理のしかた", "2027-01-12", "2027-01-22", ["探究/データ/data01"], []],
  ["算数", 3, "分数", "2027-01-25", "2027-02-10", ["算数/分数/bunsu01"], []],
  ["算数", 3, "変わり方", "2027-02-08", "2027-02-19", [], []],
  ["算数", 3, "直方体と立方体", "2027-02-17", "2027-03-10", [], []],
  ["理科", 1, "春の生き物", "2026-04-08", "2026-04-30", ["理科/季節と生き物/kisetsu01"], []],
  ["理科", 1, "天気と1日の気温", "2026-05-01", "2026-05-22", [], []],
  ["理科", 1, "地面を流れる水のゆくえ", "2026-05-11", "2026-05-29", ["理科/雨水/amamizu01"], []],
  ["理科", 1, "電気のはたらき", "2026-06-01", "2026-06-30", ["理科/電気/denki01"], []],
  ["理科", 1, "夏の生き物・夏の夜空", "2026-07-01", "2026-07-17", ["理科/星/hoshi01", "理科/季節と生き物/kisetsu01"], ["q_seiza", "c_seiza"]],
  ["理科", 2, "月や星の動き", "2026-09-01", "2026-09-30", ["理科/星/hoshi01", "理科/星/kansatsu01"], ["q_seiza", "q_hokkyoku", "q_tsuki", "q_hoshiiro", "c_seiza"]],
  ["理科", 2, "とじこめた空気や水", "2026-09-14", "2026-10-02", ["理科/空気と水/kuki_mizu01"], ["c_kuuki"]],
  ["理科", 2, "ヒトの体のつくりと運動", "2026-10-01", "2026-10-30", ["理科/体/karada01"], ["q_hone", "q_dokidoki", "q_kusuguri"]],
  ["理科", 2, "秋の生き物", "2026-11-02", "2026-11-20", ["理科/季節と生き物/kisetsu01"], []],
  ["理科", 2, "ものの温度と体積", "2026-11-09", "2026-12-18", [], []],
  ["理科", 3, "冬の夜空・冬の生き物", "2027-01-08", "2027-01-29", ["理科/季節と生き物/kisetsu01", "理科/星/kansatsu01"], []],
  ["理科", 3, "もののあたたまり方", "2027-01-12", "2027-02-05", ["理科/あたたまり方/atatamari01"], ["e_netsu"]],
  ["理科", 3, "水のすがた", "2027-02-01", "2027-02-26", ["理科/水のすがた/sugata01"], ["e_koori"]],
  ["理科", 3, "水のゆくえ（蒸発・結露）", "2027-03-01", "2027-03-19", ["理科/水のすがた/sugata02"], ["q_sentaku"]],
  ["理科", 3, "生き物の1年間", "2027-03-01", "2027-03-19", ["理科/季節と生き物/kisetsu01"], []],
  ["理科", 0, "実験の計画（通年）", "2026-04-08", "2027-03-19", ["理科/実験計画/exp_design01"], ["e_hikari", "e_oremagaru", "e_kessho", "e_jishaku"]],
  ["社会", 1, "わたしたちの県", "2026-04-08", "2026-05-08", ["社会/愛知/aichi01", "社会/都道府県/todofuken01", "社会/都道府県/todofuken02", "社会/都道府県/kenchou01", "社会/地図/nairiku01", "社会/地図/chizuyomi01"], ["c_owari", "c_komaki", "q_aichi1"]],
  ["社会", 1, "水はどこから", "2026-05-11", "2026-06-12", ["社会/水道/josuijo01"], []],
  ["社会", 1, "ごみのしょりと利用", "2026-06-15", "2026-07-17", ["社会/ごみ/gomi01"], []],
  ["社会", 2, "自然災害からくらしを守る", "2026-09-01", "2026-09-30", ["社会/防災/bousai01", "社会/防災/saigai02"], []],
  ["社会", 2, "きょう土の伝統・文化と先人たち", "2026-10-01", "2026-12-18", ["社会/先人/senjin01", "社会/愛知/aichi02"], ["q_aichi2", "c_yousui"]],
  ["社会", 3, "特色ある地いきと人々のくらし", "2027-01-08", "2027-03-19", ["社会/愛知/aichi02"], ["q_aichi1"]],
  ["国語", 1, "物語「白いぼうし」", "2026-04-08", "2026-04-30", ["国語/読解/kosoado01"], []],
  ["国語", 1, "説明文（結果と考察）", "2026-05-01", "2026-06-19", ["国語/論理/inga01"], []],
  ["国語", 1, "漢字辞典・都道府県の漢字", "2026-06-15", "2026-07-10", ["国語/漢字/kanji01", "国語/漢字/onyomi_kunyomi01", "社会/都道府県/todofuken01"], []],
  ["国語", 2, "物語「一つの花」（修飾語）", "2026-10-01", "2026-10-23", ["国語/修飾語/shushoku01"], []],
  ["国語", 2, "物語「ごんぎつね」（情景）", "2026-10-19", "2026-11-20", ["国語/読解/dokkai6_01"], []],
  ["国語", 2, "いろいろな意味を表す漢字", "2026-11-09", "2026-11-27", ["国語/漢字/tsukaiwake01"], []],
  ["国語", 2, "説明文の要約", "2026-12-01", "2026-12-18", ["国語/論理/equal01"], []],
  ["国語", 3, "熟語のでき方", "2027-01-08", "2027-01-29", ["国語/漢字/jukugo01"], []],
  ["国語", 3, "筆者の考えと自分の考え", "2027-01-18", "2027-02-05", ["国語/論理/tairitsu01"], []],
  ["国語", 3, "読点の打ち方・作文", "2027-02-01", "2027-02-26", ["国語/言葉/setsuzoku01"], []],
  ["国語", 0, "慣用句・ことば（通年）", "2026-04-08", "2027-03-19", ["国語/慣用句/kanyoku01", "国語/ローマ字/romaji301"], []],
  ["国語", 0, "漢字（4年・漢検7級）", "2026-04-08", "2027-03-19", ["漢検/7級/dai1kai", "漢検/7級/dai2kai", "国語/漢字/tsukaiwake01"], []],
  ["英語", 0, "外国語活動（通年）", "2026-04-08", "2027-03-19", ["英語/あいさつ/english401", "英語/曜日と天気/english403", "英語/時刻/english404", "英語/文房具/english405", "英語/学校の場所/english406", "英語/一日の生活/english407", "英語/メニュー/english402"], []],
  // 学校の 総合の 計画（4年：テーマ探究【環境】60時間・情報教育10時間・My探究35時間）
  ["探究", 0, "総合（テーマ探究）【環境】未来の地球を守ろう", "2026-04-08", "2027-03-19", ["社会/ごみ/gomi01", "社会/水道/josuijo01", "探究/調べ方/shirabe01", "探究/データ/data01"], []],
  ["探究", 0, "総合（情報教育）プログラミング・情報モラル", "2026-04-08", "2027-03-19", ["探究/プログラミング/prog01", "探究/プログラミング/prog02", "探究/情報/net_ethics01", "探究/情報/net_ethics02"], []],
  ["探究", 0, "総合（My探究）こまき「夢☆チャレンジ」科", "2026-04-08", "2027-03-19", ["探究/設計/engineering01", "探究/調べ方/shirabe01", "探究/分岐図解/bunki01"], []]
];
const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));
const key = (s) => String(s || "").replace(/\s+/g, "");
const figKeys = new Set(Object.keys(FIG).map((k) => key(k.split("‖")[0])));
let warn = 0;
const units = U.map(([subject, term, name, from, to, ids, jg], i) => {
  const stages = ids.map((id) => {
    const s = stageById[id]; if (!s) { console.log("!! ステージが ない:", id); warn++; return null; }
    const qs = Q[id] || [];
    return { id, name: s.category, q: qs.length, figs: qs.filter((q) => figKeys.has(key(q.q))).length, lab: s.lab_url ? s.lab_url.replace(/^.*\/lab\//, "lab/") : "" };
  }).filter(Boolean);
  const jigaku = jg.map((id) => { const c = JIGAKU.find((x) => x.id === id); if (!c) { console.log("!! 自学ネタが ない:", id); warn++; } return c ? c.title : null; }).filter(Boolean);
  const q = stages.reduce((a, s) => a + s.q, 0), figs = stages.reduce((a, s) => a + s.figs, 0), labs = [...new Set(stages.map((s) => s.lab).filter(Boolean))];
  const gaps = [];
  if (!stages.length) gaps.push("アプリに 単元が ない");
  else { if (q < 10) gaps.push("問題が 少ない（" + q + "問）"); if (figs === 0 && subject !== "英語") gaps.push("図が ない"); }
  if (!labs.length && (subject === "算数" || subject === "理科")) gaps.push("ラボが ない");
  if (!jigaku.length && subject !== "英語") gaps.push("自学ネタが ない");
  return { id: "u" + String(i + 1).padStart(3, "0"), subject, term, name, from, to, stages, q, figs, labs, jigaku, gaps };
});
const out = process.argv[2] || path.join(__dirname, "units.json");
fs.writeFileSync(out, JSON.stringify(units, null, 1));
console.log(units.length + " 単元 → " + out + (warn ? "（要確認 " + warn + "）" : ""));
units.forEach((u) => console.log(u.subject, u.name, "問" + u.q, "図" + u.figs, "ラボ" + u.labs.length, "自学" + u.jigaku.length, u.gaps.join("・")));
