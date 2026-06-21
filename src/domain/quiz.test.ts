import { describe, expect, it } from "vitest";
import { getNoteById } from "./notes";
import { createEmptyProgress, recordAnswer } from "./progress";
import { createChoices, createQuestion, getReviewNotes, getUnlockedTrainingNotes } from "./quiz";

describe("quiz", () => {
  it("starts training with Mi, Sol and Si", () => {
    const unlockedNotes = getUnlockedTrainingNotes(createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["mi", "sol", "si"]);
  });

  it("unlocks Fa after several good answers", () => {
    const firstAnswer = recordAnswer(createEmptyProgress(), "mi", true);
    const secondAnswer = recordAnswer(firstAnswer, "sol", true);
    const thirdAnswer = recordAnswer(secondAnswer, "si", true);
    const unlockedNotes = getUnlockedTrainingNotes(thirdAnswer).map((note) => note.id);

    expect(unlockedNotes).toContain("fa");
  });

  it("avoids repeating the previous note when another note is available", () => {
    const question = createQuestion([getNoteById("mi"), getNoteById("sol")], "mi", () => 0);

    expect(question.note.id).toBe("sol");
  });

  it("creates four unique choices including the correct note", () => {
    const choices = createChoices(getNoteById("mi"), () => 0);
    const choiceIds = choices.map((choice) => choice.id);

    expect(choices).toHaveLength(4);
    expect(choiceIds).toContain("mi");
    expect(new Set(choiceIds).size).toBe(4);
  });

  it("prioritizes notes with the most errors in review", () => {
    const firstError = recordAnswer(createEmptyProgress(), "fa", false);
    const secondError = recordAnswer(firstError, "re", false);
    const thirdError = recordAnswer(secondError, "re", false);
    const reviewNotes = getReviewNotes(thirdError).map((note) => note.id);

    expect(reviewNotes[0]).toBe("re");
    expect(reviewNotes).toContain("fa");
  });
});
