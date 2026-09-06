import { describe, expect, it } from "vitest";
import { QUARTER_TICKS, RHYTHM_FIGURES, RHYTHM_NOTIONS, RHYTHM_PATTERNS } from "./rhythmPatterns";

describe("original rhythm catalogue", () => {
  it("contains twenty unique proposals, four per notion", () => {
    expect(RHYTHM_PATTERNS).toHaveLength(20);
    expect(new Set(RHYTHM_PATTERNS.map((pattern) => pattern.id)).size).toBe(20);
    Object.keys(RHYTHM_NOTIONS).forEach((notion) => {
      expect(RHYTHM_PATTERNS.filter((pattern) => pattern.notion === notion)).toHaveLength(4);
    });
  });

  it.each(RHYTHM_PATTERNS)("$id has two complete bars, valid ties and whole triplet groups", (pattern) => {
    expect(pattern.bars).toHaveLength(2);
    pattern.bars.forEach((bar) => {
      expect(bar.reduce((sum, event) => sum + RHYTHM_FIGURES[event.figure].ticks, 0)).toBe(pattern.beatsPerBar * QUARTER_TICKS);
      expect(bar.filter((event) => event.figure === "T").length % 3).toBe(0);
    });
    const events = pattern.bars.flat();
    events.forEach((event, index) => {
      if (event.tieToNext) {
        expect(events[index + 1]).toBeDefined();
        expect(["S", "DS"]).not.toContain(event.figure);
        expect(["S", "DS"]).not.toContain(events[index + 1].figure);
      }
    });
  });
});
