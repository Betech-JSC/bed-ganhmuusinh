/* Static assets only. Never retain API, media, user sessions or admin responses. */
const CACHE = 'gms-static-v9';
function validAsset(path, response) {
  const type = (response.headers.get('content-type') || '').split(';')[0];
  if (!response.ok || type === 'text/html') return false;
  if (/\.(?:m?js)$/.test(path)) return /^(?:text|application)\/javascript$/.test(type);
  if (/\.css$/.test(path)) return type === 'text/css';
  return true;
}
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('gms-static-') && name !== CACHE) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // OAuth redirects and callback cookies belong to the browser's navigation flow.
  // Reconstructing a navigation Request with init can change it to same-origin.
  if (url.pathname.startsWith('/auth/')) return;
  // Old CDN rules allowed four-hour HTML caching. Never bootstrap a new release
  // from that disk entry: its asset names may belong to an older deployment.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(new Request(event.request, { cache: 'reload' })));
    return;
  }
  if (!(url.pathname.startsWith('/assets/') || ['/icon.svg', '/icon-180.png', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest'].includes(url.pathname))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached && validAsset(url.pathname, cached)) return cached;
    if (cached) await cache.delete(event.request);
    const response = await fetch(new Request(event.request, { cache: 'reload' }));
    if (validAsset(url.pathname, response) && response.type === 'basic') await cache.put(event.request, response.clone());
    return response;
  })());
});
