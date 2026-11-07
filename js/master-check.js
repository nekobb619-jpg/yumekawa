/* =====================================================================
   js/master-check.js — 🏆 マスターチェック（まぜこぜテスト）
   ★2026-11-07追加（保護者：MASTER も ときどき たしかめる。はく奪の 危機。返り咲きでも +30Q は なし／単元が 多いので まとめて）
   - まなびプランに 2日に 1回（はく奪の 危機の ステージが あれば 毎日）出る。js/tutor-plan.js の kind "mastercheck"。
   - 1回 8問：4つの MASTER ステージから 2問ずつ（4択だけ。図・入力の 問題は 出さない）。
     えらぶ 順：①はく奪の 危機 ②いま 学校で 習って いる・もうすぐ（js/school-units.js）③いちばん 長く たしかめて いない。
   - ステージごとに 判定：2問とも 1回目で 正解＝キープ／1問でも まちがい＝危機（risk 1）／危機の まま また まちがい＝はく奪。
     はく奪：reviewCounts を MASTER_CLEAR_THRESHOLD−1（ごうかく 4回）に もどし、masterCheck[id].revokedAt を つける
     （index.html の reviewGapDays が 2日に なる＝2日 あけた ふくしゅうで ごうかくすれば 返り咲き）。
     masterPromotedStages は true の まま なので 返り咲きで +30Q は 出ない。
   - Q は おまけ：キープ 1つに つき +1Q。log_db に「🏆マスターチェック」。
   - りさ（保護者）は 対象外（window.studyRuleOff）。
   - saveData.masterCheck = { [stageId]: { last, risk, revokedAt } }（index.html の ふくしゅう ごうかくでも つかう）。
   ===================================================================== */
