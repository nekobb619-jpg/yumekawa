/* =====================================================================
   daily-lab.js — 🧪 今日の うごかすラボ（★2026-11-11 保護者：見方レンズの ラボを「今日の なぞとき」の ように ホームに）
   - ホームの「今日のなぞとき」の 下に バナーを 1つ。日ごとに ラボが 1つ かわる。
   - 学校で いま 習って いる 単元（schoolStageRank＝0）の ラボを 先に、つぎに それ いがい。新しい ラボ（NEW の 期間）は その 期間 さいゆうせん。
   - その日 はじめて ひらくと シールの かけら +1。saveData.dailyLab = { d: 日, ids: [さいきん ひらいた ラボ] }。LOG「🧪今日のラボ」。
   - ラボは stages.js の lab_url から 集める ＋ EXTRA（ステージに つながって いない ラボ）。
   ===================================================================== */
(function () {
  "use strict";
  var BASE = "https://nekobb619-jpg.github.io/yumekawa/";
  // [ファイル, アイコン, 名前, ひとこと]（名前が ない ものは ステージ名から）
  var INFO = {
    "lab/算数/lab_mawaru_nami.html": ["🎡", "回ると 波ラボ", "観覧車を「高さだけ」で 見ると 波に なる？"],
    "lab/理科/lab_hoshi_ugoki.html": ["🌌", "星の 動きラボ", "時間を 動かして 星の いちを くらべよう"],
    "lab/理科/lab_ondo_taiseki.html": ["🌡️", "温度と 体積ラボ", "あたためると ふくらむ？ ちぢむ？"],
    "lab/理科/lab_kuki_teppou.html": ["🌬️", "空気でっぽうラボ", "おしちぢめた 空気の 力"],
    "lab/理科/lab_denki_circuit.html": ["💡", "電気回路ラボ", "直列と へい列、明るいのは？"],
    "lab/理科/lab_atatamari.html": ["🔥", "あたたまり方ラボ", "金ぞく・水・空気の あたたまり方"],
    "lab/理科/lab_karada_ude.html": ["💪", "うでの 曲げのばしラボ", "きん肉は どう 動く？"],
    "lab/理科/lab_kisetsu.html": ["🌸", "季節と 生き物ラボ", "季節で 生き物は どう かわる？"],
    "lab/理科/lab_jouken_soroe.html": ["🧪", "条件そろえラボ", "かえるのは 1つだけ"],
    "lab/算数/lab_shosu_ten.html": ["🔢", "小数点ラボ", "×10 で 小数点が 動く？"],
    "lab/算数/lab_gaisu.html": ["📏", "がい数ラボ", "だいたい いくつ？"],
    "lab/算数/lab_keisan_junjo.html": ["🔢", "計算の 順じょラボ", "どこから 計算する？"],
    "lab/算数/lab_hissan2.html": ["✏️", "÷2けたの 筆算ラボ", "たてる・かける・ひく・おろす"],
    "lab/算数/lab_nakama_sagashi.html": ["🦄", "仲間さがしゲーム", "同じ なかまは どれ？"],
    "lab/算数/lab_ar_kakudo.html": ["📐", "角度 宝さがし", "角度を 当てよう"],
    "lab/国語/lab_kanji_imi.html": ["🈁", "漢字の 意味わけラボ", "同じ 字でも 意味が ちがう"],
    "lab/国語/lab_gon_kimochi.html": ["🦊", "ごんの 気持ちラボ", "行動から 気持ちを 読む"],
    "lab/国語/lab_kosoado.html": ["🦄", "こそあど探検ラボ", "「それ」は 何を さす？"],
    "lab/社会/lab_narabe.html": ["🏺", "先人と 伝統 ならべかえ", "どの じゅんで 起きた？"],
    "lab/探究/lab_programming_block.html": ["🧩", "プログラミングラボ", "じゅんばん・くりかえし・もし"]
  };
  var EXTRA = ["lab/算数/lab_mawaru_nami.html"];
  var NEW = { "lab/算数/lab_mawaru_nami.html": ["2026-11-11", "2026-11-17"] };

  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function iso() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dnum() { return Math.floor((window.currentServerTime || Date.now()) / 86400000); }
  function key(u) { var s = String(u || ""); var i = s.indexOf("/yumekawa/"); s = i >= 0 ? s.slice(i + 10) : s.replace(/^\.?\//, ""); try { s = decodeURIComponent(s); } catch (e) {} return s.split("?")[0]; }
  function st() { var sd = window.saveData || {}; var o = sd.dailyLab && typeof sd.dailyLab === "object" ? sd.dailyLab : {}; o.ids = Array.isArray(o.ids) ? o.ids : []; return o; }

  function candidates() {
    var by = {};
    (window.CONTENT_STAGES || window.STAGES || []).forEach(function (s) {
      if (!s || !s.lab_url || /youtube|youtu\.be/.test(s.lab_url)) return;
      var k = key(s.lab_url); if (!INFO[k]) return;
      var r = window.schoolStageRank ? window.schoolStageRank(s.id) : 2;
      var c = by[k] || (by[k] = { k: k, url: s.lab_url, rank: 9, name: s.name });
      if (r < c.rank) c.rank = r;
    });
    EXTRA.forEach(function (k) { if (!by[k]) by[k] = { k: k, url: BASE + k, rank: 2 }; });
    return Object.keys(by).map(function (k) { return by[k]; });
  }
  function pick() {
    var cs = candidates(); if (!cs.length) return null;
    var t = iso();
    var nw = cs.filter(function (c) { var r = NEW[c.k]; return r && r[0] <= t && t <= r[1]; });
    var now = cs.filter(function (c) { return c.rank === 0; }), rest = cs.filter(function (c) { return c.rank !== 0; });
    // 学校の 単元を 2日に 1回、それ いがいを 2日に 1回（さいきん ひらいた ものは あとまわし）
    var seen = st().ids, fresh = function (l) { var f = l.filter(function (c) { return seen.indexOf(c.k) < 0; }); return f.length ? f : l; };
    var n = dnum();
    if (nw.length && st().d !== today()) return nw[n % nw.length];
    if (nw.length && seen.indexOf(nw[0].k) < 0) return nw[0];
    var list = (n % 2 === 0 && now.length) ? fresh(now) : fresh(rest.length ? rest : now);
    list.sort(function (a, b) { return a.k < b.k ? -1 : 1; });
    return list[n % list.length];
  }

  var cur = null;
  function render() {
    var host = document.getElementById("dailylab-banner");
    var anchor = document.getElementById("dailymission-banner");
    if (!anchor || !window.saveData) return;
    if (!host) {
      host = document.createElement("div"); host.id = "dailylab-banner"; host.className = "dailymission-banner"; host.setAttribute("role", "button"); host.tabIndex = 0;
      host.style.background = "linear-gradient(135deg,#ecfeff,#a5f3fc)"; host.style.borderColor = "#06b6d4"; host.style.boxShadow = "0 5px 0 #0e7490";
      host.addEventListener("click", open); host.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      anchor.parentNode.insertBefore(host, anchor.nextSibling);
    }
    cur = pick(); if (!cur) { host.hidden = true; return; }
    var i = INFO[cur.k] || ["🧪", cur.name || "ラボ", ""], done = st().d === today(), isNew = NEW[cur.k] && NEW[cur.k][0] <= iso() && iso() <= NEW[cur.k][1];
    host.hidden = false;
    host.innerHTML = '<div class="dailymission-banner-icon">' + i[0] + '</div><div class="dailymission-banner-text"><div class="dailymission-banner-title">今日の うごかすラボ' + (isNew ? ' 🆕' : '') + (cur.rank === 0 ? ' <small style="font-size:11px;">📌 いま 学校で</small>' : '') + '</div>' +
      '<div class="dailymission-banner-sub">' + i[1] + '：' + i[2] + '</div></div><div class="dailymission-banner-badge">' + (done ? '✅' : '▶') + '</div>';
  }
  function open() {
    if (!cur) return;
    var o = st(), t = today(), first = o.d !== t, i = INFO[cur.k] || ["🧪", "ラボ"];
    o.d = t; o.ids = o.ids.filter(function (x) { return x !== cur.k; }).concat([cur.k]).slice(-12);
    if (window.saveData) window.saveData.dailyLab = o;
    if (first && window.stickerAddShardsExternal) { try { window.stickerAddShardsExternal(1, "今日の ラボ"); } catch (e) {} }
    try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🧪今日のラボ", msg: i[1] + (first ? "（今日 はじめて・かけら+1）" : "") }); } catch (e) {}
    try { if (window.saveGame) window.saveGame(); } catch (e) {}
    render();
    if (window.openHybridContent) window.openHybridContent(cur.url, i[0] + " " + i[1], false); else window.open(cur.url, "_blank");
  }
  window.openDailyLab = open;
  window.dailyLabPick = function () { return pick(); };
  // ホームが かき直される たびに
  var ou = window.updateUI;
  window.updateUI = function () { var r = typeof ou === "function" ? ou.apply(this, arguments) : undefined; try { render(); } catch (e) {} return r; };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(render, 1500); }); else setTimeout(render, 1500);
})();
