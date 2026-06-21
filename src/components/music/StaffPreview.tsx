import { getNoteById, type NoteId } from "../../domain/notes";
import { StaffNote } from "./StaffNote";

export type StaffPreviewProps = {
  note?: NoteId;
  showLabel?: boolean;
};

export function StaffPreview({ note = "mi4", showLabel = false }: StaffPreviewProps) {
  const noteDefinition = getNoteById(note);

  return (
    <div className="staff-preview">
      <StaffNote note={noteDefinition} showLabel={showLabel} />
    </div>
  );
}
