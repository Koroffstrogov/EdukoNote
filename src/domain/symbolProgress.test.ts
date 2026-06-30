import { describe, expect, it } from "vitest";
import {
  SYMBOL_PROGRESS_STORAGE_KEY,
  countTotalSymbolCorrect,
  countTotalSymbolErrors,
  countTotalSymbolViews,
  createEmptySymbolProgressState,
  getSymbolReviewPool,
  normalizeSymbolProgress,
  recordRecentSymbol,
  recordSymbolAnswer,
  resetSymbolProgress,
} from "./symbolProgress";

describe("symbolProgress", () => {
  it("initializes all MVP symbols", () => {
    const progress = createEmptySymbolProgressState();

    expect(Object.keys(progress.symbols)).toEqual([
      "staff",
      "treble-clef",
      "bass-clef",
      "c-clef",
      "bar-line",
      "double-bar-line",
      "whole-note",
      "half-note",
      "quarter-note",
      "eighth-note",
      "beamed-eighth-notes",
      "augmentation-dot",
      "quarter-rest",
      "sharp",
      "flat",
      "natural",
    ]);
    expect(progress.recentHistory).toEqual([]);
  });

  it("normalizes invalid stored progress", () => {
    const progress = normalizeSymbolProgress({
      version: 99,
      symbols: {
        staff: {
          views: 2.8,
          correct: 1,
          errors: -3,
          lastSeenAt: "2026-06-30T12:00:00.000Z",
        },
        unknown: {
          views: 10,
          correct: 10,
          errors: 10,
        },
      },
      recentHistory: ["unknown", "staff", "sharp"],
    });

    expect(progress.version).toBe(1);
    expect(progress.symbols.staff?.views).toBe(2);
    expect(progress.symbols.staff?.correct).toBe(1);
    expect(progress.symbols.staff?.errors).toBe(0);
    expect(progress.symbols.staff?.lastSeenAt).toBe("2026-06-30T12:00:00.000Z");
    expect((progress.symbols as Record<string, unknown>).unknown).toBeUndefined();
    expect(progress.recentHistory).toEqual(["staff", "sharp"]);
  });

  it("records views, correct answers, errors and last seen date", () => {
    const firstAnswer = recordSymbolAnswer(
      createEmptySymbolProgressState(),
      "staff",
      true,
      "2026-06-30T12:00:00.000Z",
    );
    const secondAnswer = recordSymbolAnswer(firstAnswer, "staff", false, "2026-06-30T12:05:00.000Z");

    expect(secondAnswer.symbols.staff?.views).toBe(2);
    expect(secondAnswer.symbols.staff?.correct).toBe(1);
    expect(secondAnswer.symbols.staff?.errors).toBe(1);
    expect(secondAnswer.symbols.staff?.lastSeenAt).toBe("2026-06-30T12:05:00.000Z");
    expect(countTotalSymbolViews(secondAnswer)).toBe(2);
    expect(countTotalSymbolCorrect(secondAnswer)).toBe(1);
    expect(countTotalSymbolErrors(secondAnswer)).toBe(1);
  });

  it("keeps recent history limited to three symbols", () => {
    const progress = recordRecentSymbol(
      recordRecentSymbol(recordRecentSymbol(recordRecentSymbol(createEmptySymbolProgressState(), "staff"), "treble-clef"), "bass-clef"),
      "bar-line",
    );

    expect(progress.recentHistory).toEqual(["treble-clef", "bass-clef", "bar-line"]);
  });

  it("returns review symbols ordered by errors", () => {
    const progress = recordSymbolAnswer(
      recordSymbolAnswer(recordSymbolAnswer(createEmptySymbolProgressState(), "staff", false), "staff", false),
      "sharp",
      false,
    );

    expect(getSymbolReviewPool(progress).map((symbol) => symbol.id)).toEqual(["staff", "sharp"]);
  });

  it("resets only symbol progress and uses a separate storage key", () => {
    const progress = recordSymbolAnswer(createEmptySymbolProgressState(), "staff", true);
    const resetProgress = resetSymbolProgress();

    expect(progress.symbols.staff?.views).toBe(1);
    expect(resetProgress.symbols.staff?.views).toBe(0);
    expect(SYMBOL_PROGRESS_STORAGE_KEY).toBe("edukonote.symbolProgress.v1");
    expect(SYMBOL_PROGRESS_STORAGE_KEY).not.toBe("edukonote.progress.v2");
  });
});
