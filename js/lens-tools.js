/* =====================================================================
   lens-tools.js — 🔭 見方レンズ（★2026-11-11 保護者：専門家は レンズ・フィルター・フレームワーク・レイヤー・可視化を
   その場で 切りかえ、問題に 名札（メタラベル）を はれる。少しずつ 自然に 育てたい）
   ① 🔭 どの どうぐ？：問題を 解かずに「どの 道具で 考える？」を えらぶ（トリガ判断）。
      ・ハブの 5問チャレンジ ＋ ⚡すらすら ふくしゅうに 1まい まぜる（window.lensToolCard → js/speed-review.js）
   ② 🏷 名札はり：その日 はじめての ステージ クリアの あと、「今の 問題は どんな なかま？」を えらぶ（正解なし）。
      ニコの 見方（ステージ名からの 目安）も 見せる。「見方は 1つじゃない」。集めた 名札は 図鑑に たまる。
   ③ 👓 3つの レンズ：自学ノート a_lens（js/jigaku-note.js）。
   ごほうび：シールの かけら（どの どうぐ？ 5問 ぜんぶ 正解で +2、名札はりで +1。1日 1回ずつ）。Q は なし。
   saveData.lens = { tool: { id: [出た, 正解] }, tags: { 名札: 回数 }, tagD: 名札はりの 日, toolD: どうぐの ごほうびの 日, log: [{d, s, t, n}]（さいご 40） }
   ===================================================================== */
