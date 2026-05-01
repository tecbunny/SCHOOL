const CACHE_NAME = 'eduportal-standalone-v1';
const OFFLINE_URLS = [
  '/',
  '/school',
  '/school/dashboard/student',
  '/embedded.css',
  '/manifest.json',
  '/favicon.ico'
];

const ASSET_EXTENSIONS = ['.js', '.css', '.svg', '.png', '.jpg', '.woff2', '.pdf'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  const isPdf = url.pathname.endsWith('.pdf');

  if (event.request.method !== 'GET') return;

  if (isPdf || ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then(fetchResponse => {
          if (!fetchResponse || fetchResponse.status !== 200) return fetchResponse;
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }).catch(err => {
           if (response) return response;
           throw err;
        });
        
        return response || fetchPromise;
      })
    );
    return;
  }

  // Stale-While-Revalidate for navigation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to student dashboard if completely offline
        return caches.match('/school/dashboard/student');
      });
      return cachedResponse || fetchPromise;
    })
  );
});
