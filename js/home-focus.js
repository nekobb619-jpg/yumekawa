/* =====================================================================
   js/home-focus.js — 🏠 ホームは「きょうの まなびプラン」を いちばん 上に（2026-11-12）
   保護者：ホームの 上は プランだけ。ラボ・おはなし・なぞとき などの カードは、プランの あとで ひらく「おたのしみ」の 棚へ。
   - まなびプランの カード（#tutor-plan-card）と「📚 教科の ぼうけん」の 見出しの 間に ならぶ カードを、
     1つの 棚（<details id="hf-shelf">）に まとめる。カードの 中身・ボタン・Q は 何も 変えない（場所だけ）。
   - プランの 3つが おわるまで：棚は とじて いる（中に 何が あるかは 見出しに 出す）。おせば 先に 見られる（止めない）。
     プランが たっせい：棚が 自動で ひらく。
   - KEEP_OUT の カードは 棚に 入れない（行事の 準備など、日にちが 決まって いる もの）。
   - ほかの js（daily-lab.js・field-trip.js など）は 描き直すたびに カードを プランの すぐ 下へ もどすので、
     MutationObserver で 見て、そのたびに 棚へ 入れ直す（相手の js は さわらない）。
   - りさ など 対象外：index.html の STUDY_RULE_OFF に homeFocus: true。
   - やめる とき：index.html の <script src="./js/home-focus.js"> の 行を 消す（js/tutor-plan.js の「できたら」も もとの 表示に もどる）。
   - 記録：プランの 前に 棚を 自分で ひらいた 回数は「📊画面の利用」に「開:おたのしみ(プラン前)」で 出る（js/usage-log.js。pt は つかない）。
   - saveData は 使わない。通信も しない。
   ===================================================================== */
