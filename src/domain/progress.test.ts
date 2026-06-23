import { describe, expect, it } from "vitest";
import {
  countTotalCorrect,
  countTotalErrors,
  countTotalViews,
  createEmptyProgress,
  normalizeProgress,
  recordAnswer,
  recordRecentQuestion,
  resetProgress,
} from "./progress";

describe("progress", () => {
  it("initializes each clef with only its own notes", () => {
    const progress = createEmptyProgress();

    expect(Object.keys(progress.clefs.treble.notes)).toEqual([
      "do4",
      "re4",
      "mi4",
      "fa4",
      "sol4",
      "la4",
      "si4",
      "do5",
      "re5",
      "mi5",
      "fa5",
      "sol5",
      "la5",
      "si5",
      "do6",
    ]);
    expect(Object.keys(progress.clefs.bass.notes)).toEqual([
      "bass-do2",
      "bass-re2",
      "bass-mi2",
      "bass-fa2",
      "bass-sol2",
      "bass-la2",
      "bass-si2",
      "bass-do3",
      "bass-re3",
      "bass-mi3",
      "bass-fa3",
      "bass-sol3",
      "bass-la3",
      "bass-si3",
      "bass-do4",
    ]);
    expect(Object.keys(progress.clefs.tenor.notes)).toEqual([
      "tenor-do3",
      "tenor-re3",
      "tenor-mi3",
      "tenor-fa3",
      "tenor-sol3",
      "tenor-la3",
      "tenor-si3",
      "tenor-do4",
      "tenor-re4",
      "tenor-mi4",
      "tenor-fa4",
      "tenor-sol4",
      "tenor-la4",
      "tenor-si4",
      "tenor-do5",
    ]);
    expect(progress.clefs.treble.notes["bass-fa3"]).toBeUndefined();
    expect(progress.clefs.bass.notes.mi4).toBeUndefined();
    expect(progress.clefs.tenor.notes.mi4).toBeUndefined();
  });

  it("records views, correct answers, errors and practice date inside the active clef", () => {
    const progress = recordAnswer(createEmptyProgress(), "treble", "mi4", true, "2026-06-21T12:00:00.000Z");
    const updatedProgress = recordAnswer(progress, "treble", "mi4", false, "2026-06-21T12:05:00.000Z");

    expect(updatedProgress.clefs.treble.notes.mi4?.views).toBe(2);
    expect(updatedProgress.clefs.treble.notes.mi4?.correct).toBe(1);
    expect(updatedProgress.clefs.treble.notes.mi4?.errors).toBe(1);
    expect(updatedProgress.clefs.treble.notes.mi4?.lastPracticedAt).toBe("2026-06-21T12:05:00.000Z");
    expect(updatedProgress.clefs.bass.notes["bass-mi3"]?.views).toBe(0);
    expect(updatedProgress.clefs.tenor.notes["tenor-mi4"]?.views).toBe(0);
  });

  it("migrates legacy v1 progress into treble without initializing bass scores", () => {
    const progress = normalizeProgress(null, {
      version: 1,
      notes: {
        mi: {
          views: 2,
          correct: 1,
          errors: 1,
          lastPracticedAt: "2026-06-21T12:00:00.000Z",
        },
      },
    });

    expect(progress.version).toBe(2);
    expect(progress.activeClef).toBe("treble");
    expect(progress.clefs.treble.notes.mi4?.views).toBe(2);
    expect(progress.clefs.treble.notes.sol4?.views).toBe(0);
    expect(progress.clefs.treble.notes["bass-mi3"]).toBeUndefined();
    expect(progress.clefs.bass.notes["bass-mi3"]?.views).toBe(0);
    expect(progress.clefs.bass.notes.mi4).toBeUndefined();
    expect(progress.clefs.tenor.notes["tenor-do4"]?.views).toBe(0);
    expect(progress.clefs.tenor.notes.mi4).toBeUndefined();
  });

  it("records bass answers without changing treble scores", () => {
    const progress = recordAnswer(createEmptyProgress(), "bass", "bass-fa3", false, "2026-06-21T12:00:00.000Z");

    expect(progress.clefs.bass.notes["bass-fa3"]?.views).toBe(1);
    expect(progress.clefs.bass.notes["bass-fa3"]?.errors).toBe(1);
    expect(progress.clefs.treble.notes.fa4?.views).toBe(0);
    expect(progress.clefs.treble.notes.fa4?.errors).toBe(0);
    expect(progress.clefs.tenor.notes["tenor-fa4"]?.views).toBe(0);
    expect(countTotalViews(progress, "treble")).toBe(0);
    expect(countTotalErrors(progress, "treble")).toBe(0);
    expect(countTotalViews(progress, "tenor")).toBe(0);
  });

  it("records treble answers without changing bass scores", () => {
    const progress = recordAnswer(createEmptyProgress(), "treble", "mi4", true, "2026-06-21T12:00:00.000Z");

    expect(progress.clefs.treble.notes.mi4?.views).toBe(1);
    expect(progress.clefs.treble.notes.mi4?.correct).toBe(1);
    expect(progress.clefs.bass.notes["bass-mi3"]?.views).toBe(0);
    expect(progress.clefs.tenor.notes["tenor-mi4"]?.views).toBe(0);
    expect(countTotalViews(progress, "bass")).toBe(0);
    expect(countTotalCorrect(progress, "bass")).toBe(0);
    expect(countTotalViews(progress, "tenor")).toBe(0);
  });

  it("records tenor answers without changing treble or bass scores", () => {
    const progress = recordAnswer(createEmptyProgress(), "tenor", "tenor-do4", true, "2026-06-21T12:00:00.000Z");

    expect(progress.clefs.tenor.notes["tenor-do4"]?.views).toBe(1);
    expect(progress.clefs.tenor.notes["tenor-do4"]?.correct).toBe(1);
    expect(progress.clefs.treble.notes.do4?.views).toBe(0);
    expect(progress.clefs.bass.notes["bass-do3"]?.views).toBe(0);
    expect(countTotalViews(progress, "treble")).toBe(0);
    expect(countTotalViews(progress, "bass")).toBe(0);
  });

  it("refuses to record a note in the wrong clef compartment", () => {
    const emptyProgress = createEmptyProgress();
    const bassWithTrebleNote = recordAnswer(emptyProgress, "bass", "mi4", true);
    const trebleWithBassNote = recordAnswer(emptyProgress, "treble", "bass-fa3", true);
    const tenorWithTrebleNote = recordAnswer(emptyProgress, "tenor", "mi4", true);
    const trebleWithTenorNote = recordAnswer(emptyProgress, "treble", "tenor-do4", true);

    expect(bassWithTrebleNote).toBe(emptyProgress);
    expect(trebleWithBassNote).toBe(emptyProgress);
    expect(tenorWithTrebleNote).toBe(emptyProgress);
    expect(trebleWithTenorNote).toBe(emptyProgress);
    expect(countTotalViews(bassWithTrebleNote, "bass")).toBe(0);
    expect(countTotalViews(trebleWithBassNote, "treble")).toBe(0);
    expect(countTotalViews(tenorWithTrebleNote, "tenor")).toBe(0);
  });

  it("resets only the requested clef", () => {
    const trebleAnswer = recordAnswer(createEmptyProgress(), "treble", "mi4", true);
    const bassAnswer = recordAnswer(trebleAnswer, "bass", "bass-fa3", false);
    const resetBass = resetProgress(bassAnswer, "bass");

    expect(resetBass.clefs.treble.notes.mi4?.views).toBe(1);
    expect(resetBass.clefs.bass.notes["bass-fa3"]?.views).toBe(0);
    expect(resetBass.clefs.bass.notes.mi4).toBeUndefined();
    expect(resetBass.clefs.tenor.notes["tenor-do4"]?.views).toBe(0);
  });

  it("keeps recent history separate by clef", () => {
    const trebleHistory = recordRecentQuestion(createEmptyProgress(), "treble", "mi4");
    const mixedHistory = recordRecentQuestion(trebleHistory, "bass", "bass-fa3");
    const tenorHistory = recordRecentQuestion(mixedHistory, "tenor", "tenor-do4");

    expect(tenorHistory.clefs.treble.recentHistory).toEqual(["mi4"]);
    expect(tenorHistory.clefs.bass.recentHistory).toEqual(["bass-fa3"]);
    expect(tenorHistory.clefs.tenor.recentHistory).toEqual(["tenor-do4"]);
  });

  it("normalizes existing v2 progress by removing notes from the wrong compartment", () => {
    const progress = normalizeProgress({
      version: 2,
      activeClef: "bass",
      clefs: {
        treble: {
          notes: {
            mi4: {
              views: 3,
              correct: 2,
              errors: 1,
              lastPracticedAt: "2026-06-21T12:00:00.000Z",
            },
            "bass-fa3": {
              views: 9,
              correct: 9,
              errors: 0,
              lastPracticedAt: "2026-06-21T13:00:00.000Z",
            },
          },
          recentHistory: ["mi4", "bass-fa3"],
        },
        bass: {
          notes: {
            "bass-fa3": {
              views: 4,
              correct: 1,
              errors: 3,
              lastPracticedAt: "2026-06-21T14:00:00.000Z",
            },
            mi4: {
              views: 8,
              correct: 8,
              errors: 0,
              lastPracticedAt: "2026-06-21T15:00:00.000Z",
            },
          },
          recentHistory: ["bass-fa3", "mi4"],
        },
      },
    });

    expect(progress.activeClef).toBe("bass");
    expect(progress.clefs.treble.notes.mi4?.views).toBe(3);
    expect(progress.clefs.treble.notes["bass-fa3"]).toBeUndefined();
    expect(progress.clefs.treble.recentHistory).toEqual(["mi4"]);
    expect(progress.clefs.bass.notes["bass-fa3"]?.views).toBe(4);
    expect(progress.clefs.bass.notes.mi4).toBeUndefined();
    expect(progress.clefs.bass.recentHistory).toEqual(["bass-fa3"]);
    expect(progress.clefs.tenor.notes["tenor-do4"]?.views).toBe(0);
    expect(progress.clefs.tenor.recentHistory).toEqual([]);
  });
});
