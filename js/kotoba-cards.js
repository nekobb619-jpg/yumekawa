/* =====================================================================
   js/kotoba-cards.js — 📇 ことばカード（用語集）＋ 🤔 なるほど？（理由を えらぶ）
   ★2026-11-05追加（保護者：白紙に 書くのは 面倒で ゆめかわ 自体から はなれて しまう。用語が「こういう ことだよ」と
     パッと 出るのは いい。「なぜ？」を 書く・まちがえた 問題の 確認は 実は 飛ばされて いる → 書かせずに「なぜかな？
     こういう ことかな？」と 答えを においわせて えらばせる。何回も くりかえすうちに「そういう 考えが あるんだ」に）
   ① ことばカード：単元の 用語を 1行で。KOTOBA の key は ステージid の 先頭（"算数/がい数"）。
      出る ところ：🤔 なるほど？ の あと／⚡ すらすら ふくしゅう の 4択（この ことばの いみは？）。
      見た カードは saveData.kotoba[id] = 見た 回数（すらすらで 正解すると ⭐：saveData.kotobaStar[id]=1）。
      はじめて 見た カード 1まいに つき シールの かけら ＋1（1日 5こまで）。☰メニュー「📇 ことば図鑑」で ぜんぶ 見られる。
   ② 🤔 なるほど？：「こたえは ◯◯。どうして かな？」→ 理由を 3つから えらぶ（1つは その 問題の 解説の 1文目、
      2つは 同じ ステージの ほかの 問題の 解説）。正解で かけら ＋1（1日 5こまで、①と 同じ わく）。
      ・ステージの さいごの「まちがえた 問題の 確認」（index.html renderReviewChatStep）を この 形に かえる
      ・クリアの あとの「なぜ？メモ」（js/why-note.js）も 書く かわりに これを 出す（書くのは「できたら」）
   ===================================================================== */
