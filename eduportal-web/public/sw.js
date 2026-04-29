const CACHE_NAME = 'eduportal-standalone-v1';
const OFFLINE_URLS = [
  '/',
  '/school',
  '/school/dashboard/student',
  '/embedded.css',
  '/manifest.json',
  '/favicon.ico'
];

const ASSET_EXTENSIONS = ['.js', '.css', '.svg', '.png', '.jpg', '.woff2'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache-First for static assets
  if (ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate for navigation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Fallback to student dashboard if completely offline
        return caches.match('/school/dashboard/student');
      });
      return cachedResponse || fetchPromise;
    })
  );
});
