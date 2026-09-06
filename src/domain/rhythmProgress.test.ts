import { describe, expect, it } from "vitest";
import { analyzeRhythm, buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS } from "./rhythmExercise";
import { emptyRhythmProgress, normalizeRhythmProgress, recordRhythmSession, rhythmProgressKey } from "./rhythmProgress";

function attempt(id: string, success: boolean, settings = DEFAULT_RHYTHM_SETTINGS) {
  const plan = buildRhythmPlan(settings);
  return { id, plan, result: analyzeRhythm(success ? plan.targets : [], 0, 1, plan), finishedAt: "2026-09-06T12:00:00.000Z" };
}
describe("local rhythm progress", () => {
  it("keeps historical errors when a successful session clears review and ignores duplicates", () => {
    const failed = recordRhythmSession(emptyRhythmProgress(), attempt("a", false));
    const good = attempt("b", true);
    const progress = recordRhythmSession(failed, good);
    expect(progress.entries[rhythmProgressKey(DEFAULT_RHYTHM_SETTINGS)]).toMatchObject({ attempts: 2, errors: 1, correct: 1, needsReview: false, bestCoverage: 1, lastMeanOffsetMs: 0 });
    expect(recordRhythmSession(progress, good)).toBe(progress);
  });
  it("separates modes, formulas, tempos and aids", () => {
    let progress = emptyRhythmProgress();
    const settings = [DEFAULT_RHYTHM_SETTINGS, { ...DEFAULT_RHYTHM_SETTINGS, mode: "echo" as const }, { ...DEFAULT_RHYTHM_SETTINGS, mode: "read" as const }, { ...DEFAULT_RHYTHM_SETTINGS, tempo: 90 as const }, { ...DEFAULT_RHYTHM_SETTINGS, visualGuide: false }, { ...DEFAULT_RHYTHM_SETTINGS, mode: "echo" as const, metronome: false }, { ...DEFAULT_RHYTHM_SETTINGS, mode: "read" as const, patternId: "R05" }];
    settings.forEach((value, index) => { progress = recordRhythmSession(progress, attempt(String(index), true, value)); });
    expect(Object.keys(progress.entries)).toHaveLength(7);
    expect(normalizeRhythmProgress(JSON.parse(JSON.stringify(progress)))).toEqual(progress);
  });
  it("normalizes malformed counters and ignores unknown entries or future versions", () => {
    const progress = recordRhythmSession(emptyRhythmProgress(), attempt("a", false));
    const key = rhythmProgressKey(DEFAULT_RHYTHM_SETTINGS);
    const raw = { ...progress, entries: { ...progress.entries, unknown: progress.entries[key], [key]: { ...progress.entries[key], correct: -1, errors: 2, attempts: 999, bestCoverage: Infinity, lastMeanOffsetMs: NaN } } };
    expect(normalizeRhythmProgress(raw).entries[key]).toMatchObject({ correct: 0, errors: 2, attempts: 2, bestCoverage: 0, lastMeanOffsetMs: null });
    expect(Object.keys(normalizeRhythmProgress(raw).entries)).toEqual([key]);
    expect(normalizeRhythmProgress({ ...raw, version: 2 })).toEqual(emptyRhythmProgress());
    expect(normalizeRhythmProgress(null)).toEqual(emptyRhythmProgress());
  });
});
