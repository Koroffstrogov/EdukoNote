import { dayNumber, localDay } from "./calendar";
import { ANSWER_LABELS, getNotesForClef, type Clef, type NoteDefinition, type ReadingZone } from "./notes";
import { isNoteMastered } from "./noteMastery";
import type { ProgressState } from "./progress";
import { getUnlockedTrainingNotes, type QuizQuestion } from "./quiz";

export type JourneyMode = "daily" | "fluency" | "exam";
export const JOURNEY_LABELS: Record<JourneyMode, string> = { daily: "Ma série du jour", fluency: "Lecture fluide", exam: "La petite scène" };
export type JourneyPlan = { mode: JourneyMode; clef: Clef; zone: ReadingZone; questions: QuizQuestion[]; badgesAtStart: string[] };

export function createJourneyPlan(mode: JourneyMode, progress: ProgressState, clef: Clef, zone: ReadingZone, random = Math.random, today = localDay()): JourneyPlan | null {
  let selected: NoteDefinition[] = [];
  if (mode === "exam") {
    if (!progress.clefs[clef].badges?.full) return null;
    selected = [...getNotesForClef(clef)];
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
  } else {
    const unlocked = getUnlockedTrainingNotes(clef, progress, zone);
    const known = unlocked.filter((note) => (progress.clefs[clef].notes[note.id]?.views ?? 0) > 0);
    const unseen = unlocked.filter((note) => !known.includes(note)).sort((a, b) => a.difficulty - b.difficulty);
    const pool = known.length ? [...known, ...unseen.slice(0, 2)] : unlocked;
    const priorities = new Map(pool.map((note) => {
      const stored = progress.clefs[clef].notes[note.id];
      const age = stored?.lastPracticedAt ? dayNumber(today) - dayNumber(localDay(new Date(stored.lastPracticedAt))) : 0;
      const value = stored?.needsReview ? 100 : !stored?.views ? 80 : age >= 7 ? 70 : !isNoteMastered(stored) ? 50 : 10;
      return [note.id, value + random() * 5];
    }));
    for (let index = 0; index < 10; index++) {
      const candidates = pool.filter((note) => note.id !== selected[selected.length - 1]?.id);
      const ranked = [...(candidates.length ? candidates : pool)].sort((a, b) => {
        const score = (note: NoteDefinition) => priorities.get(note.id)! - selected.filter((item) => item.id === note.id).length * 1000;
        return score(b) - score(a);
      });
      selected.push(ranked[0]);
    }
  }
  return {
    mode, clef, zone: mode === "exam" ? "full" : zone,
    badgesAtStart: Object.keys(progress.clefs[clef].badges ?? {}),
    questions: selected.map((note, index) => ({ id: `journey-${mode}-${clef}-${index}-${note.id}`, questionIndex: index + 1, note, choices: [...ANSWER_LABELS] })),
  };
}

export function medianResponseTime(times: number[]): number | null {
  const sorted = times.filter((time) => Number.isFinite(time) && time > 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
