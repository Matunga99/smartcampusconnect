/**
 * SmartCampusConnect X — Production Service Worker
 * Strategy:
 *   • Static assets  → Cache First (fast loads, versioned cache busting)
 *   • API calls      → Network First with 5s timeout, fallback to cache
 *   • Navigation     → Network First, fallback to /index.html (SPA shell)
 */

const CACHE_VERSION = 'scc-v3';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// Core shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('scc-') && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API calls — Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 5000));
    return;
  }

  // Navigation requests — return SPA shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Static assets — Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ── Background Sync — retry failed POST requests (offline form submissions) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-attendance') {
    event.waitUntil(syncPendingAttendance());
  }
});

async function syncPendingAttendance() {
  const db = await openIndexedDB();
  const pending = await getAll(db, 'pendingAttendance');
  for (const item of pending) {
    try {
      const res = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': item.auth },
        body: JSON.stringify(item.payload)
      });
      if (res.ok) await deleteItem(db, 'pendingAttendance', item.id);
    } catch (_) { /* will retry on next sync */ }
  }
}

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'SmartCampus', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'SmartCampusConnect X', {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'scc-notification',
      data: { url: data.url || '/' },
      actions: data.actions || []
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  return new Promise((resolve, reject) => {
    let didRespond = false;
    const timeout = setTimeout(() => {
      if (!didRespond) {
        didRespond = true;
        caches.match(request).then(cached => resolve(cached || new Response('', { status: 408 })));
      }
    }, timeoutMs);

    fetch(request).then(response => {
      clearTimeout(timeout);
      if (!didRespond) {
        didRespond = true;
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(cacheName).then(c => c.put(request, clone));
        }
        resolve(response);
      }
    }).catch(() => {
      clearTimeout(timeout);
      if (!didRespond) {
        didRespond = true;
        caches.match(request).then(cached => resolve(cached || new Response(
          JSON.stringify({ error: 'You are offline. Please check your connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )));
      }
    });
  });
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('scc-offline', 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pendingAttendance'))
        db.createObjectStore('pendingAttendance', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function getAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function deleteItem(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}
