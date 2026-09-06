import { COUNT_IN_BEATS, PRACTICE_BEATS, type PulseTempo } from "../domain/pulse";

type WebkitAudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function createPulseAudio(onInterrupted: () => void) {
  const AudioConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;
  if (!AudioConstructor) throw new Error("Audio unavailable");
  const context = new AudioConstructor({ latencyHint: "interactive" });
  const output = context.createGain();
  output.gain.value = 0.45;
  output.connect(context.destination);
  const voices: Array<{ oscillator: OscillatorNode; gain: GainNode }> = [];
  let disposed = false;
  let scheduled = false;

  const onStateChange = () => {
    if (!disposed && scheduled && context.state !== "running") onInterrupted();
  };
  context.addEventListener("statechange", onStateChange);

  function schedule(tempo: PulseTempo) {
    if (disposed || context.state !== "running") throw new Error("Audio not running");
    const startAt = context.currentTime + 0.2;
    const beatSeconds = 60 / tempo;
    // This short, fixed-tempo trial is scheduled entirely on the audio clock.
    // Every voice remains cancellable, including voices that have not started.
    for (let beat = 0; beat < COUNT_IN_BEATS + PRACTICE_BEATS; beat += 1) {
      const at = startAt + beat * beatSeconds;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(beat % 4 === 0 ? 1100 : 780, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.28, at + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.055);
      oscillator.connect(gain);
      gain.connect(output);
      voices.push({ oscillator, gain });
      oscillator.start(at);
      oscillator.stop(at + 0.065);
    }
    scheduled = true;
    return { startAt, firstBeat: startAt + COUNT_IN_BEATS * beatSeconds, beatSeconds };
  }

  function clock(eventTime = performance.now()) {
    const now = performance.now();
    // Modern event timestamps use performance.timeOrigin; older Safari may
    // expose epoch timestamps. In that case use dispatch time instead.
    const eventOffset = Number.isFinite(eventTime) && Math.abs(eventTime - now) < 60_000 ? (eventTime - now) / 1000 : 0;
    const stamp = context.getOutputTimestamp?.();
    if (stamp && (stamp.contextTime ?? 0) > 0 && (stamp.performanceTime ?? 0) > 0) {
      return stamp.contextTime! + (now - stamp.performanceTime!) / 1000 + eventOffset;
    }
    const latency = (context.baseLatency || 0) + (context.outputLatency || 0);
    return context.currentTime - latency + eventOffset;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    context.removeEventListener("statechange", onStateChange);
    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setValueAtTime(0, context.currentTime);
    voices.forEach(({ oscillator, gain }) => {
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
    });
    output.disconnect();
    if (context.state !== "closed") void context.close().catch(() => undefined);
  }

  return { resume: () => context.resume(), schedule, clock, dispose };
}

export type PulseAudio = ReturnType<typeof createPulseAudio>;
