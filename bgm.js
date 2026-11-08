// ホーム画面のBGMプレイヤー（オン/オフ・次の曲・ランダム/順番・ミュート）
(function(){
  const TT=["Sunny Paw Parade", "Biscuit Breeze", "Moonlight Ribbon", "Caramel Coin Rush", "Fluffy Tail Waltz", "Cocoa Arcade Lights", "Marshmallow Dreams", "Puppy Star Express", "Honey Bone Boogie", "Twin Paws Serenade", "Velvet Night Cruise", "Everyday Fantasy", "Cotton Cloud Holiday", "Starlit Treat Box", "Sweet Ending Lullaby"], N=TT.length, TITLE=i=>TT[i];
  const K='mc_bgm', ld=()=>{try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return {}}};
  const S=Object.assign({on:true,mute:false,shuffle:true,i:Math.floor(Math.random()*N),t:0},ld());
  const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
  const au=new Audio(); au.preload='none'; au.volume=1; const VOL=0.06; let AC=null;
  function graph(){ try{ if(!AC){ const C=window.AudioContext||window.webkitAudioContext; if(!C){ au.volume=VOL; return; } AC=new C(); const g=AC.createGain(); g.gain.value=VOL; AC.createMediaElementSource(au).connect(g); g.connect(AC.destination); } if(AC.state!=='running') AC.resume(); }catch(e){ au.volume=VOL; } } au.muted=S.mute;
  let started=false;
  const src=i=>'bgm/t'+String(i+1).padStart(2,'0')+'.mp3';
  function pick(){ if(S.shuffle){ let n; do{ n=Math.floor(Math.random()*N) }while(n===S.i&&N>1); return n; } return (S.i+1)%N; }
  function load(i,t){ S.i=i; au.src=src(i); if(t) au.addEventListener('loadedmetadata',()=>{ try{au.currentTime=Math.min(t,(au.duration||t)-1)}catch(e){} },{once:true}); save(); ui(); }
  function play(){ graph(); if(!au.src) load(S.i,S.t); const p=au.play(); if(p&&p.catch) p.catch(()=>{}); started=true; ui(); }
  function stop(){ au.pause(); ui(); }
  au.addEventListener('ended',()=>{ load(pick(),0); if(S.on) play(); });
  addEventListener('pagehide',()=>{ S.t=au.currentTime||0; save(); });
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){ S.t=au.currentTime||0; save(); au.pause(); } else if(S.on&&started) play(); });
  const first=()=>{ if(S.on&&!started) play(); };
  addEventListener('pointerdown',first,{once:true,capture:true}); addEventListener('keydown',first,{once:true,capture:true});

  const css=document.createElement('style'); css.textContent=`
#mcBgm{position:absolute;left:6px;top:2px;z-index:40;font-family:inherit;display:flex;align-items:center;gap:3px}
#mcSizeBtn{width:70px!important;height:24px!important;margin-top:3px!important;right:82px!important}
#hdrChip{width:70px!important;height:24px!important;margin-top:3px!important}
#mcBgm button{border:0;padding:0;background-color:transparent;background-position:center;background-size:contain;background-repeat:no-repeat;cursor:pointer;font-size:0;color:transparent}
#mcBgm button:active{transform:scale(.92)}
#bgMain{flex:0 0 auto;width:24px;height:24px;background-image:url(img/bg/natural_main.webp);filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}
#mcBgm .pn{display:none;flex-direction:row;align-items:center;gap:3px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}
#mcBgm.open .pn{display:flex}
#mcBgm .pb{position:relative;height:24px;width:auto;aspect-ratio:640/169;background:url(img/bg/natural_panel.webp) center/100% 100% no-repeat}
#mcBgm .ttl{position:absolute;left:24.5%;right:6.7%;top:31.4%;bottom:26.6%;display:flex;align-items:center;font-size:8.5px;font-weight:900;color:#5a3d2b;white-space:nowrap;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
#mcBgm .ttl i{display:inline-block;font-style:normal;padding-left:100%;animation:bgMq 9s linear infinite}
@keyframes bgMq{from{transform:translateX(0)}to{transform:translateX(-100%)}}
#bgPlay{position:absolute;left:4%;top:20%;height:62%;aspect-ratio:1}
#mcBgm .row{display:flex;align-items:center;gap:3px}
#bgNext,#bgMute,#bgPlay{width:auto}
#bgNext,#bgMute{width:22px;height:22px}
#bgMode{width:30px;height:21px;position:relative;background-size:auto 100%!important;background-position:left center!important;border-radius:10px 4px 4px 10px!important;overflow:hidden}
#bgMode b{display:none!important;position:absolute;left:44%;top:0;bottom:0;display:flex;align-items:center;font-size:9.5px;color:#5a3d2b;font-weight:900}
body[data-theme=retro] #mcBgm .pb{aspect-ratio:640/219}body[data-theme=retro] #mcBgm .ttl{left:24.1%;right:10.6%;top:50.2%;bottom:20.1%;color:#ffd36b;text-shadow:0 0 4px #ff9a3a}body[data-theme=retro] #bgPlay{left:8%;top:47%;height:38%}body[data-theme=retro] #bgMode b{color:#a01e14}
body[data-theme=neon] #mcBgm .pb{aspect-ratio:640/212}body[data-theme=neon] #mcBgm .ttl{left:24.2%;right:9.1%;top:42.5%;bottom:23.1%;color:#bff8ff;text-shadow:0 0 6px #3ff0ff}body[data-theme=neon] #bgPlay{left:6.2%;top:41%;height:42%}body[data-theme=neon] #bgMode b{color:#bff8ff;text-shadow:0 0 5px #3ff0ff}
@keyframes bgPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
#bgMain.playing{animation:bgPulse 1.2s infinite}
#mcBgm #bgMain{background-image:url(img/bg/natural_main.webp)}#mcBgm .pb{background-image:url(img/bg/natural_panel.webp)}#mcBgm #bgNext{background-image:url(img/bg/natural_next.webp)}#mcBgm #bgPlay{background-image:url(img/bg/natural_pause.webp)}#mcBgm #bgPlay.st{background-image:url(img/bg/natural_play.webp)}#mcBgm #bgMute{background-image:url(img/bg/natural_vol.webp)}#mcBgm #bgMute.st{background-image:url(img/bg/natural_mute.webp)}#mcBgm #bgMode{background-image:url(img/bg/natural_shuf.webp)}#mcBgm #bgMode.st{background-image:url(img/bg/natural_rep.webp)}
body[data-theme=retro] #mcBgm #bgMain{background-image:url(img/bg/retro_main.webp)}body[data-theme=retro] #mcBgm .pb{background-image:url(img/bg/retro_panel.webp)}body[data-theme=retro] #mcBgm #bgNext{background-image:url(img/bg/retro_next.webp)}body[data-theme=retro] #mcBgm #bgPlay{background-image:url(img/bg/retro_pause.webp)}body[data-theme=retro] #mcBgm #bgPlay.st{background-image:url(img/bg/retro_play.webp)}body[data-theme=retro] #mcBgm #bgMute{background-image:url(img/bg/retro_vol.webp)}body[data-theme=retro] #mcBgm #bgMute.st{background-image:url(img/bg/retro_mute.webp)}body[data-theme=retro] #mcBgm #bgMode{background-image:url(img/bg/retro_shuf.webp)}body[data-theme=retro] #mcBgm #bgMode.st{background-image:url(img/bg/retro_rep.webp)}
body[data-theme=neon] #mcBgm #bgMain{background-image:url(img/bg/neon_main.webp)}body[data-theme=neon] #mcBgm .pb{background-image:url(img/bg/neon_panel.webp)}body[data-theme=neon] #mcBgm #bgNext{background-image:url(img/bg/neon_next.webp)}body[data-theme=neon] #mcBgm #bgPlay{background-image:url(img/bg/neon_pause.webp)}body[data-theme=neon] #mcBgm #bgPlay.st{background-image:url(img/bg/neon_play.webp)}body[data-theme=neon] #mcBgm #bgMute{background-image:url(img/bg/neon_vol.webp)}body[data-theme=neon] #mcBgm #bgMute.st{background-image:url(img/bg/neon_mute.webp)}body[data-theme=neon] #mcBgm #bgMode{background-image:url(img/bg/neon_shuf.webp)}body[data-theme=neon] #mcBgm #bgMode.st{background-image:url(img/bg/neon_rep.webp)}
`;
  document.head.appendChild(css);
  const w=document.createElement('div'); w.id='mcBgm';
  w.innerHTML=`<button id="bgMain" aria-label="音楽"></button><div class="pn"><div class="pb"><button id="bgPlay" aria-label="再生/停止"></button><span class="ttl" id="bgTtl"></span></div><div class="row"><button id="bgNext" aria-label="次の曲"></button><button id="bgMode" aria-label="選曲"><b></b></button><button id="bgMute" aria-label="ミュート"></button></div></div>`;
  const mount=()=>{ document.body.appendChild(w); ui(); };
  if(document.body) mount(); else addEventListener('DOMContentLoaded',mount);
  function $(id){ return w.querySelector('#'+id); }
  function ui(){ if(!w.isConnected) return; const pl=!au.paused;
    $('bgMain').classList.toggle('playing',pl&&!S.mute);
    $('bgPlay').classList.toggle('st',!pl); $('bgMode').classList.toggle('st',!S.shuffle); $('bgMode').querySelector('b').textContent=S.shuffle?'ランダム':'順番';
    $('bgMute').classList.toggle('st',S.mute); if($('bgTtl').dataset.t!==TITLE(S.i)){ $('bgTtl').dataset.t=TITLE(S.i); $('bgTtl').innerHTML='<i>♪ '+TITLE(S.i)+'</i>'; } }
  au.addEventListener('play',ui); au.addEventListener('pause',ui);
  w.addEventListener('pointerdown',e=>e.stopPropagation());
  w.addEventListener('click',e=>{ e.stopPropagation(); const b=e.target.closest('button'); if(!b) return;
    if(b.id==='bgMain') w.classList.toggle('open');
    if(b.id==='bgPlay'){ if(au.paused){ S.on=true; play(); } else { S.on=false; stop(); } save(); }
    if(b.id==='bgNext'){ load(pick(),0); S.on=true; save(); play(); }
    if(b.id==='bgMode'){ S.shuffle=!S.shuffle; save(); ui(); }
    if(b.id==='bgMute'){ S.mute=!S.mute; au.muted=S.mute; save(); ui(); }
  });
  document.addEventListener('click',e=>{ if(!w.contains(e.target)) w.classList.remove('open'); });
})();
