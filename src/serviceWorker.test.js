import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const serviceWorkerSource = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

describe("service worker cache routing", () => {
  it("keeps cache-first for immutable hashed assets", async () => {
    const runtime = createServiceWorkerRuntime({
      initialCaches: {
        "edukonote-shell-v4": ["/assets/index-hash.js"],
      },
    });
    const response = await runtime.dispatchFetch("https://edukonote.test/assets/index-hash.js");

    expect(response.kind).toBe("cached");
    expect(runtime.fetchRequests).toEqual([]);
  });

  it.each(["/manifest.webmanifest", "/icons/icon-192.png"])(
    "revalidates mutable app metadata through the network: %s",
    async (pathname) => {
      const runtime = createServiceWorkerRuntime();
      const url = `https://edukonote.test${pathname}`;
      const response = await runtime.dispatchFetch(url);

      expect(response.kind).toBe("network");
      expect(runtime.fetchRequests).toEqual([url]);
      expect(runtime.cachedRequests).toContain(url);
    },
  );

  it("keeps the previous shell active when staging fails", async () => {
    const runtime = createServiceWorkerRuntime({
      failingUrls: ["/assets/index-hash.js"],
      initialCaches: {
        "edukonote-shell-v3": ["/", "/assets/index-previous.js"],
      },
    });

    await expect(runtime.dispatchInstall()).rejects.toThrow("Network failure");

    expect(runtime.skipWaitingCalls).toBe(0);
    expect(runtime.cacheNames()).toContain("edukonote-shell-v3");
    expect(runtime.cacheNames()).not.toContain("edukonote-shell-v4-staging");
  });

  it("promotes a complete staged shell before deleting the previous cache", async () => {
    const runtime = createServiceWorkerRuntime({
      initialCaches: {
        "edukonote-shell-v3": ["/", "/assets/index-previous.js"],
        "unrelated-cache": ["/shared-resource"],
      },
    });

    await runtime.dispatchInstall();

    expect(runtime.skipWaitingCalls).toBe(1);
    expect(runtime.cacheNames()).toContain("edukonote-shell-v3");
    expect(runtime.cacheNames()).toContain("edukonote-shell-v4-staging");

    await runtime.dispatchActivate();

    expect(runtime.clientsClaimCalls).toBe(1);
    expect(runtime.cacheNames()).toContain("edukonote-shell-v4");
    expect(runtime.cacheNames()).toContain("unrelated-cache");
    expect(runtime.cacheNames()).not.toContain("edukonote-shell-v3");
    expect(runtime.cacheNames()).not.toContain("edukonote-shell-v4-staging");
    expect(runtime.cachedUrls("edukonote-shell-v4")).toContain("https://edukonote.test/");
    expect(runtime.cachedUrls("edukonote-shell-v4")).toContain(
      "https://edukonote.test/assets/index-hash.js",
    );
  });

  it("does not replace the previous shell from an incomplete staged cache", async () => {
    const runtime = createServiceWorkerRuntime({
      initialCaches: {
        "edukonote-shell-v3": ["/", "/assets/index-previous.js"],
        "edukonote-shell-v4-staging": ["/assets/index-hash.js"],
      },
    });

    await expect(runtime.dispatchActivate()).rejects.toThrow(
      "The staged app shell has no root document",
    );

    expect(runtime.clientsClaimCalls).toBe(0);
    expect(runtime.cacheNames()).toContain("edukonote-shell-v3");
    expect(runtime.cacheNames()).not.toContain("edukonote-shell-v4");
  });
});

function createServiceWorkerRuntime({
  failingUrls = [],
  initialCaches = {},
} = {}) {
  const listeners = new Map();
  const fetchRequests = [];
  const cachedRequests = [];
  const cacheEntries = new Map();
  const failingUrlSet = new Set(failingUrls.map(toAbsoluteUrl));
  let skipWaitingCalls = 0;
  let clientsClaimCalls = 0;

  for (const [cacheName, urls] of Object.entries(initialCaches)) {
    cacheEntries.set(
      cacheName,
      new Map(
        urls.map((url) => [
          toAbsoluteUrl(url),
          createResponse("cached", toAbsoluteUrl(url)),
        ]),
      ),
    );
  }

  const self = {
    location: { origin: "https://edukonote.test" },
    clients: {
      claim: async () => {
        clientsClaimCalls += 1;
      },
    },
    skipWaiting: async () => {
      skipWaitingCalls += 1;
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };

  runInNewContext(serviceWorkerSource, {
    URL,
    caches: {
      open: async (cacheName) => createCache(cacheName),
      keys: async () => [...cacheEntries.keys()],
      delete: async (cacheName) => cacheEntries.delete(cacheName),
    },
    fetch: async (request) => {
      const url = toAbsoluteUrl(typeof request === "string" ? request : request.url);

      fetchRequests.push(url);

      if (failingUrlSet.has(url)) {
        throw new Error(`Network failure for ${url}`);
      }

      return createResponse(
        "network",
        url,
        url === "https://edukonote.test/"
          ? '<script type="module" src="/assets/index-hash.js"></script>'
          : "",
      );
    },
    self,
  });

  function createCache(cacheName) {
    if (!cacheEntries.has(cacheName)) {
      cacheEntries.set(cacheName, new Map());
    }

    const entries = cacheEntries.get(cacheName);

    return {
      async keys() {
        return [...entries.keys()].map((url) => ({ url }));
      },
      async match(request) {
        return entries.get(toAbsoluteUrl(typeof request === "string" ? request : request.url));
      },
      async put(request, response) {
        const url = toAbsoluteUrl(typeof request === "string" ? request : request.url);

        entries.set(url, response);
        cachedRequests.push(url);
      },
      async delete(request) {
        return entries.delete(toAbsoluteUrl(typeof request === "string" ? request : request.url));
      },
    };
  }

  return {
    fetchRequests,
    cachedRequests,
    get skipWaitingCalls() {
      return skipWaitingCalls;
    },
    get clientsClaimCalls() {
      return clientsClaimCalls;
    },
    cacheNames() {
      return [...cacheEntries.keys()];
    },
    cachedUrls(cacheName) {
      return [...(cacheEntries.get(cacheName)?.keys() ?? [])];
    },
    async dispatchInstall() {
      return dispatchExtendableEvent(listeners.get("install"));
    },
    async dispatchActivate() {
      return dispatchExtendableEvent(listeners.get("activate"));
    },
    async dispatchFetch(url) {
      let responsePromise;
      const fetchListener = listeners.get("fetch");

      fetchListener({
        request: {
          method: "GET",
          mode: "cors",
          url,
        },
        respondWith(promise) {
          responsePromise = promise;
        },
      });

      return responsePromise;
    },
  };
}

async function dispatchExtendableEvent(listener) {
  let lifetimePromise;

  listener({
    waitUntil(promise) {
      lifetimePromise = promise;
    },
  });

  return lifetimePromise;
}

function toAbsoluteUrl(url) {
  return new URL(url, "https://edukonote.test").href;
}

function createResponse(kind, url, body = "") {
  return {
    kind,
    url,
    ok: true,
    status: 200,
    clone() {
      return createResponse(kind, url, body);
    },
    async text() {
      return body;
    },
  };
}
