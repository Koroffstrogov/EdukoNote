import { describe, expect, it } from "vitest";
import {
  createEmptyProgress,
  normalizeProgress,
  recordAnswer,
  recordRecentQuestion,
  resetProgress,
} from "./progress";

describe("progress", () => {
  it("records views, correct answers, errors and practice date inside the active clef", () => {
    const progress = recordAnswer(createEmptyProgress(), "treble", "mi4", true, "2026-06-21T12:00:00.000Z");
    const updatedProgress = recordAnswer(progress, "treble", "mi4", false, "2026-06-21T12:05:00.000Z");

    expect(updatedProgress.clefs.treble.notes.mi4.views).toBe(2);
    expect(updatedProgress.clefs.treble.notes.mi4.correct).toBe(1);
    expect(updatedProgress.clefs.treble.notes.mi4.errors).toBe(1);
    expect(updatedProgress.clefs.treble.notes.mi4.lastPracticedAt).toBe("2026-06-21T12:05:00.000Z");
    expect(updatedProgress.clefs.bass.notes["bass-mi3"].views).toBe(0);
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
    expect(progress.clefs.treble.notes.mi4.views).toBe(2);
    expect(progress.clefs.treble.notes.sol4.views).toBe(0);
    expect(progress.clefs.bass.notes["bass-mi3"].views).toBe(0);
  });

  it("records bass answers without changing treble scores", () => {
    const progress = recordAnswer(createEmptyProgress(), "bass", "bass-fa3", false, "2026-06-21T12:00:00.000Z");

    expect(progress.clefs.bass.notes["bass-fa3"].views).toBe(1);
    expect(progress.clefs.bass.notes["bass-fa3"].errors).toBe(1);
    expect(progress.clefs.treble.notes.fa4.views).toBe(0);
    expect(progress.clefs.treble.notes.fa4.errors).toBe(0);
  });

  it("resets only the requested clef", () => {
    const trebleAnswer = recordAnswer(createEmptyProgress(), "treble", "mi4", true);
    const bassAnswer = recordAnswer(trebleAnswer, "bass", "bass-fa3", false);
    const resetBass = resetProgress(bassAnswer, "bass");

    expect(resetBass.clefs.treble.notes.mi4.views).toBe(1);
    expect(resetBass.clefs.bass.notes["bass-fa3"].views).toBe(0);
  });

  it("keeps recent history separate by clef", () => {
    const trebleHistory = recordRecentQuestion(createEmptyProgress(), "treble", "mi4");
    const mixedHistory = recordRecentQuestion(trebleHistory, "bass", "bass-fa3");

    expect(mixedHistory.clefs.treble.recentHistory).toEqual(["mi4"]);
    expect(mixedHistory.clefs.bass.recentHistory).toEqual(["bass-fa3"]);
  });
});
