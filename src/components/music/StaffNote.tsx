import { useId } from "react";
import { STAFF_LINE_Y, STAFF_VIEWBOX, type NoteDefinition } from "../../domain/notes";
import { BassClef } from "./BassClef";
import { CClef } from "./CClef";
import { TrebleClef } from "./TrebleClef";

const STAFF_METRICS = {
  staffTopY: STAFF_LINE_Y[0],
  lineGap: STAFF_LINE_Y[1] - STAFF_LINE_Y[0],
  staffLeftX: 36,
  staffWidth: 264,
  noteAreaStartX: 170,
  noteCenterX: 202,
  ledgerHalfWidth: 30,
  noteScale: 0.78,
  stemOffset: 12,
} as const;

export type StaffNoteProps = {
  note: NoteDefinition;
  showLabel?: boolean;
};

export function StaffNote({ note, showLabel = false }: StaffNoteProps) {
  const titleId = useId();
  const staffLineEndX = STAFF_METRICS.staffLeftX + STAFF_METRICS.staffWidth;
  const clefLayout = getClefLayout(note, STAFF_METRICS);
  const noteCenterX = Math.max(STAFF_METRICS.noteCenterX, STAFF_METRICS.noteAreaStartX);
  const noteHeadRx = 18 * STAFF_METRICS.noteScale;
  const noteHeadRy = 12 * STAFF_METRICS.noteScale;
  const stemUp = note.stepIndex < 5;
  const stemX = stemUp ? noteCenterX + STAFF_METRICS.stemOffset : noteCenterX - STAFF_METRICS.stemOffset;
  const stemEndY = stemUp ? note.svgY - 60 : note.svgY + 60;
  const ledgerStartX = noteCenterX - STAFF_METRICS.ledgerHalfWidth;
  const ledgerEndX = noteCenterX + STAFF_METRICS.ledgerHalfWidth;

  return (
    <figure className="staff-note" aria-labelledby={titleId}>
      <svg className="staff-note-svg" viewBox={`0 0 ${STAFF_VIEWBOX.width} ${STAFF_VIEWBOX.height}`} role="img">
        <title id={titleId}>Portée en {getClefTitle(note.clef)} avec la note {note.label}</title>
        {STAFF_LINE_Y.map((lineY) => (
          <line className="staff-note-svg__line" key={lineY} x1={STAFF_METRICS.staffLeftX} y1={lineY} x2={staffLineEndX} y2={lineY} />
        ))}
        {clefLayout.clef === "treble" ? (
          <TrebleClef className="staff-note-svg__clef" x={clefLayout.x} y={clefLayout.y} height={clefLayout.height} />
        ) : clefLayout.clef === "bass" ? (
          <BassClef className="staff-note-svg__clef" x={clefLayout.x} y={clefLayout.y} height={clefLayout.height} />
        ) : (
          <CClef className="staff-note-svg__clef" x={clefLayout.x} y={clefLayout.y} height={clefLayout.height} />
        )}
        {note.ledgerLines.map((lineY) => (
          <line className="staff-note-svg__ledger" key={lineY} x1={ledgerStartX} y1={lineY} x2={ledgerEndX} y2={lineY} />
        ))}
        <line className="staff-note-svg__stem" x1={stemX} y1={note.svgY} x2={stemX} y2={stemEndY} />
        <ellipse
          className="staff-note-svg__head"
          cx={noteCenterX}
          cy={note.svgY}
          rx={noteHeadRx}
          ry={noteHeadRy}
          transform={`rotate(-14 ${noteCenterX} ${note.svgY})`}
        />
      </svg>
      {showLabel ? <figcaption className="staff-note__label">{note.label}</figcaption> : null}
    </figure>
  );
}

function getClefLayout(note: NoteDefinition, metrics: typeof STAFF_METRICS) {
  const solLineY = STAFF_LINE_Y[3];
  const bassFaLineY = STAFF_LINE_Y[1];

  if (note.clef === "bass") {
    const height = metrics.lineGap * 5.3 * 0.6;
    const faDotsCenterRatio = 0.3015;

    return {
      clef: note.clef,
      x: 50,
      y: bassFaLineY - height * faDotsCenterRatio,
      height,
    };
  }

  if (note.clef === "tenor") {
    const height = metrics.lineGap * 5.4 * 0.75;
    const cLineAnchorRatio = 0.5;

    return {
      clef: note.clef,
      x: 54,
      y: bassFaLineY - height * cLineAnchorRatio,
      height,
    };
  }

  const height = metrics.lineGap * 7.35;
  const loopAnchorRatio = 0.58;
  const yOffset = -6;

  return {
    clef: note.clef,
    x: 52,
    y: solLineY - height * loopAnchorRatio + yOffset,
    height,
  };
}

function getClefTitle(clef: NoteDefinition["clef"]): string {
  if (clef === "treble") {
    return "clé de sol";
  }

  if (clef === "bass") {
    return "clé de fa";
  }

  return "clé d’Ut 4";
}
