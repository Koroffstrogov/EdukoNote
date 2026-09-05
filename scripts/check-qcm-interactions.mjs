import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Run against npm run dev on port 5173. All progress is isolated in test contexts.
const modulePath = process.env.PLAYWRIGHT_MODULE;
const playwright = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const engine = process.argv[2] ?? "chromium";
if (!["chromium", "webkit"].includes(engine)) throw new Error("Expected chromium or webkit");
const browser = await playwright[engine].launch({ headless: true });
const results = [];
const errors = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const entries = [
  ...["training", "challenge", "review", "speed"].map((mode) => ({ mode: `notes-${mode}`, url: `/exercise?mode=${mode}`, speed: mode === "speed", next: "Note suivante" })),
  ...["training", "challenge", "review"].map((mode) => ({ mode: `symbols-${mode}`, url: `/symbols/exercise?mode=${mode}`, next: "Symbole suivant" })),
];

async function seedProgress(page) {
  await page.goto("http://localhost:5173/");
  await page.evaluate(async () => {
    const { createEmptyProgress, PROGRESS_STORAGE_KEY } = await import("/src/domain/progress.ts");
    const { getNotesForClef } = await import("/src/domain/notes.ts");
    const { createEmptySymbolProgressState, SYMBOL_PROGRESS_STORAGE_KEY } = await import("/src/domain/symbolProgress.ts");
    const progress = createEmptyProgress();
    getNotesForClef("treble").forEach((note) => { progress.clefs.treble.notes[note.id] = { views: 1, correct: 0, errors: 1, needsReview: true, lastPracticedAt: null }; });
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    const symbols = createEmptySymbolProgressState();
    Object.values(symbols.symbols).forEach((symbol) => { symbol.views = 1; symbol.errors = 1; symbol.needsReview = true; });
    localStorage.setItem(SYMBOL_PROGRESS_STORAGE_KEY, JSON.stringify(symbols));
  });
}

const styleOfPad = (button) => {
  const style = getComputedStyle(button);
  return [style.backgroundColor, style.borderTopColor, style.boxShadow, style.transform];
};

async function expectNeutralChoices(page, neutral, mode) {
  await page.waitForFunction((expected) => {
    const pads = [...document.querySelectorAll(".studio-answer-pad")];
    return pads.length > 0 && pads.every((button) => {
      const style = getComputedStyle(button);
      return !button.disabled && button !== document.activeElement
        && JSON.stringify([style.backgroundColor, style.borderTopColor, style.boxShadow, style.transform]) === JSON.stringify(expected);
    });
  }, neutral, { timeout: 2000 }).catch(async (error) => {
    console.error(mode, await page.locator(".studio-answer-pad").evaluateAll((buttons) => buttons.map((button) => ({ label: button.textContent, hover: button.matches(":hover"), focus: button === document.activeElement, background: getComputedStyle(button).backgroundColor, transform: getComputedStyle(button).transform }))));
    throw error;
  });
  assert(await page.locator(".exercise-feedback").count() === 0, `${mode}: old feedback remains`);
  assert(await page.locator(".question-card__title").evaluate((title) => title === document.activeElement), `${mode}: question focus was not restored`);
}

try {
  for (const entry of entries) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`${entry.mode}: ${error.message}`));
    await page.addInitScript(() => { Math.random = () => 0.2; });
    try {
      await seedProgress(page);
      await page.goto(`http://localhost:5173${entry.url}`);
      const neutral = await page.locator(".studio-answer-pad").first().evaluate(styleOfPad);
      let stickyHoverSeen = false;
      for (let round = 0; round < 4; round++) {
        if (entry.speed) {
          const correct = await page.evaluate(async () => {
            const { getNotesForClef } = await import("/src/domain/notes.ts");
            const y = Number(document.querySelector(".staff-note-svg__head").getAttribute("cy"));
            return getNotesForClef("treble").find((note) => note.svgY === y).answerLabel;
          });
          await page.getByRole("button", { name: correct, exact: true }).tap();
          await page.waitForFunction((score) => Number(document.querySelector(".studio-speed-stats strong")?.textContent) === score, round + 1);
        } else {
          await page.locator(".studio-answer-pad").first().tap();
          await page.getByRole("button", { name: entry.next, exact: true }).tap();
        }
        await expectNeutralChoices(page, neutral, entry.mode);
        stickyHoverSeen ||= await page.locator(".studio-answer-pad:hover").count() > 0;
      }
      results.push({ mode: entry.mode, input: "touch", transitions: 4, stickyHoverSeen, neutralChoices: true });
    } finally { await context.close(); }
  }

  // Preserve intentional desktop hover and visible keyboard focus.
  for (const entry of [entries[0], entries[4]]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(`http://localhost:5173${entry.url}`);
      const pad = page.locator(".studio-answer-pad").first();
      const neutral = await pad.evaluate(styleOfPad);
      await pad.hover();
      await page.waitForFunction((background) => getComputedStyle(document.querySelector(".studio-answer-pad:hover")).backgroundColor !== background, neutral[0]);
      await pad.click();
      await page.getByRole("button", { name: entry.next, exact: true }).click();
      await page.mouse.move(1, 1);
      await expectNeutralChoices(page, neutral, entry.mode);
      await page.keyboard.press("Tab");
      const focused = await page.locator(".studio-answer-pad:focus-visible").count();
      assert(focused === 1, `${entry.mode}: keyboard focus is missing`);
      const outline = await page.locator(".studio-answer-pad:focus-visible").evaluate((button) => getComputedStyle(button).outlineStyle);
      assert(outline !== "none", `${entry.mode}: keyboard focus has no visible outline`);
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: entry.next, exact: true }).waitFor();
      results.push({ mode: entry.mode, input: "mouse/keyboard", hover: true, focusVisible: true, activation: true });
    } finally { await context.close(); }
  }
  assert(errors.length === 0, errors.join("\n"));
  await mkdir(".playwright-mcp", { recursive: true });
  await writeFile(`.playwright-mcp/${engine}-qcm-report.json`, JSON.stringify({ engine, results, errors }, null, 2));
  console.log(`${engine}: 28 touch transitions with neutral choices; mouse hover and keyboard focus/activation passed for Notes and Symbols.`);
} finally { await browser.close(); }
