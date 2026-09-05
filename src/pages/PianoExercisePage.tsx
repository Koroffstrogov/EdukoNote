import { PianoExerciseView } from "../components/exercise/PianoExerciseView";
import { PianoOrientationPrompt } from "../components/exercise/PianoOrientationPrompt";
import { getPianoKeyFrequency, type PianoKeyId } from "../domain/piano";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePianoAudio } from "../hooks/usePianoAudio";
import { usePianoExerciseSession } from "../hooks/usePianoExerciseSession";
import { usePianoProgress } from "../hooks/usePianoProgress";
import { useProgress } from "../hooks/useProgress";

export const PIANO_ROTATION_MEDIA_QUERY = "(orientation: portrait) and (max-width: 64rem)";

export function PianoExercisePage() {
  const { activeClef } = useProgress();
  const {
    pianoProgress,
    recordPianoAnswer,
    recordRecentPianoQuestion,
  } = usePianoProgress();
  const session = usePianoExerciseSession({
    activeClef,
    pianoProgress,
    recordPianoAnswer,
    recordRecentPianoQuestion,
  });
  const audio = usePianoAudio();
  const rotationRequired = useMediaQuery(PIANO_ROTATION_MEDIA_QUERY);

  if (rotationRequired) {
    return <PianoOrientationPrompt exitHref="/piano" />;
  }

  function handleKeyPress(keyId: PianoKeyId) {
    audio.playFrequency(getPianoKeyFrequency(activeClef, keyId));
    session.selectKey(keyId);
  }

  return (
    <PianoExerciseView
      activeClef={activeClef}
      question={session.question}
      selectedKeyId={session.selectedKeyId}
      isMuted={audio.isMuted}
      onToggleMuted={audio.toggleMuted}
      onKeyPress={handleKeyPress}
      onNextQuestion={session.nextQuestion}
    />
  );
}
