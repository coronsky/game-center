const $=id=>document.getElementById(id);
const pick=a=>a[(Math.random()*a.length)|0];
const mkStore=pre=>({get(k,d){try{const v=localStorage.getItem(pre+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(pre+k,JSON.stringify(v))}catch(e){}}});
let ac=null; const SND={on:true};
function actx(){ if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}} if(ac&&ac.state==='suspended')ac.resume().catch(()=>{}); return ac }
function tone(f,t0,dur,type='sine',vol=.18,f2){ const a=actx(); if(!a||!SND.on) return;
  const o=a.createOscillator(),g=a.createGain(); o.type=type; const s=a.currentTime+t0; o.frequency.setValueAtTime(f,s); if(f2)o.frequency.exponentialRampToValueAtTime(f2,s+dur);
  g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(vol,s+.01); g.gain.exponentialRampToValueAtTime(.001,s+dur); o.connect(g).connect(a.destination); o.start(s); o.stop(s+dur+.02); }
function bark(p,t0=0){ const a=actx(); if(!a||!SND.on) return; const base=p===1?520:700;
  const o=a.createOscillator(),g=a.createGain(),fl=a.createBiquadFilter(); o.type='sawtooth'; fl.type='bandpass'; fl.frequency.value=base*1.6; fl.Q.value=2; const s=a.currentTime+t0;
  o.frequency.setValueAtTime(base,s); o.frequency.linearRampToValueAtTime(base*1.35,s+.04); o.frequency.exponentialRampToValueAtTime(base*.55,s+.16);
  g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.35,s+.015); g.gain.exponentialRampToValueAtTime(.001,s+.18); o.connect(fl).connect(g).connect(a.destination); o.start(s); o.stop(s+.2); }
const SFX={tap(){tone(700,0,.05,'sine',.08)},put(){tone(330,0,.09,'triangle',.25);tone(165,0,.06,'sine',.2)},
  win(){[523,659,784,1047].forEach((f,k)=>tone(f,k*.13,.25,'triangle',.2))},lose(){[392,349,311].forEach((f,k)=>tone(f,k*.18,.3,'triangle',.16))},
  ok(){[784,988].forEach((f,k)=>tone(f,k*.08,.14,'triangle',.15))},ng(){tone(220,0,.18,'triangle',.12)},alarm(){[880,660,880].forEach((f,k)=>tone(f,k*.12,.1,'square',.06))}};
const TALK={on:true}, bt={};
const PAT={1:['えへへ〜','もっとなでて！','くすぐったいワン','しっぽフリフリ','わんっ！'],2:['ふわふわでしょ♪','きもちいい〜','もっと〜','わふっ','おさんぽ行きたい！']};
function sayText(p,t,force){ if(!TALK.on&&!force) return; const key=p===1?'B':'W', el=$('bub'+key); el.textContent=t; el.classList.add('show');
  clearTimeout(bt[key]); bt[key]=setTimeout(()=>el.classList.remove('show'),1900); }
let _tt; function toast(t,red){const el=$('toast');el.textContent=t;el.classList.toggle('red',!!red);el.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('show'),1100)}
function burstAt(x,y,items=['🐾','✨'],n=8,dist=70){ for(let k=0;k<n;k++){const s=document.createElement('div');s.className='fx';s.textContent=items[k%items.length];
  s.style.left=(x-11)+'px';s.style.top=(y-11)+'px';const a=k/n*Math.PI*2;s.style.setProperty('--dx',Math.cos(a)*dist+'px');s.style.setProperty('--dy',Math.sin(a)*dist+'px');s.style.setProperty('--r',(Math.random()*90-45)+'deg');
  document.body.appendChild(s);setTimeout(()=>s.remove(),1400)} }
function burstEl(el,items,n){const r=el.getBoundingClientRect();burstAt(r.left+r.width/2,r.top+r.height/2,items,n)}
function confetti(items){ for(let k=0;k<26;k++){const s=document.createElement('div');s.className='fx';s.textContent=pick(items);s.style.left=(Math.random()*innerWidth)+'px';s.style.top='-30px';
  s.style.setProperty('--dx',(Math.random()*80-40)+'px');s.style.setProperty('--dy',(innerHeight*.6+Math.random()*200)+'px');s.style.setProperty('--r',(Math.random()*360)+'deg');
  s.style.animationDuration=(1.6+Math.random()*1.2)+'s';s.style.animationDelay=(Math.random()*.6)+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),3600)} }
function setStatus(t,think){$('statusTxt').textContent=t;$('status').classList.toggle('think',!!think)}
const openM=id=>$(id).classList.add('show'), closeM=id=>$(id).classList.remove('show');
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeM(b.dataset.close)));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
$('header').addEventListener('click',e=>{actx();const r=e.currentTarget.getBoundingClientRect(),p=(e.clientX-r.left)<r.width/2?1:2;sayText(p,pick(PAT[p]),true);bark(p);
  burstAt(e.clientX,e.clientY,['💕','💗','✨'],4,40)});
// settings helpers: seg & sw bound to object
function bindSettings(root,obj,onChange){
  const sync=()=>{root.querySelectorAll('.seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',String(obj[sg.dataset.k])===b.dataset.v)));
    root.querySelectorAll('.sw').forEach(sw=>sw.classList.toggle('on',!!obj[sw.dataset.k]))};
  root.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{obj[b.parentElement.dataset.k]=b.dataset.v;SFX.tap();sync();onChange&&onChange(b.parentElement.dataset.k)}));
  root.querySelectorAll('.sw').forEach(sw=>sw.addEventListener('click',()=>{obj[sw.dataset.k]=!obj[sw.dataset.k];SFX.tap();sync();onChange&&onChange(sw.dataset.k)}));
  return sync;
}
function showResult(o){ // o:{winner,title,score,msg,extra,rec}
  $('resTitle').textContent=o.title; $('resScore').textContent=o.score||''; $('resMsg').textContent=o.msg||''; $('resExtra').innerHTML=o.extra||''; $('resRec').textContent=o.rec||'';
  $('avB').className=o.winner===1?'win':(o.winner?'lose':''); $('avW').className=o.winner===2?'win':(o.winner?'lose':'');
  $('avB').querySelector('.crown').textContent=o.winner===1?'👑':''; $('avW').querySelector('.crown').textContent=o.winner===2?'👑':'';
  try{window.soloAvatar&&window.soloAvatar(o)}catch(e){}
  setTimeout(()=>openM('mRes'),o.delay??900);
}


