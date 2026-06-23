import { describe, expect, it } from "vitest";
import { createDefaultSettings, normalizeSettings, setReadingZone } from "./settings";

describe("settings", () => {
  it("defaults reading zones to full for both clefs", () => {
    expect(createDefaultSettings()).toEqual({
      version: 1,
      readingZones: {
        treble: "full",
        bass: "full",
      },
    });
  });

  it("keeps treble and bass reading zones independent", () => {
    const trebleSettings = setReadingZone(createDefaultSettings(), "treble", "lower");
    const bassSettings = setReadingZone(trebleSettings, "bass", "upper");

    expect(bassSettings.readingZones.treble).toBe("lower");
    expect(bassSettings.readingZones.bass).toBe("upper");
  });

  it("normalizes invalid stored values", () => {
    const settings = normalizeSettings({
      version: 1,
      readingZones: {
        treble: "lower",
        bass: "invalid",
      },
    });

    expect(settings.readingZones.treble).toBe("lower");
    expect(settings.readingZones.bass).toBe("full");
  });
});
