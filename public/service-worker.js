// service-worker.js

const CACHE_NAME = 'school-app-cache-v1';

// Static assets to cache (HTML, CSS, JS)
const STATIC_FILES = [
  '/',
  '/app.js',
  '/style.css',
  // Add other static assets if needed
];

// Policy PDFs to pre-cache (fetched from backend APIs)
async function getAllPolicyPDFs() {
  const urls = [];

  try {
    const studentRes = await fetch('/api/policies/student');
    if (studentRes.ok) {
      const studentPolicies = await studentRes.json();
      studentPolicies.forEach(p => urls.push(`/api/pdfs/${p.filename}`));
    }

    const staffRes = await fetch('/api/policies/staff');
    if (staffRes.ok) {
      const staffPolicies = await staffRes.json();
      staffPolicies.forEach(p => urls.push(`/api/pdfs/${p.filename}`));
    }
  } catch (err) {
    console.error('Failed to fetch policy PDFs for caching', err);
  }

  return urls;
}

// Install event: cache static assets + policy PDFs
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const policyPDFs = await getAllPolicyPDFs();
      await cache.addAll([...STATIC_FILES, ...policyPDFs]);
    })()
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve cached files, leave dynamic APIs alone
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Only intercept static files and PDFs
  if (
    request.url.endsWith('.js') ||
    request.url.endsWith('.css') ||
    request.url.endsWith('.html') ||
    request.url.includes('/api/pdfs/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(resp => {
          caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
          return resp;
        }).catch(() => {
          if (request.url.includes('/api/pdfs/')) {
            return new Response('PDF not available offline', { status: 503 });
          }
        });
      })
    );
  }
  // Dynamic APIs (/api/report/:id, /api/menu/:role, /api/login) go straight to network
});
