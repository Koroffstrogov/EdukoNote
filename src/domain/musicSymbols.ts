export type MusicSymbolFamily = "score-reading" | "durations" | "rests" | "accidentals";

export type MusicSymbolDistractorGroup = MusicSymbolFamily | "clefs" | "bar-lines" | "notes";

export type MusicSymbolId =
  | "staff"
  | "treble-clef"
  | "bass-clef"
  | "c-clef"
  | "bar-line"
  | "double-bar-line"
  | "whole-note"
  | "half-note"
  | "quarter-note"
  | "eighth-note"
  | "beamed-eighth-notes"
  | "augmentation-dot"
  | "quarter-rest"
  | "sharp"
  | "flat"
  | "natural";

export type MusicSymbolDefinition = {
  id: MusicSymbolId;
  label: string;
  family: MusicSymbolFamily;
  difficulty: 1 | 2 | 3 | 4;
  unlockAfterCorrect: number;
  renderType: "svg";
  distractorGroup: MusicSymbolDistractorGroup;
  shortExplanation?: string;
};

export const MUSIC_SYMBOL_DEFINITIONS: MusicSymbolDefinition[] = [
  createMusicSymbol("staff", "Portée", "score-reading", 1, 0, "score-reading"),
  createMusicSymbol("treble-clef", "Clé de sol", "score-reading", 1, 0, "clefs"),
  createMusicSymbol("bass-clef", "Clé de fa", "score-reading", 1, 0, "clefs"),
  createMusicSymbol("c-clef", "Clé d’ut", "score-reading", 2, 2, "clefs"),
  createMusicSymbol("bar-line", "Barre de mesure", "score-reading", 1, 0, "bar-lines"),
  createMusicSymbol("double-bar-line", "Double barre", "score-reading", 2, 2, "bar-lines"),
  createMusicSymbol("whole-note", "Ronde", "durations", 2, 4, "notes"),
  createMusicSymbol("half-note", "Blanche", "durations", 2, 2, "notes"),
  createMusicSymbol("quarter-note", "Noire", "durations", 1, 0, "notes"),
  createMusicSymbol("eighth-note", "Croche", "durations", 1, 0, "notes"),
  createMusicSymbol("beamed-eighth-notes", "Deux croches", "durations", 2, 4, "notes"),
  createMusicSymbol("augmentation-dot", "Point de prolongation", "durations", 3, 4, "durations"),
  createMusicSymbol("quarter-rest", "Soupir", "rests", 3, 6, "rests"),
  createMusicSymbol("sharp", "Dièse", "accidentals", 4, 9, "accidentals"),
  createMusicSymbol("flat", "Bémol", "accidentals", 4, 9, "accidentals"),
  createMusicSymbol("natural", "Bécarre", "accidentals", 4, 9, "accidentals"),
];

export const INITIAL_SYMBOL_IDS: MusicSymbolId[] = [
  "staff",
  "treble-clef",
  "bass-clef",
  "bar-line",
  "quarter-note",
  "eighth-note",
];

export function getSymbolById(symbolId: MusicSymbolId): MusicSymbolDefinition {
  const symbol = MUSIC_SYMBOL_DEFINITIONS.find((candidate) => candidate.id === symbolId);

  if (!symbol) {
    throw new Error(`Unknown music symbol id: ${symbolId}`);
  }

  return symbol;
}

export function isMusicSymbolId(value: unknown): value is MusicSymbolId {
  return typeof value === "string" && MUSIC_SYMBOL_DEFINITIONS.some((symbol) => symbol.id === value);
}

function createMusicSymbol(
  id: MusicSymbolId,
  label: string,
  family: MusicSymbolFamily,
  difficulty: 1 | 2 | 3 | 4,
  unlockAfterCorrect: number,
  distractorGroup: MusicSymbolDistractorGroup,
): MusicSymbolDefinition {
  return {
    id,
    label,
    family,
    difficulty,
    unlockAfterCorrect,
    renderType: "svg",
    distractorGroup,
  };
}
