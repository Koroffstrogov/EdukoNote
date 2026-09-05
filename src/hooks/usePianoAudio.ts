import { useCallback, useEffect, useRef, useState } from "react";
import { createPianoVoice, type PianoVoice } from "../audio/pianoSynth";

type WebkitAudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
type NoteRequest = { voice?: PianoVoice };

export function usePianoAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const mutedRef = useRef(false);
  const contextRef = useRef<AudioContext | null>(null);
  const outputRef = useRef<DynamicsCompressorNode | null>(null);
  const requestsRef = useRef(new Map<string, NoteRequest>());
  const soundingRef = useRef(new Set<PianoVoice>());
  const sequenceRef = useRef(0);

  const stopNote = useCallback((id: string) => {
    const request = requestsRef.current.get(id);
    requestsRef.current.delete(id);
    request?.voice?.release();
  }, []);

  const stopAllNotes = useCallback(() => {
    requestsRef.current.clear();
    // Also silence the short release tails and pending one-shot exercise tones.
    soundingRef.current.forEach((voice) => voice.dispose());
    soundingRef.current.clear();
  }, []);

  const requestNote = useCallback((id: string, frequency: number, oneShot = false) => {
    if (mutedRef.current || requestsRef.current.has(id) || !Number.isFinite(frequency) || frequency <= 0) return;
    try {
      const AudioConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;
      if (!AudioConstructor) return;
      if (!contextRef.current || contextRef.current.state === "closed") {
        const context = new AudioConstructor({ latencyHint: "interactive" });
        const output = context.createDynamicsCompressor();
        output.threshold.value = -12;
        output.knee.value = 12;
        output.ratio.value = 12;
        output.attack.value = 0.003;
        output.release.value = 0.16;
        output.connect(context.destination);
        contextRef.current = context;
        outputRef.current = output;
      }
      const context = contextRef.current;
      const request: NoteRequest = {};
      requestsRef.current.set(id, request);

      const play = () => {
        // Safari may finish resuming after the finger was released or the page was left.
        if (requestsRef.current.get(id) !== request || mutedRef.current || context.state !== "running") return;
        const voice = createPianoVoice(context, outputRef.current!, frequency, () => {
          soundingRef.current.delete(voice);
          if (requestsRef.current.get(id) === request) requestsRef.current.delete(id);
        });
        request.voice = voice;
        soundingRef.current.add(voice);
        if (oneShot) voice.release(context.currentTime + 0.48);
      };

      if (context.state === "running") play();
      else void context.resume().then(play).catch(() => {
        if (requestsRef.current.get(id) === request) requestsRef.current.delete(id);
      });
    } catch {
      requestsRef.current.delete(id);
    }
  }, []);

  const startNote = useCallback((id: string, frequency: number) => requestNote(id, frequency), [requestNote]);
  const playFrequency = useCallback((frequency: number) => {
    requestNote(`tone:${++sequenceRef.current}`, frequency, true);
  }, [requestNote]);
  const toggleMuted = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    stopAllNotes();
    setIsMuted(mutedRef.current);
  }, [stopAllNotes]);

  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === "hidden") stopAllNotes(); };
    window.addEventListener("blur", stopAllNotes);
    window.addEventListener("pagehide", stopAllNotes);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("blur", stopAllNotes);
      window.removeEventListener("pagehide", stopAllNotes);
      document.removeEventListener("visibilitychange", onHidden);
      stopAllNotes();
      const context = contextRef.current;
      contextRef.current = null;
      outputRef.current?.disconnect();
      outputRef.current = null;
      if (context && context.state !== "closed") void context.close().catch(() => undefined);
    };
  }, [stopAllNotes]);

  return { isMuted, toggleMuted, playFrequency, startNote, stopNote, stopAllNotes };
}
