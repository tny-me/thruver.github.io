var CACHE = 'thruver-v3';
var ASSETS = ['/', '/index.html', '/tecnico.html', '/manifest-tecnico.json', '/shared.css'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SHOW_NOTIF') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: '/Favicon.png',
      badge: '/Favicon.png',
      tag: e.data.tag || 'orden',
      vibrate: [200, 100, 200],
      requireInteraction: true
    });
  }
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow('/tecnico.html'));
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  var url = e.request.url;
  var isPage = url.endsWith('.html') || url.endsWith('/') || url === self.location.origin;
  var isAsset = url.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/);

  if (isAsset) {
    // Cache-first para imágenes y fuentes
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request).then(function(res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
          }
          return res;
        });
      })
    );
  } else {
    // Network-first para HTML, CSS, JS — siempre intenta la red primero
    e.respondWith(
      fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
  }
});
