import type { Clef } from "../domain/notes";

export const colorTokens = [
  {
    id: "rose",
    name: "Corail aurore",
    hex: "#FF8A70",
    cssVariable: "--color-rose",
  },
  {
    id: "lavender",
    name: "Bleu crépuscule",
    hex: "#708AC7",
    cssVariable: "--color-lavender",
  },
  {
    id: "vanilla",
    name: "Abricot doux",
    hex: "#F2B08F",
    cssVariable: "--color-vanilla",
  },
  {
    id: "mint",
    name: "Menthe signal",
    hex: "#66D1B5",
    cssVariable: "--color-mint",
  },
  {
    id: "sky",
    name: "Nuit claire",
    hex: "#171C35",
    cssVariable: "--color-sky",
  },
  {
    id: "plum",
    name: "Indigo profond",
    hex: "#0E1329",
    cssVariable: "--color-plum",
  },
  {
    id: "cream",
    name: "Ivoire lunaire",
    hex: "#F8EEE4",
    cssVariable: "--color-cream",
  },
] as const;

export type ColorTokenId = (typeof colorTokens)[number]["id"];

export const paletteTokens = [
  {
    id: "prune-2026",
    name: "Aurore corail",
  },
  {
    id: "cloud-teal",
    name: "Aurore turquoise",
  },
  {
    id: "jelly-mint",
    name: "Aurore menthe",
  },
  {
    id: "blue-piano",
    name: "Nuit cobalt",
  },
] as const;

export type PaletteId = (typeof paletteTokens)[number]["id"];

export const PALETTES = paletteTokens.map((palette) => palette.id) as PaletteId[];

export const PALETTE_LABELS: Record<PaletteId, string> = Object.fromEntries(
  paletteTokens.map((palette) => [palette.id, palette.name]),
) as Record<PaletteId, string>;

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && PALETTES.includes(value as PaletteId);
}

export const CLEF_PALETTES: Record<Clef, PaletteId> = {
  treble: "prune-2026",
  bass: "blue-piano",
  tenor: "cloud-teal",
};

export function getPaletteForClef(clef: Clef): PaletteId {
  return CLEF_PALETTES[clef];
}

export const spacingTokens = {
  none: "var(--space-0)",
  tiny: "var(--space-1)",
  small: "var(--space-2)",
  medium: "var(--space-4)",
  large: "var(--space-6)",
  page: "var(--space-page)",
} as const;

export const radiusTokens = {
  button: "var(--radius-button)",
  card: "var(--radius-card)",
  chip: "var(--radius-pill)",
  round: "var(--radius-circle)",
} as const;

export const shadowTokens = {
  soft: "var(--shadow-soft)",
  card: "var(--shadow-card)",
  button: "var(--shadow-button)",
} as const;
