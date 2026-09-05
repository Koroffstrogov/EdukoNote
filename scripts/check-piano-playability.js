// Real browser hit-testing, synthesized multi-touch (Chromium), and rendered audio.
export default async function checkPianoPlayability(browser) {
  const context = await browser.newContext({ viewport: { width: 667, height: 285 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const active = () => page.locator(".piano-key--active").evaluateAll((keys) => keys.map((key) => key.dataset.pianoKey).sort());
  const expectActive = async (...ids) => {
    const expected = JSON.stringify(ids.sort());
    await page.waitForFunction((value) => JSON.stringify([...document.querySelectorAll(".piano-key--active")].map((key) => key.dataset.pianoKey).sort()) === value, expected, { timeout: 2000 });
  };
  const point = async (id, black = false) => {
    const r = await page.locator(`[data-piano-key="${id}"]`).boundingBox();
    return { x: r.x + r.width / 2, y: r.y + r.height * (black ? 0.5 : 0.82) };
  };
  try {
    await page.goto("http://localhost:5173/piano/play");
    const c = await point("c-4"), cs = await point("c-sharp-4", true), e = await point("e-4"), g = await point("g-4");
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await expectActive("c-4");
    await page.mouse.move(cs.x, cs.y);
    await expectActive("c-sharp-4");
    await page.mouse.move(1, 1);
    await expectActive();
    await page.mouse.move(c.x, c.y);
    await expectActive("c-4");
    await page.keyboard.down("q"); // Physical KeyQ = A on French AZERTY.
    await page.mouse.up();
    await expectActive("c-4");
    await page.keyboard.up("q");
    await expectActive();

    let multitouch = "not available in this engine; pointer lifecycle covered by unit tests";
    if (browser.browserType().name() === "chromium") {
      const cdp = await context.newCDPSession(page);
      const touches = [{ id: 1, ...c }, { id: 2, ...e }, { id: 3, ...g }];
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touches });
      await expectActive("c-4", "e-4", "g-4");
      touches[0] = { id: 1, ...cs };
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touches });
      await expectActive("c-sharp-4", "e-4", "g-4");
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [touches[0]] });
      await expectActive("e-4", "g-4");
      await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
      await expectActive();
      await cdp.detach();
      multitouch = "3-finger chord, independent glide/release and cancellation passed";
    }

    // All 24 notes at once must not reflow the playing surface.
    const before = await page.locator(".piano-keyboard").boundingBox();
    await page.evaluate(async () => {
      const { FREE_PIANO_KEYS } = await import("/src/domain/piano.ts");
      FREE_PIANO_KEYS.forEach((key) => window.dispatchEvent(new KeyboardEvent("keydown", { code: key.keyboardCode })));
    });
    assert((await active()).length === 24, "24-key chord missing");
    const after = await page.locator(".piano-keyboard").boundingBox();
    assert(JSON.stringify(before) === JSON.stringify(after), `Held-note text shifts the keyboard: ${JSON.stringify({before, after})}`);
    await page.getByRole("button", { name: "Couper le son du piano" }).click();
    await expectActive();
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expectActive();
    await page.mouse.move(e.x, e.y);
    await expectActive();
    await page.mouse.up();

    const audio = await page.evaluate(async () => {
      const { createPianoVoice } = await import("/src/audio/pianoSynth.ts");
      const OfflineContext = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!OfflineContext) return { unavailable: true, realtimeAvailable: !!(window.AudioContext ?? window.webkitAudioContext) };
      const sampleRate = 48000;
      const ctx = new OfflineContext(1, sampleRate, sampleRate);
      createPianoVoice(ctx, ctx.destination, 440, () => {}).release(0.35);
      const samples = (await ctx.startRendering()).getChannelData(0);
      const rms = (a, b) => {
        let sum = 0;
        for (let i = Math.floor(a * sampleRate); i < Math.floor(b * sampleRate); i++) sum += samples[i] ** 2;
        return Math.sqrt(sum / ((b - a) * sampleRate));
      };
      // Estimate fundamental from positive crossings over 0.25s (110 cycles at A4).
      let crossings = 0;
      for (let i = 2401; i < 14400; i++) if (samples[i - 1] <= 0 && samples[i] > 0) crossings++;
      const chord = new OfflineContext(1, sampleRate, sampleRate);
      const compressor = chord.createDynamicsCompressor();
      compressor.threshold.value = -12; compressor.knee.value = 12; compressor.ratio.value = 12;
      compressor.attack.value = 0.003; compressor.release.value = 0.16;
      compressor.connect(chord.destination);
      for (let midi = 60; midi < 84; midi++) createPianoVoice(chord, compressor, 440 * 2 ** ((midi - 69) / 12), () => {}).release(0.4);
      const chordSamples = (await chord.startRendering()).getChannelData(0);
      let chordPeak = 0;
      for (const sample of chordSamples) chordPeak = Math.max(chordPeak, Math.abs(sample));
      return { attackRms: rms(0, 0.003), earlyRms: rms(0.025, 0.075), heldRms: rms(0.25, 0.3), releasedRms: rms(0.43, 0.46), silenceRms: rms(0.6, 0.9), estimatedFrequency: crossings / 0.25, chordPeak };
    });
    if (!audio.unavailable) {
      assert(audio.earlyRms > audio.attackRms * 3, `No gradual attack: ${JSON.stringify(audio)}`);
      assert(audio.heldRms > 0.005 && audio.heldRms < audio.earlyRms, "Held tone does not decay naturally");
      assert(audio.releasedRms < audio.heldRms / 10 && audio.silenceRms === 0, "Release leaves a sounding note");
      assert(Math.abs(audio.estimatedFrequency - 440) <= 4, "A4 pitch is wrong");
      assert(audio.chordPeak < 1 && audio.chordPeak > 0.1, "24-note chord clips or is silent");
    }

    // Remove support for color-mix() to exercise the Safari 15 fallback without claiming
    // that modern WebKit is an actual iOS 15 runtime.
    await page.route("**/src/theme/theme.css*", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replaceAll("color-mix(", "unsupported-color-mix(") });
    });
    await page.reload();
    await page.locator(".piano-key").first().waitFor();
    await page.addStyleTag({ content: ".piano-key { transition: none !important; }" });
    const legacy = await page.evaluate(() => {
      const white = document.querySelector(".piano-key--white");
      const black = document.querySelector(".piano-key--black");
      const shell = getComputedStyle(document.querySelector(".free-piano"));
      const idle = getComputedStyle(white).backgroundImage;
      white.classList.add("piano-key--active");
      black.classList.add("piano-key--active");
      return { background: shell.backgroundImage, border: getComputedStyle(white).borderRightWidth, idle, whitePressed: getComputedStyle(white).backgroundColor, blackPressed: getComputedStyle(black).backgroundColor };
    });
    assert(legacy.background !== "none" && legacy.idle !== "none" && legacy.border === "1px", "Safari 15 fallback loses the keyboard");
    assert(legacy.whitePressed !== "rgba(0, 0, 0, 0)" && legacy.blackPressed !== "rgba(0, 0, 0, 0)", "Safari 15 fallback loses active feedback");
    await page.screenshot({ path: `.playwright-mcp/${browser.browserType().name()}-iphone-7-legacy-css.png` });
    return { gliding: "passed", sharedInputs: "passed", chordLayout: "passed", multitouch, audio, legacy };
  } finally { await context.close(); }
}
