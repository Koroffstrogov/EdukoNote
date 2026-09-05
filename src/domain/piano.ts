import {
  getNoteById,
  type AnswerLabel,
  type Clef,
  type NoteDefinition,
  type NoteId,
} from "./notes";

export type PianoKeyId =
  | "c"
  | "c-sharp"
  | "d"
  | "d-sharp"
  | "e"
  | "f"
  | "f-sharp"
  | "g"
  | "g-sharp"
  | "a"
  | "a-sharp"
  | "b";

export type PianoSpellingId =
  | "do"
  | "do-sharp"
  | "re-flat"
  | "re"
  | "re-sharp"
  | "mi-flat"
  | "mi"
  | "fa"
  | "fa-sharp"
  | "sol-flat"
  | "sol"
  | "sol-sharp"
  | "la-flat"
  | "la"
  | "la-sharp"
  | "si-flat"
  | "si";

export type PianoAccidental = "sharp" | "flat" | null;

export type FreePianoOctave = 4 | 5;

export type FreePianoKeyId = `${PianoKeyId}-${FreePianoOctave}`;

export type PianoKeyDefinition = {
  id: PianoKeyId;
  label: string;
  accessibleLabel: string;
  semitone: number;
  color: "white" | "black";
};

export type PianoSpellingDefinition = {
  id: PianoSpellingId;
  label: string;
  keyId: PianoKeyId;
  naturalLabel: AnswerLabel;
  accidental: PianoAccidental;
};

export type PianoNoteDefinition = PianoSpellingDefinition & {
  clef: Clef;
  baseNote: NoteDefinition;
};

export type PianoQuestion = {
  id: string;
  questionIndex: number;
  notation: PianoNoteDefinition;
};

export type FreePianoKeyDefinition = {
  id: FreePianoKeyId;
  pitchClassId: PianoKeyId;
  octave: FreePianoOctave;
  label: string;
  accessibleLabel: string;
  color: PianoKeyDefinition["color"];
  midi: number;
  frequency: number;
  shortcut: string;
  keyboardCode: string;
  blackKeyBoundary: number | null;
};

export const PIANO_KEY_IDS: PianoKeyId[] = [
  "c",
  "c-sharp",
  "d",
  "d-sharp",
  "e",
  "f",
  "f-sharp",
  "g",
  "g-sharp",
  "a",
  "a-sharp",
  "b",
];

export const PIANO_KEYS: PianoKeyDefinition[] = [
  createKey("c", "Do", "Do", 0, "white"),
  createKey("c-sharp", "Do♯ / Ré♭", "Do dièse ou Ré bémol", 1, "black"),
  createKey("d", "Ré", "Ré", 2, "white"),
  createKey("d-sharp", "Ré♯ / Mi♭", "Ré dièse ou Mi bémol", 3, "black"),
  createKey("e", "Mi", "Mi", 4, "white"),
  createKey("f", "Fa", "Fa", 5, "white"),
  createKey("f-sharp", "Fa♯ / Sol♭", "Fa dièse ou Sol bémol", 6, "black"),
  createKey("g", "Sol", "Sol", 7, "white"),
  createKey("g-sharp", "Sol♯ / La♭", "Sol dièse ou La bémol", 8, "black"),
  createKey("a", "La", "La", 9, "white"),
  createKey("a-sharp", "La♯ / Si♭", "La dièse ou Si bémol", 10, "black"),
  createKey("b", "Si", "Si", 11, "white"),
];

const FREE_PIANO_SHORTCUTS = [
  { shortcut: "A", keyboardCode: "KeyQ" },
  { shortcut: "Z", keyboardCode: "KeyW" },
  { shortcut: "E", keyboardCode: "KeyE" },
  { shortcut: "R", keyboardCode: "KeyR" },
  { shortcut: "T", keyboardCode: "KeyT" },
  { shortcut: "Y", keyboardCode: "KeyY" },
  { shortcut: "U", keyboardCode: "KeyU" },
  { shortcut: "I", keyboardCode: "KeyI" },
  { shortcut: "O", keyboardCode: "KeyO" },
  { shortcut: "P", keyboardCode: "KeyP" },
  { shortcut: "^", keyboardCode: "BracketLeft" },
  { shortcut: "$", keyboardCode: "BracketRight" },
  { shortcut: "Q", keyboardCode: "KeyA" },
  { shortcut: "S", keyboardCode: "KeyS" },
  { shortcut: "D", keyboardCode: "KeyD" },
  { shortcut: "F", keyboardCode: "KeyF" },
  { shortcut: "G", keyboardCode: "KeyG" },
  { shortcut: "H", keyboardCode: "KeyH" },
  { shortcut: "J", keyboardCode: "KeyJ" },
  { shortcut: "K", keyboardCode: "KeyK" },
  { shortcut: "L", keyboardCode: "KeyL" },
  { shortcut: "M", keyboardCode: "Semicolon" },
  { shortcut: "Ù", keyboardCode: "Quote" },
  { shortcut: "*", keyboardCode: "Backslash" },
] as const;

