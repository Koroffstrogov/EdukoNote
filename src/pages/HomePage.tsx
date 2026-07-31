import { AppCard } from "../components/ui/AppCard";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { SettingsButton } from "../components/ui/SettingsButton";
import { ResetProgressControl } from "../components/ui/ResetProgressControl";
import { StudioBrand } from "../components/ui/StudioBrand";
import {
  ANSWER_LABELS,
  CLEF_LABELS,
  getNotesForClef,
  type AnswerLabel,
  type Clef,
  type NoteId,
} from "../domain/notes";
import { countTotalCorrect, countTotalViews, type NoteProgress } from "../domain/progress";
import { useProgress } from "../hooks/useProgress";

export function HomePage() {
  const { progress, activeClef, resetStoredProgress } = useProgress();
  const totalViews = countTotalViews(progress, activeClef);
  const totalCorrect = countTotalCorrect(progress, activeClef);
  const progressByLabel = summarizeProgressByLabel(progress.clefs[activeClef].notes, activeClef);
  const notesToReview = progressByLabel.filter(({ noteProgress }) => noteProgress.needsReview).length;

  return (
    <main className="app-shell studio-shell studio-home">
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <SettingsButton />
      </nav>

      <header className="studio-home-hero">
        <div className="studio-home-hero__copy">
          <p className="studio-overline">Au programme · {CLEF_LABELS[activeClef]}</p>
          <h1>On joue ?</h1>
          <p>Choisis une piste et lance la répétition.</p>
        </div>
        <div className="studio-home-poster" aria-hidden="true">
          <span className="studio-home-poster__number">01</span>
          <span className="studio-home-poster__note">♪</span>
        </div>
      </header>

      <div className="home-layout studio-home-layout">
        <section className="home-actions studio-setlist" aria-labelledby="home-setlist-title">
          <div className="studio-section-heading studio-setlist__heading">
            <div>
              <p className="studio-overline">Ta séance</p>
              <h2 id="home-setlist-title">Setlist du jour</h2>
            </div>
            <span>5 pistes</span>
          </div>
          <HomeActionCard
            title="Entraînement"
            text="Échauffement libre"
            icon="01"
            href="/exercise?mode=training"
            tone="rose"
            featured
          />
          <HomeActionCard
            title="Défi 10 notes"
            text="Le morceau du jour"
            icon="02"
            href="/exercise?mode=challenge"
            tone="lavender"
          />
          <HomeActionCard
            title="Révision des erreurs"
            text="Rejoue les passages"
            icon="03"
            href="/exercise?mode=review"
            tone="vanilla"
          />
          <HomeActionCard
            title="Vitesse"
            text="Tiens le tempo"
            icon="04"
            href="/exercise?mode=speed"
            tone="rose"
          />
          <HomeActionCard
            title="Symboles"
            text="Le dico musical"
            icon="05"
            href="/symbols"
            tone="lavender"
          />
        </section>

        <section className="home-summary" aria-labelledby="home-progress-title">
          <AppCard tone="cream" className="home-progress-card studio-progress-card">
            <div className="studio-section-heading">
              <div>
                <p className="studio-overline">Tes répétitions</p>
                <h2 id="home-progress-title">Carnet de musique</h2>
              </div>
              <span className="studio-progress-card__edition">Nº 01</span>
            </div>
            <p className="studio-progress-card__lead">
              {totalViews > 0 ? "Ta partition se complète à chaque essai." : "Ta première mesure t’attend."}
            </p>
            <div className="studio-home-stats" aria-label="Statistiques de progression">
              <span><strong>{totalCorrect}</strong> trouvées</span>
              <span><strong>{notesToReview}</strong> à revoir</span>
              <span><strong>{totalViews}</strong> essais</span>
            </div>
            <div className="studio-note-ledger" role="list" aria-label="Maîtrise des notes">
              {progressByLabel.map(({ label, noteProgress }) => (
                <span
                  key={label}
                  className={`studio-note-token studio-note-token--${getProgressStatus(noteProgress)}`}
                  role="listitem"
                  aria-label={`${label}, ${getProgressStatusLabel(noteProgress)}, ${noteProgress.correct} ${noteProgress.correct === 1 ? "réussite" : "réussites"} sur ${noteProgress.views} ${noteProgress.views === 1 ? "essai" : "essais"}`}
                >
                  <span>{label}</span>
                  <span aria-hidden="true">{getProgressMark(noteProgress)}</span>
                </span>
              ))}
            </div>
            {totalViews > 0 ? (
              <div className="button-row">
                <ResetProgressControl
                  confirmationMessage={`Effacer toute la progression en ${CLEF_LABELS[activeClef]} ? Cette action est définitive.`}
                  onConfirm={resetStoredProgress}
                />
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
    const noteProgress = getNotesForClef(clef).filter((note) => note.answerLabel === label).reduce<NoteProgress>(
      (summary, note) => {
        const currentProgress = notesProgress[note.id] ?? emptyNoteProgress;

        return {
          views: summary.views + currentProgress.views,
          correct: summary.correct + currentProgress.correct,
          errors: summary.errors + currentProgress.errors,
          needsReview: summary.needsReview || currentProgress.needsReview,
          lastPracticedAt: null,
        };
      },
      {
        views: 0,
        correct: 0,
        errors: 0,
        needsReview: false,
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
  needsReview: false,
  lastPracticedAt: null,
};

function getProgressStatus(noteProgress: NoteProgress): "complete" | "current" | "missed" {
  if (noteProgress.needsReview) {
    return "missed";
  }

  if (noteProgress.correct > 0) {
    return "complete";
  }

  return "current";
}

function getProgressMark(noteProgress: NoteProgress): string {
  if (noteProgress.needsReview) {
    return "!";
  }

  if (noteProgress.correct > 0) {
    return "✓";
  }

  return "·";
}

function getProgressStatusLabel(noteProgress: NoteProgress): string {
  if (noteProgress.needsReview) {
    return "à revoir";
  }

  if (noteProgress.correct > 0) {
    return "acquise";
  }

  return "à découvrir";
}
