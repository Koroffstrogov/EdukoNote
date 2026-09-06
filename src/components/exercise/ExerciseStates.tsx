import { getSpeedReward, type SpeedFailure } from "../../domain/speed";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { ExercisePageLayout } from "./ExercisePageLayout";

export function EmptyReviewContent() {
  return (
    <AppCard tone="mint">
      <h2 className="app-card__title">Bravo !</h2>
      <p className="app-card__body">Tu peux changer de zone ou continuer l’entraînement.</p>
      <div className="button-row">
        <AppButton href="/exercise?mode=training" tone="plum">
          Entraînement
        </AppButton>
        <AppButton href="/" tone="cream">
          Retour accueil
        </AppButton>
      </div>
    </AppCard>
  );
}

type SpeedResultStateProps = {
  score: number;
  failure: SpeedFailure;
  onRestart: () => void;
};

export function SpeedResultState({ score, failure, onRestart }: SpeedResultStateProps) {
  const reward = getSpeedReward(score);
  const failureTitle = failure.reason === "timeout" ? "Temps écoulé" : "Réponse incorrecte";

  return (
    <ExercisePageLayout eyebrow="Vitesse" title={failureTitle}>
      <AppCard tone="vanilla" className="speed-result-card">
        <span className="speed-result-card__badge" aria-hidden="true">
          {reward.badge}
        </span>
        <p className="speed-result-card__score">Score {score}</p>
        <h2 className="app-card__title">La bonne réponse était {failure.correctLabel}</h2>
        {failure.selectedLabel ? (
          <p className="app-card__body">Tu avais choisi {failure.selectedLabel}.</p>
        ) : (
          <p className="app-card__body">Le temps s’est écoulé avant ta réponse.</p>
        )}
        <h3 className="app-card__title">{reward.title}</h3>
        <p className="app-card__body">{reward.message}</p>
        <div className="button-row">
          <AppButton tone="plum" onClick={onRestart}>
            Rejouer
          </AppButton>
          <AppButton href="/" tone="cream">
            Retour accueil
          </AppButton>
        </div>
      </AppCard>
    </ExercisePageLayout>
  );
}
