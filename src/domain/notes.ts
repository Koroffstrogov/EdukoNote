export type AnswerLabel = "Do" | "Ré" | "Mi" | "Fa" | "Sol" | "La" | "Si";

export type NoteId =
  | "do4"
  | "re4"
  | "mi4"
  | "fa4"
  | "sol4"
  | "la4"
  | "si4"
  | "do5"
  | "re5"
  | "mi5"
  | "fa5"
  | "sol5"
  | "la5"
  | "si5"
  | "do6";

export type NoteDefinition = {
  id: NoteId;
  label: AnswerLabel;
  answerLabel: AnswerLabel;
  stepIndex: number;
  svgY: number;
  difficulty: 1 | 2 | 3 | 4;
  unlockAfterCorrect: number;
  ledgerLines: number[];
};

export const ANSWER_LABELS: AnswerLabel[] = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"];

export const STAFF_VIEWBOX = {
  width: 320,
  height: 180,
} as const;

export const STAFF_LINE_Y = [52, 68, 84, 100, 116] as const;

const bottomLineY = 116;
const staffStepHeight = 8;

export const NOTE_DEFINITIONS: NoteDefinition[] = [
  createNote("do4", "Do", -2, 3, 4, [132]),
  createNote("re4", "Ré", -1, 3, 4),
  createNote("mi4", "Mi", 0, 1, 0),
  createNote("fa4", "Fa", 1, 2, 2),
  createNote("sol4", "Sol", 2, 1, 0),
  createNote("la4", "La", 3, 2, 2),
  createNote("si4", "Si", 4, 1, 0),
  createNote("do5", "Do", 5, 1, 0),
  createNote("re5", "Ré", 6, 1, 0),
  createNote("mi5", "Mi", 7, 2, 5),
  createNote("fa5", "Fa", 8, 2, 5),
  createNote("sol5", "Sol", 9, 3, 7),
  createNote("la5", "La", 10, 3, 9, [36]),
  createNote("si5", "Si", 11, 4, 11, [36]),
  createNote("do6", "Do", 12, 4, 13, [36, 20]),
];

export const INITIAL_TRAINING_NOTE_IDS: NoteId[] = ["mi4", "sol4", "si4", "do5", "re5"];

export function getNoteById(noteId: NoteId): NoteDefinition {
  const note = NOTE_DEFINITIONS.find((candidate) => candidate.id === noteId);

  if (!note) {
    throw new Error(`Unknown note id: ${noteId}`);
  }

  return note;
}

export function isNoteId(value: string): value is NoteId {
  return NOTE_DEFINITIONS.some((note) => note.id === value);
}

function createNote(
  id: NoteId,
  answerLabel: AnswerLabel,
  stepIndex: number,
  difficulty: 1 | 2 | 3 | 4,
  unlockAfterCorrect: number,
  ledgerLines: number[] = [],
): NoteDefinition {
  return {
    id,
    label: answerLabel,
    answerLabel,
    stepIndex,
    svgY: bottomLineY - stepIndex * staffStepHeight,
    difficulty,
    unlockAfterCorrect,
    ledgerLines,
  };
}
