import { SmuflGlyph } from "../music/SmuflGlyph";

const staffPaths = [
  "M-18 112C88 75 164 127 266 108S420 53 548 82",
  "M-18 126C88 89 164 141 266 122S420 67 548 96",
  "M-18 140C88 103 164 155 266 136S420 81 548 110",
  "M-18 154C88 117 164 169 266 150S420 95 548 124",
  "M-18 168C88 131 164 183 266 164S420 109 548 138",
];

export function HomeMusicScene() {
  return (
    <svg
      className="mobile-home-scene"
      viewBox="0 0 520 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="mobile-home-scene__echoes">
        <path d="M-30 82C92 28 182 96 286 74S438 26 558 52" />
        <path d="M-28 194C88 157 172 217 286 194S440 139 558 164" />
        <path d="M-20 216C96 179 180 239 294 216S448 161 566 186" />
      </g>
      <g className="mobile-home-scene__staff">
        {staffPaths.map((path) => <path key={path} d={path} />)}
      </g>
      <g className="mobile-home-scene__notation">
        <SmuflGlyph name="gClef" x={70} y={201} fontSize={126} className="mobile-home-scene__clef" />
        <SmuflGlyph name="accidentalSharp" x={182} y={157} fontSize={47} className="mobile-home-scene__sharp" />
        <Note x={224} y={144} stemHeight={56} />
        <Note x={326} y={119} stemHeight={62} />
        <Note x={426} y={88} stemHeight={66} flagged />
      </g>
      <g className="mobile-home-scene__stars">
        <circle cx="64" cy="52" r="1.3" />
        <circle cx="188" cy="74" r="1" />
        <circle cx="356" cy="52" r="1.4" />
        <circle cx="482" cy="166" r="1.1" />
      </g>
    </svg>
  );
}

function Note({ x, y, stemHeight, flagged = false }: { x: number; y: number; stemHeight: number; flagged?: boolean }) {
  return (
    <g className="mobile-home-scene__note">
      <SmuflGlyph name="noteheadBlack" x={x} y={y} fontSize={44} />
      <line x1={x + 13} y1={y - 4} x2={x + 13} y2={y - stemHeight} />
      {flagged ? <SmuflGlyph name="flag8thUp" x={x + 11} y={y - stemHeight} fontSize={42} /> : null}
    </g>
  );
}
