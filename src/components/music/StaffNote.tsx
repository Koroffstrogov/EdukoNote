import { useId } from "react";
import { STAFF_LINE_Y, STAFF_VIEWBOX, type NoteDefinition } from "../../domain/notes";

export type StaffNoteProps = {
  note: NoteDefinition;
  showLabel?: boolean;
};

export function StaffNote({ note, showLabel = false }: StaffNoteProps) {
  const titleId = useId();
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
        <path
          className="staff-note-svg__clef"
          d="M66 116 C54 115 48 107 50 96 C52 84 64 78 75 83 C88 89 88 106 77 114 C68 121 56 118 54 108 C53 101 58 96 65 96 C72 96 76 101 74 107 C72 113 64 114 60 109 M75 83 C68 64 74 45 88 39 C101 33 112 44 107 58 C102 72 87 77 75 83 C65 90 60 102 62 119 C64 135 75 143 84 134 C91 126 86 116 76 116 C67 116 61 123 61 132 C61 144 75 150 86 143"
          aria-hidden="true"
        />
        {STAFF_LINE_Y.map((lineY) => (
          <line className="staff-note-svg__line" key={lineY} x1="88" y1={lineY} x2="282" y2={lineY} />
        ))}
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
