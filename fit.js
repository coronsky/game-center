// 画面サイズに合わせた拡大＋サイズ切り替えボタン（小・中・大）
(function(){
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/fit\.js.*$/,'');
  var LV=[{k:'s',n:'小',m:.85},{k:'m',n:'中',m:1},{k:'l',n:'大',m:1.2}];
  function get(){ try{ return localStorage.getItem('mc_size')||'m'; }catch(e){ return 'm'; } }
  function set(v){ try{ localStorage.setItem('mc_size',v); }catch(e){} }
  // ズームなし(1倍)での中身の高さ。iPadなど大きい画面で1画面に収めるための基準
  function natH(){
    var b=document.body,z=b.style.zoom,mh=b.style.minHeight;
    b.style.zoom=1; b.style.minHeight='0';
    var m=0,sy=window.pageYOffset||0;
    [].forEach.call(b.children,function(el){
      var cs=getComputedStyle(el);
      if(cs.position==='fixed'||cs.position==='absolute'||cs.display==='none'||/^(SCRIPT|STYLE|LINK)$/.test(el.tagName)) return;
      var r=el.getBoundingClientRect(); if(r.height>0) m=Math.max(m,r.bottom+sy);
    });
    m+=parseFloat(getComputedStyle(b).paddingBottom)||0;
    b.style.zoom=z; b.style.minHeight=mh;
    return m;
  }
  function fit(){
    var w=innerWidth,h=innerHeight,s=1;
    if(w>=700){
      var nh=document.querySelector('.hero')?0:natH();
      s=Math.min(w/500,h/(nh>300?nh:820)); s=Math.max(nh>300?.6:1,Math.min(s,1.9));
    }
    var lv=LV.filter(function(x){return x.k===get()})[0]||LV[1];
    s=s*lv.m;
    if(w<700) s=Math.min(s,w/340);       // スマホでは幅がくずれない範囲まで
    s=Math.max(.6,Math.min(s,2.4));
    document.body.style.zoom=s; if(innerWidth>=700) document.body.style.minHeight=(innerHeight/s)+'px'; document.documentElement.style.setProperty('--mcz',s);
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
  function init(){ btn(); fit(); setTimeout(fit,700); addEventListener('load',function(){setTimeout(fit,300)}); }
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
    '#mcSkinPop.retro b{left:23%;right:10%;transform:translateY(8%)}#mcSkinPop.neon b{left:24%;right:3%;transform:translateY(11.5%)}'+
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
// パズルの盤面をさわっている間は、画面がスクロールしないようにする
(function(){
  var SEL='#bd,#board,#kb,#stage,#cv,#grid,#gb,#gw,#scene,#pb,#rg,#tb,#sb,#eq,#fd';
  function init(){
    if(/\/(osanpo|ponpon|reversi|gomoku|shogi|tsume|chess|crossword|lights|logic|match|sudoku|shanghai|slide|mines|escroom|hanoi|memory|peg|rings|solitaire|wanko|backgammon)\//.test(location.pathname)) return;
    var st=document.createElement('style'); st.textContent=SEL.split(',').map(function(s){return s+','+s+' *'}).join(',')+'{touch-action:none!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}';
    document.head.appendChild(st);
    var on=false;
    document.addEventListener('touchstart',function(e){ on=!!(e.target.closest&&e.target.closest(SEL)); },{passive:true,capture:true});
    document.addEventListener('touchmove',function(e){ if(on&&e.cancelable) e.preventDefault(); },{passive:false,capture:true});
    document.addEventListener('touchend',function(){ on=false; },{passive:true,capture:true});
  }
  if(document.body) init(); else addEventListener('DOMContentLoaded',init);
})();
// 共通ボタンの絵文字を、スキンごとのイラストに差し替える
(function(){
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/fit\.js.*$/,'');
  // [名前, ナチュラル専用か]
  var MAP={'🏠':['home',0],'❓':['help',0],'💡':['hint',0],'⟳':['reset',0],'🔁':['reset',0],'🔄':['reset',0],
           '🎨':['skin',1],'⚙':['gear',1],'↩':['undo',1],'⚡':['first',1],'🐢':['second',1],'🗺':['map',1],'🎮':['menu',1],'🎲':['random',1]};
  var RE=/^\s*(🏠|❓|💡|⟳|🔁|🔄|🎨|⚙|↩|⚡|🐢|🗺|🎮|🎲)[\uFE0E\uFE0F]?\s*/;
  var SEL='button,.btn,a.btn';
  function css(){
    var t='.mcIco{display:inline-block;width:1.35em;height:1.35em;vertical-align:-.32em;margin-right:.18em;background-position:center;background-size:contain;background-repeat:no-repeat;flex:none}';
    ['home','help','hint','reset'].forEach(function(k){ ['natural','retro','neon'].forEach(function(s){
      t+=(s==='natural'?'.mcIco[data-k='+k+'],':'')+'body[data-vt='+s+'] .mcIco[data-k='+k+']{background-image:url('+BASE+'img/ico/'+s+'_'+k+'.webp)}';
    }); });
    // 絵があるスキンだけイラスト、無いスキンは元の絵文字を表示
    var HAS={skin:['natural','retro','neon'],gear:['natural','retro','neon'],undo:['natural','retro','neon'],first:['natural','retro','neon'],second:['natural','retro','neon'],map:['natural','retro','neon'],menu:['natural','retro','neon'],random:['natural','retro','neon']};
    Object.keys(HAS).forEach(function(k){ ['natural','retro','neon'].forEach(function(s){
      var q=(s==='natural'?'':'body[data-vt='+s+'] ')+'.mcIco[data-k='+k+']';
      if(HAS[k].indexOf(s)>=0) t+=q+'{background-image:url('+BASE+'img/ico/'+s+'_'+k+'.webp);width:1.35em;height:1.35em;vertical-align:-.32em}'+q+'::before{content:none}';
      else t+=q+'{background:none;width:auto;height:auto;vertical-align:baseline}'+q+'::before{content:attr(data-e)}';
    }); });
    var st=document.createElement('style'); st.textContent=t; document.head.appendChild(st);
  }
  function apply(el){
    var n=el.firstChild; if(!n||n.nodeType!==3) return;
    var m=RE.exec(n.nodeValue); if(!m) return;
    var d=MAP[m[1]]; if(!d) return;
    var i=document.createElement('i'); i.className='mcIco'; i.setAttribute('data-k',d[0]);
    if(d[1]){ i.setAttribute('data-n','1'); i.setAttribute('data-e',m[1]); }
    n.nodeValue=n.nodeValue.slice(m[0].length);
    el.insertBefore(i,n);
  }
  var busy=false;
  function scan(){ busy=false; var l=document.querySelectorAll(SEL); for(var k=0;k<l.length;k++) apply(l[k]); }
  function later(){ if(!busy){ busy=true; (window.requestAnimationFrame||setTimeout)(scan); } }
  function init(){
    css(); scan();
    new MutationObserver(later).observe(document.body,{childList:true,characterData:true,subtree:true});
  }
  if(document.readyState==='loading') addEventListener('DOMContentLoaded',init); else init();
})();

// 🔒 の文字を、スキンごとのイラストに差し替える
(function(){
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/fit\.js.*$/,'');
  var G={'🔒':'lock'}, RE=/🔒/, SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,OPTION:1,TITLE:1,CANVAS:1,NOSCRIPT:1,INPUT:1};
  function css(){
    var t='.mcGl{display:inline-block;width:1em;height:1em;vertical-align:-.14em;background-position:center;background-size:contain;background-repeat:no-repeat;flex:none}';
    ['lock'].forEach(function(k){ ['natural','retro','neon'].forEach(function(s){
      t+=(s==='natural'?'.mcGl[data-k='+k+'],':'')+'body[data-vt='+s+'] .mcGl[data-k='+k+']{background-image:url('+BASE+'img/ico/'+s+'_'+k+'.webp)}';
    }); });
    var st=document.createElement('style'); st.textContent=t; document.head.appendChild(st);
  }
  function conv(n){
    var p=n.parentNode; if(!p||SKIP[p.nodeName]||!RE.test(n.nodeValue)) return;
    var f=document.createDocumentFragment(), v=n.nodeValue, buf='';
    for(var i=0;i<v.length;i++){
      var c=v[i]; if(c==='\uD83D'&&v[i+1]==='\uDD12'){c='🔒'; i++;}
      if(G[c]){ if(buf){ f.appendChild(document.createTextNode(buf)); buf=''; }
        var e=document.createElement('i'); e.className='mcGl'; e.setAttribute('data-k',G[c]); f.appendChild(e);
        if(v[i+1]==='\uFE0F'||v[i+1]==='\uFE0E') i++;
      } else buf+=c;
    }
    if(buf) f.appendChild(document.createTextNode(buf));
    p.replaceChild(f,n);
  }
  function walk(r){
    if(r.nodeType===3){ conv(r); return; }
    if(r.nodeType!==1||SKIP[r.nodeName]) return;
    var w=document.createTreeWalker(r,4,null,false), a=[], x; while((x=w.nextNode())) if(RE.test(x.nodeValue)&&!SKIP[x.parentNode.nodeName]) a.push(x);
    for(var i=0;i<a.length;i++) conv(a[i]);
  }
  var q=[], busy=false;
  function flush(){ busy=false; var l=q; q=[]; for(var i=0;i<l.length;i++) if(l[i].parentNode||l[i]===document.body) walk(l[i]); }
  function init(){
    css(); walk(document.body);
    new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){ var m=ms[i];
        if(m.type==='characterData') q.push(m.target); else for(var j=0;j<m.addedNodes.length;j++) q.push(m.addedNodes[j]); }
      if(q.length&&!busy){ busy=true; (window.requestAnimationFrame||setTimeout)(flush); }
    }).observe(document.body,{childList:true,characterData:true,subtree:true});
  }
  if(document.readyState==='loading') addEventListener('DOMContentLoaded',init); else init();
})();

