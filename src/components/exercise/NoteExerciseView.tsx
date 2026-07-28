import { StaffNote } from "../music/StaffNote";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { FeedbackCard } from "../ui/FeedbackCard";
import { ProgressChip } from "../ui/ProgressChip";
import {
  CLEF_LABELS,
  READING_ZONE_LABELS,
  type AnswerLabel,
  type Clef,
  type ReadingZone,
} from "../../domain/notes";
import { NOTE_CHALLENGE_LENGTH, type QuizMode, type QuizQuestion } from "../../domain/quiz";
import type { ColorTokenId } from "../../theme/tokens";
import { ExercisePageLayout } from "./ExercisePageLayout";

const answerTones: ColorTokenId[] = ["rose", "lavender", "vanilla", "mint"];

const modeLabels: Record<QuizMode, string> = {
  training: "Entraînement",
  challenge: "Défi",
  review: "Révision",
  speed: "Vitesse",
};

type NoteExerciseViewProps = {
  mode: QuizMode;
  activeClef: Clef;
  activeReadingZone: ReadingZone;
  question: QuizQuestion;
  selectedAnswerLabel: AnswerLabel | null;
  questionNumber: number;
  speedScore: number;
  speedTimeLeftMs: number;
  onAnswer: (answerLabel: AnswerLabel) => void;
  onNextQuestion: () => void;
};

export function NoteExerciseView({
  mode,
  activeClef,
  activeReadingZone,
  question,
  selectedAnswerLabel,
  questionNumber,
  speedScore,
  speedTimeLeftMs,
  onAnswer,
  onNextQuestion,
}: NoteExerciseViewProps) {
  const isCorrect = selectedAnswerLabel === question.note.answerLabel;

  return (
    <ExercisePageLayout
      className="exercise-shell"
      eyebrow={`${modeLabels[mode]} · ${CLEF_LABELS[activeClef]} · ${READING_ZONE_LABELS[activeReadingZone]}`}
    >
      <div className="exercise-layout">
        <AppCard tone="sky" className="question-card">
          {mode === "speed" || mode === "challenge" ? (
            <div className="exercise-meta">
              {mode === "speed" ? (
                <>
                  <ProgressChip label={`Score ${speedScore}`} status="current" />
                  <ProgressChip
                    label={`${formatSpeedTime(speedTimeLeftMs)}s`}
                    status={speedTimeLeftMs <= 1000 ? "missed" : "current"}
                  />
                </>
              ) : (
                <ProgressChip label={`${questionNumber}/${NOTE_CHALLENGE_LENGTH}`} status="current" />
              )}
            </div>
          ) : null}
          <h2 className="question-card__title">Quelle est cette note ?</h2>
          <StaffNote note={question.note} />
        </AppCard>

        <section className="exercise-action-panel" aria-live="polite">
          {selectedAnswerLabel ? (
            <div className="exercise-feedback">
              <FeedbackCard status={isCorrect ? "success" : "near"}>
                {isCorrect ? `C’est ${question.note.answerLabel}` : `C’était ${question.note.answerLabel}`}
              </FeedbackCard>
              <AppButton tone="plum" onClick={onNextQuestion}>
                {mode === "challenge" && questionNumber >= NOTE_CHALLENGE_LENGTH
                  ? "Voir le score"
                  : "Note suivante"}
              </AppButton>
              {!isCorrect ? (
                <p className="exercise-hint">Tu avais choisi {selectedAnswerLabel}.</p>
              ) : null}
            </div>
          ) : (
            <div className="answer-grid" aria-label="Réponses proposées">
              {question.choices.map((choice, index) => (
                <AppButton
                  key={choice}
                  tone={getAnswerTone(choice, question.note.answerLabel, selectedAnswerLabel, index)}
                  disabled={selectedAnswerLabel !== null}
                  onClick={() => onAnswer(choice)}
                >
                  {choice}
                </AppButton>
              ))}
            </div>
          )}
        </section>
      </div>
    </ExercisePageLayout>
  );
}

function getAnswerTone(
  choice: AnswerLabel,
  correctAnswer: AnswerLabel,
  selectedAnswer: AnswerLabel | null,
  index: number,
): ColorTokenId {
  if (!selectedAnswer) {
    return answerTones[index % answerTones.length];
  }

  if (choice === correctAnswer) {
    return "mint";
  }

  if (choice === selectedAnswer) {
    return "vanilla";
  }

  return "cream";
}

function formatSpeedTime(timeLeftMs: number): string {
  return (Math.ceil(timeLeftMs / 100) / 10).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
