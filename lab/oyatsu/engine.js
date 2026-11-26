// パクッとおやつキャッチ — 物理エンジンとステージ（画面描画なし。node でも動く）
(function(G0){
const W=360,H=540,FLOOR=520,G=900,R=7,DT=1/240,CATCH_V=700,TMAX=12;
// 反発係数 e・すべり f
const MAT={wall:[.45,.92],plank:[.62,.97],cushion:[.12,.5],tramp:[1.18,.99],head:[.6,.95]};
const ITEMS={
  plank:{L:84,th:5,n:'いた',e:'🪵'},
  cushion:{L:66,th:9,n:'クッション',e:'🛏'},
  tramp:{L:60,th:4,n:'トランポリン',e:'🤸'}
};
const DOG={moon:{hr:28,mr:20,n:'ムーン'},coron:{hr:24,mr:17,n:'コロン'}};
const REACH=18;// 首をのばして食いつける距離

function itemSeg(it){const d=ITEMS[it.k],a=it.a*Math.PI/180,c=Math.cos(a)*d.L/2,s=Math.sin(a)*d.L/2;
  return{x1:it.x-c,y1:it.y+s,x2:it.x+c,y2:it.y-s,th:d.th,m:it.k}}
function dogGeo(d){const k=DOG[d.k],jy=d.jy||0;
  return{hx:d.x,hy:d.y-50-jy,hr:k.hr,mx:d.x+d.f*k.hr*.55,my:d.y-40-jy,mr:k.mr}}
function closest(px,py,s){const dx=s.x2-s.x1,dy=s.y2-s.y1,l=dx*dx+dy*dy;
  let t=l?((px-s.x1)*dx+(py-s.y1)*dy)/l:0;t=t<0?0:t>1?1:t;return[s.x1+dx*t,s.y1+dy*t]}

function World(st,placed){
  this.st=st;this.t=0;this.res=null;this.why='';this.msg='';this.slow=0;this.cool=0;this.path=[];this.n=0;this.hits=0;
  const L=st.launch,a=L.a*Math.PI/180;
  this.p={x:L.x+Math.cos(a)*24,y:L.y-Math.sin(a)*24,vx:L.v*Math.cos(a),vy:-L.v*Math.sin(a)};
  this.segs=[];
  this.segs.push({x1:-40,y1:FLOOR,x2:W+40,y2:FLOOR,th:0,m:'wall'});
  for(const w of st.walls||[])this.segs.push({x1:w[0],y1:w[1],x2:w[2],y2:w[3],th:w[4]==null?5:w[4],m:'wall'});
  for(const it of placed||[])this.segs.push(itemSeg(it));
  this.dogs=st.dogs.map(d=>({...d,jy:0}));
  for(const d of this.dogs){// 体（背中）
    this.segs.push({x1:d.x-20,y1:d.y-24,x2:d.x+20,y2:d.y-24,th:2,m:'wall'});}
  this.bones=(st.bones||[]).map(b=>({x:b[0],y:b[1],got:false}));
}
World.prototype.bounce=function(nx,ny,pen,m){const p=this.p;p.x+=nx*pen;p.y+=ny*pen;
  const vn=p.vx*nx+p.vy*ny;if(vn>=0)return;const e=MAT[m][0],f=MAT[m][1];
  const tx=p.vx-vn*nx,ty=p.vy-vn*ny;p.vx=tx*f-vn*e*nx;p.vy=ty*f-vn*e*ny;
  const sp=Math.hypot(p.vx,p.vy);if(sp>950){p.vx*=950/sp;p.vy*=950/sp}
  if(-vn>60){this.hits++;this.lastHit=m}};
World.prototype.end=function(r,why){this.res=r;this.why=why};
World.prototype.step=function(){
  if(this.res)return;const p=this.p,st=this.st;this.t+=DT;this.n++;
  p.vy+=G*DT;
  for(const f of st.fans||[])if(p.x>f.x&&p.x<f.x+f.w&&p.y>f.y&&p.y<f.y+f.h){p.vx+=f.fx*DT;p.vy+=f.fy*DT}
  p.x+=p.vx*DT;p.y+=p.vy*DT;
  for(const s of this.segs){const c=closest(p.x,p.y,s),dx=p.x-c[0],dy=p.y-c[1],d=Math.hypot(dx,dy),lim=R+s.th;
    if(d<lim&&d>1e-6)this.bounce(dx/d,dy/d,lim-d,s.m)}
  // わんこドア
  if(this.cool>0)this.cool-=DT;else for(const q of st.doors||[]){
    for(const [a,b] of [[0,2],[2,0]])if(Math.hypot(p.x-q[a],p.y-q[a+1])<16){p.x=q[b];p.y=q[b+1];this.cool=.35;this.msg='door';break}}
  // ほねっこ
  for(const b of this.bones)if(!b.got&&Math.hypot(p.x-b.x,p.y-b.y)<17){b.got=true;this.msg='bone'}
  // ネコ
  for(const c of st.cats||[])if(Math.hypot(p.x-c[0],p.y-(c[1]-18))<22+R)return this.end('fail','ネコにとられた！');
  // ルンバ
  for(const r of st.roombas||[]){const cx=r.x+Math.sin(this.t*r.sp)*r.amp;
    if(Math.abs(p.x-cx)<26+R&&p.y>FLOOR-16-R)return this.end('fail','ルンバにすわれた！')}
  // ワンコ
  for(const d of this.dogs){
    if(d.k==='coron'&&d.target){const g0=dogGeo({...d,jy:0}),dx=Math.abs(p.x-g0.mx),up=g0.my-p.y;
      const want=(dx<55&&up>0&&up<130&&p.vy>-50)?Math.min(70,up):0;
      d.jy+=Math.max(-420*DT,Math.min(420*DT,want-d.jy))}
    const g=dogGeo(d),md=Math.hypot(p.x-g.mx,p.y-g.my);
    if(d.target){d.near=md<g.mr+REACH+40?{x:p.x,y:p.y}:null;
      if(md<g.mr+REACH&&p.y<d.y-30-d.jy){/* 床をころがるおやつは食べない */const sp=Math.hypot(p.vx,p.vy);
        if(sp<CATCH_V){d.near={x:p.x,y:p.y};return this.end('catch',d.k)}if(!this.fastOnce){this.fastOnce=1;this.msg='fast'}}}
    const hx=p.x-g.hx,hy=p.y-g.hy,hd=Math.hypot(hx,hy);
    if(hd<g.hr+R&&hd>1e-6&&!(d.target&&md<g.mr+REACH+8))this.bounce(hx/hd,hy/hd,g.hr+R-hd,'head')}
  if(p.x<-30||p.x>W+30||p.y>H+30)return this.end('fail','おやつがとんでいっちゃった');
  if(this.t>TMAX)return this.end('fail','時間切れ');
  if(Math.hypot(p.vx,p.vy)<25){this.slow+=DT;if(this.slow>.7)return this.end('fail','おやつがとまっちゃった')}else this.slow=0;
  if(this.n%6===0)this.path.push(p.x,p.y);
};
World.prototype.run=function(){while(!this.res)this.step();return this};

/* ステージ
 launch:{x,y,a(角度・上が＋),v}  dogs:[{k,x,y(足もと),f(向き 1右/-1左),target}]
 walls:[[x1,y1,x2,y2,太さ]] items:{plank:数,...} bones:[[x,y]] cats:[[x,足もとy]]
 fans:[{x,y,w,h,fx,fy}] doors:[[x1,y1,x2,y2]] roombas:[{x,amp,sp}] */
const STAGES=[
 {n:'いたで はねかえそう',hint:'いたを置いて、おやつの向きをかえよう',
  launch:{x:200,y:470,a:82,v:620},dogs:[{k:'moon',x:60,y:520,f:1,target:true}],
  walls:[],items:{plank:1},bones:[[166,395]]},
 {n:'トランポリンで ジャンプ',hint:'たなの上のムーンまで とどかせよう',
  launch:{x:40,y:180,a:0,v:240},dogs:[{k:'moon',x:300,y:250,f:-1,target:true}],
  walls:[[250,250,360,250,6],[250,250,250,520,4]],items:{tramp:1},bones:[[173,199]]},
 {n:'たかい たかい',hint:'高いところから落ちると速すぎてキャッチできない',
  launch:{x:40,y:300,a:65,v:600},dogs:[{k:'moon',x:250,y:520,f:-1,target:true}],
  walls:[[330,520,330,100,5]],items:{cushion:1,plank:1},bones:[[151,257]]},
 {n:'2まいの いた',hint:'じぐざぐに はねかえそう',
  launch:{x:30,y:150,a:0,v:300},dogs:[{k:'moon',x:60,y:520,f:1,target:true}],
  walls:[[0,330,200,330,6]],items:{plank:2},bones:[[205,463]]},
 {n:'コロン とうじょう',hint:'コロンは上のおやつにジャンプしてキャッチ',
  launch:{x:320,y:470,a:105,v:560},dogs:[{k:'coron',x:110,y:520,f:1,target:true}],
  walls:[[180,520,180,320,5]],items:{plank:2},bones:[[148,367]]},
 {n:'ネコに 気をつけて',hint:'ネコにさわると とられちゃう',
  launch:{x:30,y:470,a:55,v:520},dogs:[{k:'moon',x:310,y:520,f:-1,target:true}],
  cats:[[200,520]],walls:[],items:{plank:1,tramp:1},bones:[[103,345]]},
 {n:'せんぷうき',hint:'風でおやつがながされる',
  launch:{x:30,y:470,a:60,v:500},dogs:[{k:'moon',x:300,y:520,f:-1,target:true}],
  fans:[{x:120,y:60,w:120,h:300,fx:-900,fy:0}],walls:[[200,520,200,420,5]],items:{plank:2},bones:[[237,439]]},
 {n:'わんこドア',hint:'ドアに入ると もうひとつのドアから出てくる',
  launch:{x:30,y:470,a:45,v:420},dogs:[{k:'moon',x:300,y:300,f:-1,target:true}],
  doors:[[225,490,60,110]],walls:[[250,300,360,300,6],[250,300,250,520,5]],items:{plank:2},bones:[[142,494]]},
 {n:'ヘディングで パス',hint:'ムーンの頭ではねて、コロンへパス',
  launch:{x:30,y:470,a:72,v:520},dogs:[{k:'moon',x:180,y:520,f:-1,target:false},{k:'coron',x:325,y:400,f:-1,target:true}],
  walls:[[290,400,360,400,6],[290,400,290,520,5]],items:{plank:1},bones:[[161,335]]},
 {n:'ルンバが うろうろ',hint:'ゆかに落ちると ルンバにすわれる',
  launch:{x:30,y:300,a:30,v:380},dogs:[{k:'moon',x:310,y:300,f:-1,target:true}],
  roombas:[{x:180,amp:110,sp:1.6}],walls:[[260,300,360,300,6]],items:{tramp:1,plank:1},bones:[[244,273]]},
 {n:'ジグザグ',hint:'すきまから下へ、そしてコロンへ',
  launch:{x:30,y:120,a:0,v:260},dogs:[{k:'coron',x:300,y:520,f:-1,target:true}],
  walls:[[0,160,70,160,6],[100,300,360,300,6]],items:{plank:2},bones:[[60,400]]},
 {n:'ネコが2ひき',hint:'あいだをすりぬけて',
  launch:{x:30,y:200,a:10,v:330},dogs:[{k:'moon',x:180,y:520,f:1,target:true}],
  cats:[[90,520],[290,520]],walls:[],items:{plank:2,cushion:1},bones:[[279,461]]},
 {n:'風にのって',hint:'上の風で おやつがながされる',
  launch:{x:30,y:470,a:85,v:600},dogs:[{k:'coron',x:300,y:250,f:-1,target:true}],
  fans:[{x:0,y:150,w:230,h:110,fx:800,fy:0}],walls:[[240,250,360,250,6],[240,250,240,520,5]],items:{plank:1,tramp:1},bones:[[184,261]]},
 {n:'ながい パス',hint:'コロンの頭ではねて ムーンへ',
  launch:{x:330,y:470,a:100,v:600},dogs:[{k:'coron',x:250,y:520,f:-1,target:false},{k:'moon',x:50,y:520,f:1,target:true}],
  cats:[[150,520]],walls:[],items:{plank:2},bones:[[152,430]]},
 {n:'さいごの ちょうせん',hint:'ぜんぶのアイテムを うまく使おう',
  launch:{x:35,y:330,a:60,v:600},dogs:[{k:'moon',x:310,y:200,f:-1,target:true}],
  roombas:[{x:150,amp:100,sp:1.3}],cats:[[200,200]],walls:[[160,200,360,200,6],[160,200,160,260,5],[0,350,70,350,6],[70,350,70,520,5]],
  items:{plank:1,tramp:1,cushion:1},bones:[[167,162]]}
];
// ★3の目標アイテム数（ソルバーで確認した「ほねっこ込みの最少個数」）
const PARS=[1,1,1,1,1,1,1,1,1,1,2,1,1,1,1];STAGES.forEach((s,i)=>s.par=PARS[i]);
const ENG={W,H,FLOOR,R,DT,CATCH_V,REACH,ITEMS,DOG,STAGES,World,itemSeg,dogGeo};
if(typeof module!=='undefined')module.exports=ENG;else G0.ENG=ENG;
})(this);
