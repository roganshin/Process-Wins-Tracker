// 오늘의 점수판 — service worker
// 앱 셸을 캐시해서 오프라인에서도 켜지게 한다. 버전 올리면 캐시 갱신됨.
const CACHE = 'jumsupan-v5';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: stale-while-revalidate (한 번 받으면 오프라인에서도 폰트 유지)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => { cache.put(req, res.clone()); return res; })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // HTML 문서/내비게이션: 네트워크 우선 (최신 코드를 항상 받음, 오프라인이면 캐시)
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // 그 외 정적 자원(아이콘 등): 캐시 우선, 없으면 네트워크
  e.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).catch(() => caches.match('./index.html'))
    )
  );
});
