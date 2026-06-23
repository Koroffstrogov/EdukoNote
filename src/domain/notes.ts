export type Clef = "treble" | "bass";

export type AnswerLabel = "Do" | "Ré" | "Mi" | "Fa" | "Sol" | "La" | "Si";

export type PracticeRange = "lower" | "upper";

export type ReadingZone = PracticeRange | "full";

export type TrebleNoteId =
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

export type BassNoteId =
  | "bass-do2"
  | "bass-re2"
  | "bass-mi2"
  | "bass-fa2"
  | "bass-sol2"
  | "bass-la2"
  | "bass-si2"
  | "bass-do3"
  | "bass-re3"
  | "bass-mi3"
  | "bass-fa3"
  | "bass-sol3"
  | "bass-la3"
  | "bass-si3"
  | "bass-do4";

export type NoteId = TrebleNoteId | BassNoteId;

export type NoteDefinition = {
  id: NoteId;
  clef: Clef;
  label: AnswerLabel;
  answerLabel: AnswerLabel;
  stepIndex: number;
  svgY: number;
  difficulty: 1 | 2 | 3 | 4;
  unlockAfterCorrect: number;
  ledgerLines: number[];
  practiceRange: PracticeRange;
};

export const ANSWER_LABELS: AnswerLabel[] = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"];

export const CLEFS: Clef[] = ["treble", "bass"];

export const CLEF_LABELS: Record<Clef, string> = {
  treble: "Clé de Sol",
  bass: "Clé de Fa",
};

export const READING_ZONES: ReadingZone[] = ["lower", "upper", "full"];

export const READING_ZONE_LABELS: Record<ReadingZone, string> = {
  lower: "Bas",
  upper: "Haut",
  full: "Tout",
};

export const STAFF_VIEWBOX = {
  width: 320,
  height: 180,
} as const;

export const STAFF_LINE_Y = [52, 68, 84, 100, 116] as const;

const bottomLineY = 116;
const staffStepHeight = 8;

export const TREBLE_NOTE_DEFINITIONS: NoteDefinition[] = [
  createNote("do4", "treble", "Do", -2, 3, 4, "lower", [132]),
  createNote("re4", "treble", "Ré", -1, 3, 4, "lower"),
  createNote("mi4", "treble", "Mi", 0, 1, 0, "lower"),
  createNote("fa4", "treble", "Fa", 1, 2, 2, "lower"),
  createNote("sol4", "treble", "Sol", 2, 1, 0, "lower"),
  createNote("la4", "treble", "La", 3, 2, 2, "lower"),
  createNote("si4", "treble", "Si", 4, 1, 0, "lower"),
  createNote("do5", "treble", "Do", 5, 1, 0, "upper"),
  createNote("re5", "treble", "Ré", 6, 1, 0, "upper"),
  createNote("mi5", "treble", "Mi", 7, 2, 5, "upper"),
  createNote("fa5", "treble", "Fa", 8, 2, 5, "upper"),
  createNote("sol5", "treble", "Sol", 9, 3, 7, "upper"),
  createNote("la5", "treble", "La", 10, 3, 9, "upper", [36]),
  createNote("si5", "treble", "Si", 11, 4, 11, "upper", [36]),
  createNote("do6", "treble", "Do", 12, 4, 13, "upper", [36, 20]),
];

export const BASS_NOTE_DEFINITIONS: NoteDefinition[] = [
  createNote("bass-do2", "bass", "Do", -4, 4, 13, "lower", [132, 148]),
  createNote("bass-re2", "bass", "Ré", -3, 4, 11, "lower", [132]),
  createNote("bass-mi2", "bass", "Mi", -2, 3, 9, "lower", [132]),
  createNote("bass-fa2", "bass", "Fa", -1, 3, 7, "lower"),
  createNote("bass-sol2", "bass", "Sol", 0, 1, 0, "lower"),
  createNote("bass-la2", "bass", "La", 1, 2, 2, "lower"),
  createNote("bass-si2", "bass", "Si", 2, 1, 0, "lower"),
  createNote("bass-do3", "bass", "Do", 3, 2, 2, "upper"),
  createNote("bass-re3", "bass", "Ré", 4, 1, 0, "upper"),
  createNote("bass-mi3", "bass", "Mi", 5, 2, 5, "upper"),
  createNote("bass-fa3", "bass", "Fa", 6, 1, 0, "upper"),
  createNote("bass-sol3", "bass", "Sol", 7, 2, 5, "upper"),
  createNote("bass-la3", "bass", "La", 8, 1, 0, "upper"),
  createNote("bass-si3", "bass", "Si", 9, 3, 9, "upper"),
  createNote("bass-do4", "bass", "Do", 10, 4, 13, "upper", [36]),
];

export const NOTE_DEFINITIONS_BY_CLEF: Record<Clef, NoteDefinition[]> = {
  treble: TREBLE_NOTE_DEFINITIONS,
  bass: BASS_NOTE_DEFINITIONS,
};

export const NOTE_DEFINITIONS: NoteDefinition[] = [
  ...NOTE_DEFINITIONS_BY_CLEF.treble,
  ...NOTE_DEFINITIONS_BY_CLEF.bass,
];

export const INITIAL_TRAINING_NOTE_IDS_BY_CLEF: Record<Clef, NoteId[]> = {
  treble: ["mi4", "sol4", "si4", "do5", "re5"],
  bass: ["bass-sol2", "bass-si2", "bass-re3", "bass-fa3", "bass-la3"],
};

export const INITIAL_TRAINING_NOTE_IDS: NoteId[] = INITIAL_TRAINING_NOTE_IDS_BY_CLEF.treble;

export function getNotesForClef(clef: Clef): NoteDefinition[] {
  return NOTE_DEFINITIONS_BY_CLEF[clef];
}

export function getNotesForClefAndReadingZone(clef: Clef, readingZone: ReadingZone): NoteDefinition[] {
  const notes = getNotesForClef(clef);

  if (readingZone === "full") {
    return notes;
  }

  return notes.filter((note) => note.practiceRange === readingZone);
}

export function getInitialTrainingNoteIds(clef: Clef): NoteId[] {
  return INITIAL_TRAINING_NOTE_IDS_BY_CLEF[clef];
}

export function getOtherClef(clef: Clef): Clef {
  return clef === "treble" ? "bass" : "treble";
}

export function getNoteById(noteId: NoteId): NoteDefinition {
  const note = NOTE_DEFINITIONS.find((candidate) => candidate.id === noteId);

  if (!note) {
    throw new Error(`Unknown note id: ${noteId}`);
  }

  return note;
}

export function isNoteId(value: unknown): value is NoteId {
  if (typeof value !== "string") {
    return false;
  }

  return NOTE_DEFINITIONS.some((note) => note.id === value);
}

export function isClef(value: unknown): value is Clef {
  return value === "treble" || value === "bass";
}

export function isReadingZone(value: unknown): value is ReadingZone {
  return value === "lower" || value === "upper" || value === "full";
}

function createNote(
  id: NoteId,
  clef: Clef,
  answerLabel: AnswerLabel,
  stepIndex: number,
  difficulty: 1 | 2 | 3 | 4,
  unlockAfterCorrect: number,
  practiceRange: PracticeRange,
  ledgerLines: number[] = [],
): NoteDefinition {
  return {
    id,
    clef,
    label: answerLabel,
    answerLabel,
    stepIndex,
    svgY: bottomLineY - stepIndex * staffStepHeight,
    difficulty,
    unlockAfterCorrect,
    ledgerLines,
    practiceRange,
  };
}
