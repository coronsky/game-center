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
    document.body.style.zoom=s;
    var b=document.getElementById('mcSizeBtn'); if(b) b.innerHTML='<b>'+lv.n+'</b>';
  }
  function btn(){
    if(document.getElementById('mcSizeBtn')) return;
    var st=document.createElement('style');
    st.textContent='#mcSizeBtn{position:absolute;right:98px;top:6px;z-index:31;width:84px;height:30px;border:0;padding:0;background:url('+BASE+'img/ui/natural_zoom.webp) center/contain no-repeat;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));cursor:pointer;font-size:0}#mcSizeBtn b{position:absolute;right:-4px;top:-6px;width:20px;height:20px;border-radius:50%;background:#f2b134;color:#5a2a00;border:2px solid #fff;font:900 11px/16px sans-serif;text-align:center}#mcSizeBtn:active{transform:scale(.92)}'+['natural','retro','neon'].map(function(t){return 'body[data-vt='+t+'] #mcSizeBtn,body[data-theme='+t+'] #mcSizeBtn{background-image:url('+BASE+'img/ui/zoom_'+t+'.webp)}'}).join('')+'body[data-vt=retro] #mcSizeBtn,body[data-theme=retro] #mcSizeBtn{background-image:url('+BASE+'img/ui/retro_zoom.webp)}body[data-vt=neon] #mcSizeBtn,body[data-theme=neon] #mcSizeBtn{background-image:url('+BASE+'img/ui/neon_zoom.webp)}#mcSizeTip{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:46;background:rgba(0,0,0,.7);color:#fff;font:900 18px sans-serif;padding:10px 22px;border-radius:20px;pointer-events:none;opacity:0;transition:opacity .2s}#mcSizeTip.on{opacity:1}';
    document.head.appendChild(st);
    var b=document.createElement('button'); b.id='mcSizeBtn'; b.type='button'; b.setAttribute('aria-label','文字と画面の大きさ');
    var tip=document.createElement('div'); tip.id='mcSizeTip';
    b.onclick=function(e){ e.stopPropagation(); var i=0; for(var k=0;k<LV.length;k++) if(LV[k].k===get()) i=k;
      var nx=LV[(i+1)%LV.length]; set(nx.k); fit(); tip.textContent='サイズ：'+nx.n; tip.classList.add('on'); clearTimeout(tip._t); tip._t=setTimeout(function(){tip.classList.remove('on')},900); };
    var hero=document.querySelector('.hero'); if(hero) b.style.top='-37px'; var host=hero||document.querySelector('.app')||document.body; host.appendChild(b); document.body.appendChild(tip);
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
    var t=e.target.closest&&e.target.closest('#homeBtn,#bHome'); if(!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var hb=document.getElementById('homeBtn'); var url=(hb&&hb.href)||'../';
    ask(function(){ location.href=url; });
  },true);
})();
