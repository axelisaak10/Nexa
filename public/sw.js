const CACHE_NAME = 'nexa-static-v2';
const STATIC_ASSETS = ['/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png', '/favicon.ico'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(STATIC_ASSETS.map(path => cache.add(path)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('nexa-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache authenticated responses, orders, API writes or rendered account pages.
  if (url.origin !== self.location.origin || event.request.method !== 'GET' || url.pathname.startsWith('/api/') || event.request.headers.has('authorization')) return;
  if (!STATIC_ASSETS.includes(url.pathname) && !url.pathname.startsWith('/_next/static/') && !url.pathname.startsWith('/images/')) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy))); }
    return response;
  })));
});
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { /* Malformed payloads still show a generic update. */ }
  const path = typeof data.url === 'string' && /^\/tracking\/\d+$/.test(data.url) ? data.url : '/profile';
  event.waitUntil(self.registration.showNotification(data.title || 'Nexa', {
    body: data.body || 'Hay una actualización. Consulta tus pedidos.',
    icon: '/icons/icon-192x192.png',
    tag: data.tag || 'nexa-update',
    data: { url: path },
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const value = event.notification.data?.url;
  const path = typeof value === 'string' && /^\/tracking\/\d+$/.test(value) ? value : '/profile';
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    const existing = clients.find(client => new URL(client.url).origin === self.location.origin);
    if (existing) { await existing.navigate(target); return existing.focus(); }
    return self.clients.openWindow(target);
  }));
});
