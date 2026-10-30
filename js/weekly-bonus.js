/* =====================================================================
   js/weekly-bonus.js — 🗓️ 週の 皆勤ボーナス（Q）＋ ロバックス交換までの のこり
   ★2026-10-30追加（保護者：Q の 稼ぎが 悪いと 相談。1問・1クリアの Q は 上げず、毎日 つづけた ことに Q を 出す。
     ログインだけ・1問だけでは 出ない。1日に 解いた 問題の 最低ラインと 平均で きめる）
   ・数える 問題：ステージ・探偵ラボ など（triggerCorrectAnswer／triggerWrongAnswer）で、1問に つき 1回。
     その 問題が 出てから 3秒 未満で 押した 答えは 数えない（連打で ふやせない）。
     考えかたOS（js/think-os.js）は window.weeklyBonusCount(n) で 足す。
   ・やった日：その 日に 数えた 問題が DAY_MIN（10）問 いじょう。
   ・週（月〜日）の ボーナス：やった日が WEEK_MIN_DAYS（5）日 いじょうの 週だけ。
     やった日の 1日平均で 10〜19問 +50Q／20〜29問 +80Q／30問〜 +100Q。7日 ぜんぶ やった 週は さらに +20Q。上限 WEEK_CAP（120Q）。
   ・わたす 時：次の 週に はじめて ホームを ひらいた とき（さいご 2週間ぶんまで さかのぼる）。おしらせ＋LOG「🗓️週の皆勤ボーナス」。
   ・saveData.weekBonus = { days:{ "2026-10-30": 数 }, paid:{ "2026-10-26": Q（週の 月曜） } }。days は 35日ぶん のこす。
   ・ホームの「きょうの まなびプラン」の 下に カード：今週の やった日（✓）・今日の 問題数・ロバックス交換まで あと◯Q。
   ===================================================================== */
