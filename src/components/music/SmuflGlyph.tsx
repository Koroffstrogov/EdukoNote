import {
  SMUFL_GLYPHS,
  SMUFL_UNITS_PER_EM,
  type SmuflGlyphName,
} from "./smuflGlyphs";

type SmuflGlyphProps = {
  name: SmuflGlyphName;
  x: number;
  y: number;
  fontSize: number;
  className?: string;
};

export function SmuflGlyph({
  name,
  x,
  y,
  fontSize,
  className = "",
}: SmuflGlyphProps) {
  const classes = ["smufl-glyph", className].filter(Boolean).join(" ");

  return (
    <text
      aria-hidden="true"
      className={classes}
      data-smufl-name={name}
      fontSize={fontSize}
      x={x}
      y={y}
    >
      {SMUFL_GLYPHS[name].character}
    </text>
  );
}

type NormalizedSmuflGlyphProps = {
  name: SmuflGlyphName;
  x?: number;
  y?: number;
  height: number;
  className?: string;
};

export function NormalizedSmuflGlyph({
  name,
  x = 0,
  y = 0,
  height,
  className,
}: NormalizedSmuflGlyphProps) {
  const { bounds } = SMUFL_GLYPHS[name];
  const glyphWidth = bounds.xMax - bounds.xMin;
  const glyphHeight = bounds.yMax - bounds.yMin;
  const width = (height * glyphWidth) / glyphHeight;

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-smufl-container={name}
      focusable="false"
      height={height}
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${glyphWidth} ${glyphHeight}`}
      width={width}
      x={x}
      y={y}
    >
      <SmuflGlyph
        name={name}
        x={-bounds.xMin}
        y={bounds.yMax}
        fontSize={SMUFL_UNITS_PER_EM}
      />
    </svg>
  );
}
