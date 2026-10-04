/* =====================================================================
   nakama-egg.js — 「なかまのたまご」（まなびのなかま の ガチャ）
   ★2026-10-03追加：ふつうのガチャを コンプした 子むけの 新しい コレクション
   - たまごの 入手：きょうのまなびプランを 全部できた日に 1こ（3日れんぞくごとに +1こ）／🧩6枚と 交換／はじめての 1こは プレゼント
   - 10ぴきの オリジナルの 動物（★2026-10-04：モナちゃんを 追加）（★1〜★4）。同じ子が 出ると なかよしLv が 上がり（最大3）、その子の「ひみつ（本当の 豆ちしき）」が 1つずつ 開く
   - Lv3 の あとの ダブりは 🧩2枚に なって もどる
   - saveData.friendEggs[id] = { count, lv }、nakamaEggs（持っている たまごの数）、nakamaEggWelcome（プレゼント済み）
   - たまごを わるたびに log_db に「🥚なかまのたまご」を 記録する
   - js/mascots.js より前に 読みこむ（window.EGG_FRIENDS を なかま一覧に 合流させる）
   ===================================================================== */
(function () {
  "use strict";

  var EGG_KAKERA_COST = 6;
  var RATES = [[1, 0.55], [2, 0.30], [3, 0.12], [4, 0.03]];

  function eyes(mood, lx, rx, y, r, col) {
    col = col || "#2b2135";
    if (mood === "happy" || mood === "cheer") {
      var w = r * 1.4;
      return '<path d="M' + (lx - w) + ' ' + y + ' q' + w + ' ' + (-r * 1.5) + ' ' + (w * 2) + ' 0 M' + (rx - w) + ' ' + y + ' q' + w + ' ' + (-r * 1.5) + ' ' + (w * 2) + ' 0" fill="none" stroke="' + col + '" stroke-width="' + Math.max(1.6, r * 0.7) + '" stroke-linecap="round"/>';
    }
    return '<circle cx="' + lx + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/><circle cx="' + rx + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>' +
      '<circle cx="' + (lx + r * 0.35) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.38) + '" fill="#fff"/><circle cx="' + (rx + r * 0.35) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.38) + '" fill="#fff"/>';
  }
  function star(mood, x, y) { return mood === "cheer" ? '<path d="M' + x + ' ' + (y - 6) + ' l1.6 3.4 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5z" fill="#fde047"/>' : ""; }
  function blush(lx, rx, y) { return '<ellipse cx="' + lx + '" cy="' + y + '" rx="3.6" ry="2.2" fill="#f9a8d4" opacity=".8"/><ellipse cx="' + rx + '" cy="' + y + '" rx="3.6" ry="2.2" fill="#f9a8d4" opacity=".8"/>'; }
  function shadow() { return '<ellipse cx="32" cy="61.5" rx="19" ry="2.4" fill="#a855f7" opacity=".12"/>'; }
  function open(label) { return '<svg class="c-buddy" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '">'; }
  function smile(y) { return '<path d="M29.5 ' + y + ' q2.5 2.4 5 0" fill="none" stroke="#3b3042" stroke-width="1.4" stroke-linecap="round"/>'; }

  var ART = {
    // ハムスター
    choco: function (m) {
      return open("ちょこ") + shadow() +
        '<circle cx="16" cy="20" r="6.5" fill="#f2b766" stroke="#c98a3d" stroke-width="1.2"/><circle cx="48" cy="20" r="6.5" fill="#f2b766" stroke="#c98a3d" stroke-width="1.2"/><circle cx="16" cy="20" r="3.2" fill="#f9a8d4"/><circle cx="48" cy="20" r="3.2" fill="#f9a8d4"/>' +
        '<ellipse cx="32" cy="38" rx="24" ry="21" fill="#f2b766" stroke="#c98a3d" stroke-width="1.4"/>' +
        '<ellipse cx="32" cy="45" rx="17" ry="13" fill="#fff7ed"/><ellipse cx="18" cy="43" rx="7" ry="6" fill="#fff7ed"/><ellipse cx="46" cy="43" rx="7" ry="6" fill="#fff7ed"/>' +
        eyes(m, 24, 40, 34, 2.4) + '<ellipse cx="32" cy="39" rx="1.8" ry="1.3" fill="#f472b6"/>' + smile(41) + blush(17, 47, 41) +
        '<ellipse cx="26" cy="55" rx="3.4" ry="2.4" fill="#fbcfe8"/><ellipse cx="38" cy="55" rx="3.4" ry="2.4" fill="#fbcfe8"/>' + star(m, 56, 10) + '</svg>';
    },
    // ペンギン
    penta: function (m) {
      return open("ぺんた") + shadow() +
        '<ellipse cx="9.5" cy="40" rx="4.5" ry="10" fill="#334155" transform="rotate(22 9.5 40)"/><ellipse cx="54.5" cy="40" rx="4.5" ry="10" fill="#334155" transform="rotate(-22 54.5 40)"/>' +
        '<ellipse cx="32" cy="36" rx="22" ry="23" fill="#334155"/>' +
        '<path d="M32 23 Q22 15 16 26 Q12 38 20 47 Q26 54 32 54 Q38 54 44 47 Q52 38 48 26 Q42 15 32 23z" fill="#fff"/>' +
        eyes(m, 25, 39, 33, 2.4) + '<path d="M28.6 37.5 L35.4 37.5 L32 42z" fill="#fb923c"/>' + blush(20, 44, 41) +
        '<ellipse cx="25" cy="59" rx="5" ry="2.4" fill="#fb923c"/><ellipse cx="39" cy="59" rx="5" ry="2.4" fill="#fb923c"/>' + star(m, 56, 10) + '</svg>';
    },
    // ハリネズミ
    chiku: function (m) {
      var sp = "", n = 15;
      for (var i = 0; i <= n; i++) {
        var a = Math.PI * (0.92 + 1.16 * i / n), r = i % 2 ? 22 : 29;
        sp += (i ? " L" : "M") + (32 + Math.cos(a) * r).toFixed(1) + " " + (40 + Math.sin(a) * r).toFixed(1);
      }
      return open("ちくちく") + shadow() +
        '<path d="' + sp + ' L54 52 L10 52 Z" fill="#8b5e3c" stroke="#6b4423" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<ellipse cx="32" cy="42" rx="17" ry="15" fill="#fde7c8"/><circle cx="20" cy="30" r="3.6" fill="#fde7c8" stroke="#d6b38a"/><circle cx="44" cy="30" r="3.6" fill="#fde7c8" stroke="#d6b38a"/>' +
        eyes(m, 25, 39, 39, 2.2) + '<circle cx="32" cy="45" r="2.4" fill="#3b3042"/>' + smile(48) + blush(19, 45, 46) +
        '<ellipse cx="25" cy="57" rx="3.6" ry="2.4" fill="#fde7c8"/><ellipse cx="39" cy="57" rx="3.6" ry="2.4" fill="#fde7c8"/>' + star(m, 56, 8) + '</svg>';
    },
    // パンダ
    koron: function (m) {
      var happy = m === "happy" || m === "cheer";
      return open("ころん") + shadow() +
        '<circle cx="14" cy="18" r="7.5" fill="#1f2937"/><circle cx="50" cy="18" r="7.5" fill="#1f2937"/>' +
        '<ellipse cx="13" cy="50" rx="7" ry="6" fill="#1f2937"/><ellipse cx="51" cy="50" rx="7" ry="6" fill="#1f2937"/>' +
        '<circle cx="32" cy="36" r="23" fill="#fff" stroke="#e5e7eb" stroke-width="1.6"/>' +
        '<ellipse cx="23.5" cy="34" rx="6" ry="8" fill="#1f2937" transform="rotate(-30 23.5 34)"/><ellipse cx="40.5" cy="34" rx="6" ry="8" fill="#1f2937" transform="rotate(30 40.5 34)"/>' +
        (happy ? eyes(m, 24, 40, 34, 2.2, "#fff") : '<circle cx="24.5" cy="33" r="2.2" fill="#fff"/><circle cx="39.5" cy="33" r="2.2" fill="#fff"/>') +
        '<ellipse cx="32" cy="41.5" rx="3" ry="2.2" fill="#1f2937"/>' + smile(44.5) + blush(17, 47, 44) + star(m, 57, 8) + '</svg>';
    },
    // レッサーパンダ
    retchi: function (m) {
      return open("れっちー") + shadow() +
        '<path d="M50 50 Q64 46 61 34" fill="none" stroke="#c2410c" stroke-width="8" stroke-linecap="round"/><path d="M55 49 l3 -3 M59 44 l3 -1 M60 38 l3 0" stroke="#7c2d12" stroke-width="2.4"/>' +
        '<path d="M10 24 L14 8 L26 18z" fill="#c2410c" stroke="#fff" stroke-width="2"/><path d="M54 24 L50 8 L38 18z" fill="#c2410c" stroke="#fff" stroke-width="2"/>' +
        '<ellipse cx="32" cy="38" rx="23" ry="21" fill="#c2410c"/>' +
        '<ellipse cx="32" cy="45" rx="12" ry="9" fill="#fff"/><ellipse cx="21" cy="28" rx="4" ry="2.6" fill="#fff"/><ellipse cx="43" cy="28" rx="4" ry="2.6" fill="#fff"/>' +
        '<path d="M20.5 38.5 q.5 4 2.5 6.5 M43.5 38.5 q-.5 4 -2.5 6.5" stroke="#7c2d12" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        eyes(m, 23, 41, 35, 2.4) + '<ellipse cx="32" cy="42" rx="2.4" ry="1.8" fill="#1f2937"/>' + smile(45) + star(m, 56, 8) + '</svg>';
    },
    // フクロウ
    ho: function (m) {
      var happy = m === "happy" || m === "cheer";
      return open("ほーちゃん") + shadow() +
        '<path d="M14 22 L12 8 L24 18z M50 22 L52 8 L40 18z" fill="#a16207"/>' +
        '<ellipse cx="32" cy="37" rx="23" ry="23" fill="#ca8a04"/>' +
        '<circle cx="23" cy="32" r="10" fill="#fef3c7"/><circle cx="41" cy="32" r="10" fill="#fef3c7"/>' +
        (happy ? eyes(m, 23, 41, 32, 3) : '<circle cx="23" cy="32" r="5" fill="#2b2135"/><circle cx="41" cy="32" r="5" fill="#2b2135"/><circle cx="24.6" cy="30.2" r="1.8" fill="#fff"/><circle cx="42.6" cy="30.2" r="1.8" fill="#fff"/>') +
        '<path d="M29.5 38 L34.5 38 L32 43z" fill="#ea580c"/>' +
        '<path d="M24 48 l2 2.4 2 -2.4 M30 51 l2 2.4 2 -2.4 M36 48 l2 2.4 2 -2.4" stroke="#a16207" stroke-width="1.6" fill="none"/>' +
        '<ellipse cx="26" cy="59" rx="3.4" ry="2" fill="#ea580c"/><ellipse cx="38" cy="59" rx="3.4" ry="2" fill="#ea580c"/>' + star(m, 57, 8) + '</svg>';
    },
    // コアラ
    yukari: function (m) {
      return open("ゆーかり") + shadow() +
        '<circle cx="12" cy="24" r="11" fill="#9ca3af"/><circle cx="52" cy="24" r="11" fill="#9ca3af"/><circle cx="12" cy="24" r="6" fill="#f3f4f6"/><circle cx="52" cy="24" r="6" fill="#f3f4f6"/>' +
        '<ellipse cx="32" cy="38" rx="21" ry="20" fill="#9ca3af"/><ellipse cx="32" cy="48" rx="12" ry="7" fill="#e5e7eb"/>' +
        eyes(m, 23, 41, 34, 2.2) + '<ellipse cx="32" cy="41" rx="5" ry="6.4" fill="#374151"/><ellipse cx="30.4" cy="38.6" rx="1.4" ry="2" fill="#6b7280"/>' +
        blush(18, 46, 43) + '<path d="M52 52 q6 -6 4 -14" stroke="#16a34a" stroke-width="2" fill="none"/><ellipse cx="57" cy="40" rx="3" ry="5" fill="#4ade80" transform="rotate(20 57 40)"/>' + star(m, 8, 8) + '</svg>';
    },
    // ラッコ
    // ゴマフアザラシの 赤ちゃん「モナちゃん」（もちくんの 妹分）：まっ白な うぶ毛、ピンクに そまった ほっぺ、耳の 上に リボン
    mona: function (m) {
      return open("モナちゃん") + shadow() +
        '<path d="M48 51 Q59 48 58 57 Q53 59 46 57z" fill="#f1eef5" stroke="#dcd5e4" stroke-width="1.3"/>' +
        '<ellipse cx="31" cy="41" rx="23" ry="18.5" fill="#fff" stroke="#e3dcea" stroke-width="1.6"/>' +
        '<ellipse cx="11" cy="51" rx="5.4" ry="3" fill="#f1eef5" stroke="#dcd5e4" stroke-width="1.1" transform="rotate(-25 11 51)"/>' +
        '<path d="M41 24 L50 18 Q52 25 47 29z M41 24 L33 18 Q31 24 35 28z" fill="#f9a8d4" stroke="#db2777" stroke-width="1.1" stroke-linejoin="round"/><circle cx="41" cy="24.5" r="2.6" fill="#f472b6" stroke="#db2777" stroke-width="1"/>' +
        (m === "happy" || m === "cheer" ? eyes(m, 23, 38, 38, 2.5) :
          '<circle cx="23" cy="37.5" r="3.7" fill="#1f1828"/><circle cx="38" cy="37.5" r="3.7" fill="#1f1828"/><circle cx="24.4" cy="35.9" r="1.5" fill="#fff"/><circle cx="39.4" cy="35.9" r="1.5" fill="#fff"/>' +
          '<path d="M18.6 34.6 l-2 -1.6 M19.6 33 l-1.4 -2 M42.4 34.6 l2 -1.6 M41.4 33 l1.4 -2" stroke="#1f1828" stroke-width="1.1" stroke-linecap="round"/>') +
        '<ellipse cx="30.5" cy="43" rx="2.3" ry="1.6" fill="#2b2135"/>' + '<path d="M28 45.6 q2.5 2.2 5 0" fill="none" stroke="#2b2135" stroke-width="1.3" stroke-linecap="round"/>' +
        '<ellipse cx="16.5" cy="44" rx="4.6" ry="3" fill="#fb7185" opacity=".7"/><ellipse cx="44.5" cy="44" rx="4.6" ry="3" fill="#fb7185" opacity=".7"/>' +
        '<path d="M14.6 44 h3.6 M43 44 h3.6" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".8"/>' + star(m, 56, 12) + '</svg>';
    },
    rakkon: function (m) {
      return open("らっこん") + shadow() +
        '<ellipse cx="32" cy="42" rx="24" ry="16" fill="#7c5a3a"/>' +
        '<circle cx="32" cy="30" r="16" fill="#7c5a3a"/><ellipse cx="32" cy="32" rx="12" ry="11" fill="#f5e6d3"/>' +
        '<circle cx="18" cy="19" r="3" fill="#7c5a3a"/><circle cx="46" cy="19" r="3" fill="#7c5a3a"/>' +
        eyes(m, 26, 38, 30, 2) + '<ellipse cx="32" cy="34" rx="2.4" ry="1.7" fill="#2b2135"/>' + smile(36.5) +
        '<path d="M22 35 h-6 M22 37 h-6 M42 35 h6 M42 37 h6" stroke="#a8a29e" stroke-width=".8"/>' +
        '<path d="M26 46 Q32 38 38 46 Z" fill="#f9a8d4" stroke="#db2777" stroke-width="1"/><path d="M29 45 L32 41 M32 46 V41 M35 45 L32 41" stroke="#db2777" stroke-width=".8"/>' +
        '<ellipse cx="24" cy="47" rx="4" ry="3" fill="#5b4129"/><ellipse cx="40" cy="47" rx="4" ry="3" fill="#5b4129"/>' +
        '<path d="M2 54 q7.5 -5 15 0 t15 0 t15 0 t15 0 V64 H2z" fill="#93c5fd" opacity=".85"/>' + star(m, 56, 8) + '</svg>';
    },
    // ホッキョクグマの赤ちゃん
    shirotama: function (m) {
      return open("しろたま") +
        '<defs><radialGradient id="stGlow"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#e0f2fe" stop-opacity="0"/></radialGradient></defs>' +
        '<circle cx="32" cy="36" r="31" fill="url(#stGlow)"/>' + shadow() +
        '<circle cx="15" cy="20" r="6" fill="#fff" stroke="#d1d5db" stroke-width="1.4"/><circle cx="49" cy="20" r="6" fill="#fff" stroke="#d1d5db" stroke-width="1.4"/><circle cx="15" cy="20" r="2.6" fill="#e5e7eb"/><circle cx="49" cy="20" r="2.6" fill="#e5e7eb"/>' +
        '<ellipse cx="32" cy="38" rx="22" ry="20" fill="#fff" stroke="#d1d5db" stroke-width="1.6"/>' +
        '<ellipse cx="32" cy="44" rx="9" ry="7" fill="#f8fafc" stroke="#e5e7eb"/>' +
        eyes(m, 24, 40, 35, 2.3) + '<ellipse cx="32" cy="41.5" rx="2.6" ry="2" fill="#1f2937"/>' + smile(44.5) + blush(17, 47, 43) +
        '<path d="M8 10 l1.2 2.6 2.8 .4 -2 2 .5 2.8 -2.5 -1.3 -2.5 1.3 .5 -2.8 -2 -2 2.8 -.4z M56 12 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1 -2 1 .4 -2.2 -1.6 -1.5 2.2 -.3z" fill="#7dd3fc"/>' + star(m, 56, 30) + '</svg>';
    }
  };

  // ひみつ（本当の 豆ちしき）は Lv1→2→3 の じゅんに 開く
  window.EGG_FRIENDS = [
    { id: "choco", name: "ちょこ", kind: "ハムスター", rarity: 1, secrets: ["ほおぶくろに 食べ物を つめて、すみかまで 運ぶよ。", "夜に 元気に 動き回る「夜行性（やこうせい）」の 動物。", "前歯は 一生 のびつづけるので、かたい ものを かじって けずって いるよ。"] },
    { id: "penta", name: "ぺんた", kind: "ペンギン", rarity: 1, secrets: ["鳥の なかま。でも 空は とべず、つばさで 水の 中を およぐよ。", "黒い せなかと 白い おなかは、海の 中で 敵に 見つかりにくい 色なんだ。", "コウテイペンギンは、お父さんが 足の 上に たまごを のせて あたためるよ。"] },
    { id: "chiku", name: "ちくちく", kind: "ハリネズミ", rarity: 1, secrets: ["せなかの はりは、毛が かたく なった もの。", "こわいと くるっと まるく なって、はりで 身を 守るよ。", "夜に 活動して、虫などを 食べる 夜行性の 動物。"] },
    { id: "koron", name: "ころん", kind: "ジャイアントパンダ", rarity: 2, secrets: ["食べ物の ほとんどは 竹（たけ）。1日の 多くを 食べて すごすよ。", "中国の 山の 森に すんで いるよ。", "生まれた ときは 100〜200g くらいで、とても 小さいんだ。"] },
    { id: "retchi", name: "れっちー", kind: "レッサーパンダ", rarity: 2, secrets: ["木登りが とくいで、太い しっぽで バランスを とるよ。", "竹や ササの 葉を よく 食べるよ。", "「パンダ」と よばれたのは、ジャイアントパンダより レッサーパンダが 先なんだ。"] },
    { id: "ho", name: "ほーちゃん", kind: "フクロウ", rarity: 2, secrets: ["首を ぐるっと 大きく 回せる（約270度）よ。", "夜に 狩り（かり）を する 鳥。", "羽の ふちが ギザギザで、音を ほとんど 立てずに とべるよ。"] },
    { id: "yukari", name: "ゆーかり", kind: "コアラ", rarity: 3, secrets: ["ユーカリの 葉を 食べるよ。", "オーストラリアに すむ 動物。", "赤ちゃんは お母さんの おなかの ふくろで 育つ（有袋類：ゆうたいるい）よ。"] },
    { id: "rakkon", name: "らっこん", kind: "ラッコ", rarity: 3, secrets: ["おなかの 上で 石を 使って、貝を わって 食べるよ。", "ねる ときに 流されないよう、海そうを 体に まきつける ことが あるよ。", "毛が とても こくて、つめたい 海でも 体が あたたかいんだ。"] },
    { id: "mona", name: "モナちゃん", kind: "ゴマフアザラシの 赤ちゃん（もちくんの 妹分）", rarity: 3, secrets: ["ゴマフアザラシは、冬に 流氷（りゅうひょう）の 上で 赤ちゃんを 産むよ。", "赤ちゃんの 白い 毛は、氷や 雪の 上で 目立ちにくい 色なんだ。", "アザラシには 耳たぶが なく、小さな 耳の あなだけ。耳たぶが あるのは アシカの なかまだよ。"] },
    { id: "shirotama", name: "しろたま", kind: "ホッキョクグマの 赤ちゃん", rarity: 4, secrets: ["北極（ほっきょく）の 氷の 海の まわりに すむよ。", "白く 見える 毛は、じつは すきとおって いて、はだは 黒いんだ。", "生まれた ときは 600g くらい。大人は とても 大きく なるよ。"] }
  ].map(function (f) { f.svg = ART[f.id]; f.egg = true; return f; });

  function sd() { return window.saveData || {}; }
  function rec(id) { var d = sd(); d.friendEggs = d.friendEggs || {}; return d.friendEggs[id]; }
  window.eggFriendLevel = function (id) { var r = rec(id); return r ? (r.lv || 1) : 0; };
  window.nakamaEggCount = function () { return sd().nakamaEggs || 0; };

  // たまごを もらう（理由つき。保存は 呼び出し側の saveGame で）
  window.grantNakamaEgg = function (n, why) {
    var d = sd(); d.nakamaEggs = (d.nakamaEggs || 0) + (n || 1);
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🥚なかまのたまご", msg: "たまご +" + (n || 1) + "（" + why + "） 所持" + d.nakamaEggs });
  };
  // はじめての 1こ（なかまの画面を 初めて 開いたとき）
  window.ensureNakamaWelcomeEgg = function () {
    var d = sd(); if (!window.saveData || d.nakamaEggWelcome) return false;
    d.nakamaEggWelcome = true; window.grantNakamaEgg(1, "はじめてのプレゼント"); if (window.saveGame) window.saveGame(); return true;
  };
  window.exchangeKakeraForEgg = function () {
    var d = sd(), k = d.kakera || 0;
    if (k < EGG_KAKERA_COST) { alert("🧩 欠片が たりないよ！ ひつよう：" + EGG_KAKERA_COST + "枚 ／ いま：" + k + "枚"); return; }
    if (!confirm("🧩" + EGG_KAKERA_COST + "枚で なかまのたまご 1こと こうかんする？")) return;
    d.kakera = k - EGG_KAKERA_COST; window.grantNakamaEgg(1, "欠片" + EGG_KAKERA_COST + "枚と交換");
    if (window.updateUI) window.updateUI(); if (window.saveGame) window.saveGame(); window.openFriendsModal();
  };

  function roll() {
    var r = Math.random(), acc = 0, rarity = 1;
    for (var i = 0; i < RATES.length; i++) { acc += RATES[i][1]; if (r < acc) { rarity = RATES[i][0]; break; } }
    var pool = window.EGG_FRIENDS.filter(function (f) { return f.rarity === rarity; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  window.openNakamaEgg = function () {
    var d = sd();
    if ((d.nakamaEggs || 0) < 1) { alert("🥚 たまごが ないよ。きょうのプランを ぜんぶ できると 1こ もらえるよ！"); return; }
    d.nakamaEggs -= 1;
    d.friendEggs = d.friendEggs || {};
    var f = roll(), r = d.friendEggs[f.id], isNew = !r, lvUp = false, kakeraBack = 0;
    if (isNew) { r = d.friendEggs[f.id] = { count: 1, lv: 1 }; }
    else {
      r.count = (r.count || 1) + 1;
      if ((r.lv || 1) < 3) { r.lv = (r.lv || 1) + 1; lvUp = true; }
      else { kakeraBack = 2; d.kakera = (d.kakera || 0) + 2; }
    }
    if (window.saveGame) window.saveGame();
    if (window.updateUI) window.updateUI();
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🥚なかまのたまご", msg: "★" + f.rarity + " " + f.name + "（" + f.kind + "） " + (isNew ? "NEW" : lvUp ? "なかよしLv" + r.lv : "Lv3済→🧩+2") + " のこり" + d.nakamaEggs });
    showEggReveal(f, r.lv, isNew, lvUp, kakeraBack);
  };

  function showEggReveal(f, lv, isNew, lvUp, kakeraBack) {
    var old = document.getElementById("egg-reveal"); if (old) old.remove();
    var w = document.createElement("div"); w.id = "egg-reveal";
    w.style.cssText = "position:fixed;inset:0;z-index:10000;background:rgba(74,59,82,.55);display:flex;align-items:center;justify-content:center;padding:16px;";
    var starStr = "★★★★".slice(0, f.rarity);
    var secret = f.secrets[Math.min(lv, 3) - 1];
    var head = isNew ? "あたらしい なかま！" : lvUp ? "なかよし Lv" + lv + " に アップ！" : "また 会えたね！";
    w.innerHTML =
      '<style>@keyframes eggShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(6deg)}}' +
      '@keyframes eggPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}' +
      '#egg-reveal .c-buddy{width:130px;height:130px;display:block;margin:0 auto}</style>' +
      '<div style="background:linear-gradient(160deg,#fff,#fdf4ff 60%,#fef9c3);border-radius:26px;padding:20px 18px;max-width:340px;width:100%;text-align:center;box-shadow:0 10px 0 rgba(147,51,234,.25);">' +
        '<div id="egg-stage" style="height:140px;display:flex;align-items:center;justify-content:center;">' +
          '<svg viewBox="0 0 64 80" width="96" height="120" style="animation:eggShake .9s ease-in-out 2"><ellipse cx="32" cy="44" rx="26" ry="32" fill="#fff" stroke="#e9d5ff" stroke-width="3"/><path d="M14 40 q6 6 12 0 t12 0 t12 0" stroke="#f9a8d4" stroke-width="4" fill="none"/><circle cx="22" cy="58" r="4" fill="#bae6fd"/><circle cx="42" cy="26" r="3" fill="#fde68a"/><circle cx="44" cy="56" r="3.4" fill="#bbf7d0"/></svg>' +
        '</div>' +
        '<div id="egg-info" style="opacity:0;transition:opacity .3s;">' +
          '<div style="font-size:13px;font-weight:900;color:#f59e0b;">' + starStr + '</div>' +
          '<div style="font-size:19px;font-weight:900;color:#be185d;margin:2px 0;">' + head + '</div>' +
          '<div style="font-size:16px;font-weight:900;color:#4a3b52;">' + f.kind + 'の「' + f.name + '」</div>' +
          '<div style="background:#fff;border:2px dashed #f0abfc;border-radius:14px;padding:10px 12px;margin:10px 0;text-align:left;font-size:13px;font-weight:800;color:#6b21a8;line-height:1.7;">🔎 ひみつ ' + Math.min(lv, 3) + '／3<br>' + secret + '</div>' +
          (kakeraBack ? '<div style="font-size:12px;font-weight:900;color:#0284c7;margin-bottom:8px;">ひみつは ぜんぶ 開いて いるので 🧩+' + kakeraBack + '枚 もどってきたよ</div>' : '') +
          '<button style="border:none;border-radius:999px;padding:11px 24px;font-family:\'Zen Maru Gothic\';font-weight:900;font-size:15px;color:#fff;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 4px 0 #86198f;cursor:pointer;" onclick="document.getElementById(\'egg-reveal\').remove(); window.openFriendsModal();">やったー！</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(w);
    if (window.speakText) { try { window.speakText(isNew ? "あたらしい なかま！" : "なかよし アップ！", "ja-JP"); } catch (e) {} }
    setTimeout(function () {
      var st = document.getElementById("egg-stage"), info = document.getElementById("egg-info");
      if (st) st.innerHTML = '<div style="animation:eggPop .5s ease-out">' + f.svg("cheer") + '</div>';
      if (info) info.style.opacity = "1";
    }, 1900);
  }
})();
