/* AI 모델·라이브러리·글꼴은 한 번 받으면 폰에 저장해 두고, 페이지는 늘 새 버전을 먼저 받아요 */
const CACHE = "studycam-v2";
const LONG = ["cdn.jsdelivr.net", "storage.googleapis.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(LONG.includes(url.hostname)){
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      if(hit) return hit;
      const res = await fetch(req);
      if(res.ok) c.put(req, res.clone());
      return res;
    }));
  }else if(url.origin === location.origin){
    e.respondWith(fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req)));
  }
});
