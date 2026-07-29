import { useId } from "react";
import {
  getSymbolById,
  type MusicSymbolDefinition,
  type MusicSymbolId,
} from "../../domain/musicSymbols";
import { SmuflGlyph } from "./SmuflGlyph";
import {
  AUGMENTATION_DOT_ORIGIN,
  BEAM_LAYOUT,
  BEAM_PATH,
  CLEF_LAYOUTS,
  DOUBLE_BAR_X,
  MUSIC_SYMBOL_VIEWBOX,
  NOTE_LAYOUTS,
  STAFF_LINES,
  STAFF_LINE_THICKNESS,
  STEM_THICKNESS,
  SYMBOL_CENTER_X,
  SYMBOL_CENTER_Y,
  SYMBOL_FONT_SIZE,
  THIN_BARLINE_THICKNESS,
} from "./musicSymbolGeometry";
import {
  getCenteredSmuflGlyphOrigin,
  type SmuflGlyphName,
} from "./smuflGlyphs";

export type MusicSymbolDisplayProps = {
  symbol: MusicSymbolDefinition | MusicSymbolId;
  className?: string;
  accessibleLabel?: string;
};

const ACCIDENTAL_GLYPH_BY_ID: Partial<Record<MusicSymbolId, SmuflGlyphName>> = {
  sharp: "accidentalSharp",
  flat: "accidentalFlat",
  natural: "accidentalNatural",
};

export function MusicSymbolDisplay({
  symbol,
  className = "",
  accessibleLabel,
}: MusicSymbolDisplayProps) {
  const symbolDefinition =
    typeof symbol === "string" ? getSymbolById(symbol) : symbol;
  const titleId = useId();
  const classes = ["music-symbol-display", className].filter(Boolean).join(" ");

  return (
    <figure className={classes}>
      <svg
        className="music-symbol-display__svg"
        viewBox={`0 0 ${MUSIC_SYMBOL_VIEWBOX.width} ${MUSIC_SYMBOL_VIEWBOX.height}`}
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>
          {accessibleLabel ?? symbolDefinition.label}
        </title>
        <SymbolShape symbolId={symbolDefinition.id} />
      </svg>
    </figure>
  );
}

