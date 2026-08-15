import { useCallback, useEffect, useRef, useState } from "react";

type WebkitAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function usePianoAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => () => {
    const context = audioContextRef.current;

    if (context && context.state !== "closed") {
      void context.close().catch(() => undefined);
    }
  }, []);

  const playFrequency = useCallback((frequency: number) => {
    if (isMuted || typeof window === "undefined") {
      return;
    }

    try {
      const AudioContextConstructor = window.AudioContext
        ?? (window as WebkitAudioWindow).webkitAudioContext;

      if (!AudioContextConstructor) {
        return;
      }

      const context = audioContextRef.current ?? new AudioContextConstructor();

      audioContextRef.current = context;

      const scheduleTone = () => {
        const now = context.currentTime;
        const masterGain = context.createGain();
        const fundamental = context.createOscillator();
        const overtone = context.createOscillator();
        const overtoneGain = context.createGain();

        fundamental.type = "triangle";
        fundamental.frequency.setValueAtTime(frequency, now);
        overtone.type = "sine";
        overtone.frequency.setValueAtTime(frequency * 2, now);
        overtoneGain.gain.setValueAtTime(0.18, now);
        masterGain.gain.setValueAtTime(0.0001, now);
        masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);

        fundamental.connect(masterGain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(masterGain);
        masterGain.connect(context.destination);
        fundamental.start(now);
        overtone.start(now);
        fundamental.stop(now + 0.65);
        overtone.stop(now + 0.65);
      };

      if (context.state === "suspended") {
        void context.resume().then(scheduleTone).catch(() => undefined);
      } else {
        scheduleTone();
      }
    } catch {
      undefined;
    }
  }, [isMuted]);

  return {
    isMuted,
    toggleMuted: () => setIsMuted((current) => !current),
    playFrequency,
  };
}
