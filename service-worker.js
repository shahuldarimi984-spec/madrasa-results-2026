const CACHE_NAME = "asasul-portal-v1";

const APP_SHELL = [
  "/madrasa-results-2026/",
  "/madrasa-results-2026/manifest.webmanifest",
  "/madrasa-results-2026/app-icon-192.png",
  "/madrasa-results-2026/app-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin || request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && APP_SHELL.includes(url.pathname)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(request, copy)
          );
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          return caches.match("/madrasa-results-2026/");
        }

        return new Response("", { status: 503 });
      })
  );
});
