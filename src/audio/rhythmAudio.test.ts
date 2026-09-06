/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRhythmAudio } from "./rhythmAudio";
import { buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS } from "../domain/rhythmExercise";

const gain = () => ({ gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() });
const oscillator = () => ({ type: "", frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() });
let context: FakeContext;
class FakeContext extends EventTarget {
  currentTime = 10;
  state = "running";
  destination = {};
  baseLatency = 0.01;
  outputLatency = 0.04;
  voices: ReturnType<typeof oscillator>[] = [];
  gains: ReturnType<typeof gain>[] = [];
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => { this.state = "closed"; return Promise.resolve(); });
  getOutputTimestamp: (() => AudioTimestamp) | undefined = () => ({ contextTime: 9.95, performanceTime: 1000 });
  constructor() { super(); context = this; }
  createGain() { const node = gain(); this.gains.push(node); return node; }
  createOscillator() { const node = oscillator(); this.voices.push(node); return node; }
}
beforeEach(() => { vi.stubGlobal("AudioContext", FakeContext); vi.spyOn(performance, "now").mockReturnValue(1020); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("shared rhythm audio clock and cancellation", () => {
  it("schedules all twenty clicks against one audio timeline and cancels future voices", async () => {
    const interrupted = vi.fn();
    const audio = createRhythmAudio(interrupted);
    await audio.resume();
    const timeline = audio.schedule(buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS));
    expect(timeline.firstBeat).toBeCloseTo(10.2 + 4 * 60 / 72);
    expect(context.voices).toHaveLength(20);
    context.voices.forEach((voice, beat) => {
      const at = 10.2 + beat * 60 / 72;
      expect(voice.start.mock.calls[0][0]).toBeCloseTo(at);
      expect(voice.stop.mock.calls[0][0]).toBeCloseTo(at + 0.065);
      expect(voice.frequency.setValueAtTime).toHaveBeenCalledWith(beat % 4 === 0 ? 1100 : 780, expect.any(Number));
    });
    audio.dispose();
    audio.dispose();
    context.voices.forEach((voice) => {
      expect(voice.stop).toHaveBeenLastCalledWith();
      expect(voice.disconnect).toHaveBeenCalledOnce();
    });
    expect(context.close).toHaveBeenCalledOnce();
    context.dispatchEvent(new Event("statechange"));
    expect(interrupted).not.toHaveBeenCalled();
  });
  it("maps event timestamps to the output clock without applying output latency twice", () => {
    const audio = createRhythmAudio(vi.fn());
    expect(audio.clock()).toBeCloseTo(9.97);
    expect(audio.clock(1010)).toBeCloseTo(9.96);
    expect(audio.clock(Date.now())).toBeCloseTo(9.97);
    context.getOutputTimestamp = undefined;
    expect(audio.clock()).toBeCloseTo(9.95);
    expect(audio.clock(1010)).toBeCloseTo(9.94);
    audio.dispose();
  });
  it("signals an audio interruption only after scheduling and rejects suspended starts", () => {
    const interrupted = vi.fn();
    const audio = createRhythmAudio(interrupted);
    context.state = "suspended";
    context.dispatchEvent(new Event("statechange"));
    expect(interrupted).not.toHaveBeenCalled();
    expect(() => audio.schedule(buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS))).toThrow();
    context.state = "running";
    audio.schedule(buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS));
    context.state = "interrupted";
    context.dispatchEvent(new Event("statechange"));
    expect(interrupted).toHaveBeenCalledOnce();
    audio.dispose();
  });
  it("sustains tied model notes across bars and keeps the echo response silent without metronome", () => {
    const audio = createRhythmAudio(vi.fn());
    const plan = buildRhythmPlan({ ...DEFAULT_RHYTHM_SETTINGS, mode: "echo", patternId: "R16", tempo: 60, metronome: false });
    const timeline = audio.schedule(plan);
    expect(context.voices).toHaveLength(13); // two four-beat count-ins and five attacks
    const model = context.voices.filter((voice) => voice.type === "triangle");
    expect(model).toHaveLength(5);
    expect(model[2].start).toHaveBeenCalledWith(17.2);
    expect(model[2].stop.mock.calls[0][0]).toBeCloseTo(19.175);
    expect(context.voices.every((voice) => voice.start.mock.calls[0][0] < timeline.firstBeat)).toBe(true);
    expect(() => audio.schedule(plan)).toThrow();
    audio.dispose();
    model.forEach((voice) => expect(voice.stop).toHaveBeenLastCalledWith());
  });
  it("only plays the count-in for reading without metronome", () => {
    const audio = createRhythmAudio(vi.fn());
    const timeline = audio.schedule(buildRhythmPlan({ ...DEFAULT_RHYTHM_SETTINGS, mode: "read", patternId: "R06", tempo: 60, metronome: false }));
    expect(context.voices).toHaveLength(3);
    expect(context.voices.every((voice) => voice.type === "sine")).toBe(true);
    expect(timeline.firstBeat).toBeCloseTo(13.2);
    audio.dispose();
  });
});
