// Bump V whenever index.html changes so phones pick up the new version.
const V='ecf-v2',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const good=res=>res&&(res.ok||res.type==='opaque');   // never cache an error page (e.g. a 404 after the site is unpublished)
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;           // uploads to the Google Form are never intercepted
  const u=new URL(r.url);
  if(r.mode==='navigate'){                                // open instantly from cache, refresh in the background
    e.respondWith(caches.match('index.html').then(hit=>{
      const net=fetch(r).then(res=>{if(good(res)){const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp))}return hit||res}).catch(()=>hit);
      e.waitUntil(net.catch(()=>{}));return hit||net}));return}
  if(u.origin===location.origin||u.hostname==='cdn.jsdelivr.net'){   // app files and the fallback decoder
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(good(res)){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})))}
});
