// A local, lightweight struck-string approximation: bright attack, decaying harmonics.
const ENVELOPE = [
  { time: 0, level: 0.0001 },
  { time: 0.008, level: 0.14 },
  { time: 0.25, level: 0.07 },
  { time: 2, level: 0.018 },
  { time: 14, level: 0.0001 },
];

function levelAt(elapsed: number) {
  if (elapsed <= 0) return ENVELOPE[0].level;
  for (let i = 1; i < ENVELOPE.length; i++) {
    const from = ENVELOPE[i - 1], to = ENVELOPE[i];
    if (elapsed <= to.time) return from.level * (to.level / from.level) ** ((elapsed - from.time) / (to.time - from.time));
  }
  return ENVELOPE[ENVELOPE.length - 1].level;
}

export function createPianoVoice(context: BaseAudioContext, destination: AudioNode, frequency: number, onEnded: () => void) {
  const now = context.currentTime;
  const gain = context.createGain();
  const fundamental = context.createOscillator();
  const overtone = context.createOscillator();
  const overtoneGain = context.createGain();
  let released = false;
  let disposed = false;

  fundamental.type = "triangle";
  fundamental.frequency.setValueAtTime(frequency, now);
  overtone.type = "sine";
  overtone.frequency.setValueAtTime(frequency * 2, now);
  overtoneGain.gain.setValueAtTime(0.32, now);
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  gain.gain.setValueAtTime(ENVELOPE[0].level, now);
  ENVELOPE.slice(1).forEach(({ level, time }) => gain.gain.exponentialRampToValueAtTime(level, now + time));

  fundamental.connect(gain);
  overtone.connect(overtoneGain);
  overtoneGain.connect(gain);
  gain.connect(destination);
  fundamental.start(now);
  overtone.start(now);
  fundamental.stop(now + 14.1);
  overtone.stop(now + 14.1);

  function dispose() {
    if (disposed) return;
    disposed = true;
    fundamental.onended = null;
    fundamental.stop();
    overtone.stop();
    fundamental.disconnect();
    overtone.disconnect();
    overtoneGain.disconnect();
    gain.disconnect();
    onEnded();
  }
  fundamental.onended = dispose;

  function release(at = context.currentTime) {
    if (released || disposed) return;
    released = true;
    // Preserve the envelope's current level, including when released during the attack.
    if (typeof gain.gain.cancelAndHoldAtTime === "function") {
      gain.gain.cancelAndHoldAtTime(at);
    } else {
      // AudioParam.value is not the future level of an exercise one-shot.
      const value = levelAt(at - now);
      gain.gain.cancelScheduledValues(at);
      gain.gain.exponentialRampToValueAtTime(value, at);
    }
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
    fundamental.stop(at + 0.14);
    overtone.stop(at + 0.14);
  }

  return { release, dispose };
}

export type PianoVoice = ReturnType<typeof createPianoVoice>;
