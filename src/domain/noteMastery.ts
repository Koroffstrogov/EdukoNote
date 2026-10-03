import { isDay } from "./calendar";
import { getNotesForClefAndReadingZone, type Clef, type ReadingZone, type NoteDefinition } from "./notes";
import type { NoteProgress, ProgressState } from "./progress";

export type NoteRecall = { day: string; correct: boolean };

export function normalizeRecall(value: unknown): NoteRecall[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is NoteRecall => Boolean(item && typeof item === "object" && isDay(item.day) && typeof item.correct === "boolean"))
    .slice(-3).map(({ day, correct }) => ({ day, correct }));
}

export function isNoteMastered(note: NoteProgress | undefined): boolean {
  const recent = note?.recall ?? [];
  return !note?.needsReview && (Boolean(note?.masteredAt) || (recent.length === 3 && recent.every((answer) => answer.correct) && new Set(recent.map((answer) => answer.day)).size >= 2));
}

export function noteName(note: NoteDefinition): string {
  return `${note.answerLabel}${note.id.match(/\d+$/)?.[0] ?? ""}`;
}

export function summarizeMastery(progress: ProgressState, clef: Clef, zone: ReadingZone = "full") {
  const notes = getNotesForClefAndReadingZone(clef, zone);
  const mastered = notes.filter((note) => isNoteMastered(progress.clefs[clef].notes[note.id])).length;
  return { notes, mastered, total: notes.length, complete: mastered === notes.length };
}

export function earnedZoneBadges(progress: ProgressState, clef: Clef, at: string) {
  const previous = progress.clefs[clef].badges;
  const badges = { ...previous };
  for (const zone of ["lower", "upper", "full"] as const) {
    if (!badges[zone] && summarizeMastery(progress, clef, zone).complete) badges[zone] = at;
  }
  return Object.keys(badges).length ? badges : undefined;
}