const BLACK_KEY_BOUNDARIES = new Map<number, number>([
  [1, 1],
  [3, 2],
  [6, 4],
  [8, 5],
  [10, 6],
]);

export const FREE_PIANO_KEYS: FreePianoKeyDefinition[] = ([4, 5] as const).flatMap(
  (octave, octaveIndex) => PIANO_KEYS.map((key) => {
    const keyIndex = octaveIndex * PIANO_KEYS.length + key.semitone;
    const shortcut = FREE_PIANO_SHORTCUTS[keyIndex];
    const midi = 60 + keyIndex;
    const localBoundary = BLACK_KEY_BOUNDARIES.get(key.semitone);
    const label = addOctaveToPianoLabel(key.label, octave);

    return {
      id: `${key.id}-${octave}` as FreePianoKeyId,
      pitchClassId: key.id,
      octave,
      label,
      accessibleLabel: `${addOctaveToPianoLabel(key.accessibleLabel, octave)}, raccourci ${shortcut.shortcut}`,
      color: key.color,
      midi,
      frequency: getPianoFrequencyFromMidi(midi),
      shortcut: shortcut.shortcut,
      keyboardCode: shortcut.keyboardCode,
      blackKeyBoundary: localBoundary === undefined ? null : octaveIndex * 7 + localBoundary,
    };
  }),
);

export const PIANO_SPELLINGS: PianoSpellingDefinition[] = [
  createSpelling("do", "Do", "c", "Do", null),
  createSpelling("do-sharp", "Do♯", "c-sharp", "Do", "sharp"),
  createSpelling("re-flat", "Ré♭", "c-sharp", "Ré", "flat"),
  createSpelling("re", "Ré", "d", "Ré", null),
  createSpelling("re-sharp", "Ré♯", "d-sharp", "Ré", "sharp"),
  createSpelling("mi-flat", "Mi♭", "d-sharp", "Mi", "flat"),
  createSpelling("mi", "Mi", "e", "Mi", null),
  createSpelling("fa", "Fa", "f", "Fa", null),
  createSpelling("fa-sharp", "Fa♯", "f-sharp", "Fa", "sharp"),
  createSpelling("sol-flat", "Sol♭", "f-sharp", "Sol", "flat"),
  createSpelling("sol", "Sol", "g", "Sol", null),
  createSpelling("sol-sharp", "Sol♯", "g-sharp", "Sol", "sharp"),
  createSpelling("la-flat", "La♭", "g-sharp", "La", "flat"),
  createSpelling("la", "La", "a", "La", null),
  createSpelling("la-sharp", "La♯", "a-sharp", "La", "sharp"),
  createSpelling("si-flat", "Si♭", "a-sharp", "Si", "flat"),
  createSpelling("si", "Si", "b", "Si", null),
];

const PIANO_BASE_NOTES_BY_CLEF: Record<Clef, Record<AnswerLabel, NoteId>> = {
  treble: {
    Do: "do4",
    Ré: "re4",
    Mi: "mi4",
    Fa: "fa4",
    Sol: "sol4",
    La: "la4",
    Si: "si4",
  },
  bass: {
    Do: "bass-do3",
    Ré: "bass-re3",
    Mi: "bass-mi3",
    Fa: "bass-fa3",
    Sol: "bass-sol3",
    La: "bass-la3",
    Si: "bass-si3",
  },
  tenor: {
    Do: "tenor-do4",
    Ré: "tenor-re4",
    Mi: "tenor-mi4",
    Fa: "tenor-fa4",
    Sol: "tenor-sol4",
    La: "tenor-la4",
    Si: "tenor-si4",
  },
};

