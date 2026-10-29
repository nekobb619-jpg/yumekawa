/* =====================================================================
   js/detective-boost.js — 探偵ラボの じっくりごほうび ＋ 🕵️ 探偵ランク
   ★2026-10-29追加（保護者：10/2 に 探偵ラボを 考える 問題に かえてから、pt・Q 稼ぎが できなく なって 取り組まなく なった。
     難しさは そのまま、考えて 解く 方が 得に なる 形に。①じっくりごほうびを 探偵ラボにも ③入口を やさしく（index.html の DL_SCHOOL_MAX 2→3） ④探偵ランク）
   ・探偵ラボで 1回目に 正解 → シールの かけら +1。3〜120秒 考えて 1回目で 正解 → かけら +2 と じっくりボーナス（うら pt。1日の 上限は ステージと 共通）。
     （ステージ用の recordAnswerLog は 探偵ラボを 記録しないので、ここで triggerCorrectAnswer を つつむ）
   ・探偵ランク：1回目で ぜんぶ 正解した 回（＝credit が 問題数と 同じ）の 数で 称号が 上がる。saveData.detectiveRank = { perfect, runs }。
     ホームの 探偵ラボの ボタンの 上に 表示。ランクが 上がったら おしらせ＋LOG。
   ===================================================================== */
