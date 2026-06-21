import { describe, expect, it } from "vitest";
import { createEmptyProgress, normalizeProgress, recordAnswer, resetProgress } from "./progress";

describe("progress", () => {
  it("records views, correct answers, errors and practice date", () => {
    const progress = recordAnswer(createEmptyProgress(), "mi", true, "2026-06-21T12:00:00.000Z");
    const updatedProgress = recordAnswer(progress, "mi", false, "2026-06-21T12:05:00.000Z");

    expect(updatedProgress.notes.mi.views).toBe(2);
    expect(updatedProgress.notes.mi.correct).toBe(1);
    expect(updatedProgress.notes.mi.errors).toBe(1);
    expect(updatedProgress.notes.mi.lastPracticedAt).toBe("2026-06-21T12:05:00.000Z");
  });

  it("normalizes missing notes and can reset everything", () => {
    const progress = normalizeProgress({
      notes: {
        mi: {
          views: 2,
          correct: 1,
          errors: 1,
          lastPracticedAt: "2026-06-21T12:00:00.000Z",
        },
      },
    });

    expect(progress.notes.mi.views).toBe(2);
    expect(progress.notes.sol.views).toBe(0);
    expect(resetProgress().notes.mi.views).toBe(0);
  });
});
