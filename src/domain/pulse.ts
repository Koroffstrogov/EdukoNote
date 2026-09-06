// Pulse is a preset of the shared rhythm engine.
import { analyzeRhythm, buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS } from "./rhythmExercise";
export { RHYTHM_TEMPOS as PULSE_TEMPOS, COUNT_IN_BEATS, PRACTICE_BEATS, MATCH_WINDOW as PULSE_MATCH_WINDOW } from "./rhythmExercise";
export type { RhythmTempo as PulseTempo, RhythmResult as PulseResult } from "./rhythmExercise";

export function analyzePulse(taps: number[], firstBeat: number, beatSeconds: number) {
  return analyzeRhythm(taps, firstBeat, beatSeconds, buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS));
}
