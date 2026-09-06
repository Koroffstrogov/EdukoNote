/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRhythmSession } from "../hooks/useRhythmSession";
import { RhythmsPage } from "./RhythmsPage";
import { analyzeRhythm, buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS, RHYTHM_SETTINGS_STORAGE_KEY } from "../domain/rhythmExercise";

vi.mock("../hooks/useRhythmSession", () => ({ useRhythmSession: vi.fn() }));
let session: ReturnType<typeof useRhythmSession>;
beforeEach(() => {
  window.localStorage.clear();
  session = { phase: "idle", beat: -1, tapCount: 0, plan: null, completed: null, start: vi.fn(async () => undefined), stop: vi.fn(), tap: vi.fn(), reset: vi.fn() };
  vi.mocked(useRhythmSession).mockImplementation(() => session);
  vi.stubGlobal("PointerEvent", MouseEvent);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function complete(taps: number[]) {
  const plan = buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS);
  session.phase = "result";
  session.plan = plan;
  session.completed = { id: "ui-test", plan, result: analyzeRhythm(taps, 10, 1, plan), finishedAt: "2026-09-06T12:00:00.000Z" };
}

describe("three rhythm exercises", () => {
  it("shows signed mean and median offsets only after completion", () => {
    const { rerender } = render(<RhythmsPage />);
    expect(screen.queryByText("Écart moyen")).toBeNull();
    complete([9.9, 10.98, 12.3]);
    rerender(<RhythmsPage />);
    expect(within(screen.getByText("Écart moyen").parentElement!).getByText("+60 ms")).toBeTruthy();
    expect(within(screen.getByText("Écart médian").parentElement!).getByText("-20 ms")).toBeTruthy();
  });
  it("distinguishes an empty result from an on-time tap", () => {
    complete([]);
    const { rerender } = render(<RhythmsPage />);
    expect(screen.getAllByText("—")).toHaveLength(2);
    complete([10]);
    rerender(<RhythmsPage />);
    expect(screen.getAllByText("0 ms")).toHaveLength(2);
  });
  it("persists quick settings, filters formulas by notion and restores focus on close", () => {
    render(<RhythmsPage />);
    fireEvent.click(screen.getByRole("button", { name: /Écho rythmique/ }));
    const trigger = screen.getByRole("button", { name: "Réglages · 72 bpm" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Réglages rapides" });
    fireEvent.click(within(dialog).getByRole("button", { name: "90 bpm" }));
    fireEvent.change(within(dialog).getByLabelText("Notion"), { target: { value: "rests" } });
    expect(within(dialog).getByLabelText<HTMLSelectElement>("Formule").options).toHaveLength(4);
    fireEvent.change(within(dialog).getByLabelText("Formule"), { target: { value: "R10" } });
    fireEvent.click(within(dialog).getByLabelText("Métronome pendant la formule"));
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    expect(session.start).toHaveBeenCalledWith(expect.objectContaining({ mode: "echo", tempo: 90, patternId: "R10", metronome: false }));
    expect(JSON.parse(localStorage.getItem(RHYTHM_SETTINGS_STORAGE_KEY)!)).toMatchObject({ mode: "echo", patternId: "R10" });
  });
  it("shows the score for reading and hides it before an echo response", () => {
    const { container } = render(<RhythmsPage />);
    fireEvent.click(screen.getByRole("button", { name: /Lis et frappe/ }));
    expect(container.querySelector(".rhythm-score-preview .rhythm-notation")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Écho rythmique/ }));
    expect(container.querySelector(".rhythm-score-preview")).toBeNull();
    expect(container.querySelectorAll(".rhythm-pattern")).toHaveLength(20);
  });
  it("counts pointer contacts once and ignores held keyboard repeats", () => {
    session.phase = "playing";
    session.plan = buildRhythmPlan(DEFAULT_RHYTHM_SETTINGS);
    session.beat = 4;
    render(<RhythmsPage />);
    const pad = screen.getByRole("button", { name: "Frapper le rythme" });
    fireEvent.pointerDown(pad, { button: 0 });
    fireEvent.click(pad, { detail: 1 });
    fireEvent.pointerDown(pad, { button: 2 });
    fireEvent.keyDown(pad, { key: " " });
    fireEvent.keyDown(pad, { key: " ", repeat: true });
    fireEvent.keyUp(pad, { key: " " });
    expect(session.tap).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("navigation", { name: "Choisir un exercice de rythmes" })).toBeNull();
  });
  it("stops the current attempt when opening settings and clears the old result on a change", () => {
    session.phase = "playing";
    render(<RhythmsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Réglages · 72 bpm" }));
    expect(session.stop).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "60 bpm" }));
    expect(session.reset).toHaveBeenCalledOnce();
    expect(session.start).not.toHaveBeenCalled();
  });
});