(function () {
  var MIN_MS = 3000, MAX_MS = 120000;
  var RANKS = [
    { at: 0, name: "見習い探偵", icon: "🔎" },
    { at: 3, name: "かけだし探偵", icon: "🕵️" },
    { at: 10, name: "一人前の 探偵", icon: "🎩" },
    { at: 25, name: "めいたんてい", icon: "🏅" },
    { at: 50, name: "伝説の 名探偵", icon: "👑" }
  ];
  var SUBJ = { math: "算数", kokugo: "国語", science: "理科", shakai: "社会" };
  var run = null; // いまの 探偵ラボ 1回分 { subject, shards, pts, think }

  function rankOf(n) { var r = RANKS[0]; RANKS.forEach(function (x) { if (n >= x.at) r = x; }); return r; }
  function nextOf(n) { for (var i = 0; i < RANKS.length; i++) if (RANKS[i].at > n) return RANKS[i]; return null; }
  function data() {
    var sd = window.saveData; if (!sd) return null;
    if (!sd.detectiveRank || typeof sd.detectiveRank !== "object") sd.detectiveRank = { perfect: 0, runs: 0 };
    return sd.detectiveRank;
  }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🕵️探偵ランク", msg: msg }); } catch (e) {} }
  function toast(html, ms) {
    var t = document.createElement("div");
    t.style.cssText = "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:10004;background:#1f1b2e;color:#fff;border:2px solid #fbbf24;border-radius:16px;padding:10px 16px;font:900 13px 'Zen Maru Gothic',sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.3);max-width:88vw;text-align:center;line-height:1.6";
    t.innerHTML = html; document.body.appendChild(t); setTimeout(function () { t.remove(); }, ms || 4200);
  }

  function badgeHtml() {
    var d = data(); if (!d) return "";
    var r = rankOf(d.perfect), nx = nextOf(d.perfect);
    var pct = nx ? Math.round((d.perfect - r.at) / (nx.at - r.at) * 100) : 100;
    return '<div style="font-size:24px">' + r.icon + '</div><div style="flex:1;min-width:0">' +
      '<div style="font-size:11px;font-weight:900;color:#a16207">きみの 探偵ランク</div>' +
      '<div style="font-size:15px;font-weight:900;color:#422006">' + r.name + '</div>' +
      '<div style="height:7px;background:#fef3c7;border-radius:999px;overflow:hidden;margin:3px 0"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f59e0b,#eab308)"></div></div>' +
      '<div style="font-size:10.5px;font-weight:800;color:#92400e">' + (nx ? '1回目で ぜんぶ 正解 あと ' + (nx.at - d.perfect) + '回で「' + nx.name + '」' : 'さいこうランク！') + '（いま ' + d.perfect + '回）</div>' +
      '<div style="font-size:10px;font-weight:700;color:#a16207">じっくり 考えて 1回目で 正解すると、シールの かけらが もらえるよ</div></div>';
  }
  function renderBadge() {
    try {
      var menu = document.querySelector(".detective-lab-menu"); if (!menu || !window.saveData) return;
      var el = document.getElementById("dl-rank");
      if (!el) { el = document.createElement("div"); el.id = "dl-rank"; el.style.cssText = "display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fbbf24;border-radius:14px;padding:8px 12px;margin:6px 0;font-family:'Zen Maru Gothic',sans-serif"; menu.parentNode.insertBefore(el, menu); }
      el.innerHTML = badgeHtml();
    } catch (e) {}
  }
  window.renderDetectiveRank = renderBadge;

  function wrap(name, before, after) {
    var o = window[name]; if (typeof o !== "function" || o._dbWrapped) return !!(o && o._dbWrapped);
    var w = function () {
      var pre = null; try { if (before) pre = before.apply(this, arguments); } catch (e) {}
      var r = o.apply(this, arguments);
      try { if (after) after.call(this, arguments, pre); } catch (e) { console.error("detective-boost", e); }
      return r;
    };
    w._dbWrapped = true; window[name] = w; return true;
  }
  function install() {
    var a = wrap("startDetectiveLab", function (subject) { return { subject: subject, count: window.saveData && window.saveData.detectiveLabDailyCount }; }, function (args, pre) {
      // 1日の 回数が いっぱいで はじまらなかった ときは 何も しない
      if (window.dynamicPracticeModeActive && window.saveData && pre && window.saveData.detectiveLabDailyCount !== pre.count) run = { subject: args[0], shards: 0, pts: 0, think: 0 };
    });
    // ごほうびは 正解の 処理より 前（before）で わたす（あとの 処理で 画面の エラーが 出ても もらえる ように）
    var b = wrap("triggerCorrectAnswer", function () {
      if (!run || !window.dynamicPracticeModeActive || !window.currentFirstTry) return null;
      var st = window.currentQuestionStartedAt, ms = typeof st === "number" ? Date.now() - st : null;
      var th = ms !== null && ms >= MIN_MS && ms <= MAX_MS, tag = SUBJ[run.subject] || "";
      if (window.stickerAddShardsExternal) run.shards += window.stickerAddShardsExternal(th ? 2 : 1, tag);
      if (window.stickerMissionEvent) { window.stickerMissionEvent("first"); if (th) window.stickerMissionEvent("think"); }
      if (th) { run.think += 1; if (window.thinkBonusAwardExternal) run.pts += window.thinkBonusAwardExternal(); }
      return null;
    }, null);
    var c = wrap("finishDynamicPractice", function () {
      var total = (window.currentQuestions || []).length, credit = Number(window.dynamicPracticeCreditSum || 0);
      return { perfect: !!run && total > 0 && credit >= total, isLab: !!run };
    }, function (args, pre) {
      if (!pre || !pre.isLab) return;
      var d = data(), r0 = rankOf(d.perfect);
      d.runs += 1; if (pre.perfect) d.perfect += 1;
      var r1 = rankOf(d.perfect), res = run; run = null;
      if (res && (res.shards || res.think)) {
        log("探偵ラボ（" + (SUBJ[res.subject] || "") + "）じっくり正解 " + res.think + "問・かけら +" + res.shards + "・じっくりボーナス（うら） +" + res.pts + "pt");
      }
      if (r1 !== r0) log("ランクアップ：" + r1.name + "（1回目で ぜんぶ 正解 " + d.perfect + "回）");
      try { if (window.saveGame) window.saveGame(); } catch (e) {}
      renderBadge();
      setTimeout(function () {
        var html = "";
        if (r1 !== r0) html += r1.icon + " 探偵ランク アップ！<br>「" + r1.name + "」に なったよ！<br>";
        else if (pre.perfect) html += "🔍 1回目で ぜんぶ 正解！ 探偵ランクに +1<br>";
        if (res && res.shards) html += "🧩 シールの かけら +" + res.shards + "こ" + (res.think ? "（じっくり 正解 " + res.think + "問）" : "");
        if (html) toast(html, r1 !== r0 ? 6000 : 4200);
      }, 600);
    });
    renderBadge();
    return a && b && c;
  }
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
  // ログイン後（セーブ 読みこみ後）にも かき直す
  var m = 0, iv2 = setInterval(function () { renderBadge(); if (++m > 20) clearInterval(iv2); }, 1500);
})();
