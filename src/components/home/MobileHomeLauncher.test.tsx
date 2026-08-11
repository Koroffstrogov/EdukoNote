/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { HomePage } from "../../pages/HomePage";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query === "(max-width: 47.99rem)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("mobile Aurora home launcher", () => {
  it("shows one play action and exactly three SVG mode tiles", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "EdukoNote" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Jouer les notes en Clé de Sol" }).getAttribute("href"))
      .toBe("/exercise?mode=training");

    const activityNavigation = screen.getByRole("navigation", { name: "Choisir une activité" });
    const activityControls = activityNavigation.querySelectorAll("a, button");

    expect(activityControls).toHaveLength(3);
    expect(within(activityNavigation).getByRole("button", { name: "Notes" })).toBeTruthy();
    expect(within(activityNavigation).getByRole("link", { name: "Symboles" }).getAttribute("href")).toBe("/symbols");
    expect(within(activityNavigation).getByRole("link", { name: "Défi" }).getAttribute("href"))
      .toBe("/exercise?mode=challenge");
    expect(activityNavigation.querySelectorAll("[data-home-icon]")).toHaveLength(3);
    expect(activityNavigation.textContent).not.toMatch(/[♪↺↗♯▶→]/u);
  });

  it("opens the Notes dialog, exposes every mode and restores focus when closed", () => {
    render(<HomePage />);

    const notesButton = screen.getByRole("button", { name: "Notes" });
    fireEvent.click(notesButton);

    const dialog = screen.getByRole("dialog", { name: "Jouer les notes" });
    expect(notesButton.getAttribute("aria-expanded")).toBe("true");
    expect(within(dialog).getByRole("link", { name: /Entraînement/ }).getAttribute("href"))
      .toBe("/exercise?mode=training");
    expect(within(dialog).getByRole("link", { name: /Révision/ }).getAttribute("href"))
      .toBe("/exercise?mode=review");
    expect(within(dialog).getByRole("link", { name: /Vitesse/ }).getAttribute("href"))
      .toBe("/exercise?mode=speed");

    const closeButton = within(dialog).getByRole("button", { name: "Fermer les modes Notes" });
    expect(document.activeElement).toBe(closeButton);
    fireEvent.click(closeButton);

    expect(notesButton.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(notesButton);
  });

  it("closes the Notes dialog with Escape", () => {
    render(<HomePage />);

    const notesButton = screen.getByRole("button", { name: "Notes" });
    fireEvent.click(notesButton);

    const dialog = screen.getByRole("dialog", { name: "Jouer les notes" });
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(notesButton.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(notesButton);
  });
});
