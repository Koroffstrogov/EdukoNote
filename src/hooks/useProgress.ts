import { useCallback, useEffect, useState } from "react";
import { PROGRESS_STORAGE_KEY, normalizeProgress, recordAnswer, resetProgress, type ProgressState } from "../domain/progress";
import type { NoteId } from "../domain/notes";

function readStoredProgress(): ProgressState {
  if (typeof window === "undefined") {
    return normalizeProgress(null);
  }

  try {
    const rawValue = window.localStorage.getItem(PROGRESS_STORAGE_KEY);

    return normalizeProgress(rawValue ? JSON.parse(rawValue) : null);
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

  const recordNoteAnswer = useCallback((noteId: NoteId, isCorrect: boolean) => {
    setProgress((currentProgress) => recordAnswer(currentProgress, noteId, isCorrect));
  }, []);

  const resetStoredProgress = useCallback(() => {
    setProgress(resetProgress());
  }, []);

  return {
    progress,
    recordNoteAnswer,
    resetStoredProgress,
  };
}
