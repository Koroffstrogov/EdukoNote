import { useMemo } from "react";
import { EmptyReviewState, SpeedResultState } from "../components/exercise/ExerciseStates";
import { NoteExerciseView } from "../components/exercise/NoteExerciseView";
import { getReviewNotes, type QuizMode } from "../domain/quiz";
import { useNoteExerciseSession } from "../hooks/useNoteExerciseSession";
import { useProgress } from "../hooks/useProgress";
import { useSettings } from "../hooks/useSettings";
import { ResultPage } from "./ResultPage";

export function ExercisePage() {
  const mode = useMemo(() => readModeFromUrl(), []);
  const { progress, activeClef, recordNoteAnswer, recordRecentNote } = useProgress();
  const { settings } = useSettings();
  const activeReadingZone = settings.readingZones[activeClef];
  const session = useNoteExerciseSession({
    mode,
    progress,
    activeClef,
    activeReadingZone,
    recordNoteAnswer,
    recordRecentNote,
  });
  const reviewNotes = mode === "review"
    ? getReviewNotes(activeClef, progress, activeReadingZone)
    : [];

  if (mode === "review" && reviewNotes.length === 0) {
    return <EmptyReviewState activeClef={activeClef} activeReadingZone={activeReadingZone} />;
  }

  if (mode === "challenge" && session.challengeFinished) {
    return <ResultPage answers={session.answers} onRestart={session.restartChallenge} />;
  }

  if (mode === "speed" && session.speedFinished) {
    return <SpeedResultState score={session.speedScore} onRestart={session.restartSpeed} />;
  }

  return (
    <NoteExerciseView
      mode={mode}
      activeClef={activeClef}
      activeReadingZone={activeReadingZone}
      question={session.question}
      selectedAnswerLabel={session.selectedAnswerLabel}
      questionNumber={session.questionNumber}
      speedScore={session.speedScore}
      speedTimeLeftMs={session.speedTimeLeftMs}
      onAnswer={session.selectAnswer}
      onNextQuestion={session.nextQuestion}
    />
  );
}

function readModeFromUrl(): QuizMode {
  const mode = new URLSearchParams(window.location.search).get("mode");

  if (mode === "challenge" || mode === "review" || mode === "speed") {
    return mode;
  }

  return "training";
}
