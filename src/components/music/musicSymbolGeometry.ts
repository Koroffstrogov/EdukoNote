import {
  getCenteredSmuflGlyphOrigin,
  getRegisteredSmuflGlyphOrigin,
  getSmuflGlyphMetrics,
} from "./smuflGlyphs";

export const MUSIC_SYMBOL_VIEWBOX = {
  width: 180,
  height: 140,
} as const;

export const STAFF_SPACE = 12;
export const STAFF_LINES = [42, 54, 66, 78, 90] as const;
export const SYMBOL_CENTER_X = MUSIC_SYMBOL_VIEWBOX.width / 2;
export const SYMBOL_CENTER_Y = MUSIC_SYMBOL_VIEWBOX.height / 2;

// SMuFL uses one em for four staff spaces.
export const SYMBOL_FONT_SIZE = STAFF_SPACE * 4;

export const STAFF_LINE_THICKNESS = STAFF_SPACE * 0.125;
export const STEM_THICKNESS = STAFF_SPACE * 0.12;
export const THIN_BARLINE_THICKNESS = STAFF_SPACE * 0.16;
export const BEAM_THICKNESS = STAFF_SPACE * 0.5;
export const DOUBLE_BAR_WHITE_GAP = STAFF_SPACE * 0.4;

const doubleBarCenterDistance = DOUBLE_BAR_WHITE_GAP + THIN_BARLINE_THICKNESS;

export const DOUBLE_BAR_X = {
  left: SYMBOL_CENTER_X - doubleBarCenterDistance / 2,
  right: SYMBOL_CENTER_X + doubleBarCenterDistance / 2,
} as const;

export const CLEF_LAYOUTS = {
  gClef: {
    name: "gClef",
    registrationY: STAFF_LINES[3],
    ...getRegisteredSmuflGlyphOrigin(
      "gClef",
      SYMBOL_FONT_SIZE,
      SYMBOL_CENTER_X,
      STAFF_LINES[3],
    ),
  },
  fClef: {
    name: "fClef",
    registrationY: STAFF_LINES[1],
    ...getRegisteredSmuflGlyphOrigin(
      "fClef",
      SYMBOL_FONT_SIZE,
      SYMBOL_CENTER_X,
      STAFF_LINES[1],
    ),
  },
  cClef: {
    name: "cClef",
    registrationY: STAFF_LINES[2],
    ...getRegisteredSmuflGlyphOrigin(
      "cClef",
      SYMBOL_FONT_SIZE,
      SYMBOL_CENTER_X,
      STAFF_LINES[2],
    ),
  },
} as const;

const regularNoteheadWidth = getSmuflGlyphMetrics(
  "noteheadBlack",
  SYMBOL_FONT_SIZE,
).width;

const stemXFor = (headCenterX: number) => headCenterX + regularNoteheadWidth / 2;

export const NOTE_LAYOUTS = {
  half: {
    headCenterX: 78,
    headCenterY: 82,
    stemX: stemXFor(78),
    stemBottomY: 80,
    stemTopY: 32,
  },
  quarter: {
    headCenterX: 78,
    headCenterY: 82,
    stemX: stemXFor(78),
    stemBottomY: 80,
    stemTopY: 32,
  },
  eighth: {
    headCenterX: 76,
    headCenterY: 84,
    stemX: stemXFor(76),
    stemBottomY: 82,
    stemTopY: 34,
  },
  beamedLeft: {
    headCenterX: 65,
    headCenterY: 88,
    stemX: stemXFor(65),
    stemBottomY: 86,
    stemTopY: 34,
  },
  beamedRight: {
    headCenterX: 115,
    headCenterY: 80,
    stemX: stemXFor(115),
    stemBottomY: 78,
    stemTopY: 26,
  },
  dotted: {
    headCenterX: 76,
    headCenterY: 70,
    stemX: stemXFor(76),
    stemBottomY: 68,
    stemTopY: 30,
  },
} as const;

export const BEAM_LAYOUT = {
  leftX: NOTE_LAYOUTS.beamedLeft.stemX,
  rightX: NOTE_LAYOUTS.beamedRight.stemX,
  leftTopY: NOTE_LAYOUTS.beamedLeft.stemTopY,
  rightTopY: NOTE_LAYOUTS.beamedRight.stemTopY,
  thickness: BEAM_THICKNESS,
} as const;

export const BEAM_PATH = [
  `M${BEAM_LAYOUT.leftX} ${BEAM_LAYOUT.leftTopY}`,
  `L${BEAM_LAYOUT.rightX} ${BEAM_LAYOUT.rightTopY}`,
  `L${BEAM_LAYOUT.rightX} ${BEAM_LAYOUT.rightTopY + BEAM_LAYOUT.thickness}`,
  `L${BEAM_LAYOUT.leftX} ${BEAM_LAYOUT.leftTopY + BEAM_LAYOUT.thickness}`,
  "Z",
].join(" ");

export const AUGMENTATION_DOT_GAP = STAFF_SPACE * 0.5;
const dottedHeadMetrics = getSmuflGlyphMetrics("noteheadBlack", SYMBOL_FONT_SIZE);
const dotMetrics = getSmuflGlyphMetrics("augmentationDot", SYMBOL_FONT_SIZE);

export const AUGMENTATION_DOT_LAYOUT = {
  diameter: dotMetrics.width,
  gap: AUGMENTATION_DOT_GAP,
  centerX:
    NOTE_LAYOUTS.dotted.headCenterX +
    dottedHeadMetrics.width / 2 +
    AUGMENTATION_DOT_GAP +
    dotMetrics.width / 2,
  centerY: NOTE_LAYOUTS.dotted.headCenterY,
} as const;

export const AUGMENTATION_DOT_ORIGIN = getCenteredSmuflGlyphOrigin(
  "augmentationDot",
  SYMBOL_FONT_SIZE,
  AUGMENTATION_DOT_LAYOUT.centerX,
  AUGMENTATION_DOT_LAYOUT.centerY,
);

export const MUSIC_GLYPH_METRICS = {
  gClef: getSmuflGlyphMetrics("gClef", SYMBOL_FONT_SIZE),
  fClef: getSmuflGlyphMetrics("fClef", SYMBOL_FONT_SIZE),
  cClef: getSmuflGlyphMetrics("cClef", SYMBOL_FONT_SIZE),
  noteheadWhole: getSmuflGlyphMetrics("noteheadWhole", SYMBOL_FONT_SIZE),
  noteheadHalf: getSmuflGlyphMetrics("noteheadHalf", SYMBOL_FONT_SIZE),
  noteheadBlack: getSmuflGlyphMetrics("noteheadBlack", SYMBOL_FONT_SIZE),
  accidentalFlat: getSmuflGlyphMetrics("accidentalFlat", SYMBOL_FONT_SIZE),
  accidentalNatural: getSmuflGlyphMetrics("accidentalNatural", SYMBOL_FONT_SIZE),
  accidentalSharp: getSmuflGlyphMetrics("accidentalSharp", SYMBOL_FONT_SIZE),
  restQuarter: getSmuflGlyphMetrics("restQuarter", SYMBOL_FONT_SIZE),
  augmentationDot: dotMetrics,
} as const;
