// Coron & Moon ゲームセンター：全ゲーム共通コイン・毎日ミッション
(()=>{
const PK='mcgc_p', MK='mcgc_m', CAP=300;
const GN={reversi:'リバーシ',shogi:'将棋',wanko:'ワンコしょうぎ',gomoku:'五目ならべ',memory:'神経衰弱',escape:'箱入りワンコ',rings:'知恵の輪',peg:'ペグソリティア',slide:'15パズル',hanoi:'ハノイの塔'};
const BATTLE=['reversi','shogi','wanko','gomoku','memory'], PUZZLE=['escape','peg','slide','hanoi'];
const RANKS=[{n:'ブロンズ',c:0},{n:'シルバー',c:100},{n:'ゴールド',c:300},{n:'プラチナ',c:700}];
const rankOf=c=>{let r=RANKS[0]; for(const x of RANKS) if(c>=x.c) r=x; return r};
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
// 日付から決まるかんたんな乱数（同じ日は同じミッション）
function seeded(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%10000)/10000}}
function makeMissions(d){
  const r=seeded('mc'+d), pk=a=>a[Math.floor(r()*a.length)];
  const b=pk(BATTLE), p=pk(PUZZLE);
  const gen=pk([{id:'play3',t:'ゲームを3回あそぶ',need:3,rw:10},{id:'kinds2',t:'2種類のゲームであそぶ',need:2,rw:15},{id:'star3',t:'パズルを★3でクリア',need:1,rw:25},{id:'win2',t:'CPUに2回勝つ',need:2,rw:25}]);
  return [{id:'win_'+b,t:`${GN[b]}でCPUに勝つ`,need:1,rw:b==='shogi'?30:20,g:b},{id:'clear_'+p,t:`${GN[p]}をクリア`,need:1,rw:20,g:p},gen];
}
function state(){
  let m=get(MK,null); const d=today();
  if(!m||m.d!==d||m.list.some(x=>x.g==='rings'||x.g==='wire')) { m={d,list:makeMissions(d),prog:{},done:{},kinds:[],earned:0,bonus:false}; put(MK,m); }
  return m;
}
function addCoins(n){ const P=get(PK,{}); const before=rankOf(P.coins||0); P.coins=(P.coins||0)+n; put(PK,P); return {coins:P.coins,up:rankOf(P.coins).c>before.c?rankOf(P.coins):null}; }
// ---- 画面にお知らせ ----
let box=null;
function note(html,big){
  if(!box){ const st=document.createElement('style'); st.textContent=`.mcc-box{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:250;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;width:max-content;max-width:92vw}
.mcc-n{background:rgba(255,250,240,.97);color:#5a3d2b;border:2.5px solid #f0c35a;border-radius:16px;padding:7px 14px;font:900 14px "Zen Maru Gothic",sans-serif;box-shadow:0 6px 16px rgba(0,0,0,.25);animation:mccIn .35s cubic-bezier(.2,1.4,.4,1),mccOut .4s 2.6s forwards;text-align:center}
.mcc-n.big{border-color:#56705A;background:#f3fbef;font-size:15px}
.mcc-n small{display:block;font-size:11px;color:#8d735b;font-weight:700}
@keyframes mccIn{0%{transform:translateY(-30px);opacity:0}100%{transform:none;opacity:1}}@keyframes mccOut{to{opacity:0;transform:translateY(-10px)}}`; document.head.appendChild(st);
    box=document.createElement('div'); box.className='mcc-box'; document.body.appendChild(box); }
  const n=document.createElement('div'); n.className='mcc-n'+(big?' big':''); n.innerHTML=html; box.appendChild(n); setTimeout(()=>n.remove(),3100);
}
// ---- 結果の報告（各ゲームから呼ぶ） ----
function report(game,type,ex){
  ex=ex||{}; const m=state(); const lv=Math.max(1,Math.min(4,+ex.lv||1));
  let n= type==='win'? 5+lv*3 : type==='clear'? 6+(ex.stars||0)*2 : type==='draw'? 3 : 1;
  n=Math.max(0,Math.min(n,CAP-m.earned)); m.earned+=n;
  // ミッション
  if(!m.kinds.includes(game)) m.kinds.push(game);
  const hit=[];
  for(const x of m.list){
    if(m.done[x.id]) continue; let inc=0;
    if(x.id==='win_'+game&&type==='win') inc=1;
    else if(x.id==='clear_'+game&&type==='clear') inc=1;
    else if(x.id==='play3') inc=1;
    else if(x.id==='win2'&&type==='win') inc=1;
    else if(x.id==='star3'&&type==='clear'&&ex.stars===3) inc=1;
    if(x.id==='kinds2'){ m.prog[x.id]=m.kinds.length; } else if(inc) m.prog[x.id]=(m.prog[x.id]||0)+inc;
    if((m.prog[x.id]||0)>=x.need){ m.done[x.id]=true; hit.push(x); }
  }
  let mc=hit.reduce((a,x)=>a+x.rw,0), allBonus=false;
  if(!m.bonus&&m.list.every(x=>m.done[x.id])){ m.bonus=true; mc+=30; allBonus=true; }
  put(MK,m);
  const res=addCoins(n+mc);
  setTimeout(()=>{
    if(n) note(`🪙 +${n} コイン<small>${type==='win'?'勝利ボーナス':type==='clear'?'クリアボーナス':'あそんだボーナス'}・合計 ${res.coins}</small>`);
    hit.forEach((x,i)=>setTimeout(()=>note(`🎯 ミッション達成！ +${x.rw}<small>${x.t}</small>`,true),400+i*500));
    if(allBonus) setTimeout(()=>note('🏆 今日のミッション全部クリア！ +30',true),400+hit.length*500);
    if(res.up) setTimeout(()=>note(`🎉 ランクアップ！ ${res.up.n}になった`,true),900+hit.length*500);
  },1200);
  return {coins:n+mc,hit,res};
}
window.MC={report,state,addCoins,rankOf,RANKS,GN};
})();
