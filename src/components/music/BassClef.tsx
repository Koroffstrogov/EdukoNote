import { NormalizedSmuflGlyph } from "./SmuflGlyph";

export type BassClefProps = {
  x?: number;
  y?: number;
  height?: number;
  className?: string;
};

export function BassClef({
  x = 0,
  y = 0,
  height = 129.23335,
  className,
}: BassClefProps) {
  return (
    <NormalizedSmuflGlyph
      name="fClef"
      x={x}
      y={y}
      height={height}
      className={className}
    />
  );
}
