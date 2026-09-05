/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PIANO_PROGRESS_STORAGE_KEY } from "../domain/pianoProgress";
import { ExercisePage } from "./ExercisePage";
import { PIANO_ROTATION_MEDIA_QUERY } from "./PianoExercisePage";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/exercise?mode=piano");
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Piano exercise route", () => {
  it("shows only the rotation prompt on a portrait mobile device", () => {
    stubMatchMedia(true);

    render(<ExercisePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Tourne ton appareil" })).toBeTruthy();
    expect(screen.queryByTestId("piano-keyboard")).toBeNull();
    expect(screen.getByRole("link", { name: "Quitter" }).getAttribute("href")).toBe("/piano");
  });

  it("routes to the playable landscape view and survives missing Web Audio", () => {
    stubMatchMedia(false);

    render(<ExercisePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Joue cette note" })).toBeTruthy();
    const keyboard = screen.getByTestId("piano-keyboard");
    expect(within(keyboard).getAllByRole("button")).toHaveLength(12);

    expect(() => {
      fireEvent.click(within(keyboard).getByRole("button", { name: "Do" }));
    }).not.toThrow();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(window.localStorage.getItem(PIANO_PROGRESS_STORAGE_KEY)).toBeTruthy();
  });
});

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
