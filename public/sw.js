const CACHE_NAME = "edukonote-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const response = await fetch(event.request);
        const requestUrl = new URL(event.request.url);

        if (requestUrl.origin === self.location.origin && response.ok) {
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === "navigate") {
          const cachedHome = await caches.match("/");

          if (cachedHome) {
            return cachedHome;
          }
        }

        throw error;
      }
    }),
  );
});
