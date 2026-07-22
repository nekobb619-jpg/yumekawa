// ========================================================================
// book.js — 「今日（きょう）のおはなし」読書（どくしょ）しゅうかん きのう
// ------------------------------------------------------------------------
// content.js とは べつのファイル（content.js が大きくなりすぎないように）。
// 毎日ちがう みじかい おはなし＋かんたんクイズ（1〜2問）を、
// ホーム画面の目立つバナーから読めるようにする きのう。
// GASスプレッドシートは さわらない。saveData に bookLastReadDate /
// bookStreak / bookReadCount を足して localStorage ＋クラウド保存にのせる。
// ========================================================================
(function () {
  "use strict";

  // ---- ① おはなしデータ（毎日1本、じゅんばんに ローテーション） ----
  const STORIES = [
    {
      id: "book01",
      title: "ふしぎな 鉛筆（えんぴつ）",
      icon: "✏️",
      body: "りなさんは、文ぼう具（ぶんぼうぐ）屋さんで、キラキラひかる 鉛筆を 見つけました。\n\n「これ、ふしぎな 鉛筆だよ。うそを 書くと、字が きえちゃうんだ」と、お店の 人が 教えて くれました。\n\nりなさんは しんぱいに なって、宿題（しゅくだい）に「今日は ちゃんと べんきょうしました」と 書いてみました。すると、字は きえずに、キラキラと 光りました。\n\n「よかった。ほんとうの ことを 書くのが、いちばん かんたんなんだね」と、りなさんは わらいました。"
      ,
      quiz: [
        { q: "ふしぎな 鉛筆は、どんな 字を 書くと きえてしまいますか？",
          a: ["うその 字", "きたない 字", "小さい 字", "赤い 字"], c: 0,
          hint: "お店の 人が「うそを 書くと…」と 言っていたね。" },
        { q: "この おはなしから 分かる、いちばん 大切な ことは 何でしょう？",
          a: ["ほんとうの ことを 書くのが 大切", "字を きれいに 書くのが 大切", "はやく 書くのが 大切", "高い 鉛筆を 買うのが 大切"], c: 0,
          hint: "りなさんの さいごの セリフを 読みかえしてみよう。" }
      ]
    },
    {
      id: "book02",
      title: "森（もり）の どうぶつ 会議（かいぎ）",
      icon: "🦉",
      body: "森で「いちばん すごい どうぶつ」を きめる 会議が 開かれました。\n\nうさぎは「ぼくが いちばん はやい！」、ぞうは「わたしが いちばん 大きい！」と じまんしました。\n\nそこへ ふくろうが 言いました。「みんな ちがう チカラを 持っている。はやい うさぎと 大きい ぞうが いっしょに はたらけば、もっと すごいことが できるよ」\n\nつぎの 日、うさぎは 高い 木の 上の 実（み）を ぞうに 教え、ぞうは その 実を 長い 鼻で 取ってあげました。森の みんなは、なかよく 実を 分けあいました。"
      ,
      quiz: [
        { q: "ふくろうは、みんなに どんな ことを 教えて くれましたか？",
          a: ["ちがう チカラを 合わせると すごい ことが できる", "はやいのが いちばん", "大きいのが いちばん", "けんかを した ほうが いい"], c: 0,
          hint: "ふくろうの セリフを もう一度 読んでみよう。" }
      ]
    },
    {
      id: "book03",
      title: "夏休みの ひみつ基地（きち）",
      icon: "🏕️",
      body: "けんとさんと ゆいさんは、庭（にわ）の すみに、ダンボールで ひみつ基地を 作りました。\n\n「ここは ぼくたちだけの ひみつだよ」と けんとさんが 言うと、小さな 弟（おとうと）が「ぼくも 入れて！」と 泣きそうな 顔で やってきました。\n\nゆいさんは 少し 考えてから、「じゃあ、弟の ぶんの いすも 作ろう」と 言いました。3人で ダンボールを つぎたして、前より 大きな 基地が できました。\n\n弟は「ありがとう！」と、にっこり わらいました。"
      ,
      quiz: [
        { q: "ゆいさんは、弟が「入れて」と 言ったとき、どう しましたか？",
          a: ["いすを 作って、いっしょに 遊んだ", "だめだと ことわった", "見て 見ぬふりを した", "1人で 帰って しまった"], c: 0,
          hint: "「弟の ぶんの いすも 作ろう」と 言っていたね。" }
      ]
    },
    {
      id: "book04",
      title: "空を とんだ かさ",
      icon: "☂️",
      body: "つよい 風の 日、あおいさんの 赤い かさが、手から はなれて 空高く とんで いって しまいました。\n\n「わたしの かさ、もどってきて！」と 追いかけましたが、かさは どんどん 遠くへ。\n\nしばらく すると、かさは 近くの 木に ひっかかって 止まりました。木の 下には、かさを 持っていない おじいさんが、雨に ぬれて こまっていました。\n\nあおいさんは、木から とった かさを、おじいさんに 貸して あげました。「ありがとう、やさしい 子だね」と おじいさんは 言いました。"
      ,
      quiz: [
        { q: "かさが 木に ひっかかったあと、あおいさんは 何を しましたか？",
          a: ["こまっている おじいさんに かさを 貸した", "かさを すてて 帰った", "そのまま 家に 帰った", "かさを うちに 持って帰った"], c: 0,
          hint: "木の 下に いた おじいさんの ようすを 読みかえそう。" }
      ]
    },
    {
      id: "book05",
      title: "まほうの 音楽室",
      icon: "🎵",
      body: "学校の 音楽室には、みんなが 帰ったあと、楽器（がっき）たちが しゃべりだすという うわさが ありました。\n\nピアノが「今日は だれかが きれいな 音を 出してくれたね」と 言うと、たいこが「うん、でも リズムが ずれてた 時も あったよ」と こたえました。\n\n次の日、この 話を 聞いた ゆうたさんは、練習（れんしゅう）を もっと がんばろうと 思いました。1週間 後、たいこは「リズム、ぴったりに なったね！」と、うれしそうに 言いました。"
      ,
      quiz: [
        { q: "ゆうたさんは、楽器の 話を 聞いて どう しましたか？",
          a: ["練習を もっと がんばろうと 思った", "音楽室に 行かなくなった", "楽器を こわしてしまった", "べつの 楽器に かえた"], c: 0,
          hint: "「話を 聞いた ゆうたさんは」の あとを 読もう。" }
      ]
    },
    {
      id: "book06",
      title: "金魚（きんぎょ）すくいの きんちゃん",
      icon: "🐠",
      body: "お祭りの 金魚すくいで、そらさんは 1ぴきの 金魚を すくいました。名前は「きんちゃん」に しました。\n\nさいしょは 水そうの すみで じっとしていた きんちゃんですが、そらさんが 毎日 えさを あげて、水を きれいに してあげると、だんだん 元気に すいすい およぐように なりました。\n\n「きんちゃん、なかよくなれて うれしいな」と そらさんは 話しかけました。きんちゃんは、水面（すいめん）に むかって ぴょんと 小さく はねました。"
      ,
      quiz: [
        { q: "きんちゃんが 元気に なった 理由（りゆう）は 何ですか？",
          a: ["そらさんが 毎日 お世話を した", "水そうを 大きくした", "お祭りに また 行った", "べつの 金魚と かえた"], c: 0,
          hint: "「えさを あげて、水を きれいに してあげると」の 部分だよ。" }
      ]
    },
    {
      id: "book07",
      title: "星に なった うさぎ",
      icon: "⭐",
      body: "むかしむかし、山に すむ うさぎが いました。おなかを すかせた 旅人（たびびと）に、うさぎは 自分の 食べものを ぜんぶ わけて あげました。\n\nそれでも 旅人が おなかを すかせている ようすを 見て、うさぎは「わたしを 食べてください」と 言いました。\n\n旅人は じつは 神さまで、うさぎの やさしい 心に 感動（かんどう）し、うさぎを 空の 星に して、みんなが いつまでも 見られるように しました。今も 空を 見あげると、うさぎの 形の 星が かがやいています。"
      ,
      quiz: [
        { q: "旅人は、うさぎの どんな ところに 感動しましたか？",
          a: ["やさしくて 人の ために がんばる 心", "はしるのが はやい ところ", "耳が 長い ところ", "山に すんでいた こと"], c: 0,
          hint: "うさぎが 旅人に した ことを 思い出そう。" }
      ]
    },
    {
      id: "book08",
      title: "ロボットの おてつだい",
      icon: "🤖",
      body: "はるとさんの 家に、お手伝い ロボット「テト」が やってきました。テトは、そうじや せんたくは 上手でしたが、人の 気持ちが よく 分かりませんでした。\n\nある日、はるとさんが テストで 悪い 点数を 取って、しずかに 部屋に 入りました。テトは「元気を 出す プログラム」を 実行しようと しましたが、はるとさんは「今は そっとしておいて」と 言いました。\n\nテトは 少し 考えて、だまって そばに すわりました。しばらく すると、はるとさんは「ありがとう、テト」と 小さく わらいました。"
      ,
      quiz: [
        { q: "テトは、はるとさんが かなしんでいる とき 最後（さいご）に どう しましたか？",
          a: ["だまって そばに すわった", "すぐに 部屋を 出た", "大きな 音楽を かけた", "そうじを はじめた"], c: 0,
          hint: "「テトは 少し 考えて」の あとを 読もう。" },
        { q: "この おはなしから 分かる ことは 何でしょう？",
          a: ["そばに いるだけでも 人を 元気に できる", "ロボットは 何でも できる", "テストは 悪くても 平気", "そうじは 大切ではない"], c: 0,
          hint: "はるとさんの さいごの セリフに ちゅうもく。" }
      ]
    },
    {
      id: "book09",
      title: "消えた しゅくだい",
      icon: "🔍",
      body: "朝、みなとさんが かばんを あけると、書いたはずの 算数の しゅくだいが ありません。\n\n「弟が 落書きに 使ったのかな」と 思いましたが、弟は「知らないよ」と 言います。\n\nよく さがすと、しゅくだいは 教科書の あいだに はさまって いました。うっかり 教科書と いっしょに しまって いたのです。\n\nみなとさんは「弟を うたがって ごめんね」と あやまりました。弟は「ぼくも いっしょに さがしてあげる」と、にっこり しました。"
      ,
      quiz: [
        { q: "しゅくだいは、けっきょく どこに ありましたか？",
          a: ["教科書の あいだ", "弟の 部屋", "かばんの 外", "学校の つくえ"], c: 0,
          hint: "「よく さがすと」の あとを 読もう。" }
      ]
    },
    {
      id: "book10",
      title: "雨の日の ぼうけん",
      icon: "☔",
      body: "雨で 外に 出られない 日、そうたさんは つまらなそうに していました。\n\nお母さんが「長ぐつを はいて、水たまりを さがしに 行ってみたら？」と 言いました。そうたさんは 長ぐつを はいて、庭に 出てみました。\n\n水たまりには、空の 雲が うつって いました。そっと 足を 入れると、パシャンと 水しぶきが 上がり、まるで 花火の ように 見えました。\n\n「雨の日にも、こんな 楽しい ことが あったんだ」と、そうたさんは にっこりしました。"
      ,
      quiz: [
        { q: "そうたさんは、水たまりに 足を 入れたとき どう 感じましたか？",
          a: ["水しぶきが 花火の ように 見えて 楽しかった", "つめたくて いやだった", "びっくりして 泣いた", "何も 感じなかった"], c: 0,
          hint: "「まるで 花火の ように 見えました」の あとの 気持ちだよ。" }
      ]
    },
    {
      id: "book11",
      title: "図書館の ひみつ",
      icon: "📚",
      body: "本が 大すきな みおさんは、図書館で「夜になると 本が しゃべりだす」という うわさを 聞きました。\n\n本当かな、と 思った みおさんは、係（かかり）の 人に 聞いてみました。「本は しゃべらないけれど、本を 開くたびに、書いた 人の 気持ちが きみに 話しかけてくるんだよ」と 教えて くれました。\n\nみおさんは その日、いつもより ゆっくり 本を 読みました。すると、いつもより ずっと、お話の 中の 世界が はっきりと 見えた 気が しました。"
      ,
      quiz: [
        { q: "係の 人は「本が しゃべりだす」ことについて、どう 説明しましたか？",
          a: ["本を 開くと、書いた 人の 気持ちが 話しかけてくる", "本当に 声を 出して しゃべる", "夜だけ 動きだす", "そんな 話は うそだと 言った"], c: 0,
          hint: "係の 人の セリフを もう一度 読もう。" }
      ]
    },
    {
      id: "book12",
      title: "サッカーボールの ゆめ",
      icon: "⚽",
      body: "このサッカーボールは、いつも しゅうさんに けられて、ゴールに 向かって いくのが 大すきでした。\n\nある 試合で、しゅうさんは シュートを 外して しまい、チームは まけて しまいました。しゅうさんは、ボールを けとばしそうに なりましたが、ぐっと こらえて 「次は かならず 入れる」と 言いました。\n\nつぎの 週の 練習で、しゅうさんは 何度も 何度も シュートの れんしゅうを しました。ボールは「がんばる きみと、また ゴールを 目指せて うれしいな」と 思いました。"
      ,
      quiz: [
        { q: "シュートを 外した あと、しゅうさんは どう しましたか？",
          a: ["ボールを けとばさず、練習を がんばった", "サッカーを やめた", "ボールを かえた", "チームを かえた"], c: 0,
          hint: "「ぐっと こらえて」の あとの 行動を 見よう。" }
      ]
    },
    {
      id: "book13",
      title: "たからものの 貝（かい）がら",
      icon: "🐚",
      body: "なつみさんは、おばあちゃんの 家の 近くの 海岸で、ピンク色の 貝がらを 見つけました。\n\n「これ、あげる」と、いっしょに いた 小さな いとこに 見せると、いとこは 目を キラキラさせて「わたしも ほしい」と 言いました。\n\nなつみさんは 少し まよってから、その 貝がらを いとこに あげました。「また いっしょに さがしに 来ようね」と 言うと、いとこは うれしそうに 貝がらを ぎゅっと にぎりました。"
      ,
      quiz: [
        { q: "なつみさんは、見つけた 貝がらを 最後に どう しましたか？",
          a: ["いとこに あげた", "自分の 部屋に かざった", "海に かえした", "おばあちゃんに あげた"], c: 0,
          hint: "「少し まよってから」の あとを 読もう。" }
      ]
    },
    {
      id: "book14",
      title: "未来（みらい）から来た ねこ",
      icon: "🐱",
      body: "ある 朝、ゆうきさんの 部屋に、しゃべる ねこが 現れました。「わたしは 未来から来た ねこです。100年後の 世界を 見せてあげましょう」\n\nねこと いっしょに、ゆうきさんは 空をとぶ 車や、ロボットが 森を 育てる 未来の 町を 見ました。「べんりだけど、木や 花も たくさん あるんだね」と ゆうきさんは 気づきました。\n\nねこは「未来は、今 きみたちが どう 行動するかで きまるんだよ」と 言って、しずかに 消えて いきました。ゆうきさんは、庭の 花に、そっと 水を あげました。"
      ,
      quiz: [
        { q: "未来から来た ねこは、さいごに どんな メッセージを 伝えましたか？",
          a: ["未来は 今の 行動で きまる", "未来は もう 決まっている", "ロボットが すべてを 決める", "花や 木は いらなくなる"], c: 0,
          hint: "ねこの さいごの セリフに 注目しよう。" }
      ]
    },
    {
      id: "book15",
      title: "夏休みの ヘチマかんさつ",
      icon: "🥒",
      body: "夏休み、あおいさんは 家の ベランダで ヘチマを 育てていました。\n\n毎日 水を あげていると、黄色い かわいい 花が 咲き、大きな 実が なりました。\n\n夏休みが 終わるころ、ヘチマの実が 茶色く かわいて 軽くなりました。お母さんと いっしょに 実の 皮を むくと、中から ふわふわの たわしと、黒くて かたい 種（たね）が たくさん 出てきました。\n\n「種を 大切に とっておいて、来年の 春に また 植えようね」と あおいさんは にっこり 笑いました。"
      ,
      quiz: [
        { q: "ヘチマの実が 茶色く かわいたあと、皮を むくと 中から 何が 出てきましたか？",
          a: ["たわしと 黒い 種", "黄色い 花", "あかい 実", "金色の コイン"], c: 0,
          hint: "「中から ふわふわの…」の あとを 読みかえそう。" },
        { q: "あおいさんは、出てきた 黒い 種を どうすることに しましたか？",
          a: ["来年の 春に また 植える", "すてて しまう", "食べて しまう", "どこかへ なくしてしまう"], c: 0,
          hint: "「来年の 春に また…」の あとの セリフに ちゅうもく。" }
      ]
    }
  ];

  window.BOOK = { stories: STORIES };

  // ---- ② 日付ユーティリティ（既存コードの todayStr と 同じ書式に そろえる） ----
  function todayStr() {
    const sd = new Date(window.currentServerTime || Date.now());
    return `${sd.getFullYear()}-${sd.getMonth() + 1}-${sd.getDate()}`;
  }
  function dayIndexFromDateStr(str) {
    const parts = String(str).split("-").map(Number);
    const y = parts[0], m = parts[1], d = parts[2];
    if (!y || !m || !d) return 0;
    return Math.floor(new Date(y, m - 1, d).getTime() / 86400000);
  }
  function daysBetween(fromStr, toStr) {
    return dayIndexFromDateStr(toStr) - dayIndexFromDateStr(fromStr);
  }

  // ---- ③ 今日の おはなしを えらぶ（毎日じゅんばんに ローテーション） ----
  window.getTodaysStory = function () {
    const idx = ((dayIndexFromDateStr(todayStr()) % STORIES.length) + STORIES.length) % STORIES.length;
    return STORIES[idx];
  };

  // ---- ④ ホーム画面バナーの 表示更新 ----
  window.refreshBookBanner = function () {
    const banner = document.getElementById("book-banner");
    const subEl = document.getElementById("book-banner-sub");
    const streakEl = document.getElementById("book-banner-streak");
    if (!banner || !subEl || !streakEl || !window.saveData) return;
    const story = window.getTodaysStory();
    const done = window.saveData.bookLastReadDate === todayStr();
    banner.classList.toggle("read-done", done);
    subEl.textContent = done
      ? `${story.icon}「${story.title}」よみおわったよ！`
      : `${story.icon}「${story.title}」`;
    const streak = window.saveData.bookStreak || 0;
    if (done) { streakEl.textContent = `🔥${streak}日目 達成！`; }
    else if (streak > 0) { streakEl.textContent = `🔥${streak}日 つづいてる`; }
    else { streakEl.textContent = "はじめてみよう📖"; }
  };

  // ---- ⑤ モーダル：読む→クイズ→結果 の 3ステップ ----
  window.bookState = null;

  window.openBookModal = function () {
    if (!window.saveData) return;
    const story = window.getTodaysStory();
    const alreadyDone = window.saveData.bookLastReadDate === todayStr();
    window.bookState = { story: story, qIndex: 0, correctCount: 0, alreadyDone: alreadyDone };
    const modal = document.getElementById("book-modal");
    if (modal) modal.style.display = "flex";
    window.renderBookRead();
  };

  window.closeBookModal = function () {
    const modal = document.getElementById("book-modal");
    if (modal) modal.style.display = "none";
  };

  window.renderBookRead = function () {
    const st = window.bookState;
    const body = document.getElementById("book-modal-body");
    if (!st || !body) return;
    body.innerHTML =
      '<div class="book-story-title">' + st.story.icon + " " + st.story.title + "</div>" +
      '<div class="book-story-body">' + st.story.body + "</div>" +
      (st.alreadyDone
        ? '<div style="font-weight:900; color:#15803d; margin-bottom:6px;">✅ 今日はもう よみおわったよ！<br>また明日、あたらしい おはなしが とどくよ📮</div>'
        : '<button class="br-btn start" onclick="window.startBookQuiz()">よみおわった！もんだいに ちょうせん 📝</button>');
  };

  window.startBookQuiz = function () {
    if (!window.bookState) return;
    window.bookState.qIndex = 0;
    window.bookState.correctCount = 0;
    window.renderBookQuestion();
  };

  window.renderBookQuestion = function () {
    const st = window.bookState;
    const body = document.getElementById("book-modal-body");
    if (!st || !body) return;
    const q = st.story.quiz[st.qIndex];
    const btnsHtml = q.a.map(function (choice, i) {
      return '<button class="choice-btn" onclick="window.answerBookQuestion(' + i + ')">' + choice + "</button>";
    }).join("");
    body.innerHTML =
      '<div class="book-quiz-progress">📝 もんだい ' + (st.qIndex + 1) + " / " + st.story.quiz.length + "</div>" +
      '<div class="book-story-title" style="font-size:15px;">' + q.q + "</div>" +
      '<div id="book-quiz-choices">' + btnsHtml + "</div>" +
      '<div id="book-quiz-feedback" style="display:none; font-size:12px; font-weight:700; color:var(--text-soft); margin-top:8px;"></div>';
  };

  window.answerBookQuestion = function (choiceIdx) {
    const st = window.bookState;
    if (!st) return;
    const q = st.story.quiz[st.qIndex];
    const buttons = document.querySelectorAll("#book-quiz-choices .choice-btn");
    buttons.forEach(function (b, i) {
      b.onclick = null;
      if (i === q.c) b.classList.add("correct");
      else if (i === choiceIdx) b.classList.add("wrong");
    });
    const correct = (choiceIdx === q.c);
    if (correct) st.correctCount++;
    const fb = document.getElementById("book-quiz-feedback");
    if (fb) {
      fb.style.display = "block";
      fb.textContent = correct ? "🎉 せいかい！" : ("おしい！ヒント：" + (q.hint || ""));
    }
    setTimeout(function () {
      st.qIndex++;
      if (st.qIndex < st.story.quiz.length) { window.renderBookQuestion(); }
      else { window.finishBookToday(); }
    }, 1300);
  };

  window.finishBookToday = function () {
    const st = window.bookState;
    if (!st || !window.saveData) return;
    const today = todayStr();
    if (window.saveData.bookLastReadDate !== today) {
      const gap = window.saveData.bookLastReadDate ? daysBetween(window.saveData.bookLastReadDate, today) : null;
      window.saveData.bookStreak = (gap === 1) ? ((window.saveData.bookStreak || 0) + 1) : 1;
      window.saveData.bookLastReadDate = today;
      window.saveData.bookReadCount = (window.saveData.bookReadCount || 0) + 1;
    }
    const body = document.getElementById("book-modal-body");
    if (body) {
      body.innerHTML =
        '<div class="book-story-title">🎉 きょうの おはなし、よみおわり！</div>' +
        '<div style="font-size:13px; font-weight:700; margin-bottom:12px;">' + st.correctCount + " / " + st.story.quiz.length + ' もん せいかい！</div>' +
        '<div style="font-size:15px; font-weight:900; color:#c2410c; background:#fff7ed; border-radius:10px; padding:10px; margin-bottom:12px;">🔥 ' + window.saveData.bookStreak + '日 れんぞく よんでるよ！</div>' +
        '<button class="br-btn start" onclick="window.closeBookModal()">とじる</button>';
    }
    if (typeof window.saveGame === "function") window.saveGame();
    if (typeof window.speakText === "function") window.speakText("よくできました", "ja-JP");
  };

  // ---- ⑥ 読み込み時に バナーを 1回 描画（saveData が すでに あれば） ----
  if (window.saveData) { window.refreshBookBanner(); }

  console.log("[book.js] 読み込み完了：おはなし " + STORIES.length + " 話（" + STORIES.length + "日ぶん ローテーション）");
})();
