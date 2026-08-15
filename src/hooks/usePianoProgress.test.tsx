/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PROGRESS_STORAGE_KEY, createEmptyProgress } from "../domain/progress";
import { PIANO_PROGRESS_STORAGE_KEY, createEmptyPianoProgress } from "../domain/pianoProgress";
import { usePianoProgress } from "./usePianoProgress";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("usePianoProgress", () => {
  it("persists Piano attempts without changing Note progress", async () => {
    const noteProgress = createEmptyProgress();
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(noteProgress));
    const { result } = renderHook(() => usePianoProgress());

    act(() => result.current.recordPianoAnswer("treble", "do-sharp", false));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(PIANO_PROGRESS_STORAGE_KEY) ?? "null");
      expect(stored.clefs.treble.spellings["do-sharp"].errors).toBe(1);
    });
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "null")).toEqual(noteProgress);
  });

  it("loads existing Piano progress and resets only one clef", async () => {
    const stored = createEmptyPianoProgress();
    stored.clefs.treble.spellings["si-flat"].views = 2;
    stored.clefs.bass.spellings["si-flat"].views = 3;
    window.localStorage.setItem(PIANO_PROGRESS_STORAGE_KEY, JSON.stringify(stored));
    const { result } = renderHook(() => usePianoProgress());

    expect(result.current.pianoProgress.clefs.treble.spellings["si-flat"].views).toBe(2);
    act(() => result.current.resetStoredPianoProgress("treble"));

    await waitFor(() => {
      expect(result.current.pianoProgress.clefs.treble.spellings["si-flat"].views).toBe(0);
    });
    expect(result.current.pianoProgress.clefs.bass.spellings["si-flat"].views).toBe(3);
  });
});
