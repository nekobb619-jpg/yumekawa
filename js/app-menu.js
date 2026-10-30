/* =====================================================================
   js/app-menu.js — ☰ メニュー（ぜんぶの 機能へ 1タップ）＋ バージョン ＋ 🆕 あたらしく なったよ
   ★2026-10-30追加（保護者：ホームが 長く、スクロールしないと たどり着きにくい。いちばん上に ハンバーガーメニューを。
     ユーザビリティ・アクセシビリティも うまく）
   ・右上に いつも ☰（48px）。ホームが 出て いる ときだけ 見せる（ステージ中・チューター画面・おこづかい画面では かくす）。
   ・ひらくと 右から パネル。グループごとに 大きな ボタン（高さ 48px 以上）。
     「ばしょへ 行く」ものは その 見出しまで スクロールして 少し 光らせる。「ひらく」ものは その 画面を 直接 ひらく。
   ・アクセシビリティ：aria-expanded／aria-controls、role="dialog" aria-modal、Esc で とじる、Tab は パネルの 中だけを まわる、
     とじたら ☰ に フォーカスを もどす。動きを へらす 設定では アニメーション なし。
   ・ホームの「onclick だけの div」（タイル・バナー）に role="button"・tabindex="0"・Enter/Space を つける（キーボード・読み上げで おせる）。
   ・下に「⬆ うえへ」ボタン（スクロールした ときだけ）。
   ・APP_VERSION と NEWS：アップデートしたら ここに 1行 足す（子ども向けの ことば）。ちがう バージョンを はじめて 開いた ときに 1回だけ おしらせ。
     saveData.newsSeen に 見た バージョンを のこす。開発の くわしい 記録は git の 履歴と AGENTS.md。
   ===================================================================== */
