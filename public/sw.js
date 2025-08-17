
const CACHE = 'sherdor-cache-v1';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
