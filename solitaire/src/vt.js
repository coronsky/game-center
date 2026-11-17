;(function(){var h=document.getElementById('header');['homeBtn','vtBtn'].forEach(function(id){var b=document.getElementById(id);if(b){b.addEventListener('click',function(e){e.stopPropagation()})}})})();

(()=>{const VTS=['natural','retro','neon'],VTN={natural:'ナチュラル',retro:'レトロ',neon:'サイバーネオン'};
const st={get(){try{return localStorage.getItem('mc_vt')}catch(e){return null}},set(v){try{localStorage.setItem('mc_vt',v)}catch(e){}}};
function setVT(v,show){ if(!VTS.includes(v)) v='natural'; document.body.dataset.vt=v; st.set(v);
  const h=document.getElementById('homeBtn'); if(h) h.href='../#'+v;
  try{ if(location.hash.slice(1)!==v) history.replaceState(null,'','#'+v); }catch(e){}
   }
const hv=(location.hash||'').slice(1); setVT(VTS.includes(hv)?hv:st.get());
addEventListener('hashchange',()=>{const h=location.hash.slice(1); if(VTS.includes(h)&&h!==document.body.dataset.vt) setVT(h);});
document.getElementById('vtBtn').addEventListener('click',e=>{e.stopPropagation(); try{actx();SFX.tap()}catch(_){} setVT(VTS[(VTS.indexOf(document.body.dataset.vt)+1)%3],true);});
})();

