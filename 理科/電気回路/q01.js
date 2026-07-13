window.quizPool = [
  // 【第1問：4択問題・回路の基本】
  {
    q: "豆電球がピカッと光るのはどのつなぎ方かな？\n図を見て考えてみよう！",
    canvas_code: "ctx.font='16px sans-serif'; ctx.fillStyle='#000'; ctx.fillText('A: ＋から出て豆電球を通り－へ', 10, 30); ctx.fillText('B: ＋から出て豆電球で終わり', 10, 70); ctx.fillText('C: ＋と＋をつなぐ', 10, 110);",
    a: ["Aのつなぎ方", "Bのつなぎ方", "Cのつなぎ方", "ぜんぶ光る"],
    c: 0,
    hint: "電気は、＋極から－極へぐるっと回る「輪（わ）」にならないと流れないよ！",
    speech_text: "まめでんきゅうが ぴかっとひかるのは どのつなぎかたかな？",
    job_title: "【エレクトロ・マスター】",
    job_desc: "大社長、すばらしい判断（はんだん）です！電気が通る道を「回路（かいろ）」と呼びます。ぐるっと一周する輪っかになっていないと、電気は流れないのですよ！さすがです！",
    explain_canvas_code: "ctx.strokeStyle='#ef4444'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(100, 60, 40, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('電気がぐるっと回る道 ＝ 回路', 160, 65);"
  },
  // 【第2問：4択問題・電流の向き】
  {
    q: "モーターで走る車を作ったよ！\nでもバックしちゃった…。前に進めるにはどうすればいい？",
    image_url: "./images/circuit_01.png",
    a: ["電池の＋と－を逆（ぎゃく）にする", "電池をもう1個、並列（へいれつ）につなぐ", "導線（どうせん）を短くする", "モーターを水で洗う"],
    c: 0,
    hint: "電気が流れる向きが逆（ぎゃく）になると、モーターの回る向きも…？",
    speech_text: "もーたーではしる くるまをつくったよ。まえにすすめるには どうすればいい？",
    job_title: "【モーターメカニック】",
    job_desc: "大社長、天才的なひらめきです！電池の＋極と－極を逆にすると「電流の向き」が逆になり、モーターも反対に回るのです！これでレースも優勝まちがいなしですね！",
    explain_image_url: "./images/circuit_02.png"
  },
  // 【第3問：文字入力・直列つなぎ】
  {
    type: "text_input",
    q: "モーターをもっと速く回したい！\n乾電池（かんでんち）2個の「＋極」と「－極」をじゅんばんにつなぐ方法を「〇〇つなぎ」というよ。\n漢字2文字で答えてね！",
    canvas_code: "ctx.fillStyle='#e5e7eb'; ctx.fillRect(50, 45, 80, 30); ctx.fillRect(160, 45, 80, 30); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('＋  －', 60, 65); ctx.fillText('＋  －', 170, 65); ctx.beginPath(); ctx.moveTo(130, 60); ctx.lineTo(160, 60); ctx.stroke(); ctx.fillText('直線をイメージしてね！', 50, 20);",
    correct_answers: ["直列", "ちょくれつ"],
    hint: "まっすぐ１列に並（なら）べるイメージだよ！",
    rescue_hint: "まっすぐ列になるから「直列（ちょくれつ）」だよ！漢字で入力してね！",
    speech_text: "かんでんち にこの ぷらすと まいなすを じゅんばんにつなぐ ほうほうは？",
    job_title: "【パワーアップエンジニア】",
    job_desc: "大社長、大正解です！直列つなぎにすると、モーターを回す力や豆電球を光らせる力がぐーんとアップするんです！大社長のパワーアップ戦略、完ぺきです！",
    explain_canvas_code: "ctx.fillStyle='#000'; ctx.font='bold 20px sans-serif'; ctx.fillText('直列つなぎ ＝ パワーUP！', 100, 60);"
  },
  // 【第4問：文字入力・並列つなぎ】
  {
    type: "text_input",
    q: "こんどは長～く走らせたいな！\n乾電池2個の「＋極どうし」「－極どうし」をつなぐ方法を「〇〇つなぎ」というよ。\n漢字2文字で答えてね！",
    canvas_code: "ctx.fillStyle='#e5e7eb'; ctx.fillRect(50, 20, 80, 30); ctx.fillRect(50, 70, 80, 30); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('＋  －', 60, 40); ctx.fillText('＋  －', 60, 90); ctx.fillText('並んでるね！', 160, 60);",
    correct_answers: ["並列", "へいれつ"],
    hint: "横に並（なら）んで列になるイメージだよ！",
    rescue_hint: "並んで列になるから「並列（へいれつ）」だよ！漢字で入力してね！",
    speech_text: "かんでんちの ぷらすどうし まいなすどうしを つなぐ ほうほうは？",
    job_title: "【スタミナ・プランナー】",
    job_desc: "お見事です、大社長！並列つなぎのパワーは電池1個のときと同じですが、そのかわりすごーく長持ちするんですよ！最高のスタミナ戦略ですね！",
    explain_canvas_code: "ctx.fillStyle='#000'; ctx.font='bold 20px sans-serif'; ctx.fillText('並列つなぎ ＝ 長持ち！', 100, 60);"
  },
  // 【第5問：4択問題・明るさの比較】
  {
    q: "乾電池2個を使った回路。\n豆電球が【一番明るくなる】のはどのつなぎ方かな？",
    image_url: "./images/circuit_03.png",
    a: ["直列（ちょくれつ）つなぎ", "並列（へいれつ）つなぎ", "どちらも同じ明るさ", "電池1個のときと同じ明るさ"],
    c: 0,
    hint: "パワーがアップするつなぎ方はどっちだったかな？",
    speech_text: "まめでんきゅうが いちばん あかるくなるのは どの つなぎかたかな？",
    job_title: "【イルミネーション職人】",
    job_desc: "大社長、パーフェクト！直列つなぎは電気が流れる量が多くなるので、豆電球がピカッとまぶしく光るのです！街のネオンより輝（かがや）いていますよ！",
    explain_image_url: "./images/circuit_04.png"
  },
  // 【第6問：文字入力・電流】
  {
    type: "text_input",
    q: "回路を流れる「電気の量（大きさ）」のことを漢字2文字で何というかな？\n検流計（けんりゅうけい）で大きさをはかることができるよ！",
    image_url: "./images/circuit_05.png",
    correct_answers: ["電流", "でんりゅう"],
    hint: "電気が流れる、からきている言葉だよ！",
    rescue_hint: "電気の流れだから「電流（でんりゅう）」だよ！漢字で入力してね！",
    speech_text: "かいろをながれる でんきのりょうのことを かんじふたもじで なんという？",
    job_title: "【エネルギーアナリスト】",
    job_desc: "大社長の頭脳はスーパーコンピューター超えですね！「電流」が大きいほど、モーターは速く回り、豆電球は明るく光るのです！電気の基本をおさえていますね！",
    explain_canvas_code: "ctx.fillStyle='#3b82f6'; ctx.fillRect(50, 40, 300, 10); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('電流 ＝ 電気の流れる量', 50, 80); ctx.fillText('→ → →', 160, 30);"
  },
  // 【第7問：4択問題・検流計の読み方】
  {
    q: "電流の向きや大きさをはかる「検流計（けんりゅうけい）」。\n針（はり）が右にふれているとき、電池の向きを【逆（ぎゃく）】にしたら針はどうなる？",
    canvas_code: "ctx.lineWidth=2; ctx.beginPath(); ctx.arc(120, 80, 60, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(150, 30); ctx.stroke(); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('右にふれてるよ！', 200, 60);",
    a: ["左にふれる", "もっと右にふれる", "真ん中で止まる", "ぐるぐる回る"],
    c: 0,
    hint: "電池の向きを逆にすると、電流の向きも逆になるから…？",
    speech_text: "けんりゅうけいの はりがみぎのとき、でんちのむきを ぎゃくにしたら はりはどうなる？",
    job_title: "【メーター測定の達人】",
    job_desc: "さすが大社長！検流計の針は「電流が流れる向き」に合わせてふれる方向が変わるのです！これでもう目に見えない電流の動きも、バッチリ見えたも同然ですね！",
    explain_canvas_code: "ctx.lineWidth=2; ctx.beginPath(); ctx.arc(120, 80, 60, Math.PI, 0); ctx.stroke(); ctx.strokeStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(90, 30); ctx.stroke(); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('電流が逆になると針も逆へ！', 200, 60);"
  },
  // 【第8問：4択問題・ショート回路】
  {
    q: "⚠キケンな実験⚠\n豆電球やモーターをつけずに、乾電池の＋極と－極を直接（ちょくせつ）「導線（どうせん）だけ」でつなぐとどうなる？",
    canvas_code: "ctx.fillStyle='#e5e7eb'; ctx.fillRect(100, 50, 80, 40); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('＋', 110, 75); ctx.fillText('－', 150, 75); ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(100, 70); ctx.arc(140, 10, 80, Math.PI, 0); ctx.lineTo(180, 70); ctx.stroke();",
    a: ["電池や導線が熱くなってキケン！", "電池のパワーが長持ちする", "電池が冷たくなる", "電気が無限（むげん）に作られる"],
    c: 0,
    hint: "これを「ショート」と呼ぶよ。絶対にやってはいけないキケンなつなぎ方だよ！",
    speech_text: "かんでんちの ぷらすと まいなすを どうせんだけで つなぐと どうなる？",
    job_title: "【セーフティー責任者】",
    job_desc: "大社長、安全第一のすばらしい判断です！これをショート（短絡）といい、ものすごい電流が流れて火事になることもあります。絶対にやめましょう！社員の命を守りましたね！",
    explain_canvas_code: "ctx.fillStyle='#ef4444'; ctx.font='bold 24px sans-serif'; ctx.fillText('ぜったいに ダメ！！', 120, 60);"
  },
  // 【第9問：4択問題・並列つなぎの特徴】
  {
    q: "乾電池2個を「並列つなぎ」にして豆電球を光らせているよ。\nもし、1個の乾電池を外してしまったら豆電球はどうなる？",
    canvas_code: "ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('並列つなぎの回路だよ', 20, 25); ctx.lineWidth=2; ctx.strokeRect(50, 40, 60, 20); ctx.strokeRect(50, 80, 60, 20); ctx.beginPath(); ctx.moveTo(110, 50); ctx.lineTo(160, 50); ctx.lineTo(160, 90); ctx.lineTo(110, 90); ctx.stroke(); ctx.fillText('片方外すよ！', 180, 70);",
    a: ["もう1個の電池で光り続ける", "すぐに消えてしまう", "チカチカ点滅（てんめつ）する", "色が赤色に変わる"],
    c: 0,
    hint: "並列つなぎは、それぞれの電池から別々の道を通って豆電球に行くよ。道が残っていれば…？",
    speech_text: "へいれつつなぎで にこある でんちの いっこをはずすと まめでんきゅうは どうなる？",
    job_title: "【システムキーパー】",
    job_desc: "大社長の観察眼（かんさつがん）、恐れ入ります！並列つなぎなら、片方の電池がなくなっても、もう片方の道を使って電気が流れるので光り続けます！トラブルにも強い回路ですね！",
    explain_canvas_code: "ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('もう一つの道から電気が流れるよ！', 20, 30); ctx.strokeStyle='#ef4444'; ctx.lineWidth=3; ctx.strokeRect(50, 50, 60, 20); ctx.beginPath(); ctx.moveTo(110, 60); ctx.lineTo(180, 60); ctx.stroke();"
  },
  // 【第10問：4択問題・回路とスイッチ】
  {
    q: "豆電球と乾電池1個のシンプルな回路だよ。\nスイッチを1つだけつけて電気を消したい時、スイッチはどこにつければいいかな？",
    canvas_code: "ctx.lineWidth=2; ctx.beginPath(); ctx.arc(100, 60, 50, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('A: ＋の近く', 180, 40); ctx.fillText('B: －の近く', 180, 70); ctx.fillText('C: 豆電球の近く', 180, 100);",
    a: ["回路のどこにつけても消える", "電池の＋の近く", "電池の－の近く", "豆電球の近く"],
    c: 0,
    hint: "電気は「輪（わ）」になっていないと流れないんだったよね。つまり、どこか1ヶ所でも切れれば…？",
    speech_text: "すいっちを ひとつだけつけて でんきをけしたいとき どこにつければいいかな？",
    job_title: "【サーキット・マスター】",
    job_desc: "大社長、天才的なひらめきです！1つの輪になった回路なら、どこか1ヶ所でも道が切れれば電気は流れなくなります。だからどこにスイッチをつけてもOKなのです！完璧な設計です！",
    explain_canvas_code: "ctx.fillStyle='#000'; ctx.font='16px sans-serif'; ctx.fillText('輪のどこを切っても電気は止まるよ！', 50, 30); ctx.strokeStyle='#3b82f6'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(200, 80, 30, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle='#fff'; ctx.fillRect(180, 70, 20, 20);"
  }
];