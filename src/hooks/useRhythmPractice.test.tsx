/** @vitest-environment jsdom */
import { StrictMode } from "react";
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeRhythm, buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS, RHYTHM_SETTINGS_STORAGE_KEY } from "../domain/rhythmExercise";
import { emptyRhythmProgress, recordRhythmSession, RHYTHM_PROGRESS_STORAGE_KEY, rhythmProgressKey } from "../domain/rhythmProgress";
import { useRhythmPractice } from "./useRhythmPractice";

const settings = { ...DEFAULT_RHYTHM_SETTINGS, mode: "read" as const, patternId: "R05", tempo: 90 as const, metronome: false };
function attempt(id: string, success = true) {
  const plan = buildRhythmPlan(settings);
  return { id, plan, result: analyzeRhythm(success ? plan.targets : [], 0, 1, plan), finishedAt: "2026-09-06T12:00:00.000Z" };
}
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("rhythm practice persistence", () => {
  it("survives remount, deduplicates completion in StrictMode and preserves other exercises", () => {
    const otherKeys = ["edukonote.progress.v2", "edukonote.symbolProgress.v1", "edukonote.pianoProgress.v1", "edukonote.settings.v1"];
    otherKeys.forEach((key) => localStorage.setItem(key, "unchanged"));
    const view = renderHook(useRhythmPractice, { wrapper: StrictMode });
    act(() => view.result.current.updateSettings(settings));
    act(() => { view.result.current.recordCompleted(attempt("first", false)); view.result.current.recordCompleted(attempt("first", false)); });
    act(() => view.result.current.recordCompleted(attempt("second")));
    view.unmount();
    const { result } = renderHook(useRhythmPractice, { wrapper: StrictMode });
    expect(result.current.settings).toEqual(settings);
    expect(result.current.progress.entries[rhythmProgressKey(settings)]).toMatchObject({ attempts: 2, correct: 1, errors: 1, needsReview: false });
    act(() => result.current.resetProgress());
    expect(JSON.parse(localStorage.getItem(RHYTHM_PROGRESS_STORAGE_KEY)!)).toEqual(emptyRhythmProgress());
    expect(JSON.parse(localStorage.getItem(RHYTHM_SETTINGS_STORAGE_KEY)!)).toEqual(settings);
    otherKeys.forEach((key) => expect(localStorage.getItem(key)).toBe("unchanged"));
  });
  it("uses safe defaults for malformed stored data without writing on mount", () => {
    localStorage.setItem(RHYTHM_PROGRESS_STORAGE_KEY, "{");
    localStorage.setItem(RHYTHM_SETTINGS_STORAGE_KEY, '{"tempo":1,"patternId":"unknown"}');
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(useRhythmPractice);
    expect(result.current.settings).toEqual(DEFAULT_RHYTHM_SETTINGS);
    expect(result.current.progress).toEqual(emptyRhythmProgress());
    expect(write).not.toHaveBeenCalled();
  });
  it("keeps unsaved attempts in memory when storage fails and saves them on recovery", () => {
    const { result } = renderHook(useRhythmPractice);
    act(() => result.current.recordCompleted(attempt("saved")));
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota", "QuotaExceededError"); });
    act(() => result.current.recordCompleted(attempt("unsaved-1")));
    act(() => result.current.recordCompleted(attempt("unsaved-2")));
    expect(result.current.progress.entries[rhythmProgressKey(settings)].attempts).toBe(3);
    expect(result.current.storageAvailable).toBe(false);
    write.mockRestore();
    act(() => result.current.updateSettings(settings));
    expect(result.current.storageAvailable).toBe(false);
    act(() => result.current.recordCompleted(attempt("recovery")));
    expect(result.current.storageAvailable).toBe(true);
    expect(JSON.parse(localStorage.getItem(RHYTHM_PROGRESS_STORAGE_KEY)!).entries[rhythmProgressKey(settings)].attempts).toBe(4);
  });
  it("refreshes progress from another tab without changing current settings and reads its latest result before writing", () => {
    const { result } = renderHook(useRhythmPractice);
    const external = recordRhythmSession(emptyRhythmProgress(), attempt("other-tab", false));
    localStorage.setItem(RHYTHM_PROGRESS_STORAGE_KEY, JSON.stringify(external));
    fireEvent(window, new StorageEvent("storage", { key: RHYTHM_PROGRESS_STORAGE_KEY, newValue: JSON.stringify(external) }));
    fireEvent(window, new StorageEvent("storage", { key: RHYTHM_SETTINGS_STORAGE_KEY, newValue: JSON.stringify(settings) }));
    expect(result.current.progress).toEqual(external);
    expect(result.current.settings).toEqual(DEFAULT_RHYTHM_SETTINGS);
    localStorage.setItem(RHYTHM_PROGRESS_STORAGE_KEY, JSON.stringify(recordRhythmSession(external, attempt("another-result"))));
    act(() => result.current.recordCompleted(attempt("this-tab")));
    expect(result.current.progress.entries[rhythmProgressKey(settings)].attempts).toBe(3);
    fireEvent(window, new StorageEvent("storage", { key: RHYTHM_PROGRESS_STORAGE_KEY, newValue: null }));
    expect(result.current.progress).toEqual(emptyRhythmProgress());
  });
});
