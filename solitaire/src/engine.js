// ソリティアエンジン（純粋関数）。ブラウザでもNodeでも同じものが動く。
const SU=['♠','♥','♦','♣'],RK=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const DN=64;
const crk=c=>(c&63)%13, cst=c=>((c&63)/13)|0, cup=c=>c<DN, cred=c=>{const s=cst(c);return s===1||s===2};
function rng(seed){ let a=(Math.imul(seed|0,2654435761)^0x9e3779b9)>>>0; return ()=>{a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return((t^(t>>>14))>>>0)/4294967296;} }
function shuf(a,seed){ const r=rng(seed); for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const x=a[i];a[i]=a[j];a[j]=x} return a }
const srt=(ms,sc)=>ms.map(m=>[sc(m),m]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);

/* ---------- クロンダイク ---------- */
const KL={ id:'k',
 init(seed,o){ const d=[];for(let i=0;i<52;i++)d.push(i); shuf(d,seed); const t=[[],[],[],[],[],[],[]];
  for(let i=0;i<7;i++) for(let j=i;j<7;j++){ const c=d.pop(); t[j].push(j===i?c:c+DN); }
  return {g:'k',d:(o&&o.draw)||1,stock:d,waste:[],f:[0,0,0,0],t}; },
 moves(s,solver){ const ms=[], t=s.t;
  const fup=c=>s.f[cst(c)]===crk(c);
  const canT=(c,k)=>{ const col=t[k]; if(!col.length) return crk(c)===12; const x=col[col.length-1]; return cup(x)&&cred(x)!==cred(c)&&crk(x)===crk(c)+1; };
  if(s.waste.length){ const c=s.waste[s.waste.length-1]; if(fup(c)) ms.push({a:'w',b:'f',k:cst(c)}); let e=false;
    for(let k=0;k<7;k++) if(canT(c,k)){ if(!t[k].length){ if(e) continue; e=true } ms.push({a:'w',b:'t',k}) } }
  for(let i=0;i<7;i++){ const col=t[i], L=col.length;
    for(let j=0;j<L;j++){ const c=col[j]; if(!cup(c)) continue;
      if(j===L-1&&fup(c)) ms.push({a:'t',i,j,b:'f',k:cst(c)});
      let e=false; for(let k=0;k<7;k++){ if(k===i||!canT(c,k)) continue;
        if(!t[k].length){ if(e||j===0) continue; e=true }
        ms.push({a:'t',i,j,b:'t',k}) } } }
  if(!solver) for(let su=0;su<4;su++) if(s.f[su]>0){ const c=su*13+s.f[su]-1; for(let k=0;k<7;k++) if(canT(c,k)) ms.push({a:'f',i:su,b:'t',k}); }
  if(s.stock.length||s.waste.length) ms.push({a:'d'});
  return ms; },
 apply(s,m){ const n={g:'k',d:s.d,stock:s.stock,waste:s.waste,f:s.f,t:s.t};
  if(m.a==='d'){ if(s.stock.length){ const st=s.stock.slice(), w=s.waste.slice(); for(let q=0;q<s.d&&st.length;q++) w.push(st.pop()); n.stock=st; n.waste=w; } else { n.stock=s.waste.slice().reverse(); n.waste=[]; } return n; }
  let cards;
  if(m.a==='w'){ n.waste=s.waste.slice(0,-1); cards=[s.waste[s.waste.length-1]]; }
  else if(m.a==='f'){ cards=[m.i*13+s.f[m.i]-1]; n.f=s.f.slice(); n.f[m.i]--; }
  else { const col=s.t[m.i]; cards=col.slice(m.j); n.t=s.t.slice(); const nc=col.slice(0,m.j); if(nc.length&&!cup(nc[nc.length-1])) nc[nc.length-1]-=DN; n.t[m.i]=nc; }
  if(m.b==='f'){ if(n.f===s.f) n.f=s.f.slice(); n.f[m.k]++; }
  else { if(n.t===s.t) n.t=s.t.slice(); n.t[m.k]=n.t[m.k].concat(cards); }
  return n; },
 won:s=>s.f[0]+s.f[1]+s.f[2]+s.f[3]===52,
 count:s=>s.f[0]+s.f[1]+s.f[2]+s.f[3],
 key:s=>s.t.map(c=>c.join(',')).join('|')+'#'+s.stock.join(',')+'#'+s.waste.join(','),
 order(s,ms){ return srt(ms,m=>{ if(m.b==='f') return 0; if(m.a==='d') return 9;
  if(m.a==='w') return 3;
  const col=s.t[m.i]; if(m.j>0&&!cup(col[m.j-1])) return 1; if(m.j===0) return 2; return 5; }); } };

