const CACHE_NAME = 'shizibao-v2';
const URLS = [
  './',
  './index.html',
  './chars.js',
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 不拦截 TTS 音频请求
  let url = e.request.url;
  if (url.includes('dict.youdao.com') || url.includes('fanyi.baidu.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      let fetched = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
