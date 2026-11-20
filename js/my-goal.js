/* 🎯 わたしの 目的地（2026-11-21 保護者：動画「勉強しなさい」→ 問いかけ。質問は 子どもの 中に 目的地が ある ことが 前提）
   - まなびプランの カードの 上に 1行。週に 1回（月曜〜日曜）、今週の 目的地を「えらぶ だけ」で 決める。
   - ① 目的地（できるように なりたい／作りたい／知りたい／家族と したい）→ ② そのために 今週 やる 1つ。
   - 「じぶんで きめたい」は おうちの人と 話して 決める。「いまは きめない」も OK（その 週は もう 聞かない。小さな「えらぶ」だけ のこす）。
   - ごほうびは つけない（目的地は 本人の もの。Q や シールの ための 目的地に しない）。
   - saveData.myGoal { w: 週の 月曜(YYYY-MM-DD), g, s, skip, hist:[{w,g,s}] 最大 20 }。LOG「🎯わたしの目的地」。
   - 中身を 足す ときは GOALS に 1行（steps は 2〜3こ、えらぶ だけで 分かる 言葉）。 */
(function () {
  "use strict";
  var CATS = [
    { id: "can", e: "💪", n: "できるように なりたい" },
    { id: "make", e: "🛠", n: "作りたい" },
    { id: "know", e: "🔍", n: "知りたい" },
    { id: "fam", e: "🏠", n: "家族と したい" }
  ];
  var GOALS = [
    { id: "g_wari", c: "can", n: "大きい 数の わり算が できる", steps: ["1つ目の 商だけ 見当を つける", "筆算シートを 1まい やる", "たしかめ算まで やる"] },
    { id: "g_kanji", c: "can", n: "まちがえた 漢字が 書ける", steps: ["テストの 漢字シートを 1まい", "1日 3こ 思い出して 書く", "送りがなも いっしょに 書く"] },
    { id: "g_read", c: "can", n: "読んでから 答えられる", steps: ["「どこに 書いて ある？」を 指で さす", "問題文を さいごまで 読む", "探偵ラボで 1回目 正解を ねらう"] },
    { id: "g_bai", c: "can", n: "倍の 問題で「もと」が わかる", steps: ["「の」の 前に 線を 引く", "倍の 図を かいてから 式に する", "たしかめ算で もどす"] },
    { id: "g_test", c: "can", n: "テストで 90点を とる", steps: ["ふくしゅうを 毎日 1つ", "まちがえた 問題を もう一度", "テストの 見直しを 1回"] },
    { id: "g_game", c: "make", n: "ロブロックスで ゲームを 作る", steps: ["デジタネの ミッションを 1つ", "作りたい ゲームの 絵を かく", "家族に あそんで もらう"] },
    { id: "g_sozo", c: "make", n: "そうぞう工房で あそびを 作る", steps: ["カードを 1回 引く", "作品を 1つ かんせい", "家族に あそんで もらう"] },
    { id: "g_jigaku", c: "make", n: "自学ノートを 自分の テーマで 書く", steps: ["テーマを 自分で 決める", "てだすけ「すこし」で 書く", "てだすけ「なし」で 書く"] },
    { id: "g_sora", c: "know", n: "星や 宇宙の ふしぎを 知る", steps: ["星の動きラボを ひらく", "本や 図かんで 1つ しらべる", "自学ノートに まとめる"] },
    { id: "g_ken", c: "know", n: "日本の 県を ぜんぶ 言える", steps: ["都道府県の 漢字シートを 1まい", "地図で 5つ おぼえる", "ことばつなぎで あそぶ"] },
    { id: "g_body", c: "know", n: "体の しくみを 知る", steps: ["体の ラボを ひらく", "骨や 筋肉を 1つ しらべる", "家族に 1つ おしえる"] },
    { id: "g_karuta", c: "fam", n: "百人一首で 家族と 勝負する", steps: ["むすめふさほせを おぼえる", "ことばつなぎの 百人一首を 1回", "家族と かるたを 1回"] },
    { id: "g_family", c: "fam", n: "家族と ことばあそびを する", steps: ["ことばつなぎで 1回 あそぶ", "おうちの ことばを 3つ 足す", "家族に クイズを 出す"] },
    { id: "g_teach", c: "fam", n: "家族に 何か おしえる", steps: ["きょう 習った ことを 1つ 話す", "クイズに して 出す", "ノートを 見せて せつめいする"] }
  ];
  var OWN = { id: "g_own", n: "じぶんで きめた 目的地", steps: ["おうちの人と 話して きめる"] };

  function sd() { return window.saveData || null; }
  function nowMs() { return window.currentServerTime || Date.now(); }
  function weekKey() { var d = new Date(nowMs()); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function goal(id) { return id === OWN.id ? OWN : GOALS.filter(function (g) { return g.id === id; })[0]; }
  function cur() { var d = sd(); var m = d && d.myGoal; return m && m.w === weekKey() ? m : null; }
  function log(msg) { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🎯わたしの目的地", msg: msg }); }

  var BTN = "border:none;border-radius:14px;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;cursor:pointer;min-height:44px;";
  function chip() {
    var host = document.getElementById("tutor-plan-card"), steps = document.getElementById("tplan-steps");
    if (!host || !steps || !sd()) return;
    var el = document.getElementById("mygoal-chip");
    if (!el) { el = document.createElement("div"); el.id = "mygoal-chip"; host.insertBefore(el, steps); }
    var m = cur(), g = m && m.g ? goal(m.g) : null, html;
    if (g) {
      html = '<button type="button" onclick="window.openMyGoal()" style="' + BTN + 'display:block;width:100%;text-align:left;padding:8px 12px;margin:0 0 8px;background:#fff7ed;border:2px solid #fed7aa;color:#9a3412;font-size:13px;line-height:1.5;">' +
        '🎯 今週の 目的地：<b>' + esc(g.n) + '</b>' + (m.s != null && g.steps[m.s] ? '<br><span style="font-size:12px;font-weight:800;">👣 そのために：' + esc(g.steps[m.s]) + '</span>' : "") + '</button>';
    } else if (m && m.skip) {
      html = '<div style="text-align:right;margin:-2px 0 6px;"><button type="button" onclick="window.openMyGoal()" style="' + BTN + 'min-height:36px;padding:4px 12px;background:transparent;color:#9a3412;font-size:12px;border:1.5px dashed #fed7aa;">🎯 目的地を えらぶ</button></div>';
    } else {
      html = '<button type="button" onclick="window.openMyGoal()" style="' + BTN + 'display:block;width:100%;padding:10px 12px;margin:0 0 8px;background:linear-gradient(135deg,#ffedd5,#fce7f3);border:2px solid #fdba74;color:#9a3412;font-size:14px;">🎯 今週の 目的地を えらぼう（えらぶ だけ）</button>';
    }
    if (el.getAttribute("data-h") !== html) { el.innerHTML = html; el.setAttribute("data-h", html); }
  }

  function modal(inner) {
    var w = document.getElementById("mygoal-modal");
    if (!w) { w = document.createElement("div"); w.id = "mygoal-modal"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "今週の 目的地"); document.body.appendChild(w); }
    w.style.cssText = "position:fixed;inset:0;z-index:240;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:14px;";
    w.innerHTML = '<div style="background:#fff;border-radius:22px;padding:16px 14px;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 10px 0 rgba(234,88,12,.2);font-family:\'Zen Maru Gothic\',sans-serif;">' + inner + '</div>';
    w.onclick = function (e) { if (e.target === w) close(); };
    var f = w.querySelector("button"); if (f) f.focus();
  }
  function close() { var w = document.getElementById("mygoal-modal"); if (w) w.remove(); chip(); }
  window.closeMyGoal = close;

  var tab = "can";
  window.openMyGoal = function (t) {
    if (t) tab = t;
    var m = cur();
    var list = GOALS.filter(function (g) { return g.c === tab; });
    modal('<div style="font-size:18px;font-weight:900;color:#9a3412;text-align:center;">🎯 今週の 目的地</div>' +
      '<div style="font-size:12.5px;font-weight:800;color:#7c2d12;text-align:center;margin:4px 0 10px;line-height:1.6;">この 1週間、どこに 行きたい？<br>えらぶ だけで いいよ。とちゅうで かえても OK。</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">' + CATS.map(function (c) {
        return '<button type="button" onclick="window.openMyGoal(\'' + c.id + '\')" aria-pressed="' + (c.id === tab) + '" style="' + BTN + 'min-height:40px;padding:4px 10px;font-size:12.5px;' + (c.id === tab ? "background:#ea580c;color:#fff;" : "background:#fff7ed;color:#9a3412;border:1.5px solid #fed7aa;") + '">' + c.e + ' ' + c.n + '</button>';
      }).join("") + '</div>' +
      '<div style="display:grid;gap:6px;">' + list.map(function (g) {
        var on = m && m.g === g.id;
        return '<button type="button" onclick="window.myGoalPick(\'' + g.id + '\')" style="' + BTN + 'padding:10px 12px;text-align:left;font-size:14px;' + (on ? "background:#ffedd5;border:2.5px solid #ea580c;color:#7c2d12;" : "background:#fff;border:2px solid #fed7aa;color:#7c2d12;") + '">' + (on ? "✅ " : "") + esc(g.n) + '</button>';
      }).join("") + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">' +
        '<button type="button" onclick="window.myGoalPick(\'g_own\')" style="' + BTN + 'padding:8px;font-size:12.5px;background:#fef3c7;color:#92400e;">✏️ じぶんで きめたい</button>' +
        '<button type="button" onclick="window.myGoalSkip()" style="' + BTN + 'padding:8px;font-size:12.5px;background:#f1f5f9;color:#475569;">いまは きめない</button>' +
      '</div>' +
      '<button type="button" onclick="window.closeMyGoal()" style="' + BTN + 'display:block;width:100%;margin-top:8px;padding:8px;font-size:13px;background:#fff;color:#7e22ce;border:2px solid #e9d5ff;">とじる</button>');
  };
  window.myGoalPick = function (id) {
    var g = goal(id); if (!g) return;
    if (g.steps.length === 1) return save(id, 0);
    modal('<div style="font-size:16px;font-weight:900;color:#9a3412;text-align:center;">🎯 ' + esc(g.n) + '</div>' +
      '<div style="font-size:13px;font-weight:800;color:#7c2d12;text-align:center;margin:6px 0 10px;">そのために、今週 やって みる 1つは？</div>' +
      '<div style="display:grid;gap:6px;">' + g.steps.map(function (s, i) {
        return '<button type="button" onclick="window.myGoalStep(\'' + id + '\',' + i + ')" style="' + BTN + 'padding:10px 12px;text-align:left;font-size:14px;background:#fff;border:2px solid #fed7aa;color:#7c2d12;">👣 ' + esc(s) + '</button>';
      }).join("") + '</div>' +
      '<button type="button" onclick="window.openMyGoal()" style="' + BTN + 'display:block;width:100%;margin-top:10px;padding:8px;font-size:13px;background:#fff;color:#7e22ce;border:2px solid #e9d5ff;">← ほかの 目的地に する</button>');
  };
  window.myGoalStep = function (id, i) { save(id, i); };
  function save(id, i) {
    var d = sd(); if (!d) return close();
    var w = weekKey(), g = goal(id), old = d.myGoal && d.myGoal.w === w ? d.myGoal : null;
    var hist = (d.myGoal && Array.isArray(d.myGoal.hist)) ? d.myGoal.hist.slice() : [];
    hist = hist.filter(function (h) { return h.w !== w; }); hist.push({ w: w, g: id, s: i }); hist = hist.slice(-20);
    d.myGoal = { w: w, g: id, s: i, hist: hist };
    if (window.saveGame) window.saveGame();
    log((old && old.g ? "かえた：" : "") + g.n + "／" + g.steps[i]);
    var box = '<div style="text-align:center;"><div style="font-size:40px;">🎯</div><div style="font-size:16px;font-weight:900;color:#9a3412;margin:4px 0;">' + esc(g.n) + '</div>' +
      '<div style="font-size:13px;font-weight:800;color:#7c2d12;line-height:1.7;">👣 ' + esc(g.steps[i]) + '<br>' + (id === "g_own" ? "おうちの人に「目的地を きめたい」と 話して みてね。" : "まなびプランの 上に いつも 出て いるよ。") + '</div>' +
      '<button type="button" onclick="window.closeMyGoal()" style="' + BTN + 'margin-top:12px;padding:10px 26px;font-size:15px;color:#fff;background:linear-gradient(135deg,#f97316,#db2777);">きめた！</button></div>';
    modal(box);
  }
  window.myGoalSkip = function () {
    var d = sd(); if (d) { var w = weekKey(); if (!(d.myGoal && d.myGoal.w === w && d.myGoal.g)) { d.myGoal = { w: w, skip: 1, hist: (d.myGoal && d.myGoal.hist) || [] }; if (window.saveGame) window.saveGame(); } }
    close();
  };
  window.MY_GOAL = { GOALS: GOALS, CATS: CATS, current: cur, weekKey: weekKey };

  // まなびプランを 描き直す たびに 1行を つける
  var orig = window.renderTutorPlan;
  if (typeof orig === "function") window.renderTutorPlan = function () { var r = orig.apply(this, arguments); try { chip(); } catch (e) {} return r; };
  var tm = null;
  function later() { clearTimeout(tm); tm = setTimeout(function () { try { chip(); } catch (e) {} }, 50); }
  ["updateUI", "renderStageMaps"].forEach(function (n) { var o = window[n]; if (typeof o === "function" && !o._mgWrapped) { var w = function () { var r = o.apply(this, arguments); later(); return r; }; w._mgWrapped = true; Object.keys(o).forEach(function (k) { w[k] = o[k]; }); window[n] = w; } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.getElementById("mygoal-modal")) close(); });
})();
