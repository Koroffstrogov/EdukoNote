/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyProgress, PROGRESS_STORAGE_KEY, recordAnswer, type ProgressState } from "../domain/progress";
import { createDefaultSettings, SETTINGS_STORAGE_KEY, type SettingsState } from "../domain/settings";
import { ExercisePage } from "./ExercisePage";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/exercise?mode=training");
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("quick reading-zone settings", () => {
  it("replaces an unanswered question and persists only the active clef's zone", () => {
    const settings = createDefaultSettings();
    settings.readingZones.bass = "lower";
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    render(<ExercisePage />);
    const progressBefore = readProgress();

    expect(screen.getByRole("img", { name: /sur la ligne 1 en partant du bas/ })).toBeTruthy();
    chooseZone("Haut");

    // Do5 is in the upper half; the discarded Mi4 question is not an attempt.
    expect(screen.getByRole("img", { name: /dans l’interligne 3/ })).toBeTruthy();
    expect(readProgress()).toEqual(progressBefore);
    expect(readSettings().readingZones).toEqual({ treble: "upper", bass: "lower", tenor: "full" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Zone : Haut" }));

    cleanup();
    render(<ExercisePage />);
    expect(screen.getByRole("button", { name: "Zone : Haut" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /dans l’interligne 3/ })).toBeTruthy();
  });

  it("closes with Escape, the close button, the backdrop or the current choice without changing the question", () => {
    render(<ExercisePage />);
    const questionBefore = screen.getByRole("img", { name: /Note à identifier/ }).innerHTML;
    const progressBefore = readProgress();
    const trigger = screen.getByRole("button", { name: "Zone : Tout" });

    fireEvent.click(trigger);
    let dialog = screen.getByRole("dialog", { name: "Zone de lecture" });
    expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Fermer les réglages rapides" }));
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Fermer les réglages rapides" }));
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    dialog = screen.getByRole("dialog", { name: "Zone de lecture" });
    fireEvent.click(dialog);
    expect(document.activeElement).toBe(trigger);

    chooseZone("Tout");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(screen.getByRole("img", { name: /Note à identifier/ }).innerHTML).toBe(questionBefore);
    expect(readProgress()).toEqual(progressBefore);
  });

  it("keeps the correction and attempt intact until Next, using the latest chosen zone", () => {
    render(<ExercisePage />);
    fireEvent.click(screen.getByRole("button", { name: "Mi" }));
    const progressAfterAnswer = readProgress();
    expect(progressAfterAnswer.clefs.treble.notes.mi4?.correct).toBe(1);

    chooseZone("Haut");
    chooseZone("Bas");
    chooseZone("Haut");
    expect(screen.getByText("C’est Mi")).toBeTruthy();
    expect(screen.getByRole("img", { name: /sur la ligne 1 en partant du bas/ })).toBeTruthy();
    expect(screen.getByText("Zone Haut à la prochaine note.")).toBeTruthy();
    expect(readProgress()).toEqual(progressAfterAnswer);

    fireEvent.click(screen.getByRole("button", { name: "Note suivante" }));
    expect(screen.getByRole("img", { name: /dans l’interligne 3/ })).toBeTruthy();
    expect(screen.queryByText("C’est Mi")).toBeNull();
    expect(readProgress().clefs.treble.notes).toEqual(progressAfterAnswer.clefs.treble.notes);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Quelle note ?" }));
  });

  it("lets an empty review resume in another zone without recording a phantom question", () => {
    window.history.replaceState({}, "", "/exercise?mode=review");
    const progress = recordAnswer(createEmptyProgress(), "treble", "re5", false);
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    const settings = createDefaultSettings();
    settings.readingZones.treble = "lower";
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    render(<ExercisePage />);

    expect(screen.getByRole("heading", { name: "Aucune erreur ici" })).toBeTruthy();
    chooseZone("Haut");
    expect(screen.getByRole("heading", { name: "Quelle note ?" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /sur la ligne 4 en partant du bas/ })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Zone : Haut" }));
    expect(readProgress()).toEqual(progress);

    chooseZone("Bas");
    expect(screen.getByRole("heading", { name: "Aucune erreur ici" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /Note à identifier/ })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Zone : Bas" }));
    expect(readProgress()).toEqual(progress);
  });

  it("preserves the last review correction even when the new zone is empty", () => {
    window.history.replaceState({}, "", "/exercise?mode=review");
    const progress = recordAnswer(createEmptyProgress(), "treble", "mi4", false);
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    render(<ExercisePage />);

    fireEvent.click(screen.getByRole("button", { name: "Mi" }));
    expect(screen.getByText("C’est Mi")).toBeTruthy();
    expect(readProgress().clefs.treble.notes.mi4).toMatchObject({ correct: 1, errors: 1, needsReview: false });

    chooseZone("Haut");
    expect(screen.getByText("C’est Mi")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Aucune erreur ici" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Note suivante" }));

    const emptyTitle = screen.getByRole("heading", { name: "Aucune erreur ici" });
    expect(document.activeElement).toBe(emptyTitle);
    expect(screen.getByRole("button", { name: "Zone : Haut" })).toBeTruthy();
    expect(readProgress().clefs.treble.notes.mi4).toMatchObject({ views: 2, correct: 1, errors: 1, needsReview: false });
  });

  it.each(["challenge", "speed"])("keeps quick zone settings out of %s", (mode) => {
    window.history.replaceState({}, "", `/exercise?mode=${mode}`);
    render(<ExercisePage />);
    expect(screen.queryByRole("button", { name: /^Zone :/ })).toBeNull();
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
    expect(screen.getByRole("heading", { name: "Quelle note ?" })).toBeTruthy();
  });
});

function chooseZone(name: "Bas" | "Haut" | "Tout") {
  fireEvent.click(screen.getByRole("button", { name: /^Zone :/ }));
  const dialog = screen.getByRole("dialog", { name: "Zone de lecture" });
  fireEvent.click(within(dialog).getByRole("button", { name }));
}

function readProgress(): ProgressState {
  return JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY)!);
}

function readSettings(): SettingsState {
  return JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY)!);
}
