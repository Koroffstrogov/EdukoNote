/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPulseAudio } from "../audio/pulseAudio";
import { usePulseSession } from "./usePulseSession";

vi.mock("../audio/pulseAudio", () => ({ createPulseAudio: vi.fn() }));
let clockTime: number;
let frame: FrameRequestCallback | undefined;
let audio: ReturnType<typeof createPulseAudio>;
let interrupted: () => void;
beforeEach(() => {
  vi.useFakeTimers();
  clockTime = 0;
  frame = undefined;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { frame = callback; return 1; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => { frame = undefined; });
  audio = { resume: vi.fn(async () => undefined), schedule: vi.fn(() => ({ startAt: 0.2, firstBeat: 4.2, beatSeconds: 1 })), clock: vi.fn(() => clockTime), dispose: vi.fn() };
  vi.mocked(createPulseAudio).mockImplementation((onInterrupted) => { interrupted = onInterrupted; return audio; });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.clearAllMocks(); });

function tick(at: number) { act(() => { clockTime = at; frame?.(performance.now()); }); }

describe("pulse session lifecycle", () => {
  it("ignores the count-in, evaluates sixteen taps and never writes progress", async () => {
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(usePulseSession);
    await act(() => result.current.start(60));
    expect(result.current.phase).toBe("count-in");
    tick(1.2);
    act(() => result.current.tap());
    expect(result.current.tapCount).toBe(0);
    for (let beat = 0; beat < 16; beat += 1) {
      tick(4.21 + beat);
      act(() => result.current.tap());
    }
    tick(19.66);
    expect(result.current.phase).toBe("result");
    expect(result.current.result).toMatchObject({ matched: 16, missed: 0, extra: 0 });
    expect(audio.dispose).toHaveBeenCalledOnce();
    expect(storage).not.toHaveBeenCalled();
  });
  it.each(["blur", "pagehide", "hidden", "audio", "stop", "unmount"])("cancels without a result on %s", async (event) => {
    const { result, unmount } = renderHook(usePulseSession);
    await act(() => result.current.start(60));
    act(() => {
      if (event === "audio") interrupted();
      else if (event === "stop") result.current.stop();
      else if (event === "unmount") unmount();
      else if (event === "hidden") { vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden"); fireEvent(document, new Event("visibilitychange")); }
      else fireEvent(window, new Event(event));
    });
    expect(audio.dispose).toHaveBeenCalledOnce();
    expect(frame).toBeUndefined();
    if (event !== "unmount") {
      expect(result.current.phase).toBe("interrupted");
      expect(result.current.result).toBeNull();
    }
  });
  it("cannot revive a cancelled pending resume or double-start a trial", async () => {
    let resolve!: () => void;
    vi.mocked(audio.resume).mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
    const { result } = renderHook(usePulseSession);
    let pending!: Promise<void>;
    act(() => { pending = result.current.start(60); void result.current.start(90); });
    expect(createPulseAudio).toHaveBeenCalledOnce();
    act(() => result.current.stop());
    await act(async () => { resolve(); await pending; });
    expect(audio.schedule).not.toHaveBeenCalled();
    expect(result.current.phase).toBe("interrupted");
    await act(() => result.current.start(72));
    expect(audio.schedule).toHaveBeenCalledWith(72);
  });
  it("recovers from a resume failure and a five-second startup timeout", async () => {
    vi.mocked(audio.resume).mockRejectedValueOnce(new Error("unavailable"));
    const { result } = renderHook(usePulseSession);
    await act(() => result.current.start(60));
    expect(result.current.phase).toBe("error");
    vi.mocked(audio.resume).mockImplementationOnce(() => new Promise(() => undefined));
    act(() => { void result.current.start(60); });
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.phase).toBe("error");
    expect(audio.schedule).not.toHaveBeenCalled();
    expect(audio.dispose).toHaveBeenCalledTimes(2);
  });
  it("abandons the trial if rendering was stalled for over a second", async () => {
    const { result } = renderHook(usePulseSession);
    await act(() => result.current.start(60));
    act(() => vi.advanceTimersByTime(1100));
    tick(2);
    expect(result.current.phase).toBe("interrupted");
    expect(result.current.result).toBeNull();
  });
});
