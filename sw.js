/* Offline-Speicher für das Mathe-Tagesblatt.
   Mit Internet wird immer die neueste Fassung geladen und für später gemerkt,
   ohne Internet kommt die zuletzt gemerkte Fassung aus dem Speicher. */
const CACHE = 'mathe-tagesblatt-v1';
const DATEIEN = [
  './',
  './index.html',
  './MatheTagesblatt.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', ereignis => {
  ereignis.waitUntil(caches.open(CACHE).then(cache => cache.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ereignis => {
  ereignis.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', ereignis => {
  const anfrage = ereignis.request;
  if (anfrage.method !== 'GET' || new URL(anfrage.url).origin !== self.location.origin) return;
  ereignis.respondWith(
    fetch(anfrage)
      .then(antwort => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(CACHE).then(cache => cache.put(anfrage, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(anfrage, { ignoreSearch: true })),
  );
});
