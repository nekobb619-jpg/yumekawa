/* =====================================================================
   jigaku-note.js — 自学ノートの ネタ帳（どうぐばこ「📓 自学ノート」）
   ★2026-10-03追加（ユーザー：宿題・毎週の 自学ノートで「何を 書くか」自分で 決められずに 迷う。
     先生の A・Bメニュー、5分間サバイバル（ヒラメ・年輪・オウムは 書いた）、図鑑「科学の実験」は 未使用、
     ノート1ページ（たて書き 20字×15行）でも よい、愛知県 小牧市 在住）
   - ネタを 3つ 出して 選ぶだけに する（選ぶ 負担を へらす）。カードは 先生の メニューの どれに あたるかを 表示
   - ノートと 同じ たて書き 20字×15行の マス目で「そのまま 写せる 完成形」を 見せる
   - 文は ぜんぶ この アプリ用に 書いた もの（本の 文を 写したり 短く したり した ものでは ない）。
     サバイバルの 本と 同じ ぎもんを あつかう カードは「本も 読んで くらべよう」と すすめる
   - 書けたら ✅：その日 はじめての 1つは +25pt（保護者：Qは チートしやすいので pt に）。saveData.jigakuDone に のこして 次から 後ろに 回す。log_db「📓自学ノート」
   ===================================================================== */
