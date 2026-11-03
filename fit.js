// 画面サイズに合わせた拡大＋サイズ切り替えボタン（小・中・大）
(function(){
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
    var b=document.getElementById('mcSizeBtn'); if(b) b.innerHTML='🔍<b>'+lv.n+'</b>';
  }
  function btn(){
    if(document.getElementById('mcSizeBtn')) return;
    var st=document.createElement('style');
    st.textContent='#mcSizeBtn{position:absolute;right:96px;top:8px;z-index:31;display:flex;align-items:center;gap:2px;border:2px solid rgba(255,255,255,.8);border-radius:18px;padding:5px 10px;font:900 13px/1.2 "Zen Maru Gothic",sans-serif;color:#fff;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer}#mcSizeBtn b{font-size:12px}#mcSizeBtn:active{transform:scale(.92)}#mcSizeTip{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:46;background:rgba(0,0,0,.7);color:#fff;font:900 18px sans-serif;padding:10px 22px;border-radius:20px;pointer-events:none;opacity:0;transition:opacity .2s}#mcSizeTip.on{opacity:1}';
    document.head.appendChild(st);
    var b=document.createElement('button'); b.id='mcSizeBtn'; b.type='button'; b.setAttribute('aria-label','文字と画面の大きさ');
    var tip=document.createElement('div'); tip.id='mcSizeTip';
    b.onclick=function(e){ e.stopPropagation(); var i=0; for(var k=0;k<LV.length;k++) if(LV[k].k===get()) i=k;
      var nx=LV[(i+1)%LV.length]; set(nx.k); fit(); tip.textContent='サイズ：'+nx.n; tip.classList.add('on'); clearTimeout(tip._t); tip._t=setTimeout(function(){tip.classList.remove('on')},900); };
    var host=document.querySelector('.hero')||document.querySelector('.app')||document.body; host.appendChild(b); document.body.appendChild(tip);
  }
  function init(){ btn(); fit(); }
  addEventListener('resize',fit); addEventListener('orientationchange',fit);
  if(document.body) init(); else addEventListener('DOMContentLoaded',init);
})();
