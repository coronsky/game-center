/* ===== アプリ本体 ===== */
const GID='solitaire';
const store=mkStore('mc_'+GID+'_');
const S=Object.assign({sound:true,talk:true,auto:true,kd:'1',sd:'1'},store.get('settings',{}));
SND.on=S.sound; TALK.on=S.talk;
const GN={k:'クロンダイク',s:'スパイダー',f:'フリーセル'};
const NST=30;
const P=Object.assign({st:{k:{},s:{},f:{}},daily:{}},store.get('prog',{})); ['k','s','f'].forEach(g=>{P.st[g]=P.st[g]||{}});
const saveP=()=>store.set('prog',P);
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function report(t,o){try{window.MC&&MC.report(GID,t,o||{})}catch(e){}}
const syncs=[bindSettings($('mHelp'),S,()=>{SND.on=S.sound;TALK.on=S.talk;store.set('settings',S)}),bindSettings($('mMenu'),S,()=>{store.set('settings',S)})];
const syncAll=()=>syncs.forEach(f=>f());
const optsOf=(g,v)=>g==='k'?{draw:v}:g==='s'?{suits:v}:{};

/* --- 日付 --- */
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const todayS=()=>dstr(new Date());
const dayNum=d=>Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);
const DK={k:'k1',s:'s1',f:'f'}, DOFF={k:1,s:3,f:5};
function dailySeed(g,d){ const p=POOL[DK[g]]; return p[(dayNum(d||new Date())*7+DOFF[g])%p.length]; }

/* --- ゲーム状態 --- */
let CX=null, ST=null, hist=[], mvN=0, t0=0, tick=null, done=false, busy=false, hints=0, undos=0, sel=null, hintM=null, autoT=null;
const Gx=()=>E[CX.g];
function modeName(){ return CX.mode==='stage'?'ステージ'+(CX.idx+1):CX.mode==='daily'?'きょうのチャレンジ':'ランダム'+(CX.g==='k'?'('+CX.o.draw+'枚)':CX.g==='s'?'('+CX.o.suits+'色)':''); }
function startGame(g,mode,idx){ let seed,o;
  if(mode==='stage'){ const [v,sd]=STG[g][idx]; seed=sd; o=optsOf(g,v); }
  else if(mode==='daily'){ seed=dailySeed(g); o=optsOf(g,1); }
  else { const key=g==='k'?'k'+S.kd:g==='s'?'s'+S.sd:'f'; const p=POOL[key]; seed=p[(Math.random()*p.length)|0]; o=optsOf(g,g==='k'?+S.kd:g==='s'?+S.sd:0); }
  CX={g,mode,idx,seed,o}; store.set('lastg',g); newBoard(true); }
function newBoard(fresh){ plan=null; clearInterval(tick); clearTimeout(autoT);
  ST=Gx().init(CX.seed,CX.o); hist=[]; mvN=0; t0=0; done=false; busy=false; hints=0; undos=0; sel=null; hintM=null; $('tm').textContent='0:00';
  ['mMenu','mSel','mDaily','mRes'].forEach(closeM);
  $('gTitle').textContent=GN[CX.g]+' '+modeName(); $('fdL').textContent=CX.g==='s'?'完成した組':'台に上げた';
  draw(); setStatus(CX.g==='s'?'数字を小さくして重ねよう':CX.g==='f'?'空きマスをじょうずに使おう':'Aから台に上げていこう');
  if(fresh) setTimeout(()=>sayText(1,'くばったワン！'),300); }

/* --- 動かす --- */
const fromEq=(m,s)=>m.a===s.a&&(s.a==='w'||s.a==='d'||(m.i===s.i&&(s.a!=='t'||m.j===s.j)));
const toEq=(m,d)=>m.b===d.b&&(d.b!=='t'||m.k===d.k);
const legal=()=>Gx().moves(ST,false);
function score(m){ if(m.b==='f') return 0; if(m.b==='c') return 3; const d=ST.t[m.k]; if(!d.length) return 2;
  if(CX.g==='s'){ const c=ST.t[m.i][m.j], x=d[d.length-1]; return cst(x)===cst(c)?.5:1 } return 1; }
