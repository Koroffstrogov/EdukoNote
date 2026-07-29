import { NormalizedSmuflGlyph } from "./SmuflGlyph";

export type CClefProps = {
  x?: number;
  y?: number;
  height?: number;
  className?: string;
};

export function CClef({
  x = 0,
  y = 0,
  height = 100,
  className,
}: CClefProps) {
  return (
    <NormalizedSmuflGlyph
      name="cClef"
      x={x}
      y={y}
      height={height}
      className={className}
    />
  );
}