(function () {
  "use strict";
  var K = window.KOTOBA = [
    { id: "gs1", key: "算数/がい数", t: "がい数", d: "だいたいの 数。「約◯◯」と 言う" },
    { id: "gs2", key: "算数/がい数", t: "四捨五入", d: "0〜4は 切り捨て、5〜9は 切り上げる" },
    { id: "gs3", key: "算数/がい数", t: "切り捨て", d: "その 位より 下を 0に する（数は 小さく なる）" },
    { id: "gs4", key: "算数/がい数", t: "切り上げ", d: "その 位より 下を 0にして、1つ 上の 位を 1 ふやす" },
    { id: "gs5", key: "算数/がい数", t: "以上", d: "その 数を 入れて、それより 大きい" },
    { id: "gs6", key: "算数/がい数", t: "未満", d: "その 数を 入れないで、それより 小さい" },
    { id: "gs7", key: "算数/がい数", t: "見積もり", d: "先に だいたいの 数で 計算して 見当を つける" },
    { id: "sy1", key: "算数/小数", t: "0.1が いくつ分", d: "0.3×4 は 0.1が 3×4＝12こ で 1.2" },
    { id: "sy2", key: "算数/小数", t: "小数点を そろえる", d: "たし算・ひき算の 筆算は 小数点を たてに そろえる" },
    { id: "sy3", key: "算数/小数", t: "積の 小数点", d: "小数×整数は、かけられる数に そろえて 小数点を うつ" },
    { id: "sk1", key: "算数/式と計算", t: "計算の 順じょ", d: "（ ）の 中 → × と ÷ → ＋ と −" },
    { id: "sk2", key: "算数/式と計算", t: "1つの 式", d: "（ ）を 使うと、2つの 式を 1つに まとめられる" },
    { id: "wr1", key: "算数/わり算", t: "商", d: "わり算の 答え" },
    { id: "wr2", key: "算数/わり算", t: "あまり", d: "かならず わる数より 小さい" },
    { id: "wr3", key: "算数/わり算", t: "たしかめ算", d: "わる数 × 商 ＋ あまり ＝ わられる数" },
    { id: "kd1", key: "算数/角度", t: "直角", d: "90度。三角じょうぎの かどの 形" },
    { id: "kd2", key: "算数/角度", t: "1回転の 角", d: "360度。半回転は 180度" },
    { id: "kd3", key: "算数/角度", t: "分度器の 使い方", d: "中心を 頂点に、0の 線を 辺に あわせて 読む" },
    { id: "mn1", key: "算数/面積", t: "面積", d: "広さ。1辺 1cmの 正方形（1cm²）が いくつ分か" },
    { id: "mn2", key: "算数/面積", t: "長方形の 面積", d: "たて × よこ" },
    { id: "on1", key: "理科/温度と体積", t: "体積", d: "ものが しめる かさ（大きさ）" },
    { id: "on2", key: "理科/温度と体積", t: "空気の 体積", d: "あたためると 大きく、冷やすと 小さく なる" },
    { id: "on3", key: "理科/温度と体積", t: "変わり方の 大きさ", d: "空気 ＞ 水 ＞ 金ぞく の 順に 大きい" },
    { id: "on4", key: "理科/温度と体積", t: "実験の 条件", d: "調べたい こと だけ かえて、ほかは 同じに する" },
    { id: "kw1", key: "理科/空気と水", t: "とじこめた 空気", d: "おすと ちぢみ、もとに もどろうと する" },
    { id: "kw2", key: "理科/空気と水", t: "とじこめた 水", d: "おしても ほとんど ちぢまない" },
    { id: "hs1", key: "理科/星", t: "夏の大三角", d: "デネブ・ベガ・アルタイルを むすんだ 形" },
    { id: "hs2", key: "理科/星", t: "月の 動き", d: "東から のぼり、南の 空を 通って 西へ" },
    { id: "kj1", key: "国語/漢字", t: "協", d: "十（あつまる）＋ 力が 3つ ＝ 力を 合わせる" },
    { id: "kj2", key: "国語/漢字", t: "録", d: "金へん。「記録」の ろく。緑（みどり）と ちがう" },
    { id: "kj3", key: "国語/漢字", t: "博", d: "十（たくさん）＋ ひろく ゆきわたる ＝ ひろく 知る" },
    { id: "ky1", key: "国語/慣用句", t: "慣用句", d: "2つ いじょうの ことばが くっついて、とくべつな いみに なる 言い方" },
    { id: "dk1", key: "国語/読解", t: "気持ちの 変化", d: "言葉と 行動を 手がかりに、はじめ → おわり を くらべる" },
    { id: "dk2", key: "国語/読解", t: "根拠", d: "答えの もとに なる 本文の 場所。線を 引く" },
    { id: "gm1", key: "社会/ごみ", t: "3R", d: "リデュース（へらす）・リユース（くりかえし 使う）・リサイクル（作りかえる）" },
    { id: "sd1", key: "社会/水道", t: "じょう水場", d: "川や ダムの 水を きれいに して 飲める 水に する ところ" },
    { id: "sj1", key: "社会/先人", t: "先人の 工夫", d: "こまりごと → 工夫・努力 → いまの くらしに つながる" }
  ];
  var DAY_MAX = 5;
  function d0() { return window.saveData || null; }
  function today() { var x = new Date(window.currentServerTime || Date.now()); return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate(); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function plain(s) { return String(s || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
  function store() {
    var d = d0(); if (!d) return null;
    if (!d.kotoba || typeof d.kotoba !== "object") d.kotoba = {};
    if (!d.kotobaStar || typeof d.kotobaStar !== "object") d.kotobaStar = {};
    if (!d.kotobaDay || d.kotobaDay.d !== today()) d.kotobaDay = { d: today(), n: 0 };
    return d;
  }
  // かけら（1日 DAY_MAX こ。ことばカード・なるほど 共通）
  function shard(why) {
    var d = store(); if (!d || d.kotobaDay.n >= DAY_MAX || !window.stickerAddShardsExternal) return 0;
    var got = window.stickerAddShardsExternal(1); if (got) d.kotobaDay.n += got; return got;
  }
  function cardsFor(stageId) { var s = String(stageId || ""); return K.filter(function (c) { return s.indexOf(c.key + "/") === 0 || s === c.key; }); }
  function seeCard(c) { var d = store(); if (!d || !c) return false; var first = !d.kotoba[c.id]; d.kotoba[c.id] = (d.kotoba[c.id] || 0) + 1; return first && shard("kotoba") > 0; }
  window.kotobaFor = cardsFor;
  window.kotobaSeen = function (id, star) { var d = store(); if (!d) return; d.kotoba[id] = (d.kotoba[id] || 0) + 1; if (star) d.kotobaStar[id] = 1; };

  // ことばカードの HTML（1まい）。いちばん 見た 回数が 少ない カードを えらぶ
  window.kotobaCardHtml = function (stageId) {
    var l = cardsFor(stageId); if (!l.length) return "";
    var d = store() || { kotoba: {} };
    l = l.slice().sort(function (a, b) { return (d.kotoba[a.id] || 0) - (d.kotoba[b.id] || 0) || (Math.random() - 0.5); });
    var c = l[0], bonus = seeCard(c);
    return '<div style="margin-top:8px;background:#faf5ff;border:2px dashed #c4b5fd;border-radius:14px;padding:8px 10px;text-align:left">' +
      '<div style="font-size:11px;font-weight:900;color:#6d28d9">📇 ことばカード' + (bonus ? '　<span style="color:#db2777">はじめて！ かけら ＋1</span>' : '') + '</div>' +
      '<div style="font-size:15px;font-weight:900;color:#3b0764;margin-top:2px">' + esc(c.t) + '</div>' +
      '<div style="font-size:13px;font-weight:700;color:#1f2937;line-height:1.5">' + esc(c.d) + '</div></div>';
  };

  // 🤔 なるほど？ 理由の 3択を 作る（item：{ q, a, c, correct_answers, job_desc }、stageId）
  function firstSentence(s) { var t = plain(s); if (!t) return ""; var m = t.match(/^[^。！？!?]*[。！？!?]?/); t = (m ? m[0] : t).trim(); return t.length > 70 ? t.slice(0, 68) + "…" : t; }
  function allQuizzes() { var o = {}; Object.keys(window).forEach(function (k) { if (k.indexOf("CONTENT_QUIZZES") === 0 && window[k] && typeof window[k] === "object") Object.keys(window[k]).forEach(function (sid) { o[sid] = window[k][sid]; }); }); return o; }
  window.naruhodoChoices = function (item, stageId) {
    var right = firstSentence(item.job_desc); if (!right || right.length < 6) return null;
    var Q = allQuizzes(), pool = [];
    var same = Q[stageId] || [];
    var cat = String(stageId || "").split("/").slice(0, 2).join("/");
    function add(arr) { (arr || []).forEach(function (q) { var s = firstSentence(q.job_desc); if (s && s.length >= 6 && s !== right && pool.indexOf(s) < 0) pool.push(s); }); }
    add(same);
    if (pool.length < 2) Object.keys(Q).forEach(function (sid) { if (sid !== stageId && sid.indexOf(cat + "/") === 0) add(Q[sid]); });
    if (pool.length < 2) return null;
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    var opts = [right, pool[0], pool[1]];
    for (var k = opts.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), u = opts[k]; opts[k] = opts[r]; opts[r] = u; }
    return { opts: opts, right: opts.indexOf(right) };
  };
  function answerText(item) { if (item.correct_answers && item.correct_answers.length) return item.correct_answers.join(" または "); if (item.a && typeof item.c === "number") return item.a[item.c]; return ""; }

  // host の 中に「なるほど？」を 描く。done(ok) は えらび おわった あと
  window.renderNaruhodo = function (host, item, stageId, done) {
    var ch = window.naruhodoChoices(item, stageId), ans = answerText(item);
    if (!ch) { host.innerHTML = '<div style="font-weight:900">こたえ：' + esc(ans) + '</div><div style="font-size:13px;margin-top:4px">' + esc(plain(item.job_desc || item.hint || "")) + '</div>' + window.kotobaCardHtml(stageId); if (done) done(null); return; }
    host.innerHTML = '<div style="font-size:13px;font-weight:900;color:#5b21b6">こたえは <span style="background:#fef3c7;border-radius:8px;padding:1px 6px">' + esc(ans) + '</span>。</div>' +
      '<div style="font-size:14px;font-weight:900;color:#3b0764;margin:6px 0 4px">🤔 どうして かな？ こういう ことかな？</div>' +
      ch.opts.map(function (o, i) { return '<button type="button" data-nh="' + i + '" style="display:block;width:100%;text-align:left;min-height:44px;margin-top:6px;border:2px solid #ddd6fe;background:#fff;border-radius:12px;padding:8px 10px;font:800 13px \'Zen Maru Gothic\',sans-serif;color:#1f2937;cursor:pointer;line-height:1.45">' + esc(o) + '</button>'; }).join("") +
      '<div data-nh-res></div>';
    var answered = false;
    Array.prototype.forEach.call(host.querySelectorAll("[data-nh]"), function (b) {
      b.onclick = function () {
        if (answered) return; answered = true;
        var i = Number(b.getAttribute("data-nh")), ok = i === ch.right;
        Array.prototype.forEach.call(host.querySelectorAll("[data-nh]"), function (x, j) {
          x.disabled = true; x.style.cursor = "default";
          if (j === ch.right) { x.style.background = "#dcfce7"; x.style.borderColor = "#16a34a"; }
          else if (j === i) { x.style.background = "#fee2e2"; x.style.borderColor = "#ef4444"; }
          else x.style.opacity = ".55";
        });
        var got = ok ? shard("naruhodo") : 0;
        host.querySelector("[data-nh-res]").innerHTML = '<div style="margin-top:8px;font-size:14px;font-weight:900;color:' + (ok ? "#15803d" : "#b45309") + '">' +
          (ok ? "💡 なるほど！ そういう ことだね" + (got ? "（かけら ＋1）" : "") : "おしい！ みどりの 理由が ほんとうの わけ。こういう 考え方も あるんだね") + '</div>' + window.kotobaCardHtml(stageId);
        try { var d = store(); if (d) { d.naruhodo = d.naruhodo || { n: 0, ok: 0 }; d.naruhodo.n++; if (ok) d.naruhodo.ok++; } } catch (e) {}
        if (done) done(ok);
      };
    });
  };

  // 📇 ことば図鑑
  window.openKotobaZukan = function () {
    var d = store() || { kotoba: {}, kotobaStar: {} }, seen = K.filter(function (c) { return d.kotoba[c.id]; }).length;
    var by = {}; K.forEach(function (c) { (by[c.key] = by[c.key] || []).push(c); });
    var m = document.createElement("div"); m.id = "kotoba-zukan"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "ことば図鑑");
    m.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(31,27,46,.6);display:flex;align-items:center;justify-content:center;padding:12px;font-family:'Zen Maru Gothic',sans-serif";
    m.innerHTML = '<div style="background:#fff;border-radius:22px;padding:14px;max-width:440px;width:100%;max-height:92vh;overflow-y:auto;color:#2e1065">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:17px;font-weight:900">📇 ことば図鑑 <span style="font-size:12px;color:#6d28d9">' + seen + '／' + K.length + 'まい</span></div>' +
      '<button type="button" id="kz-x" style="min-height:44px;border:none;background:#ede9fe;color:#5b21b6;border-radius:999px;padding:6px 14px;font:900 14px \'Zen Maru Gothic\';cursor:pointer">とじる</button></div>' +
      '<div style="font-size:12px;font-weight:700;color:#57534e;margin:4px 0 8px">見た カードは 色が つくよ。⭐ は すらすら ふくしゅうで 正解した カード。</div>' +
      Object.keys(by).map(function (k) {
        return '<div style="font-size:12px;font-weight:900;color:#6d28d9;margin:10px 0 4px">' + esc(k.replace("/", " ・ ")) + '</div>' + by[k].map(function (c) {
          var s = d.kotoba[c.id];
          return '<div style="border-radius:12px;padding:6px 10px;margin-top:4px;' + (s ? 'background:#faf5ff;border:2px solid #ddd6fe' : 'background:#f5f5f4;border:2px dashed #d6d3d1') + '">' +
            '<div style="font-size:14px;font-weight:900;color:' + (s ? '#3b0764' : '#a8a29e') + '">' + (d.kotobaStar[c.id] ? '⭐ ' : '') + (s ? esc(c.t) : '？？？') + '</div>' +
            (s ? '<div style="font-size:12.5px;font-weight:700;color:#1f2937">' + esc(c.d) + '</div>' : '') + '</div>';
        }).join("");
      }).join("") + '</div>';
    document.body.appendChild(m);
    var x = function () { m.remove(); document.removeEventListener("keydown", kd, true); }, kd = function (e) { if (e.key === "Escape") x(); };
    document.getElementById("kz-x").onclick = x; m.addEventListener("click", function (e) { if (e.target === m) x(); }); document.addEventListener("keydown", kd, true);
  };
})();
