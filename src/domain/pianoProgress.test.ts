import { describe, expect, it } from "vitest";
import {
  createEmptyPianoProgress,
  normalizePianoProgress,
  recordPianoAnswer,
  recordRecentPianoQuestion,
  resetPianoProgress,
  summarizePianoProgress,
} from "./pianoProgress";

describe("piano progress", () => {
  it("records exact spellings independently for each clef", () => {
    const incorrect = recordPianoAnswer(
      createEmptyPianoProgress(),
      "treble",
      "re-flat",
      false,
      "2026-08-15T00:00:00.000Z",
    );

    expect(incorrect.clefs.treble.spellings["re-flat"]).toEqual({
      views: 1,
      correct: 0,
      errors: 1,
      needsReview: true,
      lastPracticedAt: "2026-08-15T00:00:00.000Z",
    });
    expect(incorrect.clefs.bass.spellings["re-flat"].views).toBe(0);
    expect(incorrect.clefs.treble.spellings["do-sharp"].views).toBe(0);
  });

  it("resolves a review after a correct answer without erasing errors", () => {
    const incorrect = recordPianoAnswer(createEmptyPianoProgress(), "tenor", "fa-sharp", false);
    const corrected = recordPianoAnswer(incorrect, "tenor", "fa-sharp", true);

    expect(corrected.clefs.tenor.spellings["fa-sharp"]).toMatchObject({
      views: 2,
      correct: 1,
      errors: 1,
      needsReview: false,
    });
  });

  it("normalizes corrupt counts and recent history", () => {
    const normalized = normalizePianoProgress({
      version: 1,
      clefs: {
        treble: {
          spellings: { do: { views: -2, correct: 2.8, errors: 1 } },
          recentHistory: ["unknown", "do", "re-flat", "fa-sharp", "si"],
        },
      },
    });

    expect(normalized.clefs.treble.spellings.do).toMatchObject({
      views: 0,
      correct: 2,
      errors: 1,
      needsReview: true,
    });
    expect(normalized.clefs.treble.recentHistory).toEqual(["re-flat", "fa-sharp", "si"]);
    expect(normalized.clefs.bass.spellings.do.views).toBe(0);
  });

  it("summarizes and resets only the requested clef", () => {
    const treble = recordPianoAnswer(createEmptyPianoProgress(), "treble", "do", false);
    const withBass = recordPianoAnswer(treble, "bass", "si-flat", true);
    const withHistory = recordRecentPianoQuestion(withBass, "treble", "do");
    const reset = resetPianoProgress(withHistory, "treble");

    expect(summarizePianoProgress(withBass, "treble")).toEqual({
      views: 1,
      correct: 0,
      errors: 1,
      needsReview: 1,
    });
    expect(reset.clefs.treble.recentHistory).toEqual([]);
    expect(reset.clefs.treble.spellings.do.views).toBe(0);
    expect(reset.clefs.bass.spellings["si-flat"].correct).toBe(1);
  });
});
