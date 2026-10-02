/* =====================================================================
   js/observation-note.js — 🔭 星と月の かんさつノート
   ★2026-10-02追加。実際の月・星の観察（宿題のレポート）やプラネタリウム見学を、アプリで記録できるようにする。
   - 1回目・2回目の時刻／方位／高さ（にぎりこぶし何こ分＝約10度ずつ）を記録すると、
     南を向いて見た空の図に、位置と動いた向きが矢印で描かれる（レポートの下書き・図になる）。
   - 保存：saveData.observationNotes（新しい順、最大 OBS_NOTE_MAX 件、本体行）。全文を log_db にも送る。
   - Qは付与しない。子どもの入力は必ずエスケープして表示する。
   ===================================================================== */
(function () {
  window.OBS_NOTE_MAX = 6;
  window.OBS_FIELD_MAX = 100;
  // 南を向いて空を見たときの方位（左＝東、右＝西）。az は北から時計回りの角度。
  window.OBS_DIRS = [
    { w: "北東", az: 45 }, { w: "東", az: 90 }, { w: "南東", az: 135 }, { w: "南", az: 180 },
    { w: "南西", az: 225 }, { w: "西", az: 270 }, { w: "北西", az: 315 }
  ];
  window.OBS_MOON = [
    { w: "新月", e: "🌑" }, { w: "三日月", e: "🌒" }, { w: "半月（右が光る）", e: "🌓" }, { w: "満月に近い", e: "🌔" },
    { w: "満月", e: "🌕" }, { w: "半月（左が光る）", e: "🌗" }, { w: "細い月（左が光る）", e: "🌘" }
  ];
  window.OBS_WEATHER = ["☀️晴れ", "🌤️晴れ時々くもり", "☁️くもり"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clip(s, n) { return String(s || "").trim().slice(0, n || window.OBS_FIELD_MAX); }
  function dirOf(w) { return window.OBS_DIRS.find(function (d) { return d.w === w; }); }
  function moonOf(w) { return window.OBS_MOON.find(function (m) { return m.w === w; }); }

  function ensureDom() {
    if (document.getElementById("obs-note-modal")) return;
    const css = document.createElement("style");
    css.textContent =
      "#obs-note-modal{position:fixed;inset:0;background:rgba(15,23,42,.85);z-index:280;display:none;justify-content:center;align-items:center;padding:14px}" +
      ".obs-box{background:#fff;border-radius:16px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;padding:16px;box-shadow:0 10px 25px rgba(0,0,0,.3)}" +
      ".obs-title{font-size:17px;font-weight:900;color:#1e3a8a;text-align:center;margin-bottom:8px}" +
      ".obs-sec{background:#eff6ff;border-radius:12px;padding:10px;margin-bottom:10px}" +
      ".obs-sec h4{margin:0 0 6px;font-size:14px;color:#1e3a8a}" +
      ".obs-label{font-size:13px;font-weight:900;color:#334155;margin:6px 0 2px}" +
      ".obs-hint{font-size:11px;color:#64748b;margin-bottom:3px}" +
      ".obs-in{width:100%;box-sizing:border-box;border:2px solid #bfdbfe;border-radius:10px;padding:8px;font-size:14px;font-family:inherit}" +
      ".obs-row{display:flex;gap:6px}.obs-row>*{flex:1}" +
      ".obs-chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}" +
      ".obs-chip{border:2px solid #bfdbfe;background:#fff;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}" +
      ".obs-chip.on{background:#dbeafe;border-color:#2563eb;color:#1e3a8a}" +
      ".obs-btn{width:100%;border:none;border-radius:12px;padding:12px;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;margin-top:6px}" +
      ".obs-btn.go{background:#2563eb;color:#fff;box-shadow:0 4px 0 #1e40af}.obs-btn.sub{background:#f1f5f9;color:#475569}" +
      ".obs-item{background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:8px 10px;margin-bottom:6px;cursor:pointer;font-size:13px;font-weight:700;color:#334155}";
    document.head.appendChild(css);
    const modal = document.createElement("div");
    modal.id = "obs-note-modal";
    modal.innerHTML = '<div class="obs-box"><div id="obs-note-body"></div></div>';
    document.body.appendChild(modal);
  }
  function show(html) {
    ensureDom();
    document.getElementById("obs-note-body").innerHTML = html;
    document.getElementById("obs-note-modal").style.display = "flex";
    const box = document.querySelector("#obs-note-modal .obs-box"); if (box) box.scrollTop = 0;
  }
  window.closeObservationNote = function () { const m = document.getElementById("obs-note-modal"); if (m) m.style.display = "none"; };

  function chips(group, items, labelFn) {
    return '<div class="obs-chips" data-group="' + group + '">' + items.map(function (it) {
      const w = typeof it === "string" ? it : it.w;
      return '<button type="button" class="obs-chip" data-w="' + esc(w) + '" onclick="window._obsPick(this)">' + (labelFn ? labelFn(it) : esc(w)) + "</button>";
    }).join("") + "</div>";
  }
  window._obsPick = function (btn) {
    btn.parentNode.querySelectorAll(".obs-chip").forEach(function (b) { b.classList.remove("on"); });
    btn.classList.add("on");
    if (btn.parentNode.getAttribute("data-group") === "target") window._obsToggleMoon();
  };
  window._obsToggleMoon = function () {
    const t = picked("target");
    const moon = document.getElementById("obs-moon-sec"), star = document.getElementById("obs-star-sec");
    if (moon) moon.style.display = (t === "月") ? "block" : "none";
    if (star) star.style.display = (t === "星・星座") ? "block" : "none";
  };
  function picked(group) {
    const on = document.querySelector('.obs-chips[data-group="' + group + '"] .obs-chip.on');
    return on ? on.getAttribute("data-w") : "";
  }
  function v(id, n) { const el = document.getElementById(id); return el ? clip(el.value, n) : ""; }
  function fistSelect(id) {
    let opts = '<option value="">こぶし？</option>';
    for (let i = 0; i <= 9; i++) opts += '<option value="' + i + '">' + i + "こ分（約" + (i * 10) + "度）</option>";
    return '<select id="' + id + '" class="obs-in">' + opts + "</select>";
  }
  function posBlock(n) {
    return '<div class="obs-label">' + (n === 1 ? "1回目" : "2回目") + ' の 時刻</div><input id="obs-time' + n + '" class="obs-in" type="time">' +
      '<div class="obs-label">方位（南を 向いて 見たとき）</div>' + chips("dir" + n, window.OBS_DIRS) +
      '<div class="obs-label">高さ（うでを のばした にぎりこぶし 何こ分？）</div>' + fistSelect("obs-fist" + n);
  }

  // ---- ✏️ 書く ----
  window.openObservationNote = function () {
    const d = new Date(window.currentServerTime || Date.now());
    const ymd = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    show(
      '<div class="obs-title">🔭 星と月の かんさつノート</div>' +
      '<div class="obs-sec"><div class="obs-row"><div><div class="obs-label">日にち</div><input id="obs-date" class="obs-in" type="date" value="' + ymd + '"></div>' +
      '<div><div class="obs-label">場所（目印）</div><input id="obs-place" class="obs-in" maxlength="30" placeholder="例：家のベランダ・電柱の上"></div></div>' +
      '<div class="obs-label">天気</div>' + chips("weather", window.OBS_WEATHER) +
      '<div class="obs-label">何を 観察した？</div>' + chips("target", ["月", "星・星座", "プラネタリウム"]) +
      '<div id="obs-moon-sec" style="display:none"><div class="obs-label">月の 形</div>' + chips("moon", window.OBS_MOON, function (m) { return m.e + " " + esc(m.w); }) + "</div>" +
      '<div id="obs-star-sec" style="display:none"><div class="obs-label">星・星座の 名前</div><input id="obs-star" class="obs-in" maxlength="40" placeholder="例：さそり座・アンタレス">' +
      '<div class="obs-label">色や 明るさ</div><input id="obs-color" class="obs-in" maxlength="60" placeholder="例：赤っぽくて、まわりより 明るい"></div></div>' +
      '<div class="obs-sec"><h4>📍 位置の 記録（同じ 場所から 2回）</h4>' + posBlock(1) +
      '<div style="height:8px"></div>' + posBlock(2) + "</div>" +
      '<div class="obs-sec"><h4>💡 まとめ</h4>' +
      '<div class="obs-label">予想（どう 動くと 思った？）</div><input id="obs-yosou" class="obs-in" maxlength="100" placeholder="例：東から 南へ 動くと 思う">' +
      '<div class="obs-label">分かったこと・気づいたこと</div><textarea id="obs-kizuki" class="obs-in" rows="2" maxlength="100" placeholder="例：1時間で こぶし1こ分 南へ 動いた。形は 同じだった。"></textarea>' +
      '<div class="obs-label">新たな 問い（なぜ？ もし〜なら？）</div><input id="obs-toi" class="obs-in" maxlength="100" placeholder="例：月は どうして 形が 変わるのだろう？">' +
      '<div class="obs-label">プラネタリウムや 本で 知ったこと（あれば）</div><textarea id="obs-plan" class="obs-in" rows="2" maxlength="100"></textarea></div>' +
      '<button class="obs-btn go" onclick="window.submitObservationNote()">🔭 記録する</button>' +
      '<button class="obs-btn sub" onclick="window.closeObservationNote()">とじる（書いた 文字は 消えるよ）</button>'
    );
  };

  function readPos(n) {
    const f = document.getElementById("obs-fist" + n);
    return { time: v("obs-time" + n, 5), dir: picked("dir" + n), fist: f && f.value !== "" ? Number(f.value) : null };
  }
  window.submitObservationNote = function () {
    const target = picked("target");
    if (!target) { alert("🔭 何を 観察したか えらんでね（月・星・プラネタリウム）。"); return; }
    const p1 = readPos(1), p2 = readPos(2);
    const kizuki = v("obs-kizuki");
    if (target !== "プラネタリウム" && !(p1.dir && p1.time) && !kizuki) { alert("📍 1回目の 時刻と 方位、または 気づいたことを 書いてね。"); return; }
    const note = {
      date: v("obs-date", 10), place: v("obs-place", 30), weather: picked("weather"), target: target,
      moon: picked("moon"), star: v("obs-star", 40), color: v("obs-color", 60),
      p: [p1, p2], yosou: v("obs-yosou"), kizuki: kizuki, toi: v("obs-toi"), plan: v("obs-plan")
    };
    if (!window.saveData) return;
    if (!Array.isArray(window.saveData.observationNotes)) window.saveData.observationNotes = [];
    window.saveData.observationNotes.unshift(note);
    window.saveData.observationNotes = window.saveData.observationNotes.slice(0, window.OBS_NOTE_MAX);
    window.saveData.observationNoteCount = (Number(window.saveData.observationNoteCount) || 0) + 1;
    if (typeof window.saveGame === "function") window.saveGame();
    if (typeof window.syncWithGoogleSpreadsheet === "function") {
      window.syncWithGoogleSpreadsheet("LOG", { stage: "🔭かんさつノート:" + target, msg: window.formatObservationText(note) });
    }
    alert("🔭 かんさつを 記録したよ！（" + window.saveData.observationNoteCount + "回め）\nレポートを 書くときの 下書きに 使ってね。");
    window.openObservationDetail(0);
  };

  function posText(p) {
    if (!p || (!p.time && !p.dir && p.fist === null)) return "";
    return (p.time || "?時") + " " + (p.dir || "?") + "の空・" + (p.fist === null ? "?" : ("こぶし" + p.fist + "こ分（約" + p.fist * 10 + "度）"));
  }
  window.formatObservationText = function (n) {
    const m = moonOf(n.moon);
    return [
      "【かんさつ】" + n.target + "（" + n.date + "・" + (n.place || "") + "・" + (n.weather || "") + "）",
      n.target === "月" && n.moon ? "月の形：" + (m ? m.e : "") + n.moon : "",
      n.target === "星・星座" ? "星：" + (n.star || "") + "／色・明るさ：" + (n.color || "") : "",
      "1回目：" + posText(n.p[0]), "2回目：" + posText(n.p[1]),
      "予想：" + (n.yosou || ""), "分かったこと：" + (n.kizuki || ""), "新たな問い：" + (n.toi || ""),
      n.plan ? "プラネタリウム・本で知ったこと：" + n.plan : ""
    ].filter(Boolean).join("\n");
  };

  // ---- 🌌 空の図（南を向いた空。左＝東、右＝西、高さ＝こぶし×10度） ----
  function skyChart(n) {
    const icon = n.target === "月" ? ((moonOf(n.moon) || {}).e || "🌙") : "⭐";
    const W = 320, H = 190, cx = 160, gy = 165, R = 140;
    const pt = function (p) {
      const d = dirOf(p.dir); if (!d || p.fist === null) return null;
      const t = (d.az - 45) / 270; // 北東(45)→0, 北西(315)→1
      const x = 20 + t * (W - 40);
      const y = gy - Math.min(9, p.fist) / 9 * (R - 10);
      return { x: x, y: y };
    };
    const a = pt(n.p[0]), b = pt(n.p[1]);
    if (!a && !b) return "";
    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;max-width:340px;display:block;margin:4px auto;background:linear-gradient(#1e1b4b,#3730a3);border-radius:10px">' +
      '<line x1="10" y1="' + gy + '" x2="' + (W - 10) + '" y2="' + gy + '" stroke="#a5b4fc" stroke-width="2"/>' +
      '<path d="M ' + (cx - R) + " " + gy + " A " + R + " " + R + " 0 0 1 " + (cx + R) + " " + gy + '" fill="none" stroke="#6366f1" stroke-dasharray="4 4"/>';
    [["東", 90], ["南東", 135], ["南", 180], ["南西", 225], ["西", 270]].forEach(function (d) {
      const x = 20 + (d[1] - 45) / 270 * (W - 40);
      svg += '<text x="' + x + '" y="' + (gy + 18) + '" font-size="12" fill="#e0e7ff" text-anchor="middle" font-weight="bold">' + d[0] + "</text>";
    });
    svg += '<defs><marker id="obs-ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#fde047"/></marker></defs>';
    if (a && b) {
      // 矢印の両はしを アイコンに かぶらない よう 少し 短くする
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1, cut = Math.min(16, len / 3);
      svg += '<line x1="' + (a.x + dx / len * cut) + '" y1="' + (a.y + dy / len * cut) + '" x2="' + (b.x - dx / len * cut) + '" y2="' + (b.y - dy / len * cut) +
        '" stroke="#fde047" stroke-width="3" stroke-dasharray="6 4" marker-end="url(#obs-ah)"/>';
    }
    [[a, n.p[0], "1"], [b, n.p[1], "2"]].forEach(function (z) {
      if (!z[0]) return;
      svg += '<text x="' + z[0].x + '" y="' + (z[0].y + 7) + '" font-size="20" text-anchor="middle">' + icon + "</text>" +
        '<text x="' + z[0].x + '" y="' + (z[0].y - 14) + '" font-size="10" fill="#fff" text-anchor="middle">' + z[2] + "回目 " + esc(z[1].time || "") + "</text>";
    });
    return svg + "</svg>";
  }

  window.openObservationList = function () {
    const notes = (window.saveData && window.saveData.observationNotes) || [];
    const count = Number(window.saveData && window.saveData.observationNoteCount) || notes.length;
    const items = notes.map(function (n, i) {
      const m = moonOf(n.moon);
      return '<div class="obs-item" onclick="window.openObservationDetail(' + i + ')">' +
        (n.target === "月" ? (m ? m.e : "🌙") : (n.target === "星・星座" ? "⭐" : "🪐")) + " " + esc(n.date) + "　" + esc(n.target) +
        (n.star ? "（" + esc(n.star) + "）" : "") + "</div>";
    }).join("");
    show(
      '<div class="obs-title">🔭 かんさつの 記録</div>' +
      '<div style="text-align:center;font-size:13px;font-weight:900;color:#334155;margin-bottom:8px">これまでに ' + count + ' 回 記録したよ</div>' +
      (items || '<div style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0">まだ 記録が ないよ。夜空を 見たら 書いて みよう！</div>') +
      '<div style="font-size:11px;color:#94a3b8">あたらしい ' + window.OBS_NOTE_MAX + '回分まで 見られるよ（古い 記録も おうちの人の 記録に のこって いるよ）。</div>' +
      '<button class="obs-btn go" onclick="window.openObservationNote()">✏️ あたらしく 記録する</button>' +
      '<button class="obs-btn sub" onclick="window.closeObservationNote()">とじる</button>'
    );
  };

  window.openObservationDetail = function (i) {
    const n = ((window.saveData && window.saveData.observationNotes) || [])[i];
    if (!n) return;
    const m = moonOf(n.moon);
    const line = function (label, val) { return val ? '<div style="font-size:13px;margin:3px 0"><b>' + label + "</b>：" + esc(val) + "</div>" : ""; };
    show(
      '<div class="obs-title">' + (n.target === "月" ? (m ? m.e : "🌙") : (n.target === "星・星座" ? "⭐" : "🪐")) + " " + esc(n.target) + " の かんさつ</div>" +
      '<div style="text-align:center;font-size:11px;color:#64748b;margin-bottom:6px">' + esc(n.date) + "　" + esc(n.place) + "　" + esc(n.weather) + "</div>" +
      skyChart(n) +
      '<div class="obs-sec">' +
      line("月の 形", n.target === "月" && n.moon ? (m ? m.e + " " : "") + n.moon : "") +
      line("星・星座", n.star) + line("色・明るさ", n.color) +
      line("1回目", posText(n.p[0])) + line("2回目", posText(n.p[1])) + "</div>" +
      '<div class="obs-sec">' + line("予想", n.yosou) + line("分かったこと", n.kizuki) + line("新たな 問い", n.toi) + line("プラネタリウム・本で 知ったこと", n.plan) + "</div>" +
      '<div style="font-size:11px;color:#64748b;margin-bottom:4px">📝 レポートには「時刻・方位・高さ」と「予想と くらべて どうだったか」を 書くと 伝わるよ。</div>' +
      '<button class="obs-btn sub" onclick="window.openObservationList()">← 記録の 一覧に もどる</button>'
    );
  };
})();
