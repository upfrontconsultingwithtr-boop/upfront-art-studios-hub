const CACHE='upfront-hub-private-v1';
const PREFIX='upfront-hub-';
const ASSETS=['./','./index.html','./command-hub.html','./hub.webmanifest','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 // The hub worker is registered at / but must not intercept the studio's /studio/ routes.
 if(url.pathname.includes('/studio/'))return;
 event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return response;}).catch(()=>caches.match(req).then(hit=>hit||(req.mode==='navigate'?caches.match(url.pathname.endsWith('/command-hub.html')?'./command-hub.html':'./index.html'):Response.error()))));
});
