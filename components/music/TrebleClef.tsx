// src/components/music/TrebleClef.tsx

type TrebleClefProps = {
  x?: number;
  y?: number;
  height?: number;
  className?: string;
};

const VIEWBOX_WIDTH = 52.7;
const VIEWBOX_HEIGHT = 116.05;

const TREBLE_CLEF_PATH = `
  COLLER_ICI_LE_CONTENU_COMPLET_DU_D_DE_path400
`;

export function TrebleClef({
  x = 0,
  y = 0,
  height = 112,
  className,
}: TrebleClefProps) {
  const width = (height * VIEWBOX_WIDTH) / VIEWBOX_HEIGHT;

  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="68.45 46.05 52.70 116.05"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g transform="matrix(7.0026135,0,0,7.0026135,-1245.2915,-2642.2892)">
        <path d={TREBLE_CLEF_PATH} fill="currentColor" />
      </g>
    </svg>
  );
}