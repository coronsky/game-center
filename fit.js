// 画面サイズに合わせた拡大＋サイズ切り替えボタン（小・中・大）
(function(){
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/fit\.js.*$/,'');
  var LV=[{k:'s',n:'小',m:.85},{k:'m',n:'中',m:1},{k:'l',n:'大',m:1.2}];
  function get(){ try{ return localStorage.getItem('mc_size')||'m'; }catch(e){ return 'm'; } }
  function set(v){ try{ localStorage.setItem('mc_size',v); }catch(e){} }
  function fit(){
    var w=innerWidth,h=innerHeight,s=1;
    if(w>=700){ s=Math.min(w/500,h/820); s=Math.max(1,Math.min(s,1.9)); }
    var lv=LV.filter(function(x){return x.k===get()})[0]||LV[1];
    s=s*lv.m;
    if(w<700) s=Math.min(s,w/340);       // スマホでは幅がくずれない範囲まで
    s=Math.max(.7,Math.min(s,2.4));
    document.body.style.zoom=s; document.documentElement.style.setProperty('--mcz',s);
    var b=document.getElementById('mcSizeBtn'); if(b) b.innerHTML='<b>'+lv.n+'</b>';
  }
  function btn(){
    if(document.getElementById('mcSizeBtn')) return;
    var st=document.createElement('style');
    st.textContent='.modal .card{max-height:calc(92vh / var(--mcz,1))!important;max-height:calc(92dvh / var(--mcz,1))!important}#mcSizeBtn{position:absolute;right:104px;top:6px;z-index:31;width:90px;height:30px;border:0;padding:0;background:url('+BASE+'img/ui/natural_zoom.webp?v=2) center/contain no-repeat;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25));cursor:pointer;font-size:0}#mcSizeBtn b{position:absolute;right:-3px;top:-5px;width:16px;height:16px;border-radius:50%;background:#f2b134;color:#5a2a00;border:1.5px solid #fff;font:900 9px/13px sans-serif;text-align:center}#mcSizeBtn:active{transform:scale(.92)}'+'body[data-vt=retro] #mcSizeBtn,body[data-theme=retro] #mcSizeBtn{background-image:url('+BASE+'img/ui/retro_zoom.webp?v=2)}body[data-vt=neon] #mcSizeBtn,body[data-theme=neon] #mcSizeBtn{background-image:url('+BASE+'img/ui/neon_zoom.webp?v=2)}#mcSizeTip{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:46;background:rgba(0,0,0,.7);color:#fff;font:900 18px sans-serif;padding:10px 22px;border-radius:20px;pointer-events:none;opacity:0;transition:opacity .2s}#mcSizeTip.on{opacity:1}';
    document.head.appendChild(st);
    var b=document.createElement('button'); b.id='mcSizeBtn'; b.type='button'; b.setAttribute('aria-label','文字と画面の大きさ');
    var tip=document.createElement('div'); tip.id='mcSizeTip';
    b.onclick=function(e){ e.stopPropagation(); var i=0; for(var k=0;k<LV.length;k++) if(LV[k].k===get()) i=k;
      var nx=LV[(i+1)%LV.length]; set(nx.k); fit(); tip.textContent='サイズ：'+nx.n; tip.classList.add('on'); clearTimeout(tip._t); tip._t=setTimeout(function(){tip.classList.remove('on')},900); };
    var hero=document.querySelector('.hero'); if(hero) b.style.top='-36px'; var host=hero||document.querySelector('.app')||document.body; host.appendChild(b); document.body.appendChild(tip);
  }
  function init(){ btn(); fit(); }
  addEventListener('resize',fit); addEventListener('orientationchange',fit);
  if(document.body) init(); else addEventListener('DOMContentLoaded',init);
})();
// ホームへ戻る前の確認
(function(){
  function ask(go){
    var m=document.getElementById('mcHomeAsk');
    if(!m){ m=document.createElement('div'); m.id='mcHomeAsk';
      m.innerHTML='<div class="hk"><div class="hq">🏠 ホームに戻りますか？</div><div class="hs">遊んでいる途中のゲームは<br>はじめからになります</div><div class="hb"><button id="mcHkNo">つづける</button><button id="mcHkYes">ホームへ</button></div></div>';
      var st=document.createElement('style');
      st.textContent='#mcHomeAsk{position:fixed;inset:0;z-index:999;background:rgba(40,25,15,.5);display:none;align-items:center;justify-content:center;padding:20px}#mcHomeAsk.on{display:flex}#mcHomeAsk .hk{background:#fbf6ec;border:3px solid #e6d2b2;border-radius:22px;padding:18px 16px;width:100%;max-width:320px;text-align:center;font-family:"Zen Maru Gothic",sans-serif;color:#5a3d2b;box-shadow:0 10px 30px rgba(0,0,0,.3)}#mcHomeAsk .hq{font-weight:900;font-size:18px}#mcHomeAsk .hs{font-size:13px;margin:8px 0 14px;opacity:.8}#mcHomeAsk .hb{display:grid;grid-template-columns:1fr 1fr;gap:10px}#mcHomeAsk button{border:2px solid #e2cfb2;border-radius:18px;padding:11px 0;font:900 15px "Zen Maru Gothic",sans-serif;background:#fffaf1;color:#5a3d2b;cursor:pointer}#mcHomeAsk #mcHkYes{background:linear-gradient(#6c8a60,#4a6342);color:#fff;border-color:transparent}'+
      'body[data-vt=retro] #mcHomeAsk .hk{background:#2a1208;border-color:#f2b134;color:#fbe9c8}body[data-vt=retro] #mcHomeAsk button{background:#3a160a;color:#ffd36b;border-color:#a8651e}body[data-vt=retro] #mcHomeAsk #mcHkYes{background:linear-gradient(#d0452f,#8f2a1f);border-color:#f2b134;color:#ffe7b0}'+
      'body[data-vt=neon] #mcHomeAsk .hk{background:#0f0830;border:2px solid #ff4fd8;color:#fff;box-shadow:0 0 20px #ff4fd8}body[data-vt=neon] #mcHomeAsk button{background:rgba(20,8,55,.9);color:#fff;border-color:#5a3bb0}body[data-vt=neon] #mcHomeAsk #mcHkYes{border-color:#3ff0ff;box-shadow:0 0 10px #3ff0ff}';
      document.head.appendChild(st); document.body.appendChild(m);
      m.addEventListener('click',function(e){ if(e.target===m) m.classList.remove('on'); });
      document.getElementById('mcHkNo').onclick=function(){ m.classList.remove('on'); };
    }
    document.getElementById('mcHkYes').onclick=function(){ m.classList.remove('on'); go(); };
    m.classList.add('on');
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('#homeBtn,#bHome,#bHome2'); if(!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var hb=document.getElementById('homeBtn'); var url=(hb&&hb.href)||'../';
    ask(function(){ location.href=url; });
  },true);
})();
// スキン切り替えのお知らせ看板（ホーム・ゲーム共通）
(function(){
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/fit\.js.*$/,'');
  var NM={natural:'ナチュラル',retro:'レトロ',neon:'サイバーネオン'};
  function th(){ var b=document.body; return b&&(b.dataset.theme||b.dataset.vt)||''; }
  function init(){
    var st=document.createElement('style'); st.textContent=
    '#mcSkinPop{position:fixed;left:50%;top:40%;z-index:2147482000;width:min(80vw,330px);aspect-ratio:720/225;transform:translate(-50%,-50%) scale(.4);opacity:0;pointer-events:none;background:center/100% 100% no-repeat;transition:transform .32s cubic-bezier(.2,1.6,.4,1),opacity .2s;filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))}'+
    '#mcSkinPop.on{transform:translate(-50%,-50%) scale(1);opacity:1}'+
    '#mcSkinPop .ic{position:absolute;left:-7%;top:50%;height:100%;aspect-ratio:1;transform:translateY(-50%) rotate(-8deg);background:center/contain no-repeat}'+
    '#mcSkinPop b{position:absolute;left:20%;right:6%;top:0;bottom:0;display:flex;align-items:center;justify-content:center;font:900 22px/1 "Zen Maru Gothic","Hiragino Maru Gothic ProN",sans-serif;letter-spacing:.06em;white-space:nowrap}'+
    '#mcSkinPop i{position:absolute;width:15%;aspect-ratio:1;background:center/contain no-repeat;opacity:0;transform:scale(.3)}'+
    '#mcSkinPop.on i{animation:mcSpD .9s ease-out forwards}'+
    '#mcSkinPop i:nth-of-type(1){right:-4%;top:-26%;animation-delay:.12s!important}#mcSkinPop i:nth-of-type(2){right:20%;bottom:-30%;animation-delay:.22s!important}#mcSkinPop i:nth-of-type(3){left:34%;top:-30%;animation-delay:.3s!important}'+
    '@keyframes mcSpD{0%{opacity:0;transform:scale(.3) rotate(-20deg)}50%{opacity:1;transform:scale(1.15) rotate(8deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'+
    '#mcSkinPop.natural b{color:#5a3d2b;text-shadow:0 1px 0 #fff8e6}#mcSkinPop.retro b{color:#8a1e12;text-shadow:0 1px 0 #ffe9b8}#mcSkinPop.neon b{color:#fff;text-shadow:0 0 8px #ff4fd8,0 0 14px #3ff0ff}';
    document.head.appendChild(st);
    var p=document.createElement('div'); p.id='mcSkinPop'; p.innerHTML='<span class="ic"></span><b></b><i></i><i></i><i></i>'; document.body.appendChild(p);
    var last=th(), t=null;
    function show(v){ if(!NM[v]) return; var U=BASE+'img/sp/'+v+'_';
      p.className=v; p.style.backgroundImage='url('+U+'plate.webp)'; p.querySelector('.ic').style.backgroundImage='url('+U+'icon.webp)';
      p.querySelector('b').textContent=NM[v]; var d=p.querySelectorAll('i'); for(var k=0;k<3;k++) d[k].style.backgroundImage='url('+U+'d'+k+'.webp)';
      void p.offsetWidth; p.classList.add('on'); clearTimeout(t); t=setTimeout(function(){ p.classList.remove('on'); },1300); }
    new MutationObserver(function(){ var v=th(); if(v&&v!==last){ last=v; show(v); } }).observe(document.body,{attributes:true,attributeFilter:['data-theme','data-vt']});
    ['natural','retro','neon'].forEach(function(v){ var im=new Image(); im.src=BASE+'img/sp/'+v+'_plate.webp'; });
    window.mcSkinPop=show;
  }
  if(document.body) init(); else addEventListener('DOMContentLoaded',init);
})();
