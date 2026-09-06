import { describe, expect, it } from "vitest";
import { analyzePulse, PRACTICE_BEATS } from "./pulse";

const sequence = (offset = 0, interval = 1) => Array.from({ length: PRACTICE_BEATS }, (_, index) => 10 + offset + index * interval);

describe("pulse feedback", () => {
  it("recognizes a regular series, including a constant audio/input delay", () => {
    for (const offset of [0, 0.15, -0.15]) {
      const result = analyzePulse(sequence(offset), 10, 1);
      expect(result).toMatchObject({ matched: 16, missed: 0, extra: 0, regularity: "steady", drift: "steady" });
      expect(result.intervalError).toBeCloseTo(0);
      expect(result.meanOffsetMs).toBeCloseTo(offset * 1000);
      expect(result.medianOffsetMs).toBeCloseTo(offset * 1000);
    }
  });
  it("counts missing and duplicate taps independently", () => {
    const result = analyzePulse([...sequence().slice(1), 11.1, 12.1], 10, 1);
    expect(result).toMatchObject({ matched: 15, missed: 1, extra: 2, regularity: "steady" });
  });
  it("does not mistake half-beat subdivisions for extra pulse targets", () => {
    const result = analyzePulse([...sequence(), ...sequence(0.5)], 10, 1);
    expect(result).toMatchObject({ matched: 16, extra: 16 });
    expect(result.message).toContain("une seule frappe");
  });
  it("does not reward an empty or very short attempt", () => {
    expect(analyzePulse([], 10, 1)).toMatchObject({ matched: 0, missed: 16, regularity: "insufficient", intervalError: null });
    expect(analyzePulse([10, 11, NaN], 10, 1).regularity).toBe("insufficient");
  });
  it("distinguishes irregular spacing from sustained drift", () => {
    expect(analyzePulse(sequence().map((time, index) => time + (index % 2 ? 0.2 : -0.2)), 10, 1).regularity).toBe("variable");
    expect(analyzePulse(sequence(0.15, 0.98), 10, 1).drift).toBe("faster");
    expect(analyzePulse(sequence(-0.15, 1.02), 10, 1).drift).toBe("slower");
  });
  it("scales with tempo and does not mutate recorded input", () => {
    const taps = sequence().map((time) => time / 2).reverse();
    const original = [...taps];
    expect(analyzePulse(taps, 5, 0.5).matched).toBe(16);
    expect(taps).toEqual(original);
  });
  it("computes distinct signed means and medians for odd and even sample counts", () => {
    const odd = analyzePulse([10.1, 10.98, 12.3], 10, 1);
    expect(odd.meanOffsetMs).toBeCloseTo(380 / 3);
    expect(odd.medianOffsetMs).toBeCloseTo(100);
    const even = analyzePulse([10.1, 10.98, 12.3, 13.04], 10, 1);
    expect(even.meanOffsetMs).toBeCloseTo(105);
    expect(even.medianOffsetMs).toBeCloseTo(70);
  });
  it("excludes unmatched taps and duplicates, and uses milliseconds at any tempo", () => {
    const result = analyzePulse([10.3, 10.1, 10.25, 10.5, 11.05, 50, NaN], 10, 0.5);
    expect(result).toMatchObject({ matched: 3, missed: 13, extra: 3 });
    expect(result.meanOffsetMs).toBeCloseTo(50);
    expect(result.medianOffsetMs).toBeCloseTo(50);
  });
  it("distinguishes no sample from a single tap exactly on the pulse", () => {
    expect(analyzePulse([], 10, 1)).toMatchObject({ meanOffsetMs: null, medianOffsetMs: null });
    expect(analyzePulse([10], 10, 1)).toMatchObject({ meanOffsetMs: 0, medianOffsetMs: 0 });
  });
});
