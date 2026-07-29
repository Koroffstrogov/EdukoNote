import { useMemo } from "react";
import {
  EmptySymbolReviewState,
  SymbolResultState,
} from "../components/exercise/SymbolExerciseStates";
import { SymbolExerciseView } from "../components/exercise/SymbolExerciseView";
import { getSymbolQuestionPool, type SymbolQuizMode } from "../domain/symbolQuiz";
import { useSymbolExerciseSession } from "../hooks/useSymbolExerciseSession";
import { useSymbolProgress } from "../hooks/useSymbolProgress";

export function SymbolExercisePage() {
  const mode = useMemo(() => readSymbolModeFromUrl(), []);
  const { progress, recordAnswer, recordRecent } = useSymbolProgress();
  const session = useSymbolExerciseSession({
    mode,
    progress,
    recordAnswer,
    recordRecent,
  });
  const reviewSymbols = mode === "review" ? getSymbolQuestionPool("review", progress) : [];

  if (mode === "review" && reviewSymbols.length === 0) {
    return <EmptySymbolReviewState />;
  }

  if (mode === "challenge" && session.challengeFinished) {
    return <SymbolResultState answers={session.answers} onRestart={session.restartChallenge} />;
  }

  return (
    <SymbolExerciseView
      mode={mode}
      question={session.question}
      selectedAnswerLabel={session.selectedAnswerLabel}
      questionNumber={session.questionNumber}
      onAnswer={session.selectAnswer}
      onNextQuestion={session.nextQuestion}
    />
  );
}

function readSymbolModeFromUrl(): SymbolQuizMode {
  const mode = new URLSearchParams(window.location.search).get("mode");

  if (mode === "challenge" || mode === "review") {
    return mode;
  }

  return "training";
}
