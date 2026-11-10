/* =====================================================================
   kanji-sheet.js — 漢字の 書き取りシート（4年）：紙に 書く → アプリで 自分で 丸つけ
   ★2026-10-03追加（ユーザー：「漢字の 書き問題が 少ない」）
   ★2026-11-10 言葉を 40 → 178 に、コース（おまかせ・都道府県 47・送りがな・にた 漢字・4年の ことば・まちがえた 漢字）を 追加（保護者：書き取りシートが 充実して いない）
   - アプリの 文字入力だと 変換候補に 答えが 出て しまうので、書く 練習は 紙で 行う
   - KANJI_SHEET.make(no, prio)：シート番号から 毎回 同じ 10問。prio（前に まちがえた 言葉）を 先に 入れる
   - 丸つけで × に した 言葉は saveData.kanjiMissed に のこり、次の シートに もう一度 出る（間を あけて 思い出す 練習）
   - ごほうび：その日 はじめての 1まいだけ、○1つ ＝ 1Q。log_db「✍️漢字シート」
   - 言葉は すべて 4年生までに 習う 漢字（2020年からの 配当。県名の 漢字を ふくむ）
   ===================================================================== */
(function () {
  "use strict";
  // [id, 文（【 】が 書く ところ）, 読み, 答え]
  var BANK = [
    [1, "工場の【きかい】が 動く。", "きかい", "機械"], [2, "運動会に【さんか】する。", "さんか", "参加"], [3, "テストの【けっか】を 見る。", "けっか", "結果"],
    [4, "【ゆうき】を 出して 話す。", "ゆうき", "勇気"], [5, "【きせつ】が 春に 変わる。", "きせつ", "季節"], [6, "地図が【ひつよう】だ。", "ひつよう", "必要"],
    [7, "みんなで【きょうりょく】する。", "きょうりょく", "協力"], [8, "今月の【もくひょう】を 立てる。", "もくひょう", "目標"], [9, "理科の【じっけん】を する。", "じっけん", "実験"],
    [10, "アサガオを【かんさつ】する。", "かんさつ", "観察"], [11, "【きろく】を ノートに 書く。", "きろく", "記録"], [12, "【けんこう】に 気を つける。", "けんこう", "健康"],
    [13, "【きぼう】を もって すすむ。", "きぼう", "希望"], [14, "今日の【きゅうしょく】は カレーだ。", "きゅうしょく", "給食"], [15, "六年生が【そつぎょう】する。", "そつぎょう", "卒業"],
    [16, "プリントを【いんさつ】する。", "いんさつ", "印刷"], [17, "駅まで【あんない】する。", "あんない", "案内"], [18, "犬と【さんぽ】する。", "さんぽ", "散歩"],
    [19, "【さいしょ】に 名前を 書く。", "さいしょ", "最初"], [20, "【べんり】な 道具を 使う。", "べんり", "便利"], [21, "家族で【りょうり】を 作る。", "りょうり", "料理"],
    [22, "畑で【やさい】を 育てる。", "やさい", "野菜"], [23, "【しっぱい】しても あきらめない。", "しっぱい", "失敗"], [24, "【しぜん】を 大切に する。", "しぜん", "自然"],
    [25, "山の 上から【けしき】を ながめる。", "けしき", "景色"], [26, "やり方を【せつめい】する。", "せつめい", "説明"], [27, "【ひこうき】に 乗る。", "ひこうき", "飛行機"],
    [28, "【はくぶつかん】へ 行く。", "はくぶつかん", "博物館"], [29, "九九を【おぼ】える。", "おぼ", "覚"], [30, "気持ちを【つた】える。", "つた", "伝"],
    [31, "シャワーを【あ】びる。", "あ", "浴"], [32, "【つめ】たい 水を 飲む。", "つめ", "冷"], [33, "図書室では【しず】かに する。", "しず", "静"],
    [34, "【にいがた】県は 米どころだ。", "にいがた", "新潟"], [35, "【いばらき】県の 北に 福島県が ある。", "いばらき", "茨城"], [36, "【えひめ】県は みかんが 有名だ。", "えひめ", "愛媛"],
    [37, "【ぎふ】県は 海に 面して いない。", "ぎふ", "岐阜"], [38, "【おきなわ】県は 南の 島だ。", "おきなわ", "沖縄"], [39, "【とちぎ】県の 日光に 行く。", "とちぎ", "栃木"],
    [40, "【くまもと】城を 見学する。", "くまもと", "熊本"],
    // ★2026-11-10 追加（保護者：書き取りシートが 充実して いない）。5つめは コース：ken 都道府県／okuri 送りがな／nita にた 漢字・同じ 読み／kotoba 4年の ことば。
    //   答えの 漢字は 4年までに 習う 字だけ（2020年からの 配当）。文の 中の 習って いない 字は ひらがな
    [41, "【ぐんま】県は 関東地方に ある。",  "ぐんま",  "群馬",  "ken"], [42, "【さいたま】県は 東京都の 北に ある。",  "さいたま",  "埼玉",  "ken"], [43, "【とやま】県は 日本海に 面して いる。",  "とやま",  "富山",  "ken"],
    [44, "【やまなし】県は ぶどうや ももが 有名だ。",  "やまなし",  "山梨",  "ken"], [45, "【しずおか】県は お茶づくりが さかんだ。",  "しずおか",  "静岡",  "ken"], [46, "わたしたちが 住む【あいち】県。",  "あいち",  "愛知",  "ken"],
    [47, "【しが】県には びわ湖が ある。",  "しが",  "滋賀",  "ken"], [48, "【おおさか】府は 近畿地方に ある。",  "おおさか",  "大阪",  "ken"], [49, "【なら】県には 大きな 大仏が ある。",  "なら",  "奈良",  "ken"],
    [50, "【とっとり】県には 大きな さきゅうが ある。",  "とっとり",  "鳥取",  "ken"], [51, "【かがわ】県は うどんが 有名だ。",  "かがわ",  "香川",  "ken"], [52, "【さが】県は 九州地方に ある。",  "さが",  "佐賀",  "ken"],
    [53, "【ながさき】県には 島が 多い。",  "ながさき",  "長崎",  "ken"], [54, "【おおいた】県は おんせんが 多い。",  "おおいた",  "大分",  "ken"], [55, "【みやざき】県は 九州の 東がわに ある。",  "みやざき",  "宮崎",  "ken"],
    [56, "【かごしま】県には さくらじまが ある。",  "かごしま",  "鹿児島",  "ken"], [57, "【みやぎ】県の 県庁は せんだい市に ある。",  "みやぎ",  "宮城",  "ken"], [58, "【ふくおか】県は 九州で 人口が いちばん 多い。",  "ふくおか",  "福岡",  "ken"],
    [59, "【おかやま】県は ももや ぶどうが 有名だ。",  "おかやま",  "岡山",  "ken"], [60, "【ふくい】県は 日本海に 面して いる。",  "ふくい",  "福井",  "ken"], [61, "【ひょうご】県の 県庁は 神戸市に ある。",  "ひょうご",  "兵庫",  "ken"],
    [62, "【とくしま】県は 四国地方に ある。",  "とくしま",  "徳島",  "ken"], [63, "【みえ】県は 愛知県の 西に ある。",  "みえ",  "三重",  "ken"], [64, "【しまね】県には 出雲大社が ある。",  "しまね",  "島根",  "ken"],
    [65, "【かながわ】県には よこはま市が ある。",  "かながわ",  "神奈川",  "ken"], [66, "【ながの】県は 高い 山が 多い。",  "ながの",  "長野",  "ken"], [67, "【わかやま】県は みかんが 有名だ。",  "わかやま",  "和歌山",  "ken"],
    [68, "【ほっかいどう】は 日本の いちばん 北に ある。",  "ほっかいどう",  "北海道",  "ken"], [69, "【あおもり】県は りんごが 有名だ。",  "あおもり",  "青森",  "ken"], [70, "【いしかわ】県の 県庁は 金沢市に ある。",  "いしかわ",  "石川",  "ken"],
    [71, "【こうち】県は 四国の 南がわに ある。",  "こうち",  "高知",  "ken"], [72, "【ひろしま】県は 中国地方に ある。",  "ひろしま",  "広島",  "ken"], [73, "【やまがた】県は さくらんぼが 有名だ。",  "やまがた",  "山形",  "ken"],
    [74, "電車が 一列に【つら】なる。",  "つら",  "連",  "okuri"], [75, "ねん土を【かた】める。",  "かた",  "固",  "okuri"], [76, "新しい 家を【た】てる。",  "た",  "建",  "okuri"],
    [77, "くつの ひもを【むす】ぶ。",  "むす",  "結",  "okuri"], [78, "【のこ】りの 時間を たしかめる。",  "のこ",  "残",  "okuri"], [79, "雨の 日が 三日【つづ】く。",  "つづ",  "続",  "okuri"],
    [80, "図書館で 本を【か】りる。",  "か",  "借",  "okuri"], [81, "手を【あ】げて 答える。",  "あ",  "挙",  "okuri"], [82, "一位を【あらそ】う。",  "あらそ",  "争",  "okuri"],
    [83, "きまりを【あらた】める。",  "あらた",  "改",  "okuri"], [84, "みんなの 幸せを【ねが】う。",  "ねが",  "願",  "okuri"], [85, "さくらの 花が【ち】る。",  "ち",  "散",  "okuri"],
    [86, "大きな 声で【わら】う。",  "わら",  "笑",  "okuri"], [87, "魚を【や】く。",  "や",  "焼",  "okuri"], [88, "月が 水面を【て】らす。",  "て",  "照",  "okuri"],
    [89, "木の えだを【お】る。",  "お",  "折",  "okuri"], [90, "お店で【はたら】く 人に 話を 聞く。",  "はたら",  "働",  "okuri"], [91, "朝 早く 目を【さ】ます。",  "さ",  "覚",  "okuri"],
    [92, "【かなら】ず 行くと やくそくする。",  "かなら",  "必",  "okuri"], [93, "【あさ】い 川で 遊ぶ。",  "あさ",  "浅",  "okuri"], [94, "【ひく】い 山に 登る。",  "ひく",  "低",  "okuri"],
    [95, "子ねこの【な】き声が 聞こえる。",  "な",  "泣",  "okuri"], [96, "むだを【はぶ】く。",  "はぶ",  "省",  "okuri"], [97, "水を 少し【くわ】える。",  "くわ",  "加",  "okuri"],
    [98, "自信を【うしな】う。",  "うしな",  "失",  "okuri"], [99, "家族と【とも】に くらす。",  "とも",  "共",  "okuri"], [100, "雪が【つ】もる。",  "つ",  "積",  "okuri"],
    [101, "夜は【ひ】える。",  "ひ",  "冷",  "okuri"], [102, "体力を【やしな】う。",  "やしな",  "養",  "okuri"], [103, "【はじ】めて 会う 人に あいさつする。",  "はじ",  "初",  "okuri"],
    [104, "命に【かか】わる 大事な 話。",  "かか",  "関",  "okuri"], [105, "話す【きかい】を 見つける。",  "きかい",  "機会",  "nita"], [106, "むねに【なふだ】を つける。",  "なふだ",  "名札",  "nita"],
    [107, "先生に お【れい】を 言う。",  "れい",  "礼",  "nita"], [108, "物語の【けつまつ】を 読む。",  "けつまつ",  "結末",  "nita"], [109, "【みらい】の 自分に 手紙を 書く。",  "みらい",  "未来",  "nita"],
    [110, "ゴールまで【きょうそう】する。",  "きょうそう",  "競争",  "nita"], [111, "へやの【めんせき】を もとめる。",  "めんせき",  "面積",  "nita"], [112, "道具を【かんり】する。",  "かんり",  "管理",  "nita"],
    [113, "【きかん】車が 走る。",  "きかん",  "機関",  "nita"], [114, "星に【かんしん】を もつ。",  "かんしん",  "関心",  "nita"], [115, "弟の がんばりに【かんしん】した。",  "かんしん",  "感心",  "nita"],
    [116, "南の 国は【きこう】が あたたかい。",  "きこう",  "気候",  "nita"], [117, "百人【いじょう】が 集まる。",  "いじょう",  "以上",  "nita"], [118, "【いがい】な 答えに おどろく。",  "いがい",  "意外",  "nita"],
    [119, "家族【いがい】の 人に 聞く。",  "いがい",  "以外",  "nita"], [120, "【まつ】の 木が ならぶ。",  "まつ",  "松",  "nita"], [121, "日にちは まだ【みてい】だ。",  "みてい",  "未定",  "nita"],
    [122, "生き物を なかまに【ぶんるい】する。",  "ぶんるい",  "分類",  "kotoba"], [123, "港に【ぎょせん】が もどる。",  "ぎょせん",  "漁船",  "kotoba"], [124, "【えいよう】の ある 食事。",  "えいよう",  "栄養",  "kotoba"],
    [125, "なべに【しお】を 少し 入れる。",  "しお",  "塩",  "kotoba"], [126, "クラスの 代表を【とうひょう】で 決める。",  "とうひょう",  "投票",  "kotoba"], [127, "【せんきょ】で 代表を えらぶ。",  "せんきょ",  "選挙",  "kotoba"],
    [128, "天気の【へんか】に 気づく。",  "へんか",  "変化",  "kotoba"], [129, "【じてん】で 意味を しらべる。",  "じてん",  "辞典",  "kotoba"], [130, "【ぐんて】を はめて 草を とる。",  "ぐんて",  "軍手",  "kotoba"],
    [131, "【かがみ】に 顔を うつす。",  "かがみ",  "鏡",  "kotoba"], [132, "できあがりに【まんぞく】する。",  "まんぞく",  "満足",  "kotoba"], [133, "バス停が なくて【ふべん】だ。",  "ふべん",  "不便",  "kotoba"],
    [134, "花の【しゅるい】が 多い。",  "しゅるい",  "種類",  "kotoba"], [135, "今日は【とくべつ】な 日だ。",  "とくべつ",  "特別",  "kotoba"], [136, "毎日【どりょく】を つづける。",  "どりょく",  "努力",  "kotoba"],
    [137, "ぶたいの【しょうめい】が つく。",  "しょうめい",  "照明",  "kotoba"], [138, "【じどう】会で 話し合う。",  "じどう",  "児童",  "kotoba"], [139, "みんな【ぶじ】に 帰って きた。",  "ぶじ",  "無事",  "kotoba"],
    [140, "船は【たいりょう】で 港に もどった。",  "たいりょう",  "大漁",  "kotoba"], [141, "【ねったい】の 植物を 見る。",  "ねったい",  "熱帯",  "kotoba"], [142, "地いきの【さんぎょう】を 調べる。",  "さんぎょう",  "産業",  "kotoba"],
    [143, "へやの【でんとう】を つける。",  "でんとう",  "電灯",  "kotoba"], [144, "いい【ほうほう】を 考える。",  "ほうほう",  "方法",  "kotoba"], [145, "友だちと【やくそく】する。",  "やくそく",  "約束",  "kotoba"],
    [146, "【きねん】に しゃしんを とる。",  "きねん",  "記念",  "kotoba"], [147, "作品が【かんせい】した。",  "かんせい",  "完成",  "kotoba"], [148, "リレーの【せんしゅ】に えらばれる。",  "せんしゅ",  "選手",  "kotoba"],
    [149, "けがを した 手に【ほうたい】を まく。",  "ほうたい",  "包帯",  "kotoba"], [150, "作文を【せいしょ】する。",  "せいしょ",  "清書",  "kotoba"], [151, "話し合いの【しかい】を する。",  "しかい",  "司会",  "kotoba"],
    [152, "みさきの【とうだい】が 光る。",  "とうだい",  "灯台",  "kotoba"], [153, "かぜで 学校を【けっせき】する。",  "けっせき",  "欠席",  "kotoba"], [154, "工作の【ざいりょう】を そろえる。",  "ざいりょう",  "材料",  "kotoba"],
    [155, "たねが【はつが】する。",  "はつが",  "発芽",  "kotoba"], [156, "道具を【かいりょう】する。",  "かいりょう",  "改良",  "kotoba"], [157, "まどから 見える【ふうけい】。",  "ふうけい",  "風景",  "kotoba"],
    [158, "駅の【しゅうへん】を 歩く。",  "しゅうへん",  "周辺",  "kotoba"], [159, "【がいとう】が 夜道を てらす。",  "がいとう",  "街灯",  "kotoba"], [160, "夏休みに【かいすいよく】へ 行く。",  "かいすいよく",  "海水浴",  "kotoba"],
    [161, "カレーは ぼくの【こうぶつ】だ。",  "こうぶつ",  "好物",  "kotoba"], [162, "運動場に【こっき】を かかげる。",  "こっき",  "国旗",  "kotoba"], [163, "【じゅんばん】に ならぶ。",  "じゅんばん",  "順番",  "kotoba"],
    [164, "二つの 絵の【きょうつう】点を さがす。",  "きょうつう",  "共通",  "kotoba"], [165, "【せんそう】の ない 世界を ねがう。",  "せんそう",  "戦争",  "kotoba"], [166, "友だちを【しんよう】する。",  "しんよう",  "信用",  "kotoba"],
    [167, "まちがいを【はんせい】する。",  "はんせい",  "反省",  "kotoba"], [168, "実験が【せいこう】した。",  "せいこう",  "成功",  "kotoba"], [169, "かん字の【しけん】を うける。",  "しけん",  "試験",  "kotoba"],
    [170, "【かんこう】地を めぐる。",  "かんこう",  "観光",  "kotoba"], [171, "空の【ひこう】機雲。",  "ひこう",  "飛行",  "kotoba"]
    , [172, "【とうきょう】都は 日本の 首都だ。", "とうきょう", "東京", "ken"], [173, "【ちば】県は 東京都の 東に ある。", "ちば", "千葉", "ken"], [174, "【いわて】県は 東北地方に ある。", "いわて", "岩手", "ken"],
    [175, "【あきた】県は 米づくりが さかんだ。", "あきた", "秋田", "ken"], [176, "【ふくしま】県は ももが 有名だ。", "ふくしま", "福島", "ken"], [177, "【きょうと】府には 古い お寺が 多い。", "きょうと", "京都", "ken"],
    [178, "【やまぐち】県は 本州の いちばん 西に ある。", "やまぐち", "山口", "ken"]
  ].map(function (x) { return { id: x[0], s: x[1], r: x[2], a: x[3], k: x[4] || (x[0] >= 34 ? "ken" : x[0] >= 29 ? "okuri" : x[0] === 1 || x[0] === 2 ? "nita" : "kotoba") }; });
  var COURSES = [
    { id: "mix", name: "🎯 おまかせ", sub: "ぜんぶから" },
    { id: "ken", name: "🗾 都道府県", sub: "47の 県名の 漢字" },
    { id: "okuri", name: "✏️ 送りがな", sub: "「つづ く」「むす ぶ」など" },
    { id: "nita", name: "🧩 にた 漢字", sub: "機会と 機械・末と 未 など" },
    { id: "kotoba", name: "📚 4年の ことば", sub: "教科で 使う ことば" },
    { id: "miss", name: "🔁 まちがえた 漢字", sub: "前に 🔁 に した もの" }
  ];

  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function make(no, prio, course) {
    var r = rng(no * 104729 + 7), pick = [], used = {};
    var pool = course && course !== "mix" && course !== "miss" ? BANK.filter(function (b) { return b.k === course; }) : BANK;
    if (course === "miss") pool = BANK.filter(function (b) { return (prio || []).indexOf(String(b.id)) >= 0 || (prio || []).indexOf(b.id) >= 0; });
    (prio || []).slice(0, course === "miss" ? 10 : 5).forEach(function (id) { var w = BANK.filter(function (b) { return b.id === Number(id); })[0]; if (w && !used[w.id]) { used[w.id] = 1; pick.push(w); } });
    var rest = pool.filter(function (b) { return !used[b.id]; });
    for (var i = rest.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
    while (pick.length < 10 && rest.length) pick.push(rest.shift());
    return pick;
  }
  window.KANJI_SHEET = { BANK: BANK, make: make, COURSES: COURSES };
  if (typeof document === "undefined" || !document.body || window.KANJI_PRINT_PAGE) return;

  /* ---------------- アプリ側 ---------------- */
  var BTN = "border:none;border-radius:14px;font-family:'Zen Maru Gothic';font-weight:900;cursor:pointer;";
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function close() { var m = document.getElementById("kanji-modal"); if (m) m.remove(); }
  window.closeKanjiSheet = close;
  function shell(inner) {
    close();
    var w = document.createElement("div"); w.id = "kanji-modal";
    w.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:14px;";
    w.onclick = function (e) { if (e.target === w) close(); };
    w.innerHTML = '<div style="background:#fff;border-radius:22px;padding:16px 14px;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 10px 0 rgba(147,51,234,.22);">' + inner + '</div>';
    document.body.appendChild(w);
  }
  function missed() { var sd = window.saveData || {}; return Array.isArray(sd.kanjiMissed) ? sd.kanjiMissed : []; }

  window.openKanjiSheet = function () {
    var sd = window.saveData || {}, last = sd.kanjiLastSheet, m = missed().length;
    shell(
      '<div style="font-size:18px;font-weight:900;color:#6b21a8;text-align:center;">✍️ 漢字の 書き取りシート</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-soft);text-align:center;margin:4px 0 10px;line-height:1.6;">漢字は 手で 書くと おぼえられる。<br>印刷して 書く → アプリで 自分で 丸つけ（その日 1まい目は ○1つ 1Q）</div>' +
      (m ? '<div style="background:#fff7ed;border-radius:12px;padding:8px 10px;font-size:12px;font-weight:800;color:#c2410c;text-align:center;margin-bottom:10px;">🔁 前に まちがえた 言葉が ' + m + 'こ。次の シートに また 出るよ</div>' : '') +
      '<div style="font-size:12px;font-weight:900;color:#9d174d;margin-bottom:4px;">📄 コースを えらんで 印刷（10問）</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">' + COURSES.filter(function (c) { return c.id !== "miss" || m; }).map(function (c) {
        var n = c.id === "mix" ? BANK.length : c.id === "miss" ? m : BANK.filter(function (b) { return b.k === c.id; }).length;
        return '<button style="' + BTN + 'padding:9px 6px;font-size:13px;color:#831843;background:' + (c.id === "mix" ? "linear-gradient(135deg,#fbcfe8,#e9d5ff)" : "#fdf2f8") + ';line-height:1.35;" onclick="window.printKanjiSheet(\'' + c.id + '\')">' + c.name + '<br><span style="font-size:10.5px;font-weight:700;color:#9d174d;">' + c.sub + '（' + n + '）</span></button>';
      }).join("") + '</div>' +
      '<div style="display:grid;gap:8px;">' +
        '<button style="' + BTN + 'padding:11px;font-size:14px;color:#065f46;background:#d1fae5;" onclick="window.kanjiCheckForm()">✅ 丸つけ' + (last ? '（シート No.' + last.no + '）' : '') + '</button>' +
        '<button style="' + BTN + 'padding:9px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.closeKanjiSheet()">とじる</button>' +
      '</div>'
    );
  };

  window.printKanjiSheet = function (course) {
    course = course || "mix";
    var no = 1000 + Math.floor(Math.random() * 9000), all = missed(), cb = function (id) { var w = BANK.filter(function (b) { return b.id === Number(id); })[0]; return w && (course === "mix" || course === "miss" || w.k === course); };
    var prio = all.filter(cb).slice(0, course === "miss" ? 10 : 5);
    var ids = make(no, prio, course).map(function (w) { return w.id; });
    if (window.saveData) { window.saveData.kanjiLastSheet = { no: no, ids: ids, c: course }; if (window.saveGame) window.saveGame(); }
    window.open("./kanji_sheet.html?no=" + no + "&c=" + course + (prio.length ? "&p=" + prio.join(".") : ""), "_blank");
    window.openKanjiSheet();
  };

  window.kanjiCheckForm = function () {
    var last = (window.saveData || {}).kanjiLastSheet;
    if (!last) { alert("まだ シートを 印刷して いないよ。「新しい シートを 印刷する」から はじめよう！"); return; }
    var words = last.ids.map(function (id) { return BANK.filter(function (b) { return b.id === id; })[0]; }).filter(Boolean);
    window._kanjiMarks = {};
    var rows = words.map(function (w, i) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed #e9d5ff;">' +
        '<div style="flex:1;font-weight:800;color:#4a3b52;font-size:13px;">(' + (i + 1) + ') ' + w.r + '<br><span style="font-size:22px;color:#db2777;">' + w.a + '</span></div>' +
        '<button id="km-o' + i + '" style="' + BTN + 'width:46px;height:40px;font-size:20px;background:#f1f5f9;" onclick="window.kanjiMark(' + i + ',true)">⭕</button>' +
        '<button id="km-x' + i + '" style="' + BTN + 'width:46px;height:40px;font-size:20px;background:#f1f5f9;" onclick="window.kanjiMark(' + i + ',false)">🔁</button></div>';
    }).join("");
    shell('<div style="font-size:17px;font-weight:900;color:#065f46;text-align:center;">✅ 書き取りの 丸つけ（No.' + last.no + '）</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-soft);text-align:center;margin:4px 0 8px;line-height:1.6;">赤い 字と くらべて、とめ・はね・はらいまで 合って いたら ⭕。<br>ちがったら 🔁（次の シートで もう一度）。</div>' + rows +
      '<button style="' + BTN + 'width:100%;margin-top:10px;padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#10b981,#059669);" onclick="window.kanjiSubmit()">丸つけ おわり</button><div id="km-result" style="margin-top:10px;"></div>');
    window._kanjiWords = words;
  };
  window.kanjiMark = function (i, ok) {
    window._kanjiMarks[i] = ok;
    var o = document.getElementById("km-o" + i), x = document.getElementById("km-x" + i);
    if (o) o.style.background = ok ? "#fecdd3" : "#f1f5f9"; if (x) x.style.background = ok ? "#f1f5f9" : "#bfdbfe";
  };
  window.kanjiSubmit = function () {
    var words = window._kanjiWords || [], marks = window._kanjiMarks || {};
    if (Object.keys(marks).length < words.length) { alert("ぜんぶの 言葉に ⭕ か 🔁 を つけてね"); return; }
    var sd = window.saveData || {}, ok = 0, wrongIds = [], last = sd.kanjiLastSheet || {};
    words.forEach(function (w, i) { if (marks[i]) ok++; else wrongIds.push(w.id); });
    var miss = missed().filter(function (id) { return !words.some(function (w, i) { return w.id === id && marks[i]; }); });
    wrongIds.forEach(function (id) { if (miss.indexOf(id) < 0) miss.push(id); });
    sd.kanjiMissed = miss.slice(-20);
    sd.kanjiChecks = Array.isArray(sd.kanjiChecks) ? sd.kanjiChecks : [];
    var t = today(), already = sd.kanjiChecks.some(function (c) { return c.no === last.no; }), rewardedToday = sd.kanjiChecks.some(function (c) { return c.d === t && c.rewarded; });
    var reward = (!already && !rewardedToday) ? ok : 0;
    sd.q = (sd.q || 0) + reward;
    sd.kanjiChecks.push({ no: last.no, d: t, ok: ok, rewarded: reward > 0 }); if (sd.kanjiChecks.length > 10) sd.kanjiChecks = sd.kanjiChecks.slice(-10);
    if (window.saveGame) window.saveGame(); if (window.updateUI) window.updateUI();
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "✍️漢字シート", msg: "No." + last.no + (last.c && last.c !== "mix" ? "（" + ((COURSES.filter(function (c) { return c.id === last.c; })[0] || {}).name || last.c).replace(/^\S+ /, "") + "）" : "") + " ⭕" + ok + "/" + words.length + (wrongIds.length ? " 🔁" + wrongIds.map(function (id) { return BANK.filter(function (b) { return b.id === id; })[0].a; }).join("・") : "") + " +" + reward + "Q" });
    var res = document.getElementById("km-result");
    if (res) res.innerHTML = '<div style="background:#ecfdf5;border-radius:14px;padding:10px;text-align:center;font-weight:900;color:#065f46;">⭕ ' + ok + ' ／ ' + words.length + (reward ? '　🎁 +' + reward + 'Q' : '') +
      (wrongIds.length ? '<div style="font-size:12px;color:#b45309;margin-top:6px;">🔁 の 言葉は 次の シートに また 出るよ。ゆっくり 書いて おぼえよう！</div>' : '<div style="font-size:12px;margin-top:4px;">ぜんぶ ⭕！ すごい！</div>') + '</div>';
  };

  // 漢字の ステージの 説明画面に ボタンを 足す
  var ob = window.openBriefing;
  if (typeof ob === "function") {
    window.openBriefing = function (stg) {
      var r = ob.apply(this, arguments);
      try {
        if (stg && /漢検|漢字/.test(String(stg.id))) {
          var z = document.getElementById("br-buttons-zone");
          if (z) { var b = document.createElement("button"); b.className = "br-btn"; b.style.cssText = "background:#fce7f3;color:#9d174d;"; b.textContent = "✍️ 紙の 書き取りシートで 練習する"; b.onclick = function () { window.closeBriefing(); window.openKanjiSheet(); }; z.appendChild(b); }
        }
      } catch (e) {}
      return r;
    };
  }
})();
