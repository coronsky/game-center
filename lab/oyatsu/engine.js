// パクッとおやつキャッチ — 物理エンジンとステージ（画面描画なし。node でも動く）
(function(G0){
const W=360,H=540,FLOOR=520,G=900,R=7,DT=1/240,CATCH_V=700,TMAX=12;
// 反発係数 e・すべり f
const MAT={wall:[.45,.92],plank:[.62,.97],sponge:[.12,.5],tramp:[1.18,.99],ball:[.95,.98],head:[.6,.95]};
const ITEMS={
  plank:{L:84,th:5,n:'いた',e:'🪵'},
  sponge:{L:66,th:9,n:'スポンジ',e:'🧽'},
  ball:{L:0,r:15,n:'ボール',e:'🔴'},
  tramp:{L:60,th:4,n:'トランポリン',e:'🤸'}
};
const DOG={moon:{hr:28,mr:20,n:'ムーン',ru:20,rv:13},coron:{hr:24,mr:17,n:'コロン',ru:18,rv:12}};
// 食べられる範囲：お口の少し前を中心にした横長のだ円（首をのばして届く範囲）。上はせまく
function inBite(d,px,py,pad){const k=DOG[d.k],g=dogGeo(d),u=(px-g.mx)*d.f-6,v=py-g.my-3;pad=pad||0;return (u*u)/((k.ru+pad)*(k.ru+pad))+(v*v)/((k.rv+pad)*(k.rv+pad))<1}
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
  this.circles=[];
  for(const it of placed||[])if(it.k==='ball')this.circles.push({x:it.x,y:it.y,r:ITEMS.ball.r,m:'ball'});else this.segs.push(itemSeg(it));
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
  for(const c of this.circles){const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);if(d<c.r+R&&d>1e-6)this.bounce(dx/d,dy/d,c.r+R-d,c.m)}
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
    const g=dogGeo(d),md=Math.hypot(p.x-g.mx,p.y-g.my);
    if(d.target){d.near=inBite(d,p.x,p.y,26)?{x:p.x,y:p.y}:null;
      if(inBite(d,p.x,p.y)&&p.y<d.y-30-d.jy){/* 床をころがるおやつは食べない */const sp=Math.hypot(p.vx,p.vy);
        if(sp<CATCH_V){d.near={x:p.x,y:p.y};return this.end('catch',d.k)}if(!this.fastOnce){this.fastOnce=1;this.msg='fast'}}}
    const hx=p.x-g.hx,hy=p.y-g.hy,hd=Math.hypot(hx,hy);
    if(hd<g.hr+R&&hd>1e-6&&!(d.target&&inBite(d,p.x,p.y,6)))this.bounce(hx/hd,hy/hd,g.hr+R-hd,'head')}
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
 {"n":"いたで はねかえそう","hint":"いたを置いて おやつの向きをかえよう","launch":{"x":35,"y":310,"a":55,"v":590},"dogs":[{"k":"moon","x":315,"y":340,"f":-1,"target":true}],"walls":[[0,332,70,332,6],[70,332,70,520,5],[250,340,360,340,6],[250,340,250,520,5]],"items":{"plank":1},"bones":[[152,235]],"par":1},
 {"n":"ななめに おいてみよう","hint":"","launch":{"x":325,"y":290,"a":105,"v":520},"dogs":[{"k":"coron","x":55,"y":390,"f":1,"target":true}],"walls":[[360,312,290,312,6],[290,312,290,520,5],[115,390,0,390,6],[115,390,115,520,5]],"items":{"plank":1},"bones":[[152,200]],"par":1},
 {"n":"たかいところへ","hint":"","launch":{"x":35,"y":350,"a":70,"v":560},"dogs":[{"k":"moon","x":280,"y":520,"f":-1,"target":true}],"walls":[[0,372,70,372,6],[70,372,70,520,5]],"items":{"plank":1},"bones":[[99,285]],"par":1},
 {"n":"スポンジで ふんわり","hint":"スポンジは あまりはねない。いきおいを弱めるよ","launch":{"x":325,"y":320,"a":125,"v":450},"dogs":[{"k":"coron","x":80,"y":520,"f":1,"target":true}],"walls":[[360,342,290,342,6],[290,342,290,520,5]],"items":{"sponge":1},"bones":[[239,283]],"par":1},
 {"n":"スポンジで とめる","hint":"","launch":{"x":325,"y":470,"a":135,"v":590},"dogs":[{"k":"moon","x":105,"y":520,"f":1,"target":true}],"walls":[],"items":{"sponge":1},"bones":[[181,408]],"par":1},
 {"n":"スポンジ＋かべ","hint":"","launch":{"x":35,"y":470,"a":60,"v":540},"dogs":[{"k":"coron","x":250,"y":520,"f":-1,"target":true}],"walls":[[170,520,170,410,5]],"items":{"sponge":1},"bones":[[168,368]],"par":1},
 {"n":"トランポリンで ぴょーん","hint":"トランポリンは よくはねる！","launch":{"x":325,"y":370,"a":155,"v":400},"dogs":[{"k":"moon","x":100,"y":520,"f":1,"target":true}],"walls":[[360,392,290,392,6],[290,392,290,520,5]],"items":{"tramp":1},"bones":[[223,381]],"par":1},
 {"n":"トランポリンの かくど","hint":"","launch":{"x":35,"y":470,"a":75,"v":530},"dogs":[{"k":"coron","x":310,"y":360,"f":-1,"target":true}],"walls":[[225,360,360,360,6],[225,360,225,520,5]],"items":{"tramp":1},"bones":[[195,329]],"par":1},
 {"n":"トランポリン＋かべ","hint":"","launch":{"x":325,"y":260,"a":155,"v":600},"dogs":[{"k":"moon","x":85,"y":520,"f":1,"target":true}],"walls":[[360,282,290,282,6],[290,282,290,520,5],[185,130,75,130,6]],"items":{"tramp":1},"bones":[[106,264]],"par":1},
 {"n":"ボールで はねる","hint":"ボールは まるいので いろんな向きにはねる","launch":{"x":35,"y":270,"a":15,"v":510},"dogs":[{"k":"coron","x":260,"y":520,"f":-1,"target":true}],"walls":[[0,292,70,292,6],[70,292,70,520,5]],"items":{"ball":1},"bones":[[109,296]],"par":1},
 {"n":"ボールの いち","hint":"","launch":{"x":35,"y":360,"a":20,"v":420},"dogs":[{"k":"moon","x":265,"y":520,"f":-1,"target":true}],"walls":[[0,382,70,382,6],[70,382,70,520,5]],"items":{"ball":1},"bones":[[170,387]],"par":1},
 {"n":"ボール＋かべ","hint":"","launch":{"x":35,"y":330,"a":75,"v":590},"dogs":[{"k":"coron","x":300,"y":370,"f":-1,"target":true}],"walls":[[0,352,70,352,6],[70,352,70,520,5],[260,370,360,370,6],[260,370,260,520,5],[165,520,165,380,5]],"items":{"ball":1},"bones":[[103,228]],"par":1},
 {"n":"いたと トランポリン","hint":"2しゅるいの どうぐ。どっちを使ってもいいよ","launch":{"x":325,"y":470,"a":135,"v":530},"dogs":[{"k":"moon","x":50,"y":520,"f":1,"target":true}],"walls":[[240,180,140,180,6]],"items":{"plank":1,"tramp":1},"bones":[[159,412]],"par":1},
 {"n":"いたと ボール","hint":"","launch":{"x":35,"y":310,"a":15,"v":480},"dogs":[{"k":"coron","x":290,"y":520,"f":-1,"target":true}],"walls":[[0,332,70,332,6],[70,332,70,520,5],[190,330,280,330,6]],"items":{"plank":1,"ball":1},"bones":[[151,338]],"par":1},
 {"n":"スポンジと トランポリン","hint":"","launch":{"x":35,"y":280,"a":45,"v":420},"dogs":[{"k":"moon","x":320,"y":520,"f":-1,"target":true}],"walls":[[0,302,70,302,6],[70,302,70,520,5],[100,170,210,170,6]],"items":{"sponge":1,"tramp":1},"bones":[[161,252]],"par":1},
 {"n":"いたと スポンジ","hint":"","launch":{"x":325,"y":340,"a":160,"v":490},"dogs":[{"k":"coron","x":45,"y":520,"f":1,"target":true}],"walls":[[360,362,290,362,6],[290,362,290,520,5],[155,520,155,360,5]],"items":{"plank":1,"sponge":1},"bones":[[129,375]],"par":1},
 {"n":"どれを つかう？","hint":"ぜんぶ使わなくてもOK","launch":{"x":325,"y":290,"a":150,"v":590},"dogs":[{"k":"moon","x":75,"y":520,"f":1,"target":true}],"walls":[[360,312,290,312,6],[290,312,290,520,5],[200,190,125,190,6]],"items":{"plank":2},"bones":[[267,306]],"par":1},
 {"n":"えらんで ためそう","hint":"","launch":{"x":35,"y":280,"a":40,"v":370},"dogs":[{"k":"coron","x":325,"y":280,"f":-1,"target":true}],"walls":[[0,302,70,302,6],[70,302,70,520,5],[260,280,360,280,6],[260,280,260,520,5],[100,140,210,140,6]],"items":{"plank":1,"tramp":1},"bones":[[229,238]],"par":1},
 {"n":"すきまを ねらえ","hint":"","launch":{"x":325,"y":470,"a":115,"v":560},"dogs":[{"k":"moon","x":65,"y":520,"f":1,"target":true}],"walls":[[225,210,160,210,6]],"items":{"plank":1,"ball":1},"bones":[[168,349]],"par":1},
 {"n":"はずむ ふたつ","hint":"","launch":{"x":35,"y":320,"a":70,"v":390},"dogs":[{"k":"coron","x":300,"y":520,"f":-1,"target":true}],"walls":[[0,342,70,342,6],[70,342,70,520,5],[215,520,215,340,5]],"items":{"tramp":1,"ball":1},"bones":[[167,235]],"par":1},
 {"n":"3つの どうぐ","hint":"目標の数より多く使ってもクリアはできるよ","launch":{"x":35,"y":470,"a":40,"v":600},"dogs":[{"k":"moon","x":275,"y":340,"f":-1,"target":true}],"walls":[[235,340,360,340,6],[235,340,235,520,5],[110,90,205,90,6]],"items":{"plank":2,"sponge":1},"bones":[[204,335]],"par":2},
 {"n":"かべの むこう","hint":"","launch":{"x":325,"y":470,"a":100,"v":620},"dogs":[{"k":"coron","x":70,"y":370,"f":1,"target":true}],"walls":[[120,370,0,370,6],[120,370,120,520,5],[160,520,160,330,5],[195,80,95,80,6]],"items":{"plank":1,"tramp":1,"ball":1},"bones":[[248,303]],"par":1},
 {"n":"ジグザグ","hint":"","launch":{"x":325,"y":290,"a":155,"v":380},"dogs":[{"k":"moon","x":35,"y":340,"f":1,"target":true}],"walls":[[360,312,290,312,6],[290,312,290,520,5],[100,340,0,340,6],[100,340,100,520,5],[225,520,225,290,5],[155,520,155,390,5]],"items":{"plank":2,"tramp":1},"bones":[[187,240]],"par":1},
 {"n":"ちょっと むずかしい","hint":"","launch":{"x":325,"y":300,"a":165,"v":370},"dogs":[{"k":"coron","x":45,"y":360,"f":1,"target":true}],"walls":[[360,322,290,322,6],[290,322,290,520,5],[110,360,0,360,6],[110,360,110,520,5],[200,210,140,210,6],[185,520,185,300,5]],"items":{"sponge":1,"ball":1,"plank":1},"bones":[[223,253]],"par":1},
 {"n":"ねらいどころ","hint":"","launch":{"x":325,"y":470,"a":110,"v":580},"dogs":[{"k":"moon","x":85,"y":380,"f":1,"target":true}],"walls":[[125,380,0,380,6],[125,380,125,520,5],[245,300,185,300,6],[235,90,165,90,6]],"items":{"plank":2,"ball":1},"bones":[[196,334]],"par":1},
 {"n":"いろいろ ためそう","hint":"","launch":{"x":325,"y":360,"a":100,"v":410},"dogs":[{"k":"coron","x":60,"y":290,"f":1,"target":true}],"walls":[[360,382,290,382,6],[290,382,290,520,5],[115,290,0,290,6],[115,290,115,520,5],[215,520,215,420,5],[210,520,210,330,5]],"items":{"plank":2,"tramp":1},"bones":[[220,315]],"par":1},
 {"n":"ぴったりの ばしょ","hint":"","launch":{"x":35,"y":470,"a":35,"v":580},"dogs":[{"k":"moon","x":310,"y":340,"f":-1,"target":true}],"walls":[[260,340,360,340,6],[260,340,260,520,5],[115,110,220,110,6],[130,270,220,270,6]],"items":{"plank":1,"sponge":1,"tramp":1},"bones":[[238,356]],"par":1},
 {"n":"2つを くみあわせ","hint":"","launch":{"x":35,"y":340,"a":45,"v":480},"dogs":[{"k":"coron","x":325,"y":280,"f":-1,"target":true}],"walls":[[0,362,70,362,6],[70,362,70,520,5],[250,280,360,280,6],[250,280,250,520,5],[185,330,250,330,6],[135,520,135,350,5]],"items":{"plank":2,"ball":1},"bones":[[232,229]],"par":2},
 {"n":"おしい！の さき","hint":"","launch":{"x":325,"y":470,"a":105,"v":550},"dogs":[{"k":"moon","x":70,"y":520,"f":1,"target":true}],"walls":[[190,520,190,330,5],[165,520,165,350,5]],"items":{"plank":2,"tramp":1,"ball":1},"bones":[[163,322]],"par":1},
 {"n":"さいごの ちょうせん","hint":"","launch":{"x":35,"y":470,"a":80,"v":540},"dogs":[{"k":"coron","x":285,"y":520,"f":-1,"target":true}],"walls":[[200,520,200,300,5],[190,520,190,370,5]],"items":{"plank":2,"sponge":1,"tramp":1,"ball":1},"bones":[[173,372]],"par":2},
 {"n":"ワープホール","hint":"うずまきに入ると、もうひとつのうずまきから出てくるよ","launch":{"x":35,"y":470,"a":40,"v":560},"dogs":[{"k":"moon","x":315,"y":520,"f":-1,"target":true}],"walls":[[170,520,170,-600,6]],"doors":[[120,380,265,250]],"items":{"plank":1},"bones":[[241,305]],"par":1},
 {"n":"ワープで ぴょーん","hint":"ワープから出たおやつは 入ったときと同じ向き・いきおいで出てくる","launch":{"x":35,"y":400,"a":80,"v":560},"dogs":[{"k":"coron","x":325,"y":360,"f":-1,"target":true}],"walls":[[160,520,160,-600,6],[0,422,70,422,6],[70,422,70,520,5],[245,360,360,360,6],[245,360,245,520,5]],"doors":[[105,240,320,110]],"items":{"tramp":1},"bones":[[118,178]],"par":1},
 {"n":"ワープの でぐち","hint":"","launch":{"x":35,"y":330,"a":70,"v":490},"dogs":[{"k":"moon","x":300,"y":330,"f":-1,"target":true}],"walls":[[195,520,195,-600,6],[0,352,70,352,6],[70,352,70,520,5],[255,330,360,330,6],[255,330,255,520,5]],"doors":[[90,300,260,220]],"items":{"plank":1},"bones":[[122,233]],"par":1},
 {"n":"ワープと スポンジ","hint":"","launch":{"x":35,"y":470,"a":25,"v":380},"dogs":[{"k":"coron","x":280,"y":520,"f":-1,"target":true}],"walls":[[160,520,160,-600,6]],"doors":[[75,460,220,210]],"items":{"sponge":1},"bones":[[261,238]],"par":1},
 {"n":"ワープと ボール","hint":"","launch":{"x":35,"y":300,"a":45,"v":440},"dogs":[{"k":"moon","x":290,"y":340,"f":-1,"target":true}],"walls":[[195,520,195,-600,6],[0,322,70,322,6],[70,322,70,520,5],[240,340,360,340,6],[240,340,240,520,5]],"doors":[[100,430,265,140]],"items":{"ball":1},"bones":[[211,211]],"par":1},
 {"n":"ワープ＋2つの どうぐ","hint":"","launch":{"x":325,"y":280,"a":125,"v":530},"dogs":[{"k":"coron","x":40,"y":400,"f":1,"target":true}],"walls":[[205,520,205,-600,6],[360,302,290,302,6],[290,302,290,520,5],[100,400,0,400,6],[100,400,100,520,5],[170,170,100,170,6]],"doors":[[260,220,135,240]],"items":{"plank":1,"tramp":1},"bones":[[123,283]],"par":1},
 {"n":"でぐちを ねらえ","hint":"","launch":{"x":325,"y":340,"a":125,"v":320},"dogs":[{"k":"moon","x":100,"y":520,"f":1,"target":true}],"walls":[[170,520,170,-600,6],[360,362,290,362,6],[290,362,290,520,5]],"doors":[[260,320,125,160]],"items":{"plank":1,"ball":1},"bones":[[134,200]],"par":1},
 {"n":"ワープの さき","hint":"","launch":{"x":325,"y":470,"a":110,"v":450},"dogs":[{"k":"coron","x":65,"y":520,"f":1,"target":true}],"walls":[[165,520,165,-600,6],[135,260,70,260,6]],"doors":[[215,370,105,200]],"items":{"plank":2,"sponge":1},"bones":[[128,234]],"par":1},
 {"n":"ワープ大作戦","hint":"","launch":{"x":35,"y":340,"a":30,"v":580},"dogs":[{"k":"moon","x":290,"y":400,"f":-1,"target":true}],"walls":[[170,520,170,-600,6],[0,362,70,362,6],[70,362,70,520,5],[235,400,360,400,6],[235,400,235,520,5],[130,520,130,340,5]],"doors":[[105,310,260,290]],"items":{"plank":1,"tramp":1,"ball":1},"bones":[[301,227]],"par":1},
 {"n":"ワープの さいごの ちょうせん","hint":"","launch":{"x":325,"y":470,"a":115,"v":560},"dogs":[{"k":"coron","x":50,"y":340,"f":1,"target":true}],"walls":[[165,520,165,-600,6],[125,340,0,340,6],[125,340,125,520,5],[300,520,300,430,5]],"doors":[[280,370,60,300]],"items":{"plank":2,"tramp":1,"ball":1},"bones":[[308,337]],"par":1}
];
// par（★3の目標アイテム数）はソルバーで確認した「ほねっこ込みの最少個数」
const ENG={W,H,FLOOR,R,DT,CATCH_V,REACH,inBite,ITEMS,DOG,STAGES,World,itemSeg,dogGeo};
if(typeof module!=='undefined')module.exports=ENG;else G0.ENG=ENG;
})(this);
