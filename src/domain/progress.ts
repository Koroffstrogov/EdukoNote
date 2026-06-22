import { getNotesForClef, isClef, isNoteId, type Clef, type NoteId } from "./notes";

export const PROGRESS_STORAGE_KEY = "edukonote.progress.v2";
export const LEGACY_PROGRESS_STORAGE_KEY = "edukonote.progress.v1";

export type NoteProgress = {
  views: number;
  correct: number;
  errors: number;
  lastPracticedAt: string | null;
};

export type ClefProgress = {
  notes: Partial<Record<NoteId, NoteProgress>>;
  recentHistory: NoteId[];
};

export type ProgressState = {
  version: 2;
  activeClef: Clef;
  clefs: Record<Clef, ClefProgress>;
};

type LegacyProgressState = {
  version?: unknown;
  notes?: Record<string, Partial<NoteProgress> | undefined>;
};

const legacyNoteIdMap: Partial<Record<string, NoteId>> = {
  do: "do4",
  re: "re4",
  mi: "mi4",
  fa: "fa4",
  sol: "sol4",
  la: "la4",
  si: "si4",
};

export function createEmptyNoteProgress(): NoteProgress {
  return {
    views: 0,
    correct: 0,
    errors: 0,
    lastPracticedAt: null,
  };
}

export function createEmptyProgress(): ProgressState {
  return {
    version: 2,
    activeClef: "treble",
    clefs: {
      treble: createEmptyClefProgress("treble"),
      bass: createEmptyClefProgress("bass"),
    },
  };
}

export function createEmptyClefProgress(clef: Clef): ClefProgress {
  return {
    notes: getNotesForClef(clef).reduce(
      (accumulator, note) => ({
        ...accumulator,
        [note.id]: createEmptyNoteProgress(),
      }),
      {} as Partial<Record<NoteId, NoteProgress>>,
    ),
    recentHistory: [],
  };
}

export function normalizeProgress(value: unknown, legacyValue?: unknown): ProgressState {
  if (isProgressV2(value)) {
    return normalizeProgressV2(value);
  }

  return migrateLegacyProgress(legacyValue ?? value);
}

export function setActiveClef(progress: ProgressState, clef: Clef): ProgressState {
  return {
    ...progress,
    activeClef: clef,
  };
}

export function recordAnswer(
  progress: ProgressState,
  clef: Clef,
  noteId: NoteId,
  isCorrect: boolean,
  practicedAt = new Date().toISOString(),
): ProgressState {
  if (!noteBelongsToClef(noteId, clef)) {
    return progress;
  }

  const current = progress.clefs[clef].notes[noteId] ?? createEmptyNoteProgress();

  return {
    ...progress,
    clefs: {
      ...progress.clefs,
      [clef]: {
        ...progress.clefs[clef],
        notes: {
          ...progress.clefs[clef].notes,
          [noteId]: {
            views: current.views + 1,
            correct: current.correct + (isCorrect ? 1 : 0),
            errors: current.errors + (isCorrect ? 0 : 1),
            lastPracticedAt: practicedAt,
          },
        },
      },
    },
  };
}

export function recordRecentQuestion(progress: ProgressState, clef: Clef, noteId: NoteId): ProgressState {
  if (!noteBelongsToClef(noteId, clef)) {
    return progress;
  }

  const recentHistory = [...progress.clefs[clef].recentHistory, noteId]
    .filter((candidateNoteId) => noteBelongsToClef(candidateNoteId, clef))
    .slice(-3);

  return {
    ...progress,
    clefs: {
      ...progress.clefs,
      [clef]: {
        ...progress.clefs[clef],
        recentHistory,
      },
    },
  };
}

export function resetProgress(progress: ProgressState, clef: Clef): ProgressState {
  return {
    ...progress,
    clefs: {
      ...progress.clefs,
      [clef]: createEmptyClefProgress(clef),
    },
  };
}

export function countTotalCorrect(progress: ProgressState, clef: Clef): number {
  return getNotesForClef(clef).reduce((total, note) => total + getStoredNoteProgress(progress, clef, note.id).correct, 0);
}

