// Leo's Radio Explorer — Service Worker
// Strategy: cache-first for static assets (JS, CSS, fonts, images).
// Navigation requests (HTML) always go to the network so SSR works correctly.

const CACHE_NAME = 'leo-radio-v1'

const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|png|svg|jpg|jpeg|webp|ico|json)(\?.*)?$/

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Remove stale caches from previous versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Don't intercept cross-origin requests (radio streams, API calls)
  if (url.origin !== self.location.origin) return

  // Don't intercept Radio Browser API calls routed through the app server
  if (url.pathname.startsWith('/api/')) return

  // Cache static assets (cache-first, fallback to network + cache)
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        }),
      ),
    )
    return
  }

  // All other requests (navigation, SSR pages) → network only
  // This ensures the server always renders pages with fresh data.
})
