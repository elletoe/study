// 화면 파일과 교과서 데이터만 저장해 두는 서비스 워커. 공부 기록은 페이지가 localStorage에 저장해요.
const CACHE = 'japanese-v1';
const SHELL = ['./', './index.html', './data.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('japanese-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장본 (교과서 데이터가 바뀌어도 바로 보이게)
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key, { ignoreSearch: true })));
});
