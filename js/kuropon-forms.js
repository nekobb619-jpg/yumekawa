/* =====================================================================
   js/kuropon-forms.js — 🐱✨ クロぽんの へんしん（なかよし度で 変身・げんてい シール）
   ★2026-10-30追加（保護者：ごはんで なかよし度が 上がったら 特別な 宝に。シールも ふえたので つなげたい。キラキラ・変身の UX）
   ・なかよし度 25／50／75／100 に はじめて とどくと、クロぽんが へんしん（光る → くるっと 回る → フラッシュ → 新しい すがた）。
     その すがたの げんてい シール（★4・ふくろからは 出ない）を 1まい もらえる（js/sticker-book.js の stickerGrantLimited）。
   ・いちど なった すがたは なかよし度が 下がっても きえない。へやの「✨ へんしん」から すきな すがたを えらべる。
   ・ごはんクイズ ぜんもん 正解 → シールの かけら ＋（問題数）。1日の 上限は ステージと 共通。
   ・saveData.kuroPonForms = { got: { kp_moon: "2026-10-30", … }, cur: "kp_moon" | "" }
   ・へやの クロぽんは えらんだ すがたの 絵（js/sticker-book.js の stickerSvg）。気分は 右上の 小さな 絵文字で 出す。
   ・動きを へらす 設定（prefers-reduced-motion）の ときは アニメーション なしで 結果だけ 出す。
   ===================================================================== */
