import { describe, expect, it } from "vitest";
import { MUSIC_SYMBOL_DEFINITIONS, getSymbolById } from "./musicSymbols";
import {
  createEmptySymbolProgressState,
  recordRecentSymbol,
  recordSymbolAnswer,
  type SymbolProgressState,
} from "./symbolProgress";
import {
  createSymbolChoices,
  generateNextSymbolQuestion,
  getSymbolQuestionPool,
  getSymbolsToReview,
  getUnlockedTrainingSymbols,
  type SymbolChallengeAnswer,
} from "./symbolQuiz";

describe("symbolQuiz", () => {
  it("creates answer choices with the correct label included", () => {
    const choices = createSymbolChoices(getSymbolById("sharp"), () => 0);

    expect(choices).toHaveLength(4);
    expect(choices).toContain("Dièse");
    expect(new Set(choices).size).toBe(4);
  });

  it("uses plausible distractors from the same group first", () => {
    const accidentalChoices = createSymbolChoices(getSymbolById("sharp"), () => 0);
    const clefChoices = createSymbolChoices(getSymbolById("treble-clef"), () => 0);

    expect(accidentalChoices).toEqual(expect.arrayContaining(["Dièse", "Bémol", "Bécarre"]));
    expect(clefChoices).toEqual(expect.arrayContaining(["Clé de sol", "Clé de fa", "Clé d’ut"]));
  });

  it("uses duration-related distractors for isolated duration and rest symbols", () => {
    const dotChoices = createSymbolChoices(getSymbolById("augmentation-dot"), () => 0);
    const restChoices = createSymbolChoices(getSymbolById("quarter-rest"), () => 0);

    expect(dotChoices).toEqual(
      expect.arrayContaining(["Point de prolongation", "Ronde", "Blanche", "Noire"]),
    );
    expect(restChoices).toEqual(
      expect.arrayContaining(["Soupir", "Noire", "Croche", "Point de prolongation"]),
    );
    expect(dotChoices).not.toEqual(expect.arrayContaining(["Portée", "Clé de sol"]));
    expect(restChoices).not.toEqual(expect.arrayContaining(["Portée", "Clé de sol"]));
  });

  it("completes accidental choices with a visually related symbol", () => {
    const sharpChoices = createSymbolChoices(getSymbolById("sharp"), () => 0);

    expect(sharpChoices).toEqual(expect.arrayContaining(["Dièse", "Bécarre", "Bémol", "Double barre"]));
    expect(sharpChoices).not.toContain("Portée");
  });

  it("avoids recent symbols when possible", () => {
    const progress = recordRecentSymbol(
      recordRecentSymbol(recordRecentSymbol(createEmptySymbolProgressState(), "staff"), "treble-clef"),
      "bass-clef",
    );
    const question = generateNextSymbolQuestion(
      null,
      progress.recentHistory,
      [getSymbolById("staff"), getSymbolById("treble-clef"), getSymbolById("bass-clef"), getSymbolById("bar-line")],
      "training",
      () => 0,
      4,
    );

    expect(question.symbol.id).toBe("bar-line");
  });

  it("starts training with the initial symbol pool", () => {
    const unlockedSymbols = getUnlockedTrainingSymbols(createEmptySymbolProgressState()).map((symbol) => symbol.id);

    expect(unlockedSymbols).toEqual([
      "staff",
      "treble-clef",
      "bass-clef",
      "bar-line",
      "quarter-note",
      "eighth-note",
    ]);
  });

  it("unlocks later symbols after enough correct answers", () => {
    const twoCorrect = recordSymbolAnswer(
      recordSymbolAnswer(createEmptySymbolProgressState(), "staff", true),
      "treble-clef",
      true,
    );
    let nineCorrect: SymbolProgressState = twoCorrect;

    for (let index = 0; index < 7; index += 1) {
      nineCorrect = recordSymbolAnswer(nineCorrect, "staff", true);
    }

    expect(getUnlockedTrainingSymbols(twoCorrect).map((symbol) => symbol.id)).toEqual(
      expect.arrayContaining(["c-clef", "double-bar-line", "half-note"]),
    );
    expect(getUnlockedTrainingSymbols(nineCorrect).map((symbol) => symbol.id)).toEqual(
      expect.arrayContaining(["sharp", "flat", "natural"]),
    );
  });

  it("uses the full MVP catalog for challenge", () => {
    const pool = getSymbolQuestionPool("challenge", createEmptySymbolProgressState());

    expect(pool.map((symbol) => symbol.id)).toEqual(MUSIC_SYMBOL_DEFINITIONS.map((symbol) => symbol.id));
  });

  it("uses only symbols with errors for review", () => {
    const progress = recordSymbolAnswer(
      recordSymbolAnswer(createEmptySymbolProgressState(), "staff", false),
      "sharp",
      true,
    );
    const reviewPool = getSymbolQuestionPool("review", progress).map((symbol) => symbol.id);

    expect(reviewPool).toEqual(["staff"]);
  });

  it("removes a corrected symbol from the review pool", () => {
    const incorrect = recordSymbolAnswer(createEmptySymbolProgressState(), "staff", false);
    const corrected = recordSymbolAnswer(incorrect, "staff", true);

    expect(getSymbolQuestionPool("review", corrected)).toEqual([]);
    expect(corrected.symbols.staff?.errors).toBe(1);
  });

  it("generates a question with four unique choices at most", () => {
    const question = generateNextSymbolQuestion(
      null,
      [],
      [getSymbolById("quarter-note")],
      "challenge",
      () => 0,
      1,
    );

    expect(question.choices.length).toBeLessThanOrEqual(4);
    expect(question.choices).toContain("Noire");
    expect(new Set(question.choices).size).toBe(question.choices.length);
  });

  it("lists each missed symbol only once in challenge results", () => {
    const repeatedMiss: SymbolChallengeAnswer = {
      questionNumber: 1,
      symbolId: "staff",
      symbolLabel: "Portée",
      selectedLabel: "Barre de mesure",
      isCorrect: false,
    };
    const answers: SymbolChallengeAnswer[] = [
      repeatedMiss,
      { ...repeatedMiss, questionNumber: 5 },
      {
        questionNumber: 6,
        symbolId: "sharp",
        symbolLabel: "Dièse",
        selectedLabel: "Bécarre",
        isCorrect: false,
      },
    ];

    expect(getSymbolsToReview(answers).map((answer) => answer.symbolId)).toEqual([
      "staff",
      "sharp",
    ]);
  });
});
