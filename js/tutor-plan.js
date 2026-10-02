/* =====================================================================
   tutor-plan.js — 「きょうの まなびプラン」（ホーム最上段の個別チューターカード）
   ★2026-10-02追加（ホーム改革：UI/UX＋小4の個別チューター視点）
   - 毎日1回だけ、その子の記録から3ステップを組み立てて saveData.tutorPlan に固定する
       ① ふくしゅう：にがて問題（苦手撃破ラボ）か、3日以上あいたクリア済みステージ（間隔をあけた復習）
       ② あたらしく まなぶ：今週あまりやっていない教科の、まだクリアしていないステージ
       ③ よむ・ちょうせん：今日のおはなし → 今日のなぞとき → 探偵ラボ の順で、まだのもの
   - 「次にやる1つ」だけを大きなボタンにする（選択肢が多すぎて迷わないように）
   - 各ステップに「なぜこれ？」を1行そえる（自分の学び方を知る＝メタ認知）
   - 3つ全部できたら +PLAN_REWARD_Q（1日1回）と れんぞく日数。log_db に「🎯まなびプラン」を記録
   - キャラクター（クロぽん先生・もちっこ）はオリジナルのSVGイラスト。既存キャラクター（他社の著作物）は使わない
   ===================================================================== */
(function () {
  "use strict";

  var PLAN_REWARD_Q = 5;          // 3ステップ全部できたときのおまけ（1日1回）
  var REVIEW_GAP_DAYS = 3;        // この日数以上あいたクリア済みステージを「ふくしゅう」候補にする
  var WEAK_FIRST_THRESHOLD = 3;   // にがて問題がこの数以上たまっていたら、復習は苦手撃破ラボを優先
  var DETECTIVE_KEY = { "算数": "math", "国語": "kokugo", "理科": "science", "社会": "shakai" };

  /* ---------------- キャラクター（オリジナルSVG） ---------------- */
  // クロぽん先生：黒ねこの先生。ピンクのリボン、白いお顔、先生のさし棒（星つき）
  function teacherSvg(mood) {
    var eyes;
    if (mood === "happy" || mood === "cheer") {
      eyes = '<path d="M38 70 q7 -9 14 0" fill="none" stroke="#2b2135" stroke-width="3.6" stroke-linecap="round"/>' +
             '<path d="M68 70 q7 -9 14 0" fill="none" stroke="#2b2135" stroke-width="3.6" stroke-linecap="round"/>';
    } else {
      eyes = '<ellipse cx="45" cy="69" rx="7.2" ry="9" fill="#2b2135"/><ellipse cx="75" cy="69" rx="7.2" ry="9" fill="#2b2135"/>' +
             '<circle cx="47.6" cy="65.4" r="3" fill="#fff"/><circle cx="77.6" cy="65.4" r="3" fill="#fff"/>' +
             '<circle cx="42.6" cy="72.8" r="1.4" fill="#fff" opacity=".8"/><circle cx="72.6" cy="72.8" r="1.4" fill="#fff" opacity=".8"/>';
    }
    var arm = (mood === "cheer")
      ? '<g><rect x="96" y="40" width="4" height="40" rx="2" fill="#c084fc" transform="rotate(18 98 80)"/>' +
        '<path d="M112 30 l3.2 6.6 7.2 1 -5.2 5 1.3 7.2 -6.5 -3.4 -6.5 3.4 1.3 -7.2 -5.2 -5 7.2 -1z" fill="#fde047" stroke="#f59e0b" stroke-width="1.2"/></g>'
      : '<g><rect x="98" y="62" width="4" height="34" rx="2" fill="#c084fc" transform="rotate(28 100 96)"/>' +
        '<path d="M115 54 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.1 5.9 -.8z" fill="#fde047" stroke="#f59e0b" stroke-width="1.1"/></g>';
    return '<svg class="c-teacher" viewBox="0 0 128 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="クロぽん先生">' +
      '<defs>' +
        '<radialGradient id="kpHead" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#5b4a70"/><stop offset="1" stop-color="#231b2d"/></radialGradient>' +
        '<radialGradient id="kpFace" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fbeaf5"/></radialGradient>' +
      '</defs>' +
      '<ellipse cx="62" cy="134" rx="34" ry="5" fill="#a855f7" opacity=".12"/>' +
      // しっぽ
      '<path d="M90 112 q26 -2 22 -26 q-2 -8 -8 -6 q4 14 -16 22z" fill="#2b2135"/>' +
      '<path d="M108 86 l5 -6 2 8z" fill="#2b2135"/>' +
      // からだ
      '<ellipse cx="60" cy="112" rx="32" ry="22" fill="url(#kpHead)"/>' +
      '<ellipse cx="60" cy="116" rx="17" ry="12" fill="#fbeaf5"/>' +
      '<ellipse cx="44" cy="130" rx="9" ry="5.5" fill="#2b2135"/><ellipse cx="76" cy="130" rx="9" ry="5.5" fill="#2b2135"/>' +
      arm +
      // みみ
      '<path d="M18 52 Q10 12 26 10 Q38 14 48 34z" fill="#2b2135"/><path d="M23 40 Q19 20 27 18 Q34 22 40 33z" fill="#f9a8d4"/>' +
      '<path d="M102 52 Q110 12 94 10 Q82 14 72 34z" fill="#2b2135"/><path d="M97 40 Q101 20 93 18 Q86 22 80 33z" fill="#f9a8d4"/>' +
      // あたま
      '<ellipse cx="60" cy="62" rx="48" ry="42" fill="url(#kpHead)"/>' +
      '<ellipse cx="44" cy="34" rx="14" ry="6" fill="#fff" opacity=".12" transform="rotate(-20 44 34)"/>' +
      // 白いお顔
      '<path d="M22 72 Q22 46 60 46 Q98 46 98 72 Q98 98 60 98 Q22 98 22 72z" fill="url(#kpFace)"/>' +
      eyes +
      '<ellipse cx="33" cy="82" rx="7" ry="4.2" fill="#f9a8d4" opacity=".75"/><ellipse cx="87" cy="82" rx="7" ry="4.2" fill="#f9a8d4" opacity=".75"/>' +
      '<path d="M57.5 79 h5 l-2.5 3z" fill="#ec4899"/>' +
      (mood === "cheer"
        ? '<path d="M53 85 q7 9 14 0z" fill="#be185d"/>'
        : '<path d="M53 84 q3.5 3.5 7 0 q3.5 3.5 7 0" fill="none" stroke="#2b2135" stroke-width="2" stroke-linecap="round"/>') +
      // リボン（右みみの下）
      '<g transform="translate(86 26) rotate(18)">' +
        '<path d="M0 0 L-14 -9 Q-17 0 -14 9z" fill="#f472b6"/><path d="M0 0 L14 -9 Q17 0 14 9z" fill="#f472b6"/>' +
        '<path d="M-12 -5 L-4 -1 M12 -5 L4 -1" stroke="#fbcfe8" stroke-width="1.6" stroke-linecap="round"/>' +
        '<circle r="4.6" fill="#ec4899"/><path d="M0 -2.4 l.8 1.6 1.7 .2 -1.2 1.2 .3 1.7 -1.6 -.8 -1.6 .8 .3 -1.7 -1.2 -1.2 1.7 -.2z" fill="#fff"/>' +
      '</g>' +
      '</svg>';
  }

  // もちっこ：白くて まるい おもち の あいぼう。みじかい おみみ、ほっぺ ぽっ
  function buddySvg(mood) {
    var face = (mood === "happy" || mood === "cheer")
      ? '<path d="M22 33 q3 -4 6 0 M36 33 q3 -4 6 0" fill="none" stroke="#3b3042" stroke-width="2" stroke-linecap="round"/>'
      : '<circle cx="25" cy="33" r="2.6" fill="#3b3042"/><circle cx="39" cy="33" r="2.6" fill="#3b3042"/><circle cx="25.9" cy="32" r=".9" fill="#fff"/><circle cx="39.9" cy="32" r=".9" fill="#fff"/>';
    return '<svg class="c-buddy" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="もちっこ">' +
      '<defs><radialGradient id="mcBody" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f4e9f3"/></radialGradient></defs>' +
      '<ellipse cx="32" cy="60" rx="20" ry="3" fill="#a855f7" opacity=".12"/>' +
      '<ellipse cx="20" cy="15" rx="6" ry="9" fill="url(#mcBody)" stroke="#e5d3e6" stroke-width="2" transform="rotate(-14 20 15)"/>' +
      '<ellipse cx="44" cy="15" rx="6" ry="9" fill="url(#mcBody)" stroke="#e5d3e6" stroke-width="2" transform="rotate(14 44 15)"/>' +
      '<ellipse cx="20" cy="16" rx="2.4" ry="4.6" fill="#fbcfe8" transform="rotate(-14 20 16)"/>' +
      '<ellipse cx="44" cy="16" rx="2.4" ry="4.6" fill="#fbcfe8" transform="rotate(14 44 16)"/>' +
      '<path d="M6 42 Q6 20 32 20 Q58 20 58 42 Q58 58 32 58 Q6 58 6 42z" fill="url(#mcBody)" stroke="#e5d3e6" stroke-width="2"/>' +
      face +
      '<ellipse cx="18" cy="40" rx="4.5" ry="2.8" fill="#f9a8d4" opacity=".8"/><ellipse cx="46" cy="40" rx="4.5" ry="2.8" fill="#f9a8d4" opacity=".8"/>' +
      '<path d="M29.5 39 q2.5 2.6 5 0" fill="none" stroke="#3b3042" stroke-width="1.6" stroke-linecap="round"/>' +
      (mood === "cheer" ? '<path d="M52 10 l1.6 3.4 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5z" fill="#fde047"/>' : '') +
      '</svg>';
  }

  window.TUTOR_CHARA = { teacherSvg: teacherSvg, buddySvg: buddySvg };
  // となりに出る なかま（js/mascots.js でえらんだ子。読み込み前・未選択なら もちっこ）
  function friendSvg(mood) {
    try { if (window.MASCOTS) return window.MASCOTS.currentSvg(mood); } catch (e) {}
    return buddySvg(mood);
  }

  /* ---------------- 小さな道具 ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function nowMs() { return window.currentServerTime || Date.now(); }
  function keyOf(ms) { var d = new Date(ms); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function todayKey() { return keyOf(nowMs()); }
  function yesterdayKey() { return keyOf(nowMs() - 86400000); }
  function sd() { return window.saveData || {}; }

  // 表示中（学年フィルタを通った）ステージを、画面の並び順のまま一列にする
  function listStages() {
    var out = [];
    var master = window.globalStageMaster || {};
    Object.keys(master).forEach(function (sub) {
      Object.keys(master[sub] || {}).forEach(function (cat) {
        (master[sub][cat] || []).forEach(function (stg) {
          if (!stg || !stg.id || String(stg.id).trim() === "") return;
          if (window.matchesGradeFilter && !window.matchesGradeFilter(stg)) return;
          out.push({ stg: stg, sub: sub, cat: cat });
        });
      });
    });
    return out;
  }
  function findStage(id) {
    var all = listStages();
    for (var i = 0; i < all.length; i++) if (all[i].stg.id === id) return all[i];
    return null;
  }
  function isMasterStage(id) {
    var rc = sd().reviewCounts || {};
    return !!(window.MASTER_CLEAR_THRESHOLD && rc[id] >= window.MASTER_CLEAR_THRESHOLD);
  }
  function subjectLabel(sub) {
    var m = window.subjectDictionary && window.subjectDictionary[sub];
    return m ? m.label : sub;
  }

  // answerLogs の category → 教科 の対応表（ステージ定義から作る）
  function categoryToSubjectMap(entries) {
    var map = {};
    entries.forEach(function (e) {
      map[e.stg.category || e.sub] = e.sub;
      map[e.sub] = e.sub;
    });
    if (window.CONTENT && Array.isArray(window.CONTENT.stages)) {
      window.CONTENT.stages.forEach(function (s) { if (s.subject) map[s.category || s.subject] = map[s.category || s.subject] || s.subject; });
    }
    return map;
  }
  function recentCountBySubject(entries, days) {
    var since = nowMs() - days * 86400000;
    var map = categoryToSubjectMap(entries);
    var counts = {};
    (sd().answerLogs || []).forEach(function (l) {
      if (!l || !l.ts || l.ts < since) return;
      var sub = map[l.category];
      if (sub) counts[sub] = (counts[sub] || 0) + 1;
    });
    return counts;
  }
  function dayIndex() { return Math.floor(nowMs() / 86400000); }

  /* ---------------- プランを組み立てる（1日1回） ---------------- */
  function buildPlan() {
    var entries = listStages();
    var data = sd();
    var weakN = (data.weakQuestions || []).length;
    var steps = [];

    // ① ふくしゅう
    var reviewCands = entries.filter(function (e) {
      var f = window.computeStageBadgeFlags ? window.computeStageBadgeFlags(e.stg) : { isCleared: !!(data.clearedStages || {})[e.stg.id] };
      var rd = (data.reviewDates || {})[e.stg.id];
      return f.isCleared && !isMasterStage(e.stg.id) && rd && (nowMs() - rd) >= REVIEW_GAP_DAYS * 86400000;
    }).sort(function (a, b) { return (data.reviewDates[a.stg.id] || 0) - (data.reviewDates[b.stg.id] || 0); });
    var used = {};
    function reviewStep(e) {
      var days = Math.floor((nowMs() - data.reviewDates[e.stg.id]) / 86400000);
      used[e.stg.id] = true;
      return { kind: "stage", role: "review", id: e.stg.id, name: e.stg.name, sub: e.sub,
               why: days + "日ぶり。わすれかけた ころに 思い出すと、記憶が ぐんと 強くなるよ" };
    }
    if (weakN >= WEAK_FIRST_THRESHOLD) {
      steps.push({ kind: "weak", name: "にがて問題 " + weakN + "問を やっつけよう", why: "まちがえた問題こそ のびるチャンス。もういちど 考えよう" });
    } else if (reviewCands.length > 0) {
      steps.push(reviewStep(reviewCands[0]));
    } else if (weakN > 0) {
      steps.push({ kind: "weak", name: "にがて問題 " + weakN + "問を やっつけよう", why: "まちがえた問題こそ のびるチャンス。もういちど 考えよう" });
    }

    // ② あたらしく まなぶ：今週の問題数が少ない教科から、まだのステージを1つ
    var counts = recentCountBySubject(entries, 7);
    var bySub = {};
    entries.forEach(function (e) {
      if (used[e.stg.id]) return;
      var f = window.computeStageBadgeFlags ? window.computeStageBadgeFlags(e.stg) : { isCleared: !!(data.clearedStages || {})[e.stg.id], isNewStage: false };
      if (f.isCleared) return;
      (bySub[e.sub] = bySub[e.sub] || []).push({ e: e, isNew: !!f.isNewStage });
    });
    var subs = Object.keys(bySub);
    if (subs.length > 0) {
      var rot = dayIndex();
      subs.sort(function (a, b) {
        var d = (counts[a] || 0) - (counts[b] || 0);
        if (d !== 0) return d;
        return ((subs.indexOf(a) + rot) % subs.length) - ((subs.indexOf(b) + rot) % subs.length);
      });
      var pickSub = subs[0];
      var list = bySub[pickSub];
      var pick = list.filter(function (x) { return x.isNew; })[0] || list[0];
      var n = counts[pickSub] || 0;
      steps.push({ kind: "stage", role: "learn", id: pick.e.stg.id, name: pick.e.stg.name, sub: pickSub,
                   why: (n === 0 ? "今週は まだ " + subjectLabel(pickSub) + "を やっていないよ。" : "今週の " + subjectLabel(pickSub) + "は " + n + "問。") +
                        (pick.isNew ? "🆕 新しい ステージだよ" : "バランスよく 進めよう") });
      used[pick.e.stg.id] = true;
    } else {
      var more = reviewCands.filter(function (e) { return !used[e.stg.id]; })[0];
      if (more) { var rs = reviewStep(more); rs.role = "review2"; steps.push(rs); }
    }

    // ③ よむ・ちょうせん
    var bookDone = data.bookLastReadDate === todayKey();
    var myst = window.getTodayMysteryInfo ? window.getTodayMysteryInfo() : null;
    var third = [];
    if (!bookDone) third.push({ kind: "book", name: "今日のおはなしを 読もう", why: "毎日 すこしずつ 読むと、読む 力が 育つよ" });
    if (myst && !myst.cleared) third.push({ kind: "mystery", name: myst.title, why: "「なぜ？」を じゅんばんに 考える 練習だよ" });
    var mainSub = (steps.filter(function (s) { return s.role === "learn"; })[0] || {}).sub;
    third.push({ kind: "detective", key: DETECTIVE_KEY[mainSub] || "math", name: subjectLabel(mainSub && DETECTIVE_KEY[mainSub] ? mainSub : "算数") + "の 探偵ラボ",
                 why: "しっかり 考えないと とけない 問題に ちょうせん" });
    while (steps.length < 3 && third.length > 0) steps.push(third.shift());

    return { date: todayKey(), steps: steps, marks: {}, rewarded: false, createdAt: nowMs() };
  }

  function stepDone(step, plan) {
    var data = sd();
    if (!step) return false;
    if (step.kind === "stage") {
      var rd = (data.reviewDates || {})[step.id];
      return !!((data.clearedStages || {})[step.id] && rd && keyOf(rd) === plan.date && rd >= (plan.createdAt || 0) - 1000);
    }
    if (step.kind === "weak") return !!(plan.marks && plan.marks.weak) || (data.weakQuestions || []).length === 0;
    if (step.kind === "book") return data.bookLastReadDate === plan.date;
    if (step.kind === "mystery") { var m = window.getTodayMysteryInfo ? window.getTodayMysteryInfo() : null; return !!(m && m.cleared); }
    if (step.kind === "detective") return !!(plan.marks && plan.marks.detective);
    return false;
  }

  function ensurePlan() {
    var data = sd();
    if (!data || !window.globalStageMaster || Object.keys(window.globalStageMaster).length === 0) return null;
    var p = data.tutorPlan;
    if (!p || p.date !== todayKey() || !Array.isArray(p.steps) || p.steps.length === 0) {
      p = buildPlan();
      data.tutorPlan = p;
    }
    if (!p.marks) p.marks = {};
    return p;
  }

  /* ---------------- 動かす ---------------- */
  window.tutorPlanStart = function (idx) {
    var p = ensurePlan(); if (!p) return;
    var step = p.steps[idx]; if (!step) return;
    if (step.kind === "weak") return window.launchWeakAttackLab && window.launchWeakAttackLab();
    if (step.kind === "book") return window.openBookModal && window.openBookModal();
    if (step.kind === "mystery") return window.launchBossQuest && window.launchBossQuest();
    if (step.kind === "detective") return window.startDetectiveLab && window.startDetectiveLab(step.key || "math");
    if (step.kind === "stage") {
      var e = findStage(step.id);
      if (!e) { alert("このステージは いま 見つからないみたい。教科の ぼうけんから えらんでね！"); return; }
      // ステージ一覧（renderStageMaps）と同じ判定で isReview / isMaster をつけてから開く
      var stg = e.stg;
      var cleared = !!(sd().clearedStages || {})[stg.id];
      var master = isMasterStage(stg.id);
      var review = false;
      var rd = (sd().reviewDates || {})[stg.id];
      if (cleared && !master && rd && (nowMs() - rd) / 86400000 >= 1.0) review = true;
      stg.isReview = review; stg.isMaster = master;
      window.openBriefing(stg);
    }
  };

  window.tutorPlanMark = function (kind) {
    var p = ensurePlan(); if (!p) return;
    p.marks[kind] = true;
    scheduleRender();
  };

  function naviMessage(p, doneN) {
    var data = sd();
    var logs = data.answerLogs || [];
    var name = (document.getElementById("display-player-name") || {}).textContent || "";
    name = (name && name !== "---") ? name + "、" : "";
    if (doneN >= p.steps.length) return "きょうの プラン ぜんぶ できたね！ コツコツ つづける 力、ほんとうに すごいよ 🌸";
    var tk = todayKey(), yk = yesterdayKey();
    var todayN = 0, yN = 0;
    logs.forEach(function (l) { if (!l || !l.ts) return; var k = keyOf(l.ts); if (k === tk) todayN++; else if (k === yk) yN++; });
    // 正かい率の のび（直近20問 と その前の20問）
    if (logs.length >= 40) {
      var rate = function (arr) { return Math.round(100 * arr.filter(function (l) { return l.correct; }).length / arr.length); };
      var a = rate(logs.slice(-40, -20)), b = rate(logs.slice(-20));
      if (b - a >= 5) return "さいきん 正かい率が " + a + "% → " + b + "% に アップ！ 練習した 分だけ のびてるよ ✨";
    }
    var next = p.steps.filter(function (s) { return !stepDone(s, p); })[0];
    var nextLabel = next ? (next.kind === "stage" ? "「" + next.name + "」" : next.kind === "weak" ? "にがて問題" : next.kind === "book" ? "おはなし" : next.kind === "mystery" ? "なぞとき" : "探偵ラボ") : "";
    if (todayN > 0) return "きょうは もう " + todayN + "問 チャレンジしたね！ つぎは " + nextLabel + " だよ";
    if (yN > 0) return name + "きのうは " + yN + "問 がんばったね。きょうは " + nextLabel + " から いこう！";
    return name + "おかえり！ きょうは " + nextLabel + " から はじめよう。いっしょに やろうね";
  }

  function render(opts) {
    opts = opts || {};
    var card = document.getElementById("tutor-plan-card");
    var stepsEl = document.getElementById("tplan-steps");
    var dotsEl = document.getElementById("tplan-dots");
    var footEl = document.getElementById("tplan-foot");
    var chara = document.getElementById("tplan-chara");
    if (!card || !stepsEl) return;
    var p = ensurePlan();
    if (!p) {
      if (chara && chara.getAttribute("data-mood") !== "normal") { chara.innerHTML = teacherSvg("normal") + friendSvg("normal"); chara.setAttribute("data-mood", "normal"); }
      stepsEl.innerHTML = '<div class="tplan-step"><div class="body"><div class="why">プランを じゅんびちゅう…</div></div></div>';
      return;
    }
    var doneFlags = p.steps.map(function (s) { return stepDone(s, p); });
    var doneN = doneFlags.filter(Boolean).length;
    var allDone = doneN >= p.steps.length;
    var nextIdx = doneFlags.indexOf(false);
    var KIND = { review: "🔁 ふくしゅう", review2: "🔁 ふくしゅう", learn: "🎯 あたらしく まなぶ", weak: "🔁 ふくしゅう", book: "📖 よむ", mystery: "🧩 ちょうせん", detective: "🔍 ちょうせん" };
    var NUM = ["①", "②", "③", "④"];
    stepsEl.innerHTML = p.steps.map(function (s, i) {
      var done = doneFlags[i];
      var kind = KIND[s.role] || KIND[s.kind] || "";
      var sub = s.sub ? " ・ " + esc(subjectLabel(s.sub)) : "";
      var btn = done ? '<span class="go" style="background:#dcfce7;color:#15803d;cursor:default;">できた！</span>'
                     : '<button class="go" onclick="window.tutorPlanStart(' + i + ')">' + (i === nextIdx ? "▶ はじめる" : "やる") + '</button>';
      return '<div class="tplan-step' + (done ? " done" : "") + (i === nextIdx ? " next" : "") + '">' +
        '<div class="num">' + (done ? "✅" : NUM[i]) + '</div>' +
        '<div class="body"><div class="kind">' + kind + sub + '</div><div class="name">' + esc(s.name) + '</div>' +
        (done ? "" : '<div class="why">💡 ' + esc(s.why) + '</div>') + '</div>' + btn + '</div>';
    }).join("");
    if (dotsEl) dotsEl.innerHTML = p.steps.map(function (s, i) { return '<i class="' + (doneFlags[i] ? "on" : "") + '"></i>'; }).join("");
    var streak = sd().tutorPlanStreak || 0;
    var streakAlive = sd().tutorPlanLastDoneDate === todayKey() || sd().tutorPlanLastDoneDate === yesterdayKey();
    if (footEl) {
      footEl.innerHTML = allDone
        ? "🎉 きょうの プラン たっせい！ 🔥<b>" + streak + "日</b> れんぞく"
        : "3つ ぜんぶ できたら <b>+" + PLAN_REWARD_Q + "Q ＆ 🥚</b>" + (streakAlive && streak > 0 ? "　🔥れんぞく <b>" + streak + "日</b>" : "");
    }
    card.classList.toggle("all-done", allDone);
    if (chara) {
      var mood = allDone ? "cheer" : (doneN > 0 ? "happy" : "normal");
      if (chara.getAttribute("data-mood") !== mood) {
        chara.innerHTML = teacherSvg(mood) + friendSvg(mood);
        chara.setAttribute("data-mood", mood);
      }
    }
    var tileArt = document.getElementById("friends-tile-art");
    if (tileArt && window.MASCOTS) { var fid = window.MASCOTS.currentName(); if (tileArt.getAttribute("data-f") !== fid) { tileArt.innerHTML = friendSvg("normal"); tileArt.setAttribute("data-f", fid); } }
    var navi = document.getElementById("navi-say");
    if (navi && (opts.greet || allDone || navi.getAttribute("data-tplan") === "1")) {
      navi.textContent = naviMessage(p, doneN);
      navi.setAttribute("data-tplan", "1");
    }
    if (allDone && !p.rewarded) giveReward(p);
  }

  function giveReward(p) {
    var data = sd();
    p.rewarded = true;
    var last = data.tutorPlanLastDoneDate;
    data.tutorPlanStreak = (last === yesterdayKey()) ? (data.tutorPlanStreak || 0) + 1 : (last === todayKey() ? (data.tutorPlanStreak || 1) : 1);
    data.tutorPlanLastDoneDate = todayKey();
    data.tutorPlanDoneCount = (data.tutorPlanDoneCount || 0) + 1;
    data.q = (data.q || 0) + PLAN_REWARD_Q;
    // ★2026-10-03追加：なかまのたまご（js/nakama-egg.js）を 1こ、3日れんぞくごとに もう1こ
    var eggGift = (data.tutorPlanStreak % 3 === 0) ? 2 : 1;
    if (window.grantNakamaEgg) window.grantNakamaEgg(eggGift, "まなびプラン達成" + (eggGift === 2 ? "＋3日れんぞく" : ""));
    if (window.saveGame) window.saveGame();
    if (window.syncWithGoogleSpreadsheet) {
      window.syncWithGoogleSpreadsheet("LOG", {
        stage: "🎯まなびプラン",
        msg: "3ステップ達成 +" + PLAN_REWARD_Q + "Q れんぞく" + data.tutorPlanStreak + "日 通算" + data.tutorPlanDoneCount + "回 [" +
             p.steps.map(function (s) { return (s.role || s.kind) + (s.id ? ":" + s.id : ""); }).join(", ") + "]"
      });
    }
    var newFriend = window.MASCOTS ? window.MASCOTS.newlyUnlockedAt(data.tutorPlanDoneCount) : null;
    showCelebration(data.tutorPlanStreak, newFriend);
    setTimeout(function () { if (window.updateUI) window.updateUI(); }, 0);
  }

  function showCelebration(streak, newFriend) {
    var old = document.getElementById("tplan-celebrate"); if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.id = "tplan-celebrate";
    wrap.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:16px;";
    var confetti = "";
    var colors = ["#f472b6", "#c084fc", "#fde047", "#67e8f9", "#86efac"];
    for (var i = 0; i < 18; i++) {
      confetti += '<span style="position:absolute;top:-10px;left:' + (5 + i * 5.2) + '%;width:8px;height:12px;border-radius:2px;background:' + colors[i % colors.length] +
        ';animation:tplanFall ' + (1.6 + (i % 5) * 0.25) + 's ' + (i % 6) * 0.12 + 's ease-in forwards;"></span>';
    }
    wrap.innerHTML =
      '<style>@keyframes tplanFall{to{transform:translateY(420px) rotate(540deg);opacity:0}}@keyframes tplanPop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}' +
      '#tplan-celebrate .c-teacher{width:120px;height:132px}#tplan-celebrate .c-buddy{width:62px;height:62px;margin-left:-20px}</style>' +
      '<div style="position:relative;overflow:hidden;background:linear-gradient(160deg,#fff,#fdf2f8 60%,#fef9c3);border-radius:26px;padding:20px 18px 18px;max-width:340px;width:100%;text-align:center;box-shadow:0 10px 0 rgba(147,51,234,.25);animation:tplanPop .45s ease-out;">' +
        confetti +
        '<div style="display:flex;justify-content:center;align-items:flex-end;">' + teacherSvg("cheer") + (newFriend ? newFriend.svg("cheer") : friendSvg("cheer")) + '</div>' +
        '<div style="font-size:20px;font-weight:900;color:#be185d;margin-top:6px;">きょうの プラン たっせい！</div>' +
        '<div style="font-size:13px;font-weight:800;color:#6b21a8;margin:8px 0 4px;line-height:1.7;">ふくしゅう・あたらしい 学び・ちょうせん、<br>ぜんぶ やりきったね。えらい！</div>' +
        '<div style="font-size:15px;font-weight:900;color:#4a3b52;margin:6px 0 12px;">🎁 +' + PLAN_REWARD_Q + 'Q　🥚 たまご +' + (streak % 3 === 0 ? 2 : 1) + '　🔥 ' + streak + '日 れんぞく</div>' +
        (newFriend ? '<div style="font-size:13px;font-weight:900;color:#db2777;background:#fff;border-radius:14px;padding:8px;margin:-4px 0 12px;">🐾 ' + newFriend.kind + 'の「' + newFriend.name + '」が なかまに なったよ！<br><span style="font-size:11px;color:#7e22ce;">どうぐばこの「なかま」で いっしょに いられるよ</span></div>' : '') +
        '<button style="border:none;border-radius:999px;padding:12px 26px;font-family:\'Zen Maru Gothic\';font-weight:900;font-size:15px;color:#fff;background:linear-gradient(135deg,#ec4899,#a855f7);box-shadow:0 4px 0 #86198f;cursor:pointer;" onclick="document.getElementById(\'tplan-celebrate\').remove()">やったー！</button>' +
      '</div>';
    document.body.appendChild(wrap);
    if (window.speakText) { try { window.speakText("きょうのプラン、たっせい！", "ja-JP"); } catch (e) {} }
  }

  var renderTimer = null;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () { try { render(); } catch (e) { console.error("tutor-plan render", e); } }, 0);
  }
  window.renderTutorPlan = function (opts) { try { render(opts); } catch (e) { console.error("tutor-plan render", e); } };

  // index.html 側の updateUI / renderStageMaps（ステージ終了・ログイン・データ更新のたびに呼ばれる）にあわせて描き直す
  function wrapAfter(name) {
    var orig = window[name];
    if (typeof orig !== "function" || orig._tplanWrapped) return;
    var wrapped = function () { var r = orig.apply(this, arguments); scheduleRender(); return r; };
    wrapped._tplanWrapped = true;
    window[name] = wrapped;
  }
  wrapAfter("updateUI");
  wrapAfter("renderStageMaps");
  wrapAfter("refreshBookBanner");
  wrapAfter("refreshDailyMissionBanner");

  var chara0 = document.getElementById("tplan-chara");
  if (chara0) { chara0.innerHTML = teacherSvg("normal") + friendSvg("normal"); chara0.setAttribute("data-mood", "normal"); }
})();
