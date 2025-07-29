// Service Worker disabled to prevent CSP violations
// This file is kept for cleanup purposes

self.addEventListener('install', (event) => {
  console.log('Service Worker install event - skipping installation');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activate event - cleaning up');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Don't intercept any fetch requests
self.addEventListener('fetch', (event) => {
  // Let all requests pass through normally
  return;
});