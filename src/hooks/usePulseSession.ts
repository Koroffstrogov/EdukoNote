import { useCallback, useEffect, useRef, useState } from "react";
import { createPulseAudio, type PulseAudio } from "../audio/pulseAudio";
import { analyzePulse, COUNT_IN_BEATS, PRACTICE_BEATS, PULSE_MATCH_WINDOW, type PulseResult, type PulseTempo } from "../domain/pulse";

export type PulsePhase = "idle" | "starting" | "count-in" | "playing" | "result" | "interrupted" | "error";

export function usePulseSession() {
  const [phase, setPhase] = useState<PulsePhase>("idle");
  const [beat, setBeat] = useState(-1);
  const [tapCount, setTapCount] = useState(0);
  const [result, setResult] = useState<PulseResult | null>(null);
  const audioRef = useRef<PulseAudio | null>(null);
  const frameRef = useRef<number | null>(null);
  const startupTimeoutRef = useRef<number | null>(null);
  const timelineRef = useRef<ReturnType<PulseAudio["schedule"]> | null>(null);
  const tapsRef = useRef<number[]>([]);
  const generationRef = useRef(0);
  const busyRef = useRef(false);

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
    setResult(null);
    setBeat(-1);
    setPhase("interrupted");
  }, [dispose]);

  const start = useCallback(async (tempo: PulseTempo) => {
    if (busyRef.current) return;
    dispose();
    busyRef.current = true;
    const generation = generationRef.current;
    tapsRef.current = [];
    setTapCount(0);
    setResult(null);
    setBeat(-1);
    setPhase("starting");
    try {
      const audio = createPulseAudio(interrupt);
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
      const timeline = audio.schedule(tempo);
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
        const currentBeat = Math.floor((now - timeline.startAt) / timeline.beatSeconds);
        if (currentBeat !== previousBeat) {
          previousBeat = currentBeat;
          setBeat(currentBeat);
          if (currentBeat >= COUNT_IN_BEATS) setPhase("playing");
        }
        if (now >= timeline.firstBeat + (PRACTICE_BEATS - 1 + PULSE_MATCH_WINDOW) * timeline.beatSeconds) {
          const summary = analyzePulse(tapsRef.current, timeline.firstBeat, timeline.beatSeconds);
          dispose();
          setResult(summary);
          setPhase("result");
          return;
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
    if (position < -PULSE_MATCH_WINDOW || position > PRACTICE_BEATS - 1 + PULSE_MATCH_WINDOW) return;
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

  return { phase, beat, tapCount, result, start, tap, stop: interrupt };
}
