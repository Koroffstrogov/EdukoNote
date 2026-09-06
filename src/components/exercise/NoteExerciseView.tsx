import { useEffect, useRef, type ReactNode } from "react";
import { StaffNote } from "../music/StaffNote";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { FeedbackCard } from "../ui/FeedbackCard";
import { StudioTrack } from "../ui/StudioTrack";
import {
  CLEF_LABELS,
  READING_ZONE_LABELS,
  type AnswerLabel,
  type Clef,
  type ReadingZone,
} from "../../domain/notes";
import { NOTE_CHALLENGE_LENGTH, type QuizMode, type QuizQuestion } from "../../domain/quiz";
import { ExercisePageLayout } from "./ExercisePageLayout";
import { EmptyReviewContent } from "./ExerciseStates";

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
  readingZoneControl?: ReactNode;
  readingZonePending?: boolean;
  emptyReview?: boolean;
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
  readingZoneControl,
  readingZonePending = false,
  emptyReview = false,
  question,
  selectedAnswerLabel,
  questionNumber,
  speedScore,
  speedTimeLeftMs,
  onAnswer,
  onNextQuestion,
}: NoteExerciseViewProps) {
  const isCorrect = selectedAnswerLabel === question.note.answerLabel;
  const questionTitleRef = useRef<HTMLHeadingElement>(null);
  const previousQuestionIdRef = useRef(question.id);
  const previousAnswerRef = useRef(selectedAnswerLabel);
  const hasReadingZoneControl = Boolean(readingZoneControl);

  useEffect(() => {
    // A zone change returns focus to its trigger. Only Next moves it to the question.
    if (previousQuestionIdRef.current !== question.id && (!hasReadingZoneControl || previousAnswerRef.current !== null)) {
      questionTitleRef.current?.focus();
    }

    previousQuestionIdRef.current = question.id;
    previousAnswerRef.current = selectedAnswerLabel;
  }, [question.id, selectedAnswerLabel, hasReadingZoneControl]);

  return (
    <ExercisePageLayout
      className={`exercise-shell studio-exercise aurora-exercise studio-exercise--notes studio-exercise--${mode}`}
      eyebrow={`${modeLabels[mode]} · ${CLEF_LABELS[activeClef]}${readingZoneControl ? "" : ` · ${READING_ZONE_LABELS[activeReadingZone]}`}`}
      contextAction={readingZoneControl}
    >
      {emptyReview ? (
        <section className="empty-review">
          <h1 className="page-title" ref={questionTitleRef} tabIndex={-1}>Aucune erreur ici</h1>
          <EmptyReviewContent />
        </section>
      ) : (
        <div className="exercise-layout">
          <AppCard tone="cream" className="question-card studio-score-card">
            <div className="studio-score-card__header">
              <p className="studio-overline">Session Notes · Lecture</p>
              {mode === "speed" || mode === "challenge" ? (
                <div className="exercise-meta">
                  {mode === "speed" ? (
                    <div className="studio-speed-stats">
                      <span>
                        <strong>{speedScore}</strong> points
                      </span>
                      <span className={speedTimeLeftMs <= 1000 ? "studio-speed-stats__time--urgent" : ""}>
                        <strong>{formatSpeedTime(speedTimeLeftMs)}</strong> s
                      </span>
                    </div>
                  ) : (
                    <div className="studio-question-progress">
                      <StudioTrack
                        total={NOTE_CHALLENGE_LENGTH}
                        active={questionNumber}
                        label={`Question ${questionNumber} sur ${NOTE_CHALLENGE_LENGTH}`}
                      />
                      <span aria-hidden="true">{questionNumber}/{NOTE_CHALLENGE_LENGTH}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <h1 className="question-card__title" ref={questionTitleRef} tabIndex={-1}>
              Quelle note ?
            </h1>
            <div className="studio-notation-window">
              <StaffNote note={question.note} accessibleLabel={getQuestionNoteAccessibleLabel(question.note)} />
            </div>
          </AppCard>

          <section className="exercise-action-panel">
            {selectedAnswerLabel ? (
              <div className="exercise-feedback">
                <FeedbackCard status={isCorrect ? "success" : "near"}>
                  {isCorrect ? `C’est ${question.note.answerLabel}` : `C’était ${question.note.answerLabel}`}
                </FeedbackCard>
                <AppButton className="studio-primary-action" tone="plum" autoFocus onClick={onNextQuestion}>
                  {mode === "challenge" && questionNumber >= NOTE_CHALLENGE_LENGTH
                    ? "Voir le score"
                    : "Note suivante"}
                </AppButton>
                {!isCorrect ? (
                  <p className="exercise-hint">Tu avais choisi {selectedAnswerLabel}.</p>
                ) : null}
                {readingZonePending ? (
                  <p className="exercise-hint" role="status">Zone {READING_ZONE_LABELS[activeReadingZone]} à la prochaine note.</p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="studio-answer-label">Choisis ta réponse</p>
                <div className="answer-grid" aria-label="Réponses proposées">
                  {question.choices.map((choice) => (
                    <AppButton
                      key={choice}
                      className="studio-answer-pad aurora-answer-pad"
                      tone="cream"
                      disabled={selectedAnswerLabel !== null}
                      onClick={() => onAnswer(choice)}
                    >
                      {choice}
                    </AppButton>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </ExercisePageLayout>
  );
}

function formatSpeedTime(timeLeftMs: number): string {
  return (Math.ceil(timeLeftMs / 100) / 10).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function getQuestionNoteAccessibleLabel(note: QuizQuestion["note"]): string {
  return `Note à identifier en ${CLEF_LABELS[note.clef].toLocaleLowerCase("fr-FR")}, ${describeStaffPosition(note.stepIndex)}.`;
}

function describeStaffPosition(stepIndex: number): string {
  if (stepIndex >= 0 && stepIndex <= 8) {
    if (stepIndex % 2 === 0) {
      return `sur la ligne ${stepIndex / 2 + 1} en partant du bas`;
    }

    return `dans l’interligne ${(stepIndex + 1) / 2} en partant du bas`;
  }

  const distance = stepIndex < 0 ? Math.abs(stepIndex) : stepIndex - 8;
  const direction = stepIndex < 0 ? "sous" : "au-dessus de";

  if (distance % 2 === 0) {
    return `sur la ligne supplémentaire ${distance / 2} ${direction} la portée`;
  }

  return `dans l’espace ${Math.ceil(distance / 2)} ${direction} la portée`;
}
