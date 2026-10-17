/* =====================================================================
   evolved-treasure.js — ✨ 進化したお宝（★5）
   ★2026-10-17追加（保護者：お宝図鑑の お宝を そのまま きせかえに 使うのでは なく、「進化した」★5 の 新しい お宝を 置く。
     レア度が 高い お宝だけ 身に つけられる、と いう 決まりに して、お宝さがしを おもしろく する）
   - 10種。それぞれ もとに なる お宝（TREASURE_LIST の id）が ある。もとの お宝を 持って いて、同じ お宝を もう一度
     見つけた（だぶった）とき、EVOLVE_CHANCE の 確率で その お宝が 進化して ★5 が 手に 入る。
     見つける 場所は ふだんと 同じ（ステージの お宝・探偵ラボの プレミアムお宝・探検隊の 宝箱）
   - ★5 だけが シール帳の きせかえで 身に つけられる（絵は js/sticker-book.js の EVO_ART）。つけても へらない
   - saveData.evolvedTreasures{ id:{count, firstGotDate} }（treasureBook とは べつ＝図鑑の「n / 28」は そのまま）
   - お宝図鑑の いちばん下に「✨ 進化したお宝」の らん。まだの ものは、もとの お宝を 持って いれば ヒントを 出す
   ===================================================================== */
