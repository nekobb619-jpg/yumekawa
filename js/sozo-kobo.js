/* =====================================================================
   js/sozo-kobo.js — 🎨 そうぞう工房（創造OS：あつめる → まぜる → かえる → ためす → なおす）
   ★2026-10-30追加（保護者：判断OS に くわえて「想像・創出する OS」も 育てたい。フレームワークに たよらず 自分から 生み出す 力。
     ゲームを 作ろう・まぜて みよう（テニス×ハンドボール）・道具から 作ろう・クイズを 作って パパや りさに 遊んで もらおう）
   ・モード：🎲 まぜる（カード 2〜3まい）／🧰 どうぐから（どうぐ 2〜3こ＋ばしょ）／❓ クイズを つくる／📄 白紙から
   ・書き方の レベル（だんだん 手助けを へらす）：Lv1 らんを うめる → Lv2 ヒントの ことばだけ → Lv3 白紙。
     作った 数 LV2_AT・LV3_AT で ひらく（ひらいた レベルの 中から えらべる）
   ・カードの 引き直しは 1回の 作品で REROLL_MAX 回まで（しばりの 中で 考える 練習）
   ・家族に 見せる：作品の「to」に あて先（りお・りさ・papa）を 書いて 自分の セーブに のこす。
     相手の アプリが GAS の LOGIN（読むだけ）で 読んで「とどいた 作品」に 出す。あそんだら 相手の セーブに sozoPlays を のこし、
     作った 人は それを 読んで「あそんで もらった」を 知る。だれも ほかの 人の セーブには 書きこまない（シール帳の プレゼントと 同じ）。
   ・👑 そうぞう王：作品 1つ ＝ 1点、あそんで もらう ＝ 2点。称号は RANKS。
   ・ごほうび：その 日 はじめての 作品で シールの かけら ＋3（上限は 共通）。きょうの まなびプランの「🎨 つくる（できたら）」も ✓。
   ・saveData.sozo = { works:[{ id, m:モード, d, lv, cards:[…], f:{name,who,use,r1,r2,r3,win,fun}, text, quiz:{q,a:[3],c,exp}, to:[…], at }], cnt, fd（かけらを もらった 日）}
     saveData.sozoPlays = [{ i:作品id, by:作った人, star:1〜3, c:ひとこと, d, ok:クイズ正解 }]、saveData.sozoSeen = [見た 遊んだ記録の キー]
     作品は さいご WORK_MAX こ（セーブの 大きさの ため）。名前・住所は 書かない ように 画面で つたえる。
   ・ことばは すべて オリジナル。カードの 遊び名は ふつうの 名前（商品名・キャラクター名は 使わない）。
   ===================================================================== */
