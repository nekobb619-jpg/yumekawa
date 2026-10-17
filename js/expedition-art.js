/* =====================================================================
   expedition-art.js — 🏕️ 危険探検隊の 絵（ホームの「危険探検隊」の 上に 出す）
   ★2026-10-17追加（保護者：探検隊にも グラフィックが あると よい）
   - 出発まえ：キャンプ（テントと たき火）
   - 探検中：森 → 川 → 山 → どうくつ の 道を、送った 3体が 進む（5時間の うち どこまで 来たか で 位置が きまる）。
     夜は 星空、宝島が「close」（霧）の 日は 霧が かかる
   - 迷子：くらい 森で SOS の 旗
   - 絵は ぜんぶ この ファイルの SVG（他社の 絵は 使わない）。メンバーは ガチャの アイコン（GACHA_EGG_LIST の icon）
   - index.html の renderExpeditionPanel の あとに 絵を さしこむ（元の 文字・ボタンは そのまま）
   ===================================================================== */
(function () {
  "use strict";
  var CSS = "@keyframes expBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}" +
    "@keyframes expFog{0%{transform:translateX(-30px)}100%{transform:translateX(30px)}}" +
    "@keyframes expFire{0%,100%{transform:scale(1)}50%{transform:scale(1.12,0.92)}}" +
    "@keyframes expTwinkle{0%,100%{opacity:.25}50%{opacity:1}}" +
    ".exp-scene{width:100%;max-width:420px;margin:0 auto 6px;display:block;border-radius:14px;overflow:hidden;border:2px solid #c4b5fd}" +
    ".exp-bob{animation:expBob 1.1s ease-in-out infinite;transform-box:fill-box}" +
    ".exp-fog{animation:expFog 6s ease-in-out infinite alternate}" +
    ".exp-fire{animation:expFire .6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}" +
    ".exp-tw{animation:expTwinkle 2.4s ease-in-out infinite}" +
    "@media (prefers-reduced-motion: reduce){.exp-bob,.exp-fog,.exp-fire,.exp-tw{animation:none}}";
  function css() { if (document.getElementById("exp-art-css")) return; var s = document.createElement("style"); s.id = "exp-art-css"; s.textContent = CSS; document.head.appendChild(s); }
  function nowMs() { return window.currentServerTime || Date.now(); }
  function isNight() { var h = new Date(nowMs()).getHours(); return h >= 18 || h < 6; }
  function icon(id) { var l = window.GACHA_EGG_LIST || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i].icon || "🐣"; return id === "e_ex_mochi" ? "🍡" : "🐣"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function sky(night) {
    var o = '<defs><linearGradient id="expSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (night ? "#1e1b4b" : "#bae6fd") + '"/><stop offset="1" stop-color="' + (night ? "#4c1d95" : "#f0f9ff") + '"/></linearGradient></defs>' +
      '<rect width="320" height="130" fill="url(#expSky)"/>';
    if (night) {
      [[20, 14], [62, 26], [104, 10], [150, 22], [196, 12], [238, 28], [282, 16], [306, 34], [130, 38]].forEach(function (p, i) {
        o += '<circle class="exp-tw" style="animation-delay:' + (i * 0.3) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="1.4" fill="#fde68a"/>';
      });
      o += '<path d="M288 8 A11 11 0 1 0 298 27 A8.5 8.5 0 1 1 288 8z" fill="#fde68a"/>';
    } else {
      o += '<circle cx="292" cy="20" r="11" fill="#fde047"/><circle cx="292" cy="20" r="15" fill="#fde047" opacity=".25"/>' +
        '<path d="M40 26 q6 -9 14 -3 q8 -6 13 3 q6 1 4 7 h-34 q-4 -6 3 -7z" fill="#fff" opacity=".9"/><path d="M170 18 q5 -7 11 -2 q7 -5 11 2 q5 1 3 6 h-28 q-3 -5 3 -6z" fill="#fff" opacity=".85"/>';
    }
    return o;
  }
  function ground(night) {
    var g = night ? "#14532d" : "#86efac", g2 = night ? "#166534" : "#4ade80";
    var o = '<rect y="96" width="320" height="34" fill="' + g + '"/>';
    // 森（0〜80）
    [[10, 66], [26, 60], [44, 68], [60, 62], [74, 70]].forEach(function (t) {
      o += '<rect x="' + (t[0] - 2) + '" y="' + (t[1] + 22) + '" width="4" height="12" fill="#78350f"/><path d="M' + t[0] + ' ' + t[1] + ' l-11 26 h22z" fill="' + g2 + '"/><path d="M' + t[0] + ' ' + (t[1] + 8) + ' l-9 20 h18z" fill="' + (night ? "#15803d" : "#22c55e") + '"/>';
    });
    // 川（80〜160）
    o += '<path d="M88 96 q8 18 -2 34 h46 q10 -16 2 -34z" fill="' + (night ? "#1d4ed8" : "#38bdf8") + '"/><path d="M96 104 q4 3 8 0 M108 116 q4 3 8 0 M100 124 q4 3 8 0" stroke="#e0f2fe" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M82 96 h56" stroke="#92400e" stroke-width="4"/><path d="M84 96 v8 M100 96 v8 M118 96 v8 M136 96 v8" stroke="#92400e" stroke-width="2.4"/>';
    // 山（160〜240）
    o += '<path d="M150 98 L182 44 L214 98z" fill="' + (night ? "#475569" : "#94a3b8") + '"/><path d="M182 44 l-9 15 l5 -2 l4 5 l4 -5 l5 2z" fill="#fff"/><path d="M196 98 L224 58 L252 98z" fill="' + (night ? "#334155" : "#64748b") + '"/>';
    // どうくつ と 宝箱（240〜320）
    o += '<path d="M248 98 Q252 52 286 50 Q318 52 320 98z" fill="' + (night ? "#44403c" : "#a8a29e") + '"/><path d="M268 98 Q270 72 286 72 Q302 72 304 98z" fill="#1c1917"/>' +
      '<rect x="279" y="86" width="15" height="10" rx="2" fill="#f59e0b" stroke="#92400e" stroke-width="1.2"/><path d="M279 90 h15" stroke="#92400e" stroke-width="1.2"/><circle cx="286.5" cy="90" r="1.4" fill="#fde68a"/>';
    // 道
    o += '<path d="M6 112 Q60 104 110 112 T210 110 T314 106" stroke="#fde68a" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="1 9" opacity=".9"/>';
    return o;
  }
  function fog() {
    return '<g class="exp-fog" opacity=".7"><ellipse cx="60" cy="96" rx="70" ry="14" fill="#f8fafc"/><ellipse cx="190" cy="86" rx="80" ry="16" fill="#f1f5f9"/><ellipse cx="300" cy="100" rx="60" ry="12" fill="#f8fafc"/></g>';
  }
  function pathY(x) { return 112 - 6 * Math.sin(x / 50); }
  function team(ids, x, dim) {
    var o = "";
    (ids || []).forEach(function (id, i) {
      var px = x - i * 15, py = pathY(px) - 6;
      o += '<g class="exp-bob" style="animation-delay:' + (i * 0.18) + 's"><text x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" font-size="15" text-anchor="middle"' + (dim ? ' opacity=".55"' : '') + '>' + esc(icon(id)) + '</text></g>';
    });
    return o;
  }
  function label(text, night) {
    return '<rect x="6" y="4" width="' + (text.length * 9 + 14) + '" height="17" rx="8.5" fill="' + (night ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.75)") + '"/>' +
      '<text x="13" y="16.5" font-size="10.5" font-weight="900" fill="' + (night ? "#fde68a" : "#5b21b6") + '">' + esc(text) + '</text>';
  }
  function wrap(inner, title) { return '<svg class="exp-scene" viewBox="0 0 320 130" role="img" aria-label="' + esc(title) + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; }

  window.expeditionSceneSvg = function () {
    var d = window.saveData || {}, night = isNight();
    if (d.expeditionLostTeamIds && d.expeditionLostTeamIds.length) {
      var lost = sky(true) + ground(true) + fog() + team(d.expeditionLostTeamIds, 230, true) +
        '<path d="M262 104 V70" stroke="#f8fafc" stroke-width="2"/><path d="M262 70 h22 l-5 7 l5 7 h-22z" fill="#ef4444"/><text x="273" y="81" font-size="7.5" font-weight="900" fill="#fff" text-anchor="middle">SOS</text>' +
        '<text x="200" y="88" font-size="13" font-weight="900" fill="#fde68a">？</text>' + label("まいごに なっちゃった…", true);
      return wrap(lost, "探検隊が まいごに なって いる");
    }
    if (d.expedition && !d.expedition.resolved) {
      var e = d.expedition, p = Math.max(0, Math.min(1, (nowMs() - e.startTime) / e.durationMs));
      var x = 30 + p * 252, zone = p < 0.25 ? "森" : p < 0.5 ? "川" : p < 0.75 ? "山" : "どうくつ";
      var foggy = d.islandStatus === "close";
      var go = sky(night) + ground(night) + (foggy ? fog() : "") + team(e.teamIds, x, false) +
        label(zone + "を たんけん中　" + Math.round(p * 100) + "%", night);
      return wrap(go, "探検隊が " + zone + "を すすんで いる");
    }
    var camp = sky(night) + ground(night) +
      '<path d="M18 112 L38 84 L58 112z" fill="#f472b6" stroke="#9d174d" stroke-width="1.4"/><path d="M38 84 L38 112" stroke="#9d174d" stroke-width="1.4"/><path d="M33 112 L38 100 L43 112z" fill="#831843"/>' +
      '<path d="M66 112 h14" stroke="#78350f" stroke-width="3" stroke-linecap="round"/><g class="exp-fire"><path d="M73 110 q-6 -6 0 -16 q6 10 0 16z" fill="#f97316"/><path d="M73 110 q-3 -4 0 -9 q3 5 0 9z" fill="#fde047"/></g>' +
      label("つぎの 探検隊を まって いるよ", night);
    return wrap(camp, "探検隊の キャンプ");
  };

  function install() {
    var o = window.renderExpeditionPanel;
    if (typeof o !== "function" || o._artWrapped) return false;
    var w = function () {
      var r = o.apply(this, arguments);
      try { css(); var a = document.getElementById("expedition-panel-area"); if (a) a.insertAdjacentHTML("afterbegin", window.expeditionSceneSvg()); } catch (e) {}
      return r;
    };
    w._artWrapped = true; window.renderExpeditionPanel = w; return true;
  }
  if (!install()) document.addEventListener("DOMContentLoaded", install);
})();
