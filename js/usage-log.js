/* =====================================================================
   usage-log.js — どの 画面・ボタンが 使われているかの 記録（📊画面の利用）
   ★2026-10-03追加：「あまり使われていない要素は？」に データで 答えられるように する。
   - 下の FEATURES の 関数が 呼ばれた回数を、その日の分だけ saveData.uiUse = { d: "YYYY-M-D", c: {名前: 回数} } に 数える
   - 日付が 変わって 最初に 数えるとき、前の日の 回数を log_db に「📊画面の利用」として 1行 送ってから リセット
   - 折りたたみ（ポリアンナ・作品読解6 など）は 開いた ときだけ 数える
   - 一番 最後に 読みこむ（ほかの js が 関数を 用意した あとに 包む）
   ===================================================================== */
(function () {
  "use strict";
  var FEATURES = {
    tutorPlanStart: "プランのボタン", openBookModal: "おはなし", launchBossQuest: "なぞとき",
    launchWeakAttackLab: "苦手撃破ラボ", startDetectiveLab: "探偵ラボ", openBriefing: "ステージを開く",
    openFriendsModal: "なかま", openStickerBook: "シール帳", openNakamaEgg: "たまごを割る", openTutorScreen: "チューター", openGrowthModal: "せいちょう",
    openWeeklyMissionModal: "今週のもくひょう", openReadingNote: "読書ノート", openBookshelf: "本だな",
    openObservationNote: "かんさつ記録", openObservationList: "かんさつを見る", openHissanSheet: "筆算シート", openKanjiSheet: "漢字シート", openJigakuNote: "自学ノート", openYokatta: "よかった帳",
    openStampModal: "ログインスタンプ", openTreasureBookModal: "お宝図鑑", openGachaModal: "ガチャ", openKuroPonModal: "クロぽん",
    launchSurvivalMode: "サバイバル", exchangePtsToQ: "pts両替", exchangePtsToQBulk: "まとめて両替",
    openParentReportModal: "ほごしゃレポート", openAllowanceScreen: "おこづかい", fetchBattleStats: "きょうだいバトル",
    fetchSurvivalLeaderboard: "サバイバルランキング", buyShopItem: "宝島ショップ", useInventoryItem: "アイテム使用"
  };
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function count(name) {
    var sd = window.saveData; if (!sd) return;
    var u = sd.uiUse;
    if (!u || typeof u !== "object" || !u.c) u = sd.uiUse = { d: today(), c: {} };
    if (u.d !== today()) {
      var keys = Object.keys(u.c);
      if (keys.length && window.syncWithGoogleSpreadsheet) {
        window.syncWithGoogleSpreadsheet("LOG", { stage: "📊画面の利用", msg: u.d + " " + keys.map(function (k) { return k + u.c[k]; }).join(" ") });
      }
      u = sd.uiUse = { d: today(), c: {} };
    }
    if (!u.c[name]) bonus(sd, name);
    u.c[name] = (u.c[name] || 0) + 1;
  }
  // ★2026-10-03追加（保護者案）：メインの ボタンを その日 はじめて 開いたら 0.1pt を 裏で ためる（10こ たまると 1pt）。
  //   ボタンが 28こ あっても 1日 最大 2.8pt（20pt＝1Q なので 約0.14Q）。問題 1問の 正解（5pt 前後）より 小さく、バランスは くずれない。
  //   お金・アイテムの 操作と、勉強そのもの（ステージを 開く）は 入れない。折りたたみ（開:〜）も 入れない。
  var NO_BONUS = ["pts両替", "まとめて両替", "宝島ショップ", "アイテム使用", "たまごを割る", "ステージを開く", "きょうだいバトル", "サバイバルランキング", "かんさつを見る"];
  function bonus(sd, name) {
    if (name.indexOf("開:") === 0 || NO_BONUS.indexOf(name) >= 0) return;
    sd.uiBonusTenths = (Number(sd.uiBonusTenths) || 0) + 1;
    if (sd.uiBonusTenths >= 10) { sd.uiBonusTenths -= 10; sd.pts = (Number(sd.pts) || 0) + 1; }
  }
  Object.keys(FEATURES).forEach(function (fn) {
    var orig = window[fn];
    if (typeof orig !== "function" || orig._usageWrapped) return;
    var w = function () { try { count(FEATURES[fn]); } catch (e) {} return orig.apply(this, arguments); };
    w._usageWrapped = true;
    Object.keys(orig).forEach(function (k) { w[k] = orig[k]; });
    window[fn] = w;
  });
  // 折りたたみ：開くときだけ、見出しの 先頭の ことばで 数える
  var acc = window.toggleAcc;
  if (typeof acc === "function") {
    window.toggleAcc = function (el) {
      try {
        var body = el && el.nextElementSibling, opening = body && !body.classList.contains("open");
        if (opening) { var label = (el.textContent || "").replace(/\s+/g, "").slice(0, 10); if (label) count("開:" + label); }
      } catch (e) {}
      return acc.apply(this, arguments);
    };
  }
})();
