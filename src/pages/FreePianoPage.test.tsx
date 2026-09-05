/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PIANO_PROGRESS_STORAGE_KEY } from "../domain/pianoProgress";
import { FREE_PIANO_KEYS } from "../domain/piano";
import { FreePianoPage } from "./FreePianoPage";
import { PIANO_ROTATION_MEDIA_QUERY } from "./PianoExercisePage";

const oscillatorStart = vi.fn();
const oscillatorStop = vi.fn();

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/piano/play");
  oscillatorStart.mockClear();
  oscillatorStop.mockClear();
  stubMatchMedia(false);
  vi.stubGlobal("AudioContext", FakeAudioContext);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("free piano", () => {
  it("renders two labelled octaves and can hide every visual marker", () => {
    render(<FreePianoPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Joue à ton rythme" })).toBeTruthy();
    const keyboard = screen.getByTestId("piano-keyboard");

    expect(within(keyboard).getAllByRole("button")).toHaveLength(24);
    expect(keyboard.querySelectorAll(".piano-key--white")).toHaveLength(14);
    expect(keyboard.querySelectorAll(".piano-key--black")).toHaveLength(10);
    expect(keyboard.querySelectorAll('.piano-key__label[aria-hidden="false"]')).toHaveLength(24);
    expect(within(keyboard).getByRole("button", { name: /Do4, raccourci A/ })).toBeTruthy();
    expect(within(keyboard).getByRole("button", { name: /Si5, raccourci \*/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Masquer les repères du piano" }));

    expect(keyboard.querySelectorAll('.piano-key__label[aria-hidden="true"]')).toHaveLength(24);
    expect(screen.getByRole("button", { name: "Afficher les repères du piano" })).toBeTruthy();
  });

  it("keeps simultaneous pointer notes active until each pointer ends", () => {
    render(<FreePianoPage />);

    const keyboard = screen.getByTestId("piano-keyboard");
    const doKey = within(keyboard).getByRole("button", { name: /Do4, raccourci A/ });
    const miKey = within(keyboard).getByRole("button", { name: /Mi4, raccourci T/ });

    fireEvent.pointerDown(doKey, { pointerId: 11 });
    fireEvent.pointerDown(miKey, { pointerId: 12 });

    expect(doKey.classList.contains("piano-key--active")).toBe(true);
    expect(miKey.classList.contains("piano-key--active")).toBe(true);
    expect(oscillatorStart).toHaveBeenCalledTimes(4);
    oscillatorStop.mockClear();

    fireEvent.pointerUp(doKey, { pointerId: 11 });
    expect(doKey.classList.contains("piano-key--active")).toBe(false);
    expect(miKey.classList.contains("piano-key--active")).toBe(true);

    fireEvent.pointerCancel(miKey, { pointerId: 12 });
    expect(miKey.classList.contains("piano-key--active")).toBe(false);
    expect(oscillatorStop).toHaveBeenCalledTimes(4);
    expect(window.localStorage.getItem(PIANO_PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("handles AZERTY chords, ignores repeats and releases all notes on blur or mute", () => {
    render(<FreePianoPage />);

    const do4 = document.querySelector<HTMLElement>('[data-piano-key="c-4"]');
    const do5 = document.querySelector<HTMLElement>('[data-piano-key="c-5"]');

    fireEvent.keyDown(window, { code: "KeyQ", key: "a" });
    fireEvent.keyDown(window, { code: "KeyQ", key: "a", repeat: true });
    fireEvent.keyDown(window, { code: "KeyA", key: "q" });

    expect(do4?.classList.contains("piano-key--active")).toBe(true);
    expect(do5?.classList.contains("piano-key--active")).toBe(true);
    expect(oscillatorStart).toHaveBeenCalledTimes(4);

    fireEvent.keyUp(window, { code: "KeyQ", key: "a" });
    expect(do4?.classList.contains("piano-key--active")).toBe(false);
    expect(do5?.classList.contains("piano-key--active")).toBe(true);

    fireEvent.blur(window);
    expect(do5?.classList.contains("piano-key--active")).toBe(false);

    fireEvent.keyDown(window, { code: "KeyQ", key: "a" });
    fireEvent.click(screen.getByRole("button", { name: "Couper le son du piano" }));
    expect(do4?.classList.contains("piano-key--active")).toBe(false);
    expect(screen.getByRole("button", { name: "Activer le son du piano" })).toBeTruthy();
  });

  it("ignores shortcuts typed in an editable field", () => {
    render(<FreePianoPage />);
    const input = document.createElement("input");
    document.body.append(input);

    fireEvent.keyDown(input, { code: "KeyQ", key: "a" });

    expect(document.querySelector('[data-piano-key="c-4"]')?.classList.contains("piano-key--active"))
      .toBe(false);
    expect(oscillatorStart).not.toHaveBeenCalled();
    input.remove();
  });

  it.each(FREE_PIANO_KEYS)("plays and releases the AZERTY shortcut $shortcut ($id)", (key) => {
    render(<FreePianoPage />);
    const button = document.querySelector(`[data-piano-key="${key.id}"]`)!;
    fireEvent.keyDown(window, { code: key.keyboardCode });
    fireEvent.keyDown(window, { code: key.keyboardCode, repeat: true });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(oscillatorStart).toHaveBeenCalledTimes(2);
    fireEvent.keyUp(window, { code: key.keyboardCode });
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it.each(["shiftKey", "altKey", "ctrlKey", "metaKey"])("ignores %s combinations", (modifier) => {
    render(<FreePianoPage />);
    fireEvent.keyDown(window, { code: "KeyQ", [modifier]: true });
    expect(oscillatorStart).not.toHaveBeenCalled();
  });

  it("keeps a shared note sounding when only one of its input sources is released", () => {
    render(<FreePianoPage />);
    const key = document.querySelector('[data-piano-key="c-4"]')!;
    fireEvent.pointerDown(key, { pointerId: 1 });
    fireEvent.pointerDown(key, { pointerId: 2 });
    fireEvent.keyDown(window, { code: "KeyQ" });
    expect(oscillatorStart).toHaveBeenCalledTimes(2);
    oscillatorStop.mockClear();
    fireEvent.pointerUp(key, { pointerId: 1 });
    fireEvent.keyUp(window, { code: "KeyQ" });
    expect(key.getAttribute("aria-pressed")).toBe("true");
    expect(oscillatorStop).not.toHaveBeenCalled();
    fireEvent.lostPointerCapture(key, { pointerId: 2 });
    expect(key.getAttribute("aria-pressed")).toBe("false");
    expect(oscillatorStop).toHaveBeenCalledTimes(2);
  });

  it("glides between visible keys, silences outside, and does not resurrect a gesture after blur", () => {
    render(<FreePianoPage />);
    const white = document.querySelector('[data-piano-key="c-4"]')!;
    const black = document.querySelector('[data-piano-key="c-sharp-4"]')!;
    const hitTest = vi.fn().mockReturnValue(black);
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: hitTest });
    const keyboard = screen.getByTestId("piano-keyboard");
    fireEvent.pointerDown(white, { pointerId: 3 });
    fireEvent.pointerMove(keyboard, { pointerId: 3, clientX: 30, clientY: 30 });
    expect(white.getAttribute("aria-pressed")).toBe("false");
    expect(black.getAttribute("aria-pressed")).toBe("true");
    hitTest.mockReturnValue(null);
    fireEvent.pointerMove(keyboard, { pointerId: 3 });
    expect(black.getAttribute("aria-pressed")).toBe("false");
    hitTest.mockReturnValue(white);
    fireEvent.pointerMove(keyboard, { pointerId: 3 });
    expect(white.getAttribute("aria-pressed")).toBe("true");
    fireEvent.blur(window);
    hitTest.mockReturnValue(black);
    fireEvent.pointerMove(keyboard, { pointerId: 3 });
    expect(document.querySelector(".piano-key--active")).toBeNull();
    Reflect.deleteProperty(document, "elementFromPoint");
  });

  it("zooms to one octave, stops held notes, and resets session preferences on remount", () => {
    const { unmount } = render(<FreePianoPage />);
    fireEvent.keyDown(window, { code: "KeyQ" });
    fireEvent.click(screen.getByRole("button", { name: "Agrandir les touches" }));
    expect(document.querySelectorAll(".piano-key")).toHaveLength(12);
    expect(document.querySelector(".piano-key--active")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Do5–Si5" }));
    fireEvent.keyDown(window, { code: "KeyQ" });
    expect(document.querySelector(".piano-key--active")).toBeNull();
    fireEvent.keyDown(window, { code: "KeyA" });
    expect(document.querySelector('[data-piano-key="c-5"]')?.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Masquer les repères du piano" }));
    unmount();
    render(<FreePianoPage />);
    expect(document.querySelectorAll(".piano-key")).toHaveLength(24);
    expect(document.querySelectorAll('.piano-key__label[aria-hidden="false"]')).toHaveLength(24);
    expect(window.localStorage.getItem(PIANO_PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("shows the shared landscape prompt on portrait mobile", () => {
    vi.unstubAllGlobals();
    stubMatchMedia(true);

    render(<FreePianoPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Tourne ton appareil" })).toBeTruthy();
    expect(screen.queryByTestId("piano-keyboard")).toBeNull();
    expect(screen.getByRole("link", { name: "Quitter" }).getAttribute("href")).toBe("/piano");
  });
});

class FakeAudioContext {
  currentTime = 1;
  state = "running";
  destination = {};

  createGain() {
    return {
      gain: {
        value: 0.22,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  createOscillator() {
    return {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: oscillatorStart,
      stop: oscillatorStop,
    };
  }

  resume() {
    return Promise.resolve();
  }

  createDynamicsCompressor() {
    return {
      threshold: {}, knee: {}, ratio: {}, attack: {}, release: {},
      connect: vi.fn(), disconnect: vi.fn(),
    };
  }

  close() {
    this.state = "closed";
    return Promise.resolve();
  }
}

function stubMatchMedia(rotationRequired: boolean) {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query === PIANO_ROTATION_MEDIA_QUERY ? rotationRequired : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}