/* ---------- スパイダー ---------- */
function spChk(n,k){ const col=n.t[k], L=col.length; if(L<13) return;
  const top=col[L-1]; if(!cup(top)||crk(top)!==0) return; const su=cst(top);
  for(let q=1;q<13;q++){ const c=col[L-1-q]; if(!cup(c)||crk(c)!==q||cst(c)!==su) return; }
  const nc=col.slice(0,L-13); if(nc.length&&!cup(nc[nc.length-1])) nc[nc.length-1]-=DN; n.t[k]=nc; n.done++; }
const SP={ id:'s',
 init(seed,o){ const ns=(o&&o.suits)||1, d=[]; for(let q=0;q<8;q++){ const base=ns===1?0:ns===2?(q%2)*13:(q%4)*13; for(let r=0;r<13;r++) d.push(base+r); }
  shuf(d,seed); const t=[]; for(let k=0;k<10;k++) t.push([]);
  for(let i=0;i<54;i++){ t[i%10].push(d.pop()+DN); } t.forEach(c=>{c[c.length-1]-=DN});
  return {g:'s',n:ns,t,stock:d,done:0}; },
 moves(s){ const ms=[], t=s.t;
  for(let i=0;i<10;i++){ const col=t[i], L=col.length; if(!L) continue; let j=L-1; if(!cup(col[j])) continue;
   while(j>0&&cup(col[j-1])&&cst(col[j-1])===cst(col[j])&&crk(col[j-1])===crk(col[j])+1) j--;
   for(let st=L-1;st>=j;st--){ const c=col[st]; let e=false;
    for(let k=0;k<10;k++){ if(k===i) continue; const d=t[k];
     if(!d.length){ if(e||st===0) continue; e=true; ms.push({a:'t',i,j:st,b:'t',k}); }
     else if(crk(d[d.length-1])===crk(c)+1) ms.push({a:'t',i,j:st,b:'t',k}); } } }
  if(s.stock.length&&t.every(x=>x.length)) ms.push({a:'d'});
  return ms; },
 apply(s,m){ const n={g:'s',n:s.n,t:s.t.slice(),stock:s.stock,done:s.done};
  if(m.a==='d'){ n.stock=s.stock.slice(0,-10); for(let k=0;k<10;k++) n.t[k]=s.t[k].concat([s.stock[s.stock.length-1-k]]); for(let k=0;k<10;k++) spChk(n,k); return n; }
  const col=s.t[m.i], cards=col.slice(m.j), nc=col.slice(0,m.j); if(nc.length&&!cup(nc[nc.length-1])) nc[nc.length-1]-=DN;
  n.t[m.i]=nc; n.t[m.k]=s.t[m.k].concat(cards); spChk(n,m.k); return n; },
 won:s=>s.done===8, count:s=>s.done,
 key:s=>s.t.map(c=>c.join(',')).join('|')+'#'+s.stock.length,
 order(s,ms){ return srt(ms,m=>{ if(m.a==='d') return 50; const col=s.t[m.i], c=col[m.j], d=s.t[m.k], x=d[d.length-1];
  let sc=(x!==undefined&&cst(x)===cst(c))?0:20; if(m.j>0&&!cup(col[m.j-1])) sc-=8; if(!d.length) sc+=10;
  if(m.j>0&&cup(col[m.j-1])&&cst(col[m.j-1])===cst(c)&&crk(col[m.j-1])===crk(c)+1) sc+=30; return sc; }); } };

