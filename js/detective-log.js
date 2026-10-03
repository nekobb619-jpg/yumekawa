/* =====================================================================
   detective-log.js — 探偵ラボの 1問ごとの 記録（🔍探偵ラボ記録）
   ★2026-10-03追加（保護者：りおは 今 探偵ラボを メインに やって いるので、ここの データを 取りたい。
     4択で まちがえてから 正解までの 時間・選んだ 順番を 知りたい）
   - 1回の 探偵ラボ（7問）が 終わるたびに、log_db に 1行だけ 送る（GAS は 変えない。LOG は 1回分で 1通信）
       stage: "🔍探偵ラボ記録"
       msg  : 「算数 3回目 厳しめ 一発4/7 62秒 ｜{JSON}」
       JSON : { v:1, s:教科, r:その日の何回目, st:厳しめか, sec:全体の秒, q:[ { id, k, t, res, ms, w:[[選んだ まちがい, その時の ms], …] } ] }
         k   … bank（探偵ラボ専用の 問題）／stage（ふつうの 単元の 問題）／gen（その場で 作る 問題）／boss（探偵ノート）
         res … 1（1回目で 正解）／2（まちがえてから 正解）／p（厳しめで 答えを 見た）／s（わからない）
         ms  … 問題が 出てから 正解（または 答えを 見る）までの ミリ秒
   - セーブには 合計だけ：saveData.detectiveStats[教科] = { runs, n, first, later, pass, skip, ms }（小さいので 本体の 行）
   - くわしい 記録を セーブに 入れないのは、1セル 50,000文字の 上限の ため（.knowledge/postmortems.md）
   - ほかの js と 同じく、もとの 関数を 包むだけ（index.html の 中の 流れは 変えない）
   ===================================================================== */
(function () {
  "use strict";
  var SUBJ = { math: "算数", kokugo: "国語", science: "理科", shakai: "社会" };
  var D = null; // いま やって いる 回の 記録

  function now() { return Date.now(); }
  function cur() { return (window.currentQuestions || [])[window.currentQIdx]; }
  function item() { return D ? D.q[window.currentQIdx] : null; }
  function clean(s) { return String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }

  var start = window.startDetectiveLab;
  if (typeof start === "function") {
    window.startDetectiveLab = function (subject) {
      window._dlogSubject = subject; D = null;
      return start.apply(this, arguments);
    };
  }

  var show = window.showQuestionStep;
  if (typeof show === "function") {
    window.showQuestionStep = function () {
      var r = show.apply(this, arguments);
      try {
        if (window.dynamicPracticeModeActive) {
          if (!D || window.currentQIdx === 0 && D.q[0] && D.q[0].res) D = { s: window._dlogSubject || "", r: window._detectiveLabRunIndexToday || 1, st: window.isDetectiveLabStrictRun ? 1 : 0, t0: now(), q: [] };
          var q = cur(), i = window.currentQIdx;
          if (q && !D.q[i]) {
            D.q[i] = {
              id: q.id || (q._srcStageId && q.qid ? q._srcStageId + "::" + q.qid : ""),
              k: q.isDetectiveBoss ? "boss" : q.id ? "bank" : q._srcStageId ? "stage" : "gen",
              t: clean(q.q).slice(0, 36), t0: now(), w: [], res: "", ms: 0
            };
          }
        }
      } catch (e) {}
      return r;
    };
  }

  function wrap(name, fn) {
    var orig = window[name];
    if (typeof orig !== "function") return;
    window[name] = function () {
      try { if (window.dynamicPracticeModeActive && D) fn(item()); } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
  // まちがい：おした ボタン（index.html が 先に "choice-btn wrong" に して いる）の 文字を のこす
  wrap("triggerWrongAnswer", function (it) {
    if (!it || it.res) return;
    var picked = "";
    [].forEach.call(document.querySelectorAll(".choice-btn.wrong"), function (b) {
      var t = clean(b.textContent).slice(0, 30);
      if (t && !it.w.some(function (x) { return x[0] === t; })) picked = t;
    });
    it.w.push([picked, now() - it.t0]);
  });
  wrap("triggerCorrectAnswer", function (it) { if (it && !it.res) { it.res = it.w.length ? "2" : "1"; it.ms = now() - it.t0; } });
  wrap("triggerPassAnswer", function (it) { if (it && !it.res) { it.res = "p"; it.ms = now() - it.t0; } });
  wrap("triggerSkipAnswer", function (it) { if (it && !it.res) { it.res = "s"; it.ms = now() - it.t0; } });

  var finish = window.finishDynamicPractice;
  if (typeof finish === "function") {
    window.finishDynamicPractice = function () {
      var rec = D; D = null;
      try {
        if (rec && rec.q.length && window.saveData) {
          var qs = rec.q.filter(Boolean), first = 0, later = 0, pass = 0, skip = 0, ms = 0;
          qs.forEach(function (x) { if (x.res === "1") first++; else if (x.res === "2") later++; else if (x.res === "p") pass++; else if (x.res === "s") skip++; ms += x.ms || 0; });
          // セーブには 合計だけ（もとの finishDynamicPractice の saveGame で いっしょに 保存される）
          var all = window.saveData.detectiveStats = (window.saveData.detectiveStats && typeof window.saveData.detectiveStats === "object") ? window.saveData.detectiveStats : {};
          var a = all[rec.s] = all[rec.s] || { runs: 0, n: 0, first: 0, later: 0, pass: 0, skip: 0, ms: 0 };
          a.runs++; a.n += qs.length; a.first += first; a.later += later; a.pass += pass; a.skip += skip; a.ms += ms;
          var sec = Math.round((now() - rec.t0) / 1000);
          var json = JSON.stringify({ v: 1, s: rec.s, r: rec.r, st: rec.st, sec: sec, q: qs.map(function (x) { var o = { k: x.k, res: x.res, ms: x.ms }; if (x.id) o.id = x.id; else o.t = x.t; if (x.w.length) o.w = x.w; return o; }) });
          var head = (SUBJ[rec.s] || rec.s) + " " + rec.r + "回目 " + (rec.st ? "厳しめ" : "通常") + " 一発" + first + "/" + qs.length + " " + sec + "秒";
          var send = window.syncWithGoogleSpreadsheet;
          // もとの 記録（探偵ラボ_◯回目）の あとに 送る
          setTimeout(function () { try { if (send) send("LOG", { stage: "🔍探偵ラボ記録", msg: head + " ｜" + json }); } catch (e) {} }, 0);
        }
      } catch (e) {}
      return finish.apply(this, arguments);
    };
  }
})();
