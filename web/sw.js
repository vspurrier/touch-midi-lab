const CACHE_NAME='touch-midi-lab-v21';
const APP_SHELL=['./','./index.html','./style.css?v=2','./app.js?v=26','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const request=event.request;const fresh=request.mode==='navigate'||/\.(js|css|json)$/.test(new URL(request.url).pathname);event.respondWith((fresh?fetch(request,{cache:'no-store'}):caches.match(request).then(cached=>cached||fetch(request))).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));return response}).catch(()=>caches.match(request)))})
