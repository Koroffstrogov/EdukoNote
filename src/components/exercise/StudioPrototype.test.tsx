/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getSymbolById } from "../../domain/musicSymbols";
import { ANSWER_LABELS, getNoteById } from "../../domain/notes";
import type { ChallengeAnswer, QuizQuestion } from "../../domain/quiz";
import type { SymbolChallengeAnswer, SymbolQuizQuestion } from "../../domain/symbolQuiz";
import { HomePage } from "../../pages/HomePage";
import { ResultPage } from "../../pages/ResultPage";
import { NoteExerciseView } from "./NoteExerciseView";
import { SymbolResultState } from "./SymbolExerciseStates";
import { SymbolExerciseView } from "./SymbolExerciseView";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Studio des apprentis prototype", () => {
  it("presents the home page as a five-track setlist", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "On joue ?" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Setlist du jour" })).toBeTruthy();
    const destinations = [
      ["Entraînement", "/exercise?mode=training"],
      ["Défi 10 notes", "/exercise?mode=challenge"],
      ["Révision des erreurs", "/exercise?mode=review"],
      ["Vitesse", "/exercise?mode=speed"],
      ["Symboles", "/symbols"],
    ] as const;

    destinations.forEach(([name, href]) => {
      expect(screen.getByRole("link", { name: new RegExp(name) }).getAttribute("href")).toBe(href);
    });
  });

  it("keeps four neutral pads on the note exercise", () => {
    const question: QuizQuestion = {
      id: "note-prototype",
      questionIndex: 1,
      note: getNoteById("do4"),
      choices: ANSWER_LABELS.slice(0, 4),
    };

    const onAnswer = vi.fn();

    render(
      <NoteExerciseView
        mode="training"
        activeClef="treble"
        activeReadingZone="full"
        question={question}
        selectedAnswerLabel={null}
        questionNumber={1}
        speedScore={0}
        speedTimeLeftMs={5000}
        onAnswer={onAnswer}
        onNextQuestion={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Lis la note" })).toBeTruthy();
    const pads = screen.getAllByRole("button").filter((button) => button.classList.contains("studio-answer-pad"));

    expect(pads).toHaveLength(4);
    expect(document.activeElement).not.toBe(pads[0]);
    fireEvent.click(pads[2]);
    expect(onAnswer).toHaveBeenCalledOnce();
    expect(onAnswer).toHaveBeenCalledWith(question.choices[2]);
  });

  it("announces challenge progress and focuses the next action after feedback", () => {
    const question: QuizQuestion = {
      id: "note-challenge-prototype",
      questionIndex: 4,
      note: getNoteById("do4"),
      choices: ANSWER_LABELS.slice(0, 4),
    };

    const { rerender } = render(
      <NoteExerciseView
        mode="challenge"
        activeClef="treble"
        activeReadingZone="full"
        question={question}
        selectedAnswerLabel={null}
        questionNumber={4}
        speedScore={0}
        speedTimeLeftMs={5000}
        onAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
      />,
    );

    const progress = screen.getByRole("progressbar", { name: "Question 4 sur 10" });
    expect(progress.getAttribute("aria-valuenow")).toBe("4");
    expect(progress.getAttribute("aria-valuemax")).toBe("10");

    rerender(
      <NoteExerciseView
        mode="challenge"
        activeClef="treble"
        activeReadingZone="full"
        question={question}
        selectedAnswerLabel="Ré"
        questionNumber={4}
        speedScore={0}
        speedTimeLeftMs={5000}
        onAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "Note suivante" });
    expect(document.activeElement).toBe(nextButton);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(document.querySelectorAll("[aria-live]")).toHaveLength(0);

    rerender(
      <NoteExerciseView
        mode="challenge"
        activeClef="treble"
        activeReadingZone="full"
        question={{ ...question, id: "note-challenge-prototype-next", questionIndex: 5 }}
        selectedAnswerLabel={null}
        questionNumber={5}
        speedScore={0}
        speedTimeLeftMs={5000}
        onAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
      />,
    );

    const nextQuestionPads = screen.getAllByRole("button").filter((button) => button.classList.contains("studio-answer-pad"));
    expect(nextQuestionPads).toHaveLength(4);
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1, name: "Lis la note" }));
  });

  it("shows the symbol family and four answer pads", () => {
    const symbol = getSymbolById("treble-clef");
    const question: SymbolQuizQuestion = {
      id: "symbol-prototype",
      questionIndex: 1,
      symbol,
      choices: ["Clé de sol", "Clé de fa", "Clé d’ut", "Portée"],
    };

    const onAnswer = vi.fn();

    render(
      <SymbolExerciseView
        mode="training"
        question={question}
        selectedAnswerLabel={null}
        questionNumber={1}
        onAnswer={onAnswer}
        onNextQuestion={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Nomme ce signe" })).toBeTruthy();
    expect(screen.getByText("Lire une partition")).toBeTruthy();
    const pads = screen.getAllByRole("button").filter((button) => button.classList.contains("studio-answer-pad"));
    expect(pads).toHaveLength(4);
    fireEvent.click(pads[3]);
    expect(onAnswer).toHaveBeenCalledWith(question.choices[3]);
  });

  it("uses correct singular grammar and exposes the restart action on results", () => {
    const answers: ChallengeAnswer[] = Array.from({ length: 10 }, (_, index) => ({
      questionNumber: index + 1,
      noteId: "do4",
      noteLabel: "Do",
      selectedLabel: index === 0 ? "Do" : "Ré",
      isCorrect: index === 0,
    }));

    const onRestart = vi.fn();
    render(<ResultPage answers={answers} onRestart={onRestart} />);

    expect(screen.getByText("1 note trouvée sur 10.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Rejouer la série" }));
    expect(onRestart).toHaveBeenCalledOnce();
    expect(screen.getByRole("img", { name: "1 réponse juste sur 10" })).toBeTruthy();
  });

  it("uses the shared perfect-result state without a review list", () => {
    const answers: ChallengeAnswer[] = Array.from({ length: 10 }, (_, index) => ({
      questionNumber: index + 1,
      noteId: "do4",
      noteLabel: "Do",
      selectedLabel: "Do",
      isCorrect: true,
    }));

    render(<ResultPage answers={answers} onRestart={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Sans faute !" })).toBeTruthy();
    expect(screen.getByText("10 notes trouvées sur 10.")).toBeTruthy();
    expect(screen.getByText("Set complet")).toBeTruthy();
  });

  it("shares the result ticket with the symbol challenge", () => {
    const answers: SymbolChallengeAnswer[] = Array.from({ length: 10 }, (_, index) => ({
      questionNumber: index + 1,
      symbolId: "treble-clef",
      symbolLabel: "Clé de sol",
      selectedLabel: index === 0 ? "Clé de sol" : "Clé de fa",
      isCorrect: index === 0,
    }));

    render(<SymbolResultState answers={answers} onRestart={vi.fn()} />);

    expect(screen.getByText("1 symbole reconnu sur 10.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Symboles à rejouer" })).toBeTruthy();
  });
});