export function countTotalViews(progress: ProgressState, clef: Clef): number {
  return getNotesForClef(clef).reduce((total, note) => total + getStoredNoteProgress(progress, clef, note.id).views, 0);
}

export function countTotalErrors(progress: ProgressState, clef: Clef): number {
  return getNotesForClef(clef).reduce((total, note) => total + getStoredNoteProgress(progress, clef, note.id).errors, 0);
}

function normalizeProgressV2(candidate: ProgressState): ProgressState {
  return {
    version: 2,
    activeClef: isClef(candidate.activeClef) ? candidate.activeClef : "treble",
    clefs: {
      treble: normalizeClefProgress("treble", candidate.clefs?.treble),
      bass: normalizeClefProgress("bass", candidate.clefs?.bass),
    },
  };
}

function migrateLegacyProgress(value: unknown): ProgressState {
  const emptyProgress = createEmptyProgress();

  if (!value || typeof value !== "object") {
    return emptyProgress;
  }

  const candidate = value as LegacyProgressState;
  const candidateNotes = candidate.notes && typeof candidate.notes === "object" ? candidate.notes : {};

  return {
    ...emptyProgress,
    clefs: {
      ...emptyProgress.clefs,
      treble: {
        notes: normalizeNotes(candidateNotes, "treble", true),
        recentHistory: [],
      },
    },
  };
}

function normalizeClefProgress(clef: Clef, value: unknown): ClefProgress {
  const candidate = value && typeof value === "object" ? (value as Partial<ClefProgress>) : {};
  const candidateNotes = candidate.notes && typeof candidate.notes === "object" ? candidate.notes : {};
  const candidateHistory = Array.isArray(candidate.recentHistory) ? candidate.recentHistory : [];

  return {
    notes: normalizeNotes(candidateNotes as Record<string, Partial<NoteProgress> | undefined>, clef, false),
    recentHistory: candidateHistory
      .filter(
        (value): value is NoteId =>
          isNoteId(value) && getNotesForClef(clef).some((note) => note.id === value),
      )
      .slice(-3),
  };
}

function normalizeNotes(
  candidateNotes: Record<string, Partial<NoteProgress> | undefined>,
  clef: Clef,
  readLegacyIds: boolean,
): Partial<Record<NoteId, NoteProgress>> {
  return getNotesForClef(clef).reduce((accumulator, note) => {
    const noteProgress = readStoredNoteProgress(note.id, candidateNotes, readLegacyIds);

    accumulator[note.id] = {
      views: asCount(noteProgress?.views),
      correct: asCount(noteProgress?.correct),
      errors: asCount(noteProgress?.errors),
      lastPracticedAt: typeof noteProgress?.lastPracticedAt === "string" ? noteProgress.lastPracticedAt : null,
    };

    return accumulator;
  }, {} as Partial<Record<NoteId, NoteProgress>>);
}

function isProgressV2(value: unknown): value is ProgressState {
  return Boolean(value && typeof value === "object" && (value as Partial<ProgressState>).version === 2);
}

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function readStoredNoteProgress(
  noteId: NoteId,
  candidateNotes: Record<string, Partial<NoteProgress> | undefined>,
  readLegacyIds: boolean,
) {
  const directProgress = candidateNotes[noteId];

  if (directProgress) {
    return directProgress;
  }

  if (!readLegacyIds) {
    return undefined;
  }

  const legacyNoteId = Object.entries(legacyNoteIdMap).find(([, mappedNoteId]) => mappedNoteId === noteId)?.[0];

  return legacyNoteId ? candidateNotes[legacyNoteId] : undefined;
}

function noteBelongsToClef(noteId: NoteId, clef: Clef): boolean {
  return getNotesForClef(clef).some((note) => note.id === noteId);
}

function getStoredNoteProgress(progress: ProgressState, clef: Clef, noteId: NoteId): NoteProgress {
  return progress.clefs[clef].notes[noteId] ?? createEmptyNoteProgress();
}