(function () {
  "use strict";
  var JIGAKU_PTS = 25; // ★2026-10-03：ネタ帳の ごほうび（1日1回）
  var KIND = { yokatta: "🌼 よかったさがし", quiz: "🧠 クイズを 作る", exp: "🔬 実験レポート", cmp: "⚖️ くらべる・しらべる", a: "💭 Aメニュー", app: "📱 アプリの まちがい" };

  // クイズ（自分で 出題する 形。先生に ほめられた「クイズ」の 書き方と 同じ 型）
  function quiz(id, title, menu, q, ch, ans, exp, extra) {
    return Object.assign({ id: id, kind: "quiz", title: title, menu: menu, page: ["クイズ「" + title + "」", q, "ア　" + ch[0], "イ　" + ch[1], "ウ　" + ch[2], "", "答え　" + ans, exp] }, extra || {});
  }
  var BOOK = "本（5分間サバイバル）も 読んで、ちがう ところを さがそう";
  var CARDS = [
    quiz("q_seiza", "季節で 星座が ちがうのは なぜ？", "B：〇〇特集（星）", "季節によって 見える 星座が ちがうのは どうして？",
      ["星座が 自分で 動いて いるから", "星は 毎日 約四分ずつ 早く 同じ 場所に 来るから", "夏と 冬で 星の 数が 変わるから"], "イ",
      "星は 毎日 約四分ずつ 早く 同じ 場所に のぼる。一か月で 約二時間 ずれるので、夏の 夜の 星座は 冬には 昼の 空に あって 見えない。七月に 東の 空に あった 夏の大三角も、十月の 同じ 時こくには 頭の 上。", { hot: true, note: "アプリの「星の動きラボ」で 日にちを 動かして たしかめてから 書こう。" + BOOK }),
    quiz("q_hokkyoku", "北極星は なぜ 動かない？", "B：〇〇特集（星）", "ほかの 星は 動くのに、北極星が ほとんど 動かないのは どうして？",
      ["北極星が とても 重いから", "地球が 回る じくの 先の 方向に あるから", "北極星だけ 光が 強いから"], "イ",
      "星が 東から 西へ 動いて 見えるのは、地球が こまのように 回って いるから。北極星は その じくの ほぼ 真上の 方向に あるので、ほとんど 動かない。北の 空の 星は 北極星を 中心に 回って 見える。小牧では 北極星の 高さは こぶし 三つ半くらい。", { hot: true, note: "星の動きラボの「北の空」で 時間を 動かして 見よう。" + BOOK }),
    quiz("q_tsuki", "月は どうして 形が 変わる？", "B：〇〇特集（月）", "月の 形が 毎日 少しずつ 変わって 見えるのは どうして？",
      ["地球の かげが 月に うつるから", "太陽の 光が 当たって いる ところの 見え方が 変わるから", "月が 少しずつ けずれるから"], "イ",
      "月は 自分で 光らず、太陽の 光を はね返して 光る。月は 約一か月で 地球の まわりを 回るので、光って いる ところの 見え方が 変わる。地球の かげで 欠けるのは「月食」で、べつの こと。", { note: BOOK }),
    quiz("q_natsu", "夏は どうして 暑い？", "B：〇〇特集（天気）", "夏が 冬より 暑いのは どうして？",
      ["夏は 地球が 太陽に 近いから", "太陽が 高く のぼり、昼の 時間が 長いから", "夏は 太陽が 大きく なるから"], "イ",
      "夏は 太陽が 空の 高い ところを 通るので、地面に 光が まっすぐ 当たり、よく あたためられる。昼の 時間も 長い。じつは 地球が 太陽に いちばん 近いのは 一月ごろ。だから 近さは 関係ない。", { note: BOOK }),
    quiz("q_niji", "にじは どうして できる？", "B：〇〇特集（光）", "雨上がりに にじが 見えるのは どうして？",
      ["雨つぶが 太陽の 光を いろいろな 色に 分けるから", "雲に 色が ついて いるから", "空気が 冷えて 色が つくから"], "ア",
      "太陽の 光は 白く 見えるが、本当は たくさんの 色が まざって いる。空の 雨つぶに 光が 入ると、色ごとに 曲がり方が ちがうので 色が 分かれる。だから にじは 太陽を 背中に した 方向に 見える。レインボーボックスと 同じ しくみ。", { note: BOOK }),
    quiz("q_kinoko", "キノコは 植物？", "B：〇〇特集（生き物）", "キノコは 何の なかま？",
      ["植物の なかま", "動物の なかま", "きん類（植物でも 動物でもない）"], "ウ",
      "キノコには 葉緑体が なく、自分で 養分を 作れない。かれ葉や 木などを 分解して 養分を とる「きん類」の なかま。カビも 同じ なかま。植物より 動物に 近い と 考えられて いる。", { note: BOOK }),
    quiz("q_renkon", "レンコンの 穴は 何の ため？", "B：〇〇特集（植物）", "レンコンに 穴が あいて いるのは 何の ため？",
      ["どろの 中まで 空気を 通す ため", "水を ためて おく ため", "虫の 家に なる ため"], "ア",
      "レンコンは ハスの くきが 太く なった もの。どろの 中は 空気が 少ないので、葉から 取り入れた 空気を 穴を 通して 根まで 送って いる。", { note: BOOK }),
    quiz("q_sake", "サケは どうして 生まれた 川に もどれる？", "B：〇〇特集（生き物）", "海で 何年も くらした サケが、生まれた 川に もどって こられるのは どうして？",
      ["生まれた 川の においを おぼえて いるから", "川に 目じるしの 旗が あるから", "人が 運んで いるから"], "ア",
      "サケは 子どもの ころ 川を 下る とき、川の 水の においを おぼえる。大人に なると においを たよりに 生まれた 川に もどると 考えられて いる。海では 太陽や 地球の 磁石の 力で 方向を 知るという 説も あり、研究が 続いて いる。", { note: BOOK }),
    quiz("q_hone", "人の 骨は 何本？", "B：〇〇特集（体）", "大人の 体には 骨が およそ 何本 ある？",
      ["約五十本", "約二百本", "約二千本"], "イ",
      "大人の 骨は 約二百本（二百六本）。生まれたばかりの 赤ちゃんは 約三百本 あり、大きく なると くっついて 数が へる。手と 足の 骨を 合わせると、全体の 半分 いじょう。", { note: BOOK }),
    quiz("q_dokidoki", "きん張すると ドキドキするのは？", "B：〇〇特集（体）", "きん張すると 胸が ドキドキするのは どうして？",
      ["体を すぐ 動かせるように 心ぞうが 血を たくさん 送るから", "心ぞうが 小さく なるから", "血が へって しまうから"], "ア",
      "きん張すると、体は「たいへんだ」と 感じて、すぐ 動けるように 準備する。心ぞうが 速く 強く 動いて、きん肉に たくさん 血を 送るので ドキドキする。ゆっくり 深こきゅうすると 落ち着きやすい。", { note: BOOK }),
    quiz("q_kusuguri", "自分で くすぐっても くすぐったくない？", "B：〇〇特集（体）", "自分で わきの 下を くすぐっても、あまり くすぐったくないのは どうして？",
      ["脳が 自分の 動きを 前もって 知って いるから", "自分の 手は 冷たいから", "自分の ひふは かたいから"], "ア",
      "自分で さわる ときは、脳が さわる 場所や 強さを 前もって 予想して いるので、感じ方が 弱く なる。人に くすぐられると 予想できないので、くすぐったい。", { note: BOOK }),
    quiz("q_mushiba", "虫歯は どうして なる？", "B：〇〇特集（体）", "虫歯に なるのは どうして？",
      ["口の 中の きんが あまい ものから 酸を 作り、歯を とかすから", "冷たい ものを 食べて 歯が われるから", "歯が 古く なるから"], "ア",
      "口の 中の きんが、食べ物の さとうを 使って 酸を 作る。酸が 歯の 表面を とかすと 虫歯に なる。だらだら 食べない こと、よく みがく ことが 大切。", { note: BOOK }),
    quiz("q_sentaku", "暑い 日は 洗たく物が かわきやすい？", "B：〇〇特集（理科）", "暑い 日に 洗たく物が 早く かわくのは どうして？",
      ["気温が 高いと 水が じょう発しやすいから", "夏は 洗たく物が 軽いから", "夏は 水が ふえるから"], "ア",
      "ぬれた 服の 水は、水じょう気に なって 空気中へ 出て いく。これを じょう発と いう。気温が 高く、風が あって、空気が かわいて いる 日ほど 早く かわく。四年の 理科「水の ゆくえ」と 同じ 話。", { hot: true, note: BOOK }),
    quiz("q_toshi", "都会が 暑いのは どうして？", "B：〇〇特集（天気）", "大きな 町が まわりより 暑く なりやすいのは どうして？",
      ["地面が アスファルトなどで 熱を ためやすいから", "都会には 太陽が 近いから", "都会は 海が 多いから"], "ア",
      "都会は 土や 木が 少なく、アスファルトや ビルが 昼の 熱を ためて 夜も 出す。車や クーラーの 熱も 出る。だから まわりより 気温が 高く なる。これを ヒートアイランド現象と いう。", { note: BOOK }),
    quiz("q_mushi", "虫は どうして 光に 集まる？", "B：〇〇特集（虫）", "夜、虫が 電灯に 集まるのは どうして？",
      ["空の 明るい 方を 上と 感じる しくみが くるうから", "光が 食べ物だから", "光が あたたかいから"], "ア",
      "じつは まだ はっきり わかって いない。虫は 空の 明るい 方を 上と 感じて 体の 向きを 保つと 考えられ、電灯の まわりでは 向きが くるって ぐるぐる 回って しまう、という 研究が ある。", { note: "答えが まだ 決まって いない ぎもんも ある！ " + BOOK }),
    quiz("q_kamonohashi", "たまごを 産む ほにゅう類", "B：〇〇特集（生き物）", "たまごを 産む ほにゅう類は どれ？",
      ["カモノハシ", "イルカ", "コウモリ"], "ア",
      "ほにゅう類は ふつう 赤ちゃんを 産んで 乳で 育てる。カモノハシと ハリモグラは たまごを 産むが、生まれた 子は 乳で 育てるので ほにゅう類の なかま。オーストラリアなどに すむ。", { note: BOOK }),
    quiz("q_hoshiiro", "星の 色が ちがうのは？", "B：〇〇特集（星）", "星に 白っぽい 星や 赤っぽい 星が あるのは どうして？",
      ["星の 表面の 温度が ちがうから", "地球からの 近さが ちがうから", "星の 名前が ちがうから"], "ア",
      "星の 色は 表面の 温度で 決まる。温度が 高い 星は 青白く、低い 星は 赤っぽい。さそり座の アンタレスは 赤、こと座の ベガは 白っぽい。鉄を 熱すると 赤から 白っぽく 光るのと にて いる。", { hot: true }),
    // 愛知県
    quiz("q_aichi1", "愛知県の 日本一", "B：都道府県しらべ", "愛知県が 四十年 いじょう 続けて 日本一の ものは どれ？",
      ["工場で 作った 品物の 出荷額", "米の とれる 量", "魚の とれる 量"], "ア",
      "工場で 作って 出荷した 品物の 金額（製造品出荷額）は、四十六年 続けて 日本一。自動車の 工場が 多いから。ほかに、花の 産出額、うずらの たまご、三州瓦の 生産も 日本一。", { hot: true, note: "アプリの「愛知県の 産業と 先人」と いっしょに。" }),
    quiz("q_aichi2", "愛知用水", "B：都道府県しらべ", "雨が 少なく 水に こまって いた 知多半島へ、木曽川の 水を 引いた 用水は？",
      ["明治用水", "愛知用水", "豊川用水"], "イ",
      "愛知用水は、知多半島の 久野庄太郎と 先生の 浜島辰雄が 計画を 考え、一九六一年に 水が 流れた。今は 田畑だけで なく、家や 工場の 水にも 使われて いる。", { hot: true }),

    // 実験レポート（図鑑「科学の実験」の 目次から。手順は 図鑑を 見る）
    { id: "e_netsu", kind: "exp", title: "熱の 伝わり方を 観察しよう", menu: "B：〇〇特集（理科）", hot: true,
      note: "図鑑「科学の実験」の「熱の伝わり方を観察しよう」を 見て やろう。四年の 理科「もののあたたまり方」と 同じ。火を 使う ときは 大人と いっしょに。",
      page: ["実験レポート「熱の 伝わり方」", "目的　金ぞく・水・空気は、どのように あたたまるかを 調べる。", "予想　（自分の 考えを 書く）", "用意したもの　（図鑑を 見て 書く）", "やり方　①　②　③", "結果　（見た ことを 絵と 言葉で）", "わかった こと　金ぞくは 熱した ところから 順に、水や 空気は 動きながら 全体が あたたまる。", "もっと 知りたい こと"] },
    { id: "e_koori", kind: "exp", title: "氷と 水、水じょう気", menu: "B：〇〇特集（理科）", hot: true,
      note: "図鑑の「氷と水、水蒸気」「水は温度によってすがたを変える」を 見て やろう。四年の 理科「水の すがた」と 同じ。",
      page: ["実験レポート「水の すがた」", "目的　水は 温度で どのように すがたを 変えるかを 調べる。", "予想", "用意したもの", "やり方　①　②　③", "結果　（何度で どう なったか、表に する）", "わかった こと　水は 冷やすと 氷（固体）、熱すると 水じょう気（気体）に なる。", "もっと 知りたい こと"] },
    { id: "e_hikari", kind: "exp", title: "光を 分けて みよう", menu: "B：〇〇特集（光）",
      note: "レインボーボックスの つづき。図鑑の「光を分けてみよう」「にじのひみつをさぐろう」を 見て やろう。",
      page: ["実験レポート「光を 分ける」", "目的　白い 光が どんな 色に 分かれるかを 調べる。", "予想", "用意したもの", "やり方　①　②　③", "結果　（見えた 色の 順番を 書く）", "わかった こと　白い 光には たくさんの 色が まざって いる。", "もっと 知りたい こと　にじの 色の 順番は いつも 同じ？"] },
    { id: "e_oremagaru", kind: "exp", title: "折れ曲がる 光を 見よう", menu: "B：〇〇特集（光）",
      note: "図鑑の「折れ曲がる光を見よう」を 見て やろう。コップと 水と ストローで できる。",
      page: ["実験レポート「折れ曲がる 光」", "目的　水に 入れた ストローが 折れて 見えるのは なぜかを 調べる。", "予想", "用意したもの", "やり方　①　②　③", "結果", "わかった こと　光は 水と 空気の さかいめで 曲がる。", "もっと 知りたい こと"] },
    { id: "e_kessho", kind: "exp", title: "結しょうを 作ろう", menu: "B：〇〇特集（理科）",
      note: "図鑑の「結晶を作ろう」を 見て やろう。何日か かかるので、毎日の 変化を 記録しよう。",
      page: ["実験レポート「結しょう」", "目的　水に とけた ものから 結しょうが できる ようすを 調べる。", "予想", "用意したもの", "やり方　①　②　③", "結果　（一日目・二日目・三日目）", "わかった こと", "もっと 知りたい こと"] },
    { id: "e_jishaku", kind: "exp", title: "磁石に つく 物を さがそう", menu: "B：〇〇特集（理科）",
      note: "図鑑の「磁石につく物をさがそう」を 見て やろう。家の 中で できる。",
      page: ["実験レポート「磁石に つく 物」", "目的　家の 中で 磁石に つく 物と つかない 物を 調べる。", "予想", "やり方　磁石を 近づけて、表に ○と × を 書く。", "結果　（表）", "わかった こと　磁石に つくのは 鉄で できた 物。", "もっと 知りたい こと"] },

    // くらべる・しらべる
    { id: "c_seiza", kind: "cmp", title: "七月と 十月の 夏の大三角", menu: "B：〇〇特集（星）", hot: true,
      note: "星の動きラボで「日にちで くらべる」→ 午後八時に して、七月二十日と 十月一日を 見くらべて 書こう。",
      page: ["くらべよう「七月と 十月の 夏の大三角」", "七月二十日　午後八時　東の 空（アルタイル　東南東・高さ 三十一度）", "十月一日　午後八時　頭の 上（アルタイル　南南西・高さ 六十一度）", "にて いる ところ　三つの 星の ならび方は 同じ。", "ちがう ところ　同じ 時こくでも 見える 場所が 西へ ずれた。", "わけ　星は 毎日 約四分ずつ 早く 同じ 場所に 来るから。", "思った こと"] },
    { id: "c_owari", kind: "cmp", title: "尾張と 三河", menu: "B：都道府県しらべ", hot: true,
      note: "アプリの「愛知県の ようす」の 地図を 見ながら 書こう。",
      page: ["くらべよう「尾張と 三河」", "尾張（西）　名古屋市・小牧市・一宮市　濃尾平野　木曽川・庄内川", "三河（東）　豊田市・岡崎市・豊橋市　岡崎平野・豊橋平野・三河の 山　矢作川・豊川", "にて いる ところ", "ちがう ところ", "わたしの 町　小牧市は 尾張に ある。"] },
    { id: "c_komaki", kind: "cmp", title: "小牧市 特集", menu: "B：〇〇特集・都道府県しらべ", hot: true,
      note: "わからない ところは、社会の 副読本や 小牧市の ホームページ、おうちの人に 聞いて 調べよう。",
      page: ["小牧市 特集", "場所　愛知県の 北西部（尾張）。名古屋市の 北。", "小牧山　一五六三年に 織田信長が 城を きずいた。", "交通　小牧インターで 東名高速と 名神高速が つながる。", "人口　（調べて 書く）", "市の 木・花　（調べて 書く）", "わたしの おすすめの 場所", "もっと 知りたい こと"] },
    { id: "c_yousui", kind: "cmp", title: "明治用水と 愛知用水", menu: "B：都道府県しらべ",
      page: ["くらべよう「明治用水と 愛知用水」", "明治用水　一八八〇年に 完成。矢作川の 水を 安城などの 台地へ。", "愛知用水　一九六一年に 通水。木曽川の 水を 知多半島へ。", "同じ ところ　水が 少ない 土地に 水を 引いて、田畑を ゆたかに した。", "ちがう ところ", "思った こと　（つくった 人たちの 苦労を 考えて）"] },
    { id: "c_kuuki", kind: "cmp", title: "空気と 水を とじこめて おすと", menu: "B：〇〇特集（理科）",
      page: ["くらべよう「空気と 水」", "空気　とじこめて おすと、体積が 小さく なる。おし返す 力が 大きく なる。", "水　とじこめて おしても、体積は 変わらない。", "にて いる ところ　どちらも 目に 見えない すき間に 入りこむ。", "ちがう ところ", "身の回りで 見つけた 例　（ボール・空気でっぽう など）"] },

    // Aメニュー（書き方の 型つき）
    { id: "a_jugyo", kind: "a", title: "今日の 授業で わかった こと", menu: "A：今日の授業でわかったこと",
      page: ["今日の 授業で わかった こと", "教科　（　　）", "わかった こと　（一つに しぼって 書く）", "どうして そう 言えるか　（先生の 話・実験・教科書から）", "例　（自分の 生活と つなげる）", "次に 知りたい こと"] },
    { id: "a_best", kind: "a", title: "好きな 〇〇 ベスト３", menu: "A：好きな〇〇ベスト5とその理由",
      note: "ベスト５が むずかしい 日は ３つで いい。理由を 一つずつ 書くのが ポイント。",
      page: ["好きな 〇〇 ベスト３", "一位　〇〇　理由", "二位　〇〇　理由", "三位　〇〇　理由", "まとめ　三つに にて いる ところは？"] },
    { id: "a_mokuhyo", kind: "a", title: "今の 目標・一年後・十年後", menu: "A：今の目標・1年後・10年後の目標",
      page: ["わたしの 目標", "今の 目標　（今週 できる こと）", "一年後の 目標　（五年生の 秋）", "十年後の 目標　（十九才）", "そのために 明日 する こと"] },
    { id: "a_yokatta", kind: "yokatta", title: "今日の よかった さがし", menu: "A：今、うれしいこと・テーマ日記", hot: true,
      note: "『少女ポリアンナ』の「よかったさがし」。いやな ことが あった 日でも、小さな よかったを 3つ さがそう。アプリの「🌼 よかった帳」に 書くと ためて おけるよ。",
      page: ["今日の よかった さがし", "よかった①", "よかった②", "よかった③", "いちばん うれしかった こと と その わけ", "いやな ことの 中の よかった　（あれば）", "明日 やって みたい こと"] },
    { id: "a_naruhodo", kind: "a", title: "なるほど日記", menu: "A：なるほど日記・テーマ日記",
      page: ["なるほど日記", "今日 「なるほど」と 思った こと", "どこで 知ったか　（本・テレビ・人・アプリ）", "どうして なるほどと 思ったか", "人に 教えるなら こう 言う"] }
  ];

  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  // アプリの 文の「わかち書き」の 空白は、ノートには 書かない
  function clean(s) { return String(s).replace(/<[^>]+>/g, "").replace(/[  ]+/g, ""); }
  // 20字ずつの 行に 分ける（行の 頭に 。、」）が 来たら 前の 行の 最後の マスに 入れる）
  var HEAD_NG = "。、」）』ー？！";
  function columns(page) {
    var cols = [];
    page.forEach(function (p) {
      var t = clean(p);
      if (!t) { cols.push([]); return; }
      var chars = Array.from(t), col = [];
      chars.forEach(function (ch) {
        if (col.length === 20) { cols.push(col); col = []; }
        if (!col.length && cols.length && HEAD_NG.indexOf(ch) >= 0 && cols[cols.length - 1].length) { var prev = cols[cols.length - 1]; prev[prev.length - 1] += ch; return; }
        col.push(ch);
      });
      if (col.length) cols.push(col);
    });
    return cols;
  }
  function done() { var sd = window.saveData || {}; return Array.isArray(sd.jigakuDone) ? sd.jigakuDone : []; }

  // アプリで まちがえた 問題から クイズを 作る（自分で 問題を 作り直すと よく おぼえられる）
  function appCard() {
    var sd = window.saveData || {}, list = Array.isArray(sd.weakQuestions) ? sd.weakQuestions.slice().reverse() : [], Q = (window.CONTENT && window.CONTENT.quizzes) || {};
    for (var i = 0; i < list.length; i++) {
      var id = list[i], st, hit = null, k = id.indexOf("::");
      if (k >= 0) { st = id.slice(0, k); (Q[st] || []).forEach(function (q) { if (q.qid === id.slice(k + 2)) hit = q; }); }
      else { var j = id.lastIndexOf("_q_"); if (j >= 0) { st = id.slice(0, j); hit = (Q[st] || [])[Number(id.slice(j + 3))]; } }
      if (!hit || !hit.a || hit.a.length < 3 || /ニコ|ねらい/.test(hit.q)) continue;
      var right = hit.a[hit.c], wrong = hit.a.filter(function (_, x) { return x !== hit.c; }).slice(0, 2), pos = (i % 3), ch = wrong.slice(); ch.splice(pos, 0, right);
      var desc = clean(String(hit.job_desc || "").split("💡")[0]).slice(0, 110);
      return { id: "app_" + id, kind: "app", title: "まちがえた 問題で クイズ", menu: "B：勉強なぞなぞ・勉強クイズ", hot: true,
        note: "アプリで まちがえた 問題を、自分の クイズに 作り直そう。説明は 自分の 言葉に 書きかえると もっと おぼえられる。",
        page: ["クイズ（まちがえた 問題から）", clean(hit.q), "ア　" + ch[0], "イ　" + ch[1], "ウ　" + ch[2], "", "答え　" + "アイウ".charAt(pos), desc] };
    }
    return null;
  }

  /* ---------------- 画面 ---------------- */
  var BTN = "border:none;border-radius:14px;font-family:'Zen Maru Gothic';font-weight:900;cursor:pointer;";
  function close() { var m = document.getElementById("jigaku-modal"); if (m) m.remove(); }
  window.closeJigakuNote = close;
  function shell(inner) {
    close();
    var w = document.createElement("div"); w.id = "jigaku-modal";
    w.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:12px;";
    w.onclick = function (e) { if (e.target === w) close(); };
    w.innerHTML = '<div style="background:#fff;border-radius:22px;padding:14px 12px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 10px 0 rgba(147,51,234,.22);">' + inner + '</div>';
    document.body.appendChild(w);
  }
  function pool(kind) {
    var list = CARDS.slice(), a = appCard(); if (a) list.unshift(a);
    if (kind && kind !== "all") list = list.filter(function (c) { return c.kind === kind; });
    var d = done();
    // まだ 書いて いない もの → 今の 学習に 近い もの（hot）を 前に
    return list.sort(function (x, y) { return (d.indexOf(x.id) >= 0) - (d.indexOf(y.id) >= 0) || (y.hot ? 1 : 0) - (x.hot ? 1 : 0); });
  }
  window._jigakuKind = "all";
  window.openJigakuNote = function (kind) {
    if (kind === "yokatta") { window.openYokatta(); return; }
    if (kind) window._jigakuKind = kind;
    var k = window._jigakuKind, list = pool(k), d = done();
    // おまかせ：ちがう 種類から 3つ（クイズばかりに ならないように）
    var pick = list;
    if (k === "all") { list = list.filter(function (c) { return c.kind !== "yokatta"; }); var seen = {}; pick = []; list.forEach(function (c) { var g = c.kind === "app" ? "quiz" : c.kind === "exp" ? "cmp" : c.kind; if (!seen[g] && pick.length < 3) { seen[g] = 1; pick.push(c); } }); }
    var chips = Object.keys(KIND).filter(function (x) { return x !== "app" || appCard(); }).map(function (x) {
      return '<button style="' + BTN + 'padding:7px 9px;font-size:12px;' + (k === x ? "background:#7e22ce;color:#fff;" : "background:#f3e8ff;color:#7e22ce;") + '" onclick="window.openJigakuNote(\'' + x + '\')">' + KIND[x] + '</button>';
    }).join("");
    var cards = pick.map(function (c) {
      var ok = d.indexOf(c.id) >= 0;
      return '<button style="' + BTN + 'display:block;width:100%;text-align:left;padding:11px 12px;margin-top:8px;background:' + (ok ? "#f8fafc" : "#fdf4ff") + ';border:2px solid ' + (ok ? "#e2e8f0" : "#f5d0fe") + ';color:#4a3b52;" onclick="window.showJigakuCard(\'' + c.id + '\')">' +
        '<div style="font-size:11px;color:#a21caf;">' + KIND[c.kind] + '　<span style="color:#7a6985;">先生の メニュー：' + esc(c.menu) + '</span></div>' +
        '<div style="font-size:15px;margin-top:2px;">' + (ok ? "✅ " : (c.hot ? "⭐ " : "")) + esc(c.title) + '</div></button>';
    }).join("");
    shell('<div style="font-size:18px;font-weight:900;color:#6b21a8;text-align:center;">📓 今日の 自学ネタ</div>' +
      '<div style="font-size:12px;font-weight:700;color:#7a6985;text-align:center;margin:4px 0 8px;line-height:1.6;">まよったら 上の 3つから 1つ えらぶだけ。<br>ノート 1ページ（たて書き 20字×15行）に 入る 形に して あるよ。⭐ ＝ 今の 勉強と つながる ネタ</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;"><button style="' + BTN + 'padding:7px 9px;font-size:12px;' + (k === "all" ? "background:#db2777;color:#fff;" : "background:#fce7f3;color:#9d174d;") + '" onclick="window.openJigakuNote(\'all\')">🎲 おまかせ 3つ</button>' + chips + '</div>' +
      cards +
      '<button style="' + BTN + 'width:100%;margin-top:10px;padding:11px;font-size:14px;color:#92400e;background:#fef3c7;" onclick="window.openYokatta()">🌼 今日の よかった を 書く（よかった帳）</button>' +
      '<button style="' + BTN + 'width:100%;margin-top:8px;padding:10px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.closeJigakuNote()">とじる</button>');
  };
  function findCard(id) { var a = appCard(); return (a && a.id === id) ? a : CARDS.filter(function (c) { return c.id === id; })[0]; }
  // ノートと 同じ たて書きの マス目（右から 左へ。1ページ 15行）
  function notebook(c) {
    var cols = columns(c.page), pages = [], d = new Date(window.currentServerTime || Date.now());
    var dateCol = ["（", String(d.getMonth() + 1), "／", String(d.getDate()), "）"]; // 数字は 1マスに（ノートの 書き方と 同じ）
    cols.unshift(dateCol);
    for (var i = 0; i < cols.length; i += 15) pages.push(cols.slice(i, i + 15));
    var cell = "width:19px;height:19px;border:1px solid #99f6e4;margin:-1px 0 0 -1px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#334155;writing-mode:vertical-rl;font-family:'Klee One','Zen Maru Gothic',serif;";
    return pages.map(function (pg, pi) {
      var html = '<div style="display:flex;flex-direction:row-reverse;justify-content:flex-start;gap:0;padding:6px;background:#fff;border:2px solid #5eead4;border-radius:8px;overflow-x:auto;">';
      for (var x = 0; x < 15; x++) {
        var col = pg[x] || [];
        html += '<div style="display:flex;flex-direction:column;margin-left:-1px;">';
        for (var y = 0; y < 20; y++) html += '<div style="' + cell + '">' + esc(col[y] || "") + '</div>';
        html += '</div>';
      }
      return '<div style="font-size:11px;font-weight:900;color:#0f766e;margin:8px 0 3px;">📓 ノート ' + (pi + 1) + 'ページめ' + (pages.length > 1 ? "（全" + pages.length + "ページ）" : "") + '</div>' + html + '</div>';
    }).join("");
  }
  window.showJigakuCard = function (id) {
    var c = findCard(id); if (!c) return;
    var ok = done().indexOf(id) >= 0;
    shell('<div style="font-size:11px;font-weight:900;color:#a21caf;">' + KIND[c.kind] + '　先生の メニュー：' + esc(c.menu) + '</div>' +
      '<div style="font-size:17px;font-weight:900;color:#6b21a8;margin:2px 0 6px;">' + esc(c.title) + '</div>' +
      (c.note ? '<div style="background:#fefce8;border-radius:12px;padding:8px 10px;font-size:12px;font-weight:800;color:#854d0e;line-height:1.6;">💡 ' + esc(c.note) + '</div>' : '') +
      '<div style="font-size:12px;font-weight:700;color:#7a6985;margin-top:6px;">（　）の ところは 自分で 書こう。線は じょうぎで。</div>' +
      notebook(c) +
      '<details style="margin-top:8px;font-size:13px;font-weight:700;color:#4a3b52;"><summary style="cursor:pointer;color:#7e22ce;">横書きで 読む</summary><div style="line-height:1.8;margin-top:4px;">' + c.page.map(function (p) { return esc(clean(p)); }).join("<br>") + '</div></details>' +
      '<div style="display:grid;gap:8px;margin-top:12px;">' +
        '<button style="' + BTN + 'padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#10b981,#059669);" onclick="window.jigakuDone(\'' + id + '\')">' + (ok ? "✅ 書けた（もう一度 記録）" : "✅ ノートに 書けた！") + '</button>' +
        '<button style="' + BTN + 'padding:10px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.openJigakuNote()">◀ ほかの ネタを 見る</button>' +
      '</div><div id="jigaku-result" style="margin-top:8px;"></div>');
  };
  window.jigakuDone = function (id) {
    var sd = window.saveData; if (!sd) return;
    var c = findCard(id) || {}, t = today();
    sd.jigakuDone = done().filter(function (x) { return x !== id; }).concat([id]).slice(-60);
    var reward = sd.jigakuLastDate === t ? 0 : JIGAKU_PTS;
    sd.jigakuLastDate = t; sd.pts = (Number(sd.pts) || 0) + reward;
    if (window.saveGame) window.saveGame(); if (window.updateUI) window.updateUI();
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "📓自学ノート", msg: (c.title || id) + "（" + (KIND[c.kind] || "") + "）" + (reward ? " +" + reward + "pt" : "") });
    var r = document.getElementById("jigaku-result");
    if (r) r.innerHTML = '<div style="background:#ecfdf5;border-radius:14px;padding:10px;text-align:center;font-weight:900;color:#065f46;">📓 よく がんばったね！' + (reward ? '　🎁 +' + reward + 'pt' : '') + '<div style="font-size:12px;margin-top:4px;">先生に 見せて、コメントを もらおう。</div></div>';
  };

  /* ---------------- 🌼 よかった帳（ポリアンナの よかったさがし。書いた ものを ためる） ----------------
     saveData.yokattaLog = [{ d: "2026-10-3", t: "…", at: 時刻, st: "wait"|"ok"|"ng", c: "ひとこと", rq: 1（Qを わたした） }]
     （新しい 120こ まで。ext行に 保存・自動の 切りつめ対象に しない。書くたびに log_db「🌼よかった帳」へ 全文）
     ★2026-10-03変更（保護者）：書いた その場では Q を わたさない。1時間 いじょう たってから アプリを 開いた ときに、
       GAS の 汎用 Gemini アクション GENERATE_QUIZ_QUESTIONS で 見直し、「意味の 通る 文で よかった ことを 書いて いる」
       ものだけ 1こ 1Q（1日 YK_DAY_MAX まで）。前に 書いた 文と ほぼ 同じ 文は ng（使い回し 対策）。
       GAS は generated_questions しか 返さないので、判定は その 形（category="ok"/"ng"、question_text＝ひとこと）で 受け取る。 */
  var YK_DAY_MAX = 2, YK_WAIT_MS = 60 * 60 * 1000;
  function ylog() { var sd = window.saveData || {}; return Array.isArray(sd.yokattaLog) ? sd.yokattaLog : []; }
  function ykMark(e) {
    if (e.st === "ok") return '<span style="color:#059669;">⭕</span>';
    if (e.st === "ng") return '<span style="color:#b45309;">🔁</span>';
    if (e.st === "wait") return '<span title="あとで ニコ先生が 読むよ">⏳</span>';
    return "🌼"; // 見直しを 入れる 前に 書いた もの
  }
  window.openYokatta = function () {
    var list = ylog(), t = today(), todays = list.filter(function (e) { return e.d === t; });
    var byDay = {}, order = [];
    list.slice().reverse().forEach(function (e) { if (!byDay[e.d]) { byDay[e.d] = []; order.push(e.d); } byDay[e.d].push(e); });
    var past = order.slice(0, 30).map(function (d) {
      var p = d.split("-");
      return '<div style="border-bottom:1px dashed #fde68a;padding:6px 2px;"><div style="font-size:11px;font-weight:900;color:#b45309;">' + p[1] + '月' + p[2] + '日</div>' +
        byDay[d].map(function (e) {
          return '<div style="font-size:13px;font-weight:700;color:#4a3b52;">' + ykMark(e) + ' ' + esc(e.t) + (e.c ? '<div style="font-size:11px;color:' + (e.st === "ok" ? "#059669" : "#b45309") + ';margin-left:20px;">ニコ先生：' + esc(e.c) + '</div>' : '') + '</div>';
        }).join("") + '</div>';
    }).join("");
    var inputs = [0, 1, 2].map(function (i) { return '<input id="yk-in' + i + '" maxlength="60" placeholder="よかった ' + "①②③".charAt(i) + '" style="width:100%;box-sizing:border-box;margin-top:6px;padding:10px;border:2px solid #fde68a;border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;">'; }).join("");
    shell('<div style="font-size:18px;font-weight:900;color:#b45309;text-align:center;">🌼 今日の よかった さがし</div>' +
      '<div style="font-size:12px;font-weight:700;color:#7a6985;text-align:center;margin:4px 0 6px;line-height:1.6;">ポリアンナの「よかったさがし」。<br>小さな ことで いいよ。「給食の カレーが おいしかった」のように、文で 書こう。<br>あとで ニコ先生が 読んで、ちゃんと 文に なって いたら 1こ 1Q（1日 ' + YK_DAY_MAX + 'Qまで）。</div>' +
      (todays.length ? '<div style="background:#fefce8;border-radius:12px;padding:6px 10px;font-size:12px;font-weight:800;color:#854d0e;">今日は もう ' + todays.length + 'こ 見つけたね！ まだ あれば 書こう</div>' : '') +
      inputs +
      '<button style="' + BTN + 'width:100%;margin-top:10px;padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#f59e0b,#ec4899);" onclick="window.yokattaSave()">🌼 よかった帳に のこす</button>' +
      '<div id="yk-result"></div>' +
      '<div style="margin-top:12px;font-size:14px;font-weight:900;color:#b45309;">📒 これまでの よかった（' + list.length + 'こ）</div>' +
      '<div style="font-size:11px;font-weight:700;color:#7a6985;">⏳ ニコ先生が まだ 読んで いない　⭕ よく 書けた　🔁 文に して みよう</div>' +
      (past || '<div style="font-size:12px;color:#7a6985;font-weight:700;padding:6px 0;">まだ ないよ。今日が 1こ目！</div>') +
      '<div style="display:grid;gap:8px;margin-top:12px;"><button style="' + BTN + 'padding:10px;font-size:13px;color:#0f766e;background:#ccfbf1;" onclick="window.showJigakuCard(&quot;a_yokatta&quot;)">📓 ノートにも 書く（1ページの 形）</button>' +
      '<button style="' + BTN + 'padding:10px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.openJigakuNote()">◀ 自学ネタに もどる</button></div>');
  };
  window.yokattaSave = function () {
    var sd = window.saveData; if (!sd) return;
    if (!extReady()) { alert("いま データを 読みこみ中だよ。少し まってから もう一度 おしてね"); return; }
    var items = [0, 1, 2].map(function (i) { var el = document.getElementById("yk-in" + i); return el ? el.value.replace(/\s+/g, " ").trim().slice(0, 60) : ""; }).filter(Boolean);
    if (!items.length) { alert("よかった ことを 1つ いじょう 書いてね"); return; }
    var t = today(), now = Date.now();
    sd.yokattaLog = ylog().concat(items.map(function (x) { return { d: t, t: x, at: now, st: "wait" }; })).slice(-120);
    if (window.saveGame) window.saveGame();
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🌼よかった帳", msg: items.join(" ／ ") });
    window.openYokatta();
    var r = document.getElementById("yk-result");
    if (r) r.innerHTML = '<div style="background:#fef3c7;border-radius:14px;padding:10px;margin-top:8px;text-align:center;font-weight:900;color:#92400e;">🌼 ' + items.length + 'こ のこしたよ！<div style="font-size:12px;margin-top:4px;">あとで ニコ先生が 読むよ。ちゃんと 文に なって いたら Q が とどくよ。</div></div>';
  };

  // よかった帳は ext行に あるので、ext行を 読みこめてから 書く・見直す（読みこみ前に 書くと 上書きで 消える）
  function extReady() { return !window.playerId || window.saveExtLoadedFor === window.playerId; }
  // あとで 見直す（アプリを 開いた ときに 1回、裏で）
  function ykToast(html) {
    var el = document.createElement("div");
    el.style.cssText = "position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9999;background:#fff7ed;border:2px solid #fdba74;border-radius:16px;padding:10px 14px;font-family:'Zen Maru Gothic';font-weight:900;font-size:13px;color:#9a3412;box-shadow:0 6px 16px rgba(0,0,0,.15);max-width:90%;text-align:center;";
    el.innerHTML = html; document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 7000);
  }
  window.reviewYokatta = function () {
    var sd = window.saveData, now = Date.now();
    if (!sd || !window.playerId || !extReady() || window._ykReviewing || typeof window.postToGAS !== "function") return Promise.resolve(null);
    var all = ylog(), pend = all.filter(function (e) { return e.st === "wait" && (!e.at || now - e.at >= YK_WAIT_MS); }).slice(0, 15);
    if (!pend.length) return Promise.resolve(null);
    window._ykReviewing = true;
    var ref = all.filter(function (e) { return e.st === "ok"; }).slice(-10).map(function (e) { return e.t; });
    var systemPrompt = [
      "あなたは小学4年生の「よかった日記」を読む先生です。番号つきの各文が「その日のよかったことを、意味の通る文で書いているか」を判定します。",
      "ng にするもの：意味のない文字の並び、同じ文字のくり返し、1〜3文字だけ、よかったことと関係ない言葉、【前に書いた文】や同じ日のほかの文とほとんど同じ文（使い回し）。",
      "短くても意味が通れば ok。漢字やひらがなのまちがいは気にしない。",
      "出力は次のJSONだけ（前置き・コードブロック記号なし）。文1つにつき generated_questions の要素を1つ、入力と同じ順番で：",
      '{"generated_questions":[{"question_id":"r0","category":"ok または ng","question_text":"子どもへのやさしい一言（25字以内。ngなら、どう書けばよいかのヒント）","options":["-","-","-","-"],"correct_index":0,"explanation":"判定のりゆう（短く）"}]}'
    ].join("\n");
    var userPrompt = (ref.length ? "【前に書いた文】\n" + ref.join("\n") + "\n\n" : "") + "【判定する文】\n" + pend.map(function (e, i) { return i + ": " + e.t; }).join("\n");
    return window.postToGAS({ action: "GENERATE_QUIZ_QUESTIONS", systemPrompt: systemPrompt, userPrompt: userPrompt }).then(function (res) {
      var gq = res && Array.isArray(res.generated_questions) ? res.generated_questions : [];
      if (gq.length !== pend.length) return null; // 数が 合わない・エラー（503など）→ ⏳ の まま、次に 開いた ときに もう一度
      sd = window.saveData; if (!sd) return null;
      var cur = ylog(), keyOf = function (e) { return e.d + "|" + (e.at || "") + "|" + e.t; }, idx = {};
      cur.forEach(function (e) { idx[keyOf(e)] = e; });
      var okN = 0, ngN = 0, give = 0, perDay = {};
      cur.forEach(function (e) { if (e.rq) perDay[e.d] = (perDay[e.d] || 0) + 1; });
      pend = pend.map(function (e) { return idx[keyOf(e)]; });
      if (pend.some(function (e) { return !e; })) return null; // 見つからない（ほかの 端末で 変わった など）→ 次回
      pend.forEach(function (e, i) {
        var g = gq[i] || {}, ok = String(g.category || "").trim().toLowerCase() === "ok";
        e.st = ok ? "ok" : "ng"; e.c = String(g.question_text || "").slice(0, 40);
        if (ok) { okN++; if ((perDay[e.d] || 0) < YK_DAY_MAX) { e.rq = 1; perDay[e.d] = (perDay[e.d] || 0) + 1; give++; } } else ngN++;
      });
      sd.q = (sd.q || 0) + give;
      if (window.saveGame) window.saveGame(); if (window.updateUI) window.updateUI();
      if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🌼よかった帳（見直し）", msg: "⭕" + okN + " 🔁" + ngN + (give ? " +" + give + "Q" : "") + " ／ " + pend.map(function (e) { return (e.st === "ok" ? "⭕" : "🔁") + e.t; }).join(" ") });
      ykToast("🌼 ニコ先生が よかった帳を 読んだよ！　⭕" + okN + "こ" + (ngN ? "　🔁" + ngN + "こ" : "") + (give ? "　🎁 +" + give + "Q" : "") + '<div style="font-size:11px;margin-top:2px;">どうぐばこ →「📓 自学ノート」→「🌼 よかった帳」で 見られるよ</div>');
      return { ok: okN, ng: ngN, give: give };
    }).catch(function (e) { console.error("[yokatta] review failed", e); return null; }).then(function (r) { window._ykReviewing = false; return r; });
  };
  // ホームが 表示されたら、少し あとに 1回だけ 見直す（ログイン・読みこみが 終わってから）
  var uiJ = window.updateUI;
  if (typeof uiJ === "function") {
    window.updateUI = function () {
      var r = uiJ.apply(this, arguments);
      try {
        if (!window._ykReviewTried && window.playerId && window.saveData && window.globalStageMaster && extReady()) {
          window._ykReviewTried = true;
          setTimeout(function () { window.reviewYokatta(); }, 5000);
        }
      } catch (e) {}
      return r;
    };
  }
  // 作品読解6（ポリアンナが 出る 単元）の 説明画面に ボタン
  var obJ = window.openBriefing;
  if (typeof obJ === "function") {
    window.openBriefing = function (stg) {
      var r = obJ.apply(this, arguments);
      try {
        if (stg && /dokkai6/.test(String(stg.id))) {
          var z = document.getElementById("br-buttons-zone");
          if (z) { var b = document.createElement("button"); b.className = "br-btn"; b.style.cssText = "background:#fef3c7;color:#92400e;"; b.textContent = "🌼 ポリアンナの「よかったさがし」を やって みる"; b.onclick = function () { if (window.closeBriefing) window.closeBriefing(); window.openYokatta(); }; z.appendChild(b); }
        }
      } catch (e) {}
      return r;
    };
  }
  window.JIGAKU_NOTE = { CARDS: CARDS, columns: columns };
})();
