import { describe, expect, it } from "vitest";
import { ANSWER_LABELS, getNoteById } from "./notes";
import { createEmptyProgress, recordAnswer, recordRecentQuestion } from "./progress";
import { createChoices, generateNextQuestion, getQuestionPool, getReviewNotes, getUnlockedTrainingNotes } from "./quiz";

describe("quiz", () => {
  it("starts treble training with the existing first pool", () => {
    const unlockedNotes = getUnlockedTrainingNotes("treble", createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["mi4", "sol4", "si4", "do5", "re5"]);
  });

  it("starts bass training with the five staff-line notes", () => {
    const unlockedNotes = getUnlockedTrainingNotes("bass", createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["bass-sol2", "bass-si2", "bass-re3", "bass-fa3", "bass-la3"]);
    expect(unlockedNotes.every((noteId) => getNoteById(noteId).clef === "bass")).toBe(true);
  });

  it("unlocks Fa and La in treble after a few good answers", () => {
    const firstAnswer = recordAnswer(createEmptyProgress(), "treble", "mi4", true);
    const secondAnswer = recordAnswer(firstAnswer, "treble", "sol4", true);
    const unlockedNotes = getUnlockedTrainingNotes("treble", secondAnswer).map((note) => note.id);

    expect(unlockedNotes).toContain("fa4");
    expect(unlockedNotes).toContain("la4");
  });

  it("keeps bass question pools inside bass notes", () => {
    const pool = getQuestionPool("challenge", "bass", createEmptyProgress());

    expect(pool).toHaveLength(15);
    expect(pool.every((note) => note.clef === "bass")).toBe(true);
  });

  it("keeps speed question pools inside the requested clef", () => {
    const treblePool = getQuestionPool("speed", "treble", createEmptyProgress());
    const bassPool = getQuestionPool("speed", "bass", createEmptyProgress());

    expect(treblePool).toHaveLength(15);
    expect(treblePool.every((note) => note.clef === "treble")).toBe(true);
    expect(bassPool).toHaveLength(15);
    expect(bassPool.every((note) => note.clef === "bass")).toBe(true);
  });

  it("does not change speed pools after progression updates", () => {
    const emptyProgress = createEmptyProgress();
    const updatedProgress = recordAnswer(
      recordAnswer(emptyProgress, "treble", "mi4", true),
      "bass",
      "bass-fa3",
      false,
    );

    expect(getQuestionPool("speed", "treble", updatedProgress).map((note) => note.id)).toEqual(
      getQuestionPool("speed", "treble", emptyProgress).map((note) => note.id),
    );
    expect(getQuestionPool("speed", "bass", updatedProgress).map((note) => note.id)).toEqual(
      getQuestionPool("speed", "bass", emptyProgress).map((note) => note.id),
    );
  });

  it("generates a different next internal note when several notes are available", () => {
    const previousQuestion = generateNextQuestion(null, [], [getNoteById("mi4"), getNoteById("sol4")], "training", () => 0, 1);
    const nextQuestion = generateNextQuestion(previousQuestion, [previousQuestion.note.id], [getNoteById("mi4"), getNoteById("sol4")], "training", () => 0, 2);

    expect(nextQuestion.note.id).toBe("sol4");
    expect(nextQuestion.note.id).not.toBe(previousQuestion.note.id);
  });

  it("avoids recent notes for each clef when possible", () => {
    const progress = recordRecentQuestion(
      recordRecentQuestion(recordRecentQuestion(createEmptyProgress(), "bass", "bass-sol2"), "bass", "bass-si2"),
      "bass",
      "bass-re3",
    );

    const nextQuestion = generateNextQuestion(
      null,
      progress.clefs.bass.recentHistory,
      [getNoteById("bass-sol2"), getNoteById("bass-si2"), getNoteById("bass-re3"), getNoteById("bass-fa3")],
      "training",
      () => 0,
      4,
    );

    expect(nextQuestion.note.id).toBe("bass-fa3");
  });

  it("creates four unique answer labels including the correct answer for both clefs", () => {
    const trebleChoices = createChoices(getNoteById("do6"), "treble", () => 0);
    const bassChoices = createChoices(getNoteById("bass-do4"), "bass", () => 0);

    expect(trebleChoices).toHaveLength(4);
    expect(trebleChoices).toContain("Do");
    expect(new Set(trebleChoices).size).toBe(4);
    expect(bassChoices).toHaveLength(4);
    expect(bassChoices).toContain("Do");
    expect(new Set(bassChoices).size).toBe(4);
  });

  it("only exposes the seven plain note names as answer labels", () => {
    const trebleQuestion = generateNextQuestion(null, [], [getNoteById("do6")], "challenge", () => 0, 1);
    const bassQuestion = generateNextQuestion(null, [], [getNoteById("bass-do4")], "challenge", () => 0, 1);

    expect(trebleQuestion.note.answerLabel).toBe("Do");
    expect(bassQuestion.note.answerLabel).toBe("Do");
    expect(trebleQuestion.choices.every((choice) => ANSWER_LABELS.includes(choice))).toBe(true);
    expect(bassQuestion.choices.every((choice) => ANSWER_LABELS.includes(choice))).toBe(true);
  });

  it("prioritizes review notes only for the requested clef", () => {
    const bassError = recordAnswer(createEmptyProgress(), "bass", "bass-fa3", false);
    const trebleError = recordAnswer(bassError, "treble", "re4", false);
    const repeatedTrebleError = recordAnswer(trebleError, "treble", "re4", false);
    const bassReviewNotes = getReviewNotes("bass", repeatedTrebleError).map((note) => note.id);
    const trebleReviewNotes = getReviewNotes("treble", repeatedTrebleError).map((note) => note.id);

    expect(bassReviewNotes).toEqual(["bass-fa3"]);
    expect(trebleReviewNotes[0]).toBe("re4");
  });
});
