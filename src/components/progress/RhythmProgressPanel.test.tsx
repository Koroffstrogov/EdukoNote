/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeRhythm, buildRhythmPlan, DEFAULT_RHYTHM_SETTINGS } from "../../domain/rhythmExercise";
import { emptyRhythmProgress, recordRhythmSession } from "../../domain/rhythmProgress";
import { RhythmProgressPanel } from "./RhythmProgressPanel";

afterEach(cleanup);
const settings = { ...DEFAULT_RHYTHM_SETTINGS, mode: "echo" as const, patternId: "R09", tempo: 60 as const, visualGuide: false, metronome: false };
const plan = buildRhythmPlan(settings);
const progress = recordRhythmSession(emptyRhythmProgress(), { id: "one", plan, result: analyzeRhythm([], 0, 1, plan), finishedAt: "2026-09-06T12:00:00.000Z" });

describe("rhythm progress controls", () => {
  it("offers the same formula and aids when resuming a previous exercise", () => {
    const practice = vi.fn();
    render(<RhythmProgressPanel progress={progress} onPractice={practice} onReset={vi.fn()} />);
    fireEvent.click(screen.getByText("Ma progression · 1 séance"));
    fireEvent.click(screen.getByRole("button", { name: /R09 · Un pas silencieux/ }));
    expect(practice).toHaveBeenCalledExactlyOnceWith(settings);
  });
  it("requires its in-app reset confirmation and returns focus to progress after resetting", () => {
    const reset = vi.fn();
    const { rerender } = render(<RhythmProgressPanel progress={progress} onPractice={vi.fn()} onReset={reset} />);
    fireEvent.click(screen.getByText("Ma progression · 1 séance"));
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser les rythmes" }));
    expect(reset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(reset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser les rythmes" }));
    fireEvent.click(screen.getByRole("button", { name: "Effacer les rythmes" }));
    rerender(<RhythmProgressPanel progress={emptyRhythmProgress()} onPractice={vi.fn()} onReset={reset} />);
    expect(reset).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(screen.getByText("Ma progression · 0 séances"));
  });
});