/* ステージ選択タイルの共通デザイン（ナチュラル）：枠画像＋番号＋星 */
(function(){
  var b=new URL('img/natural/',document.currentScript.src).href;
  var st=document.createElement('style');
  st.textContent='body[data-vt=natural] :is(.qg,.stGrid){gap:8px}'
   +'body[data-vt=natural] :is(.qg,.stGrid) button{aspect-ratio:1/1;border:0!important;border-radius:0!important;padding:0!important;gap:0!important;flex-direction:column;align-items:center;justify-content:center;color:#6b3f17!important;font-size:clamp(14px,4.6vw,19px)!important;font-weight:900;line-height:1.1;background:url('+b+'stg_frame.webp?v=2) center/100% 100% no-repeat!important;box-shadow:none}'
   +'body[data-vt=natural] :is(.qg,.stGrid) button:is(.ok,.done){background-image:url('+b+'stg_frame_clear.webp?v=5)!important;color:#6b3f17!important}'
   +'body[data-vt=natural] :is(.qg,.stGrid) button:is(.lk,.lock){opacity:.55;filter:grayscale(.6)}'
   +'body[data-vt=natural] :is(.qg,.stGrid) button.cur{box-shadow:0 0 0 3px #f0b429!important;border-radius:16px!important}'
   +'body[data-vt=natural] :is(.qg,.stGrid) button small{display:none;font-size:0;line-height:0;margin-top:1px}body[data-vt=natural] :is(.qg,.stGrid) button small:has(.gcs){display:block}'
   +'body[data-vt=natural] :is(.qg,.stGrid) button .gcs{width:15px;height:15px;margin:0 0}';
  document.head.appendChild(st);
})();