(function () {
  var DAY_MIN = 10, WEEK_MIN_DAYS = 5, WEEK_CAP = 120, MIN_MS = 3000, EXCHANGE_Q = 1400;
  var TIERS = [[30, 100], [20, 80], [10, 50]], ALL7 = 20;
  window.WEEK_BONUS_RULE = { dayMin: DAY_MIN, weekMinDays: WEEK_MIN_DAYS, tiers: TIERS, all7: ALL7, cap: WEEK_CAP };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function now() { return new Date(window.currentServerTime || Date.now()); }
  function monday(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function st() {
    var sd = window.saveData; if (!sd) return null;
    if (!sd.weekBonus || typeof sd.weekBonus !== "object") sd.weekBonus = {};
    var w = sd.weekBonus;
    if (!w.days || typeof w.days !== "object") w.days = {};
    if (!w.paid || typeof w.paid !== "object") w.paid = {};
    return w;
  }
  function save() { try { if (window.saveGame) window.saveGame(); } catch (e) {} }
  function log(msg) { try { if (window.syncWithGoogleSpreadsheet && window.saveData) window.syncWithGoogleSpreadsheet("LOG", { stage: "🗓️週の皆勤ボーナス", msg: msg }); } catch (e) {} }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // 週の まとめ（月曜の Date）
  function weekSummary(mon) {
    var w = st() || { days: {} }, days = [], done = 0, sum = 0;
    for (var i = 0; i < 7; i++) { var k = iso(addDays(mon, i)), n = Number(w.days[k] || 0); days.push({ k: k, n: n, ok: n >= DAY_MIN }); if (n >= DAY_MIN) { done++; sum += n; } }
    var avg = done ? Math.round(sum / done) : 0, q = 0;
    if (done >= WEEK_MIN_DAYS) { for (var t = 0; t < TIERS.length; t++) if (avg >= TIERS[t][0]) { q = TIERS[t][1]; break; } if (done === 7) q += ALL7; q = Math.min(WEEK_CAP, q); }
    return { mon: iso(mon), days: days, done: done, avg: avg, q: q };
  }
  window.weekBonusSummary = function () { return weekSummary(monday(now())); };

  /* ---- 数える ---- */
  var counted = {};
  function countOne() {
    var w = st(); if (!w) return;
    var startedAt = window.currentQuestionStartedAt;
    if (typeof startedAt !== "number") return;
    if (counted[startedAt]) return; // 同じ 問題で 2回目の 答え（まちがえて やり直し）は 数えない
    counted[startedAt] = 1;
    if (Date.now() - startedAt < MIN_MS) return;
    add(1);
  }
  function add(n) {
    var w = st(); if (!w) return;
    var k = iso(now()), before = Number(w.days[k] || 0);
    w.days[k] = before + n;
    if (before < DAY_MIN && w.days[k] >= DAY_MIN) { toast("🗓️ 今日は「やった日」に なったよ！（" + DAY_MIN + "問 たっせい）"); log("やった日：" + k + "（" + w.days[k] + "問）"); }
    // 古い 日を けす
    var lim = iso(addDays(now(), -35)); Object.keys(w.days).forEach(function (d) { if (d < lim) delete w.days[d]; });
    render();
  }
  window.weeklyBonusCount = function (n) { try { add(Math.max(0, Number(n) || 0)); } catch (e) {} };

  function wrap(name) {
    var o = window[name]; if (typeof o !== "function" || o._wbWrapped) return !!(o && o._wbWrapped);
    var w = function () { try { countOne(); } catch (e) {} return o.apply(this, arguments); };
    w._wbWrapped = true; window[name] = w; return true;
  }

  /* ---- 週が かわったら わたす ---- */
  function payPast() {
    var w = st(); if (!w || !window.playerId) return;
    var thisMon = monday(now()), out = [];
    for (var b = 2; b >= 1; b--) {
      var mon = addDays(thisMon, -7 * b), key = iso(mon);
      if (w.paid[key] !== undefined) continue;
      var s = weekSummary(mon);
      if (!s.days.some(function (d) { return d.n > 0; })) { w.paid[key] = 0; continue; }
      w.paid[key] = s.q;
      if (s.q > 0) window.saveData.q = (Number(window.saveData.q) || 0) + s.q;
      out.push(s);
      log(key + "の 週：やった日 " + s.done + "日・平均 " + s.avg + "問 → " + (s.q ? "+" + s.q + "Q" : "ボーナス なし（" + WEEK_MIN_DAYS + "日 いじょうで 出るよ）"));
    }
    var ks = Object.keys(w.paid).sort(); while (ks.length > 12) delete w.paid[ks.shift()];
    if (out.length) { save(); show(out); }
  }
  function show(list) {
    var old = document.getElementById("wb-modal"); if (old) old.remove();
    var tot = list.reduce(function (a, s) { return a + s.q; }, 0);
    var m = document.createElement("div"); m.id = "wb-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "wb-t");
    m.style.cssText = "position:fixed;inset:0;z-index:10006;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Zen Maru Gothic',sans-serif";
    var dow = ["月", "火", "水", "木", "金", "土", "日"];
    m.innerHTML = '<div style="background:linear-gradient(165deg,#fff,#fffbeb);border:3px solid #fbbf24;border-radius:24px;padding:16px;max-width:380px;width:100%;max-height:88vh;overflow-y:auto;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.3)">' +
      '<div style="font-size:40px" aria-hidden="true">' + (tot ? "🗓️✨" : "🗓️") + '</div><h2 id="wb-t" style="margin:2px 0 6px;font-size:19px;font-weight:900;color:#92400e">' + (tot ? "先週の がんばりボーナス！" : "先週の ふり返り") + '</h2>' +
      list.map(function (s) {
        return '<div style="background:#fff;border:2px solid #fde68a;border-radius:16px;padding:10px;margin:8px 0">' +
          '<div style="font-size:12px;font-weight:800;color:#a16207">' + s.mon.slice(5).replace("-", "/") + ' からの 週</div>' +
          '<div style="display:flex;gap:4px;justify-content:center;margin:6px 0">' + s.days.map(function (d, i) { return '<span title="' + d.k + ' ' + d.n + '問" style="display:inline-flex;flex-direction:column;align-items:center;width:36px;border-radius:10px;padding:3px 0;font-size:10px;font-weight:900;' + (d.ok ? "background:#22c55e;color:#fff" : "background:#f3f4f6;color:#9ca3af") + '">' + dow[i] + '<b style="font-size:13px">' + (d.ok ? "✓" : d.n || "・") + '</b></span>'; }).join("") + '</div>' +
          '<div style="font-size:13px;font-weight:900;color:#422006">やった日 ' + s.done + '日・1日平均 ' + s.avg + '問</div>' +
          '<div style="font-size:20px;font-weight:900;color:' + (s.q ? "#16a34a" : "#9ca3af") + ';margin-top:2px">' + (s.q ? "+" + s.q + "Q" : "ボーナスは なし") + '</div>' +
          (s.q ? '' : '<div style="font-size:11.5px;font-weight:800;color:#92400e">1日 ' + DAY_MIN + '問 いじょうの 日が ' + WEEK_MIN_DAYS + '日 あると 出るよ。今週 ちょうせん！</div>') + '</div>';
      }).join("") +
      '<div style="font-size:11.5px;font-weight:700;color:#78350f;line-height:1.6;text-align:left">1日 ' + DAY_MIN + '問 いじょう 解いた 日が「やった日」。' + WEEK_MIN_DAYS + '日 いじょうで、平均 10問 → 50Q／20問 → 80Q／30問 → 100Q、7日 ぜんぶで ＋20Q。</div>' +
      '<button type="button" id="wb-ok" style="margin-top:12px;border:none;border-radius:999px;min-height:48px;padding:10px 28px;font:900 15px \'Zen Maru Gothic\';color:#fff;background:linear-gradient(135deg,#f59e0b,#db2777);box-shadow:0 4px 0 #92400e;cursor:pointer">' + (tot ? "やったね！" : "わかった") + '</button></div>';
    document.body.appendChild(m);
    var ok = document.getElementById("wb-ok"), done = function () { m.remove(); render(); try { if (window.updateUI) window.updateUI(); } catch (e) {} };
    ok.onclick = done; m.addEventListener("keydown", function (e) { if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); if (e.key === "Escape") done(); else ok.focus(); } });
    setTimeout(function () { try { ok.focus(); } catch (e) {} }, 50);
    if (tot && window.speakText) { try { window.speakText("先週の がんばりボーナス！ " + tot + "キュー", "ja-JP"); } catch (e) {} }
  }

  /* ---- ホームの カード ---- */
  function render() {
    try {
      var host = document.getElementById("tutor-plan-card"); if (!host || !window.saveData || !window.playerId) return;
      var box = document.getElementById("wb-card");
      if (!box) { box = document.createElement("section"); box.id = "wb-card"; box.setAttribute("aria-label", "今週の やった日と ボーナス"); host.parentNode.insertBefore(box, host.nextSibling); }
      var s = weekSummary(monday(now())), t = iso(now()), today = s.days.filter(function (d) { return d.k === t; })[0] || { n: 0 };
      var q = Number(window.saveData.q) || 0, left = Math.max(0, EXCHANGE_Q - q), dow = ["月", "火", "水", "木", "金", "土", "日"];
      var need = Math.max(0, WEEK_MIN_DAYS - s.done), remainDays = s.days.filter(function (d) { return d.k >= t; }).length;
      var tip = s.done >= WEEK_MIN_DAYS ? "今週の ボーナス 確定！ いまの 見こみ +" + s.q + "Q（平均 " + s.avg + "問）" : need > remainDays ? "今週は 5日に とどかないけど、1日 " + DAY_MIN + "問の 練習に しよう。来週 ボーナスを ねらおう！" : "あと " + need + "日 で ボーナス！";
      box.style.cssText = "margin:10px 0;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fbbf24;border-radius:18px;padding:10px 12px;font-family:'Zen Maru Gothic',sans-serif";
      box.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap"><div style="font-size:13px;font-weight:900;color:#92400e">🗓️ 今週の やった日（' + s.done + '／' + WEEK_MIN_DAYS + '日で ボーナス）</div>' +
        '<div style="font-size:11.5px;font-weight:900;color:' + (today.n >= DAY_MIN ? "#16a34a" : "#b45309") + '">今日 ' + today.n + '／' + DAY_MIN + '問' + (today.n >= DAY_MIN ? ' ✓' : '') + '</div></div>' +
        '<div style="display:flex;gap:4px;margin:6px 0" role="list">' + s.days.map(function (d, i) {
          var isT = d.k === t;
          return '<span role="listitem" aria-label="' + dow[i] + '曜日 ' + (d.ok ? "やった日" : d.n + "問") + '" style="flex:1;display:flex;flex-direction:column;align-items:center;border-radius:10px;padding:3px 0;font-size:10px;font-weight:900;' + (d.ok ? "background:#22c55e;color:#fff;" : isT ? "border:2px dashed #f59e0b;color:#b45309;background:#fff;" : "background:#fff;color:#9ca3af;") + '">' + dow[i] + '<b style="font-size:12px">' + (d.ok ? "✓" : d.k > t ? "" : (d.n || "・")) + '</b></span>';
        }).join("") + '</div>' +
        '<div style="font-size:11.5px;font-weight:800;color:#78350f">' + esc(tip) + '</div>' +
        '<div style="margin-top:6px;font-size:11.5px;font-weight:900;color:#7c2d12">👑 ロバックス交換（' + EXCHANGE_Q + 'Q）まで ' + (left ? 'あと <b>' + left + 'Q</b>' : 'とどいたよ！') + '</div>' +
        '<div style="height:8px;background:#fff;border-radius:999px;overflow:hidden;margin-top:3px" aria-hidden="true"><div style="height:100%;width:' + Math.min(100, Math.round(q / EXCHANGE_Q * 100)) + '%;background:linear-gradient(90deg,#f59e0b,#ef4444)"></div></div>';
    } catch (e) { console.error("weekly-bonus", e); }
  }
  window.renderWeekBonus = render;
  function toast(t) {
    var el = document.createElement("div"); el.setAttribute("role", "status");
    el.style.cssText = "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:10004;background:#14532d;color:#fff;border:2px solid #86efac;border-radius:16px;padding:9px 16px;font:900 13px 'Zen Maru Gothic',sans-serif;max-width:88vw;text-align:center";
    el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 3800);
  }

  function install() { var a = wrap("triggerCorrectAnswer"), b = wrap("triggerWrongAnswer"); return a && b; }
  if (!install()) { var n = 0, iv = setInterval(function () { if (install() || ++n > 60) clearInterval(iv); }, 250); }
  var paidTried = false, k = 0;
  setInterval(function () {
    render();
    if (!paidTried && window.saveData && window.playerId && window.saveDataConfirmedSource) {
      var ov = document.getElementById("data-loading-overlay"); if (ov && getComputedStyle(ov).display !== "none") return;
      if (["game-screen", "tutor-screen", "allowance-screen", "login-modal"].some(function (id) { var e = document.getElementById(id); return e && getComputedStyle(e).display !== "none"; })) return;
      paidTried = true; try { payPast(); } catch (e) { console.error("weekly-bonus", e); }
    }
    if (++k > 100000) k = 0;
  }, 1500);
})();
