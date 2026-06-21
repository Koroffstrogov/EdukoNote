import { NOTE_DEFINITIONS, type NoteId } from "./notes";

export const PROGRESS_STORAGE_KEY = "edukonote.progress.v1";

export type NoteProgress = {
  views: number;
  correct: number;
  errors: number;
  lastPracticedAt: string | null;
};

export type ProgressState = {
  version: 1;
  notes: Record<NoteId, NoteProgress>;
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
    version: 1,
    notes: NOTE_DEFINITIONS.reduce(
      (accumulator, note) => ({
        ...accumulator,
        [note.id]: createEmptyNoteProgress(),
      }),
      {} as Record<NoteId, NoteProgress>,
    ),
  };
}

export function normalizeProgress(value: unknown): ProgressState {
  const emptyProgress = createEmptyProgress();

  if (!value || typeof value !== "object") {
    return emptyProgress;
  }

  const candidate = value as Partial<ProgressState>;
  const candidateNotes = candidate.notes && typeof candidate.notes === "object" ? candidate.notes : {};

  return {
    version: 1,
    notes: NOTE_DEFINITIONS.reduce((accumulator, note) => {
      const noteProgress = (candidateNotes as Partial<Record<NoteId, Partial<NoteProgress>>>)[note.id];

      accumulator[note.id] = {
        views: asCount(noteProgress?.views),
        correct: asCount(noteProgress?.correct),
        errors: asCount(noteProgress?.errors),
        lastPracticedAt: typeof noteProgress?.lastPracticedAt === "string" ? noteProgress.lastPracticedAt : null,
      };

      return accumulator;
    }, {} as Record<NoteId, NoteProgress>),
  };
}

export function recordAnswer(
  progress: ProgressState,
  noteId: NoteId,
  isCorrect: boolean,
  practicedAt = new Date().toISOString(),
): ProgressState {
  const current = progress.notes[noteId] ?? createEmptyNoteProgress();

  return {
    version: 1,
    notes: {
      ...progress.notes,
      [noteId]: {
        views: current.views + 1,
        correct: current.correct + (isCorrect ? 1 : 0),
        errors: current.errors + (isCorrect ? 0 : 1),
        lastPracticedAt: practicedAt,
      },
    },
  };
}

export function resetProgress(): ProgressState {
  return createEmptyProgress();
}

export function countTotalCorrect(progress: ProgressState): number {
  return NOTE_DEFINITIONS.reduce((total, note) => total + progress.notes[note.id].correct, 0);
}

export function countTotalViews(progress: ProgressState): number {
  return NOTE_DEFINITIONS.reduce((total, note) => total + progress.notes[note.id].views, 0);
}

export function countTotalErrors(progress: ProgressState): number {
  return NOTE_DEFINITIONS.reduce((total, note) => total + progress.notes[note.id].errors, 0);
}

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
