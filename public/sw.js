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
  // Skip caching for external analytics/tracking requests
  if (event.request.url.includes('googletagmanager.com') || 
      event.request.url.includes('google-analytics.com') ||
      event.request.url.includes('supabase.co')) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request).catch(error => {
          console.log('Fetch failed for:', event.request.url, error)
          // Return a basic response for failed requests
          return new Response('Service Unavailable', { status: 503 })
        })
      })
  )
})