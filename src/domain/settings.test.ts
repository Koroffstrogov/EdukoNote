import { describe, expect, it } from "vitest";
import { createDefaultSettings, normalizeSettings, setPalette, setReadingZone } from "./settings";

describe("settings", () => {
  it("defaults reading zones to full for both clefs and palette to prune", () => {
    expect(createDefaultSettings()).toEqual({
      version: 1,
      palette: "prune-2026",
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

  it("changes palette without changing reading zones", () => {
    const settings = setReadingZone(createDefaultSettings(), "treble", "lower");
    const updatedSettings = setPalette(settings, "cloud-teal");

    expect(updatedSettings.palette).toBe("cloud-teal");
    expect(updatedSettings.readingZones).toEqual(settings.readingZones);
  });

  it("normalizes invalid stored values", () => {
    const settings = normalizeSettings({
      version: 1,
      palette: "invalid",
      readingZones: {
        treble: "lower",
        bass: "invalid",
      },
    });

    expect(settings.palette).toBe("prune-2026");
    expect(settings.readingZones.treble).toBe("lower");
    expect(settings.readingZones.bass).toBe("full");
  });

  it("normalizes valid stored palette values", () => {
    const settings = normalizeSettings({
      version: 1,
      palette: "blue-piano",
      readingZones: {
        treble: "full",
        bass: "full",
      },
    });

    expect(settings.palette).toBe("blue-piano");
  });
});
