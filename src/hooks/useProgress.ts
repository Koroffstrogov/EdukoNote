import { useCallback, useEffect, useState } from "react";
import type { Clef, NoteId } from "../domain/notes";
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  normalizeProgress,
  recordAnswer,
  recordRecentQuestion,
  resetProgress,
  setActiveClef,
  type ProgressState,
} from "../domain/progress";

function readStoredProgress(): ProgressState {
  if (typeof window === "undefined") {
    return normalizeProgress(null);
  }

  try {
    const rawValue = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    const rawLegacyValue = window.localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    const parsedLegacyValue = rawLegacyValue ? JSON.parse(rawLegacyValue) : null;

    return normalizeProgress(parsedValue, parsedLegacyValue);
  } catch {
    return normalizeProgress(null);
  }
}

function writeStoredProgress(progress: ProgressState) {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    undefined;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => readStoredProgress());

  useEffect(() => {
    writeStoredProgress(progress);
  }, [progress]);

  const switchActiveClef = useCallback((clef: Clef) => {
    setProgress((currentProgress) => {
      const nextProgress = setActiveClef(currentProgress, clef);

      writeStoredProgress(nextProgress);

      return nextProgress;
    });
  }, []);

  const recordNoteAnswer = useCallback((noteId: NoteId, isCorrect: boolean) => {
    setProgress((currentProgress) => recordAnswer(currentProgress, currentProgress.activeClef, noteId, isCorrect));
  }, []);

  const recordRecentNote = useCallback((noteId: NoteId) => {
    setProgress((currentProgress) => recordRecentQuestion(currentProgress, currentProgress.activeClef, noteId));
  }, []);

  const resetStoredProgress = useCallback(() => {
    setProgress((currentProgress) => resetProgress(currentProgress, currentProgress.activeClef));
  }, []);

  return {
    progress,
    activeClef: progress.activeClef,
    switchActiveClef,
    recordNoteAnswer,
    recordRecentNote,
    resetStoredProgress,
  };
}
