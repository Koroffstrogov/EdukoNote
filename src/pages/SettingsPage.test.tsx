/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createEmptyProgress, PROGRESS_STORAGE_KEY, recordAnswer } from "../domain/progress";
import { PIANO_PROGRESS_STORAGE_KEY, createEmptyPianoProgress, recordPianoAnswer } from "../domain/pianoProgress";
import { SettingsPage } from "./SettingsPage";
import { SETTINGS_STORAGE_KEY, type SettingsState } from "../domain/settings";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/settings");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsPage progression", () => {
  it("adds a keyboard-accessible Progression tab with reset", async () => {
    const storedProgress = recordAnswer(createEmptyProgress(), "treble", "do4", false, "2026-08-11T00:00:00.000Z");
    const storedPianoProgress = recordPianoAnswer(createEmptyPianoProgress(), "treble", "do-sharp", false, "2026-08-11T00:00:00.000Z");
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(storedProgress));
    window.localStorage.setItem(PIANO_PROGRESS_STORAGE_KEY, JSON.stringify(storedPianoProgress));

    render(<SettingsPage />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);

    fireEvent.keyDown(tabs[0], { key: "End" });

    const progressTab = screen.getByRole("tab", { name: "Progression" });
    expect(progressTab.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(progressTab);
    expect(screen.getByRole("heading", { level: 2, name: "Ta progression" })).toBeTruthy();

    const statistics = screen.getByLabelText("Statistiques de progression");
    expect(statistics.textContent).toContain("1 essai");
    expect(statistics.textContent).toContain("1 à revoir");
    expect(screen.getByRole("heading", { level: 2, name: "Progression Piano" })).toBeTruthy();
    expect(screen.getByLabelText("Statistiques Piano").textContent).toContain("1");

    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser" }));
    const confirmation = screen.getByRole("alertdialog");
    fireEvent.click(within(confirmation).getByRole("button", { name: "Confirmer la réinitialisation" }));

    await waitFor(() => expect(statistics.textContent).toContain("0 essais"));
  });
});

describe("SettingsPage reading zone", () => {
  it("shows three compact choices, explains their scope and remembers the choice per clef", () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Zone de lecture" }));

    expect(screen.getByText("Clé de Sol")).toBeTruthy();
    expect(screen.getByText(/Exercices de notes/)).toBeTruthy();
    const selector = screen.getByRole("group", { name: "Choisir la zone de lecture" });
    expect(within(selector).getAllByRole("button")).toHaveLength(3);
    expect(within(selector).getByRole("button", { name: "Tout", pressed: true })).toBeTruthy();
    fireEvent.click(within(selector).getByRole("button", { name: "Haut" }));
    expect(within(selector).getByRole("button", { name: "Haut", pressed: true })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Clé à travailler" }));
    fireEvent.click(screen.getByRole("button", { name: /Clé de Fa/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Zone de lecture" }));
    expect(screen.getByText("Clé de Fa")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tout", pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Bas" }));

    fireEvent.click(screen.getByRole("tab", { name: "Clé à travailler" }));
    fireEvent.click(screen.getByRole("button", { name: /Clé de Sol/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Zone de lecture" }));
    expect(screen.getByRole("button", { name: "Haut", pressed: true })).toBeTruthy();

    const stored: SettingsState = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY)!);
    expect(stored.readingZones).toEqual({ treble: "upper", bass: "lower", tenor: "full" });
  });
});
