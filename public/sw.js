// SAFARIA Tours & Travels — Service Worker for B2B PWA
// Strictly enforces NetworkOnly for /api/*, /admin/*, /partner/* to protect confidential agency data.

const CACHE_NAME = "safaria-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/b2b",
  "/offline",
  "/globals.css",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/skyline.webp",
  "/earth-emerald.webp",
  "/earth-natural.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache static shell assets safely
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA: failed to precache some assets", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // STRICT SECURITY RULE (Track E):
  // NEVER cache sensitive authenticated partner data or private APIs.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/partner") ||
    url.pathname.startsWith("/login") ||
    event.request.method !== "GET"
  ) {
    // Network-only, bypass cache completely
    return;
  }

  // Handle HTML navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/offline");
        });
      })
    );
    return;
  }

  // Cache-first / Stale-while-revalidate for static public assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        // Cache fetched public images and fonts
        if (/\.(?:png|jpg|jpeg|svg|webp|woff|woff2)$/.test(url.pathname)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