const bestOf=ms=>ms.slice().sort((a,b)=>score(a)-score(b))[0];
function doMove(m){ if(done||busy) return; const G=Gx();
  if(!t0){ t0=Date.now(); tick=setInterval(()=>$('tm').textContent=fmt(Date.now()-t0),500); }
  const before=G.count(ST); hist.push(ST); ST=G.apply(ST,m); mvN++; sel=null; hintM=null;
  const after=G.count(ST);
  if(CX.g==='s'&&after>before){ SFX.win(); burstEl($('tb'),['✨','🐾'],6); } else if(m.b==='f') SFX.ok(); else if(m.a==='d') SFX.tap(); else SFX.put();
  draw(); afterMove(); }
function afterMove(){ const G=Gx(); if(G.won(ST)){ win(); return; }
  if(CX.g!=='s'&&canAuto()){ autoFinish(); return; }
  if(CX.g!=='k'&&!G.moves(ST,false).length){ setStatus('うごかせる手がないよ…「もどす」でやりなおそう'); toast('手がなくなったよ',true); } }
function canAuto(){ const G=Gx(); let s=ST, nd=0;
  if(CX.g==='k'&&s.t.some(c=>c.some(x=>!cup(x)))) return false;
  for(let q=0;q<400;q++){ if(G.won(s)) return true; const ms=G.moves(s,true); const fm=ms.find(m=>m.b==='f');
    if(fm){ s=G.apply(s,fm); nd=0; continue; }
    if(CX.g==='k'&&ms.some(m=>m.a==='d')&&nd<60){ s=G.apply(s,{a:'d'}); nd++; continue; } return false; }
  return false; }
function autoFinish(){ busy=true; const G=Gx(); setStatus('あとは自動でかたづけるよ！');
  const step=()=>{ if(G.won(ST)){ busy=false; win(); return; }
    const ms=G.moves(ST,true); let m=ms.find(x=>x.b==='f')||(CX.g==='k'?{a:'d'}:null); if(!m){ busy=false; return; }
    ST=G.apply(ST,m); if(m.b==='f'){ mvN++; SFX.tap(); } draw(); autoT=setTimeout(step,m.b==='f'?80:30); };
  autoT=setTimeout(step,300); }
function onStock(){ if(done||busy) return; actx(); const G=Gx(), ms=legal().filter(m=>m.a==='d');
  if(ms.length){ doMove(ms[0]); return; }
  if(CX.g==='s'&&ST.stock.length) toast('からっぽの列があると配れないよ',true); else SFX.ng(); }
function cardMoves(src){ return legal().filter(m=>fromEq(m,src)); }
function tryDst(dst){ if(!sel) return false; const ms=legal().filter(m=>fromEq(m,sel)&&toEq(m,dst)); if(!ms.length) return false; doMove(bestOf(ms)); return true; }
function onDst(dst){ if(done||busy) return; actx(); if(sel){ if(!tryDst(dst)){ SFX.ng(); sel=null; draw(); } } }
const sameSrc=(a,b)=>a&&b&&a.a===b.a&&a.i===b.i&&a.j===b.j;
function onSrc(src){ if(done||busy) return; actx();
  if(hintM&&hintM.a!=='d'&&fromEq(hintM,src)){ doMove(hintM); return; }
  if(!S.auto&&sel){ const dst=src.a==='t'?{b:'t',k:src.i}:src.a==='f'?{b:'f'}:null; if(dst&&tryDst(dst)) return; }
  const ms=cardMoves(src); if(!ms.length){ SFX.ng(); if(sel){sel=null;draw()} return; }
  if(S.auto||sameSrc(sel,src)){ doMove(bestOf(ms)); return; }
  sel=src; SFX.tap(); draw(); }

