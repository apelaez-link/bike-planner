const CACHE = 'bikeplanner-v4';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // GBFS feeds, geocoding: always network (real-time data)
  if (url.includes('/api/') || url.includes('nominatim') || url.includes('fonts.googleapis')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Tile images: network first, fall back to cache silently
  if (url.includes('cartocdn') || url.includes('tile')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // App shell: cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
