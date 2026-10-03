import { describe, expect, it } from "vitest";
import { CLEFS, getNotesForClef, type Clef } from "./notes";
import { createEmptyProgress, normalizeProgress, recordAnswer, recordReadingAward, resetProgress, type ProgressState } from "./progress";
import { isNoteMastered, summarizeMastery } from "./noteMastery";
import { createJourneyPlan, medianResponseTime } from "./noteJourney";

function master(progress: ProgressState, clef: Clef) {
  for (const note of getNotesForClef(clef)) for (const date of ["2026-10-01T10:00:00Z", "2026-10-01T11:00:00Z", "2026-10-02T10:00:00Z"]) progress = recordAnswer(progress, clef, note.id, true, date);
  return progress;
}
describe("note mastery and daily plans", () => {
  it("requires three consecutive successes across two days for the exact note and octave", () => {
    let progress = createEmptyProgress();
    for (let i = 0; i < 3; i++) progress = recordAnswer(progress, "treble", "do4", true, "2026-10-01T10:00:00Z");
    expect(isNoteMastered(progress.clefs.treble.notes.do4)).toBe(false);
    progress = recordAnswer(progress, "treble", "do4", true, "2026-10-02T10:00:00Z");
    expect(isNoteMastered(progress.clefs.treble.notes.do4)).toBe(true);
    expect(isNoteMastered(progress.clefs.treble.notes.do5)).toBe(false);
    // More practice on the confirming day must not erase an earned confirmation.
    for (let i = 0; i < 5; i++) progress = recordAnswer(progress, "treble", "do4", true, "2026-10-02T11:00:00Z");
    expect(isNoteMastered(normalizeProgress(progress).clefs.treble.notes.do4)).toBe(true);
    progress = recordAnswer(progress, "treble", "do4", false);
    expect(isNoteMastered(progress.clefs.treble.notes.do4)).toBe(false);
    expect(progress.clefs.treble.notes.do4?.errors).toBe(1);
  });
  it.each(CLEFS)("earns separate zone badges and a full-range exam in %s", (clef) => {
    const progress = master(createEmptyProgress(), clef);
    expect(Object.keys(progress.clefs[clef].badges!)).toHaveLength(3);
    expect(summarizeMastery(progress, clef)).toMatchObject({ mastered: 15, total: 15, complete: true });
    const plan = createJourneyPlan("exam", progress, clef, "lower", () => 0.25)!;
    expect(plan.zone).toBe("full");
    expect(new Set(plan.questions.map((q) => q.note.id)).size).toBe(15);
    expect(plan.questions.every((q) => q.note.clef === clef && q.choices.length === 7)).toBe(true);
    const answers = plan.questions.map((q, index) => ({ questionNumber: index + 1, noteId: q.note.id, noteLabel: q.note.answerLabel, selectedLabel: q.note.answerLabel, isCorrect: true }));
    expect(recordReadingAward(progress, clef, "exam", answers.slice(1), null)).toBe(progress);
    const awarded = recordReadingAward(progress, clef, "exam", answers, null);
    expect(awarded.clefs[clef].examPassedAt).toBeTruthy();
    expect(recordReadingAward(progress, clef, "exam", [...answers.slice(1), answers[1]], null)).toBe(progress);
    const missed = recordAnswer(awarded, clef, plan.questions[0].note.id, false);
    expect(missed.clefs[clef].badges?.full).toBeTruthy();
    expect(missed.clefs[clef].examPassedAt).toBeTruthy();
    expect(resetProgress(missed, clef).clefs[clef].badges).toBeUndefined();
    const anotherClef = CLEFS.find((item) => item !== clef)!;
    expect(progress.clefs[anotherClef].badges).toBeUndefined();
  });
  it("preserves legacy counters without inventing spaced practice or badges", () => {
    const progress = normalizeProgress({ version: 2, clefs: { treble: { notes: { mi4: { correct: 50, views: 55, errors: 5, needsReview: false } } } } });
    expect(progress.clefs.treble.notes.mi4?.correct).toBe(50);
    expect(isNoteMastered(progress.clefs.treble.notes.mi4)).toBe(false);
    expect(progress.clefs.treble.badges).toBeUndefined();
    const mastered = master(progress, "treble");
    expect(normalizeProgress(JSON.parse(JSON.stringify(mastered)))).toEqual(mastered);
  });
  it("cannot bypass the exam lock and respects the chosen zone in short series", () => {
    const progress = createEmptyProgress();
    expect(createJourneyPlan("exam", progress, "treble", "full")).toBeNull();
    for (const mode of ["daily", "fluency"] as const) {
      const plan = createJourneyPlan(mode, progress, "bass", "upper", () => 0)!;
      expect(plan.questions).toHaveLength(10);
      expect(plan.questions.every((q) => q.note.practiceRange === "upper" && q.note.clef === "bass")).toBe(true);
      expect(plan.questions.every((q, i) => i === 0 || q.note.id !== plan.questions[i - 1].note.id)).toBe(true);
    }
  });
  it("prioritizes fragile notes while diversifying and introduces no more than two new notes after the first series", () => {
    let progress = createEmptyProgress();
    for (const id of ["mi4", "sol4", "si4", "do5", "re5"] as const) for (let i = 0; i < 3; i++) progress = recordAnswer(progress, "treble", id, true, "2026-10-01T10:00:00Z");
    progress = recordAnswer(progress, "treble", "re5", false, "2026-10-02T10:00:00Z");
    const plan = createJourneyPlan("daily", progress, "treble", "full", () => 0, "2026-10-02")!;
    expect(plan.questions[0].note.id).toBe("re5");
    const newNotes = new Set(plan.questions.filter((q) => !progress.clefs.treble.notes[q.note.id]?.views).map((q) => q.note.id));
    expect(newNotes.size).toBeLessThanOrEqual(2);
    expect(new Set(plan.questions.map((q) => q.note.id)).size).toBeGreaterThan(4);
  });
  it("computes median response time without treating invalid values as a record", () => {
    expect(medianResponseTime([1000, 2000, 3000, 10000])).toBe(2500);
    expect(medianResponseTime([NaN, 0])).toBeNull();
  });
  it("keeps fluency records separate by zone and only for complete, correct, uninterrupted series", () => {
    const progress = createEmptyProgress();
    const plan = createJourneyPlan("fluency", progress, "treble", "lower")!;
    const answers = plan.questions.map((q, index) => ({ questionNumber: index + 1, noteId: q.note.id, noteLabel: q.note.answerLabel, selectedLabel: q.note.answerLabel, isCorrect: true }));
    const first = recordReadingAward(progress, "treble", "fluency", answers, 2000, undefined, "lower");
    const slower = recordReadingAward(first, "treble", "fluency", answers, 3000, undefined, "lower");
    expect(slower.clefs.treble.bestFluencyMsByZone).toEqual({ lower: 2000 });
    const full = recordReadingAward(first, "treble", "fluency", answers, 4000);
    expect(full.clefs.treble.bestFluencyMsByZone).toEqual({ lower: 2000, full: 4000 });
    expect(normalizeProgress(full)).toEqual(full);
    expect(recordReadingAward(full, "treble", "fluency", answers, null)).toBe(full);
    expect(recordReadingAward(full, "treble", "fluency", answers.slice(1), 100)).toBe(full);
    expect(recordReadingAward(full, "treble", "fluency", [{ ...answers[0], isCorrect: false }, ...answers.slice(1)], 100)).toBe(full);
    expect(full.clefs.bass.bestFluencyMsByZone).toBeUndefined();
  });
});
