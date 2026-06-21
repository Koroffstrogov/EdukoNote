import {
  ANSWER_LABELS,
  NOTE_DEFINITIONS,
  type AnswerLabel,
  type NoteDefinition,
  type NoteId,
} from "./notes";
import { countTotalCorrect, type ProgressState } from "./progress";

export type QuizMode = "training" | "challenge" | "review";

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

export function getUnlockedTrainingNotes(progress: ProgressState): NoteDefinition[] {
  const totalCorrect = countTotalCorrect(progress);
  const unlockedNotes = NOTE_DEFINITIONS.filter((note) => note.unlockAfterCorrect <= totalCorrect);

  return unlockedNotes.length > 0 ? unlockedNotes : NOTE_DEFINITIONS.filter((note) => note.unlockAfterCorrect === 0);
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
  const safePool = availableNotes.length > 0 ? availableNotes : NOTE_DEFINITIONS;
  const note = pickNextNote(safePool, previousQuestion?.note.id, recentHistory, random);
  const choices = createChoices(note, random);

  return {
    id: `${mode}-${questionIndex}-${note.id}`,
    questionIndex,
    note,
    choices,
  };
}

export function createChoices(correctNote: NoteDefinition, random: () => number = Math.random): AnswerLabel[] {
  const plausibleDistractors = NOTE_DEFINITIONS.filter((note) => note.answerLabel !== correctNote.answerLabel)
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
  const note = NOTE_DEFINITIONS.find((candidate) => candidate.id === noteId) ?? NOTE_DEFINITIONS[0];

  return {
    id: `previous-${note.id}`,
    questionIndex: 0,
    note,
    choices: createChoices(note),
  };
}
