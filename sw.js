// オフライン対応（ページは最新を優先、画像などはキャッシュを優先）
const V='gc-v7';
const CORE=['./','index.html','coins.js','backup.js','manifest.webmanifest','icons/icon-192.png',
 ...['reversi','shogi','wanko','gomoku','memory','escape','rings','peg','slide','hanoi'].map(g=>g+'/')];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const isPage=r.mode==='navigate'||(r.headers.get('accept')||'').includes('text/html');
  if(isPage||/\.js$/.test(new URL(r.url).pathname)){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r,{ignoreSearch:true})));
  } else {
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));} return res; })));
  }
});