(function () {
  "use strict";
  var KEEP_OUT = ["trip-card"];            // 棚に 入れない カードの id（🚌 社会見学：日にちが 近い 準備）
  var ORDER = ["dailylab-card", "wb-card", "book-banner", "dailymission-banner"]; // 棚の 中の ならび。ここに ない ものは うしろ
  var LABEL = { "dailylab-card": "🧪 ラボ", "trip-card": "🚌 社会見学", "wb-card": "🗓 今週", "book-banner": "📖 おはなし", "dailymission-banner": "🧩 なぞとき" };

  window.homeFocusOn = function () { return !(window.studyRuleOff && window.studyRuleOff("homeFocus")); };
  // プランの 前に 自分で ひらいた（数える ための 空の 関数。js/usage-log.js が つつむ）
  window.homeFocusShelfOpenedEarly = function () {};

  function planCard() { return document.getElementById("tutor-plan-card"); }
  function planDone() { try { return !!(window.tutorPlanDoneToday && window.tutorPlanDoneToday()); } catch (e) { return false; } }
  function shown(el) { return !el.hidden && el.style.display !== "none"; }

  var shelf = null, body = null, head = null, busy = false, lastDone = null, timer = null, mo = null;

  function build(anchor) {
    shelf = document.createElement("details"); shelf.id = "hf-shelf";
    shelf.style.cssText = "margin:0 0 14px;border:2px dashed #d8b4fe;border-radius:18px;background:rgba(255,255,255,.55);font-family:'Zen Maru Gothic',sans-serif;";
    head = document.createElement("summary");
    head.style.cssText = "list-style:none;cursor:pointer;padding:10px 14px;min-height:44px;display:flex;align-items:center;gap:8px;font-weight:900;color:#6b21a8;font-size:14px;";
    body = document.createElement("div"); body.id = "hf-shelf-body"; body.style.cssText = "padding:4px 10px 0;";
    shelf.appendChild(head); shelf.appendChild(body);
    shelf.addEventListener("toggle", function () {
      if (busy) return;
      if (shelf.open && !planDone()) { try { window.homeFocusShelfOpenedEarly(); } catch (e) {} }
      label();
    });
    anchor.parentNode.insertBefore(shelf, anchor);
    try { if (mo) mo.observe(body, { childList: true }); } catch (e) {} // 棚の 中に 直接 入れて くる js（field-trip.js）も 見る
  }

  function label() {
    if (!head) return;
    var names = [], n = 0;
    for (var i = 0; i < body.children.length; i++) { var el = body.children[i]; if (!shown(el)) continue; n++; if (LABEL[el.id]) names.push(LABEL[el.id]); }
    var done = planDone();
    head.innerHTML = '<span style="font-size:20px;line-height:1;">' + (done ? "🎉" : "🎈") + '</span>' +
      '<span style="flex:1;min-width:0;"><span style="display:block;">' + (done ? "プラン たっせい！ おたのしみ" : "おたのしみ・できたら（" + n + "つ）") + '</span>' +
      '<span style="display:block;font-size:11.5px;font-weight:800;color:#9333ea;line-height:1.5;">' +
      (done ? "やりたい ものだけで OK" : (shelf.open ? "" : "プランの あとで ひらくよ：") + names.join("・")) + '</span></span>' +
      '<span aria-hidden="true" style="font-size:12px;color:#a855f7;">' + (shelf.open ? "▲" : "▼") + '</span>';
    shelf.hidden = n === 0;
  }

  function collect() {
    timer = null;
    var plan = planCard(); if (!plan || !plan.parentNode || !window.saveData) return;
    var box = plan.parentNode;
    if (!window.homeFocusOn()) { // 対象外の 子に 切りかえた とき：棚の 中身を もとの 場所へ もどす
      if (shelf && shelf.parentNode) { busy = true; while (body.firstChild) box.insertBefore(body.firstChild, shelf); shelf.remove(); shelf = body = head = null; lastDone = null; busy = false; }
      return;
    }
    // 棚の 手前＝「📚 教科の ぼうけん」の 見出し（プランの カードより 後ろの さいしょの .home-sec）
    var stop = plan.nextElementSibling;
    while (stop && !(stop.classList && stop.classList.contains("home-sec"))) stop = stop.nextElementSibling;
    if (!stop) return;
    busy = true;
    try {
      if (!shelf || !shelf.parentNode) build(stop);
      if (shelf.nextElementSibling !== stop) box.insertBefore(shelf, stop);
      // プランと 見出しの 間に 出て きた カードを 棚へ
      var el = plan.nextElementSibling, moved = [];
      while (el && el !== stop) { var nx = el.nextElementSibling; if (el !== shelf && KEEP_OUT.indexOf(el.id) < 0) moved.push(el); el = nx; }
      moved.forEach(function (m) { body.appendChild(m); });
      // 棚に まぎれこんだ KEEP_OUT（ほかの カードの すぐ 後ろに 入る js が ある）は 外へ
      KEEP_OUT.forEach(function (id) { var k = document.getElementById(id); if (k && k.parentNode === body) box.insertBefore(k, shelf); });
      // ならびを そろえる
      var kids = Array.prototype.slice.call(body.children);
      var rank = function (x) { var r = ORDER.indexOf(x.id); return r < 0 ? ORDER.length : r; };
      var sorted = kids.slice().sort(function (a, b) { return rank(a) - rank(b) || kids.indexOf(a) - kids.indexOf(b); });
      if (sorted.some(function (x, i) { return x !== kids[i]; })) sorted.forEach(function (x) { body.appendChild(x); });
      // プランの たっせいで ひらく（とじる のは はじめの 1回だけ。自分で あけしめした あとは そのまま）
      var done = planDone();
      if (lastDone === null) shelf.open = done; else if (done && !lastDone) shelf.open = true;
      lastDone = done;
      label();
    } catch (e) { console.error("home-focus", e); }
    // MutationObserver は この あとで まとめて 呼ばれる → busy を 次の タスクで 下ろす
    setTimeout(function () { busy = false; }, 0);
  }
  function schedule() { if (busy || timer) return; timer = setTimeout(collect, 0); }

  function start() {
    var plan = planCard(); if (!plan || !plan.parentNode) return;
    try {
      mo = new MutationObserver(schedule);
      mo.observe(plan.parentNode, { childList: true });                              // カードが 足された・もどされた
      mo.observe(plan, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true }); // プランの 描き直し・たっせい
    } catch (e) {}
    schedule();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.homeFocusRefresh = schedule;
})();
