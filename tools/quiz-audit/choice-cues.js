const fs=require('fs'),path=require('path'),vm=require('vm');
// ★2026-10-18：選択肢の「見ただけで わかる」手がかりを 数える（保護者：正解が いちばん 長い・正しそうな 答えで 解けて しまう）。
//   使い方：node tools/quiz-audit/choice-cues.js   … 教科ごとの 割合と、「正解だけ 長い」問題が 多い ステージ
//   「正解だけ 長い」＝ 正解の 文字数が ほかの どれよりも 1.3倍 いじょう かつ 4文字 いじょう 長い。目安は 全体で 5% 未満。
const root=path.resolve(__dirname,'../..');
const stages={};
// CONTENT quizzes
const ctx={window:{}};ctx.window.window=ctx.window;vm.createContext(ctx);
for(const f of fs.readdirSync(root+'/js/quizzes')){vm.runInContext(fs.readFileSync(root+'/js/quizzes/'+f,'utf8'),ctx);}
for(const k of Object.keys(ctx.window)){const o=ctx.window[k];if(o&&typeof o==='object')for(const sid of Object.keys(o)){if(Array.isArray(o[sid]))stages[sid]=(stages[sid]||[]).concat(o[sid]);}}
// per-stage files
function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);const st=fs.statSync(p);if(st.isDirectory())walk(p);else if(p.endsWith('.js')){const c={window:{}};c.window.window=c.window;vm.createContext(c);try{vm.runInContext(fs.readFileSync(p,'utf8'),c);}catch(e){continue}if(Array.isArray(c.window.quizPool)){const sid=path.relative(root,p).replace(/\.js$/,'');stages['FILE:'+sid]=c.window.quizPool;}}}}
for(const d of ['探究','算数','国語','理科','社会','外国語'])if(fs.existsSync(root+'/'+d))walk(root+'/'+d);
const W=s=>[...String(s).replace(/<[^>]+>/g,'')].length;
const rows=[];let tot={n:0,c0:0,long:0};
for(const [sid,qs] of Object.entries(stages)){let n=0,c0=0,long=0,cue=0;
 for(const q of qs){if(!Array.isArray(q.a)||q.a.length<3||typeof q.c!=='number')continue;n++;if(q.c===0)c0++;
  const L=q.a.map(W),lc=L[q.c],others=L.filter((_,i)=>i!==q.c),mo=Math.max(...others);
  if(lc>mo && lc>=mo*1.3 && lc-mo>=4)long++;}
 if(!n)continue;rows.push({sid,n,c0,long});tot.n+=n;tot.c0+=c0;tot.long+=long;}
rows.sort((a,b)=>b.long/b.n-a.long/a.n);
console.log('合計',tot.n,'問 c=0:',(tot.c0/tot.n*100).toFixed(0)+'% 正解だけ長い:',(tot.long/tot.n*100).toFixed(0)+'%');
const byTop={};for(const r of rows){const t=r.sid.replace('FILE:','').split('/')[0];byTop[t]=byTop[t]||{n:0,c0:0,long:0};byTop[t].n+=r.n;byTop[t].c0+=r.c0;byTop[t].long+=r.long;}
for(const [t,v] of Object.entries(byTop))console.log(t,v.n,'c0',(v.c0/v.n*100).toFixed(0)+'%','long',(v.long/v.n*100).toFixed(0)+'%');
console.log('--- 正解だけ長いが多い ステージ（上位40）');
rows.filter(r=>r.n>=4).slice(0,40).forEach(r=>console.log(r.sid,r.n,'long',r.long,'c0',r.c0));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(rows));
