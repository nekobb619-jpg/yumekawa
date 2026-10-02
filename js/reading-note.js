/* =====================================================================
   js/reading-note.js — 📚 読書ノート（作品読解6＋気持ちの動き）と「わたしの本だな」
   ★2026-10-02追加。学級通信の「作品読解6」（人物・事件・変化・カギ・価値・新たな問い）の表に、
   主人公の気持ちの動き（はじめ→事件→さいご）と、読書感想としての「わたしの気持ち」を加えた
   ワークシートをアプリ内で書けるようにする。
   - 保存：saveData.readingNotes（新しい順、最大 READING_NOTE_MAX 件、本体行）。
     書いた内容は log_db にも送る（おうちの人がスプレッドシートで読める・古いノートの控え）。
   - Qは付与しない（文字数を稼ぐ書き方を誘発しないため）。本だなに並ぶこと自体をごほうびにする。
   - 子どもが書いた文字は必ずエスケープして表示する。
   ===================================================================== */
(function () {
  window.READING_NOTE_MAX = 8;
  window.READING_NOTE_FIELD_MAX = 100;

  // 気持ちのことば（v：グラフの高さ。+2 とても明るい 〜 −2 とても暗い）
  window.READING_FEELINGS = [
    { w: "うれしい", e: "😊", v: 2 }, { w: "わくわく", e: "🤩", v: 2 }, { w: "ほこらしい", e: "😤", v: 2 },
    { w: "ほっとした", e: "😌", v: 1 }, { w: "なっとく", e: "🙂", v: 1 }, { w: "おどろいた", e: "😲", v: 0 },
    { w: "ふしぎ", e: "🤔", v: 0 }, { w: "もどかしい", e: "😣", v: -1 }, { w: "心細い", e: "🥺", v: -1 },
    { w: "くやしい", e: "😖", v: -1 }, { w: "もうしわけない", e: "😔", v: -1 }, { w: "さびしい", e: "😢", v: -2 },
    { w: "かなしい", e: "😭", v: -2 }, { w: "こわい", e: "😱", v: -2 }
  ];
  window.READING_SIX = [
    { k: "jinbutsu", label: "① 人物", hint: "出てくる おもな 人は？（主役は だれ？）" },
    { k: "jiken", label: "② 事件", hint: "どんな 出来事が 起きた？" },
    { k: "henka", label: "③ 変化", hint: "主役は 最初と 最後で どう 変わった？" },
    { k: "kagi", label: "④ カギ", hint: "くり返し 出てくる モノ・大切な 言葉は？" },
    { k: "kachi", label: "⑤ 価値", hint: "この お話は、わたしたちに どんな 意味が ある？" },
    { k: "toi", label: "⑥ 新たな 問い", hint: "読んで 生まれた 自分の「？」は？（もし〜なら？ なぜ〜？）" }
  ];
  window.READING_PRESET_TITLES = ["少女ポリアンナ"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clip(s) { return String(s || "").trim().slice(0, window.READING_NOTE_FIELD_MAX); }
  function feelingOf(word) { return window.READING_FEELINGS.find(function (f) { return f.w === word; }); }
  function todayYmd() {
    const d = new Date(window.currentServerTime || Date.now());
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  // ---- スタイルとモーダルの土台（このファイルだけで完結させる） ----
  function ensureDom() {
    if (document.getElementById("reading-note-modal")) return;
    const css = document.createElement("style");
    css.textContent =
      "#reading-note-modal{position:fixed;inset:0;background:rgba(74,59,82,.85);z-index:280;display:none;justify-content:center;align-items:center;padding:14px}" +
      ".rn-box{background:#fff;border-radius:16px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;padding:16px;box-shadow:0 10px 25px rgba(0,0,0,.3)}" +
      ".rn-title{font-size:17px;font-weight:900;color:#6d28d9;text-align:center;margin-bottom:8px}" +
      ".rn-sec{background:#faf5ff;border-radius:12px;padding:10px;margin-bottom:10px}" +
      ".rn-sec h4{margin:0 0 6px;font-size:14px;color:#6d28d9}" +
      ".rn-label{font-size:13px;font-weight:900;color:#4a3b52;margin:6px 0 2px;display:flex;align-items:center;gap:6px}" +
      ".rn-hint{font-size:11px;color:#7a6985;margin-bottom:3px}" +
      ".rn-in{width:100%;box-sizing:border-box;border:2px solid #e9d5ff;border-radius:10px;padding:8px;font-size:14px;font-family:inherit}" +
      ".rn-in:focus{outline:none;border-color:#a78bfa}" +
      ".rn-star{font-size:12px;font-weight:700;color:#be185d;display:flex;align-items:center;gap:2px;margin-left:auto}" +
      ".rn-row{display:flex;gap:6px;align-items:center}" +
      ".rn-chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}" +
      ".rn-chip{border:2px solid #e9d5ff;background:#fff;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}" +
      ".rn-chip.on{background:#ede9fe;border-color:#7c3aed;color:#5b21b6}" +
      ".rn-btn{width:100%;border:none;border-radius:12px;padding:12px;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;margin-top:6px}" +
      ".rn-btn.go{background:#7c3aed;color:#fff;box-shadow:0 4px 0 #5b21b6}" +
      ".rn-btn.sub{background:#f1f5f9;color:#475569}" +
      ".rn-shelf{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;background:linear-gradient(#fff 85%,#d6b38a 85%);padding:10px 8px 14px;border-radius:10px;min-height:120px}" +
      ".rn-spine{width:44px;height:110px;border-radius:4px 4px 2px 2px;color:#fff;font-size:11px;font-weight:900;writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset -4px 0 0 rgba(0,0,0,.15);overflow:hidden;padding:4px 0}" +
      ".rn-table{width:100%;border-collapse:collapse;font-size:12.5px}" +
      ".rn-table th{background:#ede9fe;color:#5b21b6;width:82px;text-align:left;padding:6px;border:1px solid #ddd6fe;vertical-align:top}" +
      ".rn-table td{padding:6px;border:1px solid #ddd6fe;text-align:left;white-space:pre-wrap}";
    document.head.appendChild(css);
    const modal = document.createElement("div");
    modal.id = "reading-note-modal";
    modal.innerHTML = '<div class="rn-box"><div id="reading-note-body"></div></div>';
    document.body.appendChild(modal);
  }
  function show(html) {
    ensureDom();
    document.getElementById("reading-note-body").innerHTML = html;
    document.getElementById("reading-note-modal").style.display = "flex";
    const box = document.querySelector("#reading-note-modal .rn-box");
    if (box) box.scrollTop = 0;
  }
  window.closeReadingNote = function () {
    const m = document.getElementById("reading-note-modal");
    if (m) m.style.display = "none";
  };

  function chipsHtml(group) {
    return '<div class="rn-chips" data-group="' + group + '">' + window.READING_FEELINGS.map(function (f) {
      return '<button type="button" class="rn-chip" data-w="' + esc(f.w) + '" onclick="window._rnPick(this)">' + f.e + " " + esc(f.w) + "</button>";
    }).join("") + "</div>";
  }
  window._rnPick = function (btn) {
    const wrap = btn.parentNode;
    wrap.querySelectorAll(".rn-chip").forEach(function (b) { b.classList.remove("on"); });
    btn.classList.add("on");
  };
  function picked(group) {
    const on = document.querySelector('.rn-chips[data-group="' + group + '"] .rn-chip.on');
    return on ? on.getAttribute("data-w") : "";
  }
  function val(id) { const el = document.getElementById(id); return el ? clip(el.value) : ""; }

  // ---- ✏️ 書く ----
  window.openReadingNote = function (presetTitle) {
    const titles = window.READING_PRESET_TITLES.slice();
    if (window.getTodaysStory) { const st = window.getTodaysStory(); if (st && titles.indexOf(st.title) === -1) titles.push(st.title); }
    const six = window.READING_SIX.map(function (f, i) {
      const input = f.k === "henka"
        ? '<input id="rn-henka-a" class="rn-in" maxlength="100" placeholder="最初は…">' +
          '<div style="text-align:center;font-weight:900;color:#7c3aed">↓</div>' +
          '<input id="rn-henka-b" class="rn-in" maxlength="100" placeholder="最後は…">'
        : (f.k === "jiken" || f.k === "kachi"
          ? '<textarea id="rn-' + f.k + '" class="rn-in" rows="2" maxlength="100"></textarea>'
          : '<input id="rn-' + f.k + '" class="rn-in" maxlength="100">');
      return '<div class="rn-label">' + f.label +
        '<label class="rn-star"><input type="radio" name="rn-star" value="' + i + '">★いちばん大事</label></div>' +
        '<div class="rn-hint">' + esc(f.hint) + "</div>" + input;
    }).join("");
    show(
      '<div class="rn-title">✏️ 読書ノート（作品読解6）</div>' +
      '<div class="rn-sec"><div class="rn-label">📕 本・お話の タイトル</div>' +
      '<input id="rn-title" class="rn-in" maxlength="40" list="rn-title-list" value="' + esc(presetTitle || "") + '" placeholder="例：少女ポリアンナ">' +
      '<datalist id="rn-title-list">' + titles.map(function (t) { return '<option value="' + esc(t) + '">'; }).join("") + "</datalist></div>" +
      '<div class="rn-sec"><h4>🔍 作品読解6</h4>' + six +
      '<div class="rn-hint" style="margin-top:6px">答えが いくつか あるときは、いちばん 大事な ものに ★を つけよう（赤えんぴつの ○ の かわり）。</div></div>' +
      '<div class="rn-sec"><h4>💓 主人公の 気持ちの 動き</h4>' +
      '<div class="rn-label">はじめ</div>' + chipsHtml("e1") +
      '<div class="rn-label">事件の とき</div>' + chipsHtml("e2") +
      '<div class="rn-label">さいご</div>' + chipsHtml("e3") +
      '<div class="rn-label">どうして 気持ちが 変わった？</div>' +
      '<input id="rn-why" class="rn-in" maxlength="100" placeholder="〜が あったから、〜な 気持ちに なった"></div>' +
      '<div class="rn-sec"><h4>📖 わたしの 気持ち（読書感想）</h4>' +
      '<div class="rn-label">読む 前</div>' + chipsHtml("m1") +
      '<div class="rn-label">読んだ あと</div>' + chipsHtml("m2") +
      '<div class="rn-label">いちばん 心に のこった ところと、そのわけ</div>' +
      '<textarea id="rn-best" class="rn-in" rows="3" maxlength="100" placeholder="〜の ところが 心に のこった。なぜなら〜"></textarea></div>' +
      '<div class="rn-sec"><h4>✅ 書いたら 見直そう</h4>' +
      '<label class="rn-label" style="font-weight:700"><input type="checkbox" id="rn-c1"> 本文に こんきょが ある</label>' +
      '<label class="rn-label" style="font-weight:700"><input type="checkbox" id="rn-c2"> 発見や 気づきが ある</label>' +
      '<label class="rn-label" style="font-weight:700"><input type="checkbox" id="rn-c3"> 考える 視点が ある</label></div>' +
      '<button class="rn-btn go" onclick="window.submitReadingNote()">📚 本だなに しまう</button>' +
      '<button class="rn-btn sub" onclick="window.closeReadingNote()">とじる（書いた 文字は 消えるよ）</button>'
    );
  };

  window.submitReadingNote = function () {
    const title = String((document.getElementById("rn-title") || {}).value || "").trim().slice(0, 40);
    if (!title) { alert("📕 本の タイトルを 書いてね！"); return; }
    const f = {
      jinbutsu: val("rn-jinbutsu"), jiken: val("rn-jiken"),
      henkaA: val("rn-henka-a"), henkaB: val("rn-henka-b"),
      kagi: val("rn-kagi"), kachi: val("rn-kachi"), toi: val("rn-toi")
    };
    const filled = [f.jinbutsu, f.jiken, (f.henkaA || f.henkaB), f.kagi, f.kachi, f.toi].filter(Boolean).length;
    if (filled < 4) { alert("✏️ あと すこし！ 作品読解6の らんを 4つ 以上 書いてみよう（いま " + filled + "つ）。"); return; }
    const starEl = document.querySelector('input[name="rn-star"]:checked');
    const note = {
      t: title, d: todayYmd(), f: f,
      star: starEl ? Number(starEl.value) : -1,
      e: [picked("e1"), picked("e2"), picked("e3")], why: val("rn-why"),
      m: [picked("m1"), picked("m2")], best: val("rn-best"),
      chk: [!!(document.getElementById("rn-c1") || {}).checked, !!(document.getElementById("rn-c2") || {}).checked, !!(document.getElementById("rn-c3") || {}).checked]
    };
    if (!window.saveData) return;
    if (!Array.isArray(window.saveData.readingNotes)) window.saveData.readingNotes = [];
    window.saveData.readingNotes.unshift(note);
    window.saveData.readingNotes = window.saveData.readingNotes.slice(0, window.READING_NOTE_MAX);
    window.saveData.readingNoteCount = (Number(window.saveData.readingNoteCount) || 0) + 1;
    if (typeof window.saveGame === "function") window.saveGame();
    if (typeof window.syncWithGoogleSpreadsheet === "function") {
      window.syncWithGoogleSpreadsheet("LOG", { stage: "📚読書ノート:" + title, msg: window.formatReadingNoteText(note) });
    }
    alert("📚『" + title + "』を 本だなに しまったよ！\n\nこれで " + window.saveData.readingNoteCount + "さつめ。おうちの人にも 読んで もらおう！");
    window.openBookshelf();
  };

  window.formatReadingNoteText = function (n) {
    const f = n.f || {};
    const star = function (i) { return n.star === i ? "★" : ""; };
    return [
      "【作品読解6】" + n.t + "（" + n.d + "）",
      star(0) + "人物：" + (f.jinbutsu || ""),
      star(1) + "事件：" + (f.jiken || ""),
      star(2) + "変化：" + (f.henkaA || "") + " → " + (f.henkaB || ""),
      star(3) + "カギ：" + (f.kagi || ""),
      star(4) + "価値：" + (f.kachi || ""),
      star(5) + "新たな問い：" + (f.toi || ""),
      "主人公の気持ち：" + (n.e || []).map(function (w) { return w || "？"; }).join(" → ") + "（わけ：" + (n.why || "") + "）",
      "わたしの気持ち：" + ((n.m || [])[0] || "？") + " → " + ((n.m || [])[1] || "？"),
      "心にのこったところ：" + (n.best || ""),
      "見直し：" + ["こんきょ", "発見・気づき", "考える視点"].filter(function (_, i) { return (n.chk || [])[i]; }).join("・")
    ].join("\n");
  };

  // ---- 💓 気持ちのグラフ（3点 or 2点の折れ線） ----
  function feelingChart(words, labels) {
    const pts = words.map(function (w) { const f = feelingOf(w); return f ? f.v : null; });
    if (pts.filter(function (v) { return v !== null; }).length < 2) return "";
    const W = 300, H = 130, pad = 30, step = (W - pad * 2) / (words.length - 1);
    const y = function (v) { return 18 + (2 - v) * ((H - 52) / 4); };
    let line = "", dots = "";
    words.forEach(function (w, i) {
      const f = feelingOf(w); if (!f) return;
      const x = pad + step * i;
      line += (line ? " " : "") + x + "," + y(f.v);
      dots += '<text x="' + x + '" y="' + (y(f.v) + 6) + '" font-size="18" text-anchor="middle">' + f.e + "</text>" +
        '<text x="' + x + '" y="' + (H - 4) + '" font-size="10" text-anchor="middle" fill="#6d28d9">' + esc(labels[i]) + "</text>";
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;max-width:320px;display:block;margin:4px auto">' +
      '<line x1="' + pad + '" y1="' + y(0) + '" x2="' + (W - pad) + '" y2="' + y(0) + '" stroke="#e5e7eb" stroke-dasharray="4"/>' +
      '<polyline points="' + line + '" fill="none" stroke="#a78bfa" stroke-width="3"/>' + dots + "</svg>";
  }

  // ---- 📚 わたしの本だな ----
  const SPINE_COLORS = ["#7c3aed", "#db2777", "#0891b2", "#ea580c", "#16a34a", "#2563eb", "#9333ea", "#c2410c"];
  window.openBookshelf = function () {
    const notes = (window.saveData && window.saveData.readingNotes) || [];
    const count = Number(window.saveData && window.saveData.readingNoteCount) || notes.length;
    const badges = [[1, "🌱 はじめの 一さつ"], [3, "📗 読書の たね"], [5, "📘 読書たんてい"], [10, "📙 本の はかせ"], [20, "👑 読書マスター"]]
      .filter(function (b) { return count >= b[0]; }).map(function (b) { return b[1]; });
    const spines = notes.map(function (n, i) {
      return '<div class="rn-spine" style="background:' + SPINE_COLORS[i % SPINE_COLORS.length] + '" onclick="window.openReadingNoteDetail(' + i + ')">' + esc(n.t) + "</div>";
    }).join("");
    show(
      '<div class="rn-title">📚 わたしの 本だな</div>' +
      '<div style="text-align:center;font-size:13px;font-weight:900;color:#4a3b52;margin-bottom:6px">これまでに ' + count + ' さつ 書いたよ</div>' +
      (badges.length ? '<div style="text-align:center;font-size:12px;margin-bottom:8px">' + badges.join(" ／ ") + "</div>" : "") +
      '<div class="rn-shelf">' + (spines || '<div style="font-size:12px;color:#94a3b8;margin:auto">まだ 本が ないよ。読書ノートを 書いて しまおう！</div>') + "</div>" +
      '<div style="font-size:11px;color:#94a3b8;margin-top:4px">本だなには あたらしい ' + window.READING_NOTE_MAX + 'さつまで 並ぶよ（古い ノートも おうちの人の 記録に のこって いるよ）。</div>' +
      '<button class="rn-btn go" onclick="window.openReadingNote()">✏️ あたらしく 書く</button>' +
      '<button class="rn-btn sub" onclick="window.closeReadingNote()">とじる</button>'
    );
  };

  window.openReadingNoteDetail = function (i) {
    const n = ((window.saveData && window.saveData.readingNotes) || [])[i];
    if (!n) return;
    const f = n.f || {};
    const rows = [
      ["① 人物", f.jinbutsu], ["② 事件", f.jiken], ["③ 変化", (f.henkaA || "") + "\n↓\n" + (f.henkaB || "")],
      ["④ カギ", f.kagi], ["⑤ 価値", f.kachi], ["⑥ 新たな 問い", f.toi]
    ].map(function (r, idx) {
      return "<tr><th>" + (n.star === idx ? "★" : "") + r[0] + "</th><td>" + esc(r[1] || "") + "</td></tr>";
    }).join("");
    show(
      '<div class="rn-title">📕 ' + esc(n.t) + '</div><div style="text-align:center;font-size:11px;color:#94a3b8;margin-bottom:6px">' + esc(n.d) + "</div>" +
      '<table class="rn-table">' + rows + "</table>" +
      '<div class="rn-sec" style="margin-top:10px"><h4>💓 主人公の 気持ちの 動き</h4>' +
      feelingChart(n.e || [], ["はじめ", "事件", "さいご"]) +
      '<div style="font-size:12.5px">' + (n.e || []).map(function (w) { return esc(w || "？"); }).join(" → ") + "</div>" +
      (n.why ? '<div style="font-size:12.5px;margin-top:4px">わけ：' + esc(n.why) + "</div>" : "") + "</div>" +
      '<div class="rn-sec"><h4>📖 わたしの 気持ち</h4>' +
      feelingChart(n.m || [], ["読む前", "読んだあと"]) +
      (n.best ? '<div style="font-size:12.5px">心に のこった ところ：' + esc(n.best) + "</div>" : "") + "</div>" +
      '<button class="rn-btn sub" onclick="window.openBookshelf()">← 本だなに もどる</button>'
    );
  };
})();
