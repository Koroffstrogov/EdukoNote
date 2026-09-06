export const PULSE_TEMPOS = [60, 72, 90] as const;
export type PulseTempo = typeof PULSE_TEMPOS[number];
export const COUNT_IN_BEATS = 4;
export const PRACTICE_BEATS = 16;
export const PULSE_MATCH_WINDOW = 0.45;

export type PulseResult = {
  matched: number;
  missed: number;
  extra: number;
  regularity: "steady" | "variable" | "insufficient";
  drift: "faster" | "slower" | "steady";
  intervalError: number | null;
  message: string;
};

export function analyzePulse(taps: number[], firstBeat: number, beatSeconds: number): PulseResult {
  const slots = new Map<number, number>();
  let extra = 0;
  for (const time of taps.filter(Number.isFinite).sort((a, b) => a - b)) {
    const position = (time - firstBeat) / beatSeconds;
    const slot = Math.round(position);
    if (slot < 0 || slot >= PRACTICE_BEATS || Math.abs(position - slot) > PULSE_MATCH_WINDOW) {
      extra += 1;
      continue;
    }
    const previous = slots.get(slot);
    if (previous !== undefined) {
      extra += 1;
      const target = firstBeat + slot * beatSeconds;
      if (Math.abs(time - target) >= Math.abs(previous - target)) continue;
    }
    slots.set(slot, time);
  }

  const entries = [...slots.entries()].sort((a, b) => a[0] - b[0]);
  const matched = entries.length;
  const missed = PRACTICE_BEATS - matched;
  // Compare intervals, not absolute phase: a constant output/input delay must
  // not turn a regular series into an irregular one. Thresholds are provisional.
  const errors = entries.slice(1).map(([slot, time], index) => {
    const [previousSlot, previousTime] = entries[index];
    return ((time - previousTime) / (slot - previousSlot) - beatSeconds) / beatSeconds;
  });
  const intervalError = matched >= 4 ? errors.reduce((sum, error) => sum + Math.abs(error), 0) / errors.length : null;
  const driftValue = matched >= 8
    ? ((entries[matched - 1][1] - entries[0][1]) / beatSeconds - (entries[matched - 1][0] - entries[0][0]))
    : 0;
  const drift = driftValue < -0.25 ? "faster" : driftValue > 0.25 ? "slower" : "steady";
  const regularity = intervalError === null ? "insufficient" : intervalError <= 0.12 ? "steady" : "variable";
  const message = matched < 4 ? "Écoute les quatre temps de départ, puis tape avec le son."
    : extra > 2 ? "Essaie une seule frappe par pulsation."
    : missed > 2 ? "Garde le fil jusqu’à la dernière pulsation."
    : drift === "faster" ? "Tu accélères un peu. Laisse le son guider tes frappes."
    : drift === "slower" ? "Tu ralentis un peu. Garde le même pas jusqu’au bout."
    : regularity === "variable" ? "Écoute l’espace entre deux sons, puis essaie de le garder."
    : "Bravo ! Tes frappes gardent un rythme régulier.";
  return { matched, missed, extra, regularity, drift, intervalError, message };
}
