// 外部ゲーム用：ホームへ戻るボタン（確認つき）
(function(){
  var POS=(document.currentScript&&document.currentScript.dataset.pos)||'top';
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/home\.js.*$/,'');
  function vt(){ try{ return localStorage.getItem('mc_vt')||'natural'; }catch(e){ return 'natural'; } }
  function init(){
    var b=document.createElement('a'); b.id='mcHome'; b.href=BASE+'#'+vt(); b.setAttribute('aria-label','ホーム');
    var st=document.createElement('style');
    st.textContent='#mcHome{position:fixed;left:max(8px,env(safe-area-inset-left));'+(POS==='bottom'?'bottom:max(10px,env(safe-area-inset-bottom))':'top:max(6px,env(safe-area-inset-top))')+';z-index:2147483000;width:72px;height:24px;background:url('+BASE+'img/ui/'+vt()+'_home.webp?v=2) center/contain no-repeat;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3));opacity:.92}#mcHome:active{transform:scale(.92)}'+
    '#mcHomeAsk{position:fixed;inset:0;z-index:2147483001;background:rgba(40,25,15,.5);display:none;align-items:center;justify-content:center;padding:20px}#mcHomeAsk.on{display:flex}#mcHomeAsk .hk{background:#fbf6ec;border:3px solid #e6d2b2;border-radius:22px;padding:18px 16px;width:100%;max-width:320px;text-align:center;font-family:sans-serif;color:#5a3d2b}#mcHomeAsk .hq{font-weight:900;font-size:18px}#mcHomeAsk .hs{font-size:13px;margin:8px 0 14px;opacity:.8}#mcHomeAsk .hb{display:grid;grid-template-columns:1fr 1fr;gap:10px}#mcHomeAsk button{border:2px solid #e2cfb2;border-radius:18px;padding:11px 0;font-weight:900;font-size:15px;background:#fffaf1;color:#5a3d2b}#mcHomeAsk #mcHkYes{background:#4a6342;color:#fff;border-color:transparent}';
    document.head.appendChild(st); document.body.appendChild(b);
    var m=document.createElement('div'); m.id='mcHomeAsk'; m.innerHTML='<div class="hk"><div class="hq">🏠 ホームに戻りますか？</div><div class="hs">遊んでいる途中のゲームは<br>はじめからになります</div><div class="hb"><button id="mcHkNo">つづける</button><button id="mcHkYes">ホームへ</button></div></div>';
    document.body.appendChild(m);
    b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); m.classList.add('on'); },true);
    ['touchstart','pointerdown','mousedown'].forEach(function(ev){ b.addEventListener(ev,function(e){e.stopPropagation()},true); });
    m.querySelector('#mcHkNo').onclick=function(){ m.classList.remove('on'); };
    m.querySelector('#mcHkYes').onclick=function(){ location.href=b.href; };
  }
  if(document.body) init(); else addEventListener('DOMContentLoaded',init);
})();