/* --- もどす・やりなおし・ヒント --- */
$('bUndo').onclick=()=>{ if(!hist.length||busy) return; actx(); ST=hist.pop(); mvN=Math.max(0,mvN-1); undos++; done=false; sel=null; hintM=null; SFX.tap(); draw(); };
$('bReset').onclick=()=>{ if(busy) return; actx(); SFX.tap(); newBoard(false); };
$('bMenu').onclick=()=>{ actx(); SFX.tap(); openMenu(); };
let plan=null;
const xkey=s=>JSON.stringify([s.t,s.c,s.f,s.stock,s.waste]);
$('bHint').onclick=()=>{ if(done||busy) return; actx(); const G=Gx(); setStatus('考え中',true);
  setTimeout(()=>{ let m=null; const xk=xkey(ST);
    if(plan){ const i=plan.keys.indexOf(xk); if(i>=0&&i<plan.moves.length) m=plan.moves[i]; }
    if(!m){ let r; if(hist.length){ r=solveAny(G,ST,120000,hist.map(G.key)); if(!r.ok) r=solveAny(G,ST,120000); } else r=solveAny(G,ST,120000);
      if(r.ok&&r.path.length){ const keys=[xk]; let s=ST; r.path.forEach(p=>{ s=G.apply(s,p); keys.push(xkey(s)); }); plan={moves:r.path,keys}; m=r.path[0]; }
      else if(!r.ok&&!r.timeout){ setStatus('この形からは解けないかも…「もどす」でやり直してみよう'); toast('むずかしい形だよ',true); return; }
      else { const ms=G.order(ST,G.moves(ST,true)); m=ms[0]||null; } }
    if(!m){ setStatus('うごかせる手がないよ'); return; }
    hintM=m; hints++; sel=null; SFX.ok(); draw();
    setStatus(m.a==='d'?(CX.g==='s'?'山札から配ってみよう（光ってるよ）':'山札をめくってみよう（光ってるよ）'):'光ったカードを光った場所へ動かそう'); sayText(2,'こうしてみて！'); },30); };

/* --- クリア --- */
function win(){ if(done) return; done=true; clearInterval(tick); clearTimeout(autoT); busy=false;
  const ms=Date.now()-t0, stars=hints?1:undos?2:3;
  if(CX.mode==='stage'){ if(stars>(P.st[CX.g][CX.idx]||0)) P.st[CX.g][CX.idx]=stars; }
  else if(CX.mode==='daily'){ const d=todayS(); P.daily[d]=P.daily[d]||{}; if(stars>(P.daily[d][CX.g]||0)) P.daily[d][CX.g]=stars; }
  saveP(); report('clear',{stars}); SFX.win(); confetti(['🃏','🐾','✨','♥','♠']); sayText(1,'やったワン！',true); sayText(2,'すごーい♪',true); setStatus('クリア！');
  const nextLbl=CX.mode==='stage'?(CX.idx<NST-1?'つぎのステージ':'ステージえらび'):CX.mode==='daily'?'まいにち画面へ':'あたらしく配る';
  $('bAgain').textContent=nextLbl;
  $('bAgain').onclick=()=>{ closeM('mRes'); if(CX.mode==='stage'){ if(CX.idx<NST-1) startGame(CX.g,'stage',CX.idx+1); else openSel(CX.g); } else if(CX.mode==='daily') openDaily(); else startGame(CX.g,'random'); };
  showResult({winner:0,title:'🎉 '+GN[CX.g]+' クリア！',score:fmt(ms)+'・'+mvN+'手',msg:stars===3?'★★★ ヒントも「もどす」も使わなかったよ！':stars===2?'ヒントなしでクリア！':'クリアおめでとう！',
    extra:`<div class="bigStars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>`,rec:'★1 クリア　★2 ヒントなし　★3 ヒント・もどすなし'}); }
$('bResMenu').onclick=()=>{ closeM('mRes'); openMenu(); };

