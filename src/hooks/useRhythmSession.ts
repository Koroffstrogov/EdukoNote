import { useCallback, useEffect, useRef, useState } from "react";
import { createRhythmAudio, type RhythmAudio } from "../audio/rhythmAudio";
import { analyzeRhythm, buildRhythmPlan, MATCH_WINDOW, type RhythmPlan, type RhythmResult, type RhythmSettings } from "../domain/rhythmExercise";

export type RhythmPhase = "idle" | "starting" | "count-in" | "listening" | "playing" | "result" | "interrupted" | "error";
export type CompletedRhythmSession = { id: string; plan: RhythmPlan; result: RhythmResult; finishedAt: string };

export function useRhythmSession(onComplete?: (completed: CompletedRhythmSession) => void) {
  const [phase, setPhase] = useState<RhythmPhase>("idle");
  const [beat, setBeat] = useState(-1);
  const [tapCount, setTapCount] = useState(0);
  const [completed, setCompleted] = useState<CompletedRhythmSession | null>(null);
  const [plan, setPlan] = useState<RhythmPlan | null>(null);
  const audioRef = useRef<RhythmAudio | null>(null);
  const frameRef = useRef<number | null>(null);
  const startupTimeoutRef = useRef<number | null>(null);
  const timelineRef = useRef<(ReturnType<RhythmAudio["schedule"]> & { plan: RhythmPlan }) | null>(null);
  const tapsRef = useRef<number[]>([]);
  const generationRef = useRef(0);
  const busyRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const dispose = useCallback(() => {
    generationRef.current += 1;
    busyRef.current = false;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    if (startupTimeoutRef.current !== null) window.clearTimeout(startupTimeoutRef.current);
    frameRef.current = null;
    startupTimeoutRef.current = null;
    timelineRef.current = null;
    const audio = audioRef.current;
    audioRef.current = null;
    audio?.dispose();
  }, []);

  const interrupt = useCallback(() => {
    if (!busyRef.current) return;
    dispose();
    setCompleted(null);
    setBeat(-1);
    setPhase("interrupted");
  }, [dispose]);

  const reset = useCallback(() => {
    dispose();
    setCompleted(null);
    setPlan(null);
    setTapCount(0);
    setBeat(-1);
    setPhase("idle");
  }, [dispose]);

  const start = useCallback(async (settings: RhythmSettings) => {
    if (busyRef.current) return;
    dispose();
    busyRef.current = true;
    const generation = generationRef.current;
    const trialPlan = buildRhythmPlan(settings);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tapsRef.current = [];
    setPlan(trialPlan);
    setTapCount(0);
    setCompleted(null);
    setBeat(-1);
    setPhase("starting");
    try {
      const audio = createRhythmAudio(interrupt);
      audioRef.current = audio;
      startupTimeoutRef.current = window.setTimeout(() => {
        if (generationRef.current !== generation) return;
        dispose();
        setPhase("error");
      }, 5000);
      await audio.resume();
      if (generationRef.current !== generation) return;
      window.clearTimeout(startupTimeoutRef.current!);
      startupTimeoutRef.current = null;
      const timeline = { ...audio.schedule(trialPlan), plan: trialPlan };
      timelineRef.current = timeline;
      setPhase("count-in");
      let previousBeat = -1;
      let previousFrameAt = performance.now();
      const tick = () => {
        if (generationRef.current !== generation) return;
        const frameAt = performance.now();
        if (frameAt - previousFrameAt > 1000) { interrupt(); return; }
        previousFrameAt = frameAt;
        const now = audio.clock();
        if (now >= timeline.firstBeat + trialPlan.responseBeats * timeline.beatSeconds) {
          const result = analyzeRhythm(tapsRef.current, timeline.firstBeat, timeline.beatSeconds, trialPlan);
          const summary = { id, plan: trialPlan, result, finishedAt: new Date().toISOString() };
          dispose();
          setCompleted(summary);
          setPhase("result");
          onCompleteRef.current?.(summary);
          return;
        }
        const currentBeat = Math.floor((now - timeline.startAt) / timeline.beatSeconds);
        if (currentBeat !== previousBeat) {
          previousBeat = currentBeat;
          setBeat(currentBeat);
          const stage = trialPlan.stages.find((item) => currentBeat >= item.from && currentBeat < item.from + item.length);
          setPhase(stage?.phase ?? "count-in");
        }
        frameRef.current = window.requestAnimationFrame(tick);
      };
      frameRef.current = window.requestAnimationFrame(tick);
    } catch {
      if (generationRef.current !== generation) return;
      dispose();
      setPhase("error");
    }
  }, [dispose, interrupt]);

  const tap = useCallback((eventTime?: number) => {
    const audio = audioRef.current;
    const timeline = timelineRef.current;
    if (!audio || !timeline) return;
    const time = audio.clock(eventTime);
    const position = (time - timeline.firstBeat) / timeline.beatSeconds;
    if (position < -MATCH_WINDOW || position >= timeline.plan.responseBeats) return;
    tapsRef.current.push(time);
    setTapCount(tapsRef.current.length);
  }, []);

  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === "hidden") interrupt(); };
    window.addEventListener("blur", interrupt);
    window.addEventListener("pagehide", interrupt);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("blur", interrupt);
      window.removeEventListener("pagehide", interrupt);
      document.removeEventListener("visibilitychange", onHidden);
      dispose();
    };
  }, [dispose, interrupt]);

  return { phase, beat, tapCount, plan, completed, start, tap, stop: interrupt, reset };
}
