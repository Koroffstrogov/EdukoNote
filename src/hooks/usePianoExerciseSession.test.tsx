/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyPianoProgress } from "../domain/pianoProgress";
import { usePianoExerciseSession } from "./usePianoExerciseSession";

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("usePianoExerciseSession", () => {
  it("records one correct attempt and locks duplicate presses", () => {
    const { result, recordPianoAnswer } = renderSession();
    const question = result.current.question;

    act(() => {
      result.current.selectKey(question.notation.keyId);
      result.current.selectKey("b");
    });

    expect(recordPianoAnswer).toHaveBeenCalledOnce();
    expect(recordPianoAnswer).toHaveBeenCalledWith("treble", question.notation.id, true);
    expect(result.current.isCorrect).toBe(true);
  });

  it("records an incorrect key and advances with recent history", () => {
    const { result, recordPianoAnswer, recordRecentPianoQuestion } = renderSession();
    const answered = result.current.question;

    act(() => result.current.selectKey("b"));
    expect(recordPianoAnswer).toHaveBeenCalledWith("treble", answered.notation.id, false);

    act(() => result.current.nextQuestion());
    expect(recordRecentPianoQuestion).toHaveBeenCalledWith("treble", answered.notation.id);
    expect(result.current.selectedKeyId).toBeNull();
    expect(result.current.question.id).not.toBe(answered.id);
  });

  it("resets the question when the active clef changes", () => {
    const recordPianoAnswer = vi.fn();
    const recordRecentPianoQuestion = vi.fn();
    const pianoProgress = createEmptyPianoProgress();
    const { result, rerender } = renderHook(
      ({ activeClef }) => usePianoExerciseSession({
        activeClef,
        pianoProgress,
        recordPianoAnswer,
        recordRecentPianoQuestion,
      }),
      { initialProps: { activeClef: "treble" as "treble" | "bass" } },
    );

    rerender({ activeClef: "bass" });

    expect(result.current.question.notation.clef).toBe("bass");
    expect(result.current.question.questionIndex).toBe(1);
    expect(result.current.selectedKeyId).toBeNull();
  });
});

function renderSession() {
  const recordPianoAnswer = vi.fn();
  const recordRecentPianoQuestion = vi.fn();
  const hook = renderHook(() => usePianoExerciseSession({
    activeClef: "treble",
    pianoProgress: createEmptyPianoProgress(),
    recordPianoAnswer,
    recordRecentPianoQuestion,
  }));

  return { ...hook, recordPianoAnswer, recordRecentPianoQuestion };
}
