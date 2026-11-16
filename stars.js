/* 星アイコン共通化：画面上の ★ / ☆ の文字を、スキンごとの星アイコン画像に置きかえる */
(function(){
  var base=new URL('img/ui/',document.currentScript.src).href;
  var st=document.createElement('style');
  st.textContent='.gcs{display:inline-block;width:1.2em;height:1.2em;vertical-align:-.22em;background:center/contain no-repeat;margin:0 .03em;font-style:normal;flex:none}'
   +['natural:n','retro:r','neon:x'].map(function(p){var a=p.split(':');return 'body[data-vt='+a[0]+'] .gcs.on{background-image:url('+base+'star_'+a[1]+'.webp)}body[data-vt='+a[0]+'] .gcs.off{background-image:url('+base+'star_'+a[1]+'0.webp)}';}).join('')
   +'body:not([data-vt]) .gcs.on{background-image:url('+base+'star_n.webp)}body:not([data-vt]) .gcs.off{background-image:url('+base+'star_n0.webp)}';
  document.head.appendChild(st);
  var HAS=/[★☆]/, SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,TITLE:1,NOSCRIPT:1};
  function conv(tn){
    var t=tn.nodeValue; if(!HAS.test(t)) return;
    var p=tn.parentNode; if(!p||SKIP[p.nodeName]) return;
    var f=document.createDocumentFragment(), last=0, re=/[★☆]/g, m;
    while((m=re.exec(t))){
      if(m.index>last) f.appendChild(document.createTextNode(t.slice(last,m.index)));
      var i=document.createElement('i'); i.className='gcs '+(m[0]==='★'?'on':'off'); i.setAttribute('role','img'); i.setAttribute('aria-label',m[0]==='★'?'星':'からの星');
      f.appendChild(i); last=m.index+1;
    }
    if(last<t.length) f.appendChild(document.createTextNode(t.slice(last)));
    p.replaceChild(f,tn);
  }
  function scan(root){
    if(root.nodeType===3){ conv(root); return; }
    if(root.nodeType!==1||SKIP[root.nodeName]) return;
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null), n, list=[];
    while((n=w.nextNode())) if(HAS.test(n.nodeValue)) list.push(n);
    list.forEach(conv);
  }
  function start(){
    scan(document.body);
    new MutationObserver(function(ms){
      for(var k=0;k<ms.length;k++){ var m=ms[k];
        if(m.type==='characterData'){ conv(m.target); }
        else for(var j=0;j<m.addedNodes.length;j++) scan(m.addedNodes[j]);
      }
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
})();
