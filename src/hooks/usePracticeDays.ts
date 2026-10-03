import { useCallback, useEffect, useRef, useState } from "react";
import { localDay } from "../domain/calendar";
import { normalizePracticeDays, PRACTICE_DAYS_STORAGE_KEY, recordPracticeDay, summarizePracticeDays, type SeriesCompletion } from "../domain/practiceDays";
import { useStorageSync } from "./useStorageSync";

function read() {
  try { return normalizePracticeDays(JSON.parse(localStorage.getItem(PRACTICE_DAYS_STORAGE_KEY) ?? "null")); }
  catch { return normalizePracticeDays(null); }
}

export function usePracticeDays() {
  const [progress, setProgress] = useState(read);
  const progressRef = useRef(progress);
  const dirtyRef = useRef(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [today, setToday] = useState(localDay);
  progressRef.current = progress;
  useStorageSync(PRACTICE_DAYS_STORAGE_KEY, normalizePracticeDays, setProgress);
  useEffect(() => {
    const refresh = () => setToday(localDay());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  const completeSeries = useCallback((completion: Omit<SeriesCompletion, "day">) => {
    const day = localDay();
    let current = progressRef.current;
    if (!dirtyRef.current) {
      try {
        const raw = localStorage.getItem(PRACTICE_DAYS_STORAGE_KEY);
        if (raw) current = normalizePracticeDays(JSON.parse(raw));
      } catch { /* Retain the in-memory result if storage is inaccessible. */ }
    }
    const next = recordPracticeDay(current, { ...completion, day });
    progressRef.current = next;
    setProgress(next);
    setToday(day);
    try {
      localStorage.setItem(PRACTICE_DAYS_STORAGE_KEY, JSON.stringify(next));
      dirtyRef.current = false;
      setStorageAvailable(true);
    } catch { dirtyRef.current = true; setStorageAvailable(false); }
  }, []);
  return { progress, today, summary: summarizePracticeDays(progress, today), storageAvailable, completeSeries };
}
