/* =====================================================================
   js/stages.js  ---  content.js分割：ステージ一覧（定義・メタデータのみ）
   ---------------------------------------------------------------------
   読み込み順番： index.html で js/quizzes.js ・ js/patch.js より先に読み込むこと。
   ロジック（自動パッチ等）は js/patch.js にあります。
   ===================================================================== */
(function () {

  const STAGES = [
    {
      subject: "算数",                      // ★あなたのスプレッドシートと同じ日本語にすると同じタブに合流します
      category: "わり算（4年）",             // 算数タブの中の見出し（グループ）
      grade: "4年生",                       // ★学年タブ切り替え用
      id: "算数/わり算/hissan_amari01",       // ステージID（あなたの命名ルールに合わせた形）
      name: "わり算の筆算（あまり）",
      reward: 10,
      showCount: 8,                        // 1回に出す問題数（全10問中10問。5にすれば毎回ちがう5問）
      video_url: "",
      lab_url: "",
      created: "2026-07-17"                 // ★いつ追加したか（"🆕NEW"バッジの判定に使う）
    },
    {
      subject: "算数",
      category: "わり算（4年）",
      grade: "4年生",
      id: "算数/わり算/hissan_amari02",
      name: "わり算の筆算（2けたで わる）",
      reward: 10,
      showCount: 8,
      video_url: "",
      lab_url: "",
      created: "2026-07-19"
    },
    {
      subject: "算数",
      category: "角度（4年）",
      grade: "4年生",
      id: "算数/角度/kakudo01",
      name: "角の大きさ（角度のきほん）",
      reward: 10,
      showCount: 8,
      video_url: "",
      // ★AR角度レーダー（別タブで全画面・カメラ＆向きセンサー使用）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_ar_kakudo.html",
      created: "2026-07-18"
    },
    {
      subject: "国語",
      category: "読解（4年）",
      grade: "4年生",
      id: "国語/読解/kosoado01",
      name: "こそあど言葉（指示語）",
      reward: 10, showCount: 8, video_url: "",
      // ★3Dたんけんラボ（別タブ・ドラッグで見まわし／台座を選んでたからさがし）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/国語/lab_kosoado.html",
      created: "2026-07-18"
    },
    {
      subject: "理科",
      category: "電気のはたらき（4年）",
      grade: "4年生",
      id: "理科/電気/denki01",
      name: "電気のはたらき（かん電池と回路）",
      reward: 10, showCount: 8, video_url: "",
      // ★電気回路 じっけんラボ（回路切替、明るさ、電流方向、モーター逆回転）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/理科/lab_denki_circuit.html",
      created: "2026-07-18"
    },
    {
      subject: "社会",
      category: "地図（4年）",
      grade: "4年生",
      id: "社会/地図/nairiku01",
      name: "海に面していない県（内陸県）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "大きな数（4年）",
      grade: "4年生",
      id: "算数/大きな数/ookazu01",
      name: "大きな数（万・億）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "国語",
      category: "漢字（4年）",
      id: "国語/漢字/kanji01",
      name: "漢字と部首",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "国語",
      category: "漢字（4年）",
      id: "国語/漢字/jukugo01",
      name: "漢字の組み立て（熟語）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-19"
    },
    {
      subject: "国語",
      category: "言葉の表現（4年）",
      id: "国語/慣用句/kanyoku01",
      name: "慣用句・ことわざ（言葉の味わい）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      subject: "国語",
      category: "文のしくみ（4年）",
      id: "国語/修飾語/shushoku01",
      name: "主語・述語・修飾語（文の組み立て）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_1",
      name: "面積の変身 ① 初級",
      reward: 10, showCount: 8, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=1",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_2",
      name: "面積の変身 ② 中級",
      reward: 10, showCount: 8, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=2",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "面積の変身ラボ（4年）",
      id: "算数/面積/menseki_3",
      name: "面積の変身 ③ 上級",
      reward: 10, showCount: 8, video_url: "",
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_menseki.html?level=3",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（垂直・平行と四角形）4年",
      id: "算数/図形/suichoku_heikou01",
      name: "垂直と平行（すいちょくとへいこう）",
      reward: 10, showCount: 5, video_url: "",
      // ★すいちょく・へいこう はっけんラボ（線をかたむけて発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_shikakukei.html?level=1",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（垂直・平行と四角形）4年",
      id: "算数/図形/shikakukei_bunrui01",
      name: "四角形の仲間分け（台形・平行四辺形・ひし形）",
      reward: 10, showCount: 5, video_url: "",
      // ★四角形へんしんラボ（頂点をうごかして仲間分けを発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_shikakukei.html?level=2",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（垂直・平行と四角形）4年",
      id: "算数/図形/taikakusen01",
      name: "四角形の対角線（長さ・二等分・垂直）",
      reward: 10, showCount: 5, video_url: "",
      // ★対角線はっけんラボ（頂点をうごかして対角線の性質を発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_shikakukei.html?level=3",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（三角形の仲間分け）4年",
      id: "算数/図形/sankaku_bunrui01",
      name: "三角形の仲間分け（正三角形・二等辺三角形・直角三角形）",
      reward: 10, showCount: 5, video_url: "",
      // ★三角形の仲間分けラボ（頂点をうごかして仲間分けを発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_sankaku.html?level=1",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（三角形の仲間分け）4年",
      id: "算数/図形/naikaku_wa01",
      name: "三角形の内角の和",
      reward: 10, showCount: 5, video_url: "",
      // ★内角の和はっけんラボ（形をかえても180度のまま）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_maker_sankaku.html?level=2",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "図形（三角形の仲間分け）4年",
      id: "算数/図形/nakama_sagashi01",
      name: "三角形と四角形の仲間さがし（まとめ）",
      reward: 15, showCount: 4, video_url: "",
      // ★仲間さがしミニゲーム（ドラッグでグループ分け＋ニコと会話）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/算数/lab_nakama_sagashi.html",
      created: "2026-07-18"
    },
    {
      subject: "算数",
      category: "小数（4年）",
      id: "算数/小数/shosu01",
      name: "小数のしくみと計算",
      reward: 10, showCount: 5, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "理科",
      category: "星と月（4年）",
      id: "理科/星/hoshi01",
      name: "夏の星空と月の動き",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "理科",
      category: "季節と生き物（4年）",
      id: "理科/季節と生き物/kisetsu01",
      name: "季節と生き物のようす",
      reward: 10, showCount: 11, video_url: "", lab_url: "",
      created: "2026-07-20"
    },
    {
      subject: "理科",
      category: "空気と水の性質（4年）",
      id: "理科/空気と水/kuki_mizu01",
      name: "空気と水の力（とじこめた空気と水）",
      reward: 10, showCount: 8, video_url: "",
      // ★空気でっぽう じっけんラボ（注射器のピストンをおして空気/水のちがいを発見）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/理科/lab_kuki_teppou.html",
      created: "2026-07-25"
    },
    {
      subject: "理科",
      category: "もののあたたまり方（4年）",
      id: "理科/あたたまり方/atatamari01",
      name: "もののあたたまり方（金属・水・空気）",
      reward: 10, showCount: 8, video_url: "",
      // ★もののあたたまり方 じっけんラボ（熱伝導・対流サーモグラフィー）
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/理科/lab_atatamari.html",
      created: "2026-07-25"
    },
    {
      subject: "社会",
      category: "ごみとくらし（4年）",
      id: "社会/ごみ/gomi01",
      name: "ごみのゆくえ（分別とリサイクル）",
      reward: 10, showCount: 5, video_url: "", lab_url: "",
      created: "2026-07-18"
    },
    {
      subject: "社会",
      category: "都道府県（4年）",
      id: "社会/都道府県/todofuken01",
      name: "都道府県と地方区分",
      reward: 10, showCount: 11, video_url: "", lab_url: "",
      created: "2026-07-20"
    },
    {
      subject: "社会",
      category: "都道府県（4年）",
      id: "社会/都道府県/todofuken02",
      name: "都道府県の位置・地形・産業の特色",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-25"
    },
    {
      // ★漢字検定10級 対策（8/20の試験にむけて）。80字を8回に分けて出題。読み・書取・画数の3本立て。
      // ★2026-08-08：ユーザー要望で「漢検」タブから「国語」単元へ移動（category名も「書く」練習と
      //   わかるように変更。既存の国語/漢字/*は音訓・熟語構造の「概念理解」系で、こちらは実際に
      //   読み・書きを産出する練習という住み分け）。
      subject: "国語",
      category: "漢字を書く（1年・10級だい1回）",
      id: "漢検/10級/dai1kai",
      name: "10級 だい1回：一・右・雨・円・王・音・下・火・花・貝",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-19"
    },
    {
      // ★漢字検定10級 対策 だい2回。書き順の「てん・線はさいごに書く」系のひっかけを重点的に扱う
      // （九＝1画目と2画目の順、玉・犬＝てんは最後、金＝たて線の位置。いずれも複数サイトで確認ずみ）。
      subject: "国語",
      category: "漢字を書く（1年・10級だい2回）",
      id: "漢検/10級/dai2kai",
      name: "10級 だい2回：学・気・九・休・玉・金・空・月・犬・見",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-24"
    },
    {
      // ★分岐図解トレーニング（考えを図にする汎用ツール）。もし〜なら図（if_then）とマインドマップの2テンプレート。
      subject: "探究",
      category: "図解トレーニング",
      id: "探究/分岐図解/bunki01",
      name: "分岐図解トレーニング①（もしなら図・マインドマップ）",
      reward: 10, showCount: 4, video_url: "", lab_url: "",
      created: "2026-07-19"
    },
    {
      subject: "算数",
      category: "折れ線グラフ（4年）",
      id: "算数/グラフ/oresen01",
      name: "折れ線グラフと変化（変わり方）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "漢字の特長（4年）",
      id: "国語/漢字/onyomi_kunyomi01",
      name: "漢字の音と訓（音読み・訓読み）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "理科",
      category: "水のゆくえ（4年）",
      id: "理科/雨水/amamizu01",
      name: "雨水のゆくえと地面（水たまりと土の粒）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "社会",
      category: "くらしと水（4年）",
      id: "社会/水道/josuijo01",
      name: "水はどこから（浄水場と安全な水）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "算数",
      category: "わり算のきほん（3年）",
      grade: "3年生",
      id: "算数/わり算/warizan301",
      name: "あまりのあるわり算（3年のきほん）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "言葉のきまり（3年）",
      grade: "3年生",
      id: "国語/ローマ字/romaji301",
      name: "ローマ字とキーボード（3年の言葉）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "理科",
      category: "磁石の性質（3年）",
      grade: "3年生",
      id: "理科/磁石/jishaku301",
      name: "じしゃくのふしぎ（N極・S極とひきつけるもの）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "社会",
      category: "地域のようす（3年）",
      grade: "3年生",
      id: "社会/まち探検/machi301",
      name: "わたしたちのまちと記号（地図記号と方角）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "文のしくみ（4年）",
      grade: "4年生",
      id: "国語/言葉/setsuzoku01",
      name: "接続する言葉（だから・しかし・なぜなら）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "英語",
      category: "日常会話（4年）",
      grade: "4年生",
      id: "英語/あいさつ/english401",
      name: "すきなものとあいさつ（How are you? / I like...）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "英語",
      category: "かずとアルファベット（3年）",
      grade: "3年生",
      id: "英語/数字とアルファベット/english301",
      name: "かずとアルファベット（1〜10とABCD）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "英語",
      category: "メニューと注文（4年）",
      grade: "4年生",
      id: "英語/メニュー/english402",
      name: "レストランと注文の英語（hamburger, pizza, water, I'd like...）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-29"
    },
    {
      subject: "国語",
      category: "漢字を書く（1年・10級だい3回）",
      id: "漢検/10級/dai3kai",
      name: "10級 だい3回：口・校・左・三・山・子・四・糸・字・耳",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    {
      subject: "国語",
      category: "漢字を書く（1年・10級だい4回）",
      id: "漢検/10級/dai4kai",
      name: "10級 だい4回：七・車・手・十・出・女・小・上・森・人",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-12"
    },
    {
      // ★2026-08-12追加：三つの論理フレームワーク（福嶋式「国語力」に基づく）。
      // A. 因果関係（なぜ？→だから）を集中トレーニング。論理の破たん検出問題も含む。
      subject: "国語",
      category: "三つの論理（4年）",
      grade: "4年生",
      id: "国語/論理/inga01",
      name: "因果関係トレーニング（なぜ？→だから）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-12"
    },
    {
      // ★2026-08-12追加：三つの論理 B. イコールの関係（つまり・たとえば・比喩）。
      // 抽象⇔具体の行き来、慣用表現の理解を鍛える。
      subject: "国語",
      category: "三つの論理（4年）",
      grade: "4年生",
      id: "国語/論理/equal01",
      name: "イコールの関係トレーニング（つまり・たとえば）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-12"
    },
    {
      // ★2026-08-12追加：三つの論理 C. 対立関係（しかし・一方で・反対意見）。
      // 対比的な視点を持つ力、反論想定力を鍛える。
      subject: "国語",
      category: "三つの論理（4年）",
      grade: "4年生",
      id: "国語/論理/tairitsu01",
      name: "対立関係トレーニング（しかし・一方で）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-12"
    },
    {
      // ★2026-08-08追加：小学3年生配当漢字（漢検8級相当）。訓読み書き（type:text_input）と
      // 熟語書き（type:kanji_build を2文字の熟語組み立てに流用）を中心に構成。
      // 訓読み・熟語ともに複数辞書で確認ずみ（AGENTS.md 3.5適用）。
      subject: "国語",
      category: "漢字を書く（3年）",
      id: "漢検/8級/dai1kai",
      name: "8級 だい1回：動・進・集・岸・波",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-08"
    },
    {
      // ★2026-08-08追加：小学4年生配当漢字（漢検7級相当）。3年生ぶんと同じく訓読み書き＋熟語書き構成。
      // 訓読み・熟語ともに複数辞書で確認ずみ（AGENTS.md 3.5適用）。
      subject: "国語",
      category: "漢字を書く（4年）",
      id: "漢検/7級/dai1kai",
      name: "7級 だい1回：争・覚・続・果・飛",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-08"
    },
    {
      subject: "理科",
      category: "体のつくり（4年）",
      grade: "4年生",
      id: "理科/体/karada01",
      name: "人の体のつくりと運動（骨と筋肉）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-07-28"
    },
    // ★STEAM補強：T (Technology) 領域
    {
      subject: "探究",
      category: "プログラミング（4年）",
      grade: "4年生",
      id: "探究/プログラミング/prog01",
      name: "プログラミングの思考（順次・条件・繰り返し）",
      reward: 10, showCount: 8, video_url: "",
      // ★ビジュアルプログラミングブロック じっけんラボ
      lab_url: "https://nekobb619-jpg.github.io/yumekawa/lab/探究/lab_programming_block.html",
      created: "2026-08-11"
    },
    {
      subject: "探究",
      category: "情報モラル（4年）",
      grade: "4年生",
      id: "探究/情報/net_ethics01",
      name: "ネットと情報モラル（パスワードとマナー）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-11"
    },
    // ★STEAM補強：E (Engineering) 領域
    {
      subject: "探究",
      category: "ものづくり設計（4年）",
      grade: "4年生",
      id: "探究/設計/engineering01",
      name: "ものづくりと設計思考（かんがえて作ろう）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-11"
    },
    {
      subject: "理科",
      category: "実験の設計（4年）",
      grade: "4年生",
      id: "理科/実験計画/exp_design01",
      name: "実験の計画と条件そろえ（理科の探究）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-11"
    },
    // ★算数発展：今後拡大する主要3単元（2桁わり算筆算・がい数・分数）
    {
      subject: "算数",
      category: "わり算の発展（4年）",
      grade: "4年生",
      id: "算数/わり算/hissan_2digit01",
      name: "２けたでわるわり算の筆算（見当の商と修正）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-11"
    },
    {
      subject: "算数",
      category: "がい数（4年）",
      grade: "4年生",
      id: "算数/がい数/gaisu01",
      name: "がい数と四捨五入（およそ数と概算）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-11"
    },
    {
      subject: "算数",
      category: "分数（4年）",
      grade: "4年生",
      id: "算数/分数/bunsu01",
      name: "分数のしくみと計算（真・仮・帯分数と同分母の計算）",
      reward: 10, showCount: 8, video_url: "", lab_url: "",
      created: "2026-08-11"
    }
  ];

  window.CONTENT_STAGES = STAGES;
})();