function SymbolShape({ symbolId }: { symbolId: MusicSymbolId }) {
  if (symbolId === "staff") {
    return <StaffLines x1={30} x2={150} />;
  }

  if (symbolId === "treble-clef") {
    return (
      <>
        <StaffLines x1={32} x2={150} isSoft />
        <SmuflGlyph
          className="music-symbol-display__clef"
          fontSize={SYMBOL_FONT_SIZE}
          name={CLEF_LAYOUTS.gClef.name}
          x={CLEF_LAYOUTS.gClef.x}
          y={CLEF_LAYOUTS.gClef.y}
        />
      </>
    );
  }

  if (symbolId === "bass-clef") {
    return (
      <>
        <StaffLines x1={32} x2={150} isSoft />
        <SmuflGlyph
          className="music-symbol-display__clef"
          fontSize={SYMBOL_FONT_SIZE}
          name={CLEF_LAYOUTS.fClef.name}
          x={CLEF_LAYOUTS.fClef.x}
          y={CLEF_LAYOUTS.fClef.y}
        />
      </>
    );
  }

  if (symbolId === "c-clef") {
    return (
      <>
        <StaffLines x1={32} x2={150} isSoft />
        <SmuflGlyph
          className="music-symbol-display__clef"
          fontSize={SYMBOL_FONT_SIZE}
          name={CLEF_LAYOUTS.cClef.name}
          x={CLEF_LAYOUTS.cClef.x}
          y={CLEF_LAYOUTS.cClef.y}
        />
      </>
    );
  }

  if (symbolId === "bar-line") {
    return (
      <>
        <StaffLines x1={36} x2={144} isSoft />
        <BarLine x={SYMBOL_CENTER_X} />
      </>
    );
  }

  if (symbolId === "double-bar-line") {
    return (
      <>
        <StaffLines x1={36} x2={144} isSoft />
        <BarLine x={DOUBLE_BAR_X.left} />
        <BarLine x={DOUBLE_BAR_X.right} />
      </>
    );
  }

  if (symbolId === "whole-note") {
    return (
      <CenteredSmuflGlyph
        centerX={SYMBOL_CENTER_X}
        centerY={SYMBOL_CENTER_Y}
        name="noteheadWhole"
      />
    );
  }

  if (symbolId === "half-note") {
    return (
      <>
        <CenteredSmuflGlyph
          centerX={NOTE_LAYOUTS.half.headCenterX}
          centerY={NOTE_LAYOUTS.half.headCenterY}
          name="noteheadHalf"
        />
        <Stem
          x={NOTE_LAYOUTS.half.stemX}
          y1={NOTE_LAYOUTS.half.stemBottomY}
          y2={NOTE_LAYOUTS.half.stemTopY}
        />
      </>
    );
  }

  if (symbolId === "quarter-note") {
    return (
      <>
        <CenteredSmuflGlyph
          centerX={NOTE_LAYOUTS.quarter.headCenterX}
          centerY={NOTE_LAYOUTS.quarter.headCenterY}
          name="noteheadBlack"
        />
        <Stem
          x={NOTE_LAYOUTS.quarter.stemX}
          y1={NOTE_LAYOUTS.quarter.stemBottomY}
          y2={NOTE_LAYOUTS.quarter.stemTopY}
        />
      </>
    );
  }

  if (symbolId === "eighth-note") {
    return (
      <>
        <CenteredSmuflGlyph
          centerX={NOTE_LAYOUTS.eighth.headCenterX}
          centerY={NOTE_LAYOUTS.eighth.headCenterY}
          name="noteheadBlack"
        />
        <Stem
          x={NOTE_LAYOUTS.eighth.stemX}
          y1={NOTE_LAYOUTS.eighth.stemBottomY}
          y2={NOTE_LAYOUTS.eighth.stemTopY}
        />
        <SmuflGlyph
          fontSize={SYMBOL_FONT_SIZE}
          name="flag8thUp"
          x={NOTE_LAYOUTS.eighth.stemX}
          y={NOTE_LAYOUTS.eighth.stemTopY}
        />
      </>
    );
  }

  if (symbolId === "beamed-eighth-notes") {
    return (
      <>
        <CenteredSmuflGlyph
          centerX={NOTE_LAYOUTS.beamedLeft.headCenterX}
          centerY={NOTE_LAYOUTS.beamedLeft.headCenterY}
          name="noteheadBlack"
        />
        <CenteredSmuflGlyph
          centerX={NOTE_LAYOUTS.beamedRight.headCenterX}
          centerY={NOTE_LAYOUTS.beamedRight.headCenterY}
          name="noteheadBlack"
        />
        <Stem
          x={NOTE_LAYOUTS.beamedLeft.stemX}
          y1={NOTE_LAYOUTS.beamedLeft.stemBottomY}
          y2={NOTE_LAYOUTS.beamedLeft.stemTopY}
        />
        <Stem
          x={NOTE_LAYOUTS.beamedRight.stemX}
          y1={NOTE_LAYOUTS.beamedRight.stemBottomY}
          y2={NOTE_LAYOUTS.beamedRight.stemTopY}
        />
        <path
          className="music-symbol-display__fill music-symbol-display__beam"
          d={BEAM_PATH}
          data-beam-thickness={BEAM_LAYOUT.thickness}
        />
      </>
    );
  }

  if (symbolId === "augmentation-dot") {
    return (
      <>
        <CenteredSmuflGlyph
          centerX={NOTE_LAYOUTS.dotted.headCenterX}
          centerY={NOTE_LAYOUTS.dotted.headCenterY}
          name="noteheadBlack"
        />
        <Stem
          x={NOTE_LAYOUTS.dotted.stemX}
          y1={NOTE_LAYOUTS.dotted.stemBottomY}
          y2={NOTE_LAYOUTS.dotted.stemTopY}
        />
        <SmuflGlyph
          fontSize={SYMBOL_FONT_SIZE}
          name="augmentationDot"
          x={AUGMENTATION_DOT_ORIGIN.x}
          y={AUGMENTATION_DOT_ORIGIN.y}
        />
      </>
    );
  }

  if (symbolId === "quarter-rest") {
    return (
      <CenteredSmuflGlyph
        centerX={SYMBOL_CENTER_X}
        centerY={SYMBOL_CENTER_Y}
        name="restQuarter"
      />
    );
  }

  const accidentalGlyph = ACCIDENTAL_GLYPH_BY_ID[symbolId];

  if (accidentalGlyph) {
    return (
      <CenteredSmuflGlyph
        centerX={SYMBOL_CENTER_X}
        centerY={SYMBOL_CENTER_Y}
        name={accidentalGlyph}
      />
    );
  }

  return null;
}

function CenteredSmuflGlyph({
  name,
  centerX,
  centerY,
}: {
  name: SmuflGlyphName;
  centerX: number;
  centerY: number;
}) {
  const origin = getCenteredSmuflGlyphOrigin(
    name,
    SYMBOL_FONT_SIZE,
    centerX,
    centerY,
  );

  return (
    <SmuflGlyph
      fontSize={SYMBOL_FONT_SIZE}
      name={name}
      x={origin.x}
      y={origin.y}
    />
  );
}

function StaffLines({
  x1,
  x2,
  isSoft = false,
}: {
  x1: number;
  x2: number;
  isSoft?: boolean;
}) {
  const className = isSoft
    ? "music-symbol-display__staff-line music-symbol-display__staff-line--soft"
    : "music-symbol-display__staff-line";

  return (
    <>
      {STAFF_LINES.map((lineY) => (
        <line
          className={className}
          key={lineY}
          strokeWidth={STAFF_LINE_THICKNESS}
          x1={x1}
          x2={x2}
          y1={lineY}
          y2={lineY}
        />
      ))}
    </>
  );
}

function Stem({
  x,
  y1,
  y2,
}: {
  x: number;
  y1: number;
  y2: number;
}) {
  return (
    <line
      className="music-symbol-display__stroke music-symbol-display__stem"
      strokeWidth={STEM_THICKNESS}
      x1={x}
      x2={x}
      y1={y1}
      y2={y2}
    />
  );
}

function BarLine({ x }: { x: number }) {
  return (
    <line
      className="music-symbol-display__stroke music-symbol-display__bar-line"
      strokeWidth={THIN_BARLINE_THICKNESS}
      x1={x}
      x2={x}
      y1={38}
      y2={94}
    />
  );
}
