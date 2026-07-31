import {
  SYMBOL_CHALLENGE_LENGTH,
  getSymbolsToReview,
  type SymbolChallengeAnswer,
} from "../../domain/symbolQuiz";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { ChallengeResultView } from "./ChallengeResultView";
import { ExercisePageLayout } from "./ExercisePageLayout";

export function EmptySymbolReviewState() {
  return (
    <ExercisePageLayout
      className="exercise-shell"
      eyebrow="Symboles · Révision"
      title="Aucune erreur ici"
    >
      <AppCard tone="mint">
        <h2 className="app-card__title">Bravo !</h2>
        <p className="app-card__body">Dès qu’un symbole sera presque trouvé, il apparaîtra ici.</p>
        <div className="button-row">
          <AppButton href="/symbols/exercise?mode=training" tone="plum">
            Entraînement
          </AppButton>
          <AppButton href="/" tone="cream">
            Retour accueil
          </AppButton>
        </div>
      </AppCard>
    </ExercisePageLayout>
  );
}

type SymbolResultStateProps = {
  answers: SymbolChallengeAnswer[];
  onRestart: () => void;
};

export function SymbolResultState({ answers, onRestart }: SymbolResultStateProps) {
  const score = answers.filter((answer) => answer.isCorrect).length;
  const symbolsToReview = getSymbolsToReview(answers);

  return (
    <ChallengeResultView
      eyebrow="Défi symboles terminé"
      score={score}
      total={SYMBOL_CHALLENGE_LENGTH}
      resultStates={answers.map((answer) => answer.isCorrect)}
      itemLabel={{ singular: "symbole reconnu", plural: "symboles reconnus" }}
      reviewTitle="Symboles à rejouer"
      reviewItems={symbolsToReview.map((answer) => answer.symbolLabel)}
      onRestart={onRestart}
    />
  );
}
