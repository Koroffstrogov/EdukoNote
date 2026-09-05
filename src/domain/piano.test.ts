import { describe, expect, it } from "vitest";
import {
  FREE_PIANO_KEYS,
  PIANO_KEYS,
  PIANO_SPELLINGS,
  generateNextPianoQuestion,
  getFreePianoKeyByKeyboardCode,
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

  it("defines a fixed two-octave free piano from C4 to B5", () => {
    expect(FREE_PIANO_KEYS).toHaveLength(24);
    expect(FREE_PIANO_KEYS.filter((key) => key.color === "white")).toHaveLength(14);
    expect(FREE_PIANO_KEYS.filter((key) => key.color === "black")).toHaveLength(10);
    expect(FREE_PIANO_KEYS[0]).toMatchObject({
      id: "c-4",
      label: "Do4",
      midi: 60,
      shortcut: "A",
      keyboardCode: "KeyQ",
    });
    expect(FREE_PIANO_KEYS[FREE_PIANO_KEYS.length - 1]).toMatchObject({
      id: "b-5",
      label: "Si5",
      midi: 83,
      shortcut: "*",
      keyboardCode: "Backslash",
    });
    expect(FREE_PIANO_KEYS.find((key) => key.id === "c-sharp-4")?.label)
      .toBe("Do♯4 / Ré♭4");
    expect(FREE_PIANO_KEYS.find((key) => key.id === "a-4")?.frequency).toBeCloseTo(440, 6);
  });

  it("maps the two AZERTY rows to every free piano key", () => {
    const keyboardCodes = FREE_PIANO_KEYS.map((key) => key.keyboardCode);

    expect(new Set(keyboardCodes).size).toBe(24);
    expect(getFreePianoKeyByKeyboardCode("KeyQ")?.id).toBe("c-4");
    expect(getFreePianoKeyByKeyboardCode("KeyA")?.id).toBe("c-5");
    expect(getFreePianoKeyByKeyboardCode("Space")).toBeNull();
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
