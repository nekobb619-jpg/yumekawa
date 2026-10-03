/* =====================================================================
   sky-calc.js — 星の 見える 位置（高さ・方位）を 計算する（星の動きラボ・図で 共通）
   ★2026-10-03追加：「夏の大三角が 動いたのは 分かったが、どう 動いたか 分かりにくかった」
   （10/1 木曜 愛知で 観察）を 受けて、その 日・その 場所の 本当の 星の 位置を 見せる ため。
   - 星の 位置は J2000 の 赤経・赤緯（歳差は 無視：2026年で 0.4度ほどの ずれ）
   - 恒星時は ふつうの 近似式（数分の 時刻なら 1度以内）
   - 方位 az は 北＝0・東＝90・南＝180・西＝270（度）
   ===================================================================== */
(function () {
  "use strict";
  var D = Math.PI / 180;
  function ra(h, m, s) { return (h + m / 60 + s / 3600) * 15; }
  function dec(d, m, s) { var sg = d < 0 || Object.is(d, -0) ? -1 : 1; return sg * (Math.abs(d) + m / 60 + s / 3600); }
  // 星の データ：名前・赤経・赤緯・明るさ（等級）・色
  var STARS = {
    vega: { name: "ベガ", con: "こと座", ra: ra(18, 36, 56), dec: dec(38, 47, 1), mag: 0.0, col: "#e0f2fe" },
    altair: { name: "アルタイル", con: "わし座", ra: ra(19, 50, 47), dec: dec(8, 52, 6), mag: 0.8, col: "#fefce8" },
    deneb: { name: "デネブ", con: "はくちょう座", ra: ra(20, 41, 26), dec: dec(45, 16, 49), mag: 1.3, col: "#f8fafc" },
    polaris: { name: "北極星", con: "", ra: ra(2, 31, 49), dec: dec(89, 15, 51), mag: 2.0, col: "#fef9c3" },
    antares: { name: "アンタレス", con: "さそり座", ra: ra(16, 29, 24), dec: dec(-26, 25, 55), mag: 1.0, col: "#f87171" },
    fomalhaut: { name: "フォーマルハウト", con: "みなみのうお座", ra: ra(22, 57, 39), dec: dec(-29, 37, 20), mag: 1.2, col: "#f8fafc" },
    // カシオペヤ座（W）
    cas1: { ra: ra(0, 9, 11), dec: dec(59, 8, 59), mag: 2.3 }, cas2: { ra: ra(0, 40, 30), dec: dec(56, 32, 14), mag: 2.2 },
    cas3: { ra: ra(0, 56, 43), dec: dec(60, 43, 0), mag: 2.2 }, cas4: { ra: ra(1, 25, 49), dec: dec(60, 14, 7), mag: 2.7 }, cas5: { ra: ra(1, 54, 24), dec: dec(63, 40, 12), mag: 3.4 },
    // 北斗七星
    ud1: { ra: ra(11, 3, 44), dec: dec(61, 45, 3), mag: 1.8 }, ud2: { ra: ra(11, 1, 50), dec: dec(56, 22, 57), mag: 2.4 }, ud3: { ra: ra(11, 53, 50), dec: dec(53, 41, 41), mag: 2.4 },
    ud4: { ra: ra(12, 15, 26), dec: dec(57, 1, 57), mag: 3.3 }, ud5: { ra: ra(12, 54, 2), dec: dec(55, 57, 35), mag: 1.8 }, ud6: { ra: ra(13, 23, 56), dec: dec(54, 55, 31), mag: 2.2 }, ud7: { ra: ra(13, 47, 32), dec: dec(49, 18, 48), mag: 1.9 }
  };
  // 星座の 線
  var FIGS = {
    summer: { name: "夏の大三角", lines: [["vega", "deneb"], ["deneb", "altair"], ["altair", "vega"]], col: "#fde68a" },
    cas: { name: "カシオペヤ座", lines: [["cas1", "cas2"], ["cas2", "cas3"], ["cas3", "cas4"], ["cas4", "cas5"]], col: "#a5b4fc" },
    dipper: { name: "北斗七星", lines: [["ud1", "ud2"], ["ud2", "ud3"], ["ud3", "ud4"], ["ud4", "ud1"], ["ud4", "ud5"], ["ud5", "ud6"], ["ud6", "ud7"]], col: "#a5b4fc" }
  };
  var PLACES = { nagoya: { name: "愛知県（名古屋）", lat: 35.18, lon: 136.91 } };

  // 日本時間の 年月日・時（小数）→ ユリウス日
  function jd(y, mo, d, hourJst) { return Date.UTC(y, mo - 1, d) / 86400000 + 2440587.5 + (hourJst - 9) / 24; }
  function lst(jdv, lon) { var g = 280.46061837 + 360.98564736629 * (jdv - 2451545.0); return ((g + lon) % 360 + 360) % 360; }
  // 星 → { alt, az }（度）
  function altaz(star, y, mo, d, hourJst, place) {
    var p = place || PLACES.nagoya, H = (lst(jd(y, mo, d, hourJst), p.lon) - star.ra) * D, de = star.dec * D, la = p.lat * D;
    var alt = Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H));
    var az = Math.atan2(-Math.cos(de) * Math.sin(H), Math.sin(de) * Math.cos(la) - Math.cos(de) * Math.sin(la) * Math.cos(H));
    return { alt: alt / D, az: ((az / D) % 360 + 360) % 360 };
  }
  // 方位（度）→ 16方位の ことば
  var DIR16 = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  var DIR8 = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
  function dirName(az, n) { var list = n === 8 ? DIR8 : DIR16; return list[Math.round(az / (360 / list.length)) % list.length]; }
  // 全天の 図（南を 向いて 見上げた 向き：上が 北・下が 南・左が 東・右が 西）。r は 地平線までの 半径
  function domeXY(p, cx, cy, r) { var rr = r * (90 - p.alt) / 90; return { x: cx - rr * Math.sin(p.az * D), y: cy - rr * Math.cos(p.az * D) }; }

  window.SKY = { STARS: STARS, FIGS: FIGS, PLACES: PLACES, altaz: altaz, dirName: dirName, domeXY: domeXY };
  if (typeof module !== "undefined") module.exports = window.SKY;
})();
