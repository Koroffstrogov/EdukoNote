import { QUARTER_TICKS, RHYTHM_FIGURES, RHYTHM_PATTERNS, type RhythmPattern } from "./rhythmPatterns";

export const RHYTHM_MODES = ["pulse", "echo", "read"] as const;
export type RhythmMode = typeof RHYTHM_MODES[number];
export const RHYTHM_MODE_LABELS: Record<RhythmMode, string> = {
  pulse: "Garde la pulsation", echo: "Écho rythmique", read: "Lis et frappe",
};
export const RHYTHM_TEMPOS = [60, 72, 90] as const;
export type RhythmTempo = typeof RHYTHM_TEMPOS[number];
export const COUNT_IN_BEATS = 4;
export const PRACTICE_BEATS = 16;
export const MATCH_WINDOW = 0.45;
export type RhythmSettings = {
  mode: RhythmMode; tempo: RhythmTempo; patternId: string; visualGuide: boolean; metronome: boolean;
};
export const DEFAULT_RHYTHM_SETTINGS: RhythmSettings = { mode: "pulse", tempo: 72, patternId: "R01", visualGuide: true, metronome: true };
export const RHYTHM_SETTINGS_STORAGE_KEY = "edukonote.rhythmSettings.v1";

export function normalizeRhythmSettings(value: unknown): RhythmSettings {
  const data = value && typeof value === "object" ? value as Partial<RhythmSettings> : {};
  return {
    mode: RHYTHM_MODES.includes(data.mode!) ? data.mode! : "pulse",
    tempo: RHYTHM_TEMPOS.includes(data.tempo!) ? data.tempo! : 72,
    patternId: RHYTHM_PATTERNS.some((pattern) => pattern.id === data.patternId) ? data.patternId! : "R01",
    visualGuide: typeof data.visualGuide === "boolean" ? data.visualGuide : true,
    metronome: typeof data.metronome === "boolean" ? data.metronome : true,
  };
}
export function getRhythmPattern(id: string) { return RHYTHM_PATTERNS.find((pattern) => pattern.id === id) ?? RHYTHM_PATTERNS[0]; }

export type RhythmTone = { beat: number; duration: number; kind: "click" | "model"; accent?: boolean };
export type RhythmStage = { phase: "count-in" | "listening" | "playing"; from: number; length: number };
export type RhythmPlan = {
  settings: RhythmSettings; beatsPerBar: number; responseAt: number; responseBeats: number;
  stages: RhythmStage[]; tones: RhythmTone[]; targets: number[];
};

/** Durations merge across ties; rests advance time without creating an attack. */
export function getPatternAttacks(pattern: RhythmPattern): Array<{ beat: number; duration: number }> {
  const attacks: Array<{ beat: number; duration: number }> = [];
  let ticks = 0;
  let tied = false;
  for (const event of pattern.bars.flat()) {
    const figure = RHYTHM_FIGURES[event.figure];
    if (!("rest" in figure)) {
      if (tied && attacks.length) attacks[attacks.length - 1].duration += figure.ticks / QUARTER_TICKS;
      else attacks.push({ beat: ticks / QUARTER_TICKS, duration: figure.ticks / QUARTER_TICKS });
    }
    tied = event.tieToNext === true;
    ticks += figure.ticks;
  }
  return attacks;
}

export function buildRhythmPlan(input: RhythmSettings): RhythmPlan {
  const settings = normalizeRhythmSettings(input);
  const pattern = getRhythmPattern(settings.patternId);
  const pulse = settings.mode === "pulse";
  const beatsPerBar = pulse ? 4 : pattern.beatsPerBar;
  const countIn = pulse ? COUNT_IN_BEATS : beatsPerBar;
  const responseBeats = pulse ? PRACTICE_BEATS : pattern.bars.length * beatsPerBar;
  const attacks = pulse ? Array.from({ length: PRACTICE_BEATS }, (_, beat) => ({ beat, duration: 0.065 })) : getPatternAttacks(pattern);
  const stages: RhythmStage[] = [{ phase: "count-in", from: 0, length: countIn }];
  const tones: RhythmTone[] = [];
  const addClicks = (from: number, length: number) => {
    for (let beat = 0; beat < length; beat += 1) tones.push({ beat: from + beat, duration: 0.065, kind: "click", accent: beat % beatsPerBar === 0 });
  };
  addClicks(0, countIn);
  let responseAt = countIn;
  if (settings.mode === "echo") {
    stages.push({ phase: "listening", from: countIn, length: responseBeats });
    attacks.forEach((attack) => tones.push({ ...attack, beat: countIn + attack.beat, kind: "model" }));
    if (settings.metronome) addClicks(countIn, responseBeats);
    responseAt += responseBeats;
    stages.push({ phase: "count-in", from: responseAt, length: countIn });
    addClicks(responseAt, countIn);
    responseAt += countIn;
  }
  stages.push({ phase: "playing", from: responseAt, length: responseBeats });
  if (pulse || settings.metronome) addClicks(responseAt, responseBeats);
  return { settings, beatsPerBar, responseAt, responseBeats, stages, tones, targets: attacks.map((attack) => attack.beat) };
}

