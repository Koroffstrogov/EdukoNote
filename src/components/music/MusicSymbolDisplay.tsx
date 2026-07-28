import { useId } from "react";
import { getSymbolById, type MusicSymbolDefinition, type MusicSymbolId } from "../../domain/musicSymbols";
import { BassClef } from "./BassClef";
import { CClef } from "./CClef";
import { TrebleClef } from "./TrebleClef";

export type MusicSymbolDisplayProps = {
  symbol: MusicSymbolDefinition | MusicSymbolId;
  className?: string;
};

const VIEWBOX_WIDTH = 180;
const VIEWBOX_HEIGHT = 140;
const STAFF_LINES = [42, 54, 66, 78, 90] as const;

export function MusicSymbolDisplay({ symbol, className = "" }: MusicSymbolDisplayProps) {
  const symbolDefinition = typeof symbol === "string" ? getSymbolById(symbol) : symbol;
  const titleId = useId();
  const classes = ["music-symbol-display", className].filter(Boolean).join(" ");

  return (
    <figure className={classes} aria-labelledby={titleId}>
      <svg className="music-symbol-display__svg" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} role="img">
        <title id={titleId}>{symbolDefinition.label}</title>
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
        <TrebleClef className="music-symbol-display__clef" x={58} y={12} height={116} />
      </>
    );
  }

  if (symbolId === "bass-clef") {
    return (
      <>
        <StaffLines x1={32} x2={150} isSoft />
        <BassClef className="music-symbol-display__clef" x={48} y={28} height={72} />
      </>
    );
  }

  if (symbolId === "c-clef") {
    return (
      <>
        <StaffLines x1={32} x2={150} isSoft />
        <CClef className="music-symbol-display__clef" x={68} y={22} height={96} />
      </>
    );
  }

  if (symbolId === "bar-line") {
    return (
      <>
        <StaffLines x1={36} x2={144} isSoft />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={90} y1={38} x2={90} y2={94} />
      </>
    );
  }

  if (symbolId === "double-bar-line") {
    return (
      <>
        <StaffLines x1={36} x2={144} isSoft />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={82} y1={38} x2={82} y2={94} />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={98} y1={38} x2={98} y2={94} />
      </>
    );
  }

  if (symbolId === "whole-note") {
    return <NoteHead cx={90} cy={70} isFilled={false} size="whole" />;
  }

  if (symbolId === "half-note") {
    return (
      <>
        <NoteHead cx={78} cy={82} isFilled={false} />
        <Stem x={90} y1={79} y2={27} />
      </>
    );
  }

  if (symbolId === "quarter-note") {
    return (
      <>
        <NoteHead cx={78} cy={82} isFilled />
        <Stem x={90} y1={79} y2={27} />
      </>
    );
  }

  if (symbolId === "eighth-note") {
    return (
      <>
        <NoteHead cx={76} cy={84} isFilled />
        <Stem x={88} y1={81} y2={27} />
        <path
          className="music-symbol-display__fill"
          d="M88 27 C108 29 121 39 120 51 C119 59 111 66 100 70 C107 61 108 53 104 47 C101 42 96 39 88 38 Z"
        />
      </>
    );
  }

  if (symbolId === "beamed-eighth-notes") {
    return (
      <>
        <NoteHead cx={65} cy={88} isFilled />
        <NoteHead cx={115} cy={80} isFilled />
        <Stem x={77} y1={85} y2={34} />
        <Stem x={127} y1={77} y2={26} />
        <path className="music-symbol-display__fill" d="M77 32 L127 24 L127 36 L77 44 Z" />
      </>
    );
  }

  if (symbolId === "augmentation-dot") {
    return (
      <>
        <NoteHead cx={76} cy={70} isFilled />
        <Stem x={88} y1={67} y2={25} />
        <circle className="music-symbol-display__fill" cx={108} cy={70} r={4.5} />
      </>
    );
  }

  if (symbolId === "quarter-rest") {
    return (
      <>
        <path
          className="music-symbol-display__stroke music-symbol-display__rest-stroke"
          d="M73 24 L101 48 L85 62 L103 77 L87 91"
        />
        <path
          className="music-symbol-display__stroke music-symbol-display__rest-stroke"
          d="M87 91 C105 91 108 104 101 113 C97 118 90 121 82 120 C91 113 92 104 86 99 C83 96 80 94 76 93"
        />
      </>
    );
  }

  if (symbolId === "sharp") {
    return (
      <>
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={76} y1={34} x2={70} y2={108} />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={110} y1={30} x2={104} y2={104} />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={58} y1={56} x2={124} y2={48} />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={56} y1={88} x2={122} y2={80} />
      </>
    );
  }

  if (symbolId === "flat") {
    return (
      <>
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={75} y1={24} x2={75} y2={110} />
        <path className="music-symbol-display__stroke music-symbol-display__stroke--strong" d="M75 66 C114 48 127 87 75 108" />
      </>
    );
  }

  return (
    <>
      <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={72} y1={34} x2={72} y2={104} />
      <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={108} y1={28} x2={108} y2={98} />
      <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={72} y1={52} x2={108} y2={42} />
      <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={72} y1={90} x2={108} y2={80} />
    </>
  );
}

function StaffLines({ x1, x2, isSoft = false }: { x1: number; x2: number; isSoft?: boolean }) {
  const className = isSoft ? "music-symbol-display__staff-line music-symbol-display__staff-line--soft" : "music-symbol-display__staff-line";

  return (
    <>
      {STAFF_LINES.map((lineY) => (
        <line className={className} key={lineY} x1={x1} y1={lineY} x2={x2} y2={lineY} />
      ))}
    </>
  );
}

function Stem({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return <line className="music-symbol-display__stroke music-symbol-display__stem" x1={x} y1={y1} x2={x} y2={y2} />;
}

function NoteHead({
  cx,
  cy,
  isFilled,
  size = "regular",
}: {
  cx: number;
  cy: number;
  isFilled: boolean;
  size?: "regular" | "whole";
}) {
  const radiusX = size === "whole" ? 18 : 16;
  const radiusY = size === "whole" ? 10 : 9;

  return (
    <ellipse
      className={isFilled ? "music-symbol-display__fill" : "music-symbol-display__stroke music-symbol-display__note-head"}
      cx={cx}
      cy={cy}
      rx={radiusX}
      ry={radiusY}
      transform={`rotate(-14 ${cx} ${cy})`}
    />
  );
}
