import { NormalizedSmuflGlyph } from "./SmuflGlyph";

export type TrebleClefProps = {
  x?: number;
  y?: number;
  height?: number;
  className?: string;
};

export function TrebleClef({
  x = 0,
  y = 0,
  height = 116,
  className,
}: TrebleClefProps) {
  return (
    <NormalizedSmuflGlyph
      name="gClef"
      x={x}
      y={y}
      height={height}
      className={className}
    />
  );
}