(function () {
  var APP_VERSION = "2026.10.30.3";
  var NEWS = [
    { v: "2026.10.30.3", items: [
      "🧭 考えかたOS が できたよ。どんな 問題も 0〜5 の じゅんばんで 考えよう（ステージ中は 左下の 🧭）",
      "🦄 ニコの 先生モード：まちがえた ニコに、OS の カードで 教えて あげよう",
      "🛤 2つの 道（ゴールから／わかる ことから）と 🃏 ふしぎな 問題（作戦カード）",
      "💡 新しい 単元の はじめに「なんのため？」が 出るよ",
      "📓 自学ノートに「生活の 判断ふりかえり」。勉強の 外でも 0〜5 の じゅんで ふり返ろう"
    ] },
    { v: "2026.10.30", items: [
      "☰ メニューが できたよ。右上から どこへでも すぐ 行けるよ",
      "🐱 クロぽんが なかよし度 25・50・75・100 で へんしん！ げんてい シールも もらえる",
      "🍱 ごはんクイズに 正解すると シールの かけらが もらえるよ",
      "✨ おなじ シールが 3まい（★4は 2まい）あると「キラに する」で キラキラ シールに へんしん"
    ] },
    { v: "2026.10.29", items: ["🕵️ 探偵ラボに 探偵ランク。じっくり 考えて 1回目で 正解すると かけらが もらえるよ"] },
    { v: "2026.10.28", items: ["👨 お父さんミッションの カード", "🧩 算数「解き方ならべ」ステージ"] },
    { v: "2026.10.27", items: ["📊 国語「じょうほう読み取り」ステージ"] },
    { v: "2026.10.24", items: ["🎀 シール帳で「1つ もどす」「ひらいた ときに もどす」"] },
    { v: "2026.10.22", items: ["🧩 シールの かけら・🎫 えらべる シール券・🎯 シール帳ミッション・❓ はてな シール"] },
    { v: "2026.10.19", items: ["✏️ 文字シール（すきな ことばを シールに）"] }
  ];
  window.APP_VERSION = APP_VERSION; window.APP_NEWS = NEWS;

  // [アイコン, なまえ, ちいさな 説明, 動き]。動き：{ fn:"関数名", args:[] } か { go:"見出しの もじ" か "#id" }
  var GROUPS = [
    ["🎯 まなぶ", [
      ["🎯", "きょうの まなびプラン", "", { go: "#tutor-plan-card" }],
      ["🧭", "考えかたOS", "ニコに 教える", { fn: "openThinkOS" }],
      ["📖", "今日の おはなし", "", { fn: "openBookModal" }],
      ["🧩", "今日の なぞとき", "", { fn: "launchBossQuest" }],
      ["📚", "教科の ぼうけん", "ステージを えらぶ", { go: "教科の ぼうけん" }],
      ["🔁", "ふくしゅう・探偵ラボ", "", { go: "ふくしゅう・とっくん" }],
      ["👑", "今月の 特別指令", "", { go: "今月の 特別指令" }]
    ]],
    ["🧰 どうぐばこ", [
      ["📓", "自学ノート", "", { fn: "openJigakuNote" }],
      ["🐾", "まなびの なかま", "", { fn: "openFriendsModal" }],
      ["🎀", "シール帳", "", { fn: "openStickerBook" }],
      ["🌼", "よかった帳", "", { fn: "openYokatta" }],
      ["✍️", "漢字シート", "", { fn: "openKanjiSheet" }],
      ["✏️", "筆算シート", "", { fn: "openHissanSheet" }],
      ["🧑‍🏫", "チューター", "", { fn: "openTutorScreen" }],
      ["📈", "せいちょう きろく", "", { fn: "openGrowthModal" }],
      ["📅", "今週の もくひょう", "", { fn: "openWeeklyMissionModal" }],
      ["✏️", "読書ノート", "", { fn: "openReadingNote" }],
      ["📚", "わたしの 本だな", "", { fn: "openBookshelf" }],
      ["🔭", "かんさつ ノート", "", { fn: "openObservationNote" }]
    ]],
    ["🎁 ごほうび・あそび", [
      ["🐱", "クロぽんの へや", "", { fn: "openKuroPonModal" }],
      ["🏆", "お宝図鑑", "", { fn: "openTreasureBookModal" }],
      ["🥚", "ガチャ", "", { fn: "openGachaModal" }],
      ["💮", "ログイン スタンプ", "", { fn: "openStampModal" }],
      ["⚡", "サバイバル", "", { fn: "launchSurvivalMode" }],
      ["🏝️", "宝島ショップ", "", { go: "#treasure-island-container-el" }],
      ["🪙", "pts を Q に りょうがえ", "", { go: "ptsを Qに" }],
      ["🥊", "きょうだい対抗バトル", "", { go: "きょうだい対抗バトル（" }]
    ]],
    ["👨‍👩‍👧 おうちの人と", [
      ["👨‍👩‍👧", "ほごしゃ レポート", "", { fn: "openParentReportModal" }],
      ["👛", "おこづかい", "", { fn: "openAllowanceScreen" }],
      ["💸", "ロバックス交換", "", { go: "ロバックス交換申請所" }]
    ]]
  ];

  var RM = false; try { RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var CSS =
    '#am-btn{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:150;width:48px;height:48px;border-radius:16px;border:2px solid #ddd6fe;background:rgba(255,255,255,.94);box-shadow:0 4px 14px rgba(76,29,149,.22);cursor:pointer;display:none;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent}' +
    '#am-btn.show{display:flex}#am-btn .bars{position:relative;width:22px;height:16px}#am-btn .bars i{position:absolute;left:0;width:100%;height:3px;border-radius:3px;background:#6b21a8;transition:transform .25s,opacity .2s}' +
    '#am-btn .bars i:nth-child(1){top:0}#am-btn .bars i:nth-child(2){top:6.5px}#am-btn .bars i:nth-child(3){top:13px}' +
    '#am-btn[aria-expanded="true"] .bars i:nth-child(1){transform:translateY(6.5px) rotate(45deg)}#am-btn[aria-expanded="true"] .bars i:nth-child(2){opacity:0}#am-btn[aria-expanded="true"] .bars i:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}' +
    '#am-btn .dot{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:999px;background:#db2777;color:#fff;font:900 10px "Zen Maru Gothic",sans-serif;display:none;align-items:center;justify-content:center;padding:0 4px;border:2px solid #fff}#am-btn .dot.on{display:flex}' +
    '#am-btn:focus-visible,#am-panel button:focus-visible,#am-top:focus-visible{outline:3px solid #7c3aed;outline-offset:3px}' +
    '#am-shade{position:fixed;inset:0;z-index:160;background:rgba(31,27,46,.45);opacity:0;pointer-events:none;transition:opacity .25s}#am-shade.on{opacity:1;pointer-events:auto}' +
    '#am-panel{position:fixed;top:0;right:0;bottom:0;z-index:170;width:min(340px,88vw);background:linear-gradient(180deg,#fff,#faf5ff);box-shadow:-8px 0 30px rgba(76,29,149,.25);transform:translateX(105%);transition:transform .28s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;font-family:"Zen Maru Gothic",sans-serif;border-radius:22px 0 0 22px;visibility:hidden}' +
    '#am-panel.on{transform:none;visibility:visible}' +
    '#am-panel .hd{display:flex;align-items:center;gap:8px;padding:max(14px,env(safe-area-inset-top)) 14px 10px 16px;border-bottom:2px solid #ede9fe}#am-panel .hd h2{flex:1;margin:0;font-size:18px;font-weight:900;color:#5b21b6}' +
    '#am-panel .hd .x{width:44px;height:44px;border-radius:14px;border:2px solid #ddd6fe;background:#fff;font-size:18px;font-weight:900;color:#6b21a8;cursor:pointer}' +
    '#am-panel .bd{overflow-y:auto;padding:6px 12px 18px;flex:1;overscroll-behavior:contain}' +
    '#am-panel h3{font-size:12.5px;font-weight:900;color:#7e22ce;margin:14px 4px 6px;letter-spacing:.04em}' +
    '#am-panel .gr{display:grid;grid-template-columns:1fr 1fr;gap:7px}' +
    '#am-panel .it{display:flex;align-items:center;gap:8px;min-height:52px;border:2px solid #ede9fe;background:#fff;border-radius:14px;padding:6px 9px;text-align:left;cursor:pointer;font:900 13px "Zen Maru Gothic",sans-serif;color:#3b2f52;line-height:1.25}' +
    '#am-panel .it:hover{border-color:#c4b5fd;background:#faf5ff}#am-panel .it .ic{font-size:22px;line-height:1;flex:0 0 auto}#am-panel .it small{display:block;font-size:10px;font-weight:700;color:#7a6985}' +
    '#am-panel .it.wide{grid-column:1/-1}' +
    '#am-panel .ft{border-top:2px solid #ede9fe;padding:10px 14px max(12px,env(safe-area-inset-bottom));font-size:11px;font-weight:800;color:#7a6985;display:flex;align-items:center;justify-content:space-between;gap:8px}' +
    '#am-panel .ft button{min-height:40px;border:2px solid #ddd6fe;background:#fff;border-radius:999px;padding:6px 12px;font:900 12px "Zen Maru Gothic";color:#6b21a8;cursor:pointer}' +
    '.am-flash{animation:amFlash 1.6s ease-out}@keyframes amFlash{0%,40%{box-shadow:0 0 0 4px #f0abfc,0 0 24px #e879f9;border-radius:14px}100%{box-shadow:0 0 0 0 transparent}}' +
    'h2.home-sec,#tutor-plan-card,.detective-lab-menu,#treasure-island-container-el{scroll-margin-top:72px}' +
    '#am-top{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:140;width:48px;height:48px;border-radius:50%;border:2px solid #ddd6fe;background:rgba(255,255,255,.95);box-shadow:0 4px 12px rgba(76,29,149,.22);font-size:18px;font-weight:900;color:#6b21a8;cursor:pointer;display:none}#am-top.show{display:block}' +
    // ニュース
    '#am-news{position:fixed;inset:0;z-index:10005;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Zen Maru Gothic",sans-serif}' +
    '#am-news .bx{position:relative;background:linear-gradient(165deg,#fff,#fdf4ff);border:3px solid #f0abfc;border-radius:24px;padding:18px 16px 14px;max-width:380px;width:100%;max-height:86vh;overflow-y:auto;box-shadow:0 12px 40px rgba(76,29,149,.35);animation:amPop .45s cubic-bezier(.2,1.5,.4,1)}' +
    '@keyframes amPop{0%{transform:scale(.6) rotate(-4deg);opacity:0}100%{transform:none;opacity:1}}' +
    '#am-news h2{margin:0 0 2px;font-size:19px;font-weight:900;color:#a21caf;text-align:center}#am-news .ver{text-align:center;font-size:11px;font-weight:800;color:#7a6985;margin-bottom:10px}' +
    '#am-news ul{margin:0;padding:0;list-style:none}#am-news li{background:#fff;border:2px solid #f5d0fe;border-radius:14px;padding:8px 10px;margin:6px 0;font-size:13.5px;font-weight:800;color:#3b2f52;line-height:1.55}' +
    '#am-news .old h3{font-size:12px;font-weight:900;color:#7e22ce;margin:12px 2px 2px}#am-news .old li{font-size:12px;padding:6px 9px;border-width:1.5px}' +
    '#am-news .ok{display:block;margin:12px auto 0;border:none;border-radius:999px;padding:12px 28px;min-height:48px;font:900 15px "Zen Maru Gothic";color:#fff;background:linear-gradient(135deg,#7c3aed,#db2777);box-shadow:0 4px 0 #4c1d95;cursor:pointer}#am-news .ok:focus-visible{outline:3px solid #fbbf24;outline-offset:3px}' +
    '#am-news .sp{position:absolute;font-size:18px;color:#f0abfc;animation:amTw 1.8s ease-in-out infinite;pointer-events:none}@keyframes amTw{0%,100%{transform:scale(.4);opacity:.2}50%{transform:scale(1.2) rotate(30deg);opacity:1}}' +
    // ホームの タイルに キーボード フォーカスが 見える ように
    'header.top{padding-left:56px!important;padding-right:56px!important}header.top h1{font-size:clamp(16px,calc((100vw - 150px) / 13),28px)!important}' +
    '.container [role="button"]:focus-visible{outline:3px solid #7c3aed;outline-offset:3px;border-radius:14px}' +
    '@media (prefers-reduced-motion:reduce){#am-panel,#am-shade,#am-btn .bars i{transition:none}.am-flash,#am-news .bx,#am-news .sp{animation:none}}';

  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function homeVisible() {
    var lm = el("login-modal"); if (lm && getComputedStyle(lm).display !== "none") return false;
    return !["game-screen", "tutor-screen", "allowance-screen"].some(function (id) { var e = el(id); return e && getComputedStyle(e).display !== "none"; });
  }
  function findGo(go) {
    if (go.charAt(0) === "#") return el(go.slice(1));
    var cands = document.querySelectorAll(".container h2.home-sec, .container .acc-head, .container [onclick]");
    for (var i = 0; i < cands.length; i++) if (cands[i].textContent.replace(/\s+/g, " ").indexOf(go) >= 0) return cands[i];
    return null;
  }

  function build() {
    if (el("am-btn")) return;
    var st = document.createElement("style"); st.id = "am-css"; st.textContent = CSS; document.head.appendChild(st);
    var b = document.createElement("button"); b.id = "am-btn"; b.type = "button";
    b.setAttribute("aria-label", "メニューを ひらく"); b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", "am-panel");
    b.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="dot" id="am-dot" aria-hidden="true">NEW</span>';
    var sh = document.createElement("div"); sh.id = "am-shade";
    var p = document.createElement("div"); p.id = "am-panel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.setAttribute("aria-labelledby", "am-title"); p.setAttribute("aria-hidden", "true");
    var html = '<div class="hd"><h2 id="am-title">☰ メニュー</h2><button type="button" class="x" data-am="close" aria-label="メニューを とじる">✕</button></div><div class="bd">' +
      '<button type="button" class="it wide" data-am="news" style="border-color:#f0abfc;background:linear-gradient(135deg,#fdf4ff,#fff)"><span class="ic" aria-hidden="true">🆕</span><span>あたらしく なったよ<small>バージョン ' + APP_VERSION + '</small></span></button>';
    GROUPS.forEach(function (g, gi) {
      html += '<h3 id="am-g' + gi + '">' + g[0] + '</h3><div class="gr" role="group" aria-labelledby="am-g' + gi + '">';
      g[1].forEach(function (it, ii) {
        html += '<button type="button" class="it" data-am="go" data-g="' + gi + '" data-i="' + ii + '"><span class="ic" aria-hidden="true">' + it[0] + '</span><span>' + esc(it[1]) + (it[2] ? '<small>' + esc(it[2]) + '</small>' : '') + '</span></button>';
      });
      html += '</div>';
    });
    html += '</div><div class="ft"><span>ゆめかわ v' + APP_VERSION + '</span><button type="button" data-am="top">⬆ いちばん 上へ</button></div>';
    p.innerHTML = html;
    var top = document.createElement("button"); top.id = "am-top"; top.type = "button"; top.setAttribute("aria-label", "いちばん 上へ もどる"); top.textContent = "⬆";
    document.body.appendChild(sh); document.body.appendChild(p); document.body.appendChild(b); document.body.appendChild(top);

    b.addEventListener("click", function () { if (p.classList.contains("on")) closeMenu(); else openMenu(); });
    sh.addEventListener("click", function () { closeMenu(); });
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); b.focus(); });
    p.addEventListener("click", function (e) {
      var t = e.target.closest("[data-am]"); if (!t) return;
      var a = t.getAttribute("data-am");
      if (a === "close") return closeMenu();
      if (a === "top") { closeMenu(true); window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); return; }
      if (a === "news") { closeMenu(true); return showNews(true); }
      var it = GROUPS[+t.getAttribute("data-g")][1][+t.getAttribute("data-i")], act = it[3];
      closeMenu(true);
      setTimeout(function () { run(act, it[1]); }, RM ? 0 : 180);
    });
    p.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
      if (e.key !== "Tab") return;
      var f = p.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener("scroll", tick, { passive: true });
    setInterval(tick, 800);
    tick();
  }
  function run(act, name) {
    try {
      if (act.fn) {
        var f = window[act.fn];
        if (typeof f === "function") { f.apply(window, act.args || []); return; }
      }
      var go = act.go && findGo(act.go);
      if (go) {
        go.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
        go.classList.remove("am-flash"); void go.offsetWidth; go.classList.add("am-flash");
        setTimeout(function () { go.classList.remove("am-flash"); }, 1700);
        if (!go.hasAttribute("tabindex") && !/^(BUTTON|A|INPUT)$/.test(go.tagName)) go.setAttribute("tabindex", "-1");
        try { go.focus({ preventScroll: true }); } catch (e) {}
      }
    } catch (e) { console.error("app-menu", e); }
  }
  var lastFocus = null;
  function openMenu() {
    var p = el("am-panel"), b = el("am-btn"); if (!p) return;
    lastFocus = document.activeElement;
    p.classList.add("on"); el("am-shade").classList.add("on"); p.setAttribute("aria-hidden", "false");
    b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-label", "メニューを とじる");
    document.documentElement.style.overflow = "hidden";
    setTimeout(function () { var f = p.querySelector(".x"); if (f) f.focus(); }, RM ? 0 : 60);
  }
  function closeMenu(noFocus) {
    var p = el("am-panel"), b = el("am-btn"); if (!p) return;
    p.classList.remove("on"); el("am-shade").classList.remove("on"); p.setAttribute("aria-hidden", "true");
    b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "メニューを ひらく");
    document.documentElement.style.overflow = "";
    if (!noFocus) try { b.focus(); } catch (e) {}
  }
  window.openAppMenu = openMenu; window.closeAppMenu = closeMenu;

  function tick() {
    var b = el("am-btn"), t = el("am-top"); if (!b) return;
    var hv = homeVisible();
    b.classList.toggle("show", hv);
    if (!hv && el("am-panel").classList.contains("on")) closeMenu(true);
    t.classList.toggle("show", hv && window.scrollY > 700);
    var sd = window.saveData, dot = el("am-dot");
    if (dot) dot.classList.toggle("on", !!(sd && sd.newsSeen && sd.newsSeen !== APP_VERSION));
    a11yTiles();
    maybeNews();
  }

  // onclick だけの div（タイル・バナー・アコーディオン）を キーボード・読み上げで おせる ように
  function a11yTiles() {
    var list = document.querySelectorAll(".container [onclick]:not(button):not(a):not(input):not([role])");
    for (var i = 0; i < list.length; i++) {
      var x = list[i]; if (x.tagName === "HEADER") continue;
      x.setAttribute("role", "button"); if (!x.hasAttribute("tabindex")) x.setAttribute("tabindex", "0");
    }
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var t = e.target; if (!t || !t.getAttribute || t.getAttribute("role") !== "button" || /^(BUTTON|A|INPUT|TEXTAREA)$/.test(t.tagName)) return;
    if (!t.hasAttribute("onclick")) return;
    e.preventDefault(); t.click();
  });

  /* ---- 🆕 あたらしく なったよ ---- */
  var newsTried = false;
  function maybeNews() {
    var sd = window.saveData; if (newsTried || !sd || !window.playerId || !homeVisible()) return;
    var ov = el("data-loading-overlay"); if (ov && getComputedStyle(ov).display !== "none") return;
    if (!sd.newsSeen) { sd.newsSeen = APP_VERSION; newsTried = true; return; } // はじめての 人には 出さない（つぎの アップデートから）
    if (sd.newsSeen === APP_VERSION) { newsTried = true; return; }
    // ほかの おしらせ（宝・シール・へんしん）が 出て いる ときは まつ
    var busy = ["stk-reveal", "kpf-fx", "treasure-reveal-modal", "streak-celebration-modal", "master-celebration-modal", "stamp-modal"].some(function (id) { var e = el(id); return e && getComputedStyle(e).display !== "none"; });
    if (busy) return;
    newsTried = true; showNews(false);
  }
  function showNews(all) {
    var old = el("am-news"); if (old) old.remove();
    var sd = window.saveData || {}, seen = sd.newsSeen || "";
    var fresh = NEWS.filter(function (n) { return all ? n.v === NEWS[0].v : n.v > seen; });
    if (!fresh.length) fresh = [NEWS[0]];
    var rest = all ? NEWS.slice(1) : [];
    var w = document.createElement("div"); w.id = "am-news"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "am-news-t");
    var sp = ""; [[6, 8], [88, 6], [4, 70], [92, 60], [50, 2]].forEach(function (q, i) { sp += '<span class="sp" aria-hidden="true" style="left:' + q[0] + '%;top:' + q[1] + '%;animation-delay:' + (i * .35) + 's">✦</span>'; });
    w.innerHTML = '<div class="bx">' + sp + '<h2 id="am-news-t">🆕 あたらしく なったよ！</h2><div class="ver">ゆめかわ バージョン ' + APP_VERSION + '</div>' +
      fresh.map(function (n) { return '<ul>' + n.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>'; }).join("") +
      (rest.length ? '<div class="old">' + rest.map(function (n) { return '<h3>' + n.v.replace(/^2026\./, "").replace(".", "/") + '</h3><ul>' + n.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>'; }).join("") + '</div>' : '') +
      '<button type="button" class="ok" id="am-news-ok">わかった！</button></div>';
    document.body.appendChild(w);
    var ok = el("am-news-ok"), done = function () { w.remove(); if (window.saveData) { window.saveData.newsSeen = APP_VERSION; try { if (window.saveGame) window.saveGame(); } catch (e) {} } tick(); };
    ok.onclick = done; w.addEventListener("click", function (e) { if (e.target === w) done(); });
    w.addEventListener("keydown", function (e) { if (e.key === "Escape") done(); if (e.key === "Tab") { e.preventDefault(); ok.focus(); } });
    setTimeout(function () { try { ok.focus(); } catch (e) {} }, 50);
    if (!all) log("🆕 おしらせを 見た " + APP_VERSION);
  }
  window.showAppNews = function () { showNews(true); };
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet && window.saveData) window.syncWithGoogleSpreadsheet("LOG", { stage: "☰メニュー", msg: msg }); } catch (e) {} }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
