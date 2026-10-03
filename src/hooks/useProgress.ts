import { useCallback, useEffect, useState } from "react";
import type { Clef, NoteId, ReadingZone } from "../domain/notes";
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  normalizeProgress,
  recordAnswer,
  recordRecentQuestion,
  recordReadingAward,
  resetProgress,
  setActiveClef,
  type ProgressState,
} from "../domain/progress";
import type { ChallengeAnswer } from "../domain/quiz";
import { getPaletteForClef } from "../theme/tokens";
import { parseStoredJson, useStorageSync } from "./useStorageSync";

function readStoredProgress(): ProgressState {
  if (typeof window === "undefined") {
    return normalizeProgress(null);
  }

  try {
    const rawValue = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    const rawLegacyValue = window.localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
    const parsedValue = parseStoredJson(rawValue);
    const parsedLegacyValue = parseStoredJson(rawLegacyValue);

    return normalizeProgress(
      parsedValue.ok ? parsedValue.value : null,
      parsedLegacyValue.ok ? parsedLegacyValue.value : null,
    );
  } catch {
    return normalizeProgress(null);
  }
}

function writeStoredProgress(progress: ProgressState) {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => readStoredProgress());
  const [storageAvailable, setStorageAvailable] = useState(true);

  useStorageSync(PROGRESS_STORAGE_KEY, normalizeProgress, setProgress);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.palette = getPaletteForClef(progress.activeClef);
    }

    setStorageAvailable(writeStoredProgress(progress));
  }, [progress]);

  const switchActiveClef = useCallback((clef: Clef) => {
    setProgress((currentProgress) => setActiveClef(currentProgress, clef));
  }, []);

  const recordNoteAnswer = useCallback((noteId: NoteId, isCorrect: boolean, clef?: Clef) => {
    const at = new Date().toISOString();
    setProgress((currentProgress) => recordAnswer(currentProgress, clef ?? currentProgress.activeClef, noteId, isCorrect, at));
  }, []);

  const recordRecentNote = useCallback((noteId: NoteId) => {
    setProgress((currentProgress) => recordRecentQuestion(currentProgress, currentProgress.activeClef, noteId));
  }, []);

  const resetStoredProgress = useCallback(() => {
    setProgress((currentProgress) => resetProgress(currentProgress, currentProgress.activeClef));
  }, []);

  const saveReadingAward = useCallback((clef: Clef, mode: "exam" | "fluency", answers: ChallengeAnswer[], medianMs: number | null, zone: ReadingZone = "full") => {
    const at = new Date().toISOString();
    setProgress((current) => recordReadingAward(current, clef, mode, answers, medianMs, at, zone));
  }, []);

  return {
    progress,
    storageAvailable,
    activeClef: progress.activeClef,
    switchActiveClef,
    recordNoteAnswer,
    recordRecentNote,
    resetStoredProgress,
    saveReadingAward,
  };
}
