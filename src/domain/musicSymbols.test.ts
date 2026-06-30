import { describe, expect, it } from "vitest";
import { INITIAL_SYMBOL_IDS, MUSIC_SYMBOL_DEFINITIONS, getSymbolById, isMusicSymbolId } from "./musicSymbols";

describe("musicSymbols", () => {
  it("keeps stable MVP symbol ids in order", () => {
    expect(MUSIC_SYMBOL_DEFINITIONS.map((symbol) => symbol.id)).toEqual([
      "staff",
      "treble-clef",
      "bass-clef",
      "c-clef",
      "bar-line",
      "double-bar-line",
      "whole-note",
      "half-note",
      "quarter-note",
      "eighth-note",
      "beamed-eighth-notes",
      "augmentation-dot",
      "quarter-rest",
      "sharp",
      "flat",
      "natural",
    ]);
  });

  it("keeps labels unique", () => {
    const labels = MUSIC_SYMBOL_DEFINITIONS.map((symbol) => symbol.label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it("starts training with the selected simple symbols", () => {
    expect(INITIAL_SYMBOL_IDS).toEqual([
      "staff",
      "treble-clef",
      "bass-clef",
      "bar-line",
      "quarter-note",
      "eighth-note",
    ]);
  });

  it("keeps accidentals present but outside the initial training pool", () => {
    expect(getSymbolById("sharp").label).toBe("Dièse");
    expect(getSymbolById("flat").label).toBe("Bémol");
    expect(getSymbolById("natural").label).toBe("Bécarre");
    expect(INITIAL_SYMBOL_IDS).not.toContain("sharp");
    expect(INITIAL_SYMBOL_IDS).not.toContain("flat");
    expect(INITIAL_SYMBOL_IDS).not.toContain("natural");
  });

  it("sets accidentals at a higher difficulty than base symbols", () => {
    expect(getSymbolById("sharp").difficulty).toBeGreaterThan(getSymbolById("staff").difficulty);
    expect(getSymbolById("flat").difficulty).toBeGreaterThan(getSymbolById("quarter-note").difficulty);
    expect(getSymbolById("natural").unlockAfterCorrect).toBeGreaterThan(getSymbolById("bar-line").unlockAfterCorrect);
  });

  it("recognizes only known symbol ids", () => {
    expect(isMusicSymbolId("staff")).toBe(true);
    expect(isMusicSymbolId("unknown")).toBe(false);
  });
});
