// js/figure-map.js を作る（node tools/figures/build-figure-map.js）。
// tools/figures/spec.js の「単元id → 問題番号 → 図」を、実際の問題文をキーにした対応表へ変換する。
// 実行すると「番号: 問題文 => 図」を一覧表示するので、図が正しい問題に付いたかを目で確かめること。
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "..");
global.window = {};
for (const f of fs.readdirSync(path.join(root, "js/quizzes"))) eval(fs.readFileSync(path.join(root, "js/quizzes", f), "utf8"));
const all = {};
for (const k of Object.keys(window)) if (k.startsWith("CONTENT_QUIZZES")) Object.assign(all, window[k]);
const SPEC = require("./spec.js");
const map = {}; let n = 0, problems = 0;
// ★2026-10-03追加：図は「問題文」で 引く。同じ 問題文で 答えが ちがう 問題（【ニコに おしえてあげよう】や
// 「次のうち、海に 面して いない 県は どれ？」など）は、ほかの 単元に 同じ 図が 出ないように「問題文‖正解」で 登録する
// （js/figures.js の figuresFor も 同じ 順で 引く）
const key = (s) => String(s || "").replace(/\s+/g, "");
const answerOf = (q) => q.a ? q.a[q.c] : (q.correct_answers || [])[0];
const answersByText = {};
for (const sid of Object.keys(all)) for (const q of all[sid]) {
  (answersByText[key(q.q)] = answersByText[key(q.q)] || new Set()).add(key(answerOf(q)));
}
for (const sid of Object.keys(SPEC)) {
  const qs = all[sid];
  if (!qs) { console.log("!! 単元が見つからない:", sid); problems++; continue; }
  for (const idx of Object.keys(SPEC[sid])) {
    const q = qs[Number(idx)];
    if (!q) { console.log("!! 問題が見つからない:", sid, idx); problems++; continue; }
    const entry = SPEC[sid][idx];
    const shared = answersByText[key(q.q)].size > 1;
    if (q.canvas_code && entry.fig) { console.log("!! もともと図がある問題に fig:", sid, idx); problems++; }
    map[shared ? q.q + "‖" + answerOf(q) : q.q] = entry; n++;
    console.log(sid.split("/").pop() + "#" + idx + ": " + (shared ? "(正解つき) " : "") + q.q.replace(/\s+/g, " ").slice(0, 46) + " => " + (entry.fig ? "問題図 " : "") + (entry.explain_fig ? "解説図(" + (entry.explain_fig.cap || entry.explain_fig.k || entry.explain_fig.t) + ")" : ""));
  }
}
const out = "/* 自動生成：tools/figures/build-figure-map.js（手で直さず spec.js を直して作り直す） */\n" +
  "window.FIGURE_MAP = " + JSON.stringify(map, null, 1) + ";\n";
fs.writeFileSync(path.join(root, "js/figure-map.js"), out);
console.log(`\n${n} 問に図を付けた` + (problems ? ` / 要確認 ${problems}件` : ""));