/* ステージ選択タイル（レトロ） */
(function(){
  var b=new URL('img/retro/',document.currentScript.src).href;
  var st=document.createElement('style');
  st.textContent='body[data-vt=retro] :is(.qg,.stGrid){gap:8px}'
   +'body[data-vt=retro] :is(.qg,.stGrid) button{aspect-ratio:1/1;border:0!important;border-radius:0!important;padding:0!important;gap:0!important;flex-direction:column;align-items:center;justify-content:center;color:#ffe7b0!important;text-shadow:0 1px 2px rgba(0,0,0,.7);font-size:clamp(14px,4.6vw,19px)!important;font-weight:900;line-height:1.1;background:url('+b+'stg_frame.webp?v=2) center/100% 100% no-repeat!important;box-shadow:none}'
   +'body[data-vt=retro] :is(.qg,.stGrid) button:is(.ok,.done){background-image:url('+b+'stg_frame_clear.webp?v=5)!important;color:#fff!important}'
   +'body[data-vt=retro] :is(.qg,.stGrid) button:is(.lk,.lock){opacity:.55;filter:grayscale(.5)}'
   +'body[data-vt=retro] :is(.qg,.stGrid) button.cur{box-shadow:0 0 0 3px #fff3a0,0 0 10px #ffd36b!important;border-radius:16px!important}'
   +'body[data-vt=retro] :is(.qg,.stGrid) button small{display:none;font-size:0;line-height:0;margin-top:1px}body[data-vt=retro] :is(.qg,.stGrid) button small:has(.gcs){display:block}'
   +'body[data-vt=retro] :is(.qg,.stGrid) button .gcs{width:15px;height:15px;margin:0 0}';
  document.head.appendChild(st);
})();

