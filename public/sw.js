const CACHE_NAME = "edukonote-shell-v2";
const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/apple-touch-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheAppShell()
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  if (isStaticAsset(requestUrl)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const shellResponse = await fetch("/", { cache: "reload" });

  if (shellResponse.ok) {
    await cache.put("/", shellResponse.clone());

    const html = await shellResponse.clone().text();
    const assetUrls = extractSameOriginAssetUrls(html);
    const urlsToCache = Array.from(new Set([...APP_SHELL_URLS.filter((url) => url !== "/"), ...assetUrls]));

    await Promise.all(
      urlsToCache.map(async (url) => {
        try {
          const response = await fetch(url, { cache: "reload" });

          if (response.ok) {
            await cache.put(url, response);
          }
        } catch {
          undefined;
        }
      }),
    );
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
      await cache.put("/", response.clone());
    }

    return response;
  } catch {
    return (await cache.match(request)) ?? (await cache.match("/")) ?? (await cache.match("/index.html"));
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw new Error(`No offline cache entry for ${request.url}`);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

function extractSameOriginAssetUrls(html) {
  const urls = [];
  const assetPattern = /(?:href|src)="([^"]+)"/g;
  let match = assetPattern.exec(html);

  while (match) {
    const url = new URL(match[1], self.location.origin);

    if (url.origin === self.location.origin && url.pathname.startsWith("/assets/")) {
      urls.push(url.pathname);
    }

    match = assetPattern.exec(html);
  }

  return urls;
}

function isStaticAsset(url) {
  return url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest";
}
