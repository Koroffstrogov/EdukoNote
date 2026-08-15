import { CLEFS, type Clef } from "./notes";
import { PIANO_SPELLINGS, isPianoSpellingId, type PianoSpellingId } from "./piano";
import { createEmptyNoteProgress, type NoteProgress } from "./progress";

export const PIANO_PROGRESS_STORAGE_KEY = "edukonote.pianoProgress.v1";

export type PianoClefProgress = {
  spellings: Record<PianoSpellingId, NoteProgress>;
  recentHistory: PianoSpellingId[];
};

export type PianoProgressState = {
  version: 1;
  clefs: Record<Clef, PianoClefProgress>;
};

export function createEmptyPianoProgress(): PianoProgressState {
  return {
    version: 1,
    clefs: CLEFS.reduce(
      (result, clef) => ({ ...result, [clef]: createEmptyPianoClefProgress() }),
      {} as Record<Clef, PianoClefProgress>,
    ),
  };
}

export function createEmptyPianoClefProgress(): PianoClefProgress {
  return {
    spellings: PIANO_SPELLINGS.reduce(
      (result, spelling) => ({ ...result, [spelling.id]: createEmptyNoteProgress() }),
      {} as Record<PianoSpellingId, NoteProgress>,
    ),
    recentHistory: [],
  };
}

export function normalizePianoProgress(value: unknown): PianoProgressState {
  if (!value || typeof value !== "object" || (value as Partial<PianoProgressState>).version !== 1) {
    return createEmptyPianoProgress();
  }

  const candidate = value as Partial<PianoProgressState>;

  return {
    version: 1,
    clefs: CLEFS.reduce(
      (result, clef) => ({
        ...result,
        [clef]: normalizePianoClefProgress(candidate.clefs?.[clef]),
      }),
      {} as Record<Clef, PianoClefProgress>,
    ),
  };
}

export function recordPianoAnswer(
  progress: PianoProgressState,
  clef: Clef,
  spellingId: PianoSpellingId,
  isCorrect: boolean,
  practicedAt = new Date().toISOString(),
): PianoProgressState {
  const current = progress.clefs[clef].spellings[spellingId] ?? createEmptyNoteProgress();

  return {
    ...progress,
    clefs: {
      ...progress.clefs,
      [clef]: {
        ...progress.clefs[clef],
        spellings: {
          ...progress.clefs[clef].spellings,
          [spellingId]: {
            views: current.views + 1,
            correct: current.correct + (isCorrect ? 1 : 0),
            errors: current.errors + (isCorrect ? 0 : 1),
            needsReview: !isCorrect,
            lastPracticedAt: practicedAt,
          },
        },
      },
    },
  };
}

export function recordRecentPianoQuestion(
  progress: PianoProgressState,
  clef: Clef,
  spellingId: PianoSpellingId,
): PianoProgressState {
  return {
    ...progress,
    clefs: {
      ...progress.clefs,
      [clef]: {
        ...progress.clefs[clef],
        recentHistory: [...progress.clefs[clef].recentHistory, spellingId]
          .filter(isPianoSpellingId)
          .slice(-3),
      },
    },
  };
}

export function resetPianoProgress(progress: PianoProgressState, clef: Clef): PianoProgressState {
  return {
    ...progress,
    clefs: {
      ...progress.clefs,
      [clef]: createEmptyPianoClefProgress(),
    },
  };
}

export function summarizePianoProgress(progress: PianoProgressState, clef: Clef) {
  const spellingProgress = Object.values(progress.clefs[clef].spellings);

  return spellingProgress.reduce(
    (summary, current) => ({
      views: summary.views + current.views,
      correct: summary.correct + current.correct,
      errors: summary.errors + current.errors,
      needsReview: summary.needsReview + (current.needsReview ? 1 : 0),
    }),
    { views: 0, correct: 0, errors: 0, needsReview: 0 },
  );
}

function normalizePianoClefProgress(value: unknown): PianoClefProgress {
  const candidate = value && typeof value === "object" ? value as Partial<PianoClefProgress> : {};
  const candidateSpellings: Partial<Record<PianoSpellingId, Partial<NoteProgress>>> =
    candidate.spellings && typeof candidate.spellings === "object"
      ? candidate.spellings
      : {};

  return {
    spellings: PIANO_SPELLINGS.reduce((result, spelling) => {
      const stored = candidateSpellings[spelling.id];
      const errors = asCount(stored?.errors);

      result[spelling.id] = {
        views: asCount(stored?.views),
        correct: asCount(stored?.correct),
        errors,
        needsReview: typeof stored?.needsReview === "boolean" ? stored.needsReview : errors > 0,
        lastPracticedAt: typeof stored?.lastPracticedAt === "string" ? stored.lastPracticedAt : null,
      };

      return result;
    }, {} as Record<PianoSpellingId, NoteProgress>),
    recentHistory: Array.isArray(candidate.recentHistory)
      ? candidate.recentHistory.filter(isPianoSpellingId).slice(-3)
      : [],
  };
}

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
