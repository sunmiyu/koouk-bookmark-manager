const CACHE_NAME = 'koouk-v2'
const urlsToCache = [
  '/',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache existing resources
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response)
              }
            }).catch(error => {
              console.log('Failed to cache:', url, error)
            })
          })
        )
      })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})