(function () {
  "use strict";
  var FAMILY = ["りお", "りさ", "papa"], WORK_MAX = 15, LV2_AT = 3, LV3_AT = 6, REROLL_MAX = 2;
  var CARDS = {
    asobi: { n: "あそび", icon: "🎈", list: ["おにごっこ", "かくれんぼ", "だるまさんが ころんだ", "ドッジボール", "じゃんけん", "しりとり", "なわとび", "けんけんぱ", "ハンカチ落とし", "いす取りゲーム", "すごろく", "神経衰弱", "人狼ゲーム（ひみつの 役わり）", "宝さがし", "伝言ゲーム", "あっち向いて ホイ"] },
    sport: { n: "スポーツ", icon: "⚽", list: ["サッカー", "バスケットボール", "テニス", "野球", "リレー", "ボウリング", "卓球", "バレーボール", "ハンドボール", "水泳", "ゴルフ", "すもう"] },
    dogu: { n: "どうぐ", icon: "🧰", list: ["トランプ", "サイコロ", "紙コップ", "ビー玉", "輪ゴム", "新聞紙", "ペットボトル", "タイマー", "ボール", "ふせん", "折り紙", "えんぴつと 紙", "風船", "ぬいぐるみ", "ハンカチ", "コイン（おもちゃ）"] },
    rule: { n: "ルール", icon: "📜", list: ["声を 出したら アウト", "目を つぶって やる", "1分 以内", "片足で", "ぎゃくに うごく", "チームで やる", "ひとことしか 話せない", "点数が 2倍に なる 時間", "ひみつの 役わりが ある", "3回まで", "まねっこ しないと だめ", "さいごの 1人が 勝ち"] },
    basho: { n: "ばしょ", icon: "📍", list: ["教室", "公園", "リビング", "体育館", "車の 中", "図書館（しずかに）", "ろうか", "雪の 日の 外", "テーブルの 上", "おふとんの 上"] }
  };
  var RANKS = [[0, "アイデアの たね", "🌱"], [3, "ひらめき 見習い", "💡"], [8, "アイデア 職人", "🛠️"], [15, "そうぞう 名人", "🎨"], [30, "そうぞう王", "👑"]];
  var SOZO_OS = [
    { icon: "🧺", name: "あつめる", ask: "材料を あつめよう（物・人・あそび・ルール）" },
    { icon: "🔀", name: "まぜる", ask: "2つを かけあわせると？（テニス × 人狼 なら？）" },
    { icon: "🔧", name: "かえる", ask: "ルールを 1つだけ かえて みよう（ぎゃくに・人数・時間・ばしょ）" },
    { icon: "🎮", name: "ためす", ask: "だれかに あそんで もらおう" },
    { icon: "✨", name: "なおす", ask: "感想を きいて、もっと おもしろく" }
  ];
  window.SOZO_OS = SOZO_OS;
  var FIELDS = [
    ["name", "ゲームの 名前", "例：ビー玉ボウリング人狼", "名前"],
    ["who", "何人で あそぶ？", "例：3〜5人", "人数"],
    ["use", "つかう もの・ばしょ", "例：紙コップ 10こ、ビー玉 1こ、つくえの 上", "もの"],
    ["r1", "ルール ①", "例：じゅんばんに ビー玉を ころがす", "ルール"],
    ["r2", "ルール ②", "例：ひみつの「わるもの」が 1人 いる", ""],
    ["r3", "ルール ③", "例：わるものに 当たったら 点が 2倍", ""],
    ["win", "どう なったら 勝ち？", "例：10回 たおして 点が いちばん 多い 人", "勝ち方"],
    ["fun", "ここが おもしろい！", "例：だれが わるものか 考えながら ころがす", "おもしろさ"]
  ];
  var HINTS = ["だれと", "どこで", "なにを 使って", "どう うごく", "いつ おわる", "どう なれば 勝ち", "ずるを ふせぐ ルール", "ここが おもしろい"];

  function today() { var x = new Date(window.currentServerTime || Date.now()); return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
  function me() { return window.playerId || ""; }
  function others() { return FAMILY.filter(function (x) { return x !== me(); }); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function clean(s, n) { return Array.from(String(s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim()).slice(0, n || 60).join(""); }
  function S() {
    var sd = window.saveData; if (!sd) return null;
    if (!sd.sozo || typeof sd.sozo !== "object") sd.sozo = {};
    var s = sd.sozo; if (!Array.isArray(s.works)) s.works = []; s.cnt = Number(s.cnt || 0);
    if (!Array.isArray(sd.sozoPlays)) sd.sozoPlays = [];
    if (!Array.isArray(sd.sozoSeen)) sd.sozoSeen = [];
    return s;
  }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet && window.saveData) window.syncWithGoogleSpreadsheet("LOG", { stage: "🎨そうぞう工房", msg: msg }); } catch (e) {} }
  function pick(arr, not) { var a = arr.filter(function (x) { return (not || []).indexOf(x) < 0; }); return a[Math.floor(Math.random() * a.length)]; }
  function lvMax() { var s = S(); var c = s ? s.cnt : 0; return c >= LV3_AT ? 3 : c >= LV2_AT ? 2 : 1; }
  function points() { var s = S(); if (!s) return 0; var sd = window.saveData; return s.cnt + 2 * Number((sd.sozoPlayedBy || []).length || 0); }
  function rankOf(p) { var r = RANKS[0]; RANKS.forEach(function (x) { if (p >= x[0]) r = x; }); return r; }
  function nextRank(p) { for (var i = 0; i < RANKS.length; i++) if (RANKS[i][0] > p) return RANKS[i]; return null; }

  /* ---------------- 画面 ---------------- */
  var CSS =
    '#szk{position:fixed;inset:0;z-index:9990;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:10px;font-family:"Zen Maru Gothic",sans-serif}' +
    '#szk .bx{background:linear-gradient(165deg,#fff,#fff7ed 60%,#fdf4ff);border-radius:24px;padding:12px 12px 16px;max-width:440px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 10px 0 rgba(234,88,12,.25);color:#3b2f52}' +
    '#szk .hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}#szk .hd h2{flex:1;margin:0;font-size:18px;font-weight:900;color:#c2410c}' +
    '#szk .x,#szk .bk{min-height:44px;min-width:44px;border:2px solid #fed7aa;background:#fff;color:#c2410c;font:900 13px "Zen Maru Gothic";border-radius:14px;padding:6px 12px;cursor:pointer}' +
    '#szk button:focus-visible,#szk input:focus-visible,#szk textarea:focus-visible{outline:3px solid #ea580c;outline-offset:2px}' +
    '#szk .menu{display:grid;grid-template-columns:1fr 1fr;gap:8px}#szk .menu button{min-height:88px;border:2px solid #fed7aa;background:#fff;border-radius:18px;padding:8px;cursor:pointer;font:900 13.5px "Zen Maru Gothic";color:#3b2f52;line-height:1.35}' +
    '#szk .menu button .ic{display:block;font-size:30px;line-height:1.2}#szk .menu button small{display:block;font-size:10.5px;font-weight:700;color:#7a6985}' +
    '#szk .rank{display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid #fdba74;border-radius:16px;padding:8px 12px;margin-bottom:8px}' +
    '#szk .cards{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0;perspective:600px}' +
    '#szk .cd{width:118px;min-height:150px;border-radius:16px;background:linear-gradient(160deg,#fff,#fff7ed);border:3px solid #fb923c;box-shadow:0 6px 0 rgba(194,65,12,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;animation:szkFlip .55s cubic-bezier(.2,1.4,.4,1) both}' +
    '#szk .cd .k{font-size:11px;font-weight:900;color:#c2410c}#szk .cd .i{font-size:34px;line-height:1.3}#szk .cd .t{font-size:15px;font-weight:900;color:#431407;line-height:1.35}' +
    '#szk .cd.r{border-color:#a855f7;background:linear-gradient(160deg,#fff,#faf5ff)}#szk .cd.r .k{color:#7e22ce}' +
    '@keyframes szkFlip{0%{transform:rotateY(180deg) scale(.6);opacity:0}100%{transform:none;opacity:1}}' +
    '#szk .plus{font-size:26px;font-weight:900;color:#ea580c;align-self:center}' +
    '#szk .q{font-size:14px;font-weight:900;color:#3b2f52;margin:10px 2px 6px;line-height:1.6}#szk .sub{font-size:11.5px;font-weight:700;color:#6b5a85;line-height:1.6}' +
    '#szk label.f{display:block;margin:7px 0}#szk label.f span{display:block;font-size:12.5px;font-weight:900;color:#9a3412;margin-bottom:2px}' +
    '#szk input[type=text],#szk textarea{width:100%;box-sizing:border-box;border:2px solid #fed7aa;border-radius:12px;padding:8px 10px;font:800 15px "Zen Maru Gothic";background:#fff;color:#3b2f52}#szk textarea{resize:vertical}' +
    '#szk .go{display:block;margin:12px auto 0;border:none;border-radius:999px;min-height:48px;padding:10px 26px;font:900 15px "Zen Maru Gothic";color:#fff;background:linear-gradient(135deg,#f97316,#db2777);box-shadow:0 4px 0 #9a3412;cursor:pointer}#szk .go[disabled]{background:#cbd5e1;box-shadow:none}' +
    '#szk .mini{min-height:40px;border:2px solid #fed7aa;background:#fff;color:#9a3412;border-radius:999px;padding:5px 12px;font:900 12px "Zen Maru Gothic";cursor:pointer;margin:3px}#szk .mini[aria-pressed="true"]{background:#ea580c;color:#fff;border-color:#ea580c}' +
    '#szk .os{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin:4px 0 8px}#szk .os span{font-size:11px;font-weight:900;color:#9a3412;background:#fff;border:1.5px dashed #fdba74;border-radius:999px;padding:3px 8px}' +
    '#szk .work{background:#fff;border:2px solid #fed7aa;border-radius:16px;padding:10px 12px;margin:8px 0}#szk .work h3{margin:0 0 4px;font-size:15px;color:#9a3412}' +
    '#szk .opt{display:block;width:100%;text-align:left;min-height:46px;border:2px solid #fed7aa;background:#fff;border-radius:14px;padding:8px 12px;margin:6px 0;font:800 14px "Zen Maru Gothic";color:#3b2f52;cursor:pointer}' +
    '#szk .opt.ok{border-color:#16a34a;background:#f0fdf4}#szk .opt.ng{border-color:#f87171;background:#fef2f2}' +
    '#szk .star button{font-size:26px;background:none;border:none;cursor:pointer;min-width:44px;min-height:44px}' +
    '#szk .fx{text-align:center}#szk .fx .big{font-size:52px;animation:szkPop .6s cubic-bezier(.2,1.6,.4,1)}@keyframes szkPop{0%{transform:scale(.2) rotate(-20deg)}100%{transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#szk .cd,#szk .fx .big{animation:none}}';
  function css() { if (document.getElementById("szk-css")) return; var s = document.createElement("style"); s.id = "szk-css"; s.textContent = CSS; document.head.appendChild(s); }

  var ui = null, lastFocus = null;
  function open(view) {
    if (!window.saveData) return; css(); S();
    var old = document.getElementById("szk"); if (!old) lastFocus = document.activeElement; else old.remove();
    var w = document.createElement("div"); w.id = "szk"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "szk-t");
    w.innerHTML = '<div class="bx"><div class="hd"><button type="button" class="bk" data-z="back" aria-label="もどる" style="display:none">◀</button><h2 id="szk-t">🎨 そうぞう工房</h2><button type="button" class="x" data-z="close" aria-label="とじる">とじる</button></div><div id="szk-b" aria-live="polite"></div></div>';
    document.body.appendChild(w);
    w.addEventListener("click", function (e) { if (e.target === w) return close(); var b = e.target.closest("[data-z]"); if (b) act(b.getAttribute("data-z"), b.getAttribute("data-v"), b); });
    w.addEventListener("input", function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute("data-f") && ui) { ui.f[t.getAttribute("data-f")] = t.value; } });
    w.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = Array.prototype.filter.call(w.querySelectorAll("button:not([disabled]),input,textarea"), function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    ui = { view: view || "home", f: {}, cards: [], rr: 0 };
    render();
    setTimeout(function () { var x = w.querySelector(".x"); if (x) x.focus(); }, 30);
    if (ui.view === "home") checkFamily();
  }
  function close() { var w = document.getElementById("szk"); if (w) w.remove(); ui = null; try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {} }
  window.openSozo = function (v) { open(v); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.getElementById("szk") && !document.getElementById("szk").contains(document.activeElement)) close(); });

  function render() {
    var b = document.getElementById("szk-b"); if (!b || !ui) return;
    var bk = document.querySelector("#szk .bk"); if (bk) bk.style.display = ui.view === "home" ? "none" : "";
    b.innerHTML = ui.view === "make" ? makeHtml() : ui.view === "done" ? doneHtml() : ui.view === "mine" ? mineHtml() : ui.view === "inbox" ? inboxHtml() : ui.view === "play" ? playHtml() : homeHtml();
  }
  function focusFirst() { setTimeout(function () { var x = document.querySelector("#szk-b input, #szk-b textarea, #szk-b .go, #szk-b .opt, #szk-b .menu button, #szk-b .mini, #szk .x"); if (x) try { x.focus(); } catch (e) {} }, 30); }

  function homeHtml() {
    var s = S(), p = points(), r = rankOf(p), nx = nextRank(p), L = lvMax(), inb = ui.inbox ? ui.inbox.length : 0;
    return '<div class="rank"><span style="font-size:30px" aria-hidden="true">' + r[2] + '</span><div style="flex:1"><div style="font-size:11px;font-weight:900;color:#c2410c">きみの そうぞうランク</div><div style="font-size:16px;font-weight:900;color:#431407">' + r[1] + '</div>' +
      '<div class="sub">' + (nx ? "あと " + (nx[0] - p) + "点で「" + nx[1] + "」（作品 1つ 1点・あそんで もらう 2点）" : "さいこうランク！") + '</div></div></div>' +
      '<div class="os" aria-label="創造OS">' + SOZO_OS.map(function (o, i) { return '<span title="' + esc(o.ask) + '">' + (i + 1) + ' ' + o.icon + ' ' + o.name + '</span>'; }).join("") + '</div>' +
      '<div class="menu">' +
      '<button type="button" data-z="new" data-v="mix"><span class="ic" aria-hidden="true">🎲</span>まぜて つくる<small>カードを 引いて かけあわせ</small></button>' +
      '<button type="button" data-z="new" data-v="tool"><span class="ic" aria-hidden="true">🧰</span>どうぐから つくる<small>これだけで あそべる ゲーム</small></button>' +
      '<button type="button" data-z="new" data-v="quiz"><span class="ic" aria-hidden="true">❓</span>クイズを つくる<small>家族に 出そう</small></button>' +
      '<button type="button" data-z="new" data-v="free"><span class="ic" aria-hidden="true">📄</span>白紙から<small>自分で ぜんぶ 考える</small></button>' +
      '<button type="button" data-z="view" data-v="mine"><span class="ic" aria-hidden="true">📚</span>つくった 作品<small>' + s.works.length + 'こ</small></button>' +
      '<button type="button" data-z="view" data-v="inbox"><span class="ic" aria-hidden="true">📬</span>とどいた 作品<small>' + (ui.inbox === undefined || ui.inbox === null ? "たしかめ中…" : inb ? inb + "こ あるよ！" : "家族の 作品で あそぶ") + '</small></button>' +
      '</div><div class="sub" style="margin-top:8px;text-align:center">書き方 Lv' + L + (L < 3 ? '（作品 ' + (L === 1 ? LV2_AT : LV3_AT) + 'こで 次の レベル）' : '：白紙で 書ける！') + '</div>';
  }

  /* ---- つくる ---- */
  function deal(mode) {
    if (mode === "mix") { var a = pick(Math.random() < .6 ? CARDS.asobi.list : CARDS.sport.list), kA = CARDS.asobi.list.indexOf(a) >= 0 ? "asobi" : "sport"; var kB = Math.random() < .5 ? (kA === "asobi" ? "sport" : "asobi") : "asobi"; var b2 = pick(CARDS[kB].list, [a]); var cs = [{ k: kA, t: a }, { k: kB, t: b2 }]; if (Math.random() < .5) cs.push({ k: "rule", t: pick(CARDS.rule.list) }); return cs; }
    if (mode === "tool") { var d1 = pick(CARDS.dogu.list), d2 = pick(CARDS.dogu.list, [d1]), out = [{ k: "dogu", t: d1 }, { k: "dogu", t: d2 }]; if (Math.random() < .5) out.push({ k: "dogu", t: pick(CARDS.dogu.list, [d1, d2]) }); out.push({ k: "basho", t: pick(CARDS.basho.list) }); return out; }
    return [];
  }
  function startMake(mode) { ui.view = "make"; ui.mode = mode; ui.cards = deal(mode); ui.rr = 0; ui.f = {}; ui.lv = mode === "free" ? 3 : Math.min(lvMax(), 3); ui.quiz = { q: "", a: ["", "", ""], c: 0, exp: "" }; ui.to = []; ui.err = ""; }
  function cardsHtml() {
    if (!ui.cards.length) return "";
    return '<div class="cards">' + ui.cards.map(function (c, i) { var K = CARDS[c.k]; return (i ? '<span class="plus" aria-hidden="true">＋</span>' : '') + '<div class="cd' + (c.k === "rule" ? " r" : "") + '" style="animation-delay:' + (i * .12) + 's"><div class="k">' + K.icon + ' ' + K.n + '</div><div class="t">' + esc(c.t) + '</div></div>'; }).join("") + '</div>' +
      '<div style="text-align:center">' + (ui.rr < REROLL_MAX ? '<button type="button" class="mini" data-z="reroll">🔄 引き直す（あと ' + (REROLL_MAX - ui.rr) + '回）</button>' : '<span class="sub">引き直しは おしまい。この カードで 考えて みよう！</span>') + '</div>';
  }
  function makeHtml() {
    var m = ui.mode, head = { mix: "🎲 まぜて つくる", tool: "🧰 どうぐから つくる", quiz: "❓ クイズを つくる", free: "📄 白紙から つくる" }[m];
    var lead = { mix: "この カードを かけあわせた 新しい ゲームを 考えよう。ルールを 1つ かえると おもしろく なるよ。", tool: "この どうぐと ばしょ だけで あそべる ゲームを 考えよう。", quiz: "家族が「うーん」と 考える クイズを 作ろう。答えと わけも 書いてね。", free: "何を 作っても いいよ。ゲーム・クイズ・あそびの ルール・おはなし でも OK。" }[m];
    var h = '<div class="q" style="margin-top:0">' + head + '</div><div class="sub">' + lead + '</div>' + cardsHtml();
    if (m === "quiz") {
      var Q = ui.quiz;
      h += '<label class="f"><span>もんだい</span><textarea data-q="q" rows="2" maxlength="80" placeholder="例：1円玉を 100まい つみ上げると、高さは だいたい どれくらい？">' + esc(Q.q) + '</textarea></label>' +
        [0, 1, 2].map(function (i) { return '<label class="f"><span>えらぶ 答え ' + "アイウ"[i] + (Q.c === i ? '（正解）' : '') + '</span><div style="display:flex;gap:6px"><input type="text" data-qa="' + i + '" maxlength="30" value="' + esc(Q.a[i]) + '" style="flex:1"><button type="button" class="mini" data-z="qc" data-v="' + i + '" aria-pressed="' + (Q.c === i) + '" aria-label="' + "アイウ"[i] + 'を 正解に する">正解</button></div></label>'; }).join("") +
        '<label class="f"><span>答えの わけ</span><textarea data-q="exp" rows="2" maxlength="100" placeholder="例：1円玉 1まいは 約 1.5mm。100まいで 約 15cm">' + esc(Q.exp) + '</textarea></label>';
    } else if (ui.lv === 1) {
      h += FIELDS.map(function (f) { return '<label class="f"><span>' + f[1] + '</span><input type="text" data-f="' + f[0] + '" maxlength="60" placeholder="' + esc(f[2]) + '" value="' + esc(ui.f[f[0]] || "") + '"></label>'; }).join("");
    } else if (ui.lv === 2) {
      h += '<label class="f"><span>ゲームの 名前</span><input type="text" data-f="name" maxlength="30" value="' + esc(ui.f.name || "") + '"></label>' +
        '<div class="sub">ヒントの ことば：' + HINTS.map(function (x) { return '<span class="mini" style="cursor:default;display:inline-block">' + x + '</span>'; }).join("") + '</div>' +
        '<label class="f"><span>ルールと あそび方（自分の ことばで）</span><textarea data-f="text" rows="7" maxlength="400">' + esc(ui.f.text || "") + '</textarea></label>';
    } else {
      h += '<label class="f"><span>名前</span><input type="text" data-f="name" maxlength="30" value="' + esc(ui.f.name || "") + '"></label><label class="f"><span>白紙</span><textarea data-f="text" rows="9" maxlength="400" placeholder="ここに ぜんぶ 自分で 書こう">' + esc(ui.f.text || "") + '</textarea></label>';
    }
    if (m !== "quiz" && m !== "free" && lvMax() > 1) h += '<div class="sub" style="margin-top:4px">書き方：' + [1, 2, 3].filter(function (l) { return l <= lvMax(); }).map(function (l) { return '<button type="button" class="mini" data-z="lv" data-v="' + l + '" aria-pressed="' + (ui.lv === l) + '">Lv' + l + ' ' + ["", "らんを うめる", "ヒントだけ", "白紙"][l] + '</button>'; }).join("") + '</div>';
    h += '<div class="q">だれに 見せる？（あそんで もらおう）</div><div>' + others().map(function (o) { return '<button type="button" class="mini" data-z="to" data-v="' + esc(o) + '" aria-pressed="' + (ui.to.indexOf(o) >= 0) + '">' + esc(o === "papa" ? "パパ" : o) + '</button>'; }).join("") + '</div>' +
      '<div class="sub">名前・住所・学校名は 書かないでね。</div>' + (ui.err ? '<div class="sub" style="color:#dc2626;font-weight:900">' + esc(ui.err) + '</div>' : '') +
      '<button type="button" class="go" data-z="finish">✨ かんせい！</button>';
    return h;
  }
  function readForm() {
    var b = document.getElementById("szk-b"); if (!b) return;
    Array.prototype.forEach.call(b.querySelectorAll("[data-f]"), function (x) { ui.f[x.getAttribute("data-f")] = x.value; });
    Array.prototype.forEach.call(b.querySelectorAll("[data-q]"), function (x) { ui.quiz[x.getAttribute("data-q")] = x.value; });
    Array.prototype.forEach.call(b.querySelectorAll("[data-qa]"), function (x) { ui.quiz.a[+x.getAttribute("data-qa")] = x.value; });
  }
  function finish() {
    readForm();
    var m = ui.mode, w = { id: me() + "-" + Date.now().toString(36), m: m, d: today(), lv: ui.lv, cards: ui.cards.map(function (c) { return c.t; }), to: ui.to.slice(), at: Date.now() };
    if (m === "quiz") {
      var Q = ui.quiz, q = clean(Q.q, 80), a = Q.a.map(function (x) { return clean(x, 30); });
      if (Array.from(q).length < 5 || a.some(function (x) { return !x; })) { ui.err = "もんだいと 3つの 答えを ぜんぶ 書いてね"; return render(); }
      w.quiz = { q: q, a: a, c: Q.c, exp: clean(Q.exp, 100) }; w.f = { name: "クイズ：" + Array.from(q).slice(0, 14).join("") + (Array.from(q).length > 14 ? "…" : "") };
    } else if (ui.lv === 1) {
      w.f = {}; FIELDS.forEach(function (f) { w.f[f[0]] = clean(ui.f[f[0]], 60); });
      if (!w.f.name || !w.f.r1 || !w.f.win) { ui.err = "「名前」「ルール①」「勝ち方」は 書いてね"; return render(); }
    } else {
      w.f = { name: clean(ui.f.name, 30) }; w.text = clean(ui.f.text, 400);
      if (!w.f.name || Array.from(w.text).length < 15) { ui.err = "名前と、ルール（15文字 いじょう）を 書いてね"; return render(); }
    }
    var s = S(); s.works.push(w); s.works = s.works.slice(-WORK_MAX); s.cnt += 1;
    var shards = 0;
    if (s.fd !== today()) { s.fd = today(); shards = window.stickerAddShardsExternal ? window.stickerAddShardsExternal(3, "") : 0; }
    s = S();
    try { if (window.tutorPlanMark) window.tutorPlanMark("sozo"); } catch (e) {}
    log("つくった（" + ({ mix: "まぜる", tool: "どうぐ", quiz: "クイズ", free: "白紙" })[m] + "・Lv" + ui.lv + "）「" + w.f.name + "」" + (w.cards.length ? " カード：" + w.cards.join("＋") : "") + (w.to.length ? " → " + w.to.join("・") : "") + (shards ? "・かけら +" + shards : ""));
    save(); ui.last = w; ui.shards = shards; ui.view = "done"; render(); focusFirst();
  }
  function workHtml(w, opts) {
    opts = opts || {};
    var f = w.f || {};
    return '<div class="work"><h3>' + (w.m === "quiz" ? "❓ " : "🎮 ") + esc(f.name || "") + '</h3>' + (w.cards && w.cards.length ? '<div class="sub">カード：' + w.cards.map(esc).join(" ＋ ") + '</div>' : '') +
      (w.quiz ? (opts.hideAns ? '<div>' + esc(w.quiz.q) + '</div>' : '<div>' + esc(w.quiz.q) + '</div><div class="sub">' + w.quiz.a.map(function (x, i) { return (i === w.quiz.c ? "⭕ " : "・") + esc(x); }).join("　") + '</div>' + (w.quiz.exp ? '<div class="sub">わけ：' + esc(w.quiz.exp) + '</div>' : '')) :
        (w.text ? '<div style="white-space:pre-wrap;font-size:13.5px;font-weight:700;line-height:1.7">' + esc(w.text) + '</div>' : FIELDS.slice(1).filter(function (x) { return f[x[0]]; }).map(function (x) { return '<div style="font-size:13px;font-weight:700"><b style="color:#9a3412">' + x[1] + '：</b>' + esc(f[x[0]]) + '</div>'; }).join(""))) +
      '<div class="sub">' + esc(w.d) + (w.to && w.to.length ? '　→ ' + w.to.map(function (x) { return x === "papa" ? "パパ" : x; }).map(esc).join("・") : '') + (opts.from ? '　つくった 人：' + esc(opts.from === "papa" ? "パパ" : opts.from) : '') + '</div></div>';
  }
  function doneHtml() {
    var w = ui.last;
    return '<div class="fx"><div class="big" aria-hidden="true">🎨✨</div><div class="q" style="text-align:center">かんせい！ あたらしい ' + (w.m === "quiz" ? "クイズ" : "ゲーム") + 'が 生まれたよ</div></div>' + workHtml(w) +
      (ui.shards ? '<div class="q" style="text-align:center">🧩 シールの かけら +' + ui.shards + 'こ</div>' : '') +
      '<div class="sub" style="text-align:center">' + (w.to.length ? "🎮 " + w.to.map(function (x) { return x === "papa" ? "パパ" : x; }).join("・") + " の アプリに とどくよ。あそんで もらえたら ランクが 上がる！" : "だれかに 見せると、あそんで もらえるよ") + '</div>' +
      '<div class="sub" style="text-align:center;margin-top:6px">📓 自学ノートに「自分で 考えた ゲーム」として 書いても いいね</div>' +
      '<button type="button" class="go" data-z="view" data-v="home">工房に もどる</button>';
  }
  function mineHtml() {
    var s = S(), sd = window.saveData, played = sd.sozoPlayedBy || [];
    if (!s.works.length) return '<div class="sub">まだ 作品が ないよ。🎲 から つくって みよう！</div>';
    return s.works.slice().reverse().map(function (w) {
      var ps = played.filter(function (p) { return p.i === w.id; });
      return workHtml(w) + (ps.length ? '<div class="sub" style="margin:-4px 4px 8px">🎮 あそんで もらった：' + ps.map(function (p) { return esc(p.who === "papa" ? "パパ" : p.who) + " " + "⭐".repeat(p.star || 1) + (p.c ? "「" + esc(p.c) + "」" : "") + (p.ok === true ? " 正解" : p.ok === false ? " ざんねん" : ""); }).join("／") + '</div>' : '');
    }).join("");
  }

  /* ---- 家族の 作品（読むだけ）---- */
  function checkFamily() {
    if (!ui || typeof window.postToGAS !== "function") { if (ui) ui.inbox = []; return; }
    ui.inbox = null;
    var my = me(), got = [], playedBy = [], sd = window.saveData;
    others().reduce(function (p, who) {
      return p.then(function () { return window.postToGAS({ action: "LOGIN", playerId: who }); }).then(function (res) {
        var pd = res && res.status === "SUCCESS" ? res.playerData || {} : {};
        var ws = pd.sozo && Array.isArray(pd.sozo.works) ? pd.sozo.works : [];
        ws.forEach(function (w) { if (w && Array.isArray(w.to) && w.to.indexOf(my) >= 0) got.push({ from: who, w: w }); });
        (Array.isArray(pd.sozoPlays) ? pd.sozoPlays : []).forEach(function (pl) { if (pl && pl.by === my) playedBy.push({ i: pl.i, who: who, star: pl.star, c: pl.c, ok: pl.ok, d: pl.d }); });
      }).catch(function (e) { console.warn("[sozo]", who, e); });
    }, Promise.resolve()).then(function () {
      if (!ui) return;
      var mine = (sd.sozo && sd.sozo.works || []).map(function (w) { return w.id; });
      playedBy = playedBy.filter(function (p) { return mine.indexOf(p.i) >= 0 || true; });
      var before = (sd.sozoPlayedBy || []).length;
      sd.sozoPlayedBy = playedBy.slice(-60);
      var news = playedBy.filter(function (p) { var k = p.i + "|" + p.who; if (sd.sozoSeen.indexOf(k) >= 0) return false; sd.sozoSeen.push(k); return true; });
      sd.sozoSeen = sd.sozoSeen.slice(-120);
      if (news.length) { log("あそんで もらった：" + news.map(function (p) { return p.who + "⭐" + (p.star || 1); }).join("・")); }
      if (news.length || before !== playedBy.length) save();
      var playedIds = (sd.sozoPlays || []).map(function (x) { return x.i; });
      ui.inbox = got.sort(function (a, b) { return (b.w.at || 0) - (a.w.at || 0); }).map(function (g) { g.done = playedIds.indexOf(g.w.id) >= 0; return g; });
      if (ui.view === "home" || ui.view === "inbox") render();
      if (news.length) toast("🎮 " + news.length + "つの 作品で あそんで もらえたよ！");
    });
  }
  function inboxHtml() {
    if (ui.inbox === null || ui.inbox === undefined) return '<div class="sub">たしかめて います…</div>';
    if (!ui.inbox.length) return '<div class="sub">まだ とどいて いないよ。家族が つくったら ここに 出るよ。</div>';
    return ui.inbox.map(function (g, i) { return workHtml(g.w, { from: g.from, hideAns: true }) + '<div style="text-align:right;margin:-4px 4px 8px">' + (g.done ? '<span class="sub">✅ あそんだ</span>' : '<button type="button" class="mini" data-z="play" data-v="' + i + '">🎮 ' + (g.w.m === "quiz" ? "とく" : "あそんだ！") + '</button>') + '</div>'; }).join("");
  }
  function playHtml() {
    var g = ui.inbox[ui.pi], w = g.w;
    var h = workHtml(w, { from: g.from, hideAns: !!w.quiz && ui.qa === undefined });
    if (w.quiz && ui.qa === undefined) h += w.quiz.a.map(function (x, i) { return '<button type="button" class="opt" data-z="qa" data-v="' + i + '">' + "アイウ"[i] + '　' + esc(x) + '</button>'; }).join("");
    else {
      if (w.quiz) h += '<div class="q">' + (ui.qa === w.quiz.c ? "⭕ せいかい！" : "おしい！ 正解は「" + esc(w.quiz.a[w.quiz.c]) + "」") + '</div>';
      h += '<div class="q">どうだった？</div><div class="star" role="group" aria-label="星の 数">' + [1, 2, 3].map(function (n) { return '<button type="button" data-z="star" data-v="' + n + '" aria-pressed="' + (ui.star === n) + '" aria-label="星 ' + n + 'こ">' + (ui.star >= n ? "⭐" : "☆") + '</button>'; }).join("") + '</div>' +
        '<label class="f"><span>ひとこと（どこが おもしろかった？ もっと よく するには？）</span><input type="text" id="szk-c" maxlength="40" value="' + esc(ui.cm || "") + '"></label>' +
        '<button type="button" class="go" data-z="sendplay"' + (ui.star ? "" : " disabled") + '>つたえる</button>';
    }
    return h;
  }

  /* ---- 操作 ---- */
  function act(a, v) {
    if (a === "close") return close();
    if (a === "back") { if (ui.view === "make") readForm(); ui.view = ui.view === "play" ? "inbox" : "home"; render(); return focusFirst(); }
    if (a === "view") { ui.view = v; render(); if (v === "home" || v === "inbox") checkFamily(); return focusFirst(); }
    if (a === "new") { startMake(v); render(); return focusFirst(); }
    if (a === "reroll") { readForm(); if (ui.rr >= REROLL_MAX) return; ui.rr += 1; ui.cards = deal(ui.mode); return render(); }
    if (a === "lv") { readForm(); ui.lv = Number(v); return render(); }
    if (a === "to") { readForm(); var i = ui.to.indexOf(v); if (i >= 0) ui.to.splice(i, 1); else ui.to.push(v); return render(); }
    if (a === "qc") { readForm(); ui.quiz.c = Number(v); return render(); }
    if (a === "finish") return finish();
    if (a === "play") { ui.pi = Number(v); ui.qa = undefined; ui.star = 0; ui.cm = ""; ui.view = "play"; render(); return focusFirst(); }
    if (a === "qa") { ui.qa = Number(v); return render(); }
    if (a === "star") { var c = document.getElementById("szk-c"); if (c) ui.cm = c.value; ui.star = Number(v); return render(); }
    if (a === "sendplay") {
      var g = ui.inbox[ui.pi], cm = document.getElementById("szk-c"); if (!g || !ui.star) return;
      var sd = window.saveData; S();
      var rec = { i: g.w.id, by: g.from, star: ui.star, c: clean(cm ? cm.value : ui.cm, 40), d: today() };
      if (g.w.quiz) rec.ok = ui.qa === g.w.quiz.c;
      sd.sozoPlays = sd.sozoPlays.filter(function (x) { return x.i !== rec.i; }).concat([rec]).slice(-60);
      log("あそんだ ← " + g.from + "「" + ((g.w.f || {}).name || "") + "」" + "⭐".repeat(rec.star) + (rec.c ? "「" + rec.c + "」" : ""));
      save(); g.done = true; ui.view = "inbox"; render(); toast("🎮 つたえたよ！ " + (g.from === "papa" ? "パパ" : g.from) + " の ランクが 上がるよ"); return focusFirst();
    }
  }
  function toast(t) {
    var el = document.createElement("div"); el.setAttribute("role", "status");
    el.style.cssText = "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:10004;background:#7c2d12;color:#fff;border:2px solid #fdba74;border-radius:16px;padding:9px 16px;font:900 13px 'Zen Maru Gothic',sans-serif;max-width:88vw;text-align:center";
    el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 3600);
  }

  /* ---- ホームの タイル ---- */
  function addTile() {
    if (document.getElementById("szk-tile")) return;
    var grids = document.querySelectorAll(".container .tile-grid"); if (!grids.length) return;
    var b = document.createElement("button"); b.className = "tile"; b.id = "szk-tile"; b.type = "button";
    b.innerHTML = '<span class="ti">🎨</span>そうぞう工房<small>ゲームを つくろう</small>';
    b.onclick = function () { open("home"); };
    var ref = document.getElementById("tos-tile"); grids[0].insertBefore(b, ref ? ref.nextSibling : (grids[0].children[2] || null));
  }
  setInterval(function () { try { addTile(); } catch (e) {} }, 1200);
  window.SOZO_DATA = { cards: CARDS, ranks: RANKS };
})();
