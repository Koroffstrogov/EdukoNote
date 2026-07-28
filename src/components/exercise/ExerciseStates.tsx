import { CLEF_LABELS, READING_ZONE_LABELS, type Clef, type ReadingZone } from "../../domain/notes";
import { getSpeedReward } from "../../domain/speed";
import { AppButton } from "../ui/AppButton";
import { AppCard } from "../ui/AppCard";
import { ExercisePageLayout } from "./ExercisePageLayout";

type EmptyReviewStateProps = {
  activeClef: Clef;
  activeReadingZone: ReadingZone;
};

export function EmptyReviewState({ activeClef, activeReadingZone }: EmptyReviewStateProps) {
  return (
    <ExercisePageLayout
      className="exercise-shell"
      eyebrow={`${CLEF_LABELS[activeClef]} · ${READING_ZONE_LABELS[activeReadingZone]}`}
      title="Aucune erreur ici"
    >
      <AppCard tone="mint">
        <h2 className="app-card__title">Bravo !</h2>
        <p className="app-card__body">Dès qu’une note sera presque trouvée, elle apparaîtra ici.</p>
        <div className="button-row">
          <AppButton href="/exercise?mode=training" tone="plum">
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

type SpeedResultStateProps = {
  score: number;
  onRestart: () => void;
};

export function SpeedResultState({ score, onRestart }: SpeedResultStateProps) {
  const reward = getSpeedReward(score);

  return (
    <ExercisePageLayout eyebrow="Vitesse" title={reward.title}>
      <AppCard tone="vanilla" className="speed-result-card">
        <span className="speed-result-card__badge" aria-hidden="true">
          {reward.badge}
        </span>
        <p className="speed-result-card__score">Score {score}</p>
        <h2 className="app-card__title">{score} notes à la suite</h2>
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
