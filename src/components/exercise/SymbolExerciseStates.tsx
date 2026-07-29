import {
  SYMBOL_CHALLENGE_LENGTH,
  getSymbolsToReview,
  type SymbolChallengeAnswer,
} from "../../domain/symbolQuiz";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { ProgressChip } from "../ui/ProgressChip";
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
    <ExercisePageLayout
      eyebrow="Défi symboles terminé"
      title={`Score ${score}/${SYMBOL_CHALLENGE_LENGTH}`}
    >
      <div className="styleguide-layout">
        <AppCard tone={score >= 7 ? "mint" : "vanilla"}>
          <h2 className="app-card__title">{score >= 7 ? "Bravo !" : "Presque !"}</h2>
          <p className="app-card__body">
            {score >= 7 ? "Très belle série de symboles." : "Les symboles à revoir sont prêts."}
          </p>
          <div className="button-row">
            <AppButton tone="plum" onClick={onRestart}>
              Refaire le défi
            </AppButton>
            <AppButton href="/" tone="cream">
              Retour accueil
            </AppButton>
          </div>
        </AppCard>

        {symbolsToReview.length > 0 ? (
          <section className="style-section" aria-labelledby="symbol-review-list-title">
            <h2 className="style-section__title" id="symbol-review-list-title">
              Symboles à revoir
            </h2>
            <div className="chip-row">
              {symbolsToReview.map((answer, index) => (
                <ProgressChip
                  key={`${answer.symbolId}-${index}`}
                  label={answer.symbolLabel}
                  status="missed"
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </ExercisePageLayout>
  );
}
