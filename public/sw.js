const CACHE_PREFIX = "edukonote-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const STAGING_CACHE_NAME = `${CACHE_NAME}-staging`;
const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/fonts/eduko-music-symbols.woff",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/apple-touch-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(stageAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    promoteStagedAppShell()
      .then(() => deleteOldAppShellCaches())
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

  if (isImmutableAsset(requestUrl)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function stageAppShell() {
  await caches.delete(STAGING_CACHE_NAME);
  const stagingCache = await caches.open(STAGING_CACHE_NAME);

  try {
    const shellResponse = await fetchRequired("/");
    const html = await shellResponse.clone().text();
    const assetUrls = extractSameOriginAssetUrls(html);
    const urlsToCache = Array.from(
      new Set([...APP_SHELL_URLS.filter((url) => url !== "/"), ...assetUrls]),
    );
    const responses = await Promise.all(
      urlsToCache.map(async (url) => ({
        url,
        response: await fetchRequired(url),
      })),
    );

    await stagingCache.put("/", shellResponse);
    await Promise.all(
      responses.map(({ url, response }) => stagingCache.put(url, response)),
    );
  } catch (error) {
    await caches.delete(STAGING_CACHE_NAME);
    throw error;
  }
}

async function promoteStagedAppShell() {
  const stagingCache = await caches.open(STAGING_CACHE_NAME);
  const stagedRequests = await stagingCache.keys();

  if (stagedRequests.length === 0) {
    throw new Error("No staged app shell is available");
  }

  const rootRequest = stagedRequests.find((request) => new URL(request.url).pathname === "/");

  if (!rootRequest) {
    throw new Error("The staged app shell has no root document");
  }

  const targetCache = await caches.open(CACHE_NAME);
  const assetRequests = stagedRequests.filter((request) => request !== rootRequest);

  await copyCacheEntries(stagingCache, targetCache, assetRequests);
  await copyCacheEntries(stagingCache, targetCache, [rootRequest]);

  const stagedUrls = new Set(stagedRequests.map((request) => request.url));
  const targetRequests = await targetCache.keys();

  await Promise.all(
    targetRequests
      .filter((request) => !stagedUrls.has(request.url))
      .map((request) => targetCache.delete(request)),
  );
  await caches.delete(STAGING_CACHE_NAME);
}

async function copyCacheEntries(sourceCache, targetCache, requests) {
  for (const request of requests) {
    const response = await sourceCache.match(request);

    if (!response) {
      throw new Error(`Missing staged response for ${request.url}`);
    }

    await targetCache.put(request, response);
  }
}

async function deleteOldAppShellCaches() {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName)),
  );
}

async function fetchRequired(url) {
  const response = await fetch(url, { cache: "reload" });

  if (!response.ok) {
    throw new Error(`Unable to cache ${url}: ${response.status}`);
  }

  return response;
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

function isImmutableAsset(url) {
  return url.pathname.startsWith("/assets/");
}