export type RhythmResult = {
  expected: number; matched: number; missed: number; extra: number;
  regularity: "steady" | "variable" | "insufficient";
  drift: "faster" | "slower" | "steady";
  intervalError: number | null; meanOffsetMs: number | null; medianOffsetMs: number | null;
  success: boolean; message: string;
};

export function analyzeRhythm(taps: number[], firstBeat: number, beatSeconds: number, plan: RhythmPlan): RhythmResult {
  const slots = new Map<number, number>();
  const targets = plan.targets;
  let extra = 0;
  for (const time of taps.filter(Number.isFinite).sort((a, b) => a - b)) {
    const position = (time - firstBeat) / beatSeconds;
    let slot = 0;
    targets.forEach((target, index) => { if (Math.abs(position - target) < Math.abs(position - targets[slot])) slot = index; });
    // Never overlap adjacent subdivisions, including sixteenths and triplets.
    const spacing = Math.min(1, slot > 0 ? targets[slot] - targets[slot - 1] : 1, slot + 1 < targets.length ? targets[slot + 1] - targets[slot] : 1);
    if (!targets.length || Math.abs(position - targets[slot]) > MATCH_WINDOW * spacing) { extra += 1; continue; }
    const previous = slots.get(slot);
    if (previous !== undefined) {
      extra += 1;
      const targetTime = firstBeat + targets[slot] * beatSeconds;
      if (Math.abs(time - targetTime) >= Math.abs(previous - targetTime)) continue;
    }
    slots.set(slot, time);
  }
  const entries = [...slots.entries()].sort((a, b) => a[0] - b[0]);
  const matched = entries.length;
  const missed = targets.length - matched;
  const offsetsMs = entries.map(([slot, time]) => (time - (firstBeat + targets[slot] * beatSeconds)) * 1000).sort((a, b) => a - b);
  const middle = Math.floor(matched / 2);
  const meanOffsetMs = matched ? offsetsMs.reduce((sum, offset) => sum + offset, 0) / matched : null;
  const medianOffsetMs = matched ? (matched % 2 ? offsetsMs[middle] : (offsetsMs[middle - 1] + offsetsMs[middle]) / 2) : null;
  const errors = entries.slice(1).map(([slot, time], index) => {
    const [previousSlot, previousTime] = entries[index];
    return (time - previousTime) / ((targets[slot] - targets[previousSlot]) * beatSeconds) - 1;
  });
  const intervalError = matched >= 4 ? errors.reduce((sum, error) => sum + Math.abs(error), 0) / errors.length : null;
  const regularity = intervalError === null ? "insufficient" : intervalError <= 0.12 ? "steady" : "variable";
  const driftValue = matched >= 8 ? (entries[matched - 1][1] - entries[0][1]) / beatSeconds - (targets[entries[matched - 1][0]] - targets[entries[0][0]]) : 0;
  const drift = driftValue < -0.25 ? "faster" : driftValue > 0.25 ? "slower" : "steady";
  const success = matched === targets.length && matched > 0 && extra === 0 && regularity !== "variable" && drift === "steady";
  const pulse = plan.settings.mode === "pulse";
  const message = matched === 0 ? (pulse ? "Écoute les quatre temps de départ, puis tape avec le son." : "Écoute le décompte, puis tape au début de chaque note.")
    : extra > 0 ? (pulse ? "Essaie une seule frappe par pulsation." : "Tape une fois par note, et garde les silences et les liaisons.")
    : missed > 0 ? (pulse ? "Garde le fil jusqu’à la dernière pulsation." : "Quelques attaques manquent. Reprends la formule tranquillement.")
    : drift === "faster" ? "Tu accélères un peu. Garde le même tempo jusqu’au bout."
    : drift === "slower" ? "Tu ralentis un peu. Garde le même tempo jusqu’au bout."
    : regularity === "variable" ? "Écoute les espaces entre les notes, puis essaie de les retrouver."
    : pulse ? "Bravo ! Tes frappes gardent une pulsation régulière." : "Bravo ! Tu as retrouvé les attaques de la formule.";
  return { expected: targets.length, matched, missed, extra, regularity, drift, intervalError, meanOffsetMs, medianOffsetMs, success, message };
}
