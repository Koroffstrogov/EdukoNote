import { dayNumber, isDay, localDay } from "./calendar";

export const PRACTICE_DAYS_STORAGE_KEY = "edukonote.practiceDays.v1";
export type PracticeDays = { version: 1; days: string[]; perfectSeries: number; recentSessions: string[] };
export type SeriesCompletion = { id: string; score: number; total: number; day: string };
export const emptyPracticeDays = (): PracticeDays => ({ version: 1, days: [], perfectSeries: 0, recentSessions: [] });

export function normalizePracticeDays(value: unknown): PracticeDays {
  if (!value || typeof value !== "object") return emptyPracticeDays();
  const data = value as Partial<PracticeDays>;
  if (data.version !== 1) return emptyPracticeDays();
  return {
    version: 1,
    days: Array.isArray(data.days) ? [...new Set(data.days.filter(isDay))].sort().slice(-10000) : [],
    perfectSeries: Number.isSafeInteger(data.perfectSeries) && data.perfectSeries! >= 0 ? data.perfectSeries! : 0,
    recentSessions: Array.isArray(data.recentSessions) ? data.recentSessions.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length < 100).slice(-128) : [],
  };
}

export function recordPracticeDay(progress: PracticeDays, completion: SeriesCompletion): PracticeDays {
  const { id, score, total, day } = completion;
  if (!id || !isDay(day) || ![10, 15].includes(total) || !Number.isInteger(score) || score < 0 || score > total || progress.recentSessions.includes(id)) return progress;
  return {
    version: 1,
    days: [...new Set([...progress.days, day])].sort().slice(-10000),
    perfectSeries: progress.perfectSeries + Number(score === total),
    recentSessions: [...progress.recentSessions, id].slice(-128),
  };
}

export function summarizePracticeDays(progress: PracticeDays, today = localDay()) {
  const days = progress.days.filter((day) => day <= today);
  const completedToday = days.includes(today);
  let best = 0;
  let run = 0;
  days.forEach((day, index) => {
    run = index > 0 && dayNumber(day) - dayNumber(days[index - 1]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  const last = days[days.length - 1];
  const current = last && dayNumber(today) - dayNumber(last) <= 1 ? run : 0;
  return { completedToday, current, best, totalDays: days.length, perfectSeries: progress.perfectSeries };
}
