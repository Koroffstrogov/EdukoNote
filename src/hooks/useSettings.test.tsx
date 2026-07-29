/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  SETTINGS_STORAGE_KEY,
  createDefaultSettings,
  setReadingZone,
} from "../domain/settings";
import { useSettings } from "./useSettings";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("useSettings storage synchronization", () => {
  it("preserves settings received from another tab on the next local change", () => {
    const { result } = renderHook(() => useSettings());
    const externalSettings = setReadingZone(createDefaultSettings(), "treble", "upper");
    const serializedSettings = JSON.stringify(externalSettings);

    act(() => {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, serializedSettings);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: SETTINGS_STORAGE_KEY,
          newValue: serializedSettings,
          storageArea: window.localStorage,
        }),
      );
    });

    act(() => {
      result.current.updateReadingZone("bass", "lower");
    });

    expect(result.current.settings.readingZones.treble).toBe("upper");
    expect(result.current.settings.readingZones.bass).toBe("lower");
  });
});
