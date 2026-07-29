/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyProgress } from "../domain/progress";
import { SPEED_INITIAL_TIME_SECONDS } from "../domain/speed";
import { useNoteExerciseSession } from "./useNoteExerciseSession";

describe("useNoteExerciseSession speed mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("records a correct answer and advances the speed series", () => {
    const { result, recordNoteAnswer, recordRecentNote } = renderSpeedSession();
    const answeredNote = result.current.question.note;

    act(() => {
      result.current.selectAnswer(answeredNote.answerLabel);
    });

    expect(recordNoteAnswer).toHaveBeenCalledTimes(1);
    expect(recordNoteAnswer).toHaveBeenCalledWith(answeredNote.id, true);
    expect(recordRecentNote).toHaveBeenCalledWith(answeredNote.id);
    expect(result.current.speedScore).toBe(1);
    expect(result.current.speedFailure).toBeNull();
    expect(result.current.question.id).not.toContain(answeredNote.id);
  });

  it("records an incorrect answer and exposes the correction", () => {
    const { result, recordNoteAnswer, recordRecentNote } = renderSpeedSession();
    const answeredNote = result.current.question.note;
    const incorrectLabel = result.current.question.choices.find(
      (choice) => choice !== answeredNote.answerLabel,
    );

    expect(incorrectLabel).toBeDefined();

    act(() => {
      result.current.selectAnswer(incorrectLabel!);
    });

    expect(recordNoteAnswer).toHaveBeenCalledTimes(1);
    expect(recordNoteAnswer).toHaveBeenCalledWith(answeredNote.id, false);
    expect(recordRecentNote).toHaveBeenCalledWith(answeredNote.id);
    expect(result.current.speedFailure).toEqual({
      reason: "incorrect",
      noteId: answeredNote.id,
      correctLabel: answeredNote.answerLabel,
      selectedLabel: incorrectLabel,
    });
  });

  it("records a timeout as one unanswered error", () => {
    const { result, recordNoteAnswer, recordRecentNote } = renderSpeedSession();
    const timedOutNote = result.current.question.note;

    act(() => {
      vi.advanceTimersByTime(SPEED_INITIAL_TIME_SECONDS * 1000);
    });

    expect(recordNoteAnswer).toHaveBeenCalledTimes(1);
    expect(recordNoteAnswer).toHaveBeenCalledWith(timedOutNote.id, false);
    expect(recordRecentNote).toHaveBeenCalledTimes(1);
    expect(result.current.speedFailure).toEqual({
      reason: "timeout",
      noteId: timedOutNote.id,
      correctLabel: timedOutNote.answerLabel,
      selectedLabel: null,
    });
  });

  it("locks the attempt when an answer and the timer finish together", () => {
    const { result, recordNoteAnswer, recordRecentNote } = renderSpeedSession();
    const answeredNote = result.current.question.note;
    const incorrectLabel = result.current.question.choices.find(
      (choice) => choice !== answeredNote.answerLabel,
    );

    act(() => {
      result.current.selectAnswer(incorrectLabel!);
      vi.advanceTimersByTime(SPEED_INITIAL_TIME_SECONDS * 1000);
    });

    expect(recordNoteAnswer).toHaveBeenCalledTimes(1);
    expect(recordRecentNote).toHaveBeenCalledTimes(1);
    expect(result.current.speedFailure?.reason).toBe("incorrect");
  });

  it("rejects an answer submitted after the real deadline but before the next timer tick", () => {
    const startedAt = Date.now();
    const { result, recordNoteAnswer, recordRecentNote } = renderSpeedSession();
    const expiredNote = result.current.question.note;

    act(() => {
      vi.setSystemTime(startedAt + SPEED_INITIAL_TIME_SECONDS * 1000 + 1);
      result.current.selectAnswer(expiredNote.answerLabel);
    });

    expect(recordNoteAnswer).toHaveBeenCalledTimes(1);
    expect(recordNoteAnswer).toHaveBeenCalledWith(expiredNote.id, false);
    expect(recordRecentNote).toHaveBeenCalledWith(expiredNote.id);
    expect(result.current.speedScore).toBe(0);
    expect(result.current.speedFailure).toEqual({
      reason: "timeout",
      noteId: expiredNote.id,
      correctLabel: expiredNote.answerLabel,
      selectedLabel: null,
    });
  });

  it("fully resets a failed speed session", () => {
    const { result } = renderSpeedSession();
    const answeredNote = result.current.question.note;
    const incorrectLabel = result.current.question.choices.find(
      (choice) => choice !== answeredNote.answerLabel,
    );

    act(() => {
      result.current.selectAnswer(incorrectLabel!);
    });
    act(() => {
      result.current.restartSpeed();
    });

    expect(result.current.speedScore).toBe(0);
    expect(result.current.speedFailure).toBeNull();
    expect(result.current.speedFinished).toBe(false);
    expect(result.current.speedTimeLeftMs).toBe(SPEED_INITIAL_TIME_SECONDS * 1000);
  });
});

function renderSpeedSession() {
  const recordNoteAnswer = vi.fn();
  const recordRecentNote = vi.fn();
  const hook = renderHook(() =>
    useNoteExerciseSession({
      mode: "speed",
      progress: createEmptyProgress(),
      activeClef: "treble",
      activeReadingZone: "full",
      recordNoteAnswer,
      recordRecentNote,
    }),
  );

  return {
    ...hook,
    recordNoteAnswer,
    recordRecentNote,
  };
}
