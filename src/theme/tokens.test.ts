import { describe, expect, it } from "vitest";
import { PALETTE_LABELS, PALETTES, isPaletteId, paletteTokens } from "./tokens";

describe("palette tokens", () => {
  it("keeps the four palette ids stable", () => {
    expect(PALETTES).toEqual(["prune-2026", "cloud-teal", "jelly-mint", "blue-piano"]);
  });

  it("exposes child-facing labels for every palette", () => {
    expect(paletteTokens.map((palette) => PALETTE_LABELS[palette.id])).toEqual([
      "Prune magique",
      "Nuage teal",
      "Menthe pop",
      "Piano bleu",
    ]);
  });

  it("validates palette ids", () => {
    expect(isPaletteId("jelly-mint")).toBe(true);
    expect(isPaletteId("unknown")).toBe(false);
  });
});
