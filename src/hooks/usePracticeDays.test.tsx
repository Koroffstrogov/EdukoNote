/** @vitest-environment jsdom */
import { StrictMode } from "react";
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePracticeDays } from "./usePracticeDays";
import { PRACTICE_DAYS_STORAGE_KEY } from "../domain/practiceDays";

beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 2, 23, 59, 30)); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
describe("practice day persistence", () => {
  it("records one reward per session in StrictMode and preserves it after reloading", () => {
    const view = renderHook(usePracticeDays, { wrapper: StrictMode });
    const completion = { id: "one", total: 10, score: 10 };
    act(() => { view.result.current.completeSeries(completion); view.result.current.completeSeries(completion); });
    expect(view.result.current.summary).toMatchObject({ current: 1, perfectSeries: 1, totalDays: 1 });
    view.unmount();
    const { result } = renderHook(usePracticeDays);
    expect(result.current.summary).toMatchObject({ completedToday: true, current: 1, perfectSeries: 1 });
  });
  it("refreshes across local midnight and assigns a finished series to the completion day", () => {
    const { result } = renderHook(usePracticeDays);
    act(() => result.current.completeSeries({ id: "yesterday", total: 10, score: 8 }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.today).toBe("2026-10-03");
    expect(result.current.summary).toMatchObject({ current: 1, completedToday: false });
    act(() => result.current.completeSeries({ id: "today", total: 10, score: 7 }));
    expect(result.current.summary).toMatchObject({ current: 2, completedToday: true });
  });
  it("retains unsaved rewards during storage failure and merges existing data from another tab", () => {
    const { result } = renderHook(usePracticeDays);
    const external = { version: 1, days: ["2026-10-01"], perfectSeries: 2, recentSessions: ["other"] };
    localStorage.setItem(PRACTICE_DAYS_STORAGE_KEY, JSON.stringify(external));
    fireEvent(window, new StorageEvent("storage", { key: PRACTICE_DAYS_STORAGE_KEY, newValue: JSON.stringify(external) }));
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    act(() => result.current.completeSeries({ id: "first", total: 10, score: 10 }));
    act(() => result.current.completeSeries({ id: "second", total: 10, score: 10 }));
    expect(result.current.storageAvailable).toBe(false);
    expect(result.current.summary).toMatchObject({ current: 2, perfectSeries: 4 });
    write.mockRestore();
    act(() => result.current.completeSeries({ id: "third", total: 10, score: 8 }));
    expect(result.current.storageAvailable).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRACTICE_DAYS_STORAGE_KEY)!).perfectSeries).toBe(4);
  });
});
