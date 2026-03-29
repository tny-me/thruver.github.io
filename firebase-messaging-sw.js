importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCJlo2i_MsotnrCJ9VnnXsZidGKospvw2k",
  authDomain: "thruver-3de75.firebaseapp.com",
  projectId: "thruver-3de75",
  storageBucket: "thruver-3de75.firebasestorage.app",
  messagingSenderId: "31613785682",
  appId: "1:31613785682:web:10158e532742050689318b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const n = payload.notification || {};
  return self.registration.showNotification(n.title || '¡Nueva orden!', {
    body: n.body || '',
    icon: '/Favicon.png',
    badge: '/Favicon.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'thruver-orden'
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/tecnico.html'));
});
