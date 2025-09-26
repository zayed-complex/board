// service-worker.js

const CACHE_NAME = 'my-app-cache-v2';

// List of static assets to cache
const FILES_TO_CACHE = [
  '/',
  '/app.js',
  '/style.css',
  // Add other static assets here
];

// List of PDFs to pre-cache (from your menus)
const PDF_FILES_TO_CACHE = [
  '/api/pdfs/cycle2.pdf',
  '/api/pdfs/cycle3.pdf',
  '/api/pdfs/timings.pdf',
  '/api/pdfs/teachers.pdf',
  '/api/pdfs/duties.pdf'
];

// Install event: cache static assets + PDFs
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing and caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...FILES_TO_CACHE, ...PDF_FILES_TO_CACHE]);
    })
  );
  self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve cached files first
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Serve PDF requests or any cached requests
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      // Fetch from network if not in cache
      return fetch(request).then((response) => {
        // Optionally cache newly fetched PDFs
        if (request.url.includes('/api/pdfs/')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Fallback for offline PDFs
        if (request.url.includes('/api/pdfs/')) {
          return new Response('PDF not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
      });
    })
  );
});
