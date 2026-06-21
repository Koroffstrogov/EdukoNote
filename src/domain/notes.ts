export type NoteId = "do" | "re" | "mi" | "fa" | "sol" | "la" | "si" | "do-high";

export type NoteDefinition = {
  id: NoteId;
  label: string;
  svgY: number;
  difficulty: 1 | 2 | 3 | 4;
  unlockAfterCorrect: number;
  ledgerLines: number[];
};

export const STAFF_VIEWBOX = {
  width: 320,
  height: 180,
} as const;

export const STAFF_LINE_Y = [52, 68, 84, 100, 116] as const;

export const NOTE_DEFINITIONS: NoteDefinition[] = [
  {
    id: "do",
    label: "Do",
    svgY: 132,
    difficulty: 3,
    unlockAfterCorrect: 8,
    ledgerLines: [132],
  },
  {
    id: "re",
    label: "Ré",
    svgY: 124,
    difficulty: 3,
    unlockAfterCorrect: 11,
    ledgerLines: [],
  },
  {
    id: "mi",
    label: "Mi",
    svgY: 116,
    difficulty: 1,
    unlockAfterCorrect: 0,
    ledgerLines: [],
  },
  {
    id: "fa",
    label: "Fa",
    svgY: 108,
    difficulty: 2,
    unlockAfterCorrect: 3,
    ledgerLines: [],
  },
  {
    id: "sol",
    label: "Sol",
    svgY: 100,
    difficulty: 1,
    unlockAfterCorrect: 0,
    ledgerLines: [],
  },
  {
    id: "la",
    label: "La",
    svgY: 92,
    difficulty: 2,
    unlockAfterCorrect: 5,
    ledgerLines: [],
  },
  {
    id: "si",
    label: "Si",
    svgY: 84,
    difficulty: 1,
    unlockAfterCorrect: 0,
    ledgerLines: [],
  },
  {
    id: "do-high",
    label: "Do aigu",
    svgY: 76,
    difficulty: 4,
    unlockAfterCorrect: 14,
    ledgerLines: [],
  },
];

export const INITIAL_TRAINING_NOTE_IDS: NoteId[] = ["mi", "sol", "si"];

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
