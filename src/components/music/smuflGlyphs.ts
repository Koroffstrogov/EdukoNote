export const SMUFL_UNITS_PER_EM = 1000;
export const SMUFL_STAFF_SPACES_PER_EM = 4;

type SmuflGlyphDefinition = {
  character: string;
  advanceWidth: number;
  bounds: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
};

/**
 * Curated metrics from Bravura 1.392, the SMuFL reference font.
 *
 * Only these glyphs are bundled in public/fonts/eduko-music-symbols.woff.
 * The subset is renamed and distributed under the SIL Open Font License 1.1.
 */
export const SMUFL_GLYPHS = {
  gClef: {
    character: "\uE050",
    advanceWidth: 671,
    bounds: { xMin: 0, yMin: -658, xMax: 671, yMax: 1098 },
  },
  cClef: {
    character: "\uE05C",
    advanceWidth: 699,
    bounds: { xMin: 0, yMin: -506, xMax: 699, yMax: 506 },
  },
  fClef: {
    character: "\uE062",
    advanceWidth: 684,
    bounds: { xMin: -5, yMin: -635, xMax: 684, yMax: 262 },
  },
  noteheadWhole: {
    character: "\uE0A2",
    advanceWidth: 422,
    bounds: { xMin: 0, yMin: -125, xMax: 422, yMax: 125 },
  },
  noteheadHalf: {
    character: "\uE0A3",
    advanceWidth: 295,
    bounds: { xMin: 0, yMin: -125, xMax: 295, yMax: 125 },
  },
  noteheadBlack: {
    character: "\uE0A4",
    advanceWidth: 295,
    bounds: { xMin: 0, yMin: -125, xMax: 295, yMax: 125 },
  },
  augmentationDot: {
    character: "\uE1E7",
    advanceWidth: 100,
    bounds: { xMin: 0, yMin: -50, xMax: 100, yMax: 50 },
  },
  flag8thUp: {
    character: "\uE240",
    advanceWidth: 264,
    bounds: { xMin: 0, yMin: -810.1921176545985, xMax: 264, yMax: 9 },
  },
  accidentalFlat: {
    character: "\uE260",
    advanceWidth: 226,
    bounds: { xMin: 0, yMin: -175, xMax: 226, yMax: 439 },
  },
  accidentalNatural: {
    character: "\uE261",
    advanceWidth: 168,
    bounds: { xMin: 0, yMin: -335, xMax: 168, yMax: 341 },
  },
  accidentalSharp: {
    character: "\uE262",
    advanceWidth: 249,
    bounds: { xMin: 0, yMin: -348, xMax: 249, yMax: 350 },
  },
  restQuarter: {
    character: "\uE4E5",
    advanceWidth: 270,
    bounds: { xMin: 1, yMin: -375, xMax: 270, yMax: 373 },
  },
} as const satisfies Record<string, SmuflGlyphDefinition>;

export type SmuflGlyphName = keyof typeof SMUFL_GLYPHS;

export function getSmuflGlyphMetrics(name: SmuflGlyphName, fontSize: number) {
  const glyph = SMUFL_GLYPHS[name];
  const scale = fontSize / SMUFL_UNITS_PER_EM;

  return {
    scale,
    width: (glyph.bounds.xMax - glyph.bounds.xMin) * scale,
    height: (glyph.bounds.yMax - glyph.bounds.yMin) * scale,
    advanceWidth: glyph.advanceWidth * scale,
  };
}

export function getCenteredSmuflGlyphOrigin(
  name: SmuflGlyphName,
  fontSize: number,
  centerX: number,
  centerY: number,
) {
  const { bounds } = SMUFL_GLYPHS[name];
  const scale = fontSize / SMUFL_UNITS_PER_EM;

  return {
    x: centerX - ((bounds.xMin + bounds.xMax) * scale) / 2,
    y: centerY + ((bounds.yMin + bounds.yMax) * scale) / 2,
  };
}

export function getRegisteredSmuflGlyphOrigin(
  name: SmuflGlyphName,
  fontSize: number,
  centerX: number,
  registrationY: number,
) {
  const { bounds } = SMUFL_GLYPHS[name];
  const scale = fontSize / SMUFL_UNITS_PER_EM;

  return {
    x: centerX - ((bounds.xMin + bounds.xMax) * scale) / 2,
    y: registrationY,
  };
}
