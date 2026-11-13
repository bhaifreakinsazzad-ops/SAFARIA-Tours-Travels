// SAFARIA public PWA shell. Never persist enquiries, sessions or private API responses.
const CACHE_NAME = "safaria-public-v2";
const PUBLIC_SHELL = [
  "/offline",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/skyline.webp",
  "/earth-emerald.webp",
];

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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Sensitive and role-gated responses are network-only, including navigations.
  if (/^\/(api|admin|partner|login)(\/|$)/.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (await caches.match("/offline")) ||
          new Response("Offline — connect to the internet to continue.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
      })
    );
    return;
  }

  // Cache only versioned/static public assets. Never cache HTML, JSON, or API data.
  const isPublicAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    /^\/(?:icon-(?:192|512)|icon-maskable-512|apple-touch-icon)\.png$/.test(url.pathname) ||
    /^\/(?:skyline|earth-emerald|earth-natural|logo-inverted)\.webp$/.test(url.pathname);
  if (!isPublicAsset) return;

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});
