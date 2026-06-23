import { describe, expect, it } from "vitest";
import { ANSWER_LABELS, getNextClef, getNoteById, getNotesForClefAndReadingZone } from "./notes";
import { createEmptyProgress, recordAnswer, recordRecentQuestion } from "./progress";
import { createChoices, generateNextQuestion, getQuestionPool, getReviewNotes, getUnlockedTrainingNotes } from "./quiz";

describe("quiz", () => {
  it("cycles through the three clefs in UI order", () => {
    expect(getNextClef("treble")).toBe("bass");
    expect(getNextClef("bass")).toBe("tenor");
    expect(getNextClef("tenor")).toBe("treble");
  });

  it("starts treble training with the existing first pool", () => {
    const unlockedNotes = getUnlockedTrainingNotes("treble", createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["mi4", "sol4", "si4", "do5", "re5"]);
  });

  it("starts bass training with the five staff-line notes", () => {
    const unlockedNotes = getUnlockedTrainingNotes("bass", createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["bass-sol2", "bass-si2", "bass-re3", "bass-fa3", "bass-la3"]);
    expect(unlockedNotes.every((noteId) => getNoteById(noteId).clef === "bass")).toBe(true);
  });

  it("starts tenor training with the selected Ut 4 pool", () => {
    const unlockedNotes = getUnlockedTrainingNotes("tenor", createEmptyProgress()).map((note) => note.id);

    expect(unlockedNotes).toEqual(["tenor-re3", "tenor-fa3", "tenor-la3", "tenor-do4", "tenor-mi4"]);
    expect(unlockedNotes.every((noteId) => getNoteById(noteId).clef === "tenor")).toBe(true);
  });

  it("filters notes by reading zone without mixing clefs", () => {
    const trebleLowerNotes = getNotesForClefAndReadingZone("treble", "lower").map((note) => note.id);
    const trebleUpperNotes = getNotesForClefAndReadingZone("treble", "upper").map((note) => note.id);
    const bassLowerNotes = getNotesForClefAndReadingZone("bass", "lower").map((note) => note.id);
    const bassUpperNotes = getNotesForClefAndReadingZone("bass", "upper").map((note) => note.id);
    const tenorLowerNotes = getNotesForClefAndReadingZone("tenor", "lower").map((note) => note.id);
    const tenorUpperNotes = getNotesForClefAndReadingZone("tenor", "upper").map((note) => note.id);

    expect(trebleLowerNotes).toEqual(["do4", "re4", "mi4", "fa4", "sol4", "la4", "si4"]);
    expect(trebleUpperNotes).toEqual(["do5", "re5", "mi5", "fa5", "sol5", "la5", "si5", "do6"]);
    expect(bassLowerNotes).toEqual(["bass-do2", "bass-re2", "bass-mi2", "bass-fa2", "bass-sol2", "bass-la2", "bass-si2"]);
    expect(bassUpperNotes).toEqual(["bass-do3", "bass-re3", "bass-mi3", "bass-fa3", "bass-sol3", "bass-la3", "bass-si3", "bass-do4"]);
    expect(tenorLowerNotes).toEqual(["tenor-do3", "tenor-re3", "tenor-mi3", "tenor-fa3", "tenor-sol3", "tenor-la3", "tenor-si3"]);
    expect(tenorUpperNotes).toEqual(["tenor-do4", "tenor-re4", "tenor-mi4", "tenor-fa4", "tenor-sol4", "tenor-la4", "tenor-si4", "tenor-do5"]);
  });

  it("keeps full reading zone equal to all notes for the active clef", () => {
    expect(getNotesForClefAndReadingZone("treble", "full").map((note) => note.id)).toHaveLength(15);
    expect(getNotesForClefAndReadingZone("bass", "full").map((note) => note.id)).toHaveLength(15);
    expect(getNotesForClefAndReadingZone("tenor", "full").map((note) => note.id)).toHaveLength(15);
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
    const tenorPool = getQuestionPool("speed", "tenor", createEmptyProgress());

    expect(treblePool).toHaveLength(15);
    expect(treblePool.every((note) => note.clef === "treble")).toBe(true);
    expect(bassPool).toHaveLength(15);
    expect(bassPool.every((note) => note.clef === "bass")).toBe(true);
    expect(tenorPool).toHaveLength(15);
    expect(tenorPool.every((note) => note.clef === "tenor")).toBe(true);
  });

  it("filters challenge and speed pools by reading zone", () => {
    const progress = createEmptyProgress();
    const challengePool = getQuestionPool("challenge", "treble", progress, "lower").map((note) => note.id);
    const speedPool = getQuestionPool("speed", "bass", progress, "upper").map((note) => note.id);
    const tenorChallengePool = getQuestionPool("challenge", "tenor", progress, "upper").map((note) => note.id);

    expect(challengePool).toEqual(["do4", "re4", "mi4", "fa4", "sol4", "la4", "si4"]);
    expect(speedPool).toEqual(["bass-do3", "bass-re3", "bass-mi3", "bass-fa3", "bass-sol3", "bass-la3", "bass-si3", "bass-do4"]);
    expect(tenorChallengePool).toEqual(["tenor-do4", "tenor-re4", "tenor-mi4", "tenor-fa4", "tenor-sol4", "tenor-la4", "tenor-si4", "tenor-do5"]);
  });

  it("filters training pools by reading zone after unlock logic", () => {
    const progress = createEmptyProgress();
    const lowerPool = getQuestionPool("training", "treble", progress, "lower").map((note) => note.id);
    const upperPool = getQuestionPool("training", "treble", progress, "upper").map((note) => note.id);

    expect(lowerPool).toEqual(["mi4", "sol4", "si4"]);
    expect(upperPool).toEqual(["do5", "re5"]);
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
    expect(getQuestionPool("speed", "tenor", updatedProgress).map((note) => note.id)).toEqual(
      getQuestionPool("speed", "tenor", emptyProgress).map((note) => note.id),
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

  it("creates four unique answer labels including the correct answer for all clefs", () => {
    const trebleChoices = createChoices(getNoteById("do6"), "treble", () => 0);
    const bassChoices = createChoices(getNoteById("bass-do4"), "bass", () => 0);
    const tenorChoices = createChoices(getNoteById("tenor-do4"), "tenor", () => 0);

    expect(trebleChoices).toHaveLength(4);
    expect(trebleChoices).toContain("Do");
    expect(new Set(trebleChoices).size).toBe(4);
    expect(bassChoices).toHaveLength(4);
    expect(bassChoices).toContain("Do");
    expect(new Set(bassChoices).size).toBe(4);
    expect(tenorChoices).toHaveLength(4);
    expect(tenorChoices).toContain("Do");
    expect(new Set(tenorChoices).size).toBe(4);
  });

  it("only exposes the seven plain note names as answer labels", () => {
    const trebleQuestion = generateNextQuestion(null, [], [getNoteById("do6")], "challenge", () => 0, 1);
    const bassQuestion = generateNextQuestion(null, [], [getNoteById("bass-do4")], "challenge", () => 0, 1);
    const tenorQuestion = generateNextQuestion(null, [], [getNoteById("tenor-do4")], "challenge", () => 0, 1);

    expect(trebleQuestion.note.answerLabel).toBe("Do");
    expect(bassQuestion.note.answerLabel).toBe("Do");
    expect(tenorQuestion.note.answerLabel).toBe("Do");
    expect(trebleQuestion.choices.every((choice) => ANSWER_LABELS.includes(choice))).toBe(true);
    expect(bassQuestion.choices.every((choice) => ANSWER_LABELS.includes(choice))).toBe(true);
    expect(tenorQuestion.choices.every((choice) => ANSWER_LABELS.includes(choice))).toBe(true);
  });

  it("prioritizes review notes only for the requested clef and reading zone", () => {
    const bassError = recordAnswer(createEmptyProgress(), "bass", "bass-fa3", false);
    const trebleError = recordAnswer(bassError, "treble", "re4", false);
    const repeatedTrebleError = recordAnswer(trebleError, "treble", "re4", false);
    const tenorError = recordAnswer(repeatedTrebleError, "tenor", "tenor-do4", false);
    const bassReviewNotes = getReviewNotes("bass", repeatedTrebleError, "upper").map((note) => note.id);
    const bassLowerReviewNotes = getReviewNotes("bass", repeatedTrebleError, "lower").map((note) => note.id);
    const trebleReviewNotes = getReviewNotes("treble", tenorError, "lower").map((note) => note.id);
    const tenorReviewNotes = getReviewNotes("tenor", tenorError, "upper").map((note) => note.id);

    expect(bassReviewNotes).toEqual(["bass-fa3"]);
    expect(bassLowerReviewNotes).toEqual([]);
    expect(trebleReviewNotes[0]).toBe("re4");
    expect(tenorReviewNotes).toEqual(["tenor-do4"]);
  });
});
