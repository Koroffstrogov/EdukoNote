import { describe, expect, it } from "vitest";
import { createDefaultSettings, normalizeSettings, setReadingZone } from "./settings";

describe("settings", () => {
  it("defaults reading zones to full for all clefs", () => {
    expect(createDefaultSettings()).toEqual({
      version: 1,
      readingZones: {
        treble: "full",
        bass: "full",
        tenor: "full",
      },
    });
  });

  it("keeps reading zones independent by clef", () => {
    const trebleSettings = setReadingZone(createDefaultSettings(), "treble", "lower");
    const bassSettings = setReadingZone(trebleSettings, "bass", "upper");
    const tenorSettings = setReadingZone(bassSettings, "tenor", "lower");

    expect(tenorSettings.readingZones.treble).toBe("lower");
    expect(tenorSettings.readingZones.bass).toBe("upper");
    expect(tenorSettings.readingZones.tenor).toBe("lower");
  });

  it("normalizes invalid stored values and ignores stale palette settings", () => {
    const settings = normalizeSettings({
      version: 1,
      palette: "blue-piano",
      readingZones: {
        treble: "lower",
        bass: "invalid",
        tenor: "upper",
      },
    });

    expect("palette" in settings).toBe(false);
    expect(settings.readingZones.treble).toBe("lower");
    expect(settings.readingZones.bass).toBe("full");
    expect(settings.readingZones.tenor).toBe("upper");
  });
});
