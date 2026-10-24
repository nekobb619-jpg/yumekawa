/* =====================================================================
   js/school-units.js — 学校で いつ 何を 習うか（単元カレンダー）
   ★2026-10-16追加（保護者：いま 習って いる 単元を ステージ一覧・探偵ラボ・自学ノートの 上に）
   - データは こども学習サポートポータルの「単元カレンダー」（教科書の 年間計画を 学校の 予定で 直した もの）の 写し。
     ポータルの 日付を 直したら、ここも 同じに する。term "0" は 通年（いつも ある ので「いま」には 入れない）。
   - ★2026-10-18：Mochi Mona（nekobb619-jpg/mochi-mona）が この ファイルを ミラーして いる（id は 共通の キー）。
     ここを 変えたら mochi-mona で `node tools/sync-school-units.mjs <この ファイル>` を 実行して PR に する。
   - u007（2けたで わる わり算の 筆算）は 計画では 9/30 まで だが、9/29 から 習い はじめ、10/13 の 宿題・10/14 の テスト返却が
     あった ので 10/23 まで のばして ある。
   - window.schoolUnitsNow() → { now: [単元], soon: [単元] }（soon ＝ 7日 いないに 始まる）
   - window.schoolStageRank(stageId) → 0 いま／1 もうすぐ／2 それ いがい
   - window.schoolJigakuRank(title) → 自学ネタの 題名で 同じ ランク
   ===================================================================== */
