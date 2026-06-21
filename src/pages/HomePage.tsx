import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import { NOTE_DEFINITIONS } from "../domain/notes";
import { countTotalCorrect, countTotalErrors, countTotalViews, type NoteProgress } from "../domain/progress";
import { useProgress } from "../hooks/useProgress";

export function HomePage() {
  const { progress, resetStoredProgress } = useProgress();
  const totalViews = countTotalViews(progress);
  const totalCorrect = countTotalCorrect(progress);
  const totalErrors = countTotalErrors(progress);

  return (
    <main className="app-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton href="/styleguide" tone="cream">
          Style guide
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Reconnaître les notes</p>
        <h1 className="page-title">À toi de jouer</h1>
      </header>

      <div className="home-layout">
        <section className="home-actions" aria-label="Actions d'accueil provisoires">
          <HomeActionCard
            title="Entraînement"
            text="Commencer avec Mi, Sol et Si, puis débloquer la suite."
            icon="♪"
            href="/exercise?mode=training"
            tone="rose"
          />
          <HomeActionCard
            title="Défi 10 notes"
            text="Répondre à 10 questions et voir le score final."
            icon="10"
            href="/exercise?mode=challenge"
            tone="lavender"
          />
          <HomeActionCard
            title="Révision des erreurs"
            text="Revoir en priorité les notes qui ont posé problème."
            icon="↺"
            href="/exercise?mode=review"
            tone="vanilla"
          />
        </section>

        <section className="home-summary" aria-label="Résumé de progression">
          <AppCard tone="sky">
            <h2 className="app-card__title">Progression</h2>
            <p className="app-card__body">
              {totalViews > 0
                ? `${totalCorrect} bonnes réponses, ${totalErrors} erreurs, ${totalViews} notes vues.`
                : "La progression commencera après la première réponse."}
            </p>
            <div className="chip-row">
              {NOTE_DEFINITIONS.map((note) => (
                <ProgressChip
                  key={note.id}
                  label={`${note.label} ${progress.notes[note.id].correct}/${progress.notes[note.id].views}`}
                  status={getProgressStatus(progress.notes[note.id])}
                />
              ))}
            </div>
            {totalViews > 0 ? (
              <div className="button-row">
                <AppButton tone="cream" onClick={resetStoredProgress}>
                  Réinitialiser
                </AppButton>
              </div>
            ) : null}
          </AppCard>
        </section>
      </div>
    </main>
  );
}

function getProgressStatus(noteProgress: NoteProgress): "complete" | "current" | "missed" {
  if (noteProgress.errors > noteProgress.correct) {
    return "missed";
  }

  if (noteProgress.correct > 0) {
    return "complete";
  }

  return "current";
}
