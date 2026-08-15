import { useCallback, useEffect, useState } from "react";
import type { Clef } from "../domain/notes";
import type { PianoSpellingId } from "../domain/piano";
import {
  PIANO_PROGRESS_STORAGE_KEY,
  createEmptyPianoProgress,
  normalizePianoProgress,
  recordPianoAnswer,
  recordRecentPianoQuestion,
  resetPianoProgress,
  type PianoProgressState,
} from "../domain/pianoProgress";
import { parseStoredJson, useStorageSync } from "./useStorageSync";

function readStoredPianoProgress(): PianoProgressState {
  if (typeof window === "undefined") {
    return createEmptyPianoProgress();
  }

  try {
    const parsedValue = parseStoredJson(window.localStorage.getItem(PIANO_PROGRESS_STORAGE_KEY));

    return normalizePianoProgress(parsedValue.ok ? parsedValue.value : null);
  } catch {
    return createEmptyPianoProgress();
  }
}

function writeStoredPianoProgress(progress: PianoProgressState) {
  try {
    window.localStorage.setItem(PIANO_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    undefined;
  }
}

export function usePianoProgress() {
  const [pianoProgress, setPianoProgress] = useState<PianoProgressState>(() => readStoredPianoProgress());

  useStorageSync(PIANO_PROGRESS_STORAGE_KEY, normalizePianoProgress, setPianoProgress);

  useEffect(() => {
    writeStoredPianoProgress(pianoProgress);
  }, [pianoProgress]);

  const recordAnswer = useCallback((clef: Clef, spellingId: PianoSpellingId, isCorrect: boolean) => {
    setPianoProgress((currentProgress) => recordPianoAnswer(currentProgress, clef, spellingId, isCorrect));
  }, []);

  const recordRecentQuestion = useCallback((clef: Clef, spellingId: PianoSpellingId) => {
    setPianoProgress((currentProgress) => recordRecentPianoQuestion(currentProgress, clef, spellingId));
  }, []);

  const resetStoredPianoProgress = useCallback((clef: Clef) => {
    setPianoProgress((currentProgress) => resetPianoProgress(currentProgress, clef));
  }, []);

  return {
    pianoProgress,
    recordPianoAnswer: recordAnswer,
    recordRecentPianoQuestion: recordRecentQuestion,
    resetStoredPianoProgress,
  };
}
