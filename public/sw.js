const STATIC_CACHE_NAME = 'tmoca-static-v2';
const AUDIO_CACHE_NAME = 'tmoca-guide-audio-v3';
const CURRENT_CACHES = [STATIC_CACHE_NAME, AUDIO_CACHE_NAME];

// Install event: activate worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: clean up any legacy static, asset, or audio caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!CURRENT_CACHES.includes(cacheName)) {
              console.log('[SW] Deleting stale/legacy cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event: Network-First with Cache fallback for audio and static assets (guarantees fresh logo)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Local guide audio files under /audio/
  if (url.origin === self.location.origin && url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(AUDIO_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback to cache if network is offline
          const cache = await caches.open(AUDIO_CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || Response.error();
        })
    );
    return;
  }

  // 2. Static SVG logos and images (Network-First ensures current deployment logo is used)
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/login-logo.svg' ||
      url.pathname.endsWith('.svg') ||
      url.pathname.startsWith('/artwork/'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(STATIC_CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || Response.error();
        })
    );
    return;
  }
});

