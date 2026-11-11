/* =====================================================================
   daily-lab.js — 🧪 今日の うごかすラボ（★2026-11-11 保護者：見方レンズの ラボを「今日の なぞとき」の ように ホームに）
   - ホームの まなびプランの すぐ 下に 大きな カード（11/11 保護者：目立たない → 移動）。日ごとに ラボが 1つ かわる（その日は かえない）。「ほかの ラボも えらぶ」で ぜんぶ。
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
    "lab/探究/lab_programming_block.html": ["🧩", "プログラミングラボ", "じゅんばん・くりかえし・もし"],
    "lab/算数/lab_maker_tenbin.html": ["⚖️", "魔法の 天びんラボ", "左右が つりあうのは どこ？"],
    "lab/算数/lab_balance.html": ["⚖️", "てんびん 実験ラボ", "重さと きょりで つりあう？"]
  };
  var EXTRA = ["lab/算数/lab_mawaru_nami.html", "lab/算数/lab_maker_tenbin.html", "lab/算数/lab_balance.html"];
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
    var t = iso(), o0 = st();
    // ★2026-11-11 その日の ラボは 1回 きめたら かえない（前は ひらいた 直後に えらび直して、ちがう ラボが ひらいて いた）
    if (o0.pick && o0.pick.d === today()) { var keep = cs.filter(function (c) { return c.k === o0.pick.k; })[0]; if (keep) return keep; }
    var r = pick0(cs, t);
    if (r && window.saveData) { o0.pick = { d: today(), k: r.k }; window.saveData.dailyLab = o0; }
    return r;
  }
  function pick0(cs, t) {
    var nw = cs.filter(function (c) { var r = NEW[c.k]; return r && r[0] <= t && t <= r[1]; });
    var now = cs.filter(function (c) { return c.rank === 0; }), rest = cs.filter(function (c) { return c.rank !== 0; });
    // 学校の 単元を 2日に 1回、それ いがいを 2日に 1回（さいきん ひらいた ものは あとまわし）
    var seen = st().ids, fresh = function (l) { var f = l.filter(function (c) { return seen.indexOf(c.k) < 0; }); return f.length ? f : l; };
    var n = dnum();
    if (nw.length) return nw[n % nw.length]; // NEW の 期間は その ラボが 今日の ラボ
    var list = (n % 2 === 0 && now.length) ? fresh(now) : fresh(rest.length ? rest : now);
    list.sort(function (a, b) { return a.k < b.k ? -1 : 1; });
    return list[n % list.length];
  }

  var cur = null;
  function render() {
    // ★2026-11-11（保護者：目立たない）→ まなびプランの すぐ 下に 大きな カード。「ほかの ラボ」から ぜんぶ えらべる
    var host = document.getElementById("dailylab-card");
    var anchor = document.getElementById("tutor-plan-card");
    if (!anchor || !window.saveData) return;
    if (!host) {
      host = document.createElement("section"); host.id = "dailylab-card"; host.setAttribute("aria-label", "今日の うごかすラボ");
      host.style.cssText = "margin:0 0 14px;padding:12px 14px;border-radius:20px;border:3px solid #06b6d4;background:linear-gradient(135deg,#ecfeff,#cffafe 55%,#a5f3fc);box-shadow:0 6px 0 #0e7490;font-family:'Zen Maru Gothic',sans-serif;";
      host.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-dl]"); if (!b) return; if (b.getAttribute("data-dl") === "today") open(); else openList(); });
    }
    if (anchor.nextSibling !== host) anchor.parentNode.insertBefore(host, anchor.nextSibling);
    cur = pick(); if (!cur) { host.hidden = true; return; }
    var i = INFO[cur.k] || ["🧪", cur.name || "ラボ", ""], done = st().d === today(), isNew = NEW[cur.k] && NEW[cur.k][0] <= iso() && iso() <= NEW[cur.k][1];
    host.hidden = false;
    var extra = window.tutorPlanDoneToday && window.tutorPlanDoneToday();
    host.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;"><div style="font-size:15px;font-weight:900;color:#155e75;">🧪 今日の うごかすラボ' + (extra ? ' <span style="font-size:11px;background:#fff;border-radius:999px;padding:1px 7px;color:#0e7490;">できたら</span>' : '') + (isNew ? ' <span style="background:#f472b6;color:#fff;border-radius:999px;padding:0 7px;font-size:11px;">NEW</span>' : '') + '</div>' + (cur.rank === 0 ? '<span style="font-size:11px;font-weight:900;color:#0e7490;background:#fff;border-radius:999px;padding:2px 8px;">📌 いま 学校で</span>' : '') + '</div>' +
      '<button type="button" data-dl="today" style="display:flex;align-items:center;gap:10px;width:100%;margin-top:8px;padding:10px 12px;min-height:64px;border:none;border-radius:16px;background:#fff;box-shadow:0 3px 0 #67e8f9;cursor:pointer;text-align:left;font-family:inherit;">' +
        '<span style="font-size:38px;line-height:1;">' + i[0] + '</span><span style="flex:1;min-width:0;"><span style="display:block;font-size:16px;font-weight:900;color:#0f172a;">' + i[1] + '</span><span style="display:block;font-size:12.5px;font-weight:800;color:#0e7490;margin-top:2px;">' + i[2] + '</span></span>' +
        '<span style="font-size:13px;font-weight:900;color:#fff;background:' + (done ? '#22c55e' : 'linear-gradient(135deg,#06b6d4,#3b82f6)') + ';border-radius:999px;padding:8px 12px;white-space:nowrap;">' + (done ? '✅ もう一度' : '▶ うごかす') + '</span></button>' +
      '<button type="button" data-dl="list" style="display:block;width:100%;margin-top:8px;min-height:44px;border:2px dashed #67e8f9;border-radius:14px;background:rgba(255,255,255,.6);font:900 13.5px \'Zen Maru Gothic\',sans-serif;color:#155e75;cursor:pointer;">🧪 ほかの ラボも えらぶ（' + candidates().length + 'こ）</button>';
  }
  var SUBJ = [["算数", "🔢"], ["理科", "🔬"], ["国語", "📖"], ["社会", "🗾"], ["探究", "🧩"]];
  function openList() {
    var cs = candidates(), w = document.getElementById("dailylab-list"); if (w) w.remove();
    w = document.createElement("div"); w.id = "dailylab-list"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", "ラボを えらぶ");
    w.style.cssText = "position:fixed;inset:0;z-index:10002;background:rgba(8,47,73,.5);display:flex;align-items:center;justify-content:center;padding:12px;";
    var row = function (c) { var i = INFO[c.k] || ["🧪", c.name || "ラボ", ""]; return '<button type="button" data-k="' + c.k + '" style="display:flex;align-items:center;gap:8px;width:100%;margin-top:6px;padding:8px 10px;min-height:52px;border:2px solid #a5f3fc;border-radius:14px;background:#fff;cursor:pointer;text-align:left;font-family:inherit;"><span style="font-size:26px;">' + i[0] + '</span><span style="flex:1;min-width:0;"><b style="font-size:14px;color:#0f172a;">' + i[1] + '</b>' + (c.rank === 0 ? ' <span style="font-size:10.5px;color:#0e7490;">📌いま</span>' : '') + (cur && cur.k === c.k ? ' <span style="font-size:10.5px;color:#db2777;">今日</span>' : '') + '<br><span style="font-size:11.5px;font-weight:700;color:#475569;">' + i[2] + '</span></span></button>'; };
    var now = cs.filter(function (c) { return c.rank === 0; });
    var html = (now.length ? '<div style="font-size:13px;font-weight:900;color:#0e7490;margin-top:8px;">📌 いま 学校で 習って いる ところ</div>' + now.map(row).join("") : '') +
      SUBJ.map(function (s) { var l = cs.filter(function (c) { return c.k.indexOf("lab/" + s[0] + "/") === 0 && c.rank !== 0; }); return l.length ? '<div style="font-size:13px;font-weight:900;color:#155e75;margin-top:10px;">' + s[1] + ' ' + s[0] + '</div>' + l.map(row).join("") : ''; }).join("");
    w.innerHTML = '<div style="width:100%;max-width:440px;max-height:88vh;overflow-y:auto;background:#f0fdff;border:3px solid #67e8f9;border-radius:22px;padding:14px;font-family:\'Zen Maru Gothic\',sans-serif;"><div style="font-size:18px;font-weight:900;color:#155e75;text-align:center;">🧪 ラボを えらぶ</div>' + html +
      '<button type="button" data-x="1" style="display:block;width:100%;margin-top:12px;min-height:44px;border:none;border-radius:14px;background:#cffafe;font:900 14px \'Zen Maru Gothic\',sans-serif;color:#155e75;cursor:pointer;">とじる</button></div>';
    w.addEventListener("click", function (e) {
      if (e.target === w || (e.target.closest && e.target.closest("[data-x]"))) return w.remove();
      var b = e.target.closest && e.target.closest("button[data-k]"); if (!b) return;
      var c = cs.filter(function (x) { return x.k === b.getAttribute("data-k"); })[0]; w.remove(); if (c) go(c);
    });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { var x = document.getElementById("dailylab-list"); if (x) x.remove(); document.removeEventListener("keydown", esc); } });
    document.body.appendChild(w); var f = w.querySelector("button"); if (f) try { f.focus(); } catch (e) {}
  }
  function go(c) {
    if (cur && c.k === cur.k) return open();
    var i = INFO[c.k] || ["🧪", "ラボ"];
    if (window.lensModelSeen) { window.lensModelSeen(c.k); try { if (window.saveGame) window.saveGame(); } catch (e) {} }
    try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🧪ラボ（えらんだ）", msg: i[1] }); } catch (e) {}
    if (window.openHybridContent) window.openHybridContent(c.url, i[0] + " " + i[1], false); else window.open(c.url, "_blank");
  }
  window.openLabList = openList;
  function open() {
    if (!cur) return;
    var lab = cur, o = st(), t = today(), first = o.d !== t, i = INFO[lab.k] || ["🧪", "ラボ"];
    o.d = t; o.ids = o.ids.filter(function (x) { return x !== lab.k; }).concat([lab.k]).slice(-12);
    if (window.lensModelSeen) window.lensModelSeen(lab.k); // ★2026-11-11 🗃 モデル図鑑
    if (window.saveData) window.saveData.dailyLab = o;
    if (first && window.stickerAddShardsExternal) { try { window.stickerAddShardsExternal(1, "今日の ラボ"); } catch (e) {} }
    try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🧪今日のラボ", msg: i[1] + (first ? "（今日 はじめて・かけら+1）" : "") }); } catch (e) {}
    try { if (window.saveGame) window.saveGame(); } catch (e) {}
    render();
    if (window.openHybridContent) window.openHybridContent(lab.url, i[0] + " " + i[1], false); else window.open(lab.url, "_blank");
  }
  window.openDailyLab = open;
  window.dailyLabPick = function () { return pick(); };
  // ホームが かき直される たびに
  var ou = window.updateUI;
  window.updateUI = function () { var r = typeof ou === "function" ? ou.apply(this, arguments) : undefined; try { render(); } catch (e) {} return r; };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(render, 1500); }); else setTimeout(render, 1500);
})();
