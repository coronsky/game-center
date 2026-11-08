// ホーム画面のBGMプレイヤー（オン/オフ・次の曲・ランダム/順番・ミュート）
(function(){
  const N=15, TITLE=i=>i<11?`Coron & Moon ${i+1}`:`Every Day's a Fantasy ${i-10}`;
  const K='mc_bgm', ld=()=>{try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return {}}};
  const S=Object.assign({on:true,mute:false,shuffle:true,i:Math.floor(Math.random()*N),t:0},ld());
  const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
  const au=new Audio(); au.preload='none'; au.volume=0.35; au.muted=S.mute;
  let started=false;
  const src=i=>'bgm/t'+String(i+1).padStart(2,'0')+'.mp3';
  function pick(){ if(S.shuffle){ let n; do{ n=Math.floor(Math.random()*N) }while(n===S.i&&N>1); return n; } return (S.i+1)%N; }
  function load(i,t){ S.i=i; au.src=src(i); if(t) au.addEventListener('loadedmetadata',()=>{ try{au.currentTime=Math.min(t,(au.duration||t)-1)}catch(e){} },{once:true}); save(); ui(); }
  function play(){ if(!au.src) load(S.i,S.t); const p=au.play(); if(p&&p.catch) p.catch(()=>{}); started=true; ui(); }
  function stop(){ au.pause(); ui(); }
  au.addEventListener('ended',()=>{ load(pick(),0); if(S.on) play(); });
  addEventListener('pagehide',()=>{ S.t=au.currentTime||0; save(); });
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){ S.t=au.currentTime||0; save(); au.pause(); } else if(S.on&&started) play(); });
  const first=()=>{ if(S.on&&!started) play(); };
  addEventListener('pointerdown',first,{once:true,capture:true}); addEventListener('keydown',first,{once:true,capture:true});

  const css=document.createElement('style'); css.textContent=`
#mcBgm{position:absolute;left:8px;top:4px;z-index:40;display:flex;align-items:center;gap:4px;font-family:inherit}
#mcBgm button{width:34px;height:34px;border-radius:50%;border:2px solid #e2b06e;background:#fffaf1;color:#5a3d2b;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.25);cursor:pointer;padding:0}
#mcBgm button:active{transform:scale(.92)}
#mcBgm .pn{display:none;align-items:center;gap:4px;background:rgba(255,250,240,.95);border:2px solid #e2b06e;border-radius:999px;padding:3px 10px 3px 4px;box-shadow:0 2px 8px rgba(0,0,0,.25)}
#mcBgm.open .pn{display:flex}
#mcBgm .pn button{width:32px;height:32px;font-size:15px;box-shadow:none}
#mcBgm .pn button.sm{width:auto;border-radius:999px;padding:0 9px;font-size:11px;font-weight:900}
#mcBgm .ttl{max-width:84px;font-size:11px;font-weight:900;color:#5a3d2b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mcBgm #bgMain.on{background:#ffe7a8}
body[data-theme=retro] #mcBgm button,body[data-theme=retro] #mcBgm .pn{background:#3a1a0e;border-color:#f2b134;color:#ffe9b8}body[data-theme=retro] #mcBgm .ttl{color:#ffe9b8}body[data-theme=retro] #mcBgm #bgMain.on{background:#7a2a10}
body[data-theme=neon] #mcBgm button,body[data-theme=neon] #mcBgm .pn{background:#1a1050;border-color:#ff4fd8;color:#fff;box-shadow:0 0 8px rgba(255,79,216,.5)}body[data-theme=neon] #mcBgm .ttl{color:#bff8ff}body[data-theme=neon] #mcBgm #bgMain.on{background:#3a1a8a}
@keyframes bgPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
#mcBgm #bgMain.playing span{display:inline-block;animation:bgPulse 1s infinite}`;
  document.head.appendChild(css);
  const w=document.createElement('div'); w.id='mcBgm';
  w.innerHTML=`<button id="bgMain" aria-label="音楽"><span>🎵</span></button><div class="pn"><button id="bgPlay" aria-label="再生/停止">⏸</button><button id="bgNext" aria-label="次の曲">⏭</button><button id="bgMode" class="sm"></button><button id="bgMute" aria-label="ミュート">🔊</button><span class="ttl" id="bgTtl"></span></div>`;
  const mount=()=>{ document.body.appendChild(w); ui(); };
  if(document.body) mount(); else addEventListener('DOMContentLoaded',mount);
  function $(id){ return w.querySelector('#'+id); }
  function ui(){ if(!w.isConnected) return; const pl=!au.paused;
    $('bgMain').classList.toggle('on',S.on); $('bgMain').classList.toggle('playing',pl&&!S.mute);
    $('bgMain').querySelector('span').textContent=S.mute?'🔇':'🎵';
    $('bgPlay').textContent=pl?'⏸':'▶'; $('bgMode').textContent=S.shuffle?'🔀 ランダム':'🔁 順番';
    $('bgMute').textContent=S.mute?'🔇':'🔊'; $('bgTtl').textContent=TITLE(S.i); }
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