(function () {
  "use strict";
  var STAGES = 4, PER = 2;

  function sd() { return window.saveData || {}; }
  function now() { return window.currentServerTime || Date.now(); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function plain(s) { return String(s || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet) window.syncWithGoogleSpreadsheet("LOG", { stage: "🏆マスターチェック", msg: msg }); } catch (e) {} }
  function mcAll() { var d = sd(); if (!d.masterCheck || typeof d.masterCheck !== "object") d.masterCheck = {}; return d.masterCheck; }
  function isMaster(id) { var rc = sd().reviewCounts || {}; return !!(window.MASTER_CLEAR_THRESHOLD && rc[id] >= window.MASTER_CLEAR_THRESHOLD); }

  function quizzes() {
    var out = {};
    if (window.CONTENT && window.CONTENT.quizzes) Object.keys(window.CONTENT.quizzes).forEach(function (k) { out[k] = window.CONTENT.quizzes[k]; });
    Object.keys(window).forEach(function (k) { if (k.indexOf("CONTENT_QUIZZES") === 0 && window[k] && typeof window[k] === "object") Object.keys(window[k]).forEach(function (sid) { if (!out[sid]) out[sid] = window[k][sid]; }); });
    return out;
  }
  function usable(q) {
    if (!q || !Array.isArray(q.a) || q.a.length < 2 || typeof q.c !== "number" || !q.a[q.c]) return false;
    if (q.type || q.canvas_code || q.diagram || q.kanjiBuild || q.correct_answers) return false;
    var t = plain(q.q); if (!t || t.length > 120 || /<svg|<img/i.test(q.q)) return false;
    return q.a.every(function (x) { return typeof x === "string" && x.length <= 40; });
  }
  function stageName(id) {
    var st = (window.CONTENT && window.CONTENT.stages || []).filter(function (s) { return s.id === id; })[0];
    return (st && st.name) || String(id).split("/").slice(1, 2).join("") || id;
  }

  // えらぶ（まなびプランでも つかう）
  function candidates() {
    var cl = sd().clearedStages || {}, Q = quizzes(), mc = mcAll();
    return Object.keys(cl).filter(function (id) { return cl[id] && isMaster(id) && (Q[id] || []).filter(usable).length >= PER; })
      .map(function (id) {
        var r = window.schoolStageRank ? window.schoolStageRank(id) : 2;
        var last = (mc[id] && mc[id].last) || (sd().reviewDates || {})[id] || 0;
        return { id: id, risk: !!(mc[id] && mc[id].risk), school: r < 2 ? 0 : 1, last: last };
      })
      .sort(function (a, b) { return (b.risk - a.risk) || (a.school - b.school) || (a.last - b.last); });
  }
  window.masterCheckCandidates = function () { return window.studyRuleOff && window.studyRuleOff("masterCheck") ? [] : candidates(); };
  window.masterCheckHasRisk = function () { return candidates().some(function (c) { return c.risk; }); };

  function applyResult(id, pass) {
    var mc = mcAll(), m = mc[id] || (mc[id] = { last: 0, risk: 0, revokedAt: 0 });
    m.last = now();
    if (pass) { m.risk = 0; return "keep"; }
    if (!m.risk) { m.risk = 1; return "risk"; }
    m.risk = 0; m.revokedAt = now();
    var d = sd(); if (!d.reviewCounts) d.reviewCounts = {}; d.reviewCounts[id] = window.MASTER_CLEAR_THRESHOLD - 1;
    if (!d.masterPromotedStages) d.masterPromotedStages = {}; d.masterPromotedStages[id] = true; // 返り咲きで +30Q を 出さない
    if (!d.reviewDates) d.reviewDates = {}; d.reviewDates[id] = now();
    return "lost";
  }

  /* ---------------- 画面 ---------------- */
  var ui = null;
  function close() { var m = document.getElementById("mck-modal"); if (m) m.remove(); document.removeEventListener("keydown", onKey, true); ui = null; if (window.renderTutorPlan) try { window.renderTutorPlan(); } catch (e) {} }
  function onKey(e) { if (e.key === "Escape" && ui && ui.phase !== "card") { e.preventDefault(); close(); } }
  function shell(inner) {
    var m = document.getElementById("mck-modal");
    if (!m) {
      m = document.createElement("div"); m.id = "mck-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "マスターチェック");
      m.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:12px;font-family:'Zen Maru Gothic',sans-serif";
      m.addEventListener("click", function (e) { var b = e.target.closest("[data-mk]"); if (b) act(b.getAttribute("data-mk"), b.getAttribute("data-v")); });
      document.body.appendChild(m); document.addEventListener("keydown", onKey, true);
    }
    m.innerHTML = '<div style="background:linear-gradient(165deg,#fff,#fffbeb);border-radius:24px;padding:14px;max-width:440px;width:100%;max-height:94vh;overflow-y:auto;box-shadow:0 10px 0 rgba(217,119,6,.3);color:#3b2f52">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:17px;font-weight:900;color:#b45309">🏆 マスターチェック</div>' +
      (ui.phase === "card" ? '' : '<button type="button" data-mk="close" style="border:none;background:#fef3c7;color:#b45309;font:900 14px \'Zen Maru Gothic\';border-radius:999px;padding:7px 14px;cursor:pointer">とじる</button>') + '</div>' + inner + '</div>';
    var f = m.querySelector("[data-mk='go'],[data-mk='ans'],[data-mk='next'],[data-mk='close']"); if (f) try { f.focus(); } catch (e) {}
  }
  var BTN = "display:block;width:100%;text-align:left;border:2px solid #fcd34d;background:#fff;border-radius:14px;padding:11px 12px;margin-top:7px;font:800 14.5px 'Zen Maru Gothic';color:#3b2f52;cursor:pointer";
  var BIG = "border:none;border-radius:999px;padding:11px 22px;font:900 15px 'Zen Maru Gothic';color:#fff;background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 4px 0 #92400e;cursor:pointer";

  function homeHtml() {
    var mc = mcAll();
    return '<div style="font-size:13px;font-weight:800;line-height:1.75;background:#fff;border:2px solid #fcd34d;border-radius:16px;padding:10px 12px">' +
      'MASTER に なった 単元を、ときどき たしかめるよ。<br>この ' + ui.ids.length + 'つの 単元から ' + PER + '問ずつ、ぜんぶで ' + ui.deck.length + '問。<br>' +
      '<b>1回目で しっかり 正解</b>できたら マスター キープ！ まちがえると…はく奪の 危機 ⚠️</div>' +
      '<div style="margin-top:8px;display:grid;gap:6px">' + ui.ids.map(function (id) {
        var r = mc[id] && mc[id].risk;
        return '<div style="background:' + (r ? "#fee2e2" : "#fffbeb") + ';border-radius:12px;padding:7px 10px;font-size:13px;font-weight:900">' + (r ? "⚠️ " : "🏆 ") + esc(stageName(id)) + (r ? '<span style="font-size:11px;color:#b91c1c">（はく奪の 危機）</span>' : '') + '</div>';
      }).join("") + '</div>' +
      '<div style="text-align:center;margin-top:12px"><button type="button" data-mk="go" style="' + BIG + '">🏆 はじめる</button></div>';
  }
  function cardHtml() {
    var c = ui.deck[ui.i], q = c.q;
    var head = '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;color:#b45309"><span>' + (ui.i + 1) + ' ／ ' + ui.deck.length + '</span><span>' + esc(stageName(c.sid)) + '</span></div>' +
      '<div style="height:8px;background:#fef3c7;border-radius:999px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:' + Math.round(ui.i / ui.deck.length * 100) + '%;background:linear-gradient(90deg,#f59e0b,#d97706)"></div></div>';
    var qs = '<div style="background:#fff;border:2px solid #fcd34d;border-radius:16px;padding:12px;font-size:15.5px;font-weight:900;line-height:1.6">' + esc(plain(q.q)) + '</div>';
    if (ui.res) {
      return head + qs + '<div style="margin-top:8px;border-radius:14px;padding:10px 12px;font-weight:900;line-height:1.6;background:' + (ui.res.ok ? "#dcfce7" : "#fee2e2") + '">' +
        (ui.res.ok ? "⭕ 正解！" : "❌ 答えは「" + esc(q.a[q.c]) + "」") +
        (!ui.res.ok && q.job_desc ? '<div style="font-size:12.5px;font-weight:700;margin-top:4px">' + esc(plain(q.job_desc)) + '</div>' : '') + '</div>' +
        '<div style="text-align:center;margin-top:10px"><button type="button" data-mk="next" style="' + BIG + '">つぎ ▶</button></div>';
    }
    return head + qs + ui.ord.map(function (j) { return '<button type="button" data-mk="ans" data-v="' + j + '" style="' + BTN + '">' + esc(q.a[j]) + '</button>'; }).join("");
  }
  function endHtml() {
    var lab = { keep: ["🏆", "マスター キープ！", "#dcfce7"], risk: ["⚠️", "はく奪の 危機！ 次の チェックで ごうかく しよう", "#fef9c3"], lost: ["💔", "はく奪… 2日 あけて ふくしゅうで ごうかく すれば 返り咲き！", "#fee2e2"] };
    return '<div style="text-align:center;font-size:40px">' + (ui.out.every(function (o) { return o.r === "keep"; }) ? "🏆" : "💪") + '</div>' +
      '<div style="text-align:center;font-size:16px;font-weight:900">' + ui.ok + ' ／ ' + ui.deck.length + '問 正解</div>' +
      '<div style="margin-top:8px;display:grid;gap:6px">' + ui.out.map(function (o) {
        var L = lab[o.r];
        return '<div style="background:' + L[2] + ';border-radius:12px;padding:8px 10px;font-size:13px;font-weight:900;line-height:1.5">' + L[0] + ' ' + esc(stageName(o.id)) + '<br><span style="font-size:12px">' + L[1] + '</span></div>';
      }).join("") + '</div>' +
      (ui.gainQ ? '<div style="text-align:center;font-size:12.5px;font-weight:800;margin-top:8px">おまけ +' + ui.gainQ + 'Q</div>' : '') +
      '<div style="text-align:center;margin-top:12px"><button type="button" data-mk="close" style="' + BIG + '">おわる</button></div>';
  }
  function render() { if (!ui) return; shell(ui.phase === "home" ? homeHtml() : ui.phase === "end" ? endHtml() : cardHtml()); }

  function build(ids) {
    var Q = quizzes(), deck = [];
    ids.forEach(function (id) { shuffle((Q[id] || []).filter(usable).slice()).slice(0, PER).forEach(function (q) { deck.push({ sid: id, q: q }); }); });
    return shuffle(deck);
  }
  function answer(j) {
    if (!ui || ui.res) return;
    var c = ui.deck[ui.i], ok = Number(j) === c.q.c;
    if (ok) ui.ok++; else ui.bad[c.sid] = true;
    ui.res = { ok: ok }; render();
  }
  function next() {
    if (!ui) return;
    ui.i++; ui.res = null;
    if (ui.i >= ui.deck.length) return finish();
    ui.ord = shuffle(ui.deck[ui.i].q.a.map(function (_, k) { return k; })); render();
  }
  function finish() {
    ui.out = ui.ids.map(function (id) { return { id: id, r: applyResult(id, !ui.bad[id]) }; });
    var keepN = ui.out.filter(function (o) { return o.r === "keep"; }).length;
    ui.gainQ = keepN; if (keepN) sd().q = (sd().q || 0) + keepN;
    if (window.tutorPlanMark) try { window.tutorPlanMark("mastercheck"); } catch (e) {}
    var name = { keep: "キープ", risk: "危機", lost: "はく奪" };
    log(ui.ok + "/" + ui.deck.length + "問 正解 ｜ " + ui.out.map(function (o) { return stageName(o.id) + "：" + name[o.r]; }).join("・") + (keepN ? " +" + keepN + "Q" : ""));
    try { if (window.saveGame) window.saveGame(); } catch (e) {}
    ui.phase = "end"; render();
  }
  function act(a, v) {
    if (a === "close") return close();
    if (a === "go") { ui.phase = "card"; ui.i = 0; ui.ok = 0; ui.bad = {}; ui.res = null; ui.ord = shuffle(ui.deck[0].q.a.map(function (_, k) { return k; })); return render(); }
    if (a === "ans") return answer(v);
    if (a === "next") return next();
  }
  window.openMasterCheck = function () {
    var ids = window.masterCheckCandidates().slice(0, STAGES).map(function (c) { return c.id; });
    if (!ids.length) { alert("🏆 いま たしかめる MASTER の 単元は ないよ！"); return; }
    var deck = build(ids); if (!deck.length) return;
    ui = { phase: "home", ids: ids, deck: deck }; render();
  };
})();