const PIANO_C_MIDI_BY_CLEF: Record<Clef, number> = {
  treble: 60,
  bass: 48,
  tenor: 60,
};

export function getPianoCatalog(clef: Clef): PianoNoteDefinition[] {
  return PIANO_SPELLINGS.map((spelling) => ({
    ...spelling,
    clef,
    baseNote: getNoteById(PIANO_BASE_NOTES_BY_CLEF[clef][spelling.naturalLabel]),
  }));
}

export function getPianoKey(keyId: PianoKeyId): PianoKeyDefinition {
  const key = PIANO_KEYS.find((candidate) => candidate.id === keyId);

  if (!key) {
    throw new Error(`Unknown piano key: ${keyId}`);
  }

  return key;
}

export function getPianoSpelling(spellingId: PianoSpellingId): PianoSpellingDefinition {
  const spelling = PIANO_SPELLINGS.find((candidate) => candidate.id === spellingId);

  if (!spelling) {
    throw new Error(`Unknown piano spelling: ${spellingId}`);
  }

  return spelling;
}

export function isPianoKeyId(value: unknown): value is PianoKeyId {
  return typeof value === "string" && PIANO_KEY_IDS.includes(value as PianoKeyId);
}

export function isPianoSpellingId(value: unknown): value is PianoSpellingId {
  return typeof value === "string" && PIANO_SPELLINGS.some((spelling) => spelling.id === value);
}

export function getPianoKeyMidi(clef: Clef, keyId: PianoKeyId): number {
  return PIANO_C_MIDI_BY_CLEF[clef] + getPianoKey(keyId).semitone;
}

export function getPianoKeyFrequency(clef: Clef, keyId: PianoKeyId): number {
  const midi = getPianoKeyMidi(clef, keyId);

  return getPianoFrequencyFromMidi(midi);
}

export function getPianoFrequencyFromMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function getFreePianoKey(keyId: FreePianoKeyId): FreePianoKeyDefinition {
  const key = FREE_PIANO_KEYS.find((candidate) => candidate.id === keyId);

  if (!key) {
    throw new Error(`Unknown free piano key: ${keyId}`);
  }

  return key;
}

export function getFreePianoKeyByKeyboardCode(code: string): FreePianoKeyDefinition | null {
  return FREE_PIANO_KEYS.find((candidate) => candidate.keyboardCode === code) ?? null;
}

export function generateNextPianoQuestion(
  previousQuestion: PianoQuestion | null,
  recentHistory: PianoSpellingId[],
  clef: Clef,
  random: () => number = Math.random,
  questionIndex = 1,
): PianoQuestion {
  const catalog = getPianoCatalog(clef);
  const recentSet = new Set(recentHistory.slice(-3));
  const withoutRecent = catalog.filter(
    (notation) => notation.id !== previousQuestion?.notation.id && !recentSet.has(notation.id),
  );
  const withoutPrevious = catalog.filter((notation) => notation.id !== previousQuestion?.notation.id);
  const candidates = withoutRecent.length > 0 ? withoutRecent : withoutPrevious.length > 0 ? withoutPrevious : catalog;
  const candidateIndex = Math.min(Math.floor(random() * candidates.length), candidates.length - 1);
  const notation = candidates[candidateIndex];

  return {
    id: `piano-${clef}-${questionIndex}-${notation.id}`,
    questionIndex,
    notation,
  };
}

function createKey(
  id: PianoKeyId,
  label: string,
  accessibleLabel: string,
  semitone: number,
  color: PianoKeyDefinition["color"],
): PianoKeyDefinition {
  return { id, label, accessibleLabel, semitone, color };
}

function createSpelling(
  id: PianoSpellingId,
  label: string,
  keyId: PianoKeyId,
  naturalLabel: AnswerLabel,
  accidental: PianoAccidental,
): PianoSpellingDefinition {
  return { id, label, keyId, naturalLabel, accidental };
}

function addOctaveToPianoLabel(label: string, octave: FreePianoOctave): string {
  return label
    .split(/ (\/|ou) /u)
    .map((part) => part === "/" || part === "ou" ? part : `${part}${octave}`)
    .join(" ");
}
