import {
  ANSWER_LABELS,
  getNotesForClef,
  type AnswerLabel,
  type Clef,
} from "./notes";
import {
  createEmptyNoteProgress,
  type NoteProgress,
  type ProgressState,
} from "./progress";

export type AnswerProgressSummary = {
  label: AnswerLabel;
  noteProgress: NoteProgress;
};

export function summarizeProgressByAnswer(
  progress: ProgressState,
  clef: Clef,
): AnswerProgressSummary[] {
  return ANSWER_LABELS.map((label) => {
    const noteProgress = getNotesForClef(clef)
      .filter((note) => note.answerLabel === label)
      .reduce<NoteProgress>((summary, note) => {
        const currentProgress = progress.clefs[clef].notes[note.id] ?? createEmptyNoteProgress();

        return {
          views: summary.views + currentProgress.views,
          correct: summary.correct + currentProgress.correct,
          errors: summary.errors + currentProgress.errors,
          needsReview: summary.needsReview || currentProgress.needsReview,
          lastPracticedAt: null,
        };
      }, createEmptyNoteProgress());

    return { label, noteProgress };
  });
}

export function countAnswerLabelsToReview(progress: ProgressState, clef: Clef): number {
  return summarizeProgressByAnswer(progress, clef).filter(({ noteProgress }) => noteProgress.needsReview).length;
}
