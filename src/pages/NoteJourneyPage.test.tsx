// @vitest-environment jsdom
import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NoteDefinition } from "../domain/notes";
import { getNotesForClef } from "../domain/notes";
import { createEmptyProgress, PROGRESS_STORAGE_KEY, recordAnswer, type ProgressState } from "../domain/progress";
import { localDay } from "../domain/calendar";
import { PRACTICE_DAYS_STORAGE_KEY } from "../domain/practiceDays";
import { NoteJourneyPage } from "./NoteJourneyPage";
import { ExercisePage } from "./ExercisePage";

// The real notation geometry has dedicated tests; expose the displayed note here
// so this integration covers answer, persistence and reward wiring independently.
vi.mock("../components/music/StaffNote", () => ({
  StaffNote: ({ note }: { note: NoteDefinition }) => <span data-testid="displayed-note" data-answer={note.answerLabel}>{note.id}</span>,
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
  window.history.replaceState({}, "", "/journey");
  window.localStorage.clear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); window.localStorage.clear(); });

function playSeries(count: number, missFirst = false, exam = false) {
  for (let i = 0; i < count; i++) {
    const label = screen.getByTestId("displayed-note").getAttribute("data-answer")!;
    const answer = missFirst && i === 0 ? (label === "Do" ? "Ré" : "Do") : label;
    act(() => { vi.advanceTimersByTime(1000); });
    fireEvent.click(screen.getByRole("button", { name: answer }));
    if (exam) {
      expect(screen.getByRole("status").textContent).toContain("Réponse enregistrée");
      expect(screen.queryByText(/C’était|C’est /)).toBeNull();
    }
    fireEvent.click(screen.getByRole("button", { name: i === count - 1 ? "Voir le score" : "Note suivante" }));
  }
}
function storedNotes(): ProgressState { return JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY)!); }
function storedDays() { return JSON.parse(window.localStorage.getItem(PRACTICE_DAYS_STORAGE_KEY)!); }

describe("daily reading journey", () => {
  it("validates a completed day with mistakes, preserves other compartments and survives reload", () => {
    window.localStorage.setItem("edukonote.rhythmProgress.v1", "unrelated progress");
    const view = render(<StrictMode><NoteJourneyPage /></StrictMode>);
    expect(screen.getByRole("button", { name: "Entrer en scène" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Commencer mes 10 notes" }));
    expect(screen.getAllByRole("button")).toHaveLength(7);
    playSeries(10, true);
    expect(screen.getByLabelText("Score 9 sur 10")).toBeTruthy();
    expect(screen.getByText("Ta série du jour est faite !")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Belle série !" }));
    expect(storedDays()).toMatchObject({ days: [localDay()], perfectSeries: 0 });
    expect(Object.values(storedNotes().clefs.treble.notes).reduce((n, note) => n + note!.views, 0)).toBe(10);
    expect(window.localStorage.getItem("edukonote.rhythmProgress.v1")).toBe("unrelated progress");
    view.unmount();
    render(<NoteJourneyPage />);
    expect(screen.getByText("Premier jour, bravo !")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Une autre série, pour le plaisir" })).toBeTruthy();
  });

  it("rewards 10/10 and another same-day series without adding another day", () => {
    window.history.replaceState({}, "", "/journey?play=daily");
    render(<StrictMode><NoteJourneyPage /></StrictMode>);
    playSeries(10);
    expect(screen.getByText("10/10 · Une étoile de lecture !")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Rejouer la série" }));
    playSeries(10);
    expect(storedDays()).toMatchObject({ days: [localDay()], perfectSeries: 2 });
    expect(storedDays().recentSessions).toHaveLength(2);
  });

  it("awards a passport after fifteen distinct notes, with corrections withheld until the result", () => {
    let progress = createEmptyProgress();
    for (const note of getNotesForClef("treble")) {
      for (const date of ["2026-10-01T10:00:00Z", "2026-10-01T11:00:00Z", "2026-10-02T10:00:00Z"]) {
        progress = recordAnswer(progress, "treble", note.id, true, date);
      }
    }
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    render(<NoteJourneyPage />);
    fireEvent.click(screen.getByRole("button", { name: "Entrer en scène" }));
    expect(screen.getByRole("progressbar", { name: "Question 1 sur 15" })).toBeTruthy();
    playSeries(15, false, true);
    expect(screen.getByText("Passeport de lecture obtenu !")).toBeTruthy();
    const saved = storedNotes();
    expect(saved.clefs.treble.examPassedAt).toBeTruthy();
    expect(Object.values(saved.clefs.treble.notes).every((note) => note!.views === 4)).toBe(true);
    expect(saved.clefs.bass.examPassedAt).toBeUndefined();
    expect(storedDays()).toMatchObject({ days: [localDay()], perfectSeries: 1 });
  });

  it("keeps a direct exam link locked and saves independent clef and zone settings", () => {
    window.history.replaceState({}, "", "/journey?play=exam");
    render(<NoteJourneyPage />);
    expect(screen.queryByTestId("displayed-note")).toBeNull();
    expect(screen.getByRole("button", { name: "Entrer en scène" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Clé de Fa" }));
    fireEvent.click(screen.getByRole("button", { name: "Haut" }));
    fireEvent.click(screen.getByRole("button", { name: "Commencer mes 10 notes" }));
    expect(screen.getByText("Ma série du jour · Clé de Fa · Haut")).toBeTruthy();
    act(() => { window.dispatchEvent(new Event("blur")); });
    expect(screen.getByRole("heading", { name: "Une petite pause" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reprendre la série" }));
    expect(screen.getByRole("progressbar", { name: "Question 1 sur 10" })).toBeTruthy();
    expect(window.localStorage.getItem(PRACTICE_DAYS_STORAGE_KEY)).toBeNull();
  });

  it("also validates the existing ten-note challenge", () => {
    window.history.replaceState({}, "", "/exercise?mode=challenge");
    render(<StrictMode><ExercisePage /></StrictMode>);
    playSeries(10);
    expect(screen.getByText("10/10 · Une étoile de lecture !")).toBeTruthy();
    expect(storedDays()).toMatchObject({ days: [localDay()], perfectSeries: 1 });
  });

  it("warns about blocked note storage instead of promising persisted rewards", () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROGRESS_STORAGE_KEY) throw new DOMException("Quota exceeded", "QuotaExceededError");
      originalSetItem.call(this, key, value);
    });
    render(<NoteJourneyPage />);
    expect(screen.getByRole("status").textContent).toContain("sauvegarde locale est indisponible");
  });
});