/* ---------- フリーセル ---------- */
const FC={ id:'f',
 init(seed){ const d=[];for(let i=0;i<52;i++)d.push(i); shuf(d,seed); const t=[[],[],[],[],[],[],[],[]]; d.forEach((c,i)=>t[i%8].push(c));
  return {g:'f',t,c:[-1,-1,-1,-1],f:[0,0,0,0]}; },
 moves(s){ const ms=[], t=s.t; let nc=0,ne=0; s.c.forEach(x=>{if(x<0)nc++}); t.forEach(x=>{if(!x.length)ne++});
  const fup=c=>s.f[cst(c)]===crk(c);
  const canT=(c,k)=>{ const col=t[k]; if(!col.length) return true; const x=col[col.length-1]; return cred(x)!==cred(c)&&crk(x)===crk(c)+1; };
  for(let i=0;i<4;i++){ const c=s.c[i]; if(c<0) continue; if(fup(c)) ms.push({a:'c',i,b:'f',k:cst(c),n:1}); let e=false;
    for(let k=0;k<8;k++) if(canT(c,k)){ if(!t[k].length){ if(e) continue; e=true } ms.push({a:'c',i,b:'t',k,n:1}); } }
  for(let i=0;i<8;i++){ const col=t[i], L=col.length; if(!L) continue; let j=L-1;
    while(j>0&&cred(col[j-1])!==cred(col[j])&&crk(col[j-1])===crk(col[j])+1) j--;
    for(let st=L-1;st>=j;st--){ const n=L-st, c=col[st];
      if(n===1){ if(fup(c)) ms.push({a:'t',i,j:st,b:'f',k:cst(c),n}); if(nc>0) ms.push({a:'t',i,j:st,b:'c',n}); }
      let e=false; for(let k=0;k<8;k++){ if(k===i||!canT(c,k)) continue; const de=!t[k].length;
        const max=(nc+1)*(1<<(de?ne-1:ne)); if(n>max) continue;
        if(de){ if(e||st===0) continue; e=true }
        ms.push({a:'t',i,j:st,b:'t',k,n}); } } }
  return ms; },
 apply(s,m){ const n={g:'f',t:s.t,c:s.c,f:s.f}; let cards;
  if(m.a==='c'){ cards=[s.c[m.i]]; n.c=s.c.slice(); n.c[m.i]=-1; }
  else { const col=s.t[m.i]; cards=col.slice(m.j); n.t=s.t.slice(); n.t[m.i]=col.slice(0,m.j); }
  if(m.b==='f'){ n.f=s.f.slice(); n.f[m.k]++; }
  else if(m.b==='c'){ if(n.c===s.c) n.c=s.c.slice(); n.c[n.c.indexOf(-1)]=cards[0]; }
  else { if(n.t===s.t) n.t=s.t.slice(); n.t[m.k]=n.t[m.k].concat(cards); }
  return n; },
 won:s=>s.f[0]+s.f[1]+s.f[2]+s.f[3]===52, count:s=>s.f[0]+s.f[1]+s.f[2]+s.f[3],
 key:s=>s.t.map(c=>c.join(',')).sort().join('|')+'#'+s.c.slice().sort((a,b)=>a-b).join(',')+'#'+s.f.join(','),
 order(s,ms){ return srt(ms,m=>{ if(m.b==='f') return 0; if(m.b==='c') return 6; if(m.a==='c') return 2;
  const col=s.t[m.i]; let sc=3; if(m.j===0) sc=1; return sc-(m.n>1?0.5:0); }); } };

const E={k:KL,s:SP,f:FC};

/* ---------- 探索（ヒント・解ける配りの選別） ---------- */
function solve(G,s0,cap,avoid){
  const seen=new Set(avoid||[]); seen.add(G.key(s0)); const stack=[{s:s0,ms:G.order(s0,G.moves(s0,true)),i:0}]; const path=[]; let nodes=0;
  if(G.won(s0)) return {ok:true,path:[],nodes:0};
  while(stack.length){ const top=stack[stack.length-1];
    if(top.i>=top.ms.length){ stack.pop(); if(path.length>Math.max(0,stack.length-1)) path.pop(); continue; }
    const m=top.ms[top.i++]; const ns=G.apply(top.s,m); const k=G.key(ns);
    if(seen.has(k)) continue; seen.add(k);
    if(++nodes>cap) return {ok:false,timeout:true,nodes};
    path.push(m);
    if(G.won(ns)) return {ok:true,path,nodes};
    stack.push({s:ns,ms:G.order(ns,G.moves(ns,true)),i:0}); }
  return {ok:false,timeout:false,nodes}; }


