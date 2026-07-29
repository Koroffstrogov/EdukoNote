import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const serviceWorkerSource = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

describe("service worker cache routing", () => {
  it("keeps cache-first for immutable hashed assets", async () => {
    const runtime = createServiceWorkerRuntime();
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
});

function createServiceWorkerRuntime() {
  const listeners = new Map();
  const fetchRequests = [];
  const cachedRequests = [];
  const cachedResponse = { kind: "cached" };
  const networkResponse = {
    kind: "network",
    ok: true,
    clone() {
      return this;
    },
  };
  const cache = {
    async match() {
      return cachedResponse;
    },
    async put(request) {
      cachedRequests.push(typeof request === "string" ? request : request.url);
    },
  };
  const self = {
    location: { origin: "https://edukonote.test" },
    clients: { claim: async () => undefined },
    skipWaiting: async () => undefined,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };

  runInNewContext(serviceWorkerSource, {
    URL,
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
    },
    fetch: async (request) => {
      fetchRequests.push(request.url);
      return networkResponse;
    },
    self,
  });

  return {
    fetchRequests,
    cachedRequests,
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
