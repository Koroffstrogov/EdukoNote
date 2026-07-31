import { useEffect, useRef } from "react";
import { MusicSymbolDisplay } from "../music/MusicSymbolDisplay";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { FeedbackCard } from "../ui/FeedbackCard";
import { StudioTrack } from "../ui/StudioTrack";
import type { MusicSymbolFamily } from "../../domain/musicSymbols";
import {
  SYMBOL_CHALLENGE_LENGTH,
  type SymbolQuizMode,
  type SymbolQuizQuestion,
} from "../../domain/symbolQuiz";
import { ExercisePageLayout } from "./ExercisePageLayout";

const modeLabels: Record<SymbolQuizMode, string> = {
  training: "Entraînement",
  challenge: "Défi",
  review: "Révision",
};

const symbolFamilyLabels: Record<MusicSymbolFamily, string> = {
  "score-reading": "Lire une partition",
  durations: "Durées",
  rests: "Silences",
  accidentals: "Altérations",
};

type SymbolExerciseViewProps = {
  mode: SymbolQuizMode;
  question: SymbolQuizQuestion;
  selectedAnswerLabel: string | null;
  questionNumber: number;
  onAnswer: (answerLabel: string) => void;
  onNextQuestion: () => void;
};

export function SymbolExerciseView({
  mode,
  question,
  selectedAnswerLabel,
  questionNumber,
  onAnswer,
  onNextQuestion,
}: SymbolExerciseViewProps) {
  const isCorrect = selectedAnswerLabel === question.symbol.label;
  const questionTitleRef = useRef<HTMLHeadingElement>(null);
  const previousQuestionIdRef = useRef(question.id);

  useEffect(() => {
    if (previousQuestionIdRef.current !== question.id) {
      questionTitleRef.current?.focus();
    }

    previousQuestionIdRef.current = question.id;
  }, [question.id]);

  return (
    <ExercisePageLayout
      className={`exercise-shell studio-exercise studio-exercise--symbols studio-exercise--${mode}`}
      eyebrow={`Symboles · ${modeLabels[mode]}`}
    >
      <div className="exercise-layout">
        <AppCard tone="cream" className="question-card symbol-question-card studio-score-card">
          <div className="studio-score-card__header">
            <div>
              <p className="studio-overline">Piste 05 · Symboles</p>
              <p className="studio-symbol-family">{symbolFamilyLabels[question.symbol.family]}</p>
            </div>
            {mode === "challenge" ? (
              <div className="studio-question-progress">
                <StudioTrack
                  total={SYMBOL_CHALLENGE_LENGTH}
                  active={questionNumber}
                  label={`Question ${questionNumber} sur ${SYMBOL_CHALLENGE_LENGTH}`}
                />
                <span aria-hidden="true">{questionNumber}/{SYMBOL_CHALLENGE_LENGTH}</span>
              </div>
            ) : null}
          </div>
          <h1 className="question-card__title" ref={questionTitleRef} tabIndex={-1}>
            Nomme ce signe
          </h1>
          <div className="studio-notation-window studio-notation-window--symbol">
            <MusicSymbolDisplay
              symbol={question.symbol}
              accessibleLabel={`Symbole musical à identifier. ${question.symbol.visualDescription}`}
            />
          </div>
        </AppCard>

        <section className="exercise-action-panel">
          {selectedAnswerLabel ? (
            <div className="exercise-feedback">
              <FeedbackCard status={isCorrect ? "success" : "near"}>
                {isCorrect ? `C’est ${question.symbol.label}` : `C’était ${question.symbol.label}`}
              </FeedbackCard>
              <AppButton className="studio-primary-action" tone="plum" autoFocus onClick={onNextQuestion}>
                {mode === "challenge" && questionNumber >= SYMBOL_CHALLENGE_LENGTH
                  ? "Voir le score"
                  : "Symbole suivant"}
              </AppButton>
              <div className="symbol-explanation">
                <span>Note du prof</span>
                <p>{question.symbol.shortExplanation}</p>
              </div>
              {!isCorrect ? (
                <p className="exercise-hint">Tu avais choisi {selectedAnswerLabel}.</p>
              ) : null}
            </div>
          ) : (
            <>
              <p className="studio-answer-label">Choisis le bon nom</p>
              <div className="answer-grid" aria-label="Réponses proposées">
                {question.choices.map((choice) => (
                  <AppButton
                    key={choice}
                    className="studio-answer-pad"
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
    </ExercisePageLayout>
  );
}
