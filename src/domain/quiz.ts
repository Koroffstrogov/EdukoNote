import {
  ANSWER_LABELS,
  getInitialTrainingNoteIds,
  getNoteById,
  getNotesForClef,
  type AnswerLabel,
  type Clef,
  type NoteDefinition,
  type NoteId,
} from "./notes";
import { countTotalCorrect, type ProgressState } from "./progress";

export type QuizMode = "training" | "challenge" | "review" | "speed";

export type QuizQuestion = {
  id: string;
  questionIndex: number;
  note: NoteDefinition;
  choices: AnswerLabel[];
};

export type ChallengeAnswer = {
  questionNumber: number;
  noteId: NoteId;
  noteLabel: AnswerLabel;
  selectedLabel: AnswerLabel;
  isCorrect: boolean;
};

export function getUnlockedTrainingNotes(clef: Clef, progress: ProgressState): NoteDefinition[] {
  const notes = getNotesForClef(clef);
  const totalCorrect = countTotalCorrect(progress, clef);
  const initialNoteIds = new Set(getInitialTrainingNoteIds(clef));
  const unlockedNotes = notes.filter((note) => initialNoteIds.has(note.id) || note.unlockAfterCorrect <= totalCorrect);

  return unlockedNotes.length > 0 ? unlockedNotes : notes.filter((note) => note.unlockAfterCorrect === 0);
}

export function getReviewNotes(clef: Clef, progress: ProgressState): NoteDefinition[] {
  return getNotesForClef(clef)
    .filter((note) => (progress.clefs[clef].notes[note.id]?.errors ?? 0) > 0)
    .sort((first, second) => {
      const firstProgress = progress.clefs[clef].notes[first.id] ?? {
        views: 0,
        correct: 0,
        errors: 0,
        lastPracticedAt: null,
      };
      const secondProgress = progress.clefs[clef].notes[second.id] ?? {
        views: 0,
        correct: 0,
        errors: 0,
        lastPracticedAt: null,
      };
      const errorDifference = secondProgress.errors - firstProgress.errors;

      if (errorDifference !== 0) {
        return errorDifference;
      }

      return firstProgress.correct - secondProgress.correct;
    });
}

export function getQuestionPool(mode: QuizMode, clef: Clef, progress: ProgressState): NoteDefinition[] {
  if (mode === "review") {
    return getReviewNotes(clef, progress);
  }

  if (mode === "challenge" || mode === "speed") {
    return getNotesForClef(clef);
  }

  return getUnlockedTrainingNotes(clef, progress);
}

export function createQuestion(
  pool: NoteDefinition[],
  previousNoteId?: NoteId,
  random: () => number = Math.random,
): QuizQuestion {
  const previousQuestion = previousNoteId ? createPreviousQuestion(previousNoteId) : null;

  return generateNextQuestion(previousQuestion, previousNoteId ? [previousNoteId] : [], pool, "training", random, 1);
}

export function generateNextQuestion(
  previousQuestion: QuizQuestion | null,
  recentHistory: NoteId[],
  availableNotes: NoteDefinition[],
  mode: QuizMode,
  random: () => number = Math.random,
  questionIndex = 1,
): QuizQuestion {
  const clef = availableNotes[0]?.clef ?? previousQuestion?.note.clef ?? "treble";
  const safePool = availableNotes.length > 0 ? availableNotes : getNotesForClef(clef);
  const note = pickNextNote(safePool, previousQuestion?.note.id, recentHistory, random);
  const choices = createChoices(note, note.clef, random);

  return {
    id: `${mode}-${clef}-${questionIndex}-${note.id}`,
    questionIndex,
    note,
    choices,
  };
}

export function createChoices(
  correctNote: NoteDefinition,
  clef: Clef = correctNote.clef,
  random: () => number = Math.random,
): AnswerLabel[] {
  const plausibleDistractors = getNotesForClef(clef)
    .filter((note) => note.answerLabel !== correctNote.answerLabel)
    .sort((first, second) => Math.abs(first.stepIndex - correctNote.stepIndex) - Math.abs(second.stepIndex - correctNote.stepIndex))
    .map((note) => note.answerLabel);
  const uniqueDistractors = uniqueLabels(plausibleDistractors).slice(0, 3);
  const filledDistractors = fillDistractors(uniqueDistractors, correctNote.answerLabel);

  return shuffle([correctNote.answerLabel, ...filledDistractors], random);
}

export function getNotesToReview(answers: ChallengeAnswer[]): ChallengeAnswer[] {
  return answers.filter((answer) => !answer.isCorrect);
}

function pickNextNote(
  pool: NoteDefinition[],
  previousNoteId: NoteId | undefined,
  recentHistory: NoteId[],
  random: () => number,
): NoteDefinition {
  const recentSet = new Set(recentHistory.slice(-3));
  const withoutPreviousAndRecent = pool.filter((note) => note.id !== previousNoteId && !recentSet.has(note.id));
  const withoutPrevious = pool.filter((note) => note.id !== previousNoteId);
  const candidates = withoutPreviousAndRecent.length > 0 ? withoutPreviousAndRecent : withoutPrevious.length > 0 ? withoutPrevious : pool;
  const index = Math.floor(random() * candidates.length);

  return candidates[Math.min(index, candidates.length - 1)];
}

function fillDistractors(distractors: AnswerLabel[], correctLabel: AnswerLabel): AnswerLabel[] {
  const labels = [...distractors];

  for (const label of ANSWER_LABELS) {
    if (labels.length >= 3) {
      break;
    }

    if (label !== correctLabel && !labels.includes(label)) {
      labels.push(label);
    }
  }

  return labels.slice(0, 3);
}

function uniqueLabels(labels: AnswerLabel[]): AnswerLabel[] {
  return labels.filter((label, index) => labels.indexOf(label) === index);
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

function createPreviousQuestion(noteId: NoteId): QuizQuestion {
  const note = getNoteById(noteId);

  return {
    id: `previous-${note.id}`,
    questionIndex: 0,
    note,
    choices: createChoices(note),
  };
}