(function () {
  var FORMS = [
    { id: "kp_moon", at: 25, name: "つきよの クロぽん", desc: "よぞらの マフラーを まいた クロぽん。みかづきが いっしょに ついてくる。", c1: "#1e3a8a", c2: "#fde68a" },
    { id: "kp_majo", at: 50, name: "まほうつかい クロぽん", desc: "ほしの つえを もった クロぽん。まちがいも まほうで「のびる チャンス」に かえちゃう。", c1: "#4c1d95", c2: "#fbbf24" },
    { id: "kp_angel", at: 75, name: "てんしの クロぽん", desc: "はねと わっかの クロぽん。がんばった 日には そっと そばに いてくれる。", c1: "#7dd3fc", c2: "#ffffff" },
    { id: "kp_king", at: 100, name: "おうさまの クロぽん", desc: "なかよし度 100 の あかし。おうかんと マントの クロぽん。ほんとうの 大親友。", c1: "#dc2626", c2: "#fde68a" }
  ];
  var BY = {}; FORMS.forEach(function (f) { BY[f.id] = f; });
  var RM = false; try { RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function today() { var x = new Date(window.currentServerTime || Date.now()); return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate(); }
  function st() {
    var sd = window.saveData; if (!sd) return null;
    if (!sd.kuroPonForms || typeof sd.kuroPonForms !== "object") sd.kuroPonForms = { got: {}, cur: "" };
    if (!sd.kuroPonForms.got || typeof sd.kuroPonForms.got !== "object") sd.kuroPonForms.got = {};
    return sd.kuroPonForms;
  }
  function art(id, px) { return window.stickerSvg ? window.stickerSvg(id, px) : ""; }
  function plainCat(px) { return art("cat_sit", px); }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🐱クロぽんの へんしん", msg: msg }); } catch (e) {} }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var CSS =
    '.kpf-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0 10px}' +
    '.kpf-b{position:relative;border:2px solid #f9a8d4;background:#fff;border-radius:14px;padding:3px 3px 2px;min-width:56px;min-height:56px;cursor:pointer;font:900 9.5px "Zen Maru Gothic",sans-serif;color:#9d174d;line-height:1.2}' +
    '.kpf-b svg{display:block;margin:0 auto}.kpf-b[aria-pressed="true"]{border-color:#db2777;box-shadow:0 0 0 3px #fbcfe8;background:linear-gradient(160deg,#fff,#fdf2f8)}' +
    '.kpf-b.lock{cursor:default;color:#94a3b8;border-color:#e2e8f0;background:#f8fafc}.kpf-b.lock svg{filter:brightness(0) opacity(.18)}' +
    '.kpf-b:focus-visible{outline:3px solid #7c3aed;outline-offset:2px}' +
    '.kpf-room{display:inline-block;position:relative;line-height:0}.kpf-room svg{width:120px;height:120px;filter:drop-shadow(0 6px 12px rgba(236,72,153,.45))}' +
    '.kpf-mood{position:absolute;right:-6px;top:-4px;font-size:26px;line-height:1}' +
    '.kpf-room.on::after{content:"";position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,rgba(253,230,138,.45),transparent 65%);animation:kpfAura 2.4s ease-in-out infinite;pointer-events:none;z-index:-1}' +
    '@keyframes kpfAura{0%,100%{transform:scale(.9);opacity:.6}50%{transform:scale(1.08);opacity:1}}' +
    '.kpf-swap{animation:kpfSwap .7s ease-in-out}@keyframes kpfSwap{0%{transform:rotateY(0) scale(1);filter:brightness(1)}50%{transform:rotateY(540deg) scale(1.15);filter:brightness(2.4)}100%{transform:rotateY(720deg) scale(1);filter:brightness(1)}}' +
    // へんしん カットイン
    '#kpf-fx{position:fixed;inset:0;z-index:10010;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;background:radial-gradient(circle at 50% 40%,var(--c1),#1f1b2e 60%,#07050d);font-family:"Zen Maru Gothic",sans-serif;overflow:hidden}' +
    '#kpf-fx .stage{position:relative;width:240px;height:240px}' +
    '#kpf-fx .old,#kpf-fx .new{position:absolute;left:50%;top:50%;line-height:0}#kpf-fx .old svg,#kpf-fx .new svg{width:170px;height:170px}' +
    '#kpf-fx .old{transform:translate(-50%,-50%);animation:kpfCharge 1.5s ease-in forwards}' +
    '@keyframes kpfCharge{0%{transform:translate(-50%,-50%) rotateY(0);filter:brightness(1) drop-shadow(0 0 0 #fff)}55%{filter:brightness(1.6) drop-shadow(0 0 18px var(--c2))}100%{transform:translate(-50%,-50%) rotateY(1440deg) scale(.6);filter:brightness(6) drop-shadow(0 0 40px #fff);opacity:0}}' +
    '#kpf-fx .new{transform:translate(-50%,-50%) scale(0);animation:kpfPop .7s cubic-bezier(.2,1.6,.4,1) 1.75s forwards;filter:drop-shadow(0 0 22px var(--c2))}' +
    '@keyframes kpfPop{to{transform:translate(-50%,-50%) scale(1)}}' +
    '#kpf-fx .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;animation:kpfFlash .8s ease-out 1.45s forwards}@keyframes kpfFlash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}' +
    '#kpf-fx .ring{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px;border-radius:50%;border:5px solid var(--c2);box-shadow:0 0 30px var(--c2);opacity:0;animation:kpfRing 1s ease-out 1.6s forwards}@keyframes kpfRing{0%{transform:scale(.2);opacity:1}100%{transform:scale(7);opacity:0}}' +
    '#kpf-fx .p{position:absolute;left:50%;top:50%;font-size:16px;line-height:1;color:var(--c2);text-shadow:0 0 6px #fff;opacity:0;animation:kpfUp 1.4s ease-out forwards}' +
    '@keyframes kpfUp{0%{transform:translate(var(--x),60px) scale(.4);opacity:0}30%{opacity:1}100%{transform:translate(var(--x),-120px) scale(1);opacity:0}}' +
    '#kpf-fx .burst{position:absolute;left:50%;top:50%;font-size:20px;line-height:1;opacity:0;animation:kpfBurst 1.1s ease-out 1.75s forwards}' +
    '@keyframes kpfBurst{0%{transform:translate(-50%,-50%) scale(.3);opacity:1}100%{transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(1.1) rotate(200deg);opacity:0}}' +
    '#kpf-fx .txt{text-align:center;color:#fff;opacity:0;animation:kpfFade .5s ease-out 2.3s forwards;max-width:330px}@keyframes kpfFade{to{opacity:1}}' +
    '#kpf-fx .t1{font-size:14px;font-weight:900;color:var(--c2);letter-spacing:.06em}#kpf-fx .t2{font-size:22px;font-weight:900;margin:2px 0 4px}#kpf-fx .t3{font-size:12.5px;font-weight:700;color:#f5d0fe;line-height:1.7}' +
    '#kpf-fx .gift{display:flex;align-items:center;gap:8px;justify-content:center;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.3);border-radius:16px;padding:6px 10px;margin:10px auto 12px;font-size:12.5px;font-weight:900;color:#fde68a}' +
    '#kpf-fx button{border:none;border-radius:999px;padding:12px 26px;min-height:48px;font:900 15px "Zen Maru Gothic";color:#fff;background:linear-gradient(135deg,#7c3aed,#db2777);box-shadow:0 4px 0 #4c1d95;cursor:pointer}#kpf-fx button:focus-visible{outline:3px solid #fde68a;outline-offset:3px}' +
    '@media (prefers-reduced-motion:reduce){#kpf-fx .old,#kpf-fx .flash,#kpf-fx .ring,#kpf-fx .p,#kpf-fx .burst{display:none}#kpf-fx .new{animation:none;transform:translate(-50%,-50%)}#kpf-fx .txt{animation:none;opacity:1}.kpf-room.on::after,.kpf-swap{animation:none}}';
  function css() { if (document.getElementById("kpf-css")) return; var s = document.createElement("style"); s.id = "kpf-css"; s.textContent = CSS; document.head.appendChild(s); }

  /* ---- へんしん カットイン ---- */
  var queue = [], showing = false;
  function playNext() {
    if (showing || !queue.length) return;
    showing = true; css();
    var f = queue.shift(), s = st(), prev = (s && s.cur && BY[s.cur]) ? art(s.cur, 170) : plainCat(170);
    var gotSticker = window.stickerGrantLimited ? window.stickerGrantLimited(f.id) : false;
    var w = document.createElement("div"); w.id = "kpf-fx";
    w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "kpf-t2");
    w.style.setProperty("--c1", f.c1); w.style.setProperty("--c2", f.c2);
    var parts = "";
    for (var i = 0; i < 14; i++) parts += '<i class="p" style="--x:' + (Math.round(Math.random() * 220) - 110) + 'px;animation-delay:' + (i * 0.08).toFixed(2) + 's">' + (i % 3 ? "✦" : "♡") + '</i>';
    for (var j = 0; j < 12; j++) { var a = j / 12 * Math.PI * 2; parts += '<i class="burst" style="--x:' + Math.round(Math.cos(a) * 130) + 'px;--y:' + Math.round(Math.sin(a) * 130) + 'px">' + ["⭐", "✨", "💖"][j % 3] + '</i>'; }
    w.innerHTML = '<div class="stage" aria-hidden="true"><span class="old">' + prev + '</span>' + parts + '<span class="ring"></span><span class="new">' + art(f.id, 170) + '</span></div><div class="flash" aria-hidden="true"></div>' +
      '<div class="txt"><div class="t1">✨ なかよし度 ' + f.at + ' ✨</div><div class="t2" id="kpf-t2">クロぽんが へんしん した！</div>' +
      '<div class="t2" style="font-size:18px;color:' + f.c2 + '">「' + esc(f.name) + '」</div><div class="t3">' + esc(f.desc) + '</div>' +
      (gotSticker ? '<div class="gift">' + art(f.id, 40) + '<span>🎀 げんてい シール「' + esc(f.name) + '」を ゲット！</span></div>' : '<div style="height:12px"></div>') +
      '<button type="button" id="kpf-ok">やったにゃ！</button></div>';
    document.body.appendChild(w);
    s = st(); // ★ saveGame は saveData を つくり直すので、シールを わたした あとで とり直す
    if (s) { s.got[f.id] = s.got[f.id] || today(); s.cur = f.id; save(); }
    log("へんしん：" + f.name + "（なかよし度 " + f.at + "）" + (gotSticker ? "・げんてい シール" : ""));
    if (window.speakText) { try { window.speakText("クロぽんが へんしん した！ " + f.name.replace(/ /g, ""), "ja-JP"); } catch (e) {} }
    var ok = document.getElementById("kpf-ok");
    setTimeout(function () { try { ok.focus(); } catch (e) {} }, RM ? 50 : 2400);
    var done = function () { w.remove(); showing = false; renderRoom(); if (queue.length) setTimeout(playNext, 300); };
    ok.onclick = done;
    w.addEventListener("keydown", function (e) { if (e.key === "Escape") done(); if (e.key === "Tab") { e.preventDefault(); ok.focus(); } });
  }
  function checkUnlock() {
    var s = st(); if (!s) return;
    var fr = Number(window.saveData.kuroPonFriendship || 0);
    FORMS.forEach(function (f) { if (fr >= f.at && !s.got[f.id] && !queue.some(function (q) { return q.id === f.id; })) queue.push(f); });
    if (queue.length) setTimeout(playNext, 700);
  }

  /* ---- へやの 表示 ---- */
  function moodEmoji() { var sd = window.saveData || {}, h = sd.kuroPonHunger || 0, f = sd.kuroPonFriendship || 0; return h <= 0 ? "😿" : f >= 80 ? "😻" : f >= 50 ? "😺" : h <= 30 ? "🙀" : ""; }
  function renderRoom() {
    try {
      var s = st(); if (!s) return; css();
      var ch = document.getElementById("kuropon-char-el");
      if (ch) {
        if (s.cur && BY[s.cur] && s.got[s.cur]) { ch.innerHTML = '<span class="kpf-room on" role="img" aria-label="' + BY[s.cur].name + '">' + art(s.cur, 120) + '<span class="kpf-mood" aria-hidden="true">' + moodEmoji() + '</span></span>'; ch.style.fontSize = "0"; }
        else ch.style.fontSize = "";
      }
      var fl = document.getElementById("kuropon-friendship-label"); if (!fl) return;
      var row = document.getElementById("kpf-row");
      if (!row) {
        var h = document.createElement("div"); h.id = "kpf-head"; h.style.cssText = "font-size:11.5px;font-weight:900;color:#db2777;margin:6px 0 0";
        h.textContent = "✨ クロぽんの へんしん（なかよし度で ふえるよ）";
        row = document.createElement("div"); row.id = "kpf-row"; row.className = "kpf-row"; row.setAttribute("role", "group"); row.setAttribute("aria-labelledby", "kpf-head");
        fl.parentNode.insertBefore(h, fl.nextSibling); h.parentNode.insertBefore(row, h.nextSibling);
        row.addEventListener("click", function (e) {
          var b = e.target.closest("[data-kpf]"); if (!b || b.classList.contains("lock")) return;
          var id = b.getAttribute("data-kpf"), s2 = st(); if (!s2) return;
          s2.cur = id === "none" ? "" : id; save(); renderRoom();
          var c = document.querySelector("#kuropon-char-el .kpf-room") || document.getElementById("kuropon-char-el");
          if (c && !RM) { c.classList.remove("kpf-swap"); void c.offsetWidth; c.classList.add("kpf-swap"); }
        });
      }
      var fr = Number(window.saveData.kuroPonFriendship || 0);
      row.innerHTML = '<button type="button" class="kpf-b" data-kpf="none" aria-pressed="' + !s.cur + '" aria-label="いつもの クロぽん">' + plainCat(40) + 'いつもの</button>' +
        FORMS.map(function (f) {
          var got = !!s.got[f.id];
          return '<button type="button" class="kpf-b' + (got ? "" : " lock") + '" data-kpf="' + f.id + '" aria-pressed="' + (s.cur === f.id) + '"' + (got ? "" : ' aria-disabled="true"') +
            ' aria-label="' + (got ? f.name : "まだ ひみつの すがた。なかよし度 " + f.at + "で へんしん") + '">' + art(f.id, 40) + (got ? f.name.replace(/の クロぽん| クロぽん/, "") : "🔒" + f.at) + '</button>';
        }).join("");
      var nx = FORMS.filter(function (f) { return !s.got[f.id]; })[0];
      var note = document.getElementById("kpf-note");
      if (!note) { note = document.createElement("div"); note.id = "kpf-note"; note.style.cssText = "font-size:10.5px;font-weight:800;color:#9d174d;margin:-4px 0 8px"; row.parentNode.insertBefore(note, row.nextSibling); }
      note.textContent = nx ? "つぎの へんしんまで なかよし度 あと " + Math.max(0, nx.at - fr) + "（へんしんすると げんてい シールが もらえるよ）" : "ぜんぶの すがたに へんしん できたよ！ 大親友にゃ♡";
    } catch (e) { console.error("kuropon-forms", e); }
  }

  /* ---- つなぐ ---- */
  function wrap(name, before, after) {
    var o = window[name]; if (typeof o !== "function" || o._kpfWrapped) return !!(o && o._kpfWrapped);
    var w = function () { var pre; try { if (before) pre = before.apply(this, arguments); } catch (e) {} var r = o.apply(this, arguments); try { if (after) after.call(this, pre); } catch (e) {} return r; };
    w._kpfWrapped = true; window[name] = w; return true;
  }
  function install() {
    var a = wrap("updateKuroPonModal", null, function () { renderRoom(); checkUnlock(); });
    // ごはんクイズ ぜんもん 正解 → かけら（問題数ぶん）
    var b = wrap("kqConfirm", function () {
      var food = window._kqCurrentFood; if (!food || !window.stickerAddShardsExternal) return;
      var n = window.stickerAddShardsExternal(food.questionCount || 1, "");
      if (n > 0) setTimeout(function () { if (window.showToast) window.showToast("🧩 シールの かけら +" + n + "こ（ごはんクイズ 正解）", "success"); }, 600);
      log("ごはんクイズ 正解（" + food.name + "）→ かけら +" + n);
    }, null);
    return a && b;
  }
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
  window.KUROPON_FORMS = FORMS;
  window.kuroponFormsReplay = function (id) { if (BY[id]) { queue.push(BY[id]); playNext(); } };
})();
