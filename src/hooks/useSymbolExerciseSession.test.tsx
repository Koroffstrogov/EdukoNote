/**
 * @vitest-environment jsdom
 */

import { useCallback, useState } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEmptySymbolProgressState,
  getSymbolReviewPool,
  recordRecentSymbol,
  recordSymbolAnswer,
} from "../domain/symbolProgress";
import { SYMBOL_CHALLENGE_LENGTH } from "../domain/symbolQuiz";
import { useSymbolExerciseSession } from "./useSymbolExerciseSession";

describe("useSymbolExerciseSession", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("locks a question after the first answer", () => {
    const { result, recordAnswer } = renderSymbolSession("challenge");
    const correctLabel = result.current.question.symbol.label;
    const incorrectLabel = result.current.question.choices.find((choice) => choice !== correctLabel);

    act(() => {
      result.current.selectAnswer(correctLabel);
      result.current.selectAnswer(incorrectLabel!);
    });

    expect(recordAnswer).toHaveBeenCalledTimes(1);
    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0]?.selectedLabel).toBe(correctLabel);
  });

  it("finishes exactly ten challenge questions and restarts cleanly", () => {
    const { result, recordAnswer, recordRecent } = renderSymbolSession("challenge");

    for (let index = 0; index < SYMBOL_CHALLENGE_LENGTH; index += 1) {
      act(() => {
        result.current.selectAnswer(result.current.question.symbol.label);
      });
      act(() => {
        result.current.nextQuestion();
      });
    }

    expect(recordAnswer).toHaveBeenCalledTimes(SYMBOL_CHALLENGE_LENGTH);
    expect(recordRecent).toHaveBeenCalledTimes(SYMBOL_CHALLENGE_LENGTH);
    expect(result.current.answers).toHaveLength(SYMBOL_CHALLENGE_LENGTH);
    expect(result.current.questionNumber).toBe(SYMBOL_CHALLENGE_LENGTH);
    expect(result.current.challengeFinished).toBe(true);

    act(() => {
      result.current.restartChallenge();
    });

    expect(result.current.answers).toEqual([]);
    expect(result.current.questionNumber).toBe(1);
    expect(result.current.selectedAnswerLabel).toBeNull();
    expect(result.current.challengeFinished).toBe(false);
  });

  it("preserves the training feedback and advances to another symbol", () => {
    const { result, recordRecent } = renderSymbolSession("training");
    const firstQuestionId = result.current.question.id;

    act(() => {
      result.current.selectAnswer(result.current.question.symbol.label);
    });

    expect(result.current.selectedAnswerLabel).toBe(result.current.question.symbol.label);

    act(() => {
      result.current.nextQuestion();
    });

    expect(recordRecent).toHaveBeenCalledTimes(1);
    expect(result.current.question.id).not.toBe(firstQuestionId);
    expect(result.current.selectedAnswerLabel).toBeNull();
  });

  it("removes a corrected symbol from the review pool", () => {
    const { result } = renderHook(() => useSymbolReviewHarness());

    expect(result.current.reviewSymbolIds).toEqual(["staff"]);

    act(() => {
      result.current.session.selectAnswer(result.current.session.question.symbol.label);
    });

    expect(result.current.reviewSymbolIds).toEqual([]);
  });
});

function renderSymbolSession(mode: "training" | "challenge") {
  const recordAnswer = vi.fn();
  const recordRecent = vi.fn();
  const hook = renderHook(() =>
    useSymbolExerciseSession({
      mode,
      progress: createEmptySymbolProgressState(),
      recordAnswer,
      recordRecent,
    }),
  );

  return {
    ...hook,
    recordAnswer,
    recordRecent,
  };
}

function useSymbolReviewHarness() {
  const [progress, setProgress] = useState(() =>
    recordSymbolAnswer(createEmptySymbolProgressState(), "staff", false),
  );
  const recordAnswer = useCallback((symbolId: Parameters<typeof recordSymbolAnswer>[1], isCorrect: boolean) => {
    setProgress((currentProgress) => recordSymbolAnswer(currentProgress, symbolId, isCorrect));
  }, []);
  const recordRecent = useCallback((symbolId: Parameters<typeof recordRecentSymbol>[1]) => {
    setProgress((currentProgress) => recordRecentSymbol(currentProgress, symbolId));
  }, []);
  const session = useSymbolExerciseSession({
    mode: "review",
    progress,
    recordAnswer,
    recordRecent,
  });

  return {
    session,
    reviewSymbolIds: getSymbolReviewPool(progress).map((symbol) => symbol.id),
  };
}