/* ステージ選択タイル（ネオン） */
(function(){
  var b=new URL('img/neon/',document.currentScript.src).href;
  var st=document.createElement('style');
  st.textContent='body[data-vt=neon] :is(.qg,.stGrid){gap:8px}'
   +'body[data-vt=neon] :is(.qg,.stGrid) button{aspect-ratio:1/1;border:0!important;border-radius:0!important;padding:0!important;gap:0!important;flex-direction:column;align-items:center;justify-content:center;color:#bff8ff!important;text-shadow:0 0 6px #19e6ff;font-size:clamp(14px,4.6vw,19px)!important;font-weight:900;line-height:1.1;background:url('+b+'stg_frame.webp?v=2) center/100% 100% no-repeat!important;box-shadow:none}'
   +'body[data-vt=neon] :is(.qg,.stGrid) button:is(.ok,.done){background-image:url('+b+'stg_frame_clear.webp?v=5)!important;color:#fff!important}'
   +'body[data-vt=neon] :is(.qg,.stGrid) button:is(.lk,.lock){opacity:.55;filter:grayscale(.5)}'
   +'body[data-vt=neon] :is(.qg,.stGrid) button.cur{box-shadow:0 0 0 3px #fff,0 0 12px #19e6ff!important;border-radius:16px!important}'
   +'body[data-vt=neon] :is(.qg,.stGrid) button small{display:none;font-size:0;line-height:0;margin-top:1px}body[data-vt=neon] :is(.qg,.stGrid) button small:has(.gcs){display:block}'
   +'body[data-vt=neon] :is(.qg,.stGrid) button .gcs{width:15px;height:15px;margin:0 0}';
  document.head.appendChild(st);
})();

