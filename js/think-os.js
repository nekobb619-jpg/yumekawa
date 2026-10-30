/* =====================================================================
   js/think-os.js — 🧭 考えかたOS（子どもが 自分で 判断する ための 型）＋ ニコの 先生モード ほか 一式
   ★2026-10-30追加（保護者：判断の OS を。解き方フローを 人に 説明できる ように。トップダウン／ボトムアップ、
     意外な 方向からの アプローチ、なぜ 学ぶのかを 最初に。OS は 別の OS に 乗りかえる ことも ある 前提で）
   作戦会議：こども学習ポータル meetings/2026-10-30-os（個別指導の 見極めも そこ）

   【OS の 乗りかえ（いちばん 大事な ルール）】
   ・OS の 中身（ステップの 名前・順番・問いかけ・作戦カード）は THINK_OS の 1か所だけに 書く。
   ・問題データは「何番目」でなく「役わり（role）」で ステップに 結びつける（why/goal/known/route/do/check）。
     新しい OS で ステップの 順番や 名前を かえても、問題データは そのまま 使える。
     新しい 役わりを 足したら、その 役わりの 問題が ない 問題は その ステップを とばす（こわれない）。
   ・乗りかえる ときは：①THINK_OS.id を "v2" などに、date を 更新 ②OS_HISTORY の 先頭に { id, date, from:"v1", why, changes:[…] } を 足す
     ③ポータルの 作戦会議に「考えかたOS v2」を 書く（v1 は 消さない）。
     子どもには、はじめて 開いた ときに「新しい 道具に なったよ」と 前の OS との 対応（changes）を 1回 見せる（saveData.thinkOs.ver）。
   ・記録（saveData.thinkOs）は OS の 版を いっしょに のこす（notes[].v）ので、版を こえて ふり返れる。

   【中身】
   ・🧭 OS カード：0〜5 の ステップ＋作戦カード。ステージ中も 左下の 🧭 から 見られる。🖨 A4 印刷。
   ・🦄 ニコの 先生モード：ニコが まちがえた 問題を、OS の カードで ニコに 教える。
       Lv1 カードを えらぶ／Lv2 ＋空らん（「□を もとめる ために、先に □を 出す」）／Lv3 ＋ひとこと（自分の ことば）。
       3問で Lv2、6問で Lv3。ひとことが「〜ため」から 始まる（目的から 話せた）と かけら ＋1。
   ・🛤 2つの 道：同じ 問題を「ゴールから（トップダウン）」と「わかる ことから（ボトムアップ）」で 解いて、どっちが 楽だったか えらぶ。
   ・🃏 ふしぎな 問題：ふつうの 手順では 解きにくい 問題。先に 作戦カードを 1まい えらぶ。解いたら ニコの「別の 道」。
   ・💡 なんのため？：学校の 単元（js/school-units.js）が かわったら、ホームで 1回 だけ 出す（こまりごと → できる こと → だから）。
   ・ごほうびは シールの かけら（js/sticker-book.js の stickerAddShardsExternal。1日の 上限は ステージと 共通）。
     ごほうびが 出るのは 1日 REWARD_DAY 問まで（周回で ふやせない）。Q・pt は わたさない。
   ・問題・場面の 文は すべて オリジナル（教科書・テストの 文は 使わない）。
   ===================================================================== */
