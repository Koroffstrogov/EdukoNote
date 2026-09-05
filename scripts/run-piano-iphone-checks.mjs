import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import checkPianoIphones from "./check-piano-iphones.js";
import checkPianoPlayability from "./check-piano-playability.js";

// PLAYWRIGHT_MODULE can point to a preinstalled Playwright entrypoint.
const modulePath = process.env.PLAYWRIGHT_MODULE;
const playwright = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const engine = process.argv[2] ?? "chromium";
if (!["chromium", "webkit"].includes(engine)) throw new Error("Expected chromium or webkit");
await mkdir(".playwright-mcp", { recursive: true });
const browser = await playwright[engine].launch({ headless: true });
try {
  const page = await browser.newPage();
  const playabilityOnly = process.argv.includes("--playability-only");
  const result = playabilityOnly ? { results: [], errors: [] } : await checkPianoIphones(page);
  result.playability = await checkPianoPlayability(browser);
  await writeFile(`.playwright-mcp/${engine}-piano${playabilityOnly ? "-playability" : ""}-report.json`, JSON.stringify(result, null, 2));
  if (!playabilityOnly) console.log(`${engine}: ${result.results.length} landscape cases passed, portrait navigation and exercise regressions passed, ${result.errors.length} runtime errors.`);
  console.log(JSON.stringify(result.playability, null, 2));
} finally { await browser.close(); }