(function () {
  "use strict";
  window.SCHOOL_UNITS = [
    {"id": "u001", "name": "角とその大きさ", "subject": "算数", "from": "2026-04-08", "to": "2026-04-24", "term": "1", "stages": ["算数/角度/kakudo01", "算数/角度/kakudo_zu01", "算数/角度/setsumei01"], "jigaku": []},
    {"id": "u002", "name": "折れ線グラフ", "subject": "算数", "from": "2026-04-20", "to": "2026-05-08", "term": "1", "stages": ["算数/グラフ/oresen01", "算数/グラフ/oresen_yomi01"], "jigaku": []},
    {"id": "u003", "name": "1けたでわるわり算の筆算", "subject": "算数", "from": "2026-05-08", "to": "2026-05-29", "term": "1", "stages": ["算数/わり算/hissan_amari01", "算数/わり算/hissan_3keta01", "算数/わり算/hissan_amari02", "算数/わり算/warizan301"], "jigaku": []},
    {"id": "u004", "name": "一億をこえる数", "subject": "算数", "from": "2026-05-25", "to": "2026-06-10", "term": "1", "stages": ["算数/大きな数/ookazu01"], "jigaku": []},
    {"id": "u005", "name": "垂直・平行と四角形", "subject": "算数", "from": "2026-06-08", "to": "2026-06-30", "term": "1", "stages": ["算数/図形/suichoku_heikou01", "算数/図形/shikakukei_bunrui01", "算数/図形/taikakusen01"], "jigaku": []},
    {"id": "u006", "name": "小数（しくみ・たし算ひき算）", "subject": "算数", "from": "2026-06-24", "to": "2026-07-17", "term": "1", "stages": ["算数/小数/shosu01", "算数/小数/shosu_keisan01"], "jigaku": []},
    {"id": "u007", "name": "2けたでわるわり算の筆算", "subject": "算数", "from": "2026-09-01", "to": "2026-10-16", "term": "2", "stages": ["算数/わり算/hissan_2digit01", "算数/わり算/warizan_challenge01", "算数/わり算/nakama_wake01"], "jigaku": ["仮の 商が 大きすぎた！", "÷2けたの 問題づくりと 見当", "4けた ÷ 2けたで 0 を わすれた！", "4けた ÷ 2けたの 筆算 手じゅん書"]},
    {"id": "u008", "name": "式と計算の順じょ", "subject": "算数", "from": "2026-09-24", "to": "2026-10-30", "term": "2", "stages": ["算数/式と計算/keisan_junjo01", "算数/式と計算/kakewari_erabu01"], "jigaku": ["計算の 順じょ", "（ ）が ある 式と ない 式", "1つの 式に 表す 文章問題づくり", "式から お話を 作る"]},
    {"id": "u009", "name": "面積", "subject": "算数", "from": "2026-11-02", "to": "2026-11-20", "term": "2", "stages": ["算数/面積/menseki_1", "算数/面積/menseki_2", "算数/面積/menseki_3"], "jigaku": ["1㎡は 何㎠？", "家の 中の 面積しらべ"]},
    {"id": "u010", "name": "がい数とその計算", "subject": "算数", "from": "2026-11-02", "to": "2026-11-18", "term": "2", "stages": ["算数/がい数/gaisu01"], "jigaku": ["がい数の 見積もり", "がい数 さがし（新聞・チラシ・ニュース）"]},
    {"id": "u011", "name": "小数のかけ算・わり算", "subject": "算数", "from": "2026-11-16", "to": "2026-12-18", "term": "2", "stages": [], "jigaku": []},
    {"id": "u012", "name": "調べ方と整理のしかた", "subject": "算数", "from": "2027-01-12", "to": "2027-01-22", "term": "3", "stages": ["探究/データ/data01"], "jigaku": []},
    {"id": "u013", "name": "分数", "subject": "算数", "from": "2027-01-25", "to": "2027-02-10", "term": "3", "stages": ["算数/分数/bunsu01"], "jigaku": []},
    {"id": "u014", "name": "変わり方", "subject": "算数", "from": "2027-02-08", "to": "2027-02-19", "term": "3", "stages": [], "jigaku": []},
    {"id": "u015", "name": "直方体と立方体", "subject": "算数", "from": "2027-02-17", "to": "2027-03-10", "term": "3", "stages": [], "jigaku": []},
    {"id": "u016", "name": "春の生き物", "subject": "理科", "from": "2026-04-08", "to": "2026-04-30", "term": "1", "stages": ["理科/季節と生き物/kisetsu01"], "jigaku": []},
    {"id": "u017", "name": "天気と1日の気温", "subject": "理科", "from": "2026-05-01", "to": "2026-05-22", "term": "1", "stages": [], "jigaku": []},
    {"id": "u018", "name": "地面を流れる水のゆくえ", "subject": "理科", "from": "2026-05-11", "to": "2026-05-29", "term": "1", "stages": ["理科/雨水/amamizu01"], "jigaku": []},
    {"id": "u019", "name": "電気のはたらき", "subject": "理科", "from": "2026-06-01", "to": "2026-06-30", "term": "1", "stages": ["理科/電気/denki01"], "jigaku": []},
    {"id": "u020", "name": "夏の生き物・夏の夜空", "subject": "理科", "from": "2026-07-01", "to": "2026-07-17", "term": "1", "stages": ["理科/星/hoshi01", "理科/季節と生き物/kisetsu01"], "jigaku": ["季節で 星座が ちがうのは なぜ？", "7月と 10月の 夏の大三角"]},
    {"id": "u021", "name": "月や星の動き", "subject": "理科", "from": "2026-09-01", "to": "2026-09-30", "term": "2", "stages": ["理科/星/hoshi01", "理科/星/kansatsu01"], "jigaku": ["季節で 星座が ちがうのは なぜ？", "北極星は なぜ 動かない？", "月は どうして 形が 変わる？", "星の 色が ちがうのは？", "7月と 10月の 夏の大三角"]},
    {"id": "u022", "name": "とじこめた空気や水", "subject": "理科", "from": "2026-09-14", "to": "2026-10-30", "term": "2", "stages": ["理科/空気と水/kuki_mizu01"], "jigaku": ["空気と 水を とじこめて おすと"]},
    {"id": "u023", "name": "ヒトの体のつくりと運動", "subject": "理科", "from": "2026-05-07", "to": "2026-05-29", "term": "1", "stages": ["理科/体/karada01"], "jigaku": ["人の 骨は 何本？", "きん張すると ドキドキするのは？", "自分で くすぐっても くすぐったくない？"]},
    {"id": "u024", "name": "秋の生き物", "subject": "理科", "from": "2026-11-02", "to": "2026-11-20", "term": "2", "stages": ["理科/季節と生き物/kisetsu01"], "jigaku": ["秋に なると ツバメは？", "春・夏・秋の 生き物くらべ", "まいにち 観察日記"]},
    {"id": "u025", "name": "ものの温度と体積", "subject": "理科", "from": "2026-11-09", "to": "2026-12-18", "term": "2", "stages": [], "jigaku": []},
    {"id": "u026", "name": "冬の夜空・冬の生き物", "subject": "理科", "from": "2027-01-08", "to": "2027-01-29", "term": "3", "stages": ["理科/季節と生き物/kisetsu01", "理科/星/kansatsu01"], "jigaku": []},
    {"id": "u027", "name": "もののあたたまり方", "subject": "理科", "from": "2027-01-12", "to": "2027-02-05", "term": "3", "stages": ["理科/あたたまり方/atatamari01"], "jigaku": ["熱の 伝わり方を 観察しよう"]},
    {"id": "u028", "name": "水のすがた", "subject": "理科", "from": "2027-02-01", "to": "2027-02-26", "term": "3", "stages": ["理科/水のすがた/sugata01"], "jigaku": ["氷と 水、水じょう気"]},
    {"id": "u029", "name": "水のゆくえ（蒸発・結露）", "subject": "理科", "from": "2027-03-01", "to": "2027-03-19", "term": "3", "stages": ["理科/水のすがた/sugata02"], "jigaku": ["暑い 日は 洗たく物が かわきやすい？"]},
    {"id": "u030", "name": "生き物の1年間", "subject": "理科", "from": "2027-03-01", "to": "2027-03-19", "term": "3", "stages": ["理科/季節と生き物/kisetsu01"], "jigaku": []},
    {"id": "u031", "name": "実験の計画（通年）", "subject": "理科", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["理科/実験計画/exp_design01"], "jigaku": ["光を 分けて みよう", "折れ曲がる 光を 見よう", "結しょうを 作ろう", "磁石に つく 物を さがそう"]},
    {"id": "u032", "name": "わたしたちの県", "subject": "社会", "from": "2026-04-08", "to": "2026-05-08", "term": "1", "stages": ["社会/愛知/aichi01", "社会/都道府県/todofuken01", "社会/都道府県/todofuken02", "社会/都道府県/kenchou01", "社会/地図/nairiku01", "社会/地図/chizuyomi01"], "jigaku": ["尾張と 三河", "小牧市 特集", "愛知県の 日本一"]},
    {"id": "u033", "name": "水はどこから", "subject": "社会", "from": "2026-05-11", "to": "2026-06-12", "term": "1", "stages": ["社会/水道/josuijo01"], "jigaku": []},
    {"id": "u034", "name": "ごみのしょりと利用", "subject": "社会", "from": "2026-06-15", "to": "2026-07-17", "term": "1", "stages": ["社会/ごみ/gomi01"], "jigaku": []},
    {"id": "u035", "name": "自然災害からくらしを守る", "subject": "社会", "from": "2026-09-01", "to": "2026-09-30", "term": "2", "stages": ["社会/防災/bousai01", "社会/防災/saigai02"], "jigaku": []},
    {"id": "u036", "name": "きょう土の伝統・文化と先人たち", "subject": "社会", "from": "2026-10-01", "to": "2026-12-18", "term": "2", "stages": ["社会/先人/senjin01", "社会/愛知/aichi02"], "jigaku": ["愛知用水", "明治用水と 愛知用水"]},
    {"id": "u037", "name": "特色ある地いきと人々のくらし", "subject": "社会", "from": "2027-01-08", "to": "2027-03-19", "term": "3", "stages": ["社会/愛知/aichi02"], "jigaku": ["愛知県の 日本一"]},
    {"id": "u038", "name": "物語「白いぼうし」", "subject": "国語", "from": "2026-04-08", "to": "2026-04-30", "term": "1", "stages": ["国語/読解/kosoado01"], "jigaku": []},
    {"id": "u039", "name": "説明文（結果と考察）", "subject": "国語", "from": "2026-05-01", "to": "2026-06-19", "term": "1", "stages": ["国語/論理/inga01"], "jigaku": []},
    {"id": "u040", "name": "漢字辞典・都道府県の漢字", "subject": "国語", "from": "2026-06-15", "to": "2026-07-10", "term": "1", "stages": ["国語/漢字/kanji01", "国語/漢字/onyomi_kunyomi01", "社会/都道府県/todofuken01"], "jigaku": []},
    {"id": "u041", "name": "物語「一つの花」（修飾語）", "subject": "国語", "from": "2026-10-01", "to": "2026-10-23", "term": "2", "stages": ["国語/修飾語/shushoku01"], "jigaku": ["物語「一つの花」場面と 気持ち"]},
    {"id": "u042", "name": "物語「ごんぎつね」（情景）", "subject": "国語", "from": "2026-10-19", "to": "2026-11-20", "term": "2", "stages": ["国語/読解/dokkai6_01", "国語/読解/monogatari01"], "jigaku": ["物語「ごんぎつね」ごんの 気持ちの 変化"]},
    {"id": "u043", "name": "いろいろな意味を表す漢字", "subject": "国語", "from": "2026-11-09", "to": "2026-11-27", "term": "2", "stages": ["国語/漢字/tsukaiwake01"], "jigaku": ["いろいろな 意味を 表す 漢字"]},
    {"id": "u044", "name": "説明文の要約", "subject": "国語", "from": "2026-12-01", "to": "2026-12-18", "term": "2", "stages": ["国語/論理/equal01"], "jigaku": []},
    {"id": "u045", "name": "熟語のでき方", "subject": "国語", "from": "2027-01-08", "to": "2027-01-29", "term": "3", "stages": ["国語/漢字/jukugo01"], "jigaku": []},
    {"id": "u046", "name": "筆者の考えと自分の考え", "subject": "国語", "from": "2027-01-18", "to": "2027-02-05", "term": "3", "stages": ["国語/論理/tairitsu01"], "jigaku": []},
    {"id": "u047", "name": "読点の打ち方・作文", "subject": "国語", "from": "2027-02-01", "to": "2027-02-26", "term": "3", "stages": ["国語/言葉/setsuzoku01"], "jigaku": []},
    {"id": "u048", "name": "慣用句・ことば（通年）", "subject": "国語", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["国語/慣用句/kanyoku01", "国語/ローマ字/romaji301"], "jigaku": []},
    {"id": "u049", "name": "漢字（4年・漢検7級）", "subject": "国語", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["漢検/7級/dai1kai", "漢検/7級/dai2kai", "国語/漢字/tsukaiwake01"], "jigaku": ["同じ 部首の 漢字あつめ"]},
    {"id": "u050", "name": "外国語活動（通年）", "subject": "英語", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["英語/あいさつ/english401", "英語/曜日と天気/english403", "英語/時刻/english404", "英語/文房具/english405", "英語/学校の場所/english406", "英語/一日の生活/english407", "英語/メニュー/english402"], "jigaku": []},
    {"id": "u051", "name": "総合（テーマ探究）【環境】未来の地球を守ろう", "subject": "探究", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["社会/ごみ/gomi01", "社会/水道/josuijo01", "探究/調べ方/shirabe01", "探究/データ/data01"], "jigaku": []},
    {"id": "u052", "name": "総合（情報教育）プログラミング・情報モラル", "subject": "探究", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["探究/プログラミング/prog01", "探究/プログラミング/prog02", "探究/情報/net_ethics01", "探究/情報/net_ethics02"], "jigaku": []},
    {"id": "u053", "name": "総合（My探究）こまき「夢☆チャレンジ」科", "subject": "探究", "from": "2026-04-08", "to": "2027-03-19", "term": "0", "stages": ["探究/設計/engineering01", "探究/調べ方/shirabe01", "探究/分岐図解/bunki01", "探究/分岐図解/bunki02"], "jigaku": []}
  ];
  var SOON_DAYS = 7;
  function ymd(ms) { var d = new Date(ms); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function addDays(s, n) { var p = s.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return ymd(d.getTime()); }
  window.schoolToday = function () { return ymd(window.currentServerTime || Date.now()); };
  window.schoolUnitsNow = function (today) {
    var t = today || window.schoolToday(), soonEnd = addDays(t, SOON_DAYS), now = [], soon = [];
    window.SCHOOL_UNITS.forEach(function (u) {
      if (u.term === "0") return;
      if (u.from <= t && t <= u.to) now.push(u);
      else if (u.from > t && u.from <= soonEnd) soon.push(u);
    });
    return { now: now, soon: soon };
  };
  function rankBy(test, today) {
    var s = window.schoolUnitsNow(today);
    if (s.now.some(test)) return 0;
    if (s.soon.some(test)) return 1;
    return 2;
  }
  window.schoolStageRank = function (stageId, today) {
    if (!stageId) return 2;
    return rankBy(function (u) { return u.stages.indexOf(stageId) !== -1; }, today);
  };
  window.schoolJigakuRank = function (title, today) {
    if (!title) return 2;
    return rankBy(function (u) { return u.jigaku.indexOf(title) !== -1; }, today);
  };
  // いま／もうすぐ の 単元名（ステージ id から）
  window.schoolUnitOfStage = function (stageId, today) {
    var s = window.schoolUnitsNow(today), all = s.now.concat(s.soon);
    for (var i = 0; i < all.length; i++) if (all[i].stages.indexOf(stageId) !== -1) return all[i];
    return null;
  };
})();