(function () {
  "use strict";
  var TOOLS = {
    senbun: { icon: "📏", name: "線分図", when: "「あわせて」「ちがい」「〇倍」が 出て くる とき。2本の 線で 長さを くらべる" },
    hyo: { icon: "📋", name: "表に する", when: "組み合わせ・試合・ぜんぶの 場合を もれなく 数える とき" },
    zu: { icon: "🖼", name: "図や 絵に かく", when: "形・場所・木と 木の 間など、目で 見ると 分かる とき" },
    gyaku: { icon: "⏪", name: "逆から 考える", when: "さいごの 数が 分かって いて、はじめを 聞かれた とき" },
    kimari: { icon: "🔍", name: "きまりを さがす", when: "数や 形が くりかえし 続いて「〇番目は？」と 聞かれた とき" },
    mitsumori: { icon: "🧮", name: "だいたいで 考える", when: "「足りる？」「だいたい？」など、ぴったりで なくて いい とき" },
    wakeru: { icon: "🗂", name: "なかま分け", when: "いろいろな ものを 決まりで 分けて、数えたり 整理したり する とき" },
    baizu: { icon: "📐", name: "倍の 図", when: "「〇〇の □倍」が 出て くる とき。もとの 大きさ → □倍 → いまの 大きさ（学校の 図）" }
  };
  // [id, 問題文, 正解の 道具, まちがいの 道具 2つ（その 問題では 使いにくい もの）, ひとこと]
  var ITEMS = [
    [1, "姉と 妹の カードは あわせて 30まい。姉は 妹より 6まい 多い。妹は 何まい？", "senbun", ["kimari", "mitsumori"], "「あわせて」と「ちがい」が 出て きたら 線分図。2本の 線に すると、6まいの ちがいが 目で 見える。"],
    [2, "ある 数に 5を たして、3倍したら 36に なった。ある 数は？", "gyaku", ["hyo", "wakeru"], "さいごの 36から 「÷3 → −5」と もどれば いい。逆から 考える 問題。"],
    [3, "1、4、7、10、… と ならぶ。20番目の 数は？", "kimari", ["senbun", "mitsumori"], "3ずつ ふえる きまりを 見つければ、20番目まで 書かなくても 分かる。"],
    [4, "1こ 98円の パンを 4こ 買う。400円で 足りる？", "mitsumori", ["gyaku", "wakeru"], "98円は 100円より 少し 安い。100円×4＝400円より 少ないから 足りる。だいたいで すぐ 分かる。"],
    [5, "まっすぐな 20mの 道に、はしから はしまで 5mおきに 木を 植える。木は 何本？", "zu", ["gyaku", "wakeru"], "20÷5＝4本と しやすいけど、図に かくと 両はしが あって 5本だと 分かる。"],
    [6, "Tシャツが 3色、ズボンが 2色。組み合わせは 何通り？", "hyo", ["gyaku", "mitsumori"], "表に すると もれも ダブりも なく 数えられる。3×2＝6通り。"],
    [7, "家に ある 道具を「電気を 使う」「使わない」に 分けて、それぞれ いくつか 調べる。", "wakeru", ["gyaku", "senbun"], "決まりを 決めて 分けると、数えやすく、くらべやすく なる。"],
    [8, "1円玉・5円玉・10円玉で、ちょうど 16円を はらう 方法を ぜんぶ 見つける。", "hyo", ["gyaku", "mitsumori"], "10円玉の まい数ごとに 表に して いくと、もれなく 見つかる。"],
    [9, "タイルを 1だん目 1まい、2だん目 3まい、3だん目 5まい… と ならべる。10だん目は 何まい？", "kimari", ["mitsumori", "wakeru"], "2まいずつ ふえる きまり。だん数×2−1 で 出せる。"],
    [10, "A小の 児童は 312人、B小は 289人。だいたい 何人 ちがう？", "mitsumori", ["gyaku", "hyo"], "310人と 290人と 見れば、だいたい 20人。「だいたい」と 聞かれたら がい数。"],
    [11, "テープを 半分に 切り、その 半分を また 半分に 切ったら 3cmに なった。はじめの 長さは？", "gyaku", ["wakeru", "mitsumori"], "3cmから ×2、×2と もどる。逆から 考えると 12cm。"],
    [12, "地図で、家から 北へ 2マス、東へ 3マス 進んだ ところに 何が ある？", "zu", ["senbun", "kimari"], "方位と マスは 図で 指で たどると まちがえない。"],
    [13, "Aさんは Bさんより 5才 上。Bさんは Cさんより 3才 上。Aさんと Cさんは 何才 ちがう？", "senbun", ["wakeru", "mitsumori"], "3人の 年を 線に ならべると、5＋3＝8才の ちがいが 見える。"],
    [14, "1こ 45円の おかしを 5こと、110円の ジュースを 1本 買う。500円で 足りる？", "mitsumori", ["kimari", "wakeru"], "45円を 50円と 見て 250円、ジュースを 合わせても 400円くらい。足りる。"],
    [15, "赤い 花は 白い 花の 3倍。あわせて 24本。白い 花は 何本？", "senbun", ["kimari", "wakeru"], "白を 1つ分、赤を 3つ分の 線に すると、4つ分で 24本。1つ分は 6本。"],
    [16, "○△○△○△… と ならぶ。25番目は ○と △の どっち？", "kimari", ["senbun", "mitsumori"], "2つで 1セットの くりかえし。奇数番目は ○。"],
    [17, "朝 いくらか 持って いた。100円 使い、200円 もらったら 500円に なった。朝は いくら？", "gyaku", ["hyo", "zu"], "500円から −200円、＋100円と 逆に もどる。400円。"],
    [18, "正方形の 紙を 2回 半分に おって、かどを 三角に 切る。ひらくと どんな 形？", "zu", ["mitsumori", "senbun"], "頭の 中だけでは むずかしい。図に かいて、おり目を たどると 分かる。"],
    [19, "生き物カードを「こん虫」「こん虫で ない」に 分けて、こん虫が 何まいか 調べる。", "wakeru", ["gyaku", "mitsumori"], "体が 3つに 分かれて 足が 6本 など、決まりで 分けると まよわない。"],
    [20, "4人が 1回ずつ じゃんけんの 試合を する。全部で 何試合？", "hyo", ["mitsumori", "senbun"], "対戦表に すると、同じ 試合を 2回 数えずに すむ。6試合。"],
    [21, "1週間の 気温を、朝・昼・夜に 分けて 書いて おき、いちばん あたたかい 時間を 見つける。", "hyo", ["gyaku", "senbun"], "日と 時間を たて・よこに した 表に すると、くらべやすい。"],
    [22, "教室の ゆかに、たて 2m・よこ 3mの マットを しく。ほかの 机は どこに おける？", "zu", ["kimari", "gyaku"], "場所の 問題は、教室の 図を かいて マットを 書きこむと すぐ 分かる。"],
    // ★2026-11-11 学級通信 No.125（割合）：倍の 図
    [23, "Lサイズは Sサイズの 3倍で 450mL。Sサイズは 何mL？", "baizu", ["kimari", "wakeru"], "「Sサイズの 3倍」→ もとは Sサイズ。□ → ×3 → 450mL の 図に すると、450÷3 と 分かる。"],
    [24, "ヒマワリは 植えた とき 8cm、いまは 24cm。いまは 植えた ときの 何倍？", "baizu", ["gyaku", "wakeru"], "もと 8cm → □倍 → いま 24cm。□が 倍の ところだから 24÷8。"],
    [25, "ノートは えんぴつの 2倍、ふでばこは ノートの 4倍。ふでばこは えんぴつの 何倍？", "baizu", ["mitsumori", "wakeru"], "えんぴつ → ×2 → ノート → ×4 → ふでばこ と 図を つなげる。倍の 倍は かけ算で 8倍。"]
  ].map(function (x) { return { id: x[0], q: x[1], t: x[2], ng: x[3], why: x[4] }; });

  /* ★2026-11-11 🗃 モデル図鑑（保護者：ラボの 体験を モデル・フレームワークの 判断に）。
     ラボを ひらく（js/daily-lab.js → lensModelSeen）か「どの モデル？」で 正解すると カードが ひらく。saveData.lens.models {id: 日}、lens.mq {問題id: [出た, 正解]} */
  var MODELS = {
    shuki: { icon: "🎡", name: "くりかえし（周期）", say: "行って もどる。しばらく たつと もとに もどる", life: "ブランコ・1年の 気温・月の 形・1週間", labs: ["lab/算数/lab_mawaru_nami.html", "lab/理科/lab_hoshi_ugoki.html", "lab/理科/lab_kisetsu.html"] },
    tsuriai: { icon: "⚖️", name: "つりあい", say: "両方が 同じに なる ところを さがす", life: "シーソー・おこづかいの 入る お金と 使う お金", labs: ["lab/算数/lab_balance.html", "lab/算数/lab_maker_tenbin.html"] },
    joken: { icon: "🧪", name: "1つだけ かえて くらべる", say: "かえるのは 1つ。ほかは 同じに する", life: "紙ひこうきの つばさだけ かえて とばす", labs: ["lab/理科/lab_jouken_soroe.html", "lab/理科/lab_kuki_teppou.html"] },
    wakeru: { icon: "🗂", name: "もれなく 分ける", say: "決まりを 決めて、のこりなく 分ける", life: "本だなの 整理・生き物の なかま分け", labs: ["lab/算数/lab_nakama_sagashi.html", "lab/国語/lab_kanji_imi.html"] },
    junban: { icon: "🔗", name: "順番と つながり", say: "何が 先で、何が 原因で、どう なったか", life: "ねぼう → 朝ごはん ぬき → おなかが すく", labs: ["lab/社会/lab_narabe.html", "lab/国語/lab_gon_kimochi.html"] },
    kankei: { icon: "📈", name: "いっしょに 変わる", say: "片方が 変わると、もう 片方も 変わる", life: "気温が 上がると アイスが 売れる", labs: ["lab/理科/lab_ondo_taiseki.html", "lab/理科/lab_karada_ude.html", "lab/理科/lab_atatamari.html"] },
    hub: { icon: "🕸", name: "中心に 集めて 配る", say: "いったん まん中に 集めて、そこから 分ける", life: "大きな 倉庫から 家へ 荷物・連らくもう", labs: [] },
    yusen: { icon: "🥇", name: "先に やる ことを 決める", say: "どれから やるか、じゅんばんを 決める", life: "しゅくだいと 習い事と ゲームの 時間", labs: ["lab/算数/lab_keisan_junjo.html", "lab/算数/lab_hissan2.html", "lab/探究/lab_programming_block.html"] }
  };
  // [id, 場面, 正解の モデル, まちがい 2つ, ひとこと]
  var MITEMS = [
    [101, "ブランコが 前と うしろを 行ったり 来たり する。", "shuki", ["tsuriai", "hub"], "しばらく たつと もとの 場所に もどる。くりかえしの モデル。"],
    [102, "シーソーを 平らに したい。重い 人が まん中に 近づく。", "tsuriai", ["shuki", "junban"], "左と 右が 同じに なる ところを さがす。つりあいの モデル。"],
    [103, "どちらの ひりょうが よく 育つか。水や 日当たりは 同じに して くらべる。", "joken", ["hub", "shuki"], "ひりょうだけ かえて、ほかは 同じ。1つだけ かえて くらべる モデル。"],
    [104, "学級文庫を「物語」「図かん」「まんが」に 分けて ならべる。", "wakeru", ["shuki", "tsuriai"], "決まりを 決めて、のこりなく 分ける。もれなく 分ける モデル。"],
    [105, "ねぼうした → 朝ごはんを ぬいた → 3時間目に おなかが すいた。", "junban", ["tsuriai", "hub"], "何が 先で、何が 原因か を たどる。順番と つながりの モデル。"],
    [106, "気温が 高い 日ほど、アイスが よく 売れる。", "kankei", ["wakeru", "hub"], "気温が 変わると 売れる 数も 変わる。いっしょに 変わる モデル。"],
    [107, "町じゅうの 荷物を いったん 大きな 倉庫に 集めて、そこから 家に 配る。", "hub", ["shuki", "joken"], "まん中に 集めて から 配ると、運ぶ 道が 少なくて すむ。"],
    [108, "しゅくだい・習い事・ゲーム。時間が ない 日は 何から やるか 決める。", "yusen", ["shuki", "kankei"], "大事な ものから じゅんばんを 決める。先に やる ことを 決める モデル。"],
    [109, "1年の 気温は 夏に 高く、冬に 低く、また 夏に 高く なる。", "shuki", ["yusen", "wakeru"], "毎年 もとに もどる。くりかえしの モデル。"],
    [110, "おこづかいで、もらう お金より 使う お金が 多く ならない ように する。", "tsuriai", ["shuki", "wakeru"], "入る お金と 出る お金を くらべて つりあわせる。"],
    [111, "紙ひこうきの つばさの 形だけ かえて、とんだ きょりを くらべる。", "joken", ["hub", "yusen"], "かえるのは つばさだけ。投げ方や 紙は 同じに する。"],
    [112, "先生が 学級委員に 伝え、学級委員が はんごとに 伝える。", "hub", ["kankei", "shuki"], "まず 中心に 伝え、そこから 分かれて 広がる。"],
    [113, "水を あたためるほど、体積が 大きく なる。", "kankei", ["wakeru", "yusen"], "温度が 変わると 体積も 変わる。いっしょに 変わる モデル。"],
    [114, "ごんが いたずら → 後かい → つぐない と、気持ちが かわった わけを たどる。", "junban", ["tsuriai", "hub"], "出来事の じゅんと、気持ちが かわった 原因を つなげて 読む。"],
    [115, "運動会の じゅんびで、まず 道具を 出し、つぎに ならべ、さいごに たしかめる。", "yusen", ["shuki", "kankei"], "やる じゅんばんを 先に 決めて おくと、まよわない。"],
    [116, "ゴミを「もえる」「もえない」「しげん」に 分けて 出す。", "wakeru", ["kankei", "tsuriai"], "決まりで 分けて、どれにも 入らない ものが ない ように する。"]
  ].map(function (x) { return { id: x[0], q: x[1], t: x[2], ng: x[3], why: x[4], m: 1 }; });
  var TAGS = [
    { id: "kurabe", icon: "⚖️", name: "くらべる" }, { id: "henka", icon: "📈", name: "変わり方" }, { id: "inga", icon: "🔗", name: "原因と 結果" },
    { id: "kimari", icon: "🔍", name: "きまり" }, { id: "junban", icon: "🔢", name: "順番" }, { id: "nakama", icon: "🗂", name: "なかま分け" }, { id: "bubun", icon: "🧩", name: "部分と 全体" },
    { id: "shuki", icon: "🔁", name: "くりかえし" } // ★2026-11-11 周期（行って もどる）。中学の 三角関数・波の たね
  ];
  // ニコの 見方（ステージ id と 名前からの 目安。見方は 1つでは ないので「ニコは こう 思った」と して 出す）
  var NIKO = [
    [/星|月の|季節|1年|くりかえ|ふりこ/, "shuki"], [/グラフ|折れ線|変わり|温度|天気|1日|気温/, "henka"], [/くらべ|比べ|角|面積|大きさ|使い分け|にた|ちがい/, "kurabe"],
    [/体|電気|なぜ|理由|風水害|災害|水の|じょう発|もの/, "inga"], [/計算|式|きまり|順じょ|わり算|かけ算|筆算|パターン/, "kimari"],
    [/手順|ならべ|歴史|先人|昔|物語|お話|ごんぎつね|伝統/, "junban"], [/なかま|分類|生き物|漢字|部首|都道府県|地図|ことば/, "nakama"],
    [/小数|分数|がい数|割合|あまり|見積/, "bubun"]
  ];

  var $d = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function st() {
    var sd = window.saveData || {}; var o = sd.lens && typeof sd.lens === "object" ? sd.lens : (sd.lens = {});
    o.tool = o.tool || {}; o.tags = o.tags || {}; o.log = Array.isArray(o.log) ? o.log : []; return o;
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🔭見方レンズ", msg: msg }); } catch (e) {} }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }
  function shard(n, why) { try { return window.stickerAddShardsExternal ? window.stickerAddShardsExternal(n, why) : 0; } catch (e) { return 0; } }
  function dictOf(it) { return it.m ? MODELS : TOOLS; }
  function choicesOf(it) { var D = dictOf(it), ids = [it.t].concat(it.ng); return ids.map(function (k) { return D[k].icon + " " + D[k].name; }); }
  function record(id, ok) {
    var o = st(), m = id >= 100, bag = m ? (o.mq = o.mq || {}) : o.tool, r = bag[id] || [0, 0]; r[0]++; if (ok) r[1]++; bag[id] = r;
    // ★2026-11-11 分析用：どうぐ・モデルごとの 合計（勉強ノート v2 の「🧠 情報処理の 育ち」）。tk／mk = { key: [出た, 正解] }
    var it0 = (m ? MITEMS : ITEMS).filter(function (x) { return x.id === id; })[0];
    if (it0) { var agg = m ? (o.mk = o.mk || {}) : (o.tk = o.tk || {}), g = agg[it0.t] || [0, 0]; g[0]++; if (ok) g[1]++; agg[it0.t] = g; }
    if (m && ok) { var it = MITEMS.filter(function (x) { return x.id === id; })[0]; if (it) unlock(it.t); }
  }
  function unlock(mid) { var o = st(); o.models = o.models || {}; if (!o.models[mid] && MODELS[mid]) { o.models[mid] = today(); o.newM = mid; return mid; } return null; }
  window.lensModelSeen = function (labKey) {
    try { var k = String(labKey || ""), got = null; Object.keys(MODELS).forEach(function (id) { if (MODELS[id].labs.indexOf(k) >= 0 && !got) got = unlock(id); }); if (got) { log("モデル図鑑：" + MODELS[got].name + "（ラボで 発見）"); save(); } return got; } catch (e) { return null; }
  };
  // まだ 出て いない → 正解が 少ない じゅんに
  function pickItems(n, model) {
    var o = st(), bag = model ? (o.mq || {}) : o.tool;
    return shuffle((model ? MITEMS : ITEMS).slice()).sort(function (a, b) { var x = bag[a.id] || [0, 0], y = bag[b.id] || [0, 0]; return (x[0] > 0) - (y[0] > 0) || x[1] - y[1]; }).slice(0, n);
  }

  // ⚡すらすら ふくしゅう に まぜる 1まい（js/speed-review.js）
  window.lensToolCard = function () {
    // 1日おきに「どの どうぐ？」と「どの モデル？」
    var model = Math.floor((window.currentServerTime || Date.now()) / 86400000) % 2 === 1;
    var it = pickItems(1, model)[0]; if (!it) return null;
    return { k: "tool::" + it.id, sid: "tool", ch: true, tool: it.id, q: { q: (model ? "🗃 どの モデルの なかま？\n" : "🔭 どの どうぐで 考える？（とかなくて OK）\n") + it.q, a: choicesOf(it), c: 0, job_desc: it.why } };
  };
  window.lensToolAnswered = function (id, ok) { try { record(Number(id), ok); save(); } catch (e) {} };

  /* ---------------- 画面 ---------------- */
  var ui = null;
  var BTN = "display:block;width:100%;min-height:46px;margin-top:8px;border:2px solid #c7d2fe;border-radius:14px;background:#fff;color:#1e1b4b;font:800 14px 'Zen Maru Gothic',sans-serif;padding:8px 10px;text-align:left;cursor:pointer;";
  var BIG = "min-height:46px;border:none;border-radius:14px;padding:10px 18px;font:900 15px 'Zen Maru Gothic',sans-serif;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);cursor:pointer;";
  function shell(inner) {
    var w = $d("lens-modal");
    if (!w) {
      w = document.createElement("div"); w.id = "lens-modal"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "見方レンズ");
      w.style.cssText = "position:fixed;inset:0;z-index:10002;background:rgba(30,27,75,.5);display:flex;align-items:center;justify-content:center;padding:12px;";
      w.addEventListener("click", function (e) { if (e.target === w) close(); var b = e.target.closest && e.target.closest("[data-ln]"); if (b) act(b.getAttribute("data-ln"), b.getAttribute("data-v")); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $d("lens-modal")) close(); });
      document.body.appendChild(w);
    }
    w.innerHTML = '<div style="width:100%;max-width:440px;max-height:90vh;overflow-y:auto;background:#f8f7ff;border:3px solid #c7d2fe;border-radius:22px;padding:14px;font-family:\'Zen Maru Gothic\',sans-serif;color:#1e1b4b;">' + inner + '</div>';
    var f = w.querySelector("button"); if (f) try { f.focus(); } catch (e) {}
  }
  function close() { var w = $d("lens-modal"); if (w) w.remove(); ui = null; }

  function hubHtml() {
    var o = st(), tagN = TAGS.map(function (t) { return o.tags[t.id] || 0; }), mx = Math.max.apply(null, tagN.concat([1]));
    var tk = Object.keys(TOOLS).map(function (k) {
      var n = 0, ok = 0; ITEMS.forEach(function (it) { if (it.t === k) { var r = o.tool[it.id] || [0, 0]; n += r[0]; ok += r[1]; } });
      return '<div style="background:#fff;border-radius:12px;padding:6px 8px;"><b>' + TOOLS[k].icon + ' ' + TOOLS[k].name + '</b>' + (n ? '<span style="float:right;font-size:11px;color:#6366f1;">' + ok + '/' + n + '</span>' : '') + '<div style="font-size:11px;font-weight:700;color:#475569;line-height:1.5;">' + esc(TOOLS[k].when) + '</div></div>';
    }).join("");
    return '<div style="font-size:19px;font-weight:900;text-align:center;">🔭 見方レンズ</div>' +
      '<div style="font-size:12px;font-weight:700;color:#475569;text-align:center;margin:2px 0 8px;line-height:1.6;">ものしりな 人は、問題を 見た しゅんかんに「どの どうぐ？」「どんな なかま？」が 分かる。<br>解く 前に えらぶ 練習を しよう。</div>' +
      '<button type="button" data-ln="tool" style="' + BIG + 'width:100%;">🔭 どの どうぐ？ 5問（とかなくて OK）</button>' +
      '<button type="button" data-ln="model" style="' + BIG + 'width:100%;margin-top:8px;background:linear-gradient(135deg,#f59e0b,#ef4444);">🗃 どの モデル？ 5問（身のまわりの 場面）</button>' +
      '<button type="button" data-ln="nami" style="' + BIG + 'width:100%;margin-top:8px;background:linear-gradient(135deg,#06b6d4,#3b82f6);">🎡 回ると 波ラボ（レンズを かえて 見る）</button>' +
      modelZukan() +
      '<div style="font-size:13px;font-weight:900;margin-top:12px;">🧰 どうぐ図鑑</div><div style="display:grid;gap:6px;margin-top:4px;">' + tk + '</div>' +
      '<div style="font-size:13px;font-weight:900;margin-top:12px;">🏷 名札図鑑 <span style="font-size:11px;color:#64748b;">（ステージの あとに はった 名札）</span></div>' +
      '<div style="display:grid;gap:4px;margin-top:4px;">' + TAGS.map(function (t, i) { return '<div style="display:grid;grid-template-columns:7.5em 1fr 2em;gap:6px;align-items:center;font-size:12.5px;font-weight:800;"><span>' + t.icon + ' ' + t.name + '</span><span style="display:block;height:10px;background:#e0e7ff;border-radius:5px;overflow:hidden;"><span style="display:block;height:100%;width:' + Math.round(tagN[i] / mx * 100) + '%;background:#6366f1;"></span></span><span style="text-align:right;">' + tagN[i] + '</span></div>'; }).join("") + '</div>' +
      (tagN.some(function (n) { return !n; }) ? '<div style="font-size:11px;font-weight:700;color:#64748b;margin-top:4px;">まだ つかって いない 見方：' + TAGS.filter(function (t, i) { return !tagN[i]; }).map(function (t) { return t.name; }).join("・") + '</div>' : '') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;"><button type="button" data-ln="note" style="min-height:44px;border:2px dashed #c7d2fe;border-radius:12px;background:#fff;font:800 12.5px \'Zen Maru Gothic\',sans-serif;color:#4338ca;cursor:pointer;">👓 自学ノート<br>3つの レンズ</button><button type="button" data-ln="close" style="min-height:44px;border:none;border-radius:12px;background:#e0e7ff;font:900 14px \'Zen Maru Gothic\',sans-serif;color:#3730a3;cursor:pointer;">とじる</button></div>';
  }
  function modelZukan() {
    var o = st(), have = o.models || {}, n = Object.keys(MODELS).filter(function (k) { return have[k]; }).length;
    return '<div style="font-size:13px;font-weight:900;margin-top:12px;">🗃 モデル図鑑 <span style="font-size:11px;color:#64748b;">' + n + ' ／ ' + Object.keys(MODELS).length + '（ラボを ひらくか「どの モデル？」で 正解すると ふえる）</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;">' + Object.keys(MODELS).map(function (k) {
        var M = MODELS[k], on = !!have[k], nw = o.newM === k;
        return '<div style="background:' + (on ? "#fff" : "#f1f5f9") + ';border:2px solid ' + (nw ? "#f59e0b" : on ? "#c7d2fe" : "#e2e8f0") + ';border-radius:12px;padding:6px 8px;font-size:11.5px;font-weight:700;line-height:1.5;color:' + (on ? "#1e1b4b" : "#94a3b8") + ';">' +
          '<b style="font-size:13px;">' + (on ? M.icon : "❔") + ' ' + M.name + '</b>' + (nw ? ' <span style="color:#f59e0b;">NEW</span>' : '') + '<br>' + (on ? esc(M.say) + '<br><span style="color:#6366f1;">身のまわり：' + esc(M.life) + '</span>' : '？？？') + '</div>';
      }).join("") + '</div>';
  }
  function toolHtml() {
    var it = ui.items[ui.i], ch = choicesOf(it), D = dictOf(it);
    var head = '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;color:#4f46e5;"><span>' + (it.m ? "🗃 どの モデル？ " : "🔭 どの どうぐ？ ") + (ui.i + 1) + ' ／ ' + ui.items.length + '</span><span>⭕ ' + ui.ok + '</span></div>' +
      '<div style="font-size:15px;font-weight:900;background:#fff;border:2px solid #e0e7ff;border-radius:14px;padding:10px 12px;margin-top:6px;line-height:1.6;">' + esc(it.q) + '</div>' +
      '<div style="font-size:12px;font-weight:800;color:#6366f1;margin-top:6px;">' + (it.m ? "この 場面は どの モデルの なかま？" : "とかなくて いいよ。どの どうぐで 考えると 分かりやすい？") + '</div>';
    if (ui.res) {
      var ok = ui.res.ok;
      return head + '<div style="margin-top:8px;background:' + (ok ? "#ecfdf5" : "#fff7ed") + ';border-radius:14px;padding:10px 12px;font-size:13.5px;font-weight:800;line-height:1.7;">' + (ok ? "⭕ そう！ " : it.m ? "💡 この 場面は " : "💡 この 問題は ") + '<b>' + D[it.t].icon + ' ' + D[it.t].name + '</b>' + (ok ? "" : it.m ? " の なかまだよ" : " が 使いやすいよ") + '<br>' + esc(it.why) + '</div>' +
        '<div style="text-align:center;margin-top:10px;"><button type="button" data-ln="next" style="' + BIG + '">' + (ui.i + 1 < ui.items.length ? "つぎ ▶" : "おわり") + '</button></div>';
    }
    return head + ui.ord.map(function (j) { return '<button type="button" data-ln="ans" data-v="' + j + '" style="' + BTN + '">' + esc(ch[j]) + '</button>'; }).join("");
  }
  function endHtml() {
    var r = ui.reward;
    return '<div style="text-align:center;font-size:40px;">' + (ui.ok === ui.items.length ? "🏆" : ui.ok >= 3 ? "🔭" : "💪") + '</div>' +
      '<div style="text-align:center;font-size:16px;font-weight:900;">' + ui.items.length + '問中 ' + ui.ok + '問、' + (ui.model ? "モデルを" : "どうぐを") + ' 見ぬけた！</div>' + (ui.model ? modelZukan() : '') +
      '<div style="font-size:12.5px;font-weight:800;background:#fff;border-radius:14px;padding:10px 12px;margin-top:8px;line-height:1.7;">ふだんの 問題でも、とく 前に「どの どうぐ？」と 1びょう 考えて みよう。それが ものしりな 人の やり方だよ。' + (r ? "<br>🧩 シールの かけら +" + r : "") + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;"><button type="button" data-ln="hub" style="' + BIG + '">🔭 もどる</button></div>';
  }
  function render() { if (!ui) return; shell(ui.ph === "tool" ? toolHtml() : ui.ph === "end" ? endHtml() : ui.ph === "tag" ? tagHtml() : hubHtml()); }
  function act(a, v) {
    if (a === "close") return close();
    if (a === "hub") { ui = { ph: "hub" }; return render(); }
    if (a === "nami") { close(); var u = "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_mawaru_nami.html"; if (window.openHybridContent) window.openHybridContent(u, "🎡 回ると 波ラボ", false); else window.open(u, "_blank"); return; }
    if (a === "note") { close(); if (window.showJigakuCard) window.showJigakuCard("a_lens"); return; }
    if (a === "tool" || a === "model") { var md = a === "model", items = pickItems(5, md); ui = { ph: "tool", model: md, items: items, i: 0, ok: 0, ord: shuffle([0, 1, 2]) }; return render(); }
    if (a === "ans" && ui && !ui.res) { var it = ui.items[ui.i], ok = Number(v) === 0; record(it.id, ok); if (ok) ui.ok++; ui.res = { ok: ok }; return render(); }
    if (a === "next" && ui) {
      ui.i++; ui.res = null; ui.ord = shuffle([0, 1, 2]);
      if (ui.i < ui.items.length) return render();
      var o = st(), t = today(); ui.reward = 0;
      var rk = ui.model ? "modelD" : "toolD";
      if (ui.ok === ui.items.length && o[rk] !== t) { o[rk] = t; ui.reward = shard(2, ui.model ? "どの モデル" : "どの どうぐ"); }
      log((ui.model ? "どの モデル？ ⭕" : "どの どうぐ？ ⭕") + ui.ok + "/" + ui.items.length + (ui.reward ? " かけら+" + ui.reward : ""));
      save(); ui.ph = "end"; return render();
    }
    if (a === "tag" && ui && ui.ph === "tag" && !ui.picked) { ui.picked = v; return tagDone(); }
  }
  window.openLensTools = function () { ui = { ph: "hub" }; render(); try { var o = st(); if (o.newM) { o.newM = ""; save(); } } catch (e) {} };

  /* ---------------- 🏷 名札はり（ステージ クリアの あと、1日 1回） ---------------- */
  function nikoTag(stageId, name) { var s = String(stageId || "") + " " + String(name || ""); for (var i = 0; i < NIKO.length; i++) if (NIKO[i][0].test(s)) return NIKO[i][1]; return null; }
  function tagOf(id) { return TAGS.filter(function (t) { return t.id === id; })[0]; }
  function tagHtml() {
    var head = '<div style="font-size:12px;font-weight:800;color:#64748b;">「' + esc(ui.name || "") + '」クリア！</div>' +
      '<div style="font-size:16px;font-weight:900;margin:2px 0 4px;">🏷 今の 問題に 名札を はろう</div>' +
      '<div style="font-size:12px;font-weight:700;color:#475569;">どんな なかまの 問題だった？ 正解は 1つじゃないよ。自分の 見方で えらんでね。</div>';
    if (ui.picked) {
      var me = tagOf(ui.picked), nk = ui.niko ? tagOf(ui.niko) : null;
      return head + '<div style="margin-top:10px;background:#eef2ff;border-radius:14px;padding:10px 12px;font-size:13.5px;font-weight:800;line-height:1.7;">きみの 名札：<b>' + me.icon + ' ' + me.name + '</b>' +
        (nk ? '<br>ニコは「' + nk.icon + ' ' + nk.name + '」だと 思ったよ。' + (nk.id === me.id ? "同じ 見方だね！" : "ちがう 見方も おもしろい。両方 あてはまるかも。") : "") +
        (ui.reward ? '<br>🧩 シールの かけら +' + ui.reward : "") + '</div>' +
        '<div style="text-align:center;margin-top:10px;"><button type="button" data-ln="close" style="' + BIG + '">とじる</button></div>';
    }
    return head + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">' + TAGS.map(function (t) { return '<button type="button" data-ln="tag" data-v="' + t.id + '" style="min-height:46px;border:2px solid #c7d2fe;border-radius:12px;background:#fff;font:800 13.5px \'Zen Maru Gothic\',sans-serif;color:#1e1b4b;cursor:pointer;">' + t.icon + ' ' + t.name + '</button>'; }).join("") + '</div>' +
      '<div style="text-align:center;margin-top:8px;"><button type="button" data-ln="close" style="border:none;background:none;font:800 12px \'Zen Maru Gothic\',sans-serif;color:#94a3b8;cursor:pointer;">きょうは しない</button></div>';
  }
  function tagDone() {
    var o = st(), t = today();
    o.tags[ui.picked] = (o.tags[ui.picked] || 0) + 1;
    ui.reward = o.tagD === t ? 0 : shard(1, "名札はり"); o.tagD = t;
    o.log = o.log.concat([{ d: t, s: ui.sid, t: ui.picked, n: ui.niko || "" }]).slice(-40);
    log("名札「" + tagOf(ui.picked).name + "」（" + (ui.name || ui.sid) + "）" + (ui.niko ? " ニコ「" + tagOf(ui.niko).name + "」" : ""));
    save(); render();
  }
  function wantsTag() { var sd = window.saveData; if (!sd || window.currentActiveStageIsReview || window.currentActiveStageIsMaster) return false; return st().tagD !== today(); }
  // その日 はじめての ふつうの クリアでは なるほど？ の かわりに 名札はり（js/why-note.js の askWhyAfterClear を つつむ）
  var orig = window.askWhyAfterClear;
  if (typeof orig === "function") {
    window.askWhyAfterClear = function (stageId, stageName) {
      try {
        if (wantsTag()) {
          var tries = 0;
          (function wait() {
            var busy = ["data-loading-overlay", "streak-celebration-modal", "master-celebration-modal", "treasure-reveal-modal", "stk-reveal", "evo-reveal", "why-note"].some(function (id) {
              var el = $d(id); if (!el) return false; var cs = window.getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden";
            });
            if (busy && tries++ < 120) { setTimeout(wait, 500); return; }
            if (!wantsTag()) return;
            ui = { ph: "tag", sid: stageId, name: stageName, niko: nikoTag(stageId, stageName) }; render();
          })();
          return;
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
  // 自学ノート「47都道府県 きょりの わ」（ハブ＆スポーク）を 書いたら 🕸 中心に 集めて 配る
  var oj = window.jigakuDone;
  if (typeof oj === "function") window.jigakuDone = function (id) { var r = oj.apply(this, arguments); try { if (id === "c_kencho47" && unlock("hub")) { log("モデル図鑑：中心に 集めて 配る（自学ノート）"); save(); } } catch (e) {} return r; };
  window.LENS = { TOOLS: TOOLS, ITEMS: ITEMS, TAGS: TAGS, MODELS: MODELS, MITEMS: MITEMS, nikoTag: nikoTag };
})();
