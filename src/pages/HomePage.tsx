import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import { SettingsButton } from "../components/ui/SettingsButton";
import {
  ANSWER_LABELS,
  CLEF_LABELS,
  getNotesForClef,
  type AnswerLabel,
  type Clef,
  type NoteId,
} from "../domain/notes";
import { countTotalCorrect, countTotalErrors, countTotalViews, type NoteProgress } from "../domain/progress";
import { useProgress } from "../hooks/useProgress";

export function HomePage() {
  const { progress, activeClef, resetStoredProgress } = useProgress();
  const totalViews = countTotalViews(progress, activeClef);
  const totalCorrect = countTotalCorrect(progress, activeClef);
  const totalErrors = countTotalErrors(progress, activeClef);
  const progressByLabel = summarizeProgressByLabel(progress.clefs[activeClef].notes, activeClef);

  return (
    <main className="app-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <SettingsButton />
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">{CLEF_LABELS[activeClef]}</p>
      </header>

      <div className="home-layout">
        <section className="home-actions" aria-label="Actions d'accueil provisoires">
          <HomeActionCard
            title="Entraînement"
            text="Jouer maintenant."
            icon="♪"
            href="/exercise?mode=training"
            tone="rose"
          />
          <HomeActionCard
            title="Défi 10 notes"
            text="10 notes."
            icon="10"
            href="/exercise?mode=challenge"
            tone="lavender"
          />
          <HomeActionCard
            title="Révision des erreurs"
            text="Reprendre les erreurs."
            icon="↺"
            href="/exercise?mode=review"
            tone="vanilla"
          />
          <HomeActionCard
            title="Vitesse"
            text="Série rapide."
            icon="⏱"
            href="/exercise?mode=speed"
            tone="rose"
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
              {progressByLabel.map(({ label, noteProgress }) => (
                <ProgressChip
                  key={label}
                  label={`${label} ${noteProgress.correct}/${noteProgress.views}`}
                  status={getProgressStatus(noteProgress)}
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

function summarizeProgressByLabel(
  notesProgress: Partial<Record<NoteId, NoteProgress>>,
  clef: Clef,
): Array<{ label: AnswerLabel; noteProgress: NoteProgress }> {
  return ANSWER_LABELS.map((label) => {
    const noteProgress = getNotesForClef(clef).filter((note) => note.answerLabel === label).reduce(
      (summary, note) => {
        const currentProgress = notesProgress[note.id] ?? emptyNoteProgress;

        return {
          views: summary.views + currentProgress.views,
          correct: summary.correct + currentProgress.correct,
          errors: summary.errors + currentProgress.errors,
          lastPracticedAt: null,
        };
      },
      {
        views: 0,
        correct: 0,
        errors: 0,
        lastPracticedAt: null,
      } satisfies NoteProgress,
    );

    return { label, noteProgress };
  });
}

const emptyNoteProgress: NoteProgress = {
  views: 0,
  correct: 0,
  errors: 0,
  lastPracticedAt: null,
};

function getProgressStatus(noteProgress: NoteProgress): "complete" | "current" | "missed" {
  if (noteProgress.errors > noteProgress.correct) {
    return "missed";
  }

  if (noteProgress.correct > 0) {
    return "complete";
  }

  return "current";
}
