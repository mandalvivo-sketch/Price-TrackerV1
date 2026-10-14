const CACHE_NAME = 'mobile-price-tracker-v5';
const APP_SHELL = [
  './',
  './index.html',
  './sold.html',
  './summary.html',
  './price-list.html',
  './accessory-price-list.html',
  './style.css',
  './sold.css',
  './summary.css',
  './price-list.css',
  './app.js',
  './sold.js',
  './summary.js',
  './price-list.js',
  './accessory-price-list.js',
  './supabase.js',
  './html5-qrcode.min.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache Supabase API calls: live database data must stay live.
  if (url.hostname.endsWith('.supabase.co') || url.pathname.includes('/rest/v1/')) {
    return;
  }

  // Cache-first for local app files. Network fallback keeps updates available.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => caches.match('./index.html')))
    );
  }
});
