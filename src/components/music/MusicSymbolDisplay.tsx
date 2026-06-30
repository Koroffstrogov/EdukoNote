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
    return <NoteHead cx={90} cy={70} isFilled={false} />;
  }

  if (symbolId === "half-note") {
    return (
      <>
        <NoteHead cx={78} cy={82} isFilled={false} />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={91} y1={80} x2={91} y2={26} />
      </>
    );
  }

  if (symbolId === "quarter-note") {
    return (
      <>
        <NoteHead cx={78} cy={82} isFilled />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={91} y1={80} x2={91} y2={26} />
      </>
    );
  }

  if (symbolId === "eighth-note") {
    return (
      <>
        <NoteHead cx={76} cy={84} isFilled />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={89} y1={82} x2={89} y2={28} />
        <path className="music-symbol-display__stroke music-symbol-display__stroke--strong" d="M89 28 C116 34 120 51 101 62" />
      </>
    );
  }

  if (symbolId === "beamed-eighth-notes") {
    return (
      <>
        <NoteHead cx={65} cy={88} isFilled />
        <NoteHead cx={115} cy={80} isFilled />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={78} y1={86} x2={78} y2={34} />
        <line className="music-symbol-display__stroke music-symbol-display__stroke--strong" x1={128} y1={78} x2={128} y2={26} />
        <path className="music-symbol-display__fill" d="M78 32 L128 24 L128 36 L78 44 Z" />
      </>
    );
  }

  if (symbolId === "augmentation-dot") {
    return (
      <>
        <NoteHead cx={78} cy={70} isFilled={false} />
        <circle className="music-symbol-display__fill" cx={113} cy={70} r={6} />
      </>
    );
  }

  if (symbolId === "quarter-rest") {
    return (
      <path
        className="music-symbol-display__stroke music-symbol-display__stroke--strong"
        d="M86 26 C104 40 96 52 78 62 C97 70 101 85 82 98 C98 100 101 117 83 119"
      />
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
      <path className="music-symbol-display__fill" d="M72 43 L108 32 L108 48 L72 59 Z" />
      <path className="music-symbol-display__fill" d="M72 86 L108 75 L108 91 L72 102 Z" />
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

function NoteHead({ cx, cy, isFilled }: { cx: number; cy: number; isFilled: boolean }) {
  return (
    <ellipse
      className={isFilled ? "music-symbol-display__fill" : "music-symbol-display__stroke music-symbol-display__note-head"}
      cx={cx}
      cy={cy}
      rx={19}
      ry={12}
      transform={`rotate(-14 ${cx} ${cy})`}
    />
  );
}
