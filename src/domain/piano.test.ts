import { describe, expect, it } from "vitest";
import {
  PIANO_KEYS,
  PIANO_SPELLINGS,
  generateNextPianoQuestion,
  getPianoCatalog,
  getPianoKeyFrequency,
  getPianoKeyMidi,
  getPianoSpelling,
} from "./piano";

describe("piano domain", () => {
  it("defines one complete octave and seventeen written spellings", () => {
    expect(PIANO_KEYS).toHaveLength(12);
    expect(PIANO_KEYS.filter((key) => key.color === "white")).toHaveLength(7);
    expect(PIANO_KEYS.filter((key) => key.color === "black")).toHaveLength(5);
    expect(PIANO_SPELLINGS).toHaveLength(17);
    expect(getPianoCatalog("treble")).toHaveLength(17);
    expect(getPianoCatalog("bass")).toHaveLength(17);
    expect(getPianoCatalog("tenor")).toHaveLength(17);
  });

  it("maps enharmonic spellings to the same black key", () => {
    expect(getPianoSpelling("do-sharp").keyId).toBe("c-sharp");
    expect(getPianoSpelling("re-flat").keyId).toBe("c-sharp");
    expect(getPianoSpelling("fa-sharp").keyId).toBe("f-sharp");
    expect(getPianoSpelling("sol-flat").keyId).toBe("f-sharp");
  });

  it("uses C4 to B4 for treble and tenor, and C3 to B3 for bass", () => {
    expect(getPianoKeyMidi("treble", "c")).toBe(60);
    expect(getPianoKeyMidi("tenor", "b")).toBe(71);
    expect(getPianoKeyMidi("bass", "c")).toBe(48);
    expect(getPianoKeyFrequency("treble", "a")).toBeCloseTo(440, 6);
    expect(getPianoKeyFrequency("bass", "a")).toBeCloseTo(220, 6);
  });

  it("avoids the previous question and the three recent spellings", () => {
    const previous = generateNextPianoQuestion(null, [], "treble", () => 0, 1);
    const next = generateNextPianoQuestion(
      previous,
      ["do", "do-sharp", "re-flat"],
      "treble",
      () => 0,
      2,
    );

    expect(["do", "do-sharp", "re-flat"]).not.toContain(next.notation.id);
    expect(next.id).toContain("piano-treble-2");
  });
});
