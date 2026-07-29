/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  createEmptyProgress,
  recordAnswer,
} from "../domain/progress";
import { useProgress } from "./useProgress";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("useProgress persistence", () => {
  it("writes progress only once for an active clef change", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useProgress());
    const writesAfterInitialization = setItemSpy.mock.calls.length;

    act(() => {
      result.current.switchActiveClef("bass");
    });

    expect(writesAfterInitialization).toBe(1);
    expect(setItemSpy).toHaveBeenCalledTimes(writesAfterInitialization + 1);
    expect(result.current.activeClef).toBe("bass");
  });

  it("adopts progress written by another tab without losing it on the next answer", () => {
    const { result } = renderHook(() => useProgress());
    const externalProgress = recordAnswer(
      createEmptyProgress(),
      "treble",
      "mi4",
      true,
      "2026-07-29T08:00:00.000Z",
    );
    const serializedProgress = JSON.stringify(externalProgress);

    act(() => {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, serializedProgress);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: PROGRESS_STORAGE_KEY,
          newValue: serializedProgress,
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current.progress.clefs.treble.notes.mi4?.correct).toBe(1);

    act(() => {
      result.current.recordNoteAnswer("sol4", true);
    });

    expect(result.current.progress.clefs.treble.notes.mi4?.correct).toBe(1);
    expect(result.current.progress.clefs.treble.notes.sol4?.correct).toBe(1);
  });

  it("falls back to valid legacy progress when the v2 value is malformed", () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, "{malformed");
    window.localStorage.setItem(
      LEGACY_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        notes: {
          mi: {
            views: 3,
            correct: 2,
            errors: 1,
            needsReview: true,
            lastPracticedAt: "2026-07-29T08:00:00.000Z",
          },
        },
      }),
    );

    const { result } = renderHook(() => useProgress());

    expect(result.current.progress.clefs.treble.notes.mi4).toEqual({
      views: 3,
      correct: 2,
      errors: 1,
      needsReview: true,
      lastPracticedAt: "2026-07-29T08:00:00.000Z",
    });
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "null")).toEqual(
      result.current.progress,
    );
  });
});
