/* =====================================================================
   js/luck-day.js — 🌟 きのうの がんばり はっぴょう ＆ きょうの ラッキー（シークレット）
   ★2026-11-05追加（保護者：ひみつの しくみに したら 問題を 解いて くれる ように なった。
     次の 日に「きのうの がんばり」を 発表して、がんばり度に おうじて かけらの 出やすさを かえる）
   ・がんばり度：きのう 数えた 問題数（js/weekly-bonus.js の saveData.weekBonus.days。⚡すらすら ふくしゅうの 正解も 入る）。
     lv0：〜9問／lv1：10〜24問／lv2：25〜39問／lv3：40問〜。子どもには 数や きまりは 見せない（⭐の 数と ラッキーの 中身だけ）。
   ・きょうの ラッキー（その日 ずっと）：
       シールの かけら … 1回目で 正解した ときに もう1こ 出る かくりつ SHARD[lv]、1日の 上限も CAP_PLUS[lv] こ ふえる（js/sticker-book.js）
       設計図の 欠片 🧩 … 出る かくりつに KAKERA[lv] を 足す（index.html の 欠片センサー）
   ・発表は 1日 1回、その日 はじめて ホームを ひらいた とき。saveData.luckDay = { d: 発表した 日, lv }。LOG「🌟がんばり発表」。
   ===================================================================== */
(function () {
  "use strict";
  var SHARD = [0, 0.2, 0.35, 0.5], CAP_PLUS = [0, 5, 10, 15], KAKERA = [0, 0.03, 0.06, 0.1];
  var LV = [
    { star: "⭐", t: "きのうは すこし がんばったね", luck: "きょうは ふつうの 日。たくさん くりかえすと、あしたの 発表が かわるかも…？" },
    { star: "⭐⭐", t: "きのうは よく がんばった！", luck: "🍀 きょうは シールの かけらが ちょっと 出やすい 日" },
    { star: "⭐⭐⭐", t: "きのうは すごく がんばった！！", luck: "🍀🍀 きょうは シールの かけらと 🧩 設計図の 欠片が 出やすい 日" },
    { star: "🌈⭐⭐⭐", t: "きのうは 大がんばり！！！", luck: "🌈 きょうは 大ラッキー！ かけらも 🧩 欠片も とても 出やすいよ" }
  ];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function now() { return new Date(window.currentServerTime || Date.now()); }
  function yday() { var d = now(); d.setDate(d.getDate() - 1); return iso(d); }
  function count(k) { var w = (window.saveData || {}).weekBonus; return Number(w && w.days && w.days[k] || 0); }
  function lvOf(n) { return n >= 40 ? 3 : n >= 25 ? 2 : n >= 10 ? 1 : 0; }
  function lvToday() {
    if (!window.saveData || !window.playerId) return 0;
    var L = window.saveData.luckDay;
    if (L && L.d === iso(now())) return Number(L.lv) || 0;
    return lvOf(count(yday()));
  }
  window.luckToday = function () { var lv = lvToday(); return { lv: lv, shard: SHARD[lv], capPlus: CAP_PLUS[lv], kakera: KAKERA[lv] }; };
  window.luckKakeraBonus = function () { try { return KAKERA[lvToday()]; } catch (e) { return 0; } };

  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🌟がんばり発表", msg: msg }); } catch (e) {} }
  function announce() {
    var d = window.saveData, t = iso(now()); if (!d || !window.playerId) return false;
    if (d.luckDay && d.luckDay.d === t) return true;
    var n = count(yday()), lv = lvOf(n);
    d.luckDay = { d: t, lv: lv };
    try { if (window.saveGame) window.saveGame(); } catch (e) {}
    log("きのう " + n + "問 → lv" + lv);
    if (n <= 0) return true; // きのう やって いない 日は 発表しない（せめない）
    var x = LV[lv], m = document.createElement("div");
    m.id = "luck-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "luck-t");
    m.style.cssText = "position:fixed;inset:0;z-index:10005;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Zen Maru Gothic',sans-serif";
    m.innerHTML = '<div style="background:linear-gradient(165deg,#fff,#fdf4ff);border:3px solid #e879f9;border-radius:24px;padding:18px;max-width:360px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">' +
      '<div style="font-size:13px;font-weight:900;color:#a21caf">🌟 きのうの がんばり はっぴょう</div>' +
      '<div style="font-size:34px;margin:6px 0" aria-hidden="true">' + x.star + '</div>' +
      '<h2 id="luck-t" style="margin:0 0 8px;font-size:19px;font-weight:900;color:#701a75">' + x.t + '</h2>' +
      '<div style="background:#fff;border:2px dashed #f0abfc;border-radius:16px;padding:10px;font-size:14px;font-weight:900;color:#86198f;line-height:1.6">' + x.luck + '</div>' +
      '<div style="font-size:11.5px;font-weight:700;color:#a16207;margin-top:8px">どう したら ⭐ が ふえるかは ひみつ。</div>' +
      '<button type="button" id="luck-ok" style="margin-top:12px;border:none;border-radius:999px;min-height:46px;padding:10px 28px;font:900 15px \'Zen Maru Gothic\';color:#fff;background:linear-gradient(135deg,#d946ef,#f59e0b);box-shadow:0 4px 0 #86198f;cursor:pointer">きょうも いこう！</button></div>';
    document.body.appendChild(m);
    var ok = document.getElementById("luck-ok"), done = function () { m.remove(); };
    ok.onclick = done; m.addEventListener("keydown", function (e) { if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); if (e.key === "Escape") done(); else ok.focus(); } });
    setTimeout(function () { try { ok.focus(); } catch (e) {} }, 50);
    return true;
  }
  var tried = false;
  setInterval(function () {
    if (tried || !window.saveData || !window.playerId || !window.saveDataConfirmedSource) return;
    var ov = document.getElementById("data-loading-overlay"); if (ov && getComputedStyle(ov).display !== "none") return;
    if (["game-screen", "tutor-screen", "allowance-screen", "login-modal"].some(function (id) { var e = document.getElementById(id); return e && getComputedStyle(e).display !== "none"; })) return;
    if (document.getElementById("wb-modal")) return; // 週の ボーナスの 発表が 先
    try { tried = announce(); } catch (e) { console.error("luck-day", e); tried = true; }
  }, 1700);
})();
