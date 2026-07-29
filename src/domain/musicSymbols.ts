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
  shortExplanation: string;
  visualDescription: string;
};

export const MUSIC_SYMBOL_DEFINITIONS: MusicSymbolDefinition[] = [
  createMusicSymbol("staff", "Portée", "score-reading", 1, 0, "score-reading", "Ses cinq lignes servent de repère pour écrire la musique.", "Cinq lignes horizontales parallèles."),
  createMusicSymbol("treble-clef", "Clé de sol", "score-reading", 1, 0, "clefs", "Elle place le sol sur la deuxième ligne de la portée.", "Un signe en spirale verticale qui s’enroule autour d’une ligne de la portée."),
  createMusicSymbol("bass-clef", "Clé de fa", "score-reading", 1, 0, "clefs", "Elle place le fa entre ses deux points, sur la quatrième ligne.", "Un signe courbe suivi de deux points placés de part et d’autre d’une ligne."),
  createMusicSymbol("c-clef", "Clé d’ut", "score-reading", 2, 2, "clefs", "Son centre indique la ligne sur laquelle se trouve le do.", "Un signe vertical symétrique dont le centre encadre une ligne de la portée."),
  createMusicSymbol("bar-line", "Barre de mesure", "score-reading", 1, 0, "bar-lines", "Cette ligne verticale sépare deux mesures.", "Une seule ligne verticale traversant la portée."),
  createMusicSymbol("double-bar-line", "Double barre", "score-reading", 2, 2, "bar-lines", "Elle marque une séparation importante ou la fin d’une section.", "Deux lignes verticales parallèles traversant la portée."),
  createMusicSymbol("whole-note", "Ronde", "durations", 2, 4, "notes", "Dans une mesure à quatre temps, elle dure quatre temps.", "Une tête de note ovale vide, sans hampe."),
  createMusicSymbol("half-note", "Blanche", "durations", 2, 2, "notes", "Dans une mesure à quatre temps, elle dure deux temps.", "Une tête de note ovale vide accompagnée d’une hampe."),
  createMusicSymbol("quarter-note", "Noire", "durations", 1, 0, "notes", "Dans une mesure à quatre temps, elle dure un temps.", "Une tête de note ovale pleine accompagnée d’une hampe."),
  createMusicSymbol("eighth-note", "Croche", "durations", 1, 0, "notes", "Dans une mesure à quatre temps, elle dure un demi-temps.", "Une tête de note ovale pleine avec une hampe terminée par un crochet."),
  createMusicSymbol("beamed-eighth-notes", "Deux croches", "durations", 2, 4, "notes", "Deux croches reliées remplissent ensemble un temps.", "Deux têtes de notes pleines reliées par une barre."),
  createMusicSymbol("augmentation-dot", "Point de prolongation", "durations", 3, 4, "notes", "Il ajoute à la note la moitié de sa durée.", "Une note suivie d’un petit point."),
  createMusicSymbol("quarter-rest", "Soupir", "rests", 3, 6, "notes", "Dans une mesure à quatre temps, il représente un temps de silence.", "Un tracé vertical en zigzag terminé par une courbe."),
  createMusicSymbol("sharp", "Dièse", "accidentals", 4, 9, "accidentals", "Il élève la note d’un demi-ton.", "Deux lignes verticales croisées par deux lignes obliques."),
  createMusicSymbol("flat", "Bémol", "accidentals", 4, 9, "accidentals", "Il abaisse la note d’un demi-ton.", "Une ligne verticale prolongée par une boucle arrondie vers la droite."),
  createMusicSymbol("natural", "Bécarre", "accidentals", 4, 9, "accidentals", "Il annule un dièse ou un bémol précédent.", "Deux lignes verticales décalées reliées par deux traits obliques."),
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
  shortExplanation: string,
  visualDescription: string,
): MusicSymbolDefinition {
  return {
    id,
    label,
    family,
    difficulty,
    unlockAfterCorrect,
    renderType: "svg",
    distractorGroup,
    shortExplanation,
    visualDescription,
  };
}
