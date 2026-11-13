// SAFARIA public PWA shell. Never persist enquiries, sessions, or private API responses.
const CACHE_NAME = "safaria-public-v3";

const PUBLIC_SHELL = [
  "/",
  "/b2b",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/skyline.webp",
  "/earth-emerald.webp",
  "/earth-natural.webp",
  "/logo-inverted.webp",
  "/images/skyline.webp",
  "/images/logo-inverted.webp",
];

const CACHEABLE_PUBLIC_ROUTES = new Set(["/", "/b2b", "/offline"]);

self.addEventListener("install", (event) => {
  // A single missing asset must not invalidate all offline resources.
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        PUBLIC_SHELL.map((asset) =>
          cache.add(asset).catch(() => {
            console.warn("SAFARIA: optional offline asset unavailable", asset);
          })
        )
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("safaria-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Sensitive and role-gated responses are strictly network-only, including navigations.
  if (/^\/(api|admin|partner|login)(\/|$)/.test(url.pathname)) return;

  // Network-first for safe public document navigations with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          if (
            response.ok &&
            response.type === "basic" &&
            CACHEABLE_PUBLIC_ROUTES.has(url.pathname)
          ) {
            await cache.put(url.pathname, response.clone());
          }
          return response;
        } catch {
          const cachedExact = await cache.match(request);
          if (cachedExact) return cachedExact;

          if (CACHEABLE_PUBLIC_ROUTES.has(url.pathname)) {
            const cachedRoute = await cache.match(url.pathname);
            if (cachedRoute) return cachedRoute;
          }

          const offlinePage = await cache.match("/offline");
          if (offlinePage) return offlinePage;

          return new Response("Offline — connect to the internet to continue.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      })()
    );
    return;
  }

  // Immutable hashed Next.js assets & fonts: cache-first.
  const isImmutableAsset =
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:woff2|woff)$/i.test(url.pathname);

  if (isImmutableAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // Public images, icons, manifest, and marketing assets: stale-while-revalidate.
  const isPublicAsset =
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/marketing/") ||
    /^\/(?:icon-(?:192|512)|icon-maskable-512|apple-touch-icon)\.png$/.test(url.pathname) ||
    /^\/(?:skyline|earth-emerald|earth-natural|logo-inverted)\.webp$/.test(url.pathname);

  if (!isPublicAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then(async (response) => {
          if (response.ok && response.type === "basic") {
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkPromise;
    })
  );
});
