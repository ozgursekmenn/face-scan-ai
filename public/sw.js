const CACHE_NAME = 'facescan-ai-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/components/Dashboard.jsx',
  '/src/components/Scanner.jsx',
  '/src/components/Results.jsx'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Önbellek açıldı, dosyalar yükleniyor...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Bazı dosyalar önbelleğe alınamadı (geliştirme aşamasında normaldir):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eski Service Worker önbelleği siliniyor:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Önbellekte varsa döndür, yoksa ağdan çek
      return cachedResponse || fetch(event.request).catch(() => {
        // Çevrimdışı ve HTML isteği ise fallback olarak index'i döndür
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