/* ステージ選択タイル（#mStage .stb：ペグ・ハノイ・脱出・リング・スライド 共通） */
(function(){
  var r=new URL('img/',document.currentScript.src).href;
  var S={natural:{c:'#6b3f17',ok:'#6b3f17',sh:'none',cur:'0 0 0 3px #f0b429',su:'n'},
         retro:{c:'#ffe7b0',ok:'#fff',sh:'0 1px 2px rgba(0,0,0,.7)',cur:'0 0 0 3px #fff3a0,0 0 10px #ffd36b',su:'r'},
         neon:{c:'#bff8ff',ok:'#fff',sh:'0 0 6px #19e6ff',cur:'0 0 0 3px #fff,0 0 12px #19e6ff',su:'x'}};
  var css='';
  Object.keys(S).forEach(function(k){
    var s=S[k],p='body[data-vt='+k+'] #mStage .stb',f=r+k+'/stg_frame.webp?v=2',fc=r+k+'/stg_frame_clear.webp?v=5';
    css+=p+'{aspect-ratio:1/1;border:0!important;border-radius:0!important;box-shadow:none;padding:6% 5%!important;gap:1px!important;justify-content:center;opacity:1;overflow:visible;isolation:auto;color:'+s.c+'!important;text-shadow:'+s.sh+';background:url('+f+') center/100% 100% no-repeat!important}'
     +p+':has(.sr i.on){background-image:url('+fc+')!important;color:'+s.ok+'!important}'
     +p+'.lock,'+p+'.lk{opacity:.55;filter:grayscale(.5)}'
     +p+'.cur{border-radius:16px!important;box-shadow:'+s.cur+'!important;background-image:url('+f+')!important}'
     +p+'.cur:has(.sr i.on){background-image:url('+fc+')!important}'
     +p+'.cur::before{display:none!important}'
     +p+' .no{width:auto!important;height:auto!important;aspect-ratio:auto!important;min-width:0;padding:0!important;background:none!important;border-radius:0;color:inherit!important;font-size:clamp(15px,5vw,20px)!important;font-weight:900;line-height:1.1}'
     +p+' b{color:inherit!important;font-size:10.5px!important;line-height:1.15;font-weight:700}'
     +p+' small{display:none!important}'
     +p+' .sr{display:flex;justify-content:center;gap:2px;width:100%;margin-top:1px}'
     +p+' .sr i{font-size:0!important;width:19%!important;aspect-ratio:1;background:url('+r+'ui/star_'+s.su+'0.webp?v=2) center/contain no-repeat!important}'
     +p+' .sr i.on{background-image:url('+r+'ui/star_'+s.su+'.webp?v=2)!important}'
     +p+' .sr i .gcs{display:none!important}';
  });
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();


(function(){var st=document.createElement('style');st.textContent=':is(.qg,.stGrid) button small:has(.gcs){opacity:1!important}';document.head.appendChild(st);})();
/* ステージ一覧（リバーシ：button.stg 行形式） */
(function(){
  var r=new URL('img/',document.currentScript.src).href;
  var S={natural:{c:'#6b3f17',ok:'#6b3f17',su:'n'},retro:{c:'#ffe7b0',ok:'#fff',su:'r'},neon:{c:'#bff8ff',ok:'#fff',su:'x'}};
  var css='';
  Object.keys(S).forEach(function(k){
    var s=S[k],p='body[data-vt='+k+'] button.stg';
    css+=p+' .no{width:46px!important;height:46px!important;border-radius:0!important;background:url('+r+k+'/stg_frame.webp?v=2) center/100% 100% no-repeat!important;color:'+s.c+'!important;font-size:18px;font-weight:900;text-shadow:none}'
     +p+':has(.sr i.on) .no{background-image:url('+r+k+'/stg_frame_clear.webp?v=5)!important;color:'+s.ok+'!important}'
     +p+'.lock .no{opacity:.6;filter:grayscale(.5)}'
     +p+' .sr{display:flex;gap:2px;flex:none}'
     +p+' .sr i{font-size:0!important;width:22px;height:22px;background:url('+r+'ui/star_'+s.su+'0.webp?v=2) center/contain no-repeat!important}'
     +p+' .sr i.on{background-image:url('+r+'ui/star_'+s.su+'.webp?v=3)!important}'
     +p+' .sr i .gcs{display:none!important}';
  });
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
/* ステージ選択グリッド（ブロック・まちがい・数独・マイン・ソリティア：#selGrid / #selG） */
(function(){
  var r=new URL('img/',document.currentScript.src).href;
  var S={natural:{c:'#6b3f17',cur:'0 0 0 3px #f0b429'},retro:{c:'#ffe7b0',cur:'0 0 0 3px #fff3a0,0 0 10px #ffd36b'},neon:{c:'#bff8ff',cur:'0 0 0 3px #fff,0 0 12px #19e6ff'}};
  var css='';
  Object.keys(S).forEach(function(k){
    var s=S[k],p='body[data-vt='+k+'] :is(.selGridB,.selG,.selGrid) button',f=r+k+'/stg_frame.webp?v=2',fc=r+k+'/stg_frame_clear.webp?v=5';
    css+=p+'{aspect-ratio:1/1;height:auto;border:0!important;border-radius:0!important;padding:0!important;gap:0!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;font-size:clamp(14px,4.6vw,19px)!important;font-weight:900;line-height:1.1;color:'+s.c+'!important;text-shadow:none;box-shadow:none!important;opacity:1;background:url('+f+') center/100% 100% no-repeat!important}'
     +p+':has(.gcs.on){background-image:url('+fc+')!important}'
     +p+'.lk{opacity:.55;filter:grayscale(.5)}'
     +p+'.on{border-radius:16px!important;box-shadow:'+s.cur+'!important}'
     +p+' > :is(small,i,em):not(.gcs){display:none!important}'
     +p+' > :is(small,i,em):not(.gcs):has(.gcs){display:block!important;opacity:1;font-size:0;line-height:0;margin-top:1px}'
     +p+' .gcs{width:15px;height:15px;margin:0}';
  });
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
/* ステージ選択タイル（ドキドキ鬼ごっこ：.tile） */
(function(){
  var r=new URL('img/',document.currentScript.src).href;
  var S={natural:{c:'#6b3f17',cur:'0 0 0 3px #f0b429'},retro:{c:'#ffe7b0',cur:'0 0 0 3px #fff3a0,0 0 10px #ffd36b'},neon:{c:'#bff8ff',cur:'0 0 0 3px #fff,0 0 12px #19e6ff'}};
  var css='';
  Object.keys(S).forEach(function(k){
    var s=S[k],p='html body[data-vt='+k+'] #selG .tile',f=r+k+'/stg_frame.webp?v=2',fc=r+k+'/stg_frame_clear.webp?v=5';
    css+=p+'{padding:0!important;background:url('+f+') center/100% 100% no-repeat!important;color:'+s.c+'!important;font-size:clamp(14px,4.6vw,19px)!important;text-shadow:none;box-shadow:none}'
     +p+':is(.ck,.pf){background-image:url('+fc+')!important}'
     +p+'.lk{opacity:.55;filter:grayscale(.5);font-size:0!important}'+p+'.lk::after{content:"🔒";font-size:18px}'
     +p+'.cur{border-radius:16px;box-shadow:'+s.cur+'}'
     +p+' .ts{font-size:0;line-height:0;margin-top:1px;color:inherit;text-shadow:none}'
     +p+' .gcs{width:15px;height:15px;margin:0}';
  });
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