/* --- 描画 --- */
function faceOf(r){ return r===10?'🐕':r===11?'🐩':r===12?'🦮':''; }
function cardEl(c,x,y,w,h,cls){ const e=document.createElement('div'); const up=cup(c);
  e.className='cd '+(up?(cred(c)?'r':'k'):'dn')+(cls?' '+cls:''); Object.assign(e.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',fontSize:(w*.4)+'px'});
  if(up){ const r=crk(c), s=cst(c); e.innerHTML=`<span class="tl">${RK[r]}${SU[s]}</span>`+(r>=10?`<span class="fc">${faceOf(r)}</span>`:`<span class="md">${SU[s]}</span>`); }
  return e; }
function slot(x,y,w,h,txt,fn,cls){ const e=document.createElement('div'); e.className='slot'+(cls?' '+cls:''); Object.assign(e.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'}); e.textContent=txt||''; if(fn) e.onclick=fn; return e; }
const hSrc=(a,i,j)=>hintM&&hintM.a===a&&(a==='w'||a==='d'||(hintM.i===i&&(a!=='t'||j>=hintM.j)));
const hDst=(b,k)=>hintM&&hintM.b===b&&(b!=='t'||hintM.k===k);
const selOn=(a,i,j)=>sel&&sel.a===a&&(a==='w'||(sel.i===i&&(a!=='t'||j>=sel.j)));
function clsFor(a,i,j,dstTop){ let c=''; if(selOn(a,i,j)) c='sel'; if(hSrc(a,i,j)) c+=' hint'; if(dstTop&&hDst('t',i)) c+=' hint2'; return c; }
function stackCol(T,col,i,x,top0,w,h,avail){ const dn=Math.max(5,Math.round(h*.12)), up=Math.round(h*(CX.g==='s'?.27:.3));
  const need=col.reduce((a,c)=>a+(cup(c)?up:dn),0), sc=need>avail?Math.max(avail/need,.5):1; let y=top0;
  T.appendChild(slot(x,top0,w,h,CX.g==='k'?'K':'',()=>onDst({b:'t',k:i}),hDst('t',i)&&!col.length?'hint':''));
  col.forEach((c,j)=>{ const last=j===col.length-1, e=cardEl(c,x,y,w,h,clsFor('t',i,j,last));
    if(cup(c)) e.onclick=ev=>{ev.stopPropagation();onSrc({a:'t',i,j})}; else e.onclick=ev=>{ev.stopPropagation();onDst({b:'t',k:i})};
    T.appendChild(e); y+=Math.round((cup(c)?up:dn)*sc); });
  return y+h; }
function drawK(T,W){ const g=4,w=Math.floor((W-g*6)/7),h=Math.round(w*1.4),X=i=>i*(w+g); let maxY=0;
  T.appendChild(slot(X(0),0,w,h,ST.stock.length?'':(ST.waste.length?'↻':''),onStock,hintM&&hintM.a==='d'?'hint':''));
  if(ST.stock.length){ const e=cardEl(DN,X(0),0,w,h,hintM&&hintM.a==='d'?'hint':''); e.onclick=onStock; const n=document.createElement('span'); n.className='pileN'; n.textContent=ST.stock.length; e.appendChild(n); T.appendChild(e); }
  T.appendChild(slot(X(1),0,w,h,'',null));
  const nw=Math.min(ST.d,ST.waste.length), dx=Math.round(w*.3);
  for(let q=0;q<nw;q++){ const c=ST.waste[ST.waste.length-nw+q], top=q===nw-1; const e=cardEl(c,X(1)+q*dx,0,w,h,top?clsFor('w'):''); if(top) e.onclick=ev=>{ev.stopPropagation();onSrc({a:'w'})}; T.appendChild(e); }
  for(let i=0;i<4;i++){ T.appendChild(slot(X(3+i),0,w,h,SU[i],()=>onDst({b:'f',k:i}),hDst('f',i)?'hint':'')); if(ST.f[i]>0){ const e=cardEl(i*13+ST.f[i]-1,X(3+i),0,w,h,''); e.onclick=ev=>{ev.stopPropagation();onSrc({a:'f',i})}; T.appendChild(e); } }
  const top0=h+10; for(let i=0;i<7;i++) maxY=Math.max(maxY,stackCol(T,ST.t[i],i,X(i),top0,w,h,470-top0-h));
  return Math.max(maxY+6,top0+h*3); }
function drawS(T,W){ const g=2,w=Math.floor((W-g*9)/10),h=Math.round(w*1.45),X=i=>i*(w+g); let maxY=0;
  const bw=X(4)-g; const b=document.createElement('div'); b.className='doneBox'; Object.assign(b.style,{left:'0px',top:'0px',width:bw+'px',height:Math.round(h*.8)+'px',fontSize:Math.round(w*.42)+'px'});
  b.textContent='完成 '+ST.done+'/8　'+'♠'.repeat(ST.done)+'·'.repeat(8-ST.done); T.appendChild(b);
  const dl=Math.floor(ST.stock.length/10); T.appendChild(slot(X(9),0,w,h,dl?'':'',onStock,hintM&&hintM.a==='d'?'hint':''));
  if(dl){ const e=cardEl(DN,X(9),0,w,h,hintM&&hintM.a==='d'?'hint':''); e.onclick=onStock; const n=document.createElement('span'); n.className='pileN'; n.textContent='×'+dl; e.appendChild(n); T.appendChild(e); }
  const top0=h+8; for(let i=0;i<10;i++) maxY=Math.max(maxY,stackCol(T,ST.t[i],i,X(i),top0,w,h,520-top0-h));
  return Math.max(maxY+6,top0+h*3); }
function drawF(T,W){ const g=3,w=Math.floor((W-g*7)/8),h=Math.round(w*1.42),X=i=>i*(w+g); let maxY=0;
  for(let i=0;i<4;i++){ T.appendChild(slot(X(i),0,w,h,'',()=>onDst({b:'c'}),hDst('c')&&ST.c[i]<0&&ST.c.indexOf(-1)===i?'hint':'')); const c=ST.c[i];
    if(c>=0){ const e=cardEl(c,X(i),0,w,h,clsFor('c',i)); e.onclick=ev=>{ev.stopPropagation();onSrc({a:'c',i})}; T.appendChild(e); } }
  for(let i=0;i<4;i++){ T.appendChild(slot(X(4+i),0,w,h,SU[i],()=>onDst({b:'f',k:i}),hDst('f',i)?'hint':'')); if(ST.f[i]>0){ const e=cardEl(i*13+ST.f[i]-1,X(4+i),0,w,h,''); e.onclick=ev=>{ev.stopPropagation();onDst({b:'f',k:i})}; T.appendChild(e); } }
  const top0=h+10; for(let i=0;i<8;i++) maxY=Math.max(maxY,stackCol(T,ST.t[i],i,X(i),top0,w,h,500-top0-h));
  return Math.max(maxY+6,top0+h*3); }
function draw(){ if(!ST) return; const T=$('tb'), W=T.clientWidth||340; T.innerHTML='';
  const H=CX.g==='k'?drawK(T,W):CX.g==='s'?drawS(T,W):drawF(T,W); T.style.height=H+'px';
  const G=Gx(); $('mv').textContent=mvN; $('fd').textContent=CX.g==='s'?ST.done+'/8':G.count(ST)+'/52'; $('bUndo').disabled=!hist.length||busy; $('bHint').disabled=done||busy; }
addEventListener('resize',draw);

/* --- メニュー・ステージ・毎日 --- */
let mg=store.get('lastg','k');
function starSum(g){ let n=0; for(const k in P.st[g]) n+=P.st[g][k]; return n; }
function syncMenu(){ document.querySelectorAll('#gpick button').forEach(b=>{ b.classList.toggle('on',b.dataset.g===mg); $('gs_'+b.dataset.g).textContent='★'+starSum(b.dataset.g)+'/'+NST*3; });
  $('optK').style.display=mg==='k'?'':'none'; $('optS').style.display=mg==='s'?'':'none'; syncAll(); }
function openMenu(){ syncMenu(); openM('mMenu'); }
document.querySelectorAll('#gpick button').forEach(b=>b.onclick=()=>{ actx(); SFX.tap(); mg=b.dataset.g; syncMenu(); });
document.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>{ actx(); SFX.tap(); const m=b.dataset.m;
  if(m==='stage'){ closeM('mMenu'); openSel(mg); } else if(m==='daily'){ closeM('mMenu'); openDaily(); } else { startGame(mg,'random'); } });
function openSel(g){ mg=g; $('selT').textContent=GN[g]+' のステージ'; const gr=$('selGrid'); let h='';
  for(let i=0;i<NST;i++){ const v=STG[g][i][0];
    if(g==='k'&&(i===0||i===15)) h+=`<div class="sep">${v===1?'1枚めくり':'3枚めくり'}</div>`;
    if(g==='s'&&(i===0||i===15)) h+=`<div class="sep">${v===1?'1色（かんたん）':'2色（むずかしい）'}</div>`;
    if(g==='f'&&i===0) h+=`<div class="sep">かんたん → むずかしい</div>`;
    const n=P.st[g][i]||0; h+=`<button data-i="${i}" class="${CX&&CX.g===g&&CX.mode==='stage'&&CX.idx===i?'on':''}">${i+1}<em>${'★'.repeat(n)}${'☆'.repeat(3-n)}</em></button>`; }
  gr.innerHTML=h; gr.querySelectorAll('button').forEach(b=>b.onclick=()=>{ actx(); SFX.tap(); startGame(g,'stage',+b.dataset.i); }); openM('mSel'); }
$('selBack').onclick=()=>{ closeM('mSel'); openMenu(); };
function streak(){ let n=0; const d=new Date(); if(!P.daily[dstr(d)]) d.setDate(d.getDate()-1); while(P.daily[dstr(d)]&&Object.keys(P.daily[dstr(d)]).length){ n++; d.setDate(d.getDate()-1); } return n; }
function openDaily(){ const now=new Date(), WD='日月火水木金土'[now.getDay()]; $('dSub').textContent=(now.getMonth()+1)+'/'+now.getDate()+'（'+WD+'）　🔥 連続 '+streak()+' 日';
  const td=P.daily[todayS()]||{}; $('dRows').innerHTML=['k','s','f'].map(g=>{ const n=td[g]||0; return `<div class="dr"><span>${GN[g]}</span><em>${n?'★'.repeat(n)+'☆'.repeat(3-n):'—'}</em><button class="btn g" data-g="${g}">${n?'もう一回':'あそぶ'}</button></div>`; }).join('');
  $('dRows').querySelectorAll('button').forEach(b=>b.onclick=()=>{ actx(); SFX.tap(); startGame(b.dataset.g,'daily'); });
  let c=''; for(let k=13;k>=0;k--){ const d=new Date(); d.setDate(d.getDate()-k); const rec=P.daily[dstr(d)], has=rec&&Object.keys(rec).length;
    c+=`<div class="${has?'st':''} ${k===0?'tdy':''}"><span>${d.getMonth()+1}/${d.getDate()}</span><b>${has?'🐾':''}</b></div>`; }
  $('cal').innerHTML=c; openM('mDaily'); }
$('bHelp').onclick=()=>{ SFX.tap(); closeM('mMenu'); syncAll(); openM('mHelp'); };
$('mHelp').querySelector('[data-close]').addEventListener('click',()=>{ if(!CX) openMenu(); });
$('bHome')&&0;

/* --- 起動 --- */
startGame(mg,'random'); closeM('mMenu'); setTimeout(()=>{ if(!store.get('seen')){ store.set('seen',1); syncAll(); openM('mHelp'); } else openMenu(); },200);
