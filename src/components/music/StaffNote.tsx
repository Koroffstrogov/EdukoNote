import { useId } from "react";
import { STAFF_LINE_Y, STAFF_VIEWBOX, type NoteDefinition } from "../../domain/notes";
import { BassClef } from "./BassClef";
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
  const bassFaLineY = STAFF_LINE_Y[1];
  const clefLayout = getClefLayout(note, lineGap, solLineY, bassFaLineY);
  const noteCenterX = 184;
  const noteScale = 0.78;
  const noteHeadRx = 18 * noteScale;
  const noteHeadRy = 12 * noteScale;
  const stemOffset = 12;
  const stemUp = note.stepIndex < 5;
  const stemX = stemUp ? noteCenterX + stemOffset : noteCenterX - stemOffset;
  const stemEndY = stemUp ? note.svgY - 60 : note.svgY + 60;
  const ledgerStartX = noteCenterX - 30;
  const ledgerEndX = noteCenterX + 30;

  return (
    <figure className="staff-note" aria-labelledby={titleId}>
      <svg className="staff-note-svg" viewBox={`0 0 ${STAFF_VIEWBOX.width} ${STAFF_VIEWBOX.height}`} role="img">
        <title id={titleId}>Portée en {note.clef === "treble" ? "clé de sol" : "clé de fa"} avec la note {note.label}</title>
        {STAFF_LINE_Y.map((lineY) => (
          <line className="staff-note-svg__line" key={lineY} x1={staffLineStartX} y1={lineY} x2={staffLineEndX} y2={lineY} />
        ))}
        {clefLayout.clef === "treble" ? (
          <TrebleClef className="staff-note-svg__clef" x={clefLayout.x} y={clefLayout.y} height={clefLayout.height} />
        ) : (
          <BassClef className="staff-note-svg__clef" x={clefLayout.x} y={clefLayout.y} height={clefLayout.height} />
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

function getClefLayout(note: NoteDefinition, lineGap: number, solLineY: number, bassFaLineY: number) {
  if (note.clef === "bass") {
    const height = lineGap * 5.3 * 0.6;
    const faDotsCenterRatio = 0.3015;

    return {
      clef: note.clef,
      x: 54,
      y: bassFaLineY - height * faDotsCenterRatio,
      height,
    };
  }

  const height = lineGap * 7.35;
  const loopAnchorRatio = 0.58;
  const yOffset = -6;

  return {
    clef: note.clef,
    x: 58,
    y: solLineY - height * loopAnchorRatio + yOffset,
    height,
  };
}
