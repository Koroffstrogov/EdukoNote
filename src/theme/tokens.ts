export const colorTokens = [
  {
    id: "rose",
    name: "Rose poudré",
    hex: "#F7A8C4",
    cssVariable: "--color-rose",
  },
  {
    id: "lavender",
    name: "Lavande",
    hex: "#C9B6FF",
    cssVariable: "--color-lavender",
  },
  {
    id: "vanilla",
    name: "Jaune vanille",
    hex: "#FFE58F",
    cssVariable: "--color-vanilla",
  },
  {
    id: "mint",
    name: "Menthe douce",
    hex: "#BDECCB",
    cssVariable: "--color-mint",
  },
  {
    id: "sky",
    name: "Bleu ciel",
    hex: "#A9D8FF",
    cssVariable: "--color-sky",
  },
  {
    id: "plum",
    name: "Prune",
    hex: "#6C4BAF",
    cssVariable: "--color-plum",
  },
  {
    id: "cream",
    name: "Crème",
    hex: "#FFF8F1",
    cssVariable: "--color-cream",
  },
] as const;

export type ColorTokenId = (typeof colorTokens)[number]["id"];

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
