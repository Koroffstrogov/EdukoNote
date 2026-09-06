import { describe, expect, it } from "vitest";
import { RHYTHM_PATTERNS } from "./rhythmPatterns";
import { analyzeRhythm, buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS, getPatternAttacks, getRhythmPattern, normalizeRhythmSettings } from "./rhythmExercise";

describe("shared rhythm plans", () => {
  it("builds pulse, echo and reading phases on one musical timeline", () => {
    const pulse = buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS);
    expect(pulse.targets).toHaveLength(16);
    expect(pulse.tones).toHaveLength(20);
    const echo = buildRhythmPlan({ ...DEFAULT_RHYTHM_SETTINGS, mode: "echo", patternId: "R06" });
    expect(echo.stages).toEqual([{ phase: "count-in", from: 0, length: 3 }, { phase: "listening", from: 3, length: 6 }, { phase: "count-in", from: 9, length: 3 }, { phase: "playing", from: 12, length: 6 }]);
    expect(echo.tones.filter((tone) => tone.kind === "model").every((tone) => tone.beat >= 3 && tone.beat < 9)).toBe(true);
    const read = buildRhythmPlan({ ...echo.settings, mode: "read", metronome: false });
    expect(read.responseAt).toBe(3);
    expect(read.tones).toHaveLength(3);
    expect(read.tones.every((tone) => tone.kind === "click" && tone.beat < read.responseAt)).toBe(true);
  });
  it("merges tied durations across bar lines and removes rest attacks", () => {
    expect(getPatternAttacks(getRhythmPattern("R16"))).toEqual([{ beat: 0, duration: 2 }, { beat: 2, duration: 1 }, { beat: 3, duration: 2 }, { beat: 5, duration: 1 }, { beat: 6, duration: 2 }]);
    expect(getPatternAttacks(getRhythmPattern("R09")).map((attack) => attack.beat)).toEqual([0, 3]);
    expect(getPatternAttacks(getRhythmPattern("R15")).map((attack) => attack.beat)).not.toContain(2);
  });
  it.each(RHYTHM_PATTERNS)("evaluates exact attacks for $id in both formula modes", (pattern) => {
    for (const mode of ["echo", "read"] as const) {
      const plan = buildRhythmPlan({ ...DEFAULT_RHYTHM_SETTINGS, mode, patternId: pattern.id });
      const result = analyzeRhythm(plan.targets.map((beat) => 10 + beat * 60 / 72), 10, 60 / 72, plan);
      expect(result).toMatchObject({ success: true, matched: plan.targets.length, missed: 0, extra: 0 });
      expect(result.meanOffsetMs).toBeCloseTo(0);
    }
  });
  it("counts taps in silences and on tied continuations as extra", () => {
    for (const [id, extraBeat] of [["R09", 1], ["R16", 4]] as const) {
      const plan = buildRhythmPlan({ ...DEFAULT_RHYTHM_SETTINGS, mode: "read", patternId: id });
      expect(analyzeRhythm([...plan.targets, extraBeat], 0, 1, plan)).toMatchObject({ success: false, missed: 0, extra: 1 });
    }
  });
  it("does not confuse sixteenth subdivisions with a pulse or reuse one tap twice", () => {
    const plan = buildRhythmPlan({ ...DEFAULT_RHYTHM_SETTINGS, mode: "read", patternId: "R17" });
    const result = analyzeRhythm([0, 0.02, 0.125, 0.25, 0.5, 0.75, 1, 2, 3, 3.25, 3.5, 3.75], 0, 1, plan);
    expect(result.matched).toBe(plan.targets.length);
    expect(result.extra).toBe(2);
  });
  it("uses valid defaults for corrupt settings without coercing strings", () => {
    expect(normalizeRhythmSettings({ mode: "invalid", tempo: "90", patternId: "unknown", visualGuide: "false" })).toEqual(DEFAULT_RHYTHM_SETTINGS);
  });
});
