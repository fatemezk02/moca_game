const CACHE_NAME = 'tmoca-guide-audio-v2';

// Install event: activate worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: clean up any old audio caches (including v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('tmoca-guide-audio-') && cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting legacy audio cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event: Network-First with Cache fallback for /audio/ local guide files to prevent stale test audio
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle local guide audio files under /audio/
  if (url.origin === self.location.origin && url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback to cache if network is offline
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || Response.error();
        })
    );
  }
});