(function () {
  "use strict";

  /* ================= OS の 定義（ここ だけを かえる） ================= */
  var THINK_OS = {
    id: "v1", date: "2026-10-30", name: "考えかたOS",
    steps: [
      { role: "why", icon: "💡", name: "なんのため？", ask: "この 学びは、どんな ことに こまった ときの ため？", tip: "単元の はじめに 1回。こまりごと → できる こと → だから この 順で" },
      { role: "goal", icon: "🎯", name: "なにを 聞かれてる？", ask: "さいごに 出す 答えは なに？ たんいは？", tip: "問題文の さいごの 文を 指で なぞろう" },
      { role: "known", icon: "📦", name: "わかって いる ことは？", ask: "数と ことばを ぬき出そう。「ずつ」「倍」「あわせて」に 注目", tip: "いらない 数が まざって いる ことも ある" },
      { role: "route", icon: "🧭", name: "どっちから 攻める？", ask: "ゴールから：答えを 出すには 何が わかれば いい？／わかる ことから：これで 何が 言える？", tip: "こまったら もう 1つの 道に きりかえ" },
      { role: "do", icon: "✏️", name: "やって みる", ask: "式を 書いて 計算。とちゅうの 式も のこす", tip: "かっこ・計算の 順番に 気を つけて" },
      { role: "check", icon: "🔍", name: "たしかめる", ask: "答えは 問題に 合ってる？ ×と÷は？ 大きすぎ・小さすぎ ない？ さいしょの こまりごとは 解決した？", tip: "答えを 問題文に もどして 読んで みる" }
    ],
    tactics: [
      { id: "small", icon: "🔢", name: "小さい 数で ためす", ask: "数を 小さく して、きまりを 見つけよう" },
      { id: "draw", icon: "📐", name: "図や 表に する", ask: "絵・線・表に かくと 見えて くる" },
      { id: "back", icon: "⏪", name: "逆から たどる", ask: "さいごから はじめに もどって みよう" },
      { id: "extreme", icon: "🌋", name: "極端な 場合を 考える", ask: "「ぜんぶ ◯◯ だったら？」と 考えて、ちがいを 見る" },
      { id: "similar", icon: "🔗", name: "にた 問題を 思い出す", ask: "前に 解いた にた 問題は ある？ 同じ やり方が 使えない？" }
    ]
  };
  // 新しい 版を 足す ときは 先頭に。changes は 子どもに 見せる 対応（「前の ◯◯ は いまの ◯◯」）
  var OS_HISTORY = [
    { id: "v1", date: "2026-10-30", from: null, why: "はじめての 考えかたOS", changes: [] }
  ];
  window.THINK_OS = THINK_OS; window.THINK_OS_HISTORY = OS_HISTORY;
  var REWARD_DAY = 3, LV2_AT = 3, LV3_AT = 6;

  /* ================= 💡 なんのため？（単元 id ごと。オリジナルの 場面） ================= */
  var PURPOSE = {
    u007: { icon: "🍪", trouble: "クッキー 96まいを 12人で 同じ 数ずつ 分けたい。1まいずつ 配って いたら 日が くれちゃう…", can: "大きな 数を 2けたの 数で 分ける 計算が、紙の 上で すばやく できる", so: "だから「1人 何まい？」の ゴールを きめて、たてる → かける → ひく → おろす の 順で 進めよう" },
    u008: { icon: "🛒", trouble: "ノートを 何さつか 買って おつりを 知りたい。でも ひき算と かけ算、どっちを 先に する？ 順番を まちがえると 大へん！", can: "いくつかの 計算を 1つの 式に まとめて、正しい 順番で 計算できる。くらべる ときは「何倍？」も 使える", so: "だから まず「さいごに 何を 出す？」を きめて、先に 出す ものから じゅんに 式に しよう" },
    u009: { icon: "🌷", trouble: "形の ちがう 2つの 花だん、どっちが 広い？ まわりの 長さを はかっても、広さは くらべられない…", can: "「1cm の 正方形が いくつ 分？」で 広さを 数で あらわし、たて × よこ で すぐ 出せる", so: "だから「長さ（まわり）を 聞かれてる？ 広さを 聞かれてる？」を はじめに たしかめよう" },
    u010: { icon: "🧮", trouble: "おこづかいで 3つ 買いたい。ちょうどの 計算を する 前に「だいたい 足りる？」を すぐ 知りたい", can: "数を「だいたい」に して、見つもり・たしかめが すばやく できる", so: "だから「どの 位までの がい数？」を きめて、その 1つ 下の 位を 見て 四捨五入しよう" },
    u011: { icon: "🧃", trouble: "0.6L の ジュースが 7本。ぜんぶで 何L？ 小数の かけ算が わからないと、42L みたいな ありえない 答えに なっちゃう", can: "小数の まま かけたり わったり できる。答えの 大きさも 見当が つく", so: "だから 計算の 前に「だいたい 何L くらい？」と 見当を つけてから、小数点の 位置を たしかめよう" },
    u012: { icon: "📋", trouble: "クラスの けがの 記録が ばらばら。どこで、いつ 多いのか 分からない…", can: "表に 整理して、多い ところ・少ない ところを 見つけられる", so: "だから「何を 知りたい？」を きめてから、たて・よこの 見出しを えらぼう" },
    u013: { icon: "🍕", trouble: "ピザを 1まいより 多く 食べた。「1と 半分」を 数で どう 書く？", can: "1より 大きい 分数や、大きさの 同じ 分数を あつかえる", so: "だから「1つ分は どれ？」を はっきり させてから 数えよう" },
    u014: { icon: "📈", trouble: "だんを つむと 何本 ストローが いる？ 10だんの ときを 全部 作って 数えるのは 大へん", can: "ともなって かわる 2つの 数の きまりを 見つけて、先を 予想できる", so: "だから 小さい 数で 表に して、きまりを 見つけてから 先を 考えよう" },
    u015: { icon: "📦", trouble: "プレゼントの 箱を 作りたい。どんな 面が 何まい いる？", can: "箱の 形の 面・辺・頂点の きまりが 分かり、展開図が かける", so: "だから 実物を 思いうかべて、向かい合う 面に 注目しよう" }
  };

  /* ================= 🦄 ニコの 先生モード（問題は 役わりで ステップに 結びつける） =================
     steps[role] = { q, a:[正解を 先頭に], hint }。blank = { t:"{A}を もとめる ために、先に {B}を 出す", A:[正解,…], B:[正解,…] }
     purpose ＝ この 問題の 目的（Lv3 の お手本）。routes ＝ 2つの 道（あれば）。 */
  var TEACH = [
    { id: "t_otsuri", unit: "u008", title: "ノートの おつり",
      text: "1さつ 70円の ノートを 4さつ 買って、500円 はらいました。おつりは いくらですか。",
      niko: "500−70＝430、430×4＝1720。おつりは 1720円！…あれ？ はらった お金より 多いや",
      steps: {
        goal: { q: "ニコに 教えよう。この 問題で 聞かれて いるのは？", a: ["おつり（円）", "ノート 4さつの 代金", "ノート 1さつの ねだん"], hint: "さいごの 文「〜は いくらですか」を 見て" },
        known: { q: "わかって いる ことは？", a: ["1さつ 70円・4さつ・500円 はらった", "1さつ 70円・500円 だけ", "4さつ・500円 だけ"], hint: "数は 3つ 出て くるよ" },
        route: { q: "ゴールから 考えると、先に 何を 出す？", a: ["4さつ分の 代金（70×4）", "500−70", "500÷4"], hint: "おつり＝はらった お金 − 代金" },
        "do": { q: "正しい 式と 答えは？", a: ["500−70×4＝220（円）", "(500−70)×4＝1720（円）", "500−70＋4＝434（円）"], hint: "かけ算は ひき算より 先に 計算" },
        check: { q: "ニコの まちがいは どこ？", a: ["先に ひき算を して、1さつ分しか ひいて いない", "かけ算の 計算ミス", "たんいを 書いて いない"], hint: "500−70 は「1さつだけ 買った」ときの おつり" }
      },
      blank: { t: "{A}を もとめる ために、先に {B}を 出す", A: ["おつり", "代金", "ノートの 数"], B: ["4さつ分の 代金", "1さつの ねだん", "はらった お金"] },
      purpose: "はらった お金から 代金を ひいて、おつりを 知る ため",
      routes: {
        top: [
          { q: "ゴールは「おつり」。おつりを 出すには 何が わかれば いい？", a: ["はらった お金（500円）と 代金", "ノートの 数だけ", "1さつの ねだんだけ"] },
          { q: "代金は まだ わからない。代金を 出すには？", a: ["1さつ 70円 × 4さつ", "500円 ÷ 4さつ", "500円 − 70円"] },
          { q: "下から もどろう。おつりは？", a: ["500−280＝220円", "500−70＝430円", "280−70＝210円"] }
        ],
        bottom: [
          { q: "「1さつ 70円」と「4さつ」から すぐ 言える ことは？", a: ["4さつで 280円", "おつりは 430円", "1さつ 17円"] },
          { q: "「280円」と「500円 はらった」から 言える ことは？", a: ["おつりは 220円", "代金は 780円", "4さつで 500円"] },
          { q: "これで ゴール（おつり）に ついた？", a: ["ついた！ 220円", "まだ。もう 1回 かける", "まだ。500を 4で わる"] }
        ]
      } },
    { id: "t_bai", unit: "u008", title: "テープは 何倍？",
      text: "赤い テープは 12cm、青い テープは 36cm です。青い テープの 長さは、赤い テープの 何倍ですか。",
      niko: "36−12＝24。だから 24倍！ …24倍って すごく 長いね？",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["青が 赤の 何倍か", "青が 赤より 何cm 長いか", "2本 あわせた 長さ"], hint: "「何倍」と「何cm 長い」は ちがう 問い" },
        known: { q: "「もとに する 量（1つ分）」は どっち？", a: ["赤い テープ 12cm", "青い テープ 36cm", "2本の ちがい 24cm"], hint: "「赤い テープの 何倍」の「の」の 前が もとに する 量" },
        route: { q: "どう 考える？", a: ["赤を 1と みて、青に 赤が いくつ 分 入るか", "青から 赤を ひいて ちがいを 出す", "2本を たして 2で わる"], hint: "何倍＝いくつ分" },
        "do": { q: "式と 答えは？", a: ["36÷12＝3（倍）", "36−12＝24（倍）", "12×36＝432（倍）"], hint: "くらべる 量 ÷ もとに する 量" },
        check: { q: "ニコの まちがいは どこ？", a: ["ひき算で「どれだけ 長いか」を 出して しまった", "わり算の 計算ミス", "赤と 青を 反対に した"], hint: "24 は「24cm 長い」の 24" }
      },
      blank: { t: "{A}を もとめる ために、{B}を もとに して わる", A: ["何倍か", "ちがいの 長さ", "あわせた 長さ"], B: ["赤い テープ（12cm）", "青い テープ（36cm）", "ちがい（24cm）"] },
      purpose: "長さを「いくつ分」で くらべる ため",
      routes: {
        top: [
          { q: "ゴールは「何倍」。何倍を 出すには 何が わかれば いい？", a: ["もとに する 量と くらべる 量", "2本の ちがい", "2本の 合計"] },
          { q: "もとに する 量と くらべる 量は？", a: ["もとに する＝赤 12cm、くらべる＝青 36cm", "もとに する＝青 36cm、くらべる＝赤 12cm", "どちらも 24cm"] },
          { q: "では 答えは？", a: ["36÷12＝3倍", "12÷36", "36−12＝24倍"] }
        ],
        bottom: [
          { q: "赤 12cm を 1つ分 と すると、24cm は？", a: ["2つ分", "12つ分", "24つ分"] },
          { q: "36cm は 12cm の いくつ分？", a: ["3つ分", "24つ分", "4つ分"] },
          { q: "だから 青は 赤の？", a: ["3倍", "24倍", "2倍"] }
        ]
      } },
    { id: "t_moto", unit: "u008", title: "かばんと ふでばこ",
      text: "かばんの ねだんは 3000円で、ふでばこの ねだんの 5倍です。ふでばこは いくらですか。",
      niko: "5倍だから かけ算！ 3000×5＝15000円。ふでばこ、高いね〜",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["ふでばこの ねだん", "かばんの ねだん", "2つの 合計"], hint: "「〜は いくらですか」の 〜を 見る" },
        known: { q: "もとに する 量（1つ分）は どっち？", a: ["ふでばこ（まだ わからない）", "かばん 3000円", "5倍"], hint: "「ふでばこの ねだんの 5倍」→ ふでばこが 1つ分" },
        route: { q: "図に すると？", a: ["ふでばこ □ が 5つ分で 3000円", "かばんが 5つ分で ふでばこ", "3000円が 1つ分"], hint: "テープ図を かいて みよう" },
        "do": { q: "式と 答えは？", a: ["3000÷5＝600（円）", "3000×5＝15000（円）", "3000−5＝2995（円）"], hint: "□×5＝3000 の □ は？" },
        check: { q: "ニコの まちがいは どこ？", a: ["「5倍」を 見て かけ算に した。もとに する 量を 出すのは わり算", "かけ算の 計算ミス", "たんいが ちがう"], hint: "ふでばこが かばんより 高く なったら おかしい" }
      },
      blank: { t: "{A}を もとめる ために、{B}を 5で わる", A: ["ふでばこの ねだん", "かばんの ねだん", "2つの ちがい"], B: ["かばんの ねだん（3000円）", "ふでばこの ねだん", "5倍"] },
      purpose: "大きい 方の ねだんから、もとに なる ねだんを 知る ため" },
    { id: "t_kubaru", unit: "u007", title: "カードを 配る",
      text: "カードが 96まい あります。1人に 8まいずつ 配ると、何人に 配れますか。",
      niko: "96×8＝768人！ クラス ぜんいんより ずっと 多いや",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["配れる 人数", "1人 何まいか", "カードの 合計"], hint: "「何人に」" },
        known: { q: "わかって いる ことは？", a: ["全部で 96まい・1人 8まいずつ", "全部で 96人・8まい", "1人 96まい・8人"], hint: "「ずつ」は 1人分" },
        route: { q: "どう 考える？", a: ["96まいの 中に 8まいの たばが いくつ 作れるか", "96まいを 8回 たす", "96まいから 8まい ひく"], hint: "同じ 数ずつ 分ける" },
        "do": { q: "式と 答えは？", a: ["96÷8＝12（人）", "96×8＝768（人）", "96−8＝88（人）"], hint: "8×□＝96" },
        check: { q: "ニコの まちがいは どこ？", a: ["「ずつ 配る」なのに かけ算に した", "わり算の 計算ミス", "あまりを わすれた"], hint: "96まいで 768人は ありえない" }
      },
      blank: { t: "{A}を もとめる ために、{B}で わる", A: ["配れる 人数", "カードの 合計", "1人分の まい数"], B: ["1人分の 8まい", "96まい", "人数"] },
      purpose: "同じ 数ずつ 分けたら 何人分に なるかを 知る ため" },
    { id: "t_set", unit: "u008", title: "パンと ジュースの セット",
      text: "1こ 120円の パンと 1本 80円の ジュースを 1つの セットに します。この セットを 3つ 買うと、代金は いくらですか。",
      niko: "120＋80×3＝120＋240＝360円！ やすい！",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["セット 3つ分の 代金", "セット 1つの ねだん", "ジュース 3本の 代金"], hint: "「セットを 3つ 買うと」" },
        known: { q: "わかって いる ことは？", a: ["パン 120円・ジュース 80円・セット 3つ", "パン 3こ・ジュース 1本", "パン 120円・3つ だけ"], hint: "セット＝パン＋ジュース" },
        route: { q: "先に 何を 出す？", a: ["セット 1つの ねだん（120＋80）", "ジュース 3本分（80×3）", "パン 3こ分だけ"], hint: "まとまりを 先に" },
        "do": { q: "式と 答えは？", a: ["(120＋80)×3＝600（円）", "120＋80×3＝360（円）", "120×80×3（円）"], hint: "先に 計算したい ところは（ ）に" },
        check: { q: "ニコの まちがいは どこ？", a: ["（ ）を つけなかったので、パンが 1こ分しか 入って いない", "かけ算の 計算ミス", "たし算の 計算ミス"], hint: "360円だと パンは 何こ？" }
      },
      blank: { t: "{A}を もとめる ために、先に {B}を（ ）で まとめる", A: ["セット 3つ分の 代金", "パンの ねだん", "おつり"], B: ["セット 1つの ねだん", "ジュース 3本", "パン 3こ"] },
      purpose: "まとまり（セット）の ねだんを 先に 出して、いくつ分を 知る ため",
      routes: {
        top: [
          { q: "ゴールは「セット 3つの 代金」。何が わかれば いい？", a: ["セット 1つの ねだん", "ジュース 3本の ねだん", "パン 1この ねだん だけ"] },
          { q: "セット 1つの ねだんは？", a: ["120＋80＝200円", "80×3＝240円", "120×3＝360円"] },
          { q: "では 3つ分は？", a: ["200×3＝600円", "120＋240＝360円", "200＋3＝203円"] }
        ],
        bottom: [
          { q: "パン 120円と ジュース 80円から すぐ 言えるのは？", a: ["セット 1つ 200円", "セット 3つ 360円", "ちがいは 40円"] },
          { q: "1つ 200円が 3つ だと？", a: ["600円", "203円", "360円"] },
          { q: "1つの 式に すると？", a: ["(120＋80)×3", "120＋80×3", "120×3＋80"] }
        ]
      } },
    { id: "t_menseki", unit: "u009", title: "長方形の 広さ",
      text: "たて 6cm、よこ 9cm の 長方形が あります。この 長方形の 面積は 何cm² ですか。",
      niko: "まわりを ぐるっと 6＋9＋6＋9＝30。だから 30cm²！",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["面積（広さ）", "まわりの 長さ", "たての 長さ"], hint: "cm² は 広さの たんい" },
        known: { q: "わかって いる ことは？", a: ["たて 6cm・よこ 9cm", "まわり 30cm", "面積 54cm²"], hint: "問題に 書いて ある 数" },
        route: { q: "どう 考える？", a: ["1cm² の 正方形が たてに 6こ、よこに 9れつ", "まわりの 長さを ぜんぶ たす", "たてと よこを たす"], hint: "方がん紙を 思い出そう" },
        "do": { q: "式と 答えは？", a: ["6×9＝54（cm²）", "6＋9＋6＋9＝30（cm²）", "6＋9＝15（cm²）"], hint: "たて×よこ" },
        check: { q: "ニコの まちがいは どこ？", a: ["まわりの 長さ（cm）を 出して、広さ（cm²）と まちがえた", "たし算の 計算ミス", "たんいを 書いて いない"], hint: "まわりの 長さは cm、広さは cm²" }
      },
      blank: { t: "{A}を もとめる ために、{B}を かける", A: ["面積", "まわりの 長さ", "たての 長さ"], B: ["たてと よこ", "まわりの 長さ", "4つの 辺"] },
      purpose: "広さを「1cm² が いくつ分」で 知る ため",
      routes: {
        top: [
          { q: "ゴールは「面積」。何が わかれば いい？", a: ["1cm² の 正方形が いくつ 分か", "まわりの 長さ", "かどの 数"] },
          { q: "いくつ 分かを はやく 数えるには？", a: ["たての 数 × よこの 数", "まわりを 1こずつ 数える", "たて＋よこ"] },
          { q: "答えは？", a: ["6×9＝54cm²", "30cm²", "15cm²"] }
        ],
        bottom: [
          { q: "たて 6cm から 言えるのは？", a: ["1れつに 1cm² が 6こ", "広さは 6cm²", "まわりは 6cm"] },
          { q: "よこ 9cm から 言えるのは？", a: ["その れつが 9れつ", "広さは 9cm²", "9こ たす"] },
          { q: "だから 面積は？", a: ["6×9＝54cm²", "6＋9＝15cm²", "30cm²"] }
        ]
      } },
    { id: "t_gaisu", unit: "u010", title: "だいたい いくら？",
      text: "349円の 本と 268円の 本を 買います。百の位までの がい数で 見つもると、代金は だいたい いくらですか。",
      niko: "349は 400、268は 300！ だから だいたい 700円！",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["代金の 見つもり（百の位までの がい数）", "ちょうどの 代金", "2つの ちがい"], hint: "「だいたい」「がい数で」" },
        known: { q: "四捨五入で 見る 位は？", a: ["十の位（百の位の 1つ 下）", "百の位", "一の位"], hint: "百の位までに する ときは、その 1つ 下を 見る" },
        route: { q: "先に する ことは？", a: ["それぞれを 百の位までの がい数に する", "ちょうどの 代金を 出す", "大きい 方だけ がい数に する"], hint: "見つもりは がい数に してから 計算" },
        "do": { q: "式と 答えは？", a: ["300＋300＝600（円）", "400＋300＝700（円）", "349＋268＝617（円）"], hint: "349 の 十の位は 4 → 切りすて" },
        check: { q: "ニコの まちがいは どこ？", a: ["349 を 切り上げた。十の位が 4 なので 切りすて", "たし算の 計算ミス", "がい数に しなかった"], hint: "0〜4 は 切りすて、5〜9 は 切り上げ" }
      },
      blank: { t: "{A}を すばやく 知る ために、先に {B}に する", A: ["だいたいの 代金", "ちょうどの 代金", "ちがい"], B: ["百の位までの がい数", "一の位までの 数", "千の位までの がい数"] },
      purpose: "買う 前に、だいたい いくらかを すばやく 知る ため" },
    { id: "t_shosu", unit: "u011", title: "ジュースは 何L？",
      text: "1本 0.6L の ジュースが 7本 あります。ジュースは ぜんぶで 何L ですか。",
      niko: "6×7＝42 だから 42L！ おふろ みたいに いっぱい！",
      steps: {
        goal: { q: "聞かれて いるのは？", a: ["ジュース ぜんぶの かさ（L）", "1本の かさ", "本数"], hint: "「ぜんぶで 何L」" },
        known: { q: "見当を つけよう。1本は 1L より？", a: ["少ない。だから 7本でも 7L より 少ない", "多い。だから 7L より 多い", "ちょうど 1L"], hint: "0.6 は 1 より 小さい" },
        route: { q: "どう 考える？", a: ["0.1L が 6こ分 × 7 → 0.1L が 42こ分", "6×7 の 答えを そのまま 使う", "0.6＋7"], hint: "0.1 の いくつ分" },
        "do": { q: "式と 答えは？", a: ["0.6×7＝4.2（L）", "0.6×7＝42（L）", "0.6＋7＝7.6（L）"], hint: "0.1 が 42こ → 4.2" },
        check: { q: "ニコの まちがいは どこ？", a: ["小数点を わすれて、0.1L の 42こ分を 42L に した", "かけ算の 九九の ミス", "たし算に した"], hint: "見当（7L より 少ない）と くらべて みよう" }
      },
      blank: { t: "{A}を もとめる ために、{B}が いくつ分かを 考える", A: ["ぜんぶの かさ", "1本の かさ", "本数"], B: ["0.1L", "1L", "7本"] },
      purpose: "小数の かさを まとめて 知る ため" }
  ];

  /* ================= 🃏 ふしぎな 問題（作戦カードを 先に えらぶ） ================= */
  var FUSHIGI = [
    { id: "f_wa", best: "small", title: "1から 100まで たすと？",
      text: "1＋2＋3＋…＋99＋100 の 答えは いくつ？",
      why: "100こ じゅんに たすのは 大へん。1〜10 の 小さい 数で ためすと、はしと はしを ペアに すると 同じ 数に なる きまりが 見える",
      q: "答えは？", a: ["5050", "5000", "10100"], explain: "1＋100、2＋99、3＋98…どの ペアも 101。ペアは 100÷2＝50 組。101×50＝5050",
      other: "ニコの 別の 道：同じ 式を 下に 逆の 順で 書いて たてに たすと、101 が 100こ。2回 分 なので 101×100÷2" },
    { id: "f_gyaku", best: "back", title: "ある 数は？",
      text: "ある 数に 4を かけて、7を たしたら 43に なりました。ある 数は？",
      why: "さいごの 43 から、した ことを 逆に（ひく → わる）たどると、はじめの 数に もどれる",
      q: "ある 数は？", a: ["9", "12.5", "36"], explain: "43−7＝36、36÷4＝9。たしかめ：9×4＋7＝43 ✓",
      other: "ニコの 別の 道：□×4＋7＝43 の □に 数を 入れて ためす（8→39、9→43）" },
    { id: "f_ki", best: "draw", title: "池の まわりの 木",
      text: "まわりが 40m の まるい 池の まわりに、4m おきに 木を 植えます。木は 何本 いりますか。",
      why: "まっすぐな 道と、まるい まわりでは 本数が ちがう。図に かくと 見える",
      q: "何本？", a: ["10本", "11本", "9本"], explain: "40÷4＝10 の 間が できる。まるい まわりは はじめと おわりが つながるので、木の 数＝間の 数＝10本",
      other: "ニコの 別の 道：小さい 数で ためす。まわり 8m に 4m おき → 図に すると 2本。8÷4＝2 で 同じ" },
    { id: "f_akushu", best: "small", title: "あくしゅの 回数",
      text: "8人が、ほかの 人 全員と 1回ずつ あくしゅを します。あくしゅは 全部で 何回？",
      why: "8人で いきなり 数えると こんがらがる。2人・3人・4人で ためして、ふえ方の きまりを 見つける",
      q: "何回？", a: ["28回", "64回", "56回"], explain: "2人→1回、3人→3回、4人→6回、5人→10回…ふえ方は 2,3,4,… 。8人は 1＋2＋3＋4＋5＋6＋7＝28回",
      other: "ニコの 別の 道：1人が 7人と あくしゅ → 8×7＝56。でも A と B、B と A を 2回 数えて いるので 56÷2＝28" },
    { id: "f_ashi", best: "extreme", title: "犬と にわとり",
      text: "犬と にわとりが あわせて 10ぴき。足は ぜんぶで 28本。犬は 何びき？",
      why: "「ぜんぶ にわとりだったら？」と 極端に 考えると、足が 何本 たりないかで 犬の 数が 分かる",
      q: "犬は？", a: ["4ひき", "6ぴき", "7ひき"], explain: "ぜんぶ にわとりなら 足は 2×10＝20本。28−20＝8本 たりない。にわとり 1わを 犬に かえると 足は 2本 ふえる → 8÷2＝4ひき",
      other: "ニコの 別の 道：表に する（犬 0,1,2,3,4… と 足の 数）。犬 4ひきで 16＋12＝28 ✓" }
  ];

  /* ================= データ ================= */
  function today() { var x = new Date(window.currentServerTime || Date.now()); return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate(); }
  function wk() { var x = new Date(window.currentServerTime || Date.now()), d = new Date(x.getFullYear(), x.getMonth(), x.getDate() - ((x.getDay() + 6) % 7)); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function st() {
    var sd = window.saveData; if (!sd) return null;
    var s = sd.thinkOs; if (!s || typeof s !== "object") s = sd.thinkOs = {};
    if (!s.done || typeof s.done !== "object") s.done = {};
    if (!s.why || typeof s.why !== "object") s.why = {};
    if (!s.route || typeof s.route !== "object") s.route = { top: 0, bottom: 0, same: 0 };
    if (!Array.isArray(s.notes)) s.notes = [];
    if (!s.day || s.day.d !== today()) s.day = { d: today(), n: 0 };
    if (!s.fw || typeof s.fw !== "object") s.fw = {};
    s.cnt = Number(s.cnt || 0);
    return s;
  }
  function S() { return st(); } // saveGame が saveData を つくり直すので、毎回 とり直す
  function lv() { var s = S(); var c = s ? s.cnt : 0; return c >= LV3_AT ? 3 : c >= LV2_AT ? 2 : 1; }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet && window.saveData) window.syncWithGoogleSpreadsheet("LOG", { stage: "🧭考えかたOS", msg: msg + "（OS " + THINK_OS.id + "）" }); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stepOf(role) { for (var i = 0; i < THINK_OS.steps.length; i++) if (THINK_OS.steps[i].role === role) return THINK_OS.steps[i]; return null; }
  function stepNo(role) { for (var i = 0; i < THINK_OS.steps.length; i++) if (THINK_OS.steps[i].role === role) return i; return -1; }
  function tacticOf(id) { for (var i = 0; i < THINK_OS.tactics.length; i++) if (THINK_OS.tactics[i].id === id) return THINK_OS.tactics[i]; return null; }
  function reward(n, why) {
    var s = S(); if (!s) return 0;
    if (s.day.n >= REWARD_DAY) return 0;
    s.day.n += 1;
    var got = window.stickerAddShardsExternal ? window.stickerAddShardsExternal(n, "算数") : 0;
    s = S(); log(why + (got ? " → かけら +" + got : ""));
    return got;
  }
  function unitName(uid) { var l = window.SCHOOL_UNITS || []; for (var i = 0; i < l.length; i++) if (l[i].id === uid) return l[i].name; return ""; }
  function unitOrder() {
    var now = [], soon = [];
    try { var su = window.schoolUnitsNow ? window.schoolUnitsNow() : null; if (su) { now = su.now.map(function (u) { return u.id; }); soon = su.soon.map(function (u) { return u.id; }); } } catch (e) {}
    return { now: now, soon: soon };
  }
  function sortByUnit(list) {
    var o = unitOrder();
    function rk(x) { return o.now.indexOf(x.unit) >= 0 ? 0 : o.soon.indexOf(x.unit) >= 0 ? 1 : 2; }
    return list.slice().sort(function (a, b) { return rk(a) - rk(b); });
  }

  /* ================= 画面 ================= */
  var CSS =
    '#tos{position:fixed;inset:0;z-index:9990;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:10px;font-family:"Zen Maru Gothic",sans-serif}' +
    '#tos .bx{background:linear-gradient(165deg,#fff,#f5f3ff);border-radius:24px;padding:12px 12px 16px;max-width:440px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 10px 0 rgba(124,58,237,.28);color:#3b2f52}' +
    '#tos .hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}#tos .hd h2{flex:1;margin:0;font-size:18px;font-weight:900;color:#5b21b6}' +
    '#tos .x,#tos .bk{min-height:44px;min-width:44px;border:2px solid #ddd6fe;background:#fff;color:#5b21b6;font:900 13px "Zen Maru Gothic";border-radius:14px;padding:6px 12px;cursor:pointer}' +
    '#tos button:focus-visible{outline:3px solid #7c3aed;outline-offset:2px}' +
    '#tos .card{background:#fff;border:2px solid #ede9fe;border-radius:16px;padding:10px 12px;margin:8px 0}' +
    '#tos .menu{display:grid;grid-template-columns:1fr 1fr;gap:8px}#tos .menu button{min-height:84px;border:2px solid #ddd6fe;background:#fff;border-radius:18px;padding:8px;cursor:pointer;font:900 13.5px "Zen Maru Gothic";color:#3b2f52;line-height:1.35}' +
    '#tos .menu button .ic{display:block;font-size:28px;line-height:1.2}#tos .menu button small{display:block;font-size:10.5px;font-weight:700;color:#7a6985}' +
    '#tos .os{display:flex;gap:8px;align-items:flex-start;background:#fff;border:2px solid #ede9fe;border-radius:14px;padding:8px 10px;margin:6px 0}#tos .os .n{flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;font:900 14px "Zen Maru Gothic";display:flex;align-items:center;justify-content:center}' +
    '#tos .os b{font-size:14px;color:#4c1d95}#tos .os div{font-size:12px;font-weight:700;color:#5b4b73;line-height:1.55}#tos .os.on{border-color:#db2777;box-shadow:0 0 0 3px #fbcfe8}#tos .os.done{opacity:.6}' +
    '#tos .tac{display:inline-flex;align-items:center;gap:4px;border:2px dashed #c4b5fd;background:#faf5ff;border-radius:999px;padding:5px 10px;margin:3px;font:900 12px "Zen Maru Gothic";color:#6b21a8}' +
    '#tos .prob{background:linear-gradient(135deg,#fff7ed,#fef3c7);border:2px solid #fbbf24;border-radius:16px;padding:10px 12px;font-size:14.5px;font-weight:900;line-height:1.7;color:#422006}' +
    '#tos .niko{display:flex;gap:8px;align-items:flex-start;margin:8px 0}#tos .niko .f{flex:0 0 auto;width:52px;height:52px;line-height:0}#tos .niko .f svg{width:52px;height:52px}#tos .niko .say{flex:1;background:#fdf4ff;border:2px solid #f5d0fe;border-radius:16px 16px 16px 4px;padding:8px 10px;font-size:13px;font-weight:800;line-height:1.6;color:#701a75}' +
    '#tos .q{font-size:14px;font-weight:900;color:#3b2f52;margin:10px 2px 6px;line-height:1.6}' +
    '#tos .opt{display:block;width:100%;text-align:left;min-height:48px;border:2px solid #ddd6fe;background:#fff;border-radius:14px;padding:9px 12px;margin:6px 0;font:800 14px "Zen Maru Gothic";color:#3b2f52;cursor:pointer;line-height:1.5}' +
    '#tos .opt.ok{border-color:#16a34a;background:#f0fdf4}#tos .opt.ng{border-color:#f87171;background:#fef2f2;animation:tosShake .35s}' +
    '@keyframes tosShake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}' +
    '#tos .hint{font-size:12px;font-weight:800;color:#b45309;background:#fffbeb;border-radius:12px;padding:6px 10px;margin:4px 0}' +
    '#tos .go{display:block;margin:12px auto 0;border:none;border-radius:999px;min-height:48px;padding:10px 26px;font:900 15px "Zen Maru Gothic";color:#fff;background:linear-gradient(135deg,#7c3aed,#db2777);box-shadow:0 4px 0 #4c1d95;cursor:pointer}#tos .go[disabled]{background:#cbd5e1;box-shadow:none}' +
    '#tos .sub{font-size:11.5px;font-weight:700;color:#6b5a85;line-height:1.6}#tos .bar{height:8px;background:#ede9fe;border-radius:999px;overflow:hidden;margin:4px 0}#tos .bar i{display:block;height:100%;background:linear-gradient(90deg,#a78bfa,#f472b6)}' +
    '#tos .bl{display:inline-block;min-width:4em;border-bottom:3px solid #a78bfa;padding:0 4px;color:#7c3aed}' +
    '#tos textarea{width:100%;box-sizing:border-box;border:2px solid #f0abfc;border-radius:12px;padding:8px 10px;font:800 15px "Zen Maru Gothic";resize:none}' +
    '#tos .tree{border-left:4px solid #c4b5fd;margin:6px 0 6px 8px;padding-left:10px}#tos .tree .lv{font-size:12.5px;font-weight:800;color:#4c1d95;background:#faf5ff;border-radius:10px;padding:5px 8px;margin:4px 0}' +
    '#tos .tree.up{border-left-color:#fbbf24}#tos .tree.up .lv{background:#fffbeb;color:#78350f}' +
    '#tos .why{border-radius:18px;padding:12px;margin:8px 0;background:linear-gradient(135deg,#ecfeff,#f5f3ff);border:2px solid #a5f3fc}#tos .why .r{display:flex;gap:8px;margin:6px 0;font-size:13px;font-weight:800;line-height:1.6}#tos .why .r b{flex:0 0 auto;color:#0e7490}' +
    '#tos .done-fx{text-align:center;padding:6px 0}#tos .done-fx .big{font-size:44px;animation:tosPop .5s cubic-bezier(.2,1.6,.4,1)}@keyframes tosPop{0%{transform:scale(.3)}100%{transform:scale(1)}}' +
    '#tos-fab{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:calc(max(12px,env(safe-area-inset-bottom)) + 70px);z-index:120;width:48px;height:48px;border-radius:50%;border:2px solid #c4b5fd;background:rgba(255,255,255,.95);box-shadow:0 4px 12px rgba(76,29,149,.25);font-size:22px;cursor:pointer;display:none}#tos-fab.show{display:block}#tos-fab:focus-visible{outline:3px solid #7c3aed;outline-offset:2px}' +
    '@media (prefers-reduced-motion:reduce){#tos .opt.ng,#tos .done-fx .big{animation:none}}';
  function css() { if (document.getElementById("tos-css")) return; var s = document.createElement("style"); s.id = "tos-css"; s.textContent = CSS; document.head.appendChild(s); }
  function nikoSvg() {
    try { var f = (window.MASCOTS && window.MASCOTS.list || []).filter(function (x) { return /ニコ/.test(x.name || ""); })[0]; if (f) return f.svg("normal"); } catch (e) {}
    try { if (window.avatarSvg) { var a = window.avatarSvg("🐣", "normal"); if (a) return a; } } catch (e) {}
    return '<span style="font-size:40px;line-height:52px">🦄</span>';
  }

  var ui = null, lastFocus = null;
  function open(view, arg) {
    if (!window.saveData) return; css(); S();
    var old = document.getElementById("tos"); if (!old) lastFocus = document.activeElement; else old.remove();
    var w = document.createElement("div"); w.id = "tos"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "tos-t");
    w.innerHTML = '<div class="bx"><div class="hd"><button type="button" class="bk" data-t="back" aria-label="もどる" style="display:none">◀</button><h2 id="tos-t">🧭 考えかたOS</h2><button type="button" class="x" data-t="close" aria-label="とじる">とじる</button></div><div id="tos-b" aria-live="polite"></div></div>';
    document.body.appendChild(w);
    w.addEventListener("click", function (e) { if (e.target === w) return close(); var b = e.target.closest("[data-t]"); if (b) act(b.getAttribute("data-t"), b.getAttribute("data-v"), b); });
    w.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = w.querySelectorAll("button:not([disabled]),textarea"), vis = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
      if (!vis.length) return; var first = vis[0], last = vis[vis.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    ui = { view: view || "home" };
    if (view === "teach") startTeach(arg); else if (view === "routes") startRoutes(arg); else if (view === "fushigi") startFushigi(arg); else if (view === "why") ui.uid = arg;
    render();
    setTimeout(function () { var x = w.querySelector(".x"); if (x) x.focus(); }, 30);
  }
  function close() { var w = document.getElementById("tos"); if (w) w.remove(); ui = null; try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {} }
  window.openThinkOS = function (view, arg) { open(view, arg); };
  window.closeThinkOS = close;

  function render() {
    var b = document.getElementById("tos-b"); if (!b || !ui) return;
    var bk = document.querySelector("#tos .bk"); if (bk) bk.style.display = ui.view === "home" ? "none" : "";
    var t = document.getElementById("tos-t");
    var titles = { home: "🧭 考えかたOS", card: "🧭 OS カード", teach: "🦄 ニコの 先生モード", routes: "🛤 2つの 道", fushigi: "🃏 ふしぎな 問題", why: "💡 なんのため？", ver: "🧭 OS の 版" };
    if (t) t.textContent = titles[ui.view] || titles.home;
    b.innerHTML = ui.view === "card" ? cardHtml() : ui.view === "teach" ? teachHtml() : ui.view === "routes" ? routesHtml() : ui.view === "fushigi" ? fushigiHtml() : ui.view === "why" ? whyHtml() : ui.view === "ver" ? verHtml() : homeHtml();
    var ta = document.getElementById("tos-note"); if (ta) { ta.value = ui.note || ""; ta.oninput = function () { ui.note = ta.value; }; }
  }

  /* ---- ホーム ---- */
  function homeHtml() {
    var s = S(), L = lv(), left = Math.max(0, REWARD_DAY - s.day.n);
    var nx = L === 1 ? "あと " + (LV2_AT - s.cnt) + "問で Lv2（空らん）" : L === 2 ? "あと " + (LV3_AT - s.cnt) + "問で Lv3（ひとこと）" : "Lv3：自分の ことばで 教えよう";
    var o = unitOrder(), cur = o.now.concat(o.soon).filter(function (u) { return PURPOSE[u]; })[0];
    var fw = s.fw[wk()];
    return '<div class="sub" style="text-align:center;margin-bottom:6px">どんな 問題でも、同じ じゅんばんで 考える ための 道具だよ。（' + THINK_OS.name + ' ' + THINK_OS.id + '）</div>' +
      '<div class="menu">' +
      '<button type="button" data-t="view" data-v="card"><span class="ic" aria-hidden="true">🧭</span>OS カード<small>0〜5 の じゅんばん・作戦カード</small></button>' +
      '<button type="button" data-t="pick" data-v="teach"><span class="ic" aria-hidden="true">🦄</span>ニコに 教える<small>Lv' + L + '・' + esc(nx) + '</small></button>' +
      '<button type="button" data-t="pick" data-v="routes"><span class="ic" aria-hidden="true">🛤</span>2つの 道<small>ゴールから／わかる ことから</small></button>' +
      '<button type="button" data-t="pick" data-v="fushigi"><span class="ic" aria-hidden="true">🃏</span>ふしぎな 問題<small>' + (fw ? "今週は ちょうせん ずみ ✓" : "今週の 1問に ちょうせん") + '</small></button>' +
      '<button type="button" data-t="view" data-v="why"' + (cur ? ' data-u="' + cur + '"' : '') + '><span class="ic" aria-hidden="true">💡</span>なんのため？<small>' + esc(cur ? unitName(cur) : "単元の 入り口") + '</small></button>' +
      '<button type="button" data-t="print"><span class="ic" aria-hidden="true">🖨</span>カードを 印刷<small>A4・宿題の よこに</small></button>' +
      '</div>' +
      '<div class="card"><div class="sub">🧩 今日 ごほうびが 出るのは あと <b>' + left + '問</b>（1日 ' + REWARD_DAY + '問まで）。ニコに 教えると かけら +2、ぜんぶ 1回目で 正解なら +3。</div>' +
      '<div class="sub">🛤 えらんだ 道：ゴールから ' + s.route.top + '回・わかる ことから ' + s.route.bottom + '回</div></div>' +
      '<div style="text-align:center"><button type="button" class="bk" data-t="view" data-v="ver" style="font-size:11px">OS の 版と 記録</button></div>';
  }

  /* ---- OS カード ---- */
  function cardHtml(hl) {
    return THINK_OS.steps.map(function (s, i) {
      return '<div class="os' + (hl === s.role ? " on" : "") + '"><span class="n" aria-hidden="true">' + i + '</span><div><b>' + s.icon + ' ' + esc(s.name) + '</b><div>' + esc(s.ask) + '</div><div style="color:#9d174d">' + esc(s.tip) + '</div></div></div>';
    }).join("") +
      '<div class="q">🃏 作戦カード（ふつうの やり方で こまったら）</div><div>' + THINK_OS.tactics.map(function (t) { return '<span class="tac" title="' + esc(t.ask) + '">' + t.icon + ' ' + esc(t.name) + '</span>'; }).join("") + '</div>' +
      '<div class="sub" style="margin-top:6px">' + THINK_OS.tactics.map(function (t) { return t.icon + ' ' + esc(t.ask); }).join("<br>") + '</div>' +
      '<div class="sub" style="margin-top:8px;text-align:center">こまったら「いま 何番？」と 自分に 聞いて みよう</div>';
  }

  /* ---- 問題えらび ---- */
  function pickHtml(kind) {
    var s = S(), list = kind === "teach" ? sortByUnit(TEACH) : kind === "routes" ? sortByUnit(TEACH.filter(function (x) { return x.routes; })) : FUSHIGI;
    var o = unitOrder();
    return '<div class="sub" style="margin-bottom:6px">' + (kind === "teach" ? "ニコが まちがえた 問題だよ。OS の じゅんばんで 教えて あげよう。" : kind === "routes" ? "同じ 問題を、2つの 道で 解いて みよう。" : "ふつうの 手順では 解きにくい 問題。先に 作戦カードを えらぼう。") + '</div>' +
      list.map(function (p) {
        var d = (kind === "fushigi" ? s.done["f:" + p.id] : kind === "routes" ? s.done["r:" + p.id] : s.done[p.id]);
        var now = p.unit && o.now.indexOf(p.unit) >= 0 ? '<span style="color:#db2777">📌 いま 学校</span> ' : p.unit && o.soon.indexOf(p.unit) >= 0 ? '<span style="color:#0369a1">もうすぐ</span> ' : '';
        return '<button type="button" class="opt" data-t="start" data-v="' + kind + ':' + p.id + '">' + (d ? "✅ " : "▶ ") + esc(p.title) + '<br><span class="sub">' + now + esc(p.unit ? unitName(p.unit) : "") + '</span></button>';
      }).join("");
  }

  /* ---- 🦄 ニコの 先生モード ---- */
  function startTeach(id) {
    var p = TEACH.filter(function (x) { return x.id === id; })[0]; if (!p) { ui.pick = true; return; }
    var roles = THINK_OS.steps.map(function (s) { return s.role; }).filter(function (r) { return p.steps[r]; });
    ui.p = p; ui.roles = roles; ui.k = 0; ui.miss = 0; ui.tries = 0; ui.ord = null; ui.res = null; ui.phase = "steps"; ui.bl = { A: null, B: null }; ui.note = ""; ui.L = lv();
  }
  function opts(arr) { if (!ui.ord || ui.ord.n !== arr.length + ":" + ui.k + ui.phase) ui.ord = { n: arr.length + ":" + ui.k + ui.phase, o: shuffle(arr.map(function (_, i) { return i; })) }; return ui.ord.o; }
  function teachHtml() {
    if (ui.pick) return pickHtml("teach");
    var p = ui.p, r = ui.roles[ui.k];
    var head = '<div class="prob">' + esc(p.text) + '</div><div class="niko"><span class="f" aria-hidden="true">' + nikoSvg() + '</span><div class="say">' + esc(p.niko) + '<br><span style="color:#a21caf">せんせい、どこが ちがうの？ おしえて！</span></div></div>';
    var steps = '<div aria-label="OS の すすみ">' + ui.roles.map(function (rr, i) { var s = stepOf(rr); return '<span class="tac" style="' + (i === ui.k && ui.phase === "steps" ? "border-style:solid;border-color:#db2777;background:#fdf2f8" : i < ui.k || ui.phase !== "steps" ? "opacity:.55" : "") + '">' + stepNo(rr) + ' ' + s.icon + '</span>'; }).join("") + '</div>';
    if (ui.phase === "steps") {
      var s = stepOf(r), d = p.steps[r], o = opts(d.a);
      return head + steps + '<div class="q">' + stepNo(r) + ' ' + s.icon + ' ' + esc(s.name) + '<br><span style="font-weight:800">' + esc(d.q) + '</span></div>' +
        (ui.tries ? '<div class="hint">🦄「うーん、ほんとう？」 💡 ' + esc(d.hint || s.ask) + '</div>' : '') +
        o.map(function (i) { return '<button type="button" class="opt" data-t="ans" data-v="' + i + '">' + esc(d.a[i]) + '</button>'; }).join("");
    }
    if (ui.phase === "blank") {
      var bl = p.blank, parts = bl.t.split(/(\{A\}|\{B\})/);
      var sent = parts.map(function (x) { return x === "{A}" ? '<span class="bl">' + esc(ui.bl.A === null ? "？" : bl.A[ui.bl.A]) + '</span>' : x === "{B}" ? '<span class="bl">' + esc(ui.bl.B === null ? "？" : bl.B[ui.bl.B]) + '</span>' : esc(x); }).join("");
      var which = ui.bl.A === null ? "A" : "B", arr = bl[which], o2 = opts(arr);
      return head + '<div class="q">✍️ ニコに 説明する 文を 作ろう（Lv2）</div><div class="card" style="font-size:15px;font-weight:900;line-height:1.9">' + sent + '</div>' +
        (ui.tries ? '<div class="hint">🦄「その ことば で あってる？」 もう 一度 考えて みよう</div>' : '') +
        '<div class="sub">' + (which === "A" ? "1つめの ？に 入る ことばは？" : "2つめの ？に 入る ことばは？") + '</div>' +
        o2.map(function (i) { return '<button type="button" class="opt" data-t="bl" data-v="' + which + ':' + i + '">' + esc(arr[i]) + '</button>'; }).join("");
    }
    if (ui.phase === "note") {
      return head + '<div class="q">💬 ニコに ひとこと（Lv3）</div><div class="sub">「これは ◯◯の ために やるんだよ」から 始めると ◎。名前・住所は 書かないでね。</div>' +
        '<div class="hint">お手本：「これは ' + esc(p.purpose) + ' だよ。」</div>' +
        '<textarea id="tos-note" rows="3" maxlength="80" aria-label="ニコへの ひとこと" placeholder="これは 〜の ために やるんだよ。だから 先に 〜を 出すんだ"></textarea>' +
        '<button type="button" class="go" data-t="note">ニコに つたえる</button><div style="text-align:center"><button type="button" class="bk" data-t="note" data-v="skip" style="margin-top:6px">きょうは カードだけで いい</button></div>';
    }
    // おわり
    var res = ui.res || {};
    return '<div class="done-fx"><div class="big" aria-hidden="true">🦄✨</div><div class="q" style="text-align:center">ニコ「わかった！ ありがとう、せんせい！」</div></div>' +
      '<div class="card"><div class="sub"><b>今日 教えた ながれ</b></div>' + ui.roles.map(function (rr) { var s = stepOf(rr), d = p.steps[rr]; return '<div class="sub">' + stepNo(rr) + ' ' + s.icon + ' ' + esc(s.name) + '：<b>' + esc(d.a[0]) + '</b></div>'; }).join("") +
      (p.blank && ui.L >= 2 ? '<div class="sub">✍️ ' + esc(p.blank.t.replace("{A}", p.blank.A[0]).replace("{B}", p.blank.B[0])) + '</div>' : '') +
      (res.note ? '<div class="sub">💬 ' + esc(res.note) + '</div>' : '') + '</div>' +
      '<div class="card" style="text-align:center"><div class="sub">' + (res.miss ? "まちがえた ところも 自分で 直せたね。" : "ぜんぶ 1回目で 正解！") + (res.purpose ? "<br>💡「〜の ため」から 説明できた！ これが いちばん すごい" : "") + '</div>' +
      '<div class="q" style="text-align:center">' + (res.got ? "🧩 シールの かけら +" + res.got + "こ" : (S().day.n >= REWARD_DAY && !res.got ? "（今日の ごほうびは おしまい。れんしゅうは いつでも OK）" : "")) + '</div>' +
      (res.lvup ? '<div class="q" style="text-align:center;color:#db2777">🎉 Lv' + res.lvup + ' に レベルアップ！ ' + (res.lvup === 2 ? "つぎから 説明の 文を 作るよ" : "つぎから 自分の ことばで 教えるよ") + '</div>' : '') + '</div>' +
      '<button type="button" class="go" data-t="pick" data-v="teach">つぎの 問題</button>';
  }
  function teachAnswer(i) {
    var p = ui.p, r = ui.roles[ui.k], d = p.steps[r];
    if (Number(i) === 0) {
      ui.k += 1; ui.tries = 0; ui.ord = null;
      if (ui.k >= ui.roles.length) { ui.phase = ui.L >= 2 && p.blank ? "blank" : ui.L >= 3 ? "note" : "end"; if (ui.phase === "end") finishTeach(); }
    } else { ui.tries += 1; ui.miss += 1; flashNg(i); return; }
    render(); focusFirst();
  }
  function blankAnswer(v) {
    var w = v.split(":")[0], i = Number(v.split(":")[1]);
    if (i !== 0) { ui.tries += 1; ui.miss += 1; flashNg(v); return; }
    ui.bl[w] = 0; ui.tries = 0; ui.ord = null;
    if (ui.bl.A !== null && ui.bl.B !== null) { ui.phase = ui.L >= 3 ? "note" : "end"; if (ui.phase === "end") finishTeach(); }
    render(); focusFirst();
  }
  function flashNg(v) {
    render();
    var b = document.querySelector('#tos [data-v="' + v + '"]'); if (b) { b.classList.add("ng"); b.setAttribute("aria-label", b.textContent + "（ちがうみたい）"); }
  }
  function finishTeach(note) {
    var p = ui.p, s = S(), before = lv();
    note = String(note || "").replace(/[<>]/g, "").trim().slice(0, 80);
    var purpose = !!note && note.replace(/\s/g, "").slice(0, 30).indexOf("ため") >= 0;
    var firstDone = !s.done[p.id];
    s.done[p.id] = today(); s.cnt += 1;
    if (note) { s.notes.push({ d: today(), p: p.id, t: note, v: THINK_OS.id }); s.notes = s.notes.slice(-40); }
    var n = (ui.miss ? 2 : 3) + (purpose ? 1 : 0);
    var got = reward(n, "🦄 ニコに 教えた「" + p.title + "」" + (ui.miss ? "（なおし " + ui.miss + "）" : "（ぜんぶ 1回目）") + (note ? "・ひとこと：" + note : "") + (purpose ? "・目的から 説明" : ""));
    var after = lv();
    ui.res = { got: got, miss: ui.miss, note: note, purpose: purpose, lvup: after > before ? after : 0, first: firstDone };
    ui.phase = "end"; save();
  }

  /* ---- 🛤 2つの 道 ---- */
  function startRoutes(id) { var p = TEACH.filter(function (x) { return x.id === id && x.routes; })[0]; if (!p) { ui.pick = true; return; } ui.p = p; ui.way = null; ui.k = 0; ui.tries = 0; ui.ord = null; ui.phase = "choose"; ui.done = {}; ui.path = []; }
  function routesHtml() {
    if (ui.pick) return pickHtml("routes");
    var p = ui.p;
    var head = '<div class="prob">' + esc(p.text) + '</div>';
    if (ui.phase === "choose") {
      return head + '<div class="q">どっちの 道から 行く？（あとで もう 1つの 道も 行けるよ）</div>' +
        '<button type="button" class="opt" data-t="way" data-v="top"' + (ui.done.top ? ' disabled style="opacity:.5"' : '') + '>⬇ ゴールから（トップダウン）<br><span class="sub">答えを 出すには 何が わかれば いい？ → さらに 何が いる？</span></button>' +
        '<button type="button" class="opt" data-t="way" data-v="bottom"' + (ui.done.bottom ? ' disabled style="opacity:.5"' : '') + '>⬆ わかる ことから（ボトムアップ）<br><span class="sub">わかって いる ことで 何が 言える？ → それで 何が 言える？</span></button>';
    }
    if (ui.phase === "walk") {
      var arr = p.routes[ui.way], d = arr[ui.k], o = opts(d.a);
      var tree = '<div class="tree' + (ui.way === "bottom" ? " up" : "") + '">' + ui.path.map(function (x) { return '<div class="lv">✓ ' + esc(x) + '</div>'; }).join("") + '</div>';
      return head + '<div class="q">' + (ui.way === "top" ? "⬇ ゴールから" : "⬆ わかる ことから") + '（' + (ui.k + 1) + '／' + arr.length + '）</div>' + tree +
        '<div class="q">' + esc(d.q) + '</div>' + (ui.tries ? '<div class="hint">もう 一度。' + (ui.way === "top" ? "ゴールに ひつような ものは？" : "わかって いる 数を 組み合わせると？") + '</div>' : '') +
        o.map(function (i) { return '<button type="button" class="opt" data-t="rans" data-v="' + i + '">' + esc(d.a[i]) + '</button>'; }).join("");
    }
    if (ui.phase === "mid") {
      var other = ui.way === "top" ? "bottom" : "top";
      return head + '<div class="card"><div class="q">' + (ui.way === "top" ? "⬇ ゴールから" : "⬆ わかる ことから") + ' で ついた！</div><div class="tree' + (ui.way === "bottom" ? " up" : "") + '">' + ui.path.map(function (x) { return '<div class="lv">✓ ' + esc(x) + '</div>'; }).join("") + '</div></div>' +
        '<button type="button" class="go" data-t="way" data-v="' + other + '">' + (other === "top" ? "⬇ ゴールから" : "⬆ わかる ことから") + ' でも 行って みる</button>';
    }
    if (ui.phase === "which") {
      return head + '<div class="q">2つの 道で 同じ 答えに ついたね。どっちが 楽だった？</div>' +
        '<button type="button" class="opt" data-t="pref" data-v="top">⬇ ゴールから の ほうが 楽</button><button type="button" class="opt" data-t="pref" data-v="bottom">⬆ わかる ことから の ほうが 楽</button><button type="button" class="opt" data-t="pref" data-v="same">どっちも 同じ くらい</button>' +
        '<div class="sub">問題に よって 楽な 道は かわるよ。何段も ある 文章題は ゴールから、図形や きまりさがしは わかる ことから が 楽な ことが 多い。</div>';
    }
    return head + '<div class="done-fx"><div class="big" aria-hidden="true">🛤✨</div><div class="q" style="text-align:center">2つの 道、どっちも 歩けたね！</div><div class="q" style="text-align:center">' + (ui.got ? "🧩 シールの かけら +" + ui.got + "こ" : "") + '</div></div><button type="button" class="go" data-t="pick" data-v="routes">ほかの 問題</button>';
  }
  function routeAnswer(i) {
    var arr = ui.p.routes[ui.way], d = arr[ui.k];
    if (Number(i) !== 0) { ui.tries += 1; flashNg(i); return; }
    ui.path.push(d.a[0]); ui.k += 1; ui.tries = 0; ui.ord = null;
    if (ui.k >= arr.length) { ui.done[ui.way] = 1; ui.phase = ui.done.top && ui.done.bottom ? "which" : "mid"; }
    render(); focusFirst();
  }

  /* ---- 🃏 ふしぎな 問題 ---- */
  function startFushigi(id) { var p = FUSHIGI.filter(function (x) { return x.id === id; })[0]; if (!p) { ui.pick = true; return; } ui.p = p; ui.phase = "tac"; ui.tac = null; ui.tries = 0; ui.ord = null; }
  function fushigiHtml() {
    if (ui.pick) return pickHtml("fushigi");
    var p = ui.p, head = '<div class="prob">' + esc(p.text) + '</div>';
    if (ui.phase === "tac") {
      return head + '<div class="q">🃏 どの 作戦カードで 攻める？</div>' + THINK_OS.tactics.map(function (t) { return '<button type="button" class="opt" data-t="tac" data-v="' + t.id + '">' + t.icon + ' ' + esc(t.name) + '<br><span class="sub">' + esc(t.ask) + '</span></button>'; }).join("");
    }
    if (ui.phase === "solve") {
      var best = tacticOf(p.best), mine = tacticOf(ui.tac), o = opts(p.a);
      return head + '<div class="card"><div class="sub">きみの 作戦：<b>' + mine.icon + ' ' + esc(mine.name) + '</b>' + (ui.tac === p.best ? " 👍 ぴったり！" : "　／ニコの おすすめ：" + best.icon + " " + esc(best.name)) + '</div><div class="sub">💡 ' + esc(p.why) + '</div></div>' +
        '<div class="q">' + esc(p.q) + '</div>' + (ui.tries ? '<div class="hint">作戦カードを 使って、紙に 書いて ためして みよう</div>' : '') +
        o.map(function (i) { return '<button type="button" class="opt" data-t="fans" data-v="' + i + '">' + esc(p.a[i]) + '</button>'; }).join("");
    }
    return head + '<div class="done-fx"><div class="big" aria-hidden="true">🃏✨</div><div class="q" style="text-align:center">せいかい！ ' + esc(p.a[0]) + '</div></div>' +
      '<div class="card"><div class="sub">' + esc(p.explain) + '</div></div><div class="niko"><span class="f" aria-hidden="true">' + nikoSvg() + '</span><div class="say">' + esc(p.other) + '</div></div>' +
      '<div class="q" style="text-align:center">' + (ui.got ? "🧩 シールの かけら +" + ui.got + "こ" : "") + '</div><button type="button" class="go" data-t="pick" data-v="fushigi">ほかの 問題</button>';
  }

  /* ---- 💡 なんのため？ ---- */
  function whyHtml() {
    var o = unitOrder(), ids = Object.keys(PURPOSE);
    var cur = ui.uid && PURPOSE[ui.uid] ? ui.uid : o.now.concat(o.soon).filter(function (u) { return PURPOSE[u]; })[0] || ids[0];
    var P = PURPOSE[cur];
    var steps = THINK_OS.steps.filter(function (s) { return s.role !== "why"; }).map(function (s) { return s.icon; }).join(" → ");
    return '<div class="why"><div style="font-size:15px;font-weight:900;color:#155e75">' + P.icon + ' ' + esc(unitName(cur)) + '</div>' +
      '<div class="r"><b>😣 こまりごと</b><span>' + esc(P.trouble) + '</span></div><div class="r"><b>✨ この 学びで</b><span>' + esc(P.can) + '</span></div><div class="r"><b>🧭 だから</b><span>' + esc(P.so) + '</span></div>' +
      '<div class="sub" style="text-align:center;margin-top:4px">このあと OS の じゅんばんで：' + steps + '</div></div>' +
      '<div class="q">ほかの 単元</div>' + ids.filter(function (u) { return u !== cur; }).map(function (u) {
        var tag = o.now.indexOf(u) >= 0 ? " 📌いま" : o.soon.indexOf(u) >= 0 ? " もうすぐ" : "";
        return '<button type="button" class="opt" data-t="whyu" data-v="' + u + '">' + PURPOSE[u].icon + ' ' + esc(unitName(u)) + '<span class="sub">' + tag + '</span></button>';
      }).join("");
  }

  /* ---- 版 ---- */
  function verHtml() {
    var s = S();
    return '<div class="card"><div class="q" style="margin-top:0">いまの OS：' + esc(THINK_OS.name) + ' ' + THINK_OS.id + '（' + THINK_OS.date + '〜）</div>' +
      OS_HISTORY.map(function (h) { return '<div class="sub">・' + h.id + '（' + h.date + '）' + esc(h.why) + (h.changes.length ? '<br>　' + h.changes.map(esc).join("<br>　") : '') + '</div>'; }).join("") +
      '<div class="sub" style="margin-top:6px">OS は かわる ことが あるよ。かわったら、前の カードと いまの カードの 対応を おしらせするね。</div></div>' +
      '<div class="card"><div class="q" style="margin-top:0">💬 ニコへの ひとこと（さいきん）</div>' + (s.notes.length ? s.notes.slice(-8).reverse().map(function (n) { return '<div class="sub">' + esc(n.d) + '（' + esc(n.v || "") + '）：' + esc(n.t) + '</div>'; }).join("") : '<div class="sub">まだ ないよ（Lv3 で 書けるよ）</div>') + '</div>' +
      '<div class="card"><div class="sub">教えた 問題：' + s.cnt + '問／Lv' + lv() + '</div></div>';
  }

  /* ---- 印刷（A4） ---- */
  function printCard() {
    var h = '<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>考えかたOS ' + THINK_OS.id + '</title><style>@page{size:A4;margin:10mm}body{font-family:"Zen Maru Gothic","Noto Sans CJK JP",sans-serif;color:#222;margin:0}' +
      'h1{font-size:22pt;margin:0 0 2mm;text-align:center}.v{text-align:center;font-size:9pt;color:#666;margin-bottom:5mm}.s{display:flex;gap:4mm;border:0.6mm solid #7c3aed;border-radius:4mm;padding:2.2mm 4mm;margin:2mm 0;page-break-inside:avoid}' +
      '.n{flex:0 0 11mm;height:11mm;border-radius:50%;background:#7c3aed;color:#fff;font-size:15pt;font-weight:900;display:flex;align-items:center;justify-content:center}.s b{font-size:14pt}.s div{font-size:10.5pt;line-height:1.45}.tip{color:#9d174d;font-size:9.5pt!important}' +
      'h2{font-size:12.5pt;margin:3.5mm 0 2mm}.t{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm}.t div{border:0.4mm dashed #7c3aed;border-radius:3mm;padding:2.5mm 3mm;font-size:10.5pt;line-height:1.5}.f{margin-top:3.5mm;font-size:10pt;text-align:center;border-top:0.3mm solid #ccc;padding-top:3mm}</style></head><body>' +
      '<h1>🧭 考えかたOS</h1><div class="v">' + THINK_OS.id + '（' + THINK_OS.date + '）　こまったら「いま 何番？」</div>' +
      THINK_OS.steps.map(function (s, i) { return '<div class="s"><span class="n">' + i + '</span><div><b>' + s.icon + ' ' + esc(s.name) + '</b><div>' + esc(s.ask) + '</div><div class="tip">' + esc(s.tip) + '</div></div></div>'; }).join("") +
      '<h2>🃏 作戦カード（ふつうの やり方で こまったら）</h2><div class="t">' + THINK_OS.tactics.map(function (t) { return '<div><b>' + t.icon + ' ' + esc(t.name) + '</b><br>' + esc(t.ask) + '</div>'; }).join("") + '</div>' +
      '<div class="f">ニコに 教えるなら：「これは ＿＿＿＿の ために やるんだよ。だから 先に ＿＿＿＿を 出すんだ」</div></body></html>';
    var w = null; try { w = window.open("", "_blank"); } catch (e) {}
    if (!w) { alert("印刷用の まどが ひらけなかったよ。おうちの 人に たのんでね"); return; }
    w.document.open(); w.document.write(h); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 400);
    log("🖨 OS カードを 印刷");
  }

  /* ---- 操作 ---- */
  function focusFirst() { setTimeout(function () { var b = document.querySelector("#tos-b .opt, #tos-b .go, #tos-b textarea"); if (b) try { b.focus(); } catch (e) {} }, 30); }
  function act(a, v, b) {
    if (a === "close") return close();
    if (a === "back") { if (ui.view !== "home" && !ui.pick && (ui.view === "teach" || ui.view === "routes" || ui.view === "fushigi")) { ui.pick = true; } else { ui.view = "home"; ui.pick = false; } render(); return focusFirst(); }
    if (a === "view") { ui.view = v; ui.pick = false; if (v === "why") { ui.uid = b && b.getAttribute("data-u"); markWhy(ui.uid); } render(); return focusFirst(); }
    if (a === "pick") { ui.view = v; ui.pick = true; render(); return focusFirst(); }
    if (a === "start") { var kv = v.split(":"); ui.view = kv[0]; ui.pick = false; if (kv[0] === "teach") startTeach(kv[1]); else if (kv[0] === "routes") startRoutes(kv[1]); else startFushigi(kv[1]); render(); return focusFirst(); }
    if (a === "ans") return teachAnswer(v);
    if (a === "bl") return blankAnswer(v);
    if (a === "note") { var t = v === "skip" ? "" : String(ui.note || "").trim(); if (v !== "skip" && Array.from(t).length < 4) { var ta = document.getElementById("tos-note"); if (ta) { ta.focus(); ta.style.borderColor = "#f87171"; } return; } finishTeach(t); render(); return focusFirst(); }
    if (a === "way") { ui.way = v; ui.k = 0; ui.tries = 0; ui.ord = null; ui.path = []; ui.phase = "walk"; render(); return focusFirst(); }
    if (a === "rans") return routeAnswer(v);
    if (a === "pref") {
      var s = S(); s.route[v] = (s.route[v] || 0) + 1; var first = !s.done["r:" + ui.p.id]; s.done["r:" + ui.p.id] = today();
      ui.got = reward(2, "🛤 2つの 道「" + ui.p.title + "」楽だった：" + ({ top: "ゴールから", bottom: "わかる ことから", same: "同じ" })[v]);
      ui.phase = "end"; save(); render(); return focusFirst();
    }
    if (a === "tac") { ui.tac = v; ui.phase = "solve"; ui.ord = null; render(); return focusFirst(); }
    if (a === "fans") {
      if (Number(v) !== 0) { ui.tries += 1; flashNg(v); return; }
      var s2 = S(), wkk = wk(), firstWeek = !s2.fw[wkk]; s2.fw[wkk] = ui.p.id; s2.done["f:" + ui.p.id] = today();
      ui.got = firstWeek ? reward(ui.tac === ui.p.best ? 3 : 2, "🃏 ふしぎな 問題「" + ui.p.title + "」作戦：" + tacticOf(ui.tac).name + (ui.tries ? "（なおし " + ui.tries + "）" : "")) : 0;
      if (!firstWeek) log("🃏 ふしぎな 問題「" + ui.p.title + "」（今週 2問目・ごほうび なし）");
      ui.phase = "end"; save(); render(); return focusFirst();
    }
    if (a === "whyu") { ui.uid = v; markWhy(v); render(); return focusFirst(); }
    if (a === "print") return printCard();
  }
  function markWhy(uid) { var s = S(); if (s && uid && !s.why[uid]) { s.why[uid] = today(); save(); log("💡 なんのため？（" + unitName(uid) + "）を 見た"); } }

  /* ================= ホーム・ステージ中との つなぎ ================= */
  function homeVisible() {
    var lm = document.getElementById("login-modal"); if (lm && getComputedStyle(lm).display !== "none") return false;
    return !["game-screen", "tutor-screen", "allowance-screen"].some(function (id) { var e = document.getElementById(id); return e && getComputedStyle(e).display !== "none"; });
  }
  function addTile() {
    if (document.getElementById("tos-tile")) return;
    var grids = document.querySelectorAll(".container .tile-grid"); if (!grids.length) return;
    var b = document.createElement("button"); b.className = "tile"; b.id = "tos-tile"; b.type = "button";
    b.innerHTML = '<span class="ti">🧭</span>考えかたOS<small>ニコに 教える</small>';
    b.onclick = function () { open("home"); };
    grids[0].insertBefore(b, grids[0].children[2] || null);
  }
  function fab() {
    var f = document.getElementById("tos-fab");
    if (!f) { css(); f = document.createElement("button"); f.id = "tos-fab"; f.type = "button"; f.setAttribute("aria-label", "考えかたOS の カードを 見る"); f.textContent = "🧭"; f.onclick = function () { open("card"); }; document.body.appendChild(f); }
    var g = document.getElementById("game-screen"); f.classList.toggle("show", !!(g && getComputedStyle(g).display !== "none") && !document.getElementById("tos"));
  }
  // 単元が かわったら ホームで 1回「なんのため？」
  var whyTried = {};
  function autoWhy() {
    var s = S(); if (!s || !window.playerId || !homeVisible() || document.getElementById("tos")) return;
    var ov = document.getElementById("data-loading-overlay"); if (ov && getComputedStyle(ov).display !== "none") return;
    var busy = ["stk-reveal", "kpf-fx", "am-news", "treasure-reveal-modal", "streak-celebration-modal", "stamp-modal", "kuropon-modal", "why-note"].some(function (id) { var e = document.getElementById(id); return e && getComputedStyle(e).display !== "none"; });
    if (busy) return;
    var o = unitOrder(), u = o.now.concat(o.soon).filter(function (id) { return PURPOSE[id] && !s.why[id] && !whyTried[id]; })[0];
    if (!u) return; whyTried[u] = 1;
    open("why", u); markWhy(u);
  }
  // OS が 新しい 版に なったら 1回だけ「新しい 道具に なったよ」
  function osChanged() {
    var s = S(); if (!s || !window.playerId) return;
    if (!s.ver) { s.ver = THINK_OS.id; return; }
    if (s.ver === THINK_OS.id) return;
    var h = OS_HISTORY.filter(function (x) { return x.id === THINK_OS.id; })[0], prev = s.ver; s.ver = THINK_OS.id; save();
    log("OS が かわった " + prev + " → " + THINK_OS.id);
    setTimeout(function () {
      open("ver");
      var b = document.getElementById("tos-b"); if (!b) return;
      b.insertAdjacentHTML("afterbegin", '<div class="why"><div style="font-size:15px;font-weight:900;color:#155e75">🆕 考えかたOS が 新しい 道具に なったよ（' + esc(prev) + ' → ' + THINK_OS.id + '）</div><div class="sub">' + esc(h ? h.why : "") + '</div>' + (h && h.changes.length ? '<div class="sub">' + h.changes.map(esc).join("<br>") + '</div>' : '') + '<div class="sub">前の カードで おぼえた ことは そのまま 使えるよ。</div></div>');
    }, 1200);
  }
  var tickN = 0;
  function tick() {
    try { addTile(); fab(); if (++tickN % 3 === 0) { osChanged(); if (tickN > 6) autoWhy(); } } catch (e) {}
  }
  setInterval(tick, 1000);

  window.THINK_OS_DATA = { teach: TEACH, fushigi: FUSHIGI, purpose: PURPOSE };
})();
