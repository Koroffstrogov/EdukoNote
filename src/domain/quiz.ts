import { NOTE_DEFINITIONS, type NoteDefinition, type NoteId } from "./notes";
import { countTotalCorrect, type ProgressState } from "./progress";

export type QuizMode = "training" | "challenge" | "review";

export type QuizQuestion = {
  id: string;
  note: NoteDefinition;
  choices: NoteDefinition[];
};

export type ChallengeAnswer = {
  questionNumber: number;
  noteId: NoteId;
  noteLabel: string;
  selectedNoteId: NoteId;
  selectedLabel: string;
  isCorrect: boolean;
};

export function getUnlockedTrainingNotes(progress: ProgressState): NoteDefinition[] {
  const totalCorrect = countTotalCorrect(progress);

  return NOTE_DEFINITIONS.filter((note) => note.unlockAfterCorrect <= totalCorrect);
}

export function getReviewNotes(progress: ProgressState): NoteDefinition[] {
  return NOTE_DEFINITIONS.filter((note) => progress.notes[note.id].errors > 0).sort((first, second) => {
    const firstProgress = progress.notes[first.id];
    const secondProgress = progress.notes[second.id];
    const errorDifference = secondProgress.errors - firstProgress.errors;

    if (errorDifference !== 0) {
      return errorDifference;
    }

    return firstProgress.correct - secondProgress.correct;
  });
}

export function getQuestionPool(mode: QuizMode, progress: ProgressState): NoteDefinition[] {
  if (mode === "review") {
    return getReviewNotes(progress);
  }

  if (mode === "challenge") {
    return NOTE_DEFINITIONS;
  }

  return getUnlockedTrainingNotes(progress);
}

export function createQuestion(
  pool: NoteDefinition[],
  previousNoteId?: NoteId,
  random: () => number = Math.random,
): QuizQuestion {
  const safePool = pool.length > 0 ? pool : NOTE_DEFINITIONS;
  const note = pickNote(safePool, previousNoteId, random);
  const choices = createChoices(note, random);

  return {
    id: `${note.id}-${Date.now()}-${Math.floor(random() * 100000)}`,
    note,
    choices,
  };
}

export function createChoices(correctNote: NoteDefinition, random: () => number = Math.random): NoteDefinition[] {
  const byDistance = NOTE_DEFINITIONS.filter((note) => note.id !== correctNote.id).sort(
    (first, second) => Math.abs(first.svgY - correctNote.svgY) - Math.abs(second.svgY - correctNote.svgY),
  );
  const choices = [correctNote, ...byDistance.slice(0, 3)];

  return shuffle(choices, random);
}

export function getNotesToReview(answers: ChallengeAnswer[]): ChallengeAnswer[] {
  return answers.filter((answer) => !answer.isCorrect);
}

function pickNote(pool: NoteDefinition[], previousNoteId: NoteId | undefined, random: () => number): NoteDefinition {
  const candidates = pool.length > 1 ? pool.filter((note) => note.id !== previousNoteId) : pool;
  const index = Math.floor(random() * candidates.length);

  return candidates[Math.min(index, candidates.length - 1)];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];

    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
}
