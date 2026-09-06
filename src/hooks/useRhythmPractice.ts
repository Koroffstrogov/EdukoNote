import { useCallback, useRef, useState } from "react";
import { normalizeRhythmSettings, RHYTHM_SETTINGS_STORAGE_KEY, type RhythmSettings } from "../domain/rhythmExercise";
import { emptyRhythmProgress, normalizeRhythmProgress, recordRhythmSession, RHYTHM_PROGRESS_STORAGE_KEY, type RhythmProgress } from "../domain/rhythmProgress";
import type { CompletedRhythmSession } from "./useRhythmSession";
import { useStorageSync } from "./useStorageSync";

function read<T>(key: string, normalize: (value: unknown) => T): T {
  try { return normalize(JSON.parse(window.localStorage.getItem(key) ?? "null")); }
  catch { return normalize(null); }
}
function write(key: string, value: unknown): boolean {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function useRhythmPractice() {
  const [settings, setSettings] = useState(() => read(RHYTHM_SETTINGS_STORAGE_KEY, normalizeRhythmSettings));
  const [progress, setProgress] = useState(() => read(RHYTHM_PROGRESS_STORAGE_KEY, normalizeRhythmProgress));
  const progressRef = useRef(progress);
  const unsavedProgressRef = useRef(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  progressRef.current = progress;
  useStorageSync(RHYTHM_PROGRESS_STORAGE_KEY, normalizeRhythmProgress, setProgress);
  // Settings are changed explicitly in this tab. Another tab cannot alter a live trial.
  const updateSettings = useCallback((next: RhythmSettings) => {
    const normalized = normalizeRhythmSettings(next);
    setSettings(normalized);
    const saved = write(RHYTHM_SETTINGS_STORAGE_KEY, normalized);
    setStorageAvailable(saved && !unsavedProgressRef.current);
  }, []);
  const recordCompleted = useCallback((session: CompletedRhythmSession) => {
    // Read again before writing so a finished attempt from another tab is retained.
    let current: RhythmProgress;
    try {
      const raw = unsavedProgressRef.current ? null : window.localStorage.getItem(RHYTHM_PROGRESS_STORAGE_KEY);
      current = raw ? normalizeRhythmProgress(JSON.parse(raw)) : progressRef.current;
    } catch { current = progressRef.current; }
    const next = recordRhythmSession(current, session);
    progressRef.current = next;
    setProgress(next);
    const saved = write(RHYTHM_PROGRESS_STORAGE_KEY, next);
    unsavedProgressRef.current = !saved;
    setStorageAvailable(saved);
  }, []);
  const resetProgress = useCallback(() => {
    const next = emptyRhythmProgress();
    progressRef.current = next;
    setProgress(next);
    const saved = write(RHYTHM_PROGRESS_STORAGE_KEY, next);
    unsavedProgressRef.current = !saved;
    setStorageAvailable(saved);
  }, []);
  return { settings, progress, storageAvailable, updateSettings, recordCompleted, resetProgress };
}
