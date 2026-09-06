// Musical time, independent of tempo: a quarter note is 24 ticks.
// Eighths, sixteenths and eighth-note triplets therefore remain exact integers.
export const QUARTER_TICKS = 24;
export const RHYTHM_FIGURES = {
  N: { label: "noire", ticks: 24 },
  B: { label: "blanche", ticks: 48 },
  R: { label: "ronde", ticks: 96 },
  C: { label: "croche", ticks: 12 },
  D: { label: "double croche", ticks: 6 },
  NP: { label: "noire pointée", ticks: 36 },
  T: { label: "croche de triolet", ticks: 8 },
  S: { label: "soupir", ticks: 24, rest: true },
  DS: { label: "demi-pause", ticks: 48, rest: true },
} as const;

export type RhythmFigure = keyof typeof RHYTHM_FIGURES;
export type RhythmEvent = { figure: RhythmFigure; tieToNext?: boolean };
export type RhythmNotion = "long-values" | "eighths" | "rests" | "dots-ties" | "subdivisions";
export const RHYTHM_NOTIONS: Record<RhythmNotion, string> = {
  "long-values": "Pulsation et valeurs longues",
  eighths: "Deux croches dans un temps",
  rests: "Garder la pulsation dans les silences",
  "dots-ties": "Rythmes pointés et liaisons",
  subdivisions: "Doubles croches et triolets",
};
export type RhythmPattern = {
  id: string;
  title: string;
  notion: RhythmNotion;
  beatsPerBar: 2 | 3 | 4;
  beatUnit: "quarter";
  objective: string;
  extension: boolean;
  bars: RhythmEvent[][];
};

function pattern(id: string, title: string, notion: RhythmNotion, beatsPerBar: 2 | 3 | 4, notation: string, objective: string): RhythmPattern {
  return {
    id, title, notion, beatsPerBar, beatUnit: "quarter", objective,
    extension: notion === "dots-ties" || notion === "subdivisions",
    bars: notation.split("|").map((bar) => bar.trim().split(/\s+/).map((token) => ({
      figure: token.replace("~", "") as RhythmFigure,
      ...(token.endsWith("~") ? { tieToNext: true } : {}),
    }))),
  };
}

// Composed for EdukoNote; these conventional cells are proposals for the teacher,
// not an assertion that every 1C2 course covers the same material.
export const RHYTHM_PATTERNS: RhythmPattern[] = [
  pattern("R01", "Deux pas", "long-values", 2, "N N | N N", "Frapper une fois sur chaque pulsation."),
  pattern("R02", "Un son qui traverse", "long-values", 3, "B N | N B", "Sentir les trois temps pendant les blanches."),
  pattern("R03", "Deux pas, un souffle", "long-values", 4, "N N B | B N N", "Alterner départs de notes et pulsation intérieure."),
  pattern("R04", "Le fil long", "long-values", 4, "R | B B", "Compter quatre pulsations sous une ronde, puis sous deux blanches."),
  pattern("R05", "Petits pas", "eighths", 2, "C C N | N C C", "Partager un temps en deux parts égales."),
  pattern("R06", "Le milieu bouge", "eighths", 3, "N C C N | C C N C C", "Garder trois pulsations malgré les croches."),
  pattern("R07", "Les fenêtres", "eighths", 4, "C C N C C N | B C C N", "Passer de deux croches à une valeur longue."),
  pattern("R08", "Le petit chemin", "eighths", 4, "N C C C C N | C C C C B", "Enchaîner deux temps de croches sans accélérer."),
  pattern("R09", "Un pas silencieux", "rests", 2, "N S | S N", "Continuer à compter pendant un soupir."),
  pattern("R10", "Le retour", "rests", 3, "N S N | DS N", "Repartir après un puis deux temps de silence."),
  pattern("R11", "Petits pas et pause", "rests", 4, "C C S N N | N C C S N", "Respecter le silence après deux croches."),
  pattern("R12", "Le souffle caché", "rests", 4, "B S N | N S B", "Distinguer un son prolongé d’un silence."),
  pattern("R13", "Long, puis court", "dots-ties", 2, "NP C | N N", "Placer la croche après une noire pointée."),
  pattern("R14", "Le pas décalé", "dots-ties", 3, "NP C N | N NP C", "Déplacer la cellule pointée sans déplacer la pulsation."),
  pattern("R15", "Le pont dans le temps", "dots-ties", 4, "N C C~ N N | N N B", "Prolonger la croche liée sans réattaquer au troisième temps."),
  pattern("R16", "Le pont de mesure", "dots-ties", 4, "B N N~ | N N B", "Franchir la barre de mesure avec un son lié."),
  pattern("R17", "Quatre petits pas", "subdivisions", 2, "D D D D N | N D D D D", "Partager un temps en quatre parts égales."),
  pattern("R18", "Deux tailles de pas", "subdivisions", 4, "C D D N C D D N | N C D D B", "Enchaîner croche et deux doubles croches sur un temps."),
  pattern("R19", "Trois dans un pas", "subdivisions", 2, "T T T N | N T T T", "Entendre trois croches de triolet dans un temps à la noire."),
  pattern("R20", "Le balancement", "subdivisions", 3, "N T T T N | T T T B", "Garder trois temps en alternant triolet et valeurs longues."),
];

export function describeRhythmPattern(pattern: RhythmPattern): string {
  return pattern.bars.map((bar) => bar.map((event) =>
    `${RHYTHM_FIGURES[event.figure].label}${event.tieToNext ? " liée à la suivante" : ""}`,
  ).join(" · ")).join(" | ");
}
