import { useId } from "react";
import { STAFF_LINE_Y, STAFF_VIEWBOX, type NoteDefinition } from "../../domain/notes";
import { TrebleClef } from "./TrebleClef";

export type StaffNoteProps = {
  note: NoteDefinition;
  showLabel?: boolean;
};

export function StaffNote({ note, showLabel = false }: StaffNoteProps) {
  const titleId = useId();
  const staffTopY = STAFF_LINE_Y[0];
  const lineGap = STAFF_LINE_Y[1] - staffTopY;
  const solLineY = STAFF_LINE_Y[3];
  const staffLineStartX = 52;
  const staffLineEndX = 282;
  const clefHeight = lineGap * 7.35;
  const clefLoopAnchorRatio = 0.58;
  const clefX = 58;
  const clefY = solLineY - clefHeight * clefLoopAnchorRatio;
  const noteCenterX = 184;
  const stemUp = note.stepIndex < 5;
  const stemX = stemUp ? noteCenterX + 16 : noteCenterX - 16;
  const stemEndY = stemUp ? note.svgY - 60 : note.svgY + 60;
  const ledgerStartX = noteCenterX - 30;
  const ledgerEndX = noteCenterX + 30;

  return (
    <figure className="staff-note" aria-labelledby={titleId}>
      <svg className="staff-note-svg" viewBox={`0 0 ${STAFF_VIEWBOX.width} ${STAFF_VIEWBOX.height}`} role="img">
        <title id={titleId}>Portée en clé de sol avec la note {note.label}</title>
        {STAFF_LINE_Y.map((lineY) => (
          <line className="staff-note-svg__line" key={lineY} x1={staffLineStartX} y1={lineY} x2={staffLineEndX} y2={lineY} />
        ))}
        <TrebleClef className="staff-note-svg__clef" x={clefX} y={clefY} height={clefHeight} />
        {note.ledgerLines.map((lineY) => (
          <line className="staff-note-svg__ledger" key={lineY} x1={ledgerStartX} y1={lineY} x2={ledgerEndX} y2={lineY} />
        ))}
        <line className="staff-note-svg__stem" x1={stemX} y1={note.svgY} x2={stemX} y2={stemEndY} />
        <ellipse
          className="staff-note-svg__head"
          cx={noteCenterX}
          cy={note.svgY}
          rx="18"
          ry="12"
          transform={`rotate(-14 ${noteCenterX} ${note.svgY})`}
        />
      </svg>
      {showLabel ? <figcaption className="staff-note__label">{note.label}</figcaption> : null}
    </figure>
  );
}
