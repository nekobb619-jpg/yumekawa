/* =====================================================================
   js/why-note.js — ステージ クリアの あとに「なぜ？を 1つ 書く」（任意）
   ★2026-10-18追加（作戦会議 10/18 採用③：疑問を 持つ 力）：
   ・ふつうの ステージを 最後まで やった あと、小さな カードで「なぜ？」を 1つ 書ける（書かなくても よい）。
   ・書いた 文は saveData.whyLog に のこす（ext行。子どもが 書いた 文なので trim しない）。
     whyLog = [{ d:"2026-10-18", s:ステージID, n:ステージ名, t:"なぜ ◯◯ なの？", at:時刻 }]（さいごの 60こ）
   ・1日に 1回 書くと 🎀シールの ふくろ（"why"）。Q は わたさない（周回で ふやせない ように）。
   ・自学ノートの「今日の ぎ問 → 次の 問い」（a_toi）カードに、さいきん 書いた なぜ？を 出して ノートの ネタに する。
   ・1日に 出す のは WHY_MAX_PER_DAY 回まで（あまり しつこく しない）。復習・マスター周回では 出さない。
   ===================================================================== */
(function () {
  var WHY_MAX_PER_DAY = 3;
  function today() { var d = new Date(window.currentServerTime || Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function wlog() { var sd = window.saveData || {}; return Array.isArray(sd.whyLog) ? sd.whyLog : []; }
  window.whyLogRecent = function (n) { return wlog().slice(-(n || 3)).reverse(); };

  var shownDay = "", shownCount = 0;
  // ステージの 名前から「なぜ？」の 書き出しの れいを 出す（答えに なる ことは 書かない）
  function examples(stageId) {
    var s = String(stageId || "");
    if (s.indexOf("算数") === 0) return ["なぜ 両方を 同じ 数で わっても 答えが かわらないの？", "なぜ この やり方で 計算が らくに なるの？"];
    if (s.indexOf("理科") === 0) return ["なぜ そう なるの？ ほかの ものでも 同じ？", "なぜ 夏と 冬で ちがうの？"];
    if (s.indexOf("国語") === 0) return ["なぜ この 言葉は こう 書くの？", "なぜ 作者は この 言葉を えらんだの？"];
    if (s.indexOf("社会") === 0) return ["なぜ ここに これが あるの？", "なぜ むかしと 今で ちがうの？"];
    return ["なぜ そう なるの？", "ほかの 場合でも 同じ？"];
  }

  window.askWhyAfterClear = function (stageId, stageName) {
    try {
      if (!window.saveData || window.currentActiveStageIsReview || window.currentActiveStageIsMaster) return;
      var t = today();
      if (shownDay !== t) { shownDay = t; shownCount = 0; }
      if (shownCount >= WHY_MAX_PER_DAY) return;
      shownCount++;
      // 宝の 発見や シールの 演出が 出て いる ときは、とじるまで まつ（最大 60秒）
      var tries = 0;
      (function wait() {
        var busy = ["data-loading-overlay", "streak-celebration-modal", "master-celebration-modal", "treasure-reveal-modal", "stk-reveal", "evo-reveal"].some(function (id) {
          var el = document.getElementById(id); if (!el) return false;
          var cs = window.getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden";
        });
        if (busy && tries++ < 120) { setTimeout(wait, 500); return; }
        open(stageId, stageName);
      })();
    } catch (e) {}
  };

  function open(stageId, stageName) {
    var old = document.getElementById("why-note"); if (old) old.remove();
    var ex = examples(stageId);
    var w = document.createElement("div"); w.id = "why-note";
    w.style.cssText = "position:fixed;inset:0;z-index:10003;background:rgba(31,27,46,.55);display:flex;align-items:flex-end;justify-content:center;padding:12px;";
    w.innerHTML = '<div style="width:100%;max-width:440px;background:#fff;border:3px solid #f0abfc;border-radius:20px;padding:14px 14px 12px;font-family:\'Zen Maru Gothic\',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);">' +
      '<div style="font-size:16px;font-weight:900;color:#a21caf;">❓ なぜ？を 1つ 書いて みよう</div>' +
      '<div style="font-size:12px;font-weight:800;color:#7a6985;margin:3px 0 8px;line-height:1.6;">「' + esc(stageName || "") + '」で ふしぎに 思った ことは ある？ 答えが 分からなくて いいよ。書かなくても OK。</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">' + ex.map(function (x, i) {
        return '<button type="button" data-ex="' + i + '" style="border:1.5px dashed #e9d5ff;background:#faf5ff;color:#7e22ce;border-radius:999px;padding:5px 10px;font:800 11px \'Zen Maru Gothic\',sans-serif;cursor:pointer;">れい：' + esc(x) + '</button>';
      }).join("") + '</div>' +
      '<textarea id="why-text" rows="2" maxlength="80" placeholder="なぜ 〜 なの？" style="width:100%;box-sizing:border-box;border:2px solid #f0abfc;border-radius:12px;padding:8px 10px;font:800 15px \'Zen Maru Gothic\',sans-serif;resize:none;"></textarea>' +
      '<div id="why-msg" style="min-height:16px;font-size:11px;font-weight:800;color:#be185d;margin:4px 0;"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<button type="button" id="why-skip" style="border:none;border-radius:12px;padding:11px;font:900 14px \'Zen Maru Gothic\',sans-serif;background:#f3f4f6;color:#6b7280;cursor:pointer;">きょうは いい</button>' +
        '<button type="button" id="why-ok" style="border:none;border-radius:12px;padding:11px;font:900 14px \'Zen Maru Gothic\',sans-serif;background:linear-gradient(135deg,#e879f9,#a855f7);color:#fff;cursor:pointer;">✏️ のこす</button>' +
      '</div></div>';
    document.body.appendChild(w);
    var ta = document.getElementById("why-text"), msg = document.getElementById("why-msg");
    Array.prototype.forEach.call(w.querySelectorAll("[data-ex]"), function (b) {
      b.onclick = function () { ta.value = ex[Number(b.getAttribute("data-ex"))]; ta.focus(); };
    });
    document.getElementById("why-skip").onclick = function () { w.remove(); };
    document.getElementById("why-ok").onclick = function () {
      var v = String(ta.value || "").replace(/\s+/g, " ").trim();
      if (Array.from(v).length < 4) { msg.textContent = "もう すこし 書いて みよう（4文字 いじょう）"; return; }
      if (!/[？?]$/.test(v)) v += "？";
      save(stageId, stageName, v);
      w.querySelector("div").innerHTML = '<div style="text-align:center;padding:6px 0;">' +
        '<div style="font-size:30px;">📝</div><div style="font-size:15px;font-weight:900;color:#a21caf;margin:4px 0;">いい ぎ問！</div>' +
        '<div style="font-size:13px;font-weight:800;color:#6b21a8;background:#faf5ff;border-radius:12px;padding:8px;margin:6px 0;">' + esc(v) + '</div>' +
        '<div style="font-size:11px;font-weight:800;color:#7a6985;line-height:1.6;">自学ノートの「今日の ぎ問 → 次の 問い」に 書いて 調べられるよ。</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">' +
          '<button type="button" id="why-close" style="border:none;border-radius:12px;padding:11px;font:900 14px \'Zen Maru Gothic\',sans-serif;background:#f3f4f6;color:#6b7280;cursor:pointer;">とじる</button>' +
          '<button type="button" id="why-jigaku" style="border:none;border-radius:12px;padding:11px;font:900 13px \'Zen Maru Gothic\',sans-serif;background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;">📓 自学ノートへ</button>' +
        '</div></div>';
      document.getElementById("why-close").onclick = function () { w.remove(); };
      document.getElementById("why-jigaku").onclick = function () { w.remove(); if (window.showJigakuCard) { try { window.showJigakuCard("a_toi"); } catch (e) {} } };
    };
  }

  function save(stageId, stageName, text) {
    var sd = window.saveData; if (!sd) return;
    var t = today(), first = !wlog().some(function (x) { return x && x.d === t; });
    sd.whyLog = wlog().concat([{ d: t, s: stageId, n: stageName || "", t: text, at: window.currentServerTime || Date.now() }]).slice(-60);
    if (first && window.grantStickerPack) { try { window.grantStickerPack("why"); } catch (e) {} }
    if (window.saveGame) { try { window.saveGame(); } catch (e) {} }
    if (window.syncWithGoogleSpreadsheet) { try { window.syncWithGoogleSpreadsheet("LOG", { stage: stageId, msg: "❓なぜ？メモ：" + text }); } catch (e) {} }
  }
})();
