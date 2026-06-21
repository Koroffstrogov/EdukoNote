export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        activateWaitingServiceWorker(registration);

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;

          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              activateWaitingServiceWorker(registration);
            }
          });
        });
      })
      .catch(() => undefined);
  });
}

function activateWaitingServiceWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}
