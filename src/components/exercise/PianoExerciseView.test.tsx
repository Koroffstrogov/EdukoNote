/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getPianoCatalog, type PianoKeyId, type PianoQuestion } from "../../domain/piano";
import { PianoExerciseView } from "./PianoExerciseView";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PianoExerciseView", () => {
  it("renders seven white keys, five black keys and hides their visual names", () => {
    const question = createQuestion("do-sharp");
    const onKeyPress = vi.fn();

    renderView(question, null, { onKeyPress });

    const keyboard = screen.getByTestId("piano-keyboard");
    const keys = within(keyboard).getAllByRole("button");

    expect(keys).toHaveLength(12);
    expect(keyboard.querySelectorAll(".piano-key--white")).toHaveLength(7);
    expect(keyboard.querySelectorAll(".piano-key--black")).toHaveLength(5);
    expect(keyboard.querySelectorAll('.piano-key__label[aria-hidden="true"]')).toHaveLength(12);

    fireEvent.click(within(keyboard).getByRole("button", { name: "Do dièse ou Ré bémol" }));
    expect(onKeyPress).toHaveBeenCalledWith("c-sharp");
  });

  it("reveals all names and marks the correct and incorrect keys after an answer", () => {
    const question = createQuestion("re-flat");
    const { rerender } = renderView(question, null);

    rerender(createView(question, "d"));

    const keyboard = screen.getByTestId("piano-keyboard");
    expect(keyboard.querySelectorAll('.piano-key__label[aria-hidden="false"]')).toHaveLength(12);
    expect(keyboard.querySelector('[data-piano-key="c-sharp"]')?.classList.contains("piano-key--correct")).toBe(true);
    expect(keyboard.querySelector('[data-piano-key="d"]')?.classList.contains("piano-key--incorrect")).toBe(true);
    expect(screen.getByRole("status").textContent).toContain("C’était Ré♭");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Note suivante" }));
  });

  it("uses a SMuFL accidental without revealing the answer in the staff label", () => {
    const question = createQuestion("sol-flat");

    renderView(question, null);

    const staff = screen.getByRole("img", { name: /avec un bémol/ });
    expect(staff.getAttribute("aria-label")).toBeNull();
    expect(staff.textContent).not.toContain("Sol");
    expect(staff.querySelector('[data-smufl-name="accidentalFlat"]')).toBeTruthy();
  });

  it("exposes an SVG sound toggle", () => {
    const onToggleMuted = vi.fn();
    const question = createQuestion("do");
    const { rerender } = renderView(question, null, { onToggleMuted });

    const soundButton = screen.getByRole("button", { name: "Couper le son du piano" });
    expect(soundButton.querySelector("svg")).toBeTruthy();
    fireEvent.click(soundButton);
    expect(onToggleMuted).toHaveBeenCalledOnce();

    rerender(createView(question, null, { isMuted: true, onToggleMuted }));
    expect(screen.getByRole("button", { name: "Activer le son du piano" })).toBeTruthy();
  });
});

function createQuestion(spellingId: string): PianoQuestion {
  const notation = getPianoCatalog("treble").find((candidate) => candidate.id === spellingId);

  if (!notation) {
    throw new Error(`Missing test spelling: ${spellingId}`);
  }

  return {
    id: `piano-test-${spellingId}`,
    questionIndex: 1,
    notation,
  };
}

function renderView(
  question: PianoQuestion,
  selectedKeyId: Parameters<typeof createView>[1],
  overrides: Parameters<typeof createView>[2] = {},
) {
  return render(createView(question, selectedKeyId, overrides));
}

function createView(
  question: PianoQuestion,
  selectedKeyId: "c" | "d" | null,
  overrides: {
    isMuted?: boolean;
    onToggleMuted?: () => void;
    onKeyPress?: (keyId: PianoKeyId) => void;
  } = {},
) {
  return (
    <PianoExerciseView
      activeClef="treble"
      question={question}
      selectedKeyId={selectedKeyId}
      isMuted={overrides.isMuted ?? false}
      onToggleMuted={overrides.onToggleMuted ?? vi.fn()}
      onKeyPress={overrides.onKeyPress ?? vi.fn()}
      onNextQuestion={vi.fn()}
    />
  );
}
