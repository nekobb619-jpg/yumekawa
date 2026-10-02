/* =====================================================================
   mascots.js — 「まなびの なかま」（オリジナルSVGイラストのキャラクター）
   ★2026-10-02追加（ホーム改革）
   - きょうのまなびプラン（js/tutor-plan.js）を やりきった回数（saveData.tutorPlanDoneCount）で なかまが ふえる
   - えらんだ なかま（saveData.selectedFriend）が、プランカードで クロぽん先生の となりに 出てくる
   - 1ぴきずつ「ひみつ（ほんとうの 豆ちしき）」つき。ユニコーン以外は じっさいの 生き物の 事実だけを書く
   - 既存キャラクター（他社の著作物）は使わない。名前もオリジナル
   ===================================================================== */
(function () {
  "use strict";

  function eyes(mood, lx, rx, y, r, col) {
    col = col || "#2b2135";
    if (mood === "happy" || mood === "cheer") {
      var w = r * 1.4;
      return '<path d="M' + (lx - w) + ' ' + y + ' q' + w + ' ' + (-r * 1.5) + ' ' + (w * 2) + ' 0 M' + (rx - w) + ' ' + y + ' q' + w + ' ' + (-r * 1.5) + ' ' + (w * 2) + ' 0" fill="none" stroke="' + col + '" stroke-width="' + Math.max(1.6, r * 0.7) + '" stroke-linecap="round"/>';
    }
    return '<circle cx="' + lx + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/><circle cx="' + rx + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>' +
      '<circle cx="' + (lx + r * 0.35) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.38) + '" fill="#fff"/><circle cx="' + (rx + r * 0.35) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.38) + '" fill="#fff"/>';
  }
  function sparkle(mood, x, y) {
    if (mood !== "cheer") return "";
    return '<path d="M' + x + ' ' + (y - 6) + ' l1.6 3.4 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5z" fill="#fde047"/>';
  }
  function open(id, label) {
    return '<svg class="c-buddy" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '">';
  }

  // しまえなが「ゆきんこ」：まっしろで まんまるの お顔、つぶらな 目、黒い つばさ と 長い しっぽ
  function yukinko(mood) {
    return open("yk", "ゆきんこ") +
      '<defs><radialGradient id="ykB" cx="44%" cy="36%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#fbf8fb"/><stop offset="1" stop-color="#ece2ea"/></radialGradient></defs>' +
      '<ellipse cx="30" cy="61" rx="18" ry="2.6" fill="#a855f7" opacity=".12"/>' +
      // 長い しっぽ（うしろ）
      '<path d="M46 44 Q58 50 63 60 Q60 61 57 59 Q52 52 43 49z" fill="#2b2135"/>' +
      '<path d="M48 46 Q56 51 60 57" fill="none" stroke="#fff" stroke-width="1.1" opacity=".55" stroke-linecap="round"/>' +
      // からだ（ふわふわ）
      '<path d="M8 38 Q6 16 30 14 Q54 16 52 38 Q52 58 30 58 Q8 58 8 38z" fill="url(#ykB)" stroke="#eee3ec" stroke-width="1.4"/>' +
      '<path d="M27 14.5 q1.5 -3.5 3 -1 q1.5 -3 3 0.5" fill="none" stroke="#eee3ec" stroke-width="1.4" stroke-linecap="round"/>' +
      // 黒い つばさ（両わき）と うすい ピンクの せなか
      '<path d="M45 40 Q53 44 50 54 Q45 53 43 47z" fill="#3b3042"/>' +
      '<path d="M15 40 Q7 44 10 54 Q15 53 17 47z" fill="#3b3042"/>' +
      '<path d="M46 43 Q50 47 48.5 51" fill="none" stroke="#e8c9d9" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M14 43 Q10 47 11.5 51" fill="none" stroke="#e8c9d9" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>' +
      eyes(mood, 23, 37, 33, 2.1) +
      '<path d="M28.6 36.4 L31.4 36.4 L30 38.6z" fill="#2b2135"/>' +
      '<ellipse cx="19" cy="39" rx="3.4" ry="2.1" fill="#f9a8d4" opacity=".75"/><ellipse cx="41" cy="39" rx="3.4" ry="2.1" fill="#f9a8d4" opacity=".75"/>' +
      '<path d="M25 57 v4 M35 57 v4" stroke="#6b5a74" stroke-width="1.6" stroke-linecap="round"/>' +
      sparkle(mood, 54, 14) + '</svg>';
  }

  // ゴマフアザラシの赤ちゃん「ぽてまる」：ふわふわの 白い うぶ毛、まっくろ おめめ
  function potemaru(mood) {
    return open("pm", "ぽてまる") +
      '<defs><radialGradient id="pmB" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".85" stop-color="#f3f1f5"/><stop offset="1" stop-color="#dcd7e2"/></radialGradient></defs>' +
      '<ellipse cx="32" cy="61" rx="24" ry="2.6" fill="#a855f7" opacity=".12"/>' +
      '<path d="M50 50 Q62 46 61 56 Q56 58 48 56z" fill="#ebe7ef" stroke="#d6cfdd" stroke-width="1.4"/>' +
      '<ellipse cx="30" cy="40" rx="26" ry="20" fill="url(#pmB)" stroke="#e1dbe7" stroke-width="1.6"/>' +
      '<ellipse cx="9" cy="50" rx="6" ry="3.4" fill="#ebe7ef" stroke="#d6cfdd" stroke-width="1.2" transform="rotate(-25 9 50)"/>' +
      '<circle cx="44" cy="30" r="1.1" fill="#cbc3d4"/><circle cx="48" cy="36" r="1" fill="#cbc3d4"/><circle cx="16" cy="28" r="1" fill="#cbc3d4"/>' +
      (mood === "happy" || mood === "cheer" ? eyes(mood, 21, 37, 37, 2.6) :
        '<circle cx="21" cy="36" r="4" fill="#1f1828"/><circle cx="37" cy="36" r="4" fill="#1f1828"/>' +
        '<circle cx="22.6" cy="34.2" r="1.6" fill="#fff"/><circle cx="38.6" cy="34.2" r="1.6" fill="#fff"/><circle cx="19.8" cy="37.6" r=".7" fill="#fff"/><circle cx="35.8" cy="37.6" r=".7" fill="#fff"/>') +
      '<ellipse cx="29" cy="42.5" rx="2.6" ry="1.8" fill="#2b2135"/>' +
      '<path d="M26.5 45 q2.5 2.2 5 0" fill="none" stroke="#2b2135" stroke-width="1.3" stroke-linecap="round"/>' +
      '<circle cx="24" cy="44" r=".7" fill="#9b8fa6"/><circle cx="23" cy="46" r=".7" fill="#9b8fa6"/><circle cx="34" cy="44" r=".7" fill="#9b8fa6"/><circle cx="35" cy="46" r=".7" fill="#9b8fa6"/>' +
      '<ellipse cx="14" cy="43" rx="3.6" ry="2.2" fill="#f9a8d4" opacity=".75"/><ellipse cx="44" cy="43" rx="3.6" ry="2.2" fill="#f9a8d4" opacity=".75"/>' +
      sparkle(mood, 54, 16) + '</svg>';
  }

  // シャチ「くろしお」：まるっこい 黒と白、目の上の 白い もよう
  function kuroshio(mood) {
    return open("ks", "くろしお") +
      '<defs><radialGradient id="ksB" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#4a4258"/><stop offset="1" stop-color="#1c1724"/></radialGradient></defs>' +
      '<ellipse cx="30" cy="61" rx="22" ry="2.6" fill="#38bdf8" opacity=".18"/>' +
      '<path d="M48 40 Q58 34 62 26 Q60 36 63 44 Q56 42 50 46z" fill="#2b2135"/>' +
      '<path d="M26 18 Q30 4 36 6 Q34 12 36 20z" fill="#2b2135"/>' +
      '<ellipse cx="30" cy="38" rx="24" ry="20" fill="url(#ksB)"/>' +
      '<path d="M10 44 Q18 58 34 56 Q46 54 50 44 Q40 50 30 50 Q18 50 10 44z" fill="#fff"/>' +
      '<ellipse cx="17" cy="30" rx="6" ry="3.4" fill="#fff" transform="rotate(-12 17 30)"/>' +
      '<ellipse cx="42" cy="30" rx="6" ry="3.4" fill="#fff" transform="rotate(12 42 30)"/>' +
      '<ellipse cx="20" cy="20" rx="7" ry="2.6" fill="#fff" opacity=".15" transform="rotate(-20 20 20)"/>' +
      eyes(mood, 20, 38, 38, 2.3, "#fff") +
      '<path d="M25 44 q4 3.4 8 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' +
      '<ellipse cx="13" cy="42" rx="3.4" ry="2" fill="#f9a8d4" opacity=".85"/><ellipse cx="45" cy="42" rx="3.4" ry="2" fill="#f9a8d4" opacity=".85"/>' +
      '<path d="M8 46 Q2 52 6 56 Q10 52 12 48z" fill="#2b2135"/>' +
      sparkle(mood, 52, 14) + '</svg>';
  }

  // ユニコーン「ゆめりん」：にじいろの たてがみ と 金の つの
  function yumerin(mood) {
    return open("yr", "ゆめりん") +
      '<defs><linearGradient id="yrH" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#fef08a"/></linearGradient>' +
      '<radialGradient id="yrB" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f5ecf7"/></radialGradient></defs>' +
      '<ellipse cx="32" cy="61" rx="20" ry="2.6" fill="#a855f7" opacity=".12"/>' +
      '<path d="M44 20 Q60 22 56 40 Q60 50 50 54 Q54 44 46 40z" fill="#c4b5fd"/>' +
      '<path d="M44 22 Q56 26 52 40 Q54 46 48 50 Q50 42 44 38z" fill="#f9a8d4"/>' +
      '<path d="M44 26 Q50 30 48 38 Q46 34 42 34z" fill="#93c5fd"/>' +
      '<path d="M26 16 L30 1 L34 16z" fill="url(#yrH)" stroke="#f59e0b" stroke-width="1"/>' +
      '<path d="M27.4 12 L32.8 10 M28.4 7.6 L31.8 6.4" stroke="#f59e0b" stroke-width="1" stroke-linecap="round"/>' +
      '<path d="M16 22 L13 10 L23 17z" fill="url(#yrB)" stroke="#e5d3e6" stroke-width="1.4"/><path d="M16.5 19 L15 13 L20 17z" fill="#fbcfe8"/>' +
      '<ellipse cx="30" cy="36" rx="20" ry="19" fill="url(#yrB)" stroke="#e5d3e6" stroke-width="1.6"/>' +
      '<path d="M20 18 Q30 12 40 18 Q34 20 30 26 Q26 20 20 18z" fill="#f9a8d4"/>' +
      '<path d="M24 18 Q30 15 36 18 Q32 19 30 22 Q28 19 24 18z" fill="#c4b5fd"/>' +
      '<ellipse cx="30" cy="47" rx="7.5" ry="4.6" fill="#fdf0f7"/>' +
      '<ellipse cx="27.6" cy="46.2" rx=".8" ry=".5" fill="#e8a5c6"/><ellipse cx="32.4" cy="46.2" rx=".8" ry=".5" fill="#e8a5c6"/>' +
      eyes(mood, 22, 38, 35, 2.4) +
      '<ellipse cx="15" cy="41" rx="3.4" ry="2" fill="#f9a8d4" opacity=".8"/><ellipse cx="45" cy="41" rx="3.4" ry="2" fill="#f9a8d4" opacity=".8"/>' +
      '<path d="M28 49.6 q2 1.8 4 0" fill="none" stroke="#2b2135" stroke-width="1.2" stroke-linecap="round"/>' +
      sparkle(mood, 10, 10) + '</svg>';
  }

  var FRIENDS = [
    { id: "mochikko", name: "もちっこ", need: 0, svg: function (m) { return window.TUTOR_CHARA ? window.TUTOR_CHARA.buddySvg(m) : ""; },
      kind: "おもちの ようせい", secret: "こまった ときは いっしょに 考えて くれる、さいしょの なかま。" },
    { id: "yukinko", name: "ゆきんこ", need: 1, svg: yukinko,
      kind: "シマエナガ", secret: "北海道に すむ 小鳥。体重は 約8g で、1円玉（1まい 1g）8まいぶんくらいの かるさ。" },
    { id: "potemaru", name: "ぽてまる", need: 3, svg: potemaru,
      kind: "ゴマフアザラシの 赤ちゃん", secret: "白い うぶ毛で 生まれ、数週間で 大人と 同じ ゴマもようの 毛に 生えかわる。" },
    { id: "kuroshio", name: "くろしお", need: 6, svg: kuroshio,
      kind: "シャチ", secret: "魚では なく クジラの なかま（ほにゅう類）。肺で 息を するので、海面に 出て 息つぎを する。" },
    { id: "yumerin", name: "ゆめりん", need: 10, svg: yumerin,
      kind: "ユニコーン（想像の 生き物）", secret: "「ユニ」は「1つ」という 意味。1本の つの を もつ 馬、という 名前なんだ。" }
  ];

  function doneCount() { return (window.saveData && window.saveData.tutorPlanDoneCount) || 0; }
  function isUnlocked(f) { return doneCount() >= f.need; }
  function current() {
    var sel = window.saveData && window.saveData.selectedFriend;
    var f = FRIENDS.filter(function (x) { return x.id === sel && isUnlocked(x); })[0];
    return f || FRIENDS[0];
  }

  window.MASCOTS = {
    list: FRIENDS,
    currentSvg: function (mood) { return current().svg(mood || "normal"); },
    currentName: function () { return current().name; },
    // 回数が ふえた ときに 新しく なかまに なった子（なければ null）
    newlyUnlockedAt: function (count) { return FRIENDS.filter(function (f) { return f.need === count && f.need > 0; })[0] || null; }
  };

  window.selectFriend = function (id) {
    var f = FRIENDS.filter(function (x) { return x.id === id; })[0];
    if (!f || !isUnlocked(f) || !window.saveData) return;
    window.saveData.selectedFriend = id;
    if (window.saveGame) window.saveGame();
    var chara = document.getElementById("tplan-chara"); if (chara) chara.removeAttribute("data-mood");
    if (window.renderTutorPlan) window.renderTutorPlan();
    window.openFriendsModal();
  };

  /* ---------------- 問題を解く画面での リアクション ★2026-10-02追加 ----------------
     えらんだ なかまが、正解・まちがい・「わからない」に その場で こたえる。
     画面の 進み方（つぎへ進む・選択肢）は いっさい 止めない（見た目だけ）。 */
  var FAST_MS = 2500;      // これより速い 正解は「はやい！読めた？」と 声かけ（止めはしない）
  var LONG_Q_CHARS = 40;   // 声かけするのは、ある程度 長い 問題だけ
  var LINES = {
    correct: ["やったね！", "せいかい！ すごい！", "ちゃんと 考えたね！", "いいね、そのちょうし！", "かんぺき〜！"],
    retry: ["まちがえたあと とけたね！ それが 力に なるよ", "あきらめなかったね！", "考えなおせたの、えらい！"],
    wrong: ["だいじょうぶ！ もういちど 考えよう", "まちがえたけど、いま 気づけて よかった！", "おしい！ ヒントを 見てみよう", "ここが のびる ところだよ"],
    skip: ["「わからない」って 言えるの えらい！", "解説を いっしょに 読もう", "つぎに 会ったら とけるよ"],
    fast: ["はやい！ 問題も しっかり 読めたかな？👀"]
  };
  var gb = { streak: 0, timer: null };
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function ensureGameBuddy() {
    var box = document.querySelector("#game-screen .navi-box");
    if (!box) return null;
    var el = document.getElementById("game-buddy");
    if (!el) {
      el = document.createElement("div");
      el.id = "game-buddy";
      el.className = "game-buddy";
      el.innerHTML = '<div class="gb-art"></div><div class="gb-say" id="game-buddy-say"></div>';
      box.appendChild(el);
    }
    return el;
  }
  function react(kind, text) {
    var el = ensureGameBuddy(); if (!el) return;
    var mood = (kind === "correct" || kind === "retry" || kind === "streak") ? "cheer" : "normal";
    el.querySelector(".gb-art").innerHTML = current().svg(mood);
    el.classList.remove("gb-jump", "gb-shake");
    void el.offsetWidth; // アニメーションを毎回 さいしょから
    if (mood === "cheer") el.classList.add("gb-jump");
    else if (kind === "wrong") el.classList.add("gb-shake");
    var say = el.querySelector(".gb-say");
    if (text) {
      say.textContent = text;
      say.className = "gb-say show" + (kind === "wrong" ? " gb-wrong" : "");
      clearTimeout(gb.timer);
      gb.timer = setTimeout(function () { say.className = "gb-say"; }, 2600);
    }
  }
  function wrapAfter(name, fn, before) {
    var orig = window[name];
    if (typeof orig !== "function" || orig._gbWrapped) return;
    var w = function () {
      var pre = null;
      try { if (before) pre = before.apply(this, arguments); } catch (e) {}
      var r = orig.apply(this, arguments);
      try { fn.call(this, arguments, pre); } catch (e) { console.error("game-buddy", e); }
      return r;
    };
    w._gbWrapped = true;
    window[name] = w;
  }
  function installGameReactions() {
    wrapAfter("showQuestionStep", function () {
      if (window.currentQIdx === 0) gb.streak = 0;
      var el = ensureGameBuddy(); if (!el) return;
      el.querySelector(".gb-art").innerHTML = current().svg("normal");
      var say = el.querySelector(".gb-say"); if (say) say.className = "gb-say";
    });
    wrapAfter("triggerCorrectAnswer", function (args, pre) {
      var q = args[0] || {};
      if (pre.firstTry) gb.streak++; else gb.streak = 0;
      var qLen = String(q.q || "").replace(/\s/g, "").length;
      var text;
      if (pre.firstTry && pre.elapsed !== null && pre.elapsed < FAST_MS && qLen >= LONG_Q_CHARS) text = pick(LINES.fast);
      else if (!pre.firstTry) text = pick(LINES.retry);
      else if (gb.streak >= 3 && gb.streak % 3 === 0) text = gb.streak + "もん れんぞく せいかい！🔥";
      else text = pick(LINES.correct);
      react(gb.streak >= 3 ? "streak" : (pre.firstTry ? "correct" : "retry"), text);
    }, function () {
      var st = window.currentQuestionStartedAt;
      return { firstTry: !!window.currentFirstTry, elapsed: (typeof st === "number") ? Date.now() - st : null };
    });
    wrapAfter("triggerWrongAnswer", function () { gb.streak = 0; react("wrong", pick(LINES.wrong)); });
    wrapAfter("triggerSkipAnswer", function () { gb.streak = 0; react("skip", pick(LINES.skip)); });
  }
  installGameReactions();

  window.closeFriendsModal = function () { var m = document.getElementById("friends-modal"); if (m) m.remove(); };

  window.openFriendsModal = function () {
    window.closeFriendsModal();
    var cur = current().id;
    var n = doneCount();
    var cards = FRIENDS.map(function (f) {
      var un = isUnlocked(f);
      var art = un ? f.svg(f.id === cur ? "happy" : "normal")
                   : '<div style="filter:brightness(0) opacity(.18);">' + f.svg("normal") + '</div>';
      return '<div style="background:' + (f.id === cur ? "linear-gradient(160deg,#fff,#fce7f3)" : "#fff") + ';border:2px solid ' + (f.id === cur ? "#f0abfc" : "#f3e8ff") +
        ';border-radius:18px;padding:10px 8px;text-align:center;' + (un ? "cursor:pointer;" : "") + '" ' + (un ? 'onclick="window.selectFriend(\'' + f.id + '\')"' : "") + '>' +
        '<div class="fr-art" style="display:flex;justify-content:center;">' + art + '</div>' +
        '<div style="font-size:14px;font-weight:900;color:#4a3b52;margin-top:2px;">' + (un ? f.name : "？？？") + '</div>' +
        '<div style="font-size:10.5px;font-weight:800;color:#9333ea;">' + (un ? f.kind : "あと " + (f.need - n) + "回で なかまに") + '</div>' +
        (un ? '<div style="font-size:11px;font-weight:700;color:var(--text-soft);line-height:1.5;margin-top:4px;text-align:left;">🔎 ひみつ：' + f.secret + '</div>' : "") +
        (f.id === cur ? '<div style="font-size:11px;font-weight:900;color:#db2777;margin-top:4px;">いっしょに いるよ</div>' : (un ? '<div style="font-size:11px;font-weight:900;color:#7e22ce;margin-top:4px;">タップで いっしょに</div>' : "")) +
        '</div>';
    }).join("");
    var wrap = document.createElement("div");
    wrap.id = "friends-modal";
    wrap.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:16px;";
    wrap.onclick = function (e) { if (e.target === wrap) window.closeFriendsModal(); };
    wrap.innerHTML =
      '<style>#friends-modal .fr-art .c-buddy{width:72px;height:72px;margin:0}</style>' +
      '<div style="background:linear-gradient(160deg,#fff,#fdf4ff);border-radius:24px;padding:16px 14px;max-width:400px;width:100%;max-height:86vh;overflow-y:auto;box-shadow:0 10px 0 rgba(147,51,234,.22);">' +
        '<div style="font-size:18px;font-weight:900;color:#6b21a8;text-align:center;">🐾 まなびの なかま</div>' +
        '<div style="font-size:12px;font-weight:700;color:var(--text-soft);text-align:center;margin:4px 0 12px;line-height:1.6;">「きょうの まなびプラン」を ぜんぶ できると なかまが ふえるよ。<br>いままで ' + n + '回 たっせい！</div>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">' + cards + '</div>' +
        '<button style="display:block;margin:14px auto 0;border:none;border-radius:999px;padding:10px 26px;font-family:\'Zen Maru Gothic\';font-weight:900;font-size:14px;background:#f3e8ff;color:#7e22ce;cursor:pointer;" onclick="window.closeFriendsModal()">とじる</button>' +
      '</div>';
    document.body.appendChild(wrap);
  };
})();
