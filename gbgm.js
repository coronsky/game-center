// ゲーム用BGM：ホームと同じ15曲をランダムで流す（オン/オフはホームと共通）
(function(){
  var N=15,K='mc_bgm',VOL=0.06;
  function ld(){try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return {}}}
  function sv(p){try{var o=ld();for(var k in p)o[k]=p[k];localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
  var S=ld(); var on=S.on!==false, mute=!!S.mute;
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/gbgm\.js.*$/,'');
  var au=new Audio(),AC=null,started=false,cur=-1;
  au.preload='none'; au.muted=mute;
  function rnd(){var n;do{n=Math.floor(Math.random()*N)}while(n===cur&&N>1);return n}
  function load(){cur=rnd();au.src=BASE+'bgm/t'+String(cur+1).padStart(2,'0')+'.mp3'}
  function graph(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C){au.volume=VOL;return}AC=new C();var g=AC.createGain();g.gain.value=VOL;AC.createMediaElementSource(au).connect(g);g.connect(AC.destination)}if(AC.state!=='running')AC.resume()}catch(e){au.volume=VOL}}
  function play(){graph();if(!au.src)load();var p=au.play();if(p&&p.catch)p.catch(function(){});started=true}
  au.addEventListener('ended',function(){load();if(on&&!mute)play()});
  document.addEventListener('visibilitychange',function(){if(document.hidden)au.pause();else if(on&&started)play()});
  function first(){if(on&&!started)play()}
  addEventListener('pointerdown',first,{once:true,capture:true});addEventListener('keydown',first,{once:true,capture:true});
  function vt(){return document.body.dataset.vt||'natural'}
  function init(){
    var host=document.querySelector('.app')||document.body, b=document.createElement('button'); b.id='gBgm'; b.setAttribute('aria-label','BGM');
    var st=document.createElement('style');
    st.textContent='#gBgm{position:absolute;top:8px;right:104px;z-index:31;width:26px;height:26px;border:0;padding:0;background:center/contain no-repeat;cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))}#gBgm:active{transform:scale(.9)}';
    document.head.appendChild(st); host.appendChild(b);
    function ui(){var off=!on||mute;b.style.backgroundImage='url('+BASE+'img/bg/'+vt()+'_'+(off?'mute':'vol')+'.webp)'}
    ui(); new MutationObserver(ui).observe(document.body,{attributes:true,attributeFilter:['data-vt']});
    b.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();
      if(on&&!mute){on=false;au.pause()}else{on=true;mute=false;au.muted=false;started=true;play()}
      sv({on:on,mute:mute});ui()});
    ['touchstart','pointerdown','mousedown'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation()})});
  }
  if(document.body)init();else addEventListener('DOMContentLoaded',init);
})();
