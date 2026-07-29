import { MusicSymbolDisplay } from "../music/MusicSymbolDisplay";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { FeedbackCard } from "../ui/FeedbackCard";
import { ProgressChip } from "../ui/ProgressChip";
import {
  SYMBOL_CHALLENGE_LENGTH,
  type SymbolQuizMode,
  type SymbolQuizQuestion,
} from "../../domain/symbolQuiz";
import type { ColorTokenId } from "../../theme/tokens";
import { ExercisePageLayout } from "./ExercisePageLayout";

const answerTones: ColorTokenId[] = ["rose", "lavender", "vanilla", "mint"];

const modeLabels: Record<SymbolQuizMode, string> = {
  training: "Entraînement",
  challenge: "Défi",
  review: "Révision",
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

  return (
    <ExercisePageLayout className="exercise-shell" eyebrow={`Symboles · ${modeLabels[mode]}`}>
      <div className="exercise-layout">
        <AppCard tone="sky" className="question-card symbol-question-card">
          {mode === "challenge" ? (
            <div className="exercise-meta">
              <ProgressChip
                label={`${questionNumber}/${SYMBOL_CHALLENGE_LENGTH}`}
                status="current"
              />
            </div>
          ) : null}
          <h2 className="question-card__title">Quel est ce symbole ?</h2>
          <MusicSymbolDisplay
            symbol={question.symbol}
            accessibleLabel={`Symbole musical à identifier. ${question.symbol.visualDescription}`}
          />
        </AppCard>

        <section className="exercise-action-panel" aria-live="polite">
          {selectedAnswerLabel ? (
            <div className="exercise-feedback">
              <FeedbackCard status={isCorrect ? "success" : "near"}>
                {isCorrect ? `C’est ${question.symbol.label}` : `C’était ${question.symbol.label}`}
              </FeedbackCard>
              <AppButton tone="plum" onClick={onNextQuestion}>
                {mode === "challenge" && questionNumber >= SYMBOL_CHALLENGE_LENGTH
                  ? "Voir le score"
                  : "Symbole suivant"}
              </AppButton>
              <p className="symbol-explanation">{question.symbol.shortExplanation}</p>
              {!isCorrect ? (
                <p className="exercise-hint">Tu avais choisi {selectedAnswerLabel}.</p>
              ) : null}
            </div>
          ) : (
            <div className="answer-grid" aria-label="Réponses proposées">
              {question.choices.map((choice, index) => (
                <AppButton
                  key={choice}
                  tone={getAnswerTone(choice, question.symbol.label, selectedAnswerLabel, index)}
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
  choice: string,
  correctAnswer: string,
  selectedAnswer: string | null,
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
