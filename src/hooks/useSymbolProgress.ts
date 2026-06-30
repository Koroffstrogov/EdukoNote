import { useCallback, useEffect, useState } from "react";
import type { MusicSymbolId } from "../domain/musicSymbols";
import {
  SYMBOL_PROGRESS_STORAGE_KEY,
  normalizeSymbolProgress,
  recordRecentSymbol,
  recordSymbolAnswer,
  resetSymbolProgress,
  type SymbolProgressState,
} from "../domain/symbolProgress";

function readStoredSymbolProgress(): SymbolProgressState {
  if (typeof window === "undefined") {
    return normalizeSymbolProgress(null);
  }

  try {
    const rawValue = window.localStorage.getItem(SYMBOL_PROGRESS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;

    return normalizeSymbolProgress(parsedValue);
  } catch {
    return normalizeSymbolProgress(null);
  }
}

function writeStoredSymbolProgress(progress: SymbolProgressState) {
  try {
    window.localStorage.setItem(SYMBOL_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    undefined;
  }
}

export function useSymbolProgress() {
  const [progress, setProgress] = useState<SymbolProgressState>(() => readStoredSymbolProgress());

  useEffect(() => {
    writeStoredSymbolProgress(progress);
  }, [progress]);

  const recordAnswer = useCallback((symbolId: MusicSymbolId, isCorrect: boolean) => {
    setProgress((currentProgress) => recordSymbolAnswer(currentProgress, symbolId, isCorrect));
  }, []);

  const recordRecent = useCallback((symbolId: MusicSymbolId) => {
    setProgress((currentProgress) => recordRecentSymbol(currentProgress, symbolId));
  }, []);

  const resetStoredProgress = useCallback(() => {
    setProgress(resetSymbolProgress());
  }, []);

  return {
    progress,
    recordAnswer,
    recordRecent,
    resetStoredProgress,
  };
}
