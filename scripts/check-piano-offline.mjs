import { pathToFileURL } from "node:url";

// Run after npm run build and npm run preview -- --port 4173.
const modulePath = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true });
try {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") console.error(message.text()); });
  page.on("requestfailed", (request) => console.error(request.url(), request.failure()));
  await page.goto("http://localhost:4173/piano/play");
  await page.locator(".piano-key").first().waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.locator(".piano-key").first().waitFor({ timeout: 10000 }).catch(async (error) => {
    console.error({ errors, url: page.url(), body: await page.content(), caches: await page.evaluate(async () => {
      const cache = await caches.open("edukonote-shell-v9");
      return Promise.all((await cache.keys()).map(async (request) => ({url: request.url, length: (await (await cache.match(request)).text()).length})));
    }) });
    throw error;
  });
  if (await page.locator(".piano-key").count() !== 24) throw new Error("Offline keyboard is incomplete");
  await page.getByRole("button", { name: "Agrandir les touches" }).click();
  await page.getByRole("button", { name: "Do5–Si5" }).click();
  const key = page.locator('[data-piano-key="c-5"]');
  const r = await key.boundingBox();
  await page.mouse.move(r.x + r.width / 2, r.y + r.height * 0.8);
  await page.mouse.down();
  await page.waitForFunction(() => document.querySelector('[data-piano-key="c-5"]')?.getAttribute("aria-pressed") === "true");
  await page.mouse.up();
  await page.getByRole("link", { name: "Quitter", exact: true }).click();
  await page.getByRole("link", { name: "Trouve la note Lis la portée et trouve la touche" }).click();
  await page.locator(".piano-key").first().click();
  await page.getByRole("button", { name: "Note suivante" }).waitFor();
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Production offline: free play, upper-octave zoom, Piano navigation and note exercise passed; 0 runtime errors.");
} finally { await browser.close(); }
