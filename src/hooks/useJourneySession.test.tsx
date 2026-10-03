/** @vitest-environment jsdom */
import { StrictMode } from "react";
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmptyProgress } from "../domain/progress";
import { useJourneySession } from "./useJourneySession";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function setup() {
  const recordNoteAnswer = vi.fn();
  const onComplete = vi.fn();
  const view = renderHook(() => useJourneySession({ progress: createEmptyProgress(), recordNoteAnswer, onComplete }), { wrapper: StrictMode });
  return { ...view, recordNoteAnswer, onComplete };
}
describe("short note series lifecycle", () => {
  it("locks double answers and only records a series after ten responses", () => {
    const { result, onComplete, recordNoteAnswer } = setup();
    act(() => result.current.start("daily", "treble", "lower"));
    act(() => result.current.next());
    expect(result.current.trial!.index).toBe(0);
    for (let index = 0; index < 10; index++) {
      const question = result.current.trial!.plan.questions[index];
      act(() => { result.current.answer(question.note.answerLabel); result.current.answer(question.note.answerLabel); });
      expect(recordNoteAnswer).toHaveBeenCalledTimes(index + 1);
      expect(onComplete).toHaveBeenCalledTimes(index === 9 ? 1 : 0);
      act(() => { result.current.next(); result.current.next(); });
    }
    expect(result.current.trial!.phase).toBe("result");
    expect(onComplete.mock.calls[0][0]).toMatchObject({ score: 10 });
    const previousId = result.current.trial!.id;
    act(() => result.current.start("daily", "treble", "upper"));
    expect(result.current.trial!.id).not.toBe(previousId);
  });
  it("does not count an abandoned series and rejects direct entry into a locked exam", () => {
    const { result, onComplete } = setup();
    act(() => result.current.start("exam", "treble", "full"));
    expect(result.current.trial).toBeNull();
    act(() => result.current.start("daily", "bass", "upper"));
    act(() => result.current.answer(result.current.trial!.plan.questions[0].note.answerLabel));
    act(() => result.current.close());
    expect(onComplete).not.toHaveBeenCalled();
  });
  it("pauses on losing visibility, blocks hidden answers and excludes interrupted timing", () => {
    const { result, onComplete, recordNoteAnswer } = setup();
    act(() => result.current.start("fluency", "bass", "full"));
    fireEvent(window, new Event("blur"));
    expect(result.current.trial!.paused).toBe(true);
    act(() => result.current.answer("Do"));
    expect(recordNoteAnswer).not.toHaveBeenCalled();
    act(() => result.current.resume());
    for (let index = 0; index < 10; index++) {
      const question = result.current.trial!.plan.questions[index];
      act(() => result.current.answer(question.note.answerLabel));
      act(() => result.current.next());
    }
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0]).toMatchObject({ medianMs: null, score: 10 });
    expect(recordNoteAnswer).toHaveBeenLastCalledWith(expect.any(String), true, "bass");
  });
});
