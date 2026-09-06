import type { RhythmPlan } from "../domain/rhythmExercise";

type WebkitAudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function createRhythmAudio(onInterrupted: () => void) {
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

  function schedule(plan: RhythmPlan) {
    if (disposed || scheduled || context.state !== "running") throw new Error("Audio not running or already scheduled");
    const startAt = context.currentTime + 0.2;
    const beatSeconds = 60 / plan.settings.tempo;
    // This short, fixed-tempo trial is scheduled entirely on the audio clock.
    // Every voice remains cancellable, including voices that have not started.
    for (const tone of plan.tones) {
      const at = startAt + tone.beat * beatSeconds;
      const model = tone.kind === "model";
      const duration = model ? Math.max(0.08, tone.duration * beatSeconds - 0.025) : 0.065;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = model ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(model ? 440 : tone.accent ? 1100 : 780, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(model ? 0.22 : 0.28, at + 0.002);
      if (model) gain.gain.setValueAtTime(0.22, at + duration - 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration - 0.01);
      oscillator.connect(gain);
      gain.connect(output);
      voices.push({ oscillator, gain });
      oscillator.start(at);
      oscillator.stop(at + duration);
    }
    scheduled = true;
    return { startAt, firstBeat: startAt + plan.responseAt * beatSeconds, beatSeconds };
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

export type RhythmAudio = ReturnType<typeof createRhythmAudio>;
