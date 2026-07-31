import { AppButton } from "../ui/AppButton";
import { StudioTrack } from "../ui/StudioTrack";
import { ExercisePageLayout } from "./ExercisePageLayout";

type ChallengeResultViewProps = {
  eyebrow: string;
  score: number;
  total: number;
  resultStates: boolean[];
  itemLabel: {
    singular: string;
    plural: string;
  };
  reviewTitle: string;
  reviewItems: string[];
  onRestart: () => void;
};

export function ChallengeResultView({
  eyebrow,
  score,
  total,
  resultStates,
  itemLabel,
  reviewTitle,
  reviewItems,
  onRestart,
}: ChallengeResultViewProps) {
  const heading = getResultHeading(score, total);

  return (
    <ExercisePageLayout
      className="studio-result-shell"
      eyebrow={eyebrow}
      navLabel="Accueil"
    >
      <div className="studio-result-layout">
        <section className="studio-result-ticket" aria-labelledby="challenge-result-title">
          <p className="studio-overline">Session terminée</p>
          <p className="studio-result-score" aria-label={`Score ${score} sur ${total}`}>
            <strong>{score}</strong>
            <span>/{total}</span>
          </p>
          <h1 className="studio-result-title" id="challenge-result-title">
            {heading}
          </h1>
          <p className="studio-result-lead">
            {score} {score === 1 ? itemLabel.singular : itemLabel.plural} sur {total}.
          </p>
          <StudioTrack
            total={total}
            results={resultStates}
            label={`${score} ${score === 1 ? "réponse juste" : "réponses justes"} sur ${total}`}
          />
          <div className="studio-result-actions">
            <AppButton className="studio-primary-action" tone="plum" onClick={onRestart}>
              Rejouer la série
            </AppButton>
            <AppButton className="studio-secondary-action" href="/" tone="cream">
              Retour aux morceaux
            </AppButton>
          </div>
        </section>

        <section className="studio-review-sheet" aria-labelledby="challenge-review-title">
          <div className="studio-section-heading">
            <div>
              <p className="studio-overline">Carnet de répétition</p>
              <h2 id="challenge-review-title">{reviewTitle}</h2>
            </div>
            <span className="studio-review-count">{reviewItems.length.toString().padStart(2, "0")}</span>
          </div>
          {reviewItems.length > 0 ? (
            <ol className="studio-review-list">
              {reviewItems.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span className="studio-review-index">{(index + 1).toString().padStart(2, "0")}</span>
                  <span>{item}</span>
                  <span className="studio-review-mark" aria-hidden="true">
                    ↺
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="studio-complete-stamp">Set complet</p>
          )}
        </section>
      </div>
    </ExercisePageLayout>
  );
}

function getResultHeading(score: number, total: number): string {
  if (score === total) {
    return "Sans faute !";
  }

  if (score >= 7) {
    return "Belle série !";
  }

  if (score >= 4) {
    return "Ça prend forme";
  }

  return "On reprend doucement";
}
