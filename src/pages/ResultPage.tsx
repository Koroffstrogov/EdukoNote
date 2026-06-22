import { CLEF_LABELS, getOtherClef, type AnswerLabel, type Clef } from "../domain/notes";
import { type ChallengeAnswer, getNotesToReview } from "../domain/quiz";
import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { ProgressChip } from "../components/ui/ProgressChip";

export type ResultPageProps = {
  answers: ChallengeAnswer[];
  activeClef: Clef;
  onToggleClef: () => void;
  onRestart: () => void;
};

export function ResultPage({ answers, activeClef, onToggleClef, onRestart }: ResultPageProps) {
  const score = answers.filter((answer) => answer.isCorrect).length;
  const notesToReview = uniqueLabelsToReview(answers);
  const nextClef = getOtherClef(activeClef);

  return (
    <main className="app-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton tone="cream" onClick={onToggleClef} aria-label={`Passer en ${CLEF_LABELS[nextClef]}`}>
          {CLEF_LABELS[nextClef]}
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Défi terminé</p>
        <h1 className="page-title">Score {score}/10</h1>
      </header>

      <div className="styleguide-layout">
        <AppCard tone={score >= 7 ? "mint" : "vanilla"}>
          <h2 className="app-card__title">{score >= 7 ? "Bravo !" : "Presque !"}</h2>
          <p className="app-card__body">
            {score >= 7 ? "Très belle série de notes." : "Les notes à retravailler sont prêtes."}
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

        <section className="style-section" aria-labelledby="review-list-title">
          <h2 className="style-section__title" id="review-list-title">
            Notes à retravailler
          </h2>
          {notesToReview.length > 0 ? (
            <div className="chip-row">
              {notesToReview.map((label) => (
                <ProgressChip key={label} label={label} status="missed" />
              ))}
            </div>
          ) : (
            <AppCard tone="mint">
              <h3 className="app-card__title">Bravo !</h3>
              <p className="app-card__body">Aucune note à retravailler dans ce défi.</p>
            </AppCard>
          )}
        </section>
      </div>
    </main>
  );
}

function uniqueLabelsToReview(answers: ChallengeAnswer[]): AnswerLabel[] {
  return Array.from(new Set(getNotesToReview(answers).map((answer) => answer.noteLabel)));
}