(function () {
  "use strict";
  var EVOLVE_CHANCE = 0.12;
  window.EVOLVED_TREASURES = [
    { id: "x01", from: "t09", slot: "head", name: "よぞらの シルクハット", desc: "クロぽんの ぼうしが 夜空の 力で 進化した。かぶると 星が 一つ ふえて 見えるらしい。" },
    { id: "x02", from: "t26", slot: "head", name: "女神の 光の リボン", desc: "女神の リボンが 光を おびた すがた。まよった とき、すすむ 道を てらして くれる。" },
    { id: "x03", from: "t14", slot: "head", name: "にじいろ ユニコーンの 角", desc: "ニコの 角の かけらが 元の 形に もどった。にじの 色に かがやく。" },
    { id: "x04", from: "t27", slot: "head", name: "太陽の 黄金の 角", desc: "でんせつの 黄金の 角が 太陽の 光を すいこんだ、さいきょうの お宝。" },
    { id: "x05", from: "t21", slot: "face", name: "大天才の メガネ", desc: "天才の メガネが 進化した。問題の「ねらい」が 光って 見える…かも。" },
    { id: "x06", from: "t15", slot: "body", name: "王者の 金メダル", desc: "伝説の 金メダルに 宝石が 宿った。何回も ちょうせんした 人の あかし。" },
    { id: "x07", from: "t11", slot: "body", name: "満点の おまもり", desc: "合格の おまもりが 進化した。見直しを わすれない 力が こもって いる。" },
    { id: "x08", from: "t04", slot: "around", name: "流れ星の かけら", desc: "ほしの かけらが 流れ星に なって、まわりを くるくる 回る。" },
    { id: "x09", from: "t12", slot: "around", name: "オーロラ 結晶", desc: "きらきら結晶が オーロラの 色に 変わった。北の 空の ふしぎな 光。" },
    { id: "x10", from: "t23", slot: "around", name: "まほうの 絵の具", desc: "にじの 絵の具が まほうを おぼえた。ぬった 色が ふわふわ うかぶ。" }
  ];
  var BYID = {}, BYFROM = {};
  window.EVOLVED_TREASURES.forEach(function (x) { BYID[x.id] = x; BYFROM[x.from] = x; });
  function sd() { return window.saveData || {}; }
  function book() { var d = sd(); if (!d.evolvedTreasures || typeof d.evolvedTreasures !== "object") d.evolvedTreasures = {}; return d.evolvedTreasures; }
  window.evolvedOwned = function (id) { var b = book()[id]; return !!b && (b.count || 0) > 0; };
  function baseName(tid) { var l = window.TREASURE_LIST || []; for (var i = 0; i < l.length; i++) if (l[i].id === tid) return l[i].name; return "お宝"; }

  // だぶった お宝が 進化するか（まだ 持って いない ★5 の 方が でやすい：もう 持って いる ときは 半分の 確率）
  function maybeEvolve(tid) {
    var x = BYFROM[tid]; if (!x) return null;
    var have = window.evolvedOwned(x.id), p = have ? EVOLVE_CHANCE / 2 : EVOLVE_CHANCE;
    if (Math.random() >= p) return null;
    var b = book();
    if (!b[x.id]) b[x.id] = { count: 1, firstGotDate: window.currentServerTime || Date.now() };
    else b[x.id].count = (b[x.id].count || 1) + 1;
    try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "✨進化したお宝", msg: baseName(tid) + " → " + x.name + (have ? "（もう1つ）" : " NEW") }); } catch (e) {}
    if (window.saveGame) { try { window.saveGame(); } catch (e) {} }
    setTimeout(function () { reveal(x, !have); }, 900);
    return x;
  }
  window.EVOLVED_TREASURE_API = { maybeEvolve: maybeEvolve, chance: EVOLVE_CHANCE };

  function art(id, px) { return window.STICKERS && window.STICKERS.evoSvg ? window.STICKERS.evoSvg(id, px) : "✨"; }
  function reveal(x, isNew) {
    var old = document.getElementById("evo-reveal"); if (old) old.remove();
    var w = document.createElement("div"); w.id = "evo-reveal";
    w.style.cssText = "position:fixed;inset:0;z-index:10003;background:rgba(31,27,46,.78);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Zen Maru Gothic',sans-serif";
    w.innerHTML = '<div style="background:linear-gradient(160deg,#fff,#fdf4ff);border:4px solid #e879f9;box-shadow:0 0 36px rgba(232,121,249,.6);border-radius:26px;padding:20px 18px;max-width:320px;width:100%;text-align:center">' +
      '<div style="font-size:13px;font-weight:900;color:#a21caf">「' + baseName(x.from) + '」が…</div>' +
      '<div style="font-size:20px;font-weight:900;color:#7e22ce;margin:2px 0">✨ 進化した！ ✨</div>' +
      '<div style="width:150px;height:150px;margin:6px auto">' + art(x.id, 150) + '</div>' +
      '<div style="color:#f59e0b;font-weight:900">★★★★★ 進化したお宝</div>' +
      '<div style="font-size:18px;font-weight:900;color:#5b21b6;margin:2px 0">' + x.name + '</div>' +
      '<div style="font-size:12px;font-weight:700;color:#6b5a85;line-height:1.6;margin-bottom:10px">' + x.desc + '<br>' + (isNew ? "★5 の お宝は 身に つけられる！ シール帳の「きせかえ」で つけて みよう" : "もう 1つ 手に 入れたよ") + '</div>' +
      '<button type="button" style="border:none;border-radius:999px;padding:10px 22px;font:900 14px \'Zen Maru Gothic\';color:#fff;background:linear-gradient(135deg,#7c3aed,#db2777);box-shadow:0 4px 0 #4c1d95;cursor:pointer">やったね</button></div>';
    w.querySelector("button").onclick = function () { w.remove(); };
    document.body.appendChild(w);
    if (window.speakText) { try { window.speakText("お宝が 進化した！", "ja-JP"); } catch (e) {} }
  }

  // お宝を 見つける 3つの 場所で、だぶった ときに 進化を ためす
  function wrap(name) {
    var o = window[name];
    if (typeof o !== "function" || o._evoWrapped) return;
    var w = function () { var r = o.apply(this, arguments); try { if (r && r.isDupe && r.treasure) maybeEvolve(r.treasure.id); } catch (e) {} return r; };
    w._evoWrapped = true; window[name] = w;
  }
  // 図鑑の 下に「✨ 進化したお宝」
  function bookSection() {
    var grid = document.getElementById("treasure-book-grid"); if (!grid) return;
    var sec = document.getElementById("evo-book");
    if (!sec) { sec = document.createElement("div"); sec.id = "evo-book"; grid.parentNode.insertBefore(sec, grid.nextSibling); }
    var tb = sd().treasureBook || {}, n = window.EVOLVED_TREASURES.filter(function (x) { return window.evolvedOwned(x.id); }).length;
    sec.innerHTML = '<div style="margin:14px 0 6px;font-weight:900;color:#a21caf">✨ 進化したお宝（★5） ' + n + ' / ' + window.EVOLVED_TREASURES.length + '</div>' +
      '<div style="font-size:11px;font-weight:700;color:#7a6985;margin-bottom:6px;line-height:1.6">同じ お宝を もう一度 見つけると、たまに 進化するよ。★5 の お宝だけ、シール帳の「きせかえ」で 身に つけられる。</div>' +
      '<div class="treasure-grid">' + window.EVOLVED_TREASURES.map(function (x) {
        var own = book()[x.id];
        if (own) return '<div class="treasure-slot owned r4" style="border-color:#e879f9;background:#fdf4ff"><div class="treasure-slot-icon" style="width:44px;height:44px;margin:0 auto">' + art(x.id, 44) + '</div><div class="treasure-slot-name">' + x.name + (own.count > 1 ? " ×" + own.count : "") + '</div></div>';
        var hint = tb[x.from] ? "「" + baseName(x.from) + "」が 進化するかも" : "？？？";
        return '<div class="treasure-slot locked"><div class="treasure-slot-icon">❓</div><div class="treasure-slot-name">' + hint + '</div></div>';
      }).join("") + '</div>';
  }
  function wrapBook() {
    var o = window.openTreasureBookModal;
    if (typeof o !== "function" || o._evoWrapped) return;
    var w = function () { var r = o.apply(this, arguments); try { bookSection(); } catch (e) {} return r; };
    w._evoWrapped = true; window.openTreasureBookModal = w;
  }
  function install() { ["rollTreasureDrop", "rollExpeditionTreasureChest", "rollPremiumTreasureInDetectiveLab"].forEach(wrap); wrapBook(); }
  install();
  document.addEventListener("DOMContentLoaded", install);
})();
