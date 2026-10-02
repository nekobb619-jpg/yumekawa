/* =====================================================================
   kanji-sheet.js — 漢字の 書き取りシート（4年）：紙に 書く → アプリで 自分で 丸つけ
   ★2026-10-03追加（ユーザー：「漢字の 書き問題が 少ない」）
   - アプリの 文字入力だと 変換候補に 答えが 出て しまうので、書く 練習は 紙で 行う
   - KANJI_SHEET.make(no, prio)：シート番号から 毎回 同じ 10問。prio（前に まちがえた 言葉）を 先に 入れる
   - 丸つけで × に した 言葉は saveData.kanjiMissed に のこり、次の シートに もう一度 出る（間を あけて 思い出す 練習）
   - ごほうび：その日 はじめての 1まいだけ、○1つ ＝ 1Q。log_db「✍️漢字シート」
   - 言葉は すべて 4年生までに 習う 漢字（2020年からの 配当。県名の 漢字を ふくむ）
   ===================================================================== */
(function () {
  "use strict";
  // [id, 文（【 】が 書く ところ）, 読み, 答え]
  var BANK = [
    [1, "工場の【きかい】が 動く。", "きかい", "機械"], [2, "運動会に【さんか】する。", "さんか", "参加"], [3, "テストの【けっか】を 見る。", "けっか", "結果"],
    [4, "【ゆうき】を 出して 話す。", "ゆうき", "勇気"], [5, "【きせつ】が 春に 変わる。", "きせつ", "季節"], [6, "地図が【ひつよう】だ。", "ひつよう", "必要"],
    [7, "みんなで【きょうりょく】する。", "きょうりょく", "協力"], [8, "今月の【もくひょう】を 立てる。", "もくひょう", "目標"], [9, "理科の【じっけん】を する。", "じっけん", "実験"],
    [10, "アサガオを【かんさつ】する。", "かんさつ", "観察"], [11, "【きろく】を ノートに 書く。", "きろく", "記録"], [12, "【けんこう】に 気を つける。", "けんこう", "健康"],
    [13, "【きぼう】を もって すすむ。", "きぼう", "希望"], [14, "今日の【きゅうしょく】は カレーだ。", "きゅうしょく", "給食"], [15, "六年生が【そつぎょう】する。", "そつぎょう", "卒業"],
    [16, "プリントを【いんさつ】する。", "いんさつ", "印刷"], [17, "駅まで【あんない】する。", "あんない", "案内"], [18, "犬と【さんぽ】する。", "さんぽ", "散歩"],
    [19, "【さいしょ】に 名前を 書く。", "さいしょ", "最初"], [20, "【べんり】な 道具を 使う。", "べんり", "便利"], [21, "家族で【りょうり】を 作る。", "りょうり", "料理"],
    [22, "畑で【やさい】を 育てる。", "やさい", "野菜"], [23, "【しっぱい】しても あきらめない。", "しっぱい", "失敗"], [24, "【しぜん】を 大切に する。", "しぜん", "自然"],
    [25, "山の 上から【けしき】を ながめる。", "けしき", "景色"], [26, "やり方を【せつめい】する。", "せつめい", "説明"], [27, "【ひこうき】に 乗る。", "ひこうき", "飛行機"],
    [28, "【はくぶつかん】へ 行く。", "はくぶつかん", "博物館"], [29, "九九を【おぼ】える。", "おぼ", "覚"], [30, "気持ちを【つた】える。", "つた", "伝"],
    [31, "シャワーを【あ】びる。", "あ", "浴"], [32, "【つめ】たい 水を 飲む。", "つめ", "冷"], [33, "図書室では【しず】かに する。", "しず", "静"],
    [34, "【にいがた】県は 米どころだ。", "にいがた", "新潟"], [35, "【いばらき】県の 北に 福島県が ある。", "いばらき", "茨城"], [36, "【えひめ】県は みかんが 有名だ。", "えひめ", "愛媛"],
    [37, "【ぎふ】県は 海に 面して いない。", "ぎふ", "岐阜"], [38, "【おきなわ】県は 南の 島だ。", "おきなわ", "沖縄"], [39, "【とちぎ】県の 日光に 行く。", "とちぎ", "栃木"],
    [40, "【くまもと】城を 見学する。", "くまもと", "熊本"]
  ].map(function (x) { return { id: x[0], s: x[1], r: x[2], a: x[3] }; });

  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function make(no, prio) {
    var r = rng(no * 104729 + 7), pick = [], used = {};
    (prio || []).slice(0, 5).forEach(function (id) { var w = BANK.filter(function (b) { return b.id === Number(id); })[0]; if (w && !used[w.id]) { used[w.id] = 1; pick.push(w); } });
    var rest = BANK.filter(function (b) { return !used[b.id]; });
    for (var i = rest.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
    while (pick.length < 10 && rest.length) pick.push(rest.shift());
    return pick;
  }
  window.KANJI_SHEET = { BANK: BANK, make: make };
  if (typeof document === "undefined" || !document.body || window.KANJI_PRINT_PAGE) return;

  /* ---------------- アプリ側 ---------------- */
  var BTN = "border:none;border-radius:14px;font-family:'Zen Maru Gothic';font-weight:900;cursor:pointer;";
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function close() { var m = document.getElementById("kanji-modal"); if (m) m.remove(); }
  window.closeKanjiSheet = close;
  function shell(inner) {
    close();
    var w = document.createElement("div"); w.id = "kanji-modal";
    w.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(74,59,82,.45);display:flex;align-items:center;justify-content:center;padding:14px;";
    w.onclick = function (e) { if (e.target === w) close(); };
    w.innerHTML = '<div style="background:#fff;border-radius:22px;padding:16px 14px;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 10px 0 rgba(147,51,234,.22);">' + inner + '</div>';
    document.body.appendChild(w);
  }
  function missed() { var sd = window.saveData || {}; return Array.isArray(sd.kanjiMissed) ? sd.kanjiMissed : []; }

  window.openKanjiSheet = function () {
    var sd = window.saveData || {}, last = sd.kanjiLastSheet, m = missed().length;
    shell(
      '<div style="font-size:18px;font-weight:900;color:#6b21a8;text-align:center;">✍️ 漢字の 書き取りシート</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-soft);text-align:center;margin:4px 0 10px;line-height:1.6;">漢字は 手で 書くと おぼえられる。<br>印刷して 書く → アプリで 自分で 丸つけ（その日 1まい目は ○1つ 1Q）</div>' +
      (m ? '<div style="background:#fff7ed;border-radius:12px;padding:8px 10px;font-size:12px;font-weight:800;color:#c2410c;text-align:center;margin-bottom:10px;">🔁 前に まちがえた 言葉が ' + m + 'こ。次の シートに また 出るよ</div>' : '') +
      '<div style="display:grid;gap:8px;">' +
        '<button style="' + BTN + 'padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#ec4899,#a855f7);" onclick="window.printKanjiSheet()">📄 新しい シートを 印刷する</button>' +
        '<button style="' + BTN + 'padding:11px;font-size:14px;color:#065f46;background:#d1fae5;" onclick="window.kanjiCheckForm()">✅ 丸つけ' + (last ? '（シート No.' + last.no + '）' : '') + '</button>' +
        '<button style="' + BTN + 'padding:9px;font-size:13px;color:#7e22ce;background:#f3e8ff;" onclick="window.closeKanjiSheet()">とじる</button>' +
      '</div>'
    );
  };

  window.printKanjiSheet = function () {
    var no = 1000 + Math.floor(Math.random() * 9000), prio = missed().slice(0, 5);
    var ids = make(no, prio).map(function (w) { return w.id; });
    if (window.saveData) { window.saveData.kanjiLastSheet = { no: no, ids: ids }; if (window.saveGame) window.saveGame(); }
    window.open("./kanji_sheet.html?no=" + no + (prio.length ? "&p=" + prio.join(".") : ""), "_blank");
    window.openKanjiSheet();
  };

  window.kanjiCheckForm = function () {
    var last = (window.saveData || {}).kanjiLastSheet;
    if (!last) { alert("まだ シートを 印刷して いないよ。「新しい シートを 印刷する」から はじめよう！"); return; }
    var words = last.ids.map(function (id) { return BANK.filter(function (b) { return b.id === id; })[0]; }).filter(Boolean);
    window._kanjiMarks = {};
    var rows = words.map(function (w, i) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed #e9d5ff;">' +
        '<div style="flex:1;font-weight:800;color:#4a3b52;font-size:13px;">(' + (i + 1) + ') ' + w.r + '<br><span style="font-size:22px;color:#db2777;">' + w.a + '</span></div>' +
        '<button id="km-o' + i + '" style="' + BTN + 'width:46px;height:40px;font-size:20px;background:#f1f5f9;" onclick="window.kanjiMark(' + i + ',true)">⭕</button>' +
        '<button id="km-x' + i + '" style="' + BTN + 'width:46px;height:40px;font-size:20px;background:#f1f5f9;" onclick="window.kanjiMark(' + i + ',false)">🔁</button></div>';
    }).join("");
    shell('<div style="font-size:17px;font-weight:900;color:#065f46;text-align:center;">✅ 書き取りの 丸つけ（No.' + last.no + '）</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-soft);text-align:center;margin:4px 0 8px;line-height:1.6;">赤い 字と くらべて、とめ・はね・はらいまで 合って いたら ⭕。<br>ちがったら 🔁（次の シートで もう一度）。</div>' + rows +
      '<button style="' + BTN + 'width:100%;margin-top:10px;padding:12px;font-size:15px;color:#fff;background:linear-gradient(135deg,#10b981,#059669);" onclick="window.kanjiSubmit()">丸つけ おわり</button><div id="km-result" style="margin-top:10px;"></div>');
    window._kanjiWords = words;
  };
  window.kanjiMark = function (i, ok) {
    window._kanjiMarks[i] = ok;
    var o = document.getElementById("km-o" + i), x = document.getElementById("km-x" + i);
    if (o) o.style.background = ok ? "#fecdd3" : "#f1f5f9"; if (x) x.style.background = ok ? "#f1f5f9" : "#bfdbfe";
  };
  window.kanjiSubmit = function () {
    var words = window._kanjiWords || [], marks = window._kanjiMarks || {};
    if (Object.keys(marks).length < words.length) { alert("ぜんぶの 言葉に ⭕ か 🔁 を つけてね"); return; }
    var sd = window.saveData || {}, ok = 0, wrongIds = [], last = sd.kanjiLastSheet || {};
    words.forEach(function (w, i) { if (marks[i]) ok++; else wrongIds.push(w.id); });
    var miss = missed().filter(function (id) { return !words.some(function (w, i) { return w.id === id && marks[i]; }); });
    wrongIds.forEach(function (id) { if (miss.indexOf(id) < 0) miss.push(id); });
    sd.kanjiMissed = miss.slice(-20);
    sd.kanjiChecks = Array.isArray(sd.kanjiChecks) ? sd.kanjiChecks : [];
    var t = today(), already = sd.kanjiChecks.some(function (c) { return c.no === last.no; }), rewardedToday = sd.kanjiChecks.some(function (c) { return c.d === t && c.rewarded; });
    var reward = (!already && !rewardedToday) ? ok : 0;
    sd.q = (sd.q || 0) + reward;
    sd.kanjiChecks.push({ no: last.no, d: t, ok: ok, rewarded: reward > 0 }); if (sd.kanjiChecks.length > 10) sd.kanjiChecks = sd.kanjiChecks.slice(-10);
    if (window.saveGame) window.saveGame(); if (window.updateUI) window.updateUI();
    if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "✍️漢字シート", msg: "No." + last.no + " ⭕" + ok + "/" + words.length + (wrongIds.length ? " 🔁" + wrongIds.map(function (id) { return BANK.filter(function (b) { return b.id === id; })[0].a; }).join("・") : "") + " +" + reward + "Q" });
    var res = document.getElementById("km-result");
    if (res) res.innerHTML = '<div style="background:#ecfdf5;border-radius:14px;padding:10px;text-align:center;font-weight:900;color:#065f46;">⭕ ' + ok + ' ／ ' + words.length + (reward ? '　🎁 +' + reward + 'Q' : '') +
      (wrongIds.length ? '<div style="font-size:12px;color:#b45309;margin-top:6px;">🔁 の 言葉は 次の シートに また 出るよ。ゆっくり 書いて おぼえよう！</div>' : '<div style="font-size:12px;margin-top:4px;">ぜんぶ ⭕！ すごい！</div>') + '</div>';
  };

  // 漢字の ステージの 説明画面に ボタンを 足す
  var ob = window.openBriefing;
  if (typeof ob === "function") {
    window.openBriefing = function (stg) {
      var r = ob.apply(this, arguments);
      try {
        if (stg && /漢検|漢字/.test(String(stg.id))) {
          var z = document.getElementById("br-buttons-zone");
          if (z) { var b = document.createElement("button"); b.className = "br-btn"; b.style.cssText = "background:#fce7f3;color:#9d174d;"; b.textContent = "✍️ 紙の 書き取りシートで 練習する"; b.onclick = function () { window.closeBriefing(); window.openKanjiSheet(); }; z.appendChild(b); }
        }
      } catch (e) {}
      return r;
    };
  }
})();
