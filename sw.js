/* Visteller service worker — app blijft werken zonder internet.
   HTML en scripts: netwerk eerst (zodat updates altijd doorkomen),
   met de cache als terugval. Overige bestanden: cache eerst. */
const CACHE = 'visteller-v2';
const SHELL = [
  './',
  './index.html',
  './fish.js',
  './db.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './photos/baars.webp',
  './photos/snoek.webp',
  './photos/snoekbaars.webp',
  './photos/blankvoorn.webp',
  './photos/ruisvoorn.webp',
  './photos/karper.webp',
  './photos/brasem.webp',
  './photos/kolblei.webp',
  './photos/zeelt.webp',
  './photos/paling.webp',
  './photos/winde.webp',
  './photos/alver.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function bewaar(req, res) {
  if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let pad = '';
  try { pad = new URL(req.url).pathname; } catch (err) {}
  const versGeval = req.mode === 'navigate' || req.destination === 'document' ||
    /\.(html|js)$/i.test(pad);

  if (versGeval) {
    e.respondWith(
      fetch(req).then(res => bewaar(req, res)).catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      const fresh = fetch(req).then(res => bewaar(req, res)).catch(() => hit);
      return hit || fresh;
    })
  );
});