/* 最良優先探索（フリーセル用：短めの手順を見つける） */
function fcH(s){ let h=(52-(s.f[0]+s.f[1]+s.f[2]+s.f[3]))*8; let used=0; for(const c of s.c) if(c>=0) used++; h+=used*3;
  const need=[s.f[0],s.f[1],s.f[2],s.f[3]];
  for(const col of s.t){ for(let j=0;j<col.length;j++){ const c=col[j], su=cst(c); if(crk(c)>=need[su]){ const above=col.length-1-j; if(crk(c)===need[su]) h+=above*4; else if(j>0&&crk(col[j-1])>=0){} } }
    for(let j=0;j+1<col.length;j++){ const a=col[j], b=col[j+1]; if(!(cred(a)!==cred(b)&&crk(a)===crk(b)+1)) h+=1; } }
  return h; }
function solveBF(G,s0,cap,hf,w){ const seen=new Map(); const heap=[]; let nodes=0; w=w||1;
  const push=n=>{ heap.push(n); let i=heap.length-1; while(i>0){ const p=(i-1)>>1; if(heap[p].f<=n.f) break; heap[i]=heap[p]; i=p; } heap[i]=n; };
  const pop=()=>{ const top=heap[0], last=heap.pop(); if(heap.length){ let i=0; for(;;){ let c=2*i+1; if(c>=heap.length) break; if(c+1<heap.length&&heap[c+1].f<heap[c].f) c++; if(heap[c].f>=last.f) break; heap[i]=heap[c]; i=c; } heap[i]=last; } return top; };
  const root={s:s0,g:0,p:null,m:null,f:0}; seen.set(G.key(s0),0); push(root);
  while(heap.length){ const n=pop(); if(G.won(n.s)){ const path=[]; for(let q=n;q.p;q=q.p) path.push(q.m); path.reverse(); return {ok:true,path,nodes}; }
    if(++nodes>cap) return {ok:false,timeout:true,nodes};
    for(const m of G.moves(n.s,true)){ const ns=G.apply(n.s,m), k=G.key(ns), g=n.g+1; const old=seen.get(k); if(old!==undefined&&old<=g) continue; seen.set(k,g);
      push({s:ns,g,p:n,m,f:g+w*hf(ns)}); } }
  return {ok:false,timeout:false,nodes}; }
/* 探索で見つけた手順の遠まわりを近道でけずる */
const XK=s=>JSON.stringify([s.t,s.c,s.f,s.stock,s.waste]);
function shorten(G,s0,path){
  const st=[s0]; for(const m of path) st.push(G.apply(st[st.length-1],m));
  const keys=st.map(XK); const out=[]; let i=0;
  while(i<path.length){ const ms=G.moves(st[i],true); let bj=i+1, bm=path[i];
    const idx=new Map(); for(let j=path.length;j>i;j--) if(!idx.has(keys[j])) idx.set(keys[j],j);
    for(const m of ms){ const k=XK(G.apply(st[i],m)); const j=idx.get(k); if(j!==undefined&&j>bj){ bj=j; bm=m; } }
    out.push(bm); i=bj; }
  return out; }

/* ヒント・選別で使う入口。ゲームごとに合う探索をえらぶ */
function solveAny(G,s0,cap,avoid){
  if(G.id==='f') return solveBF(G,s0,cap,fcH,2);
  const r=solve(G,s0,cap,avoid); if(r.ok&&r.path.length>1){ let p=r.path; for(let z=0;z<3;z++){ const q=shorten(G,s0,p); if(q.length>=p.length) break; p=q; } r.path=p; } return r; }
if(typeof module!=='undefined') module.exports={E,solve,solveAny,solveBF,fcH,shorten,KL,SP,FC,SU,RK,DN,crk,cst,cup,cred};
