/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  SYMBOL_PROGRESS_STORAGE_KEY,
  createEmptySymbolProgressState,
  recordSymbolAnswer,
} from "../domain/symbolProgress";
import { useSymbolProgress } from "./useSymbolProgress";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("useSymbolProgress storage synchronization", () => {
  it("preserves progress received from another tab on the next answer", () => {
    const { result } = renderHook(() => useSymbolProgress());
    const externalProgress = recordSymbolAnswer(
      createEmptySymbolProgressState(),
      "staff",
      false,
      "2026-07-29T08:00:00.000Z",
    );
    const serializedProgress = JSON.stringify(externalProgress);

    act(() => {
      window.localStorage.setItem(SYMBOL_PROGRESS_STORAGE_KEY, serializedProgress);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: SYMBOL_PROGRESS_STORAGE_KEY,
          newValue: serializedProgress,
          storageArea: window.localStorage,
        }),
      );
    });

    act(() => {
      result.current.recordAnswer("treble-clef", true);
    });

    expect(result.current.progress.symbols.staff?.errors).toBe(1);
    expect(result.current.progress.symbols["treble-clef"]?.correct).toBe(1);
  });
});
