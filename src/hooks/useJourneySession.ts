import { useCallback, useEffect, useRef, useState } from "react";
import { createJourneyPlan, medianResponseTime, type JourneyMode, type JourneyPlan } from "../domain/noteJourney";
import type { AnswerLabel, Clef, NoteId, ReadingZone } from "../domain/notes";
import type { ProgressState } from "../domain/progress";
import type { ChallengeAnswer } from "../domain/quiz";

let sessionNumber = 0;
export function createNoteSessionId() { return `notes-${Date.now()}-${++sessionNumber}-${Math.random().toString(36).slice(2)}`; }
export type JourneyResult = { id: string; plan: JourneyPlan; answers: ChallengeAnswer[]; score: number; medianMs: number | null };
export type JourneyTrial = {
  id: string; plan: JourneyPlan; index: number; answers: ChallengeAnswer[]; times: number[];
  phase: "playing" | "feedback" | "result"; paused: boolean; timingValid: boolean; result: JourneyResult | null;
};
type Options = {
  progress: ProgressState;
  recordNoteAnswer: (id: NoteId, correct: boolean, clef?: Clef) => void;
  onComplete: (result: JourneyResult) => void;
};

export function useJourneySession({ progress, recordNoteAnswer, onComplete }: Options) {
  const [trial, setTrial] = useState<JourneyTrial | null>(null);
  const current = useRef(trial);
  const startedAt = useRef(0);
  const update = useCallback((next: JourneyTrial | null) => { current.current = next; setTrial(next); }, []);
  const pause = useCallback(() => {
    const state = current.current;
    if (state && state.phase !== "result" && !state.paused) update({ ...state, paused: true, timingValid: false });
  }, [update]);
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === "hidden") pause(); };
    window.addEventListener("blur", pause);
    window.addEventListener("pagehide", pause);
    document.addEventListener("visibilitychange", onHidden);
    return () => { window.removeEventListener("blur", pause); window.removeEventListener("pagehide", pause); document.removeEventListener("visibilitychange", onHidden); };
  }, [pause]);

  function start(mode: JourneyMode, clef: Clef, zone: ReadingZone) {
    if (current.current && current.current.phase !== "result") return;
    const plan = createJourneyPlan(mode, progress, clef, zone);
    if (!plan) return;
    startedAt.current = performance.now();
    update({ id: createNoteSessionId(), plan, index: 0, answers: [], times: [], phase: "playing", paused: false, timingValid: true, result: null });
  }

  function answer(label: AnswerLabel) {
    const state = current.current;
    if (!state || state.phase !== "playing" || state.paused) return;
    const question = state.plan.questions[state.index];
    if (!question.choices.includes(label)) return;
    const correct = label === question.note.answerLabel;
    const answers = [...state.answers, { questionNumber: state.index + 1, noteId: question.note.id, noteLabel: question.note.answerLabel, selectedLabel: label, isCorrect: correct }];
    const times = [...state.times, performance.now() - startedAt.current];
    const complete = answers.length === state.plan.questions.length;
    const result = complete ? {
      id: state.id, plan: state.plan, answers, score: answers.filter((item) => item.isCorrect).length,
      medianMs: state.timingValid ? medianResponseTime(times) : null,
    } : null;
    update({ ...state, answers, times, phase: "feedback", result });
    recordNoteAnswer(question.note.id, correct, state.plan.clef);
    if (result) onComplete(result);
  }

  function next() {
    const state = current.current;
    if (!state || state.phase !== "feedback" || state.paused) return;
    if (state.result) { update({ ...state, phase: "result" }); return; }
    startedAt.current = performance.now();
    update({ ...state, index: state.index + 1, phase: "playing" });
  }

  function resume() {
    const state = current.current;
    if (!state?.paused) return;
    startedAt.current = performance.now();
    update({ ...state, paused: false });
  }

  return { trial, start, answer, next, resume, close: () => update(null) };
}
