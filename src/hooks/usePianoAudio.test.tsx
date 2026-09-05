/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePianoAudio } from "./usePianoAudio";

let contexts: FakeAudioContext[];
let initiallySuspended = false;
const fakeGain = () => ({ gain: { value: 0.07, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), cancelAndHoldAtTime: vi.fn(), cancelScheduledValues: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() });
const fakeOscillator = () => ({ type: "sine", frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null as (() => void) | null });
class FakeAudioContext {
  currentTime = 10;
  state = initiallySuspended ? "suspended" : "running";
  destination = {};
  oscillators: ReturnType<typeof fakeOscillator>[] = [];
  gains: ReturnType<typeof fakeGain>[] = [];
  compressor = { threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 0 }, attack: { value: 0 }, release: { value: 0 }, connect: vi.fn(), disconnect: vi.fn() };
  resumeCallbacks: (() => void)[] = [];
  resume = vi.fn(() => new Promise<void>((resolve) => this.resumeCallbacks.push(resolve)));
  close = vi.fn(() => { this.state = "closed"; return Promise.resolve(); });
  constructor() { contexts.push(this); }
  createDynamicsCompressor() { return this.compressor; }
  createGain() {
    const node = fakeGain();
    this.gains.push(node);
    return node;
  }
  createOscillator() {
    const node = fakeOscillator();
    this.oscillators.push(node);
    return node;
  }
  async finishResume() { this.state = "running"; this.resumeCallbacks.forEach((resolve) => resolve()); await Promise.resolve(); }
}

beforeEach(() => {
  contexts = [];
  initiallySuspended = false;
  vi.stubGlobal("AudioContext", FakeAudioContext);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("piano audio lifecycle", () => {
  it("schedules a struck, decaying voice and a short release without duplicating a held note", () => {
    const { result } = renderHook(usePianoAudio);
    act(() => { result.current.startNote("a", 440); result.current.startNote("a", 440); result.current.startNote("c", 261.63); });
    const context = contexts[0];
    expect(context.oscillators).toHaveLength(4);
    expect(context.oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(440, 10);
    expect(context.oscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(880, 10);
    expect(context.gains[0].gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.14, 10.008);
    expect(context.gains[0].gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.018, 12);
    act(() => result.current.stopNote("a"));
    expect(context.gains[0].gain.cancelAndHoldAtTime).toHaveBeenCalledWith(10);
    expect(context.oscillators[0].stop).toHaveBeenLastCalledWith(10.14);
    expect(context.oscillators[2].stop).toHaveBeenLastCalledWith(24.1);
    context.oscillators[0].onended?.();
    expect(context.oscillators[0].disconnect).toHaveBeenCalledOnce();
    expect(context.oscillators[1].disconnect).toHaveBeenCalledOnce();
  });

  it("cancels released requests while Safari is still resuming", async () => {
    initiallySuspended = true;
    const { result } = renderHook(usePianoAudio);
    act(() => result.current.startNote("a", 440));
    const context = contexts[0];
    expect(context.oscillators).toHaveLength(0);
    act(() => result.current.stopNote("a"));
    await act(() => context.finishResume());
    expect(context.oscillators).toHaveLength(0);
    act(() => result.current.startNote("a", 440));
    expect(context.oscillators).toHaveLength(2);
  });

  it("preserves the decaying envelope when cancelAndHoldAtTime is unavailable", () => {
    const { result } = renderHook(usePianoAudio);
    act(() => result.current.startNote("a", 440));
    const context = contexts[0];
    const gain = context.gains[0].gain;
    Object.defineProperty(gain, "cancelAndHoldAtTime", { value: undefined });
    context.currentTime = 10.48;
    act(() => result.current.stopNote("a"));
    expect(gain.cancelScheduledValues).toHaveBeenCalledWith(10.48);
    const calls = gain.exponentialRampToValueAtTime.mock.calls;
    const [level, time] = calls[calls.length - 2];
    expect(level).toBeGreaterThan(0.018);
    expect(level).toBeLessThan(0.07);
    expect(time).toBe(10.48);
  });

  it.each(["blur", "pagehide", "hidden", "mute", "unmount"])("disposes chords and release tails on %s", (event) => {
    const { result, unmount } = renderHook(usePianoAudio);
    act(() => { result.current.startNote("a", 440); result.current.startNote("c", 261.63); result.current.stopNote("c"); result.current.playFrequency(880); });
    const context = contexts[0];
    act(() => {
      if (event === "mute") result.current.toggleMuted();
      else if (event === "unmount") unmount();
      else if (event === "hidden") { vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden"); fireEvent(document, new Event("visibilitychange")); }
      else fireEvent(window, new Event(event));
    });
    expect(context.oscillators).toHaveLength(6);
    context.oscillators.forEach((oscillator) => expect(oscillator.disconnect).toHaveBeenCalledOnce());
    if (event === "unmount") expect(context.close).toHaveBeenCalledOnce();
  });

  it.each(["mute", "blur", "unmount"])("never starts a pending voice after %s", async (event) => {
    initiallySuspended = true;
    const { result, unmount } = renderHook(usePianoAudio);
    act(() => result.current.startNote("a", 440));
    const context = contexts[0];
    act(() => {
      if (event === "mute") result.current.toggleMuted();
      else if (event === "blur") fireEvent.blur(window);
      else unmount();
    });
    await act(() => context.finishResume());
    expect(context.oscillators).toHaveLength(0);
  });

  it("handles unavailable Web Audio and a rejected resume without breaking the keyboard", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const { result } = renderHook(usePianoAudio);
    expect(() => result.current.startNote("a", 440)).not.toThrow();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    initiallySuspended = true;
    act(() => result.current.startNote("a", 440));
    contexts[0].resumeCallbacks[0]();
    await act(async () => { await Promise.resolve(); });
    contexts[0].resume.mockRejectedValueOnce(new Error("interrupted"));
    await act(async () => { result.current.startNote("c", 261.63); await Promise.resolve(); });
    expect(contexts[0].oscillators).toHaveLength(0);
  });
});
