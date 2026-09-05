// Called by run-piano-iphone-checks.mjs against npm run dev.
// These are browser simulations, not measurements on physical iPhones.
export default async function checkPianoIphones(page) {
  const browser = page.context().browser();
  const results = [];
  const errors = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const devices = [
    { name: "iphone-7", width: 667, height: 375, safe: 0 },
    { name: "iphone-13-mini", width: 812, height: 375, safe: 50 },
    { name: "iphone-13-mini-compact", width: 780, height: 360, safe: 50 },
    { name: "iphone-14", width: 844, height: 390, safe: 47 },
    { name: "iphone-16-pro", width: 874, height: 402, safe: 62 },
  ];
  for (const device of devices) {
    const context = await browser.newContext({ viewport: { width: device.width, height: device.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const tab = await context.newPage();
    tab.on("pageerror", (error) => errors.push(`${device.name}: ${error.message}`));
    try {
      for (const bars of [false, true]) {
        const height = device.height - (bars ? 90 : 0);
        await tab.setViewportSize({ width: device.width, height });
        await tab.goto("http://localhost:5173/piano/play");
        await tab.locator(".piano-key").first().waitFor();
        await tab.addStyleTag({ content: `.free-piano, .piano-exercise { --piano-safe-left: ${device.safe}px; --piano-safe-right: ${device.safe}px; --piano-safe-bottom: ${device.safe ? 21 : 0}px; }` });
        for (const large of [false, true]) {
          if (large) await tab.getByRole("button", { name: "Agrandir les touches" }).click();
          const geometry = await tab.evaluate(() => {
            const keys = [...document.querySelectorAll(".piano-key")];
            const keyboard = document.querySelector(".piano-keyboard").getBoundingClientRect();
            const issues = [];
            const hits = [];
            const whites = [], blacks = [];
            for (const key of keys) {
              const r = key.getBoundingClientRect();
              const black = key.classList.contains("piano-key--black");
              (black ? blacks : whites).push(r.width);
              if (r.bottom > innerHeight + 0.5 || r.right > innerWidth + 0.5 || r.left < 0 || r.top < 0) issues.push(`outside:${key.dataset.pianoKey}`);
              // White keys are played on the clear front, black keys on their raised body.
              const y = black ? r.y + r.height / 2 : r.y + r.height * 0.82;
              for (const x of [r.x + 3, r.x + r.width / 2, r.right - 3]) {
                const hit = document.elementFromPoint(x, y)?.closest("[data-piano-key]");
                if (hit !== key) issues.push(`hit:${key.dataset.pianoKey}@${x},${y}=>${hit?.dataset.pianoKey}`);
              }
              // Just below a black key must reach the visible white key, never an invisible extension.
              if (black) {
                for (const x of [r.x + 3, r.right - 3]) {
                  const hit = document.elementFromPoint(x, r.bottom + 4)?.closest("[data-piano-key]");
                  if (!hit?.classList.contains("piano-key--white")) issues.push(`below-black:${key.dataset.pianoKey}`);
                }
              }
              hits.push({ id: key.dataset.pianoKey, x: r.x + r.width / 2, y });
              for (const label of key.querySelectorAll(".piano-key__spellings > span")) {
                const b = label.getBoundingClientRect();
                if (b.width > r.width || b.bottom > r.bottom) issues.push(`label:${key.dataset.pianoKey}`);
              }
            }
            const buttons = [...document.querySelectorAll(".free-piano__topbar button, .free-piano__exit, .piano-octaves button")];
            for (const button of buttons) {
              const r = button.getBoundingClientRect();
              if (r.width < 44 || r.height < 44 || r.right > innerWidth || r.bottom > keyboard.y) issues.push(`control:${button.getAttribute("aria-label")}`);
            }
            const blackHeight = document.querySelector(".piano-key--black").getBoundingClientRect().height;
            const whiteHeight = document.querySelector(".piano-key--white").getBoundingClientRect().height;
            return { issues, hits, whiteWidth: Math.min(...whites), blackWidth: Math.min(...blacks), clearWhiteHeight: whiteHeight - blackHeight, blackHeight, bottom: keyboard.bottom, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight };
          });
          const tag = `${device.name}/${bars ? "browser-bars" : "full-height"}/${large ? "large" : "two-octaves"}`;
          assert(!geometry.issues.length && !geometry.overflow, `${tag}: ${JSON.stringify(geometry)}`);
          assert(geometry.whiteWidth >= 44 && geometry.clearWhiteHeight >= 44, `${tag}: small white playing area`);
          assert(geometry.blackWidth >= (large ? 44 : 32) && geometry.blackHeight >= 44, `${tag}: small black playing area`);
          for (const hit of geometry.hits) {
            await tab.mouse.move(hit.x, hit.y);
            await tab.mouse.down();
            const active = await tab.locator(".piano-key--active").getAttribute("data-piano-key");
            assert(active === hit.id, `${tag}: press ${hit.id} gave ${active}`);
            await tab.mouse.up();
          }
          assert(await tab.locator(".piano-key--active").count() === 0, `${tag}: stuck pointer`);
          if (large) {
            await tab.getByRole("button", { name: "Do5–Si5" }).click();
            assert(await tab.locator('[data-piano-key="c-5"]').count() === 1, `${tag}: upper octave missing`);
            assert(await tab.locator(".piano-key").count() === 12, `${tag}: octave count`);
          }
          results.push({ device: device.name, bars, large, ...geometry, hits: undefined });
          if (!bars && large) await tab.screenshot({ path: `.playwright-mcp/${browser.browserType().name()}-${device.name}-large.png` });
          if (!bars && !large) await tab.screenshot({ path: `.playwright-mcp/${browser.browserType().name()}-${device.name}-full.png` });
        }
        // Regression: the note-finding exercise must also fit after answering.
        await tab.goto("http://localhost:5173/exercise?mode=piano");
        await tab.addStyleTag({ content: `.piano-exercise { --piano-safe-left: ${device.safe}px; --piano-safe-right: ${device.safe}px; --piano-safe-bottom: ${device.safe ? 21 : 0}px; }` });
        await tab.locator(".piano-key").first().click();
        const next = await tab.getByRole("button", { name: "Note suivante" }).boundingBox();
        const last = await tab.locator(".piano-key--white").last().boundingBox();
        assert(next.y + next.height <= height && last.y + last.height <= height, `${device.name}: exercise clipped`);
      }
      await tab.setViewportSize({ width: device.height, height: device.width });
      await tab.goto("http://localhost:5173/piano/play");
      await tab.getByRole("heading", { name: "Tourne ton appareil" }).waitFor();
      assert(await tab.getByRole("heading", { name: "Tourne ton appareil" }).isVisible(), `${device.name}: rotation prompt missing`);
      await tab.getByRole("link", { name: "Quitter", exact: true }).click();
      await tab.getByRole("link", { name: "Jeu libre Joue à ton rythme" }).waitFor();
      assert(await tab.getByRole("link", { name: "Jeu libre Joue à ton rythme" }).isVisible(), `${device.name}: hub missing`);
    } finally { await context.close(); }
  }
  assert(errors.length === 0, errors.join("\n"));
  return { engine: browser.browserType().name(), results, errors };
}
