import { useMemo } from "react";
import { SpeedResultState } from "../components/exercise/ExerciseStates";
import { NoteExerciseView } from "../components/exercise/NoteExerciseView";
import { ReadingZoneControl } from "../components/exercise/ReadingZoneControl";
import { getReviewNotes, type QuizMode } from "../domain/quiz";
import { useNoteExerciseSession } from "../hooks/useNoteExerciseSession";
import { useProgress } from "../hooks/useProgress";
import { useSettings } from "../hooks/useSettings";
import { ResultPage } from "./ResultPage";
import { PianoExercisePage } from "./PianoExercisePage";

export function ExercisePage() {
  const mode = useMemo(() => readModeFromUrl(), []);

  if (mode === "piano") {
    return <PianoExercisePage />;
  }

  return <NoteExercisePage mode={mode} />;
}

function NoteExercisePage({ mode }: { mode: QuizMode }) {
  const { progress, activeClef, recordNoteAnswer, recordRecentNote } = useProgress();
  const { settings, updateReadingZone } = useSettings();
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

  if (mode === "challenge" && session.challengeFinished) {
    return <ResultPage answers={session.answers} onRestart={session.restartChallenge} />;
  }

  if (mode === "speed" && session.speedFailure) {
    return (
      <SpeedResultState
        score={session.speedScore}
        failure={session.speedFailure}
        onRestart={session.restartSpeed}
      />
    );
  }

  return (
    <NoteExerciseView
      mode={mode}
      activeClef={activeClef}
      activeReadingZone={activeReadingZone}
      readingZoneControl={mode === "training" || mode === "review" ? (
        <ReadingZoneControl
          mode={mode}
          activeClef={activeClef}
          value={activeReadingZone}
          onSelect={(readingZone) => updateReadingZone(activeClef, readingZone)}
        />
      ) : undefined}
      readingZonePending={(mode === "training" || mode === "review") && session.questionReadingZone !== activeReadingZone}
      emptyReview={mode === "review" && reviewNotes.length === 0 && session.selectedAnswerLabel === null}
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

function readModeFromUrl(): QuizMode | "piano" {
  const mode = new URLSearchParams(window.location.search).get("mode");

  if (mode === "piano") {
    return mode;
  }

  if (mode === "challenge" || mode === "review" || mode === "speed") {
    return mode;
  }

  return "training";
}
