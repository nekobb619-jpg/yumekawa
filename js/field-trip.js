/* =====================================================================
   field-trip.js — 🚌 社会見学カード（★2026-11-11 保護者：前日までに 予習、その後 復習できると よい）
   - ホームの 今日の ラボの 下に、見学日の 5日前〜10日後だけ カードを 出す。
   - 前（予習）：① ステージ ② ラボ ③ 自分の 目標と 聞きたい ことを えらぶ（書かない）④ 前の 日に 持ち物チェック
   - 後（復習）：① 自学ノートで ふり返り ② 見学ふくしゅう クイズ 5問（1・3・7日後の 3回。間を あけて 思い出す）③ 3つの レンズ
   - ごほうび：やる ことを 1つ 終えるたびに シールの かけら +1（1回ずつ）。Q は なし。
   - saveData.trip = { <id>: { done: {key: 日}, goal, qs: [], bag: {品: 1}, rev: {"1": 正解数, …} } }。LOG「🚌社会見学」。
   - 見学先・日程・持ち物は 学校の しおり（11/11）から。先生の 名前・学校名は 入れない。
   ===================================================================== */
(function () {
  "use strict";
  var TRIP = {
    id: "tokoname2026", date: "2026-11-16", title: "常滑 社会見学", place: "INAXライブミュージアム・やきもの散歩道",
    stage: "社会/伝統/tokoname01", lab: "https://nekobb619-jpg.github.io/yumekawa/lab/社会/lab_narabe.html", note: "a_tokoname",
    goals: ["職人さんの 工夫を 1つ 見つける", "見た こと・聞いた ことの メモを 3つ いじょう とる", "わからない ことを 1つ 質問する", "班の みんなと 時間を 守って 動く", "どろだんごを さいごまで ていねいに みがく"],
    asks: ["どうして 常滑で やきものが さかんに なったの？", "窯の 中は 何度ぐらいに なるの？", "1つの 作品が できるまで 何日 かかるの？", "土管は 何に 使われて いたの？", "タイルは どうやって 色や もようを つけるの？", "むかしと 今で 作り方は どう かわったの？"],
    bag: ["見学の しおり", "筆記用具", "ハンカチ・ティッシュ", "お弁当", "水とう", "よい止めくすり（いる 人）", "学校の ぼうし", "しきもの", "ビニールぶくろ", "かっぱ", "おりたたみがさ", "おやつ（食べられる 分）"],
    // [問題, 正解, まちがい2つ, ひとこと]（オリジナル。しおりと 教科書レベルの 事実だけ）
    quiz: [
      ["常滑焼は、日本の 古い やきものの 産地「六古窯」の 1つ。ほかに 愛知県に ある 六古窯は？", "瀬戸", ["有田", "益子"], "愛知県には 常滑と 瀬戸、2つの 六古窯が ある。"],
      ["光る どろだんごは、何を まるめて みがいて 作る？", "土（どろ）", ["ガラス", "石けん"], "土を まるめて、かわかしながら ていねいに みがくと ぴかぴかに 光る。"],
      ["登り窯は、どんな 場所に つくられる？", "坂に なった 場所", ["川の 中", "平らな 広場の まん中"], "熱い 空気は 上へ 上る。下で 火を たくと、坂の 上の 部屋まで あたたまる。理科の「あたたまり方」と 同じ。"],
      ["やきもの散歩道の「土管坂」の かべや 坂に うめこまれて いる ものは？", "土管や やきものの びん", ["鉄の 板", "木の えだ"], "使わなく なった 土管や びんを 道や かべに 生かして いる。"],
      ["常滑で たくさん 作られた、水などを 通す やきものの 管は？", "土管", ["急須", "招き猫"], "常滑は 土管の 産地として 知られて いた。"],
      ["窯の えんとつが 高いのは なぜ？", "けむりを 高い ところから 出し、空気の 流れを よく する ため", ["遠くから 目立つ ように する ため", "雨を ためる ため"], "高い えんとつは 空気を 引きこむ 力が 強く なり、火が よく もえる。"],
      ["常滑焼の 急須で 有名な、赤茶色の 土の 名前は？", "朱泥（しゅでい）", ["黒土（くろつち）", "白砂（しらすな）"], "鉄分の 多い 土を 焼くと 赤茶色に なる。"],
      ["やきものが できる じゅんばんで 正しいのは？", "土を ねる → 形 → かわかす → 窯で 焼く", ["形 → 窯で 焼く → 土を ねる → かわかす", "かわかす → 土を ねる → 窯で 焼く → 形"], "かわかしてから 焼かないと、中の 水が ふくらんで われて しまう。"],
      ["常滑は 海に 近い。むかし、重い やきものを 遠くへ 運ぶのに 使ったのは？", "船", ["飛行機", "トラック だけ"], "海に 近く、船で 大量に 運べた ことが 産地が さかえた わけの 1つ。"],
      ["タイルは 何で できて いる？", "土を 焼いた もの（やきもの）", ["プラスチック", "木"], "タイルも やきものの なかま。ミュージアムで 世界の タイルを 見たね。"],
      ["見学の 日の めあて「マナーを 守る」に あう のは？", "しせつの 中は しずかに 歩く", ["おもしろい 物は さわって みる", "先に 一人で 見に 行く"], "見せて もらう 場所。ほかの 人の じゃまを しない。"],
      ["聞いた ことを わすれない ために いちばん よい のは？", "その場で メモを とる", ["家に 帰ってから 思い出す", "友だちに おぼえて もらう"], "メモが あると、ふり返りの 自学ノートが すらすら 書ける。"]
    ]
  };
  var REV = [1, 3, 7]; // 見学の 何日後に ふくしゅう

  function iso(t) { var d = new Date(t == null ? (window.currentServerTime || Date.now()) : t); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dayDiff(a, b) { return Math.round((Date.parse(a + "T00:00:00") - Date.parse(b + "T00:00:00")) / 86400000); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function shuf(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function st() { var sd = window.saveData || {}; sd.trip = sd.trip && typeof sd.trip === "object" ? sd.trip : {}; var o = sd.trip[TRIP.id] || (sd.trip[TRIP.id] = {}); o.done = o.done || {}; o.bag = o.bag || {}; o.rev = o.rev || {}; o.qs = o.qs || []; return o; }
  function log(m) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🚌社会見学", msg: m }); } catch (e) {} }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }
  function mark(key, msg) { var o = st(); if (o.done[key]) return false; o.done[key] = iso(); try { if (window.stickerAddShardsExternal) window.stickerAddShardsExternal(1, "社会見学"); } catch (e) {} log(msg + "（かけら+1）"); save(); return true; }
  function cleared(id) { var c = (window.saveData || {}).clearedStages; return Array.isArray(c) ? c.indexOf(id) >= 0 : !!(c && c[id]); }
  function jigDone(id) { return ((window.saveData || {}).jigakuDone || []).indexOf(id) >= 0; }

  function tasks() {
    var o = st(), d = dayDiff(iso(), TRIP.date), L = [];
    if (d <= 0) {
      L.push({ k: "stage", icon: "📚", t: "ステージ「常滑焼と 先人」を やる", ok: !!o.done.stage || cleared(TRIP.stage) });
      L.push({ k: "lab", icon: "🏺", t: "ラボで「常滑焼が できるまで」を ならべる", ok: !!o.done.lab });
      L.push({ k: "goal", icon: "🎯", t: "自分の 目標と 聞きたい ことを えらぶ", ok: !!o.goal, sub: o.goal ? "目標：" + o.goal + (o.qs.length ? "／聞きたい こと：" + o.qs.join("・") : "") : "" });
      if (d >= -1) { var n = TRIP.bag.filter(function (b) { return o.bag[b]; }).length; L.push({ k: "bag", icon: "🎒", t: "持ち物チェック（" + n + "／" + TRIP.bag.length + "）", ok: n === TRIP.bag.length }); }
    } else {
      L.push({ k: "note", icon: "📓", t: "自学ノートで ふり返り", ok: !!o.done.note || jigDone(TRIP.note) });
      REV.forEach(function (r) { L.push({ k: "rev" + r, icon: "🔁", t: "見学ふくしゅう " + (REV.indexOf(r) + 1) + "回め（" + r + "日後〜）", ok: o.rev[r] != null, lock: d < r, sub: o.rev[r] != null ? "⭕ " + o.rev[r] + "／5" : d < r ? "あと " + (r - d) + "日で できる" : "" }); });
      L.push({ k: "lens", icon: "👓", t: "3つの レンズで 見る（できたら）", ok: !!o.done.lens || jigDone("a_lens") });
    }
    return L;
  }
  function render() {
    var anchor = document.getElementById("dailylab-card") || document.getElementById("tutor-plan-card"); if (!anchor || !window.saveData) return;
    var d = dayDiff(iso(), TRIP.date), host = document.getElementById("trip-card");
    if (d < -5 || d > 10) { if (host) host.hidden = true; return; }
    if (!host) {
      host = document.createElement("section"); host.id = "trip-card"; host.setAttribute("aria-label", "社会見学");
      host.style.cssText = "margin:0 0 14px;padding:12px 14px;border-radius:20px;border:3px solid #f59e0b;background:linear-gradient(135deg,#fffbeb,#fef3c7);box-shadow:0 6px 0 #b45309;font-family:'Zen Maru Gothic',sans-serif;";
      host.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-tp]"); if (b) act(b.getAttribute("data-tp")); });
    }
    if (anchor.nextSibling !== host) anchor.parentNode.insertBefore(host, anchor.nextSibling);
    host.hidden = false;
    var L = tasks(), left = L.filter(function (x) { return !x.ok && !x.lock && x.k !== "lens"; }).length;
    var when = d < 0 ? "あと " + (-d) + "日" : d === 0 ? "きょう！" : d + "日前に 行った";
    host.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;"><div style="font-size:15px;font-weight:900;color:#92400e;">🚌 ' + TRIP.title + '　<span style="font-size:13px;">' + when + '</span></div><span style="font-size:11px;font-weight:900;color:#b45309;">' + (d <= 0 ? "📖 よしゅう" : "🔁 ふくしゅう") + '</span></div>' +
      '<div style="font-size:11.5px;font-weight:800;color:#a16207;margin-top:2px;">' + TRIP.place + '</div>' +
      L.map(function (x) {
        return '<button type="button" data-tp="' + x.k + '"' + (x.lock ? ' disabled' : '') + ' style="display:flex;align-items:center;gap:8px;width:100%;margin-top:6px;padding:8px 10px;min-height:48px;border:2px solid ' + (x.ok ? "#86efac" : "#fcd34d") + ';border-radius:14px;background:' + (x.ok ? "#f0fdf4" : x.lock ? "#f8fafc" : "#fff") + ';cursor:' + (x.lock ? "default" : "pointer") + ';text-align:left;font-family:inherit;opacity:' + (x.lock ? ".6" : "1") + ';">' +
          '<span style="font-size:22px;">' + (x.ok ? "✅" : x.icon) + '</span><span style="flex:1;min-width:0;"><b style="font-size:13.5px;color:#1f2937;">' + esc(x.t) + '</b>' + (x.sub ? '<br><span style="font-size:11px;font-weight:700;color:#92400e;">' + esc(x.sub) + '</span>' : '') + '</span></button>';
      }).join("") +
      (left === 0 ? '<div style="font-size:12px;font-weight:900;color:#15803d;margin-top:6px;text-align:center;">' + (d <= 0 ? "🎉 よしゅう ばっちり！ 当日は メモを わすれずに" : "🎉 いまの ふくしゅうは おわり！") + '</div>' : '');
  }

  /* ---------- 画面（目標・持ち物・クイズ） ---------- */
  function shell(inner) {
    var w = document.getElementById("trip-modal");
    if (!w) {
      w = document.createElement("div"); w.id = "trip-modal"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "社会見学");
      w.style.cssText = "position:fixed;inset:0;z-index:10002;background:rgba(69,26,3,.45);display:flex;align-items:center;justify-content:center;padding:12px;";
      w.addEventListener("click", function (e) { if (e.target === w) return close(); var b = e.target.closest && e.target.closest("[data-tm]"); if (b) modalAct(b.getAttribute("data-tm"), b.getAttribute("data-v")); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.getElementById("trip-modal")) close(); });
      document.body.appendChild(w);
    }
    w.innerHTML = '<div style="width:100%;max-width:440px;max-height:90vh;overflow-y:auto;background:#fffbeb;border:3px solid #fcd34d;border-radius:22px;padding:14px;font-family:\'Zen Maru Gothic\',sans-serif;color:#1f2937;">' + inner + '</div>';
    var f = w.querySelector("button"); if (f) try { f.focus(); } catch (e) {}
  }
  function close() { var w = document.getElementById("trip-modal"); if (w) w.remove(); ui = null; render(); }
  var ui = null;
  var OPT = "display:block;width:100%;min-height:46px;margin-top:6px;border:2px solid #fcd34d;border-radius:12px;background:#fff;font:800 13.5px 'Zen Maru Gothic',sans-serif;color:#1f2937;padding:8px 10px;text-align:left;cursor:pointer;";
  var BIG = "min-height:46px;border:none;border-radius:14px;padding:10px 18px;font:900 15px 'Zen Maru Gothic',sans-serif;color:#fff;background:linear-gradient(135deg,#f59e0b,#ea580c);cursor:pointer;";
  function goalHtml() {
    var o = st();
    return '<div style="font-size:17px;font-weight:900;text-align:center;">🎯 自分の 目標と 聞きたい こと</div>' +
      '<div style="font-size:12px;font-weight:700;color:#92400e;margin-top:4px;">しおりの めあて：体験や 見学を して、人々の 熱意や 工夫、努力する すがたを 学ぼう。マナーを 守り、協力して 行動しよう。</div>' +
      '<div style="font-size:13px;font-weight:900;margin-top:10px;">① 目標を 1つ えらぶ</div>' + TRIP.goals.map(function (g, i) { return '<button type="button" data-tm="g" data-v="' + i + '" aria-pressed="' + (o.goal === g) + '" style="' + OPT + (o.goal === g ? "background:#fde68a;" : "") + '">' + (o.goal === g ? "✅ " : "") + esc(g) + '</button>'; }).join("") +
      '<div style="font-size:13px;font-weight:900;margin-top:10px;">② 聞いて みたい ことを 2つまで</div>' + TRIP.asks.map(function (a, i) { var on = o.qs.indexOf(a) >= 0; return '<button type="button" data-tm="q" data-v="' + i + '" aria-pressed="' + on + '" style="' + OPT + (on ? "background:#fde68a;" : "") + '">' + (on ? "✅ " : "") + esc(a) + '</button>'; }).join("") +
      '<div style="font-size:11.5px;font-weight:700;color:#92400e;margin-top:8px;">えらんだ ものを、しおりの「自分の 目標」に 書いて いこう。</div>' +
      '<div style="text-align:center;margin-top:10px;"><button type="button" data-tm="close" style="' + BIG + '">これで OK</button></div>';
  }
  function bagHtml() {
    var o = st();
    return '<div style="font-size:17px;font-weight:900;text-align:center;">🎒 持ち物チェック</div><div style="font-size:12px;font-weight:700;color:#92400e;text-align:center;">リュックに 入れたら タップ。雨でも 行くよ。</div>' +
      TRIP.bag.map(function (b, i) { var on = !!o.bag[b]; return '<button type="button" data-tm="b" data-v="' + i + '" aria-pressed="' + on + '" style="' + OPT + (on ? "background:#dcfce7;border-color:#86efac;" : "") + '">' + (on ? "✅ " : "⬜ ") + esc(b) + '</button>'; }).join("") +
      '<div style="font-size:11.5px;font-weight:700;color:#92400e;margin-top:8px;">歩きなれた くつと、ぬぎ着しやすい 服で 行こう。</div>' +
      '<div style="text-align:center;margin-top:10px;"><button type="button" data-tm="close" style="' + BIG + '">とじる</button></div>';
  }
  function quizHtml() {
    var q = ui.qs[ui.i];
    var head = '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;color:#b45309;"><span>🔁 見学ふくしゅう ' + (ui.i + 1) + '／' + ui.qs.length + '</span><span>⭕ ' + ui.ok + '</span></div>' +
      '<div style="font-size:15px;font-weight:900;background:#fff;border-radius:14px;padding:10px 12px;margin-top:6px;line-height:1.6;">' + esc(q[0]) + '</div>';
    if (ui.res != null) return head + '<div style="margin-top:8px;background:' + (ui.res ? "#ecfdf5" : "#fff7ed") + ';border-radius:14px;padding:10px 12px;font-size:13.5px;font-weight:800;line-height:1.7;">' + (ui.res ? "⭕ " : "💡 正解は ") + '<b>' + esc(q[1]) + '</b><br>' + esc(q[3]) + '</div><div style="text-align:center;margin-top:10px;"><button type="button" data-tm="next" style="' + BIG + '">' + (ui.i + 1 < ui.qs.length ? "つぎ ▶" : "おわり") + '</button></div>';
    return head + ui.ord.map(function (k) { return '<button type="button" data-tm="a" data-v="' + k + '" style="' + OPT + '">' + esc(k === 0 ? q[1] : q[2][k - 1]) + '</button>'; }).join("");
  }
  function endHtml() {
    return '<div style="text-align:center;font-size:40px;">' + (ui.ok >= 4 ? "🏺" : "💪") + '</div><div style="text-align:center;font-size:16px;font-weight:900;">5問中 ' + ui.ok + '問 正解！</div>' +
      '<div style="font-size:12.5px;font-weight:800;background:#fff;border-radius:14px;padding:10px 12px;margin-top:8px;line-height:1.7;">日を あけて もう一度 思い出すと、ずっと わすれにくく なるよ。' + (ui.next ? "つぎは " + ui.next + "日後。" : "これで ふくしゅうは ぜんぶ おわり！") + '</div>' +
      '<div style="text-align:center;margin-top:10px;"><button type="button" data-tm="close" style="' + BIG + '">とじる</button></div>';
  }
  function show() { if (!ui) return; shell(ui.ph === "goal" ? goalHtml() : ui.ph === "bag" ? bagHtml() : ui.ph === "end" ? endHtml() : quizHtml()); }
  function modalAct(a, v) {
    var o = st();
    if (a === "close") return close();
    if (a === "g") { o.goal = TRIP.goals[Number(v)]; if (o.goal) mark("goal", "目標「" + o.goal + "」"); save(); return show(); }
    if (a === "q") { var q = TRIP.asks[Number(v)], i = o.qs.indexOf(q); if (i >= 0) o.qs.splice(i, 1); else { o.qs.push(q); if (o.qs.length > 2) o.qs.shift(); } save(); return show(); }
    if (a === "b") { var b = TRIP.bag[Number(v)]; if (o.bag[b]) delete o.bag[b]; else o.bag[b] = 1; if (TRIP.bag.every(function (x) { return o.bag[x]; })) mark("bag", "持ち物 ぜんぶ OK"); save(); return show(); }
    if (a === "a" && ui && ui.res == null) { ui.res = Number(v) === 0; if (ui.res) ui.ok++; return show(); }
    if (a === "next" && ui) {
      ui.i++; ui.res = null; ui.ord = shuf([0, 1, 2]);
      if (ui.i < ui.qs.length) return show();
      o.rev[ui.r] = ui.ok; mark("rev" + ui.r, "見学ふくしゅう " + ui.r + "日後 ⭕" + ui.ok + "/5");
      var nx = REV.filter(function (r) { return o.rev[r] == null; })[0]; ui.next = nx ? nx - dayDiff(iso(), TRIP.date) : 0; if (ui.next < 0) ui.next = 0;
      ui.ph = "end"; save(); return show();
    }
  }
  function act(k) {
    var o = st(), d = dayDiff(iso(), TRIP.date);
    if (k === "stage") { var s = (window.CONTENT_STAGES || []).filter(function (x) { return x.id === TRIP.stage; })[0]; if (s && window.launchQuest) { window.currentStage = s; mark("stage", "ステージ 常滑焼と先人"); window.launchQuest(); } return; }
    if (k === "lab") { mark("lab", "ラボ 常滑焼が できるまで"); if (window.openHybridContent) window.openHybridContent(TRIP.lab, "🏺 先人と 伝統 ならべかえラボ", false); else window.open(TRIP.lab, "_blank"); if (window.lensModelSeen) window.lensModelSeen("lab/社会/lab_narabe.html"); render(); return; }
    if (k === "goal") { ui = { ph: "goal" }; return show(); }
    if (k === "bag") { ui = { ph: "bag" }; return show(); }
    if (k === "note") { mark("note", "自学ノート ふり返りを ひらいた"); if (window.showJigakuCard) window.showJigakuCard(TRIP.note); return; }
    if (k === "lens") { mark("lens", "3つの レンズを ひらいた"); if (window.showJigakuCard) window.showJigakuCard("a_lens"); return; }
    if (/^rev\d+$/.test(k)) {
      var r = Number(k.slice(3)); if (d < r) return;
      // まだ 出して いない 問題を 先に（3回で 12問を まわる）
      var used = o.used || [], pool = TRIP.quiz.map(function (q, i) { return i; }).filter(function (i) { return used.indexOf(i) < 0; });
      if (pool.length < 5) { used = []; pool = TRIP.quiz.map(function (q, i) { return i; }); }
      var pick = shuf(pool).slice(0, 5); o.used = used.concat(pick);
      ui = { ph: "quiz", r: r, qs: pick.map(function (i) { return TRIP.quiz[i]; }), i: 0, ok: 0, res: null, ord: shuf([0, 1, 2]) }; return show();
    }
  }
  window.openFieldTrip = function () { render(); var c = document.getElementById("trip-card"); if (c) c.scrollIntoView({ behavior: "smooth", block: "center" }); };
  var ou = window.updateUI;
  window.updateUI = function () { var r = typeof ou === "function" ? ou.apply(this, arguments) : undefined; try { render(); } catch (e) {} return r; };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(render, 1700); }); else setTimeout(render, 1700);
})();
