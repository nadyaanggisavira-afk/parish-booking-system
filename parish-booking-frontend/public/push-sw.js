/* eslint-env serviceworker */
/* global self, clients */

// Imported by the generated Workbox service worker (see vite.config.ts).
// Handles Web Push delivery for booking decisions.

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Paroki Purbayan', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Paroki St. Antonius Purbayan';
  const options = {
    body: payload.body || '',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: payload.tag || 'booking-update',
    data: { url: payload.url || '/booking-saya' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/booking-saya';

  // Focus an already-open tab if we have one; otherwise open a new window.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return clients.openWindow(target);
    }),
  );
});
