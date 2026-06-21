import { describe, expect, it } from "vitest";
import { ANSWER_LABELS, getNoteById } from "./notes";
import { createEmptyProgress, recordAnswer } from "./progress";
import { createChoices, generateNextQuestion, getReviewNotes, getUnlockedTrainingNotes } from "./quiz";

describe("quiz", () => {
  it("starts training with a varied first pool", () => {
    const unlockedNotes = getUnlockedTrainingNotes(createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["mi4", "sol4", "si4", "do5", "re5"]);
  });

  it("unlocks Fa and La after a few good answers", () => {
    const firstAnswer = recordAnswer(createEmptyProgress(), "mi4", true);
    const secondAnswer = recordAnswer(firstAnswer, "sol4", true);
    const unlockedNotes = getUnlockedTrainingNotes(secondAnswer).map((note) => note.id);

    expect(unlockedNotes).toContain("fa4");
    expect(unlockedNotes).toContain("la4");
  });

  it("generates a different next internal note when several notes are available", () => {
    const previousQuestion = generateNextQuestion(null, [], [getNoteById("mi4"), getNoteById("sol4")], "training", () => 0, 1);
    const nextQuestion = generateNextQuestion(previousQuestion, [previousQuestion.note.id], [getNoteById("mi4"), getNoteById("sol4")], "training", () => 0, 2);

    expect(nextQuestion.note.id).toBe("sol4");
    expect(nextQuestion.note.id).not.toBe(previousQuestion.note.id);
  });

  it("avoids recent internal notes when possible", () => {
    const nextQuestion = generateNextQuestion(
      null,
      ["mi4", "sol4", "si4"],
      [getNoteById("mi4"), getNoteById("sol4"), getNoteById("si4"), getNoteById("do5")],
      "training",
      () => 0,
      4,
    );

    expect(nextQuestion.note.id).toBe("do5");
  });

  it("creates four unique answer labels including the correct answer", () => {
    const choices = createChoices(getNoteById("do6"), () => 0);

    expect(choices).toHaveLength(4);
    expect(choices).toContain("Do");
    expect(new Set(choices).size).toBe(4);
  });

  it("only exposes the seven plain note names as answer labels", () => {
    const question = generateNextQuestion(null, [], [getNoteById("do6")], "challenge", () => 0, 1);

    expect(question.note.answerLabel).toBe("Do");
    expect(question.choices.every((choice) => ANSWER_LABELS.includes(choice))).toBe(true);
  });

  it("prioritizes notes with the most errors in review", () => {
    const firstError = recordAnswer(createEmptyProgress(), "fa4", false);
    const secondError = recordAnswer(firstError, "re4", false);
    const thirdError = recordAnswer(secondError, "re4", false);
    const reviewNotes = getReviewNotes(thirdError).map((note) => note.id);

    expect(reviewNotes[0]).toBe("re4");
    expect(reviewNotes).toContain("fa4");
  });
});
