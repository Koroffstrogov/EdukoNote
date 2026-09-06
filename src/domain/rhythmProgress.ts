import { buildRhythmPlan, normalizeRhythmSettings, RHYTHM_MODES, RHYTHM_TEMPOS, getRhythmPattern, type RhythmMode, type RhythmResult, type RhythmSettings } from "./rhythmExercise";

export const RHYTHM_PROGRESS_STORAGE_KEY = "edukonote.rhythmProgress.v1";
export type RhythmProgressEntry = {
  settings: RhythmSettings; attempts: number; correct: number; errors: number; needsReview: boolean;
  bestCoverage: number; lastMeanOffsetMs: number | null; lastMedianOffsetMs: number | null; lastPlayedAt: string;
};
export type RhythmProgress = { version: 1; entries: Record<string, RhythmProgressEntry>; recentIds: string[] };
export const emptyRhythmProgress = (): RhythmProgress => ({ version: 1, entries: {}, recentIds: [] });

/** Separate exercise, formula, tempo and assistance; pulse always has a click. */
export function rhythmProgressKey(settings: RhythmSettings) {
  const { mode, tempo, patternId, visualGuide, metronome } = settings;
  return `${mode}:${mode === "pulse" ? "pulse" : patternId}:${tempo}:${Number(visualGuide)}:${Number(mode === "pulse" || metronome)}`;
}
const count = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? Math.min(value, 1_000_000_000) : 0;
const offset = (value: unknown) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 1000 ? value : null;

export function normalizeRhythmProgress(value: unknown): RhythmProgress {
  const progress = emptyRhythmProgress();
  if (!value || typeof value !== "object") return progress;
  const data = value as Partial<RhythmProgress>;
  if (data.version !== 1 || !data.entries || typeof data.entries !== "object") return progress;
  for (const [key, raw] of Object.entries(data.entries).slice(0, 500)) {
    if (!raw || typeof raw !== "object" || !raw.settings || typeof raw.settings !== "object") continue;
    const input = raw.settings;
    if (!RHYTHM_MODES.includes(input.mode) || !RHYTHM_TEMPOS.includes(input.tempo) || getRhythmPattern(input.patternId).id !== input.patternId) continue;
    const settings = normalizeRhythmSettings(input);
    if (key !== rhythmProgressKey(settings)) continue;
    const correct = count(raw.correct);
    const errors = count(raw.errors);
    progress.entries[key] = {
      settings, attempts: correct + errors, correct, errors,
      needsReview: errors > 0 && raw.needsReview === true,
      bestCoverage: typeof raw.bestCoverage === "number" && Number.isFinite(raw.bestCoverage) ? Math.max(0, Math.min(1, raw.bestCoverage)) : 0,
      lastMeanOffsetMs: offset(raw.lastMeanOffsetMs), lastMedianOffsetMs: offset(raw.lastMedianOffsetMs),
      lastPlayedAt: typeof raw.lastPlayedAt === "string" && Number.isFinite(Date.parse(raw.lastPlayedAt)) ? raw.lastPlayedAt : "",
    };
  }
  progress.recentIds = Array.isArray(data.recentIds) ? data.recentIds.filter((id): id is string => typeof id === "string" && id.length <= 100).slice(-64) : [];
  return progress;
}

export function recordRhythmSession(progress: RhythmProgress, session: { id: string; plan: ReturnType<typeof buildRhythmPlan>; result: RhythmResult; finishedAt: string }): RhythmProgress {
  if (progress.recentIds.includes(session.id)) return progress;
  const settings = normalizeRhythmSettings(session.plan.settings);
  const key = rhythmProgressKey(settings);
  const previous = progress.entries[key];
  const { result } = session;
  const coverage = result.expected ? result.matched / (result.expected + result.extra) : 0;
  return {
    version: 1,
    recentIds: [...progress.recentIds, session.id].slice(-64),
    entries: { ...progress.entries, [key]: {
      settings,
      attempts: (previous?.attempts ?? 0) + 1,
      correct: (previous?.correct ?? 0) + Number(result.success),
      errors: (previous?.errors ?? 0) + Number(!result.success),
      needsReview: !result.success,
      bestCoverage: Math.max(previous?.bestCoverage ?? 0, coverage),
      lastMeanOffsetMs: result.meanOffsetMs, lastMedianOffsetMs: result.medianOffsetMs, lastPlayedAt: session.finishedAt,
    } },
  };
}

export function summarizeRhythmProgress(progress: RhythmProgress, mode: RhythmMode) {
  const entries = Object.values(progress.entries).filter((entry) => entry.settings.mode === mode);
  return { attempts: entries.reduce((sum, entry) => sum + entry.attempts, 0), correct: entries.reduce((sum, entry) => sum + entry.correct, 0), toReview: entries.filter((entry) => entry.needsReview).length };
}
