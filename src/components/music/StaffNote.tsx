import { useId } from "react";
import { STAFF_LINE_Y, STAFF_VIEWBOX, type NoteDefinition } from "../../domain/notes";

export type StaffNoteProps = {
  note: NoteDefinition;
  showLabel?: boolean;
};

export function StaffNote({ note, showLabel = false }: StaffNoteProps) {
  const titleId = useId();
  const noteCenterX = 184;
  const stemX = 200;
  const ledgerStartX = noteCenterX - 30;
  const ledgerEndX = noteCenterX + 30;

  return (
    <figure className="staff-note" aria-labelledby={titleId}>
      <svg className="staff-note-svg" viewBox={`0 0 ${STAFF_VIEWBOX.width} ${STAFF_VIEWBOX.height}`} role="img">
        <title id={titleId}>Portée en clé de sol avec la note {note.label}</title>
        <text className="staff-note-svg__clef" x="42" y="108" aria-hidden="true">
          𝄞
        </text>
        {STAFF_LINE_Y.map((lineY) => (
          <line className="staff-note-svg__line" key={lineY} x1="88" y1={lineY} x2="282" y2={lineY} />
        ))}
        {note.ledgerLines.map((lineY) => (
          <line className="staff-note-svg__ledger" key={lineY} x1={ledgerStartX} y1={lineY} x2={ledgerEndX} y2={lineY} />
        ))}
        <line className="staff-note-svg__stem" x1={stemX} y1={note.svgY} x2={stemX} y2={note.svgY - 60} />
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
