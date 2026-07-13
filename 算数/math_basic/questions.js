const loadedQuestions = [
{
id: "math_4st_001",
title: "【算数・わり算】ロバックス配布の均等わり！",
problem_statement: "ゲームマスターとして、320枚のコインを8人のチームメンバーに同じ数ずつ配りたい！天秤の左右どちらが正しい計算か仕分けよう！",
ui_mode: "SCALE",
scale_left_text: "320 ÷ 8 = 40枚ずつ",
scale_right_text: "320 ÷ 8 = 4枚ずつ",
moving_object: {
icon: "🪙",
name: "320枚のコイン"
},
correct_direction: "left",
useful_for: {
title: "リアル知識リンク：ゲームマスターのひみつ",
description: "大正解！32÷8=4をしてから、消していた0を1くっつけるのがコツ！現実のゲーム制作やイベント企画でも、アイテムをみんなに不満なくピッタリ分ける時にわり算は最強の武器になるぞ！"
},
drop_card: {
id: "card_math_001",
name: "わり算マスターの証",
rarity: "コモン",
icon: "➕",
color: "#94a3b8"
}
},
{
id: "math_4st_002",
title: "【算数・大きな数】限定アイテムのケタ数を見破れ！",
problem_statement: "ロブロックスの超限定ペットが『3億500万』ロバックスで取引されている！ひっかけ妖怪（ウソの数字）を見破り、正しい数字のカードを選べ！",
ui_mode: "GHOST_FIND",
choices: [
"350000000（これは3億5000万！）",
"305000000（これが3億500万だ！）",
"300050000（これは3億5万！）"
],
correct_index: 1,
useful_for: {
title: "リアル知識リンク：大きな数の読み方",
description: "ナイス見破り！4つのケタ（一、十、百、千）ごとに「万」「億」「兆」と名前が変わるルールさえ掴めば、億を超える超大金の取引データも一瞬で正確に読めるようになるんだ！"
},
drop_card: {
id: "card_math_002",
name: "億万長者の計算機",
rarity: "レア",
icon: "💎",
color: "#38bdf8"
}
},
{
id: "math_4st_003",
title: "【算数・図形】マイクラの建築！長方形のまわりの長さ",
problem_statement: "マインクラフトで、たて5マス、よこ9マスの長方形の拠点をフェンスで囲みたい。必要なフェンスの合計の長さ（マス）はどっち？天秤へ仕分けよう！",
ui_mode: "SCALE",
scale_left_text: "5 + 9 = 14マス分",
scale_right_text: "(5 + 9) × 2 = 28マス分",
moving_object: {
icon: "🪵",
name: "拠点用の木製フェンス"
},
correct_direction: "right",
useful_for: {
title: "リアル知識リンク：建築士のひみつ",
description: "完璧だ！長方形は『たて』と『よこ』が2本ずつあるから、両方を足してから2倍にする必要があるんだ。この考え方は、現実の部屋のデザインや、プログラミングでの画面レイアウト作成にそのまま役立つぞ！"
},
drop_card: {
id: "card_math_003",
name: "マクラ建築士の定規",
rarity: "コモン",
icon: "📐",
color: "#94a3b8"
}
},
{
id: "math_4st_004",
title: "【算数・がい数】だいたいの数で買い物シミュレーション",
problem_statement: "ゲームショップで198円の回復薬、305円のスピードブーツ、490円の盾を買いたい。だいたい1000円（上から1けたのがい数）で足りるか見破れ！",
ui_mode: "GHOST_FIND",
choices: [
"200+300+500で約1000円だから足りる！",
"100+300+400で約800円だから余裕で足りる！",
"絶対に足りないから買い物をあきらめるべきだ！"
],
correct_index: 0,
useful_for: {
title: "リアル知識リンク：買い物がい算術",
description: "お見事！四捨五入して「上から1けた」の分かりやすい数字に直して足すのが『がい算』。レジに行く前に「だいたい足りるかな？」と一瞬で判断できる、現実の買い物でも超使える神スキルだ！"
},
drop_card: {
id: "card_math_004",
name: "そろばん妖怪の目",
rarity: "レア",
icon: "👀",
color: "#38bdf8"
}
},
{
id: "math_4st_005",
title: "【算数・わり算】あまりのあるわり算とサーバー制限",
problem_statement: "1つのゲームサーバーに最大6人まで入れるよ。クラスの友達26人で全員が同時に遊ぶには、サーバーは最低いくつ必要かな？",
ui_mode: "SCALE",
scale_left_text: "26÷6＝4あまり2 で 4つ",
scale_right_text: "あまりの2人も入れるから 5つ",
moving_object: {
icon: "🖥️",
name: "ゲームサーバー機"
},
correct_direction: "right",
useful_for: {
title: "リアル知識リンク：サーバーエンジニアの知恵",
description: "その通り！計算結果は『4あまり2』だけど、あまった2人も遊ぶためには、もう1つサーバーを用意して『5つ』にする必要がある。現実のバスの台数やホテルの部屋数計算でもこの『＋1』のルールが超重要なんだ！"
},
drop_card: {
id: "card_math_005",
name: "インフラ王の鍵",
rarity: "神 (ゴッド)",
icon: "🔑",
color: "#f59e0b"
}
},
{
id: "math_4st_006",
title: "【算数・小数】チャージ速度のバフ計算！",
problem_statement: "通常1秒かかるスキルチャージ時間が、レア装備で『0.3秒』短くなった！今のチャージ時間は何秒になったか、正しい説明カードを見破れ！",
ui_mode: "GHOST_FIND",
choices: [
"1 - 0.3 = 0.7秒になった！",
"1 - 0.3 = 1.3秒になった！（増えてるぞ！？）",
"1は整数だから小数は引けない！"
],
correct_index: 0,
useful_for: {
title: "リアル知識リンク：フレームレートと小数の世界",
description: "大正解！1を『1.0』と考えて、1.0 - 0.3 = 0.7 を計算するのがコツ。ゲームプログラミングの世界では、0.01秒単位の小数の引き算で行き来するキャラのスピードや攻撃速度を調整しているんだ！"
},
drop_card: {
id: "card_math_006",
name: "神速のクロノメーター",
rarity: "レア",
icon: "⏱️",
color: "#38bdf8"
}
},
{
id: "math_4st_007",
title: "【算数・角度】アスレチック（Obby）の傾きトラップ",
problem_statement: "ロブロックスのアスレステージを制作中！ジャンプで乗れるギリギリの傾きは『直角（90度）の半分』。この傾きの角度を天秤で正しく仕分けよう！",
ui_mode: "SCALE",
scale_left_text: "傾き 45度",
scale_right_text: "傾き 30度",
moving_object: {
icon: "📐",
name: "傾いたジャンプ床"
},
correct_direction: "left",
useful_for: {
title: "リアル知識リンク：3Dゲームクリエイターの視点",
description: "ナイスチョイス！90÷2=45度だね。ゲーム開発（Roblox Studioなど）では、床や坂道の傾きを『度（ステー）』という角度のデータを使ってミリ単位で調整して、面白いステージを作っているんだ！"
},
drop_card: {
id: "card_math_007",
name: "角度の支配者",
rarity: "コモン",
icon: "🧭",
color: "#94a3b8"
}
},
{
id: "math_4st_008",
title: "【算数・折れ線グラフ】視聴者数の変化を読み解け！",
problem_statement: "配信動画の同時視聴者数が『折れ線グラフ』で表されている。一番激しく視聴者が『増えた』時間を正しく説明しているカードはどれ？",
ui_mode: "GHOST_FIND",
choices: [
"グラフの線が横にまっすぐ伸びている時間帯",
"グラフの線が右上がりに一番急ピッチで傾いている時間帯",
"グラフの線が一番高いところにある時間帯"
],
correct_index: 1,
useful_for: {
title: "リアル知識リンク：データアナリストのひみつ",
description: "大正解！折れ線グラフは「線の傾き」を見ることで、データの変化のすごさが一瞬でわかる。これを見抜けると、YouTubeのどんな企画が人気だったか、現実の会社の売上がどう変わったかを分析する武器になるぞ！"
},
drop_card: {
id: "card_math_008",
name: "未来予測のグラフ",
rarity: "レア",
icon: "📈",
color: "#38bdf8"
}
},
{
id: "math_4st_009",
title: "【算数・面積】マイクラの巨大畑の広さ！",
problem_statement: "マイクラでたて20マス、よこ30マスの巨大な小麦畑を作った。この畑の面積（平方マス）はいくつになる？天秤へ仕分けよう！",
ui_mode: "SCALE",
scale_left_text: "20 × 30 = 600平方マス",
scale_right_text: "20 ＋ 30 = 50マス",
moving_object: {
icon: "🌾",
name: "広大な小麦畑の土地"
},
correct_direction: "left",
useful_for: {
title: "リアル知識リンク：領土開拓と面積のルール",
description: "その通り！面積は『たて×よこ』の掛け算で計算する。2×3=6をしてから0を2つくっつけるのが早ワザだ。現実の土地の広さ（平方メートル）を計算して家を建てる時にも、この数式がベースになるんだ！"
},
drop_card: {
id: "card_math_009",
name: "領土開拓のクワ",
rarity: "コモン",
icon: "🚜",
color: "#94a3b8"
}
},
{
id: "math_4st_010",
title: "【算数・計算のきまり】アイテムまとめ買いの合計金額",
problem_statement: "1個80円の回復薬と、1個120円の毒消しを『セット』にして、5人のパーティ全員にまとめ買いしたい。一番スマートな式はどれか見破れ！",
ui_mode: "GHOST_FIND",
choices: [
"80 × 5 + 120 × 5 ＝ 1000円 （これでもいいけど計算が長い！）",
"(80 + 120) × 5 ＝ 1000円 （1セット200円にするのが一番スマート！）",
"80 + 120 × 5 ＝ 680円 （これだと回復薬が1個しか買えてない！）"
],
correct_index: 1,
useful_for: {
title: "リアル知識リンク：プログラマーの最適化コード",
description: "パーフェクト！カッコ()を使って1セットの値段（200円）を先に出せば、200×5＝1000と暗算で一瞬で計算できる！無駄な計算を減らす工夫は、プログラミングの処理を高速にする時にも絶対必要な考え方なんだ！"
},
drop_card: {
id: "card_math_010",
name: "賢者の数式オーブ",
rarity: "神 (ゴッド)",
icon: "🔮",
color: "#f59e0b"
}
}
];