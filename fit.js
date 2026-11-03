// iPad・パソコンで画面に合わせて拡大（スマホ幅では等倍）
(function(){
  function fit(){
    var w=innerWidth,h=innerHeight,s=1;
    if(w>=700){ s=Math.min(w/500,h/820); s=Math.max(1,Math.min(s,1.9)); }
    try{ var o=localStorage.getItem('mc_zoom'); if(o) s=s*parseFloat(o); }catch(e){}
    document.body.style.zoom=s;
  }
  addEventListener('resize',fit); addEventListener('orientationchange',fit);
  if(document.body) fit(); else addEventListener('DOMContentLoaded',fit);
})();
