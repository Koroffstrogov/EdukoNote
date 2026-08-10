import { AppCard } from "../components/ui/AppCard";
import { AuroraMenuIcon, type AuroraMenuIconName } from "../components/ui/AuroraMenuIcon";
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
    <main className="app-shell studio-shell aurora-shell studio-home aurora-home">
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <SettingsButton />
      </nav>

      <header className="studio-home-hero">
        <div className="studio-home-hero__copy">
          <p className="studio-overline">Session active · {CLEF_LABELS[activeClef]}</p>
          <h1>Entre dans le rythme</h1>
          <p>Lis les notes, reconnais les signes et avance à ton tempo.</p>
          <a className="aurora-play-cta" href="/exercise?mode=training" aria-label="Lancer l’entraînement">
            <span>
              <strong>Jouer</strong>
              <small>Entraînement libre</small>
            </span>
            <span className="aurora-play-cta__icon" aria-hidden="true">
              <AuroraMenuIcon name="play" />
            </span>
          </a>
        </div>
        <div className="studio-home-poster" aria-hidden="true">
          <span className="studio-home-poster__number">Aurora</span>
          <span className="studio-home-poster__note">
            <AuroraMenuIcon name="note" />
          </span>
        </div>
      </header>

      <div className="home-layout studio-home-layout">
        <section className="home-actions studio-setlist" aria-labelledby="home-sessions-title">
          <div className="studio-section-heading studio-setlist__heading">
            <div>
              <p className="studio-overline">Choisis ton mode</p>
              <h2 id="home-sessions-title">Ta prochaine session</h2>
            </div>
            <span>4 options</span>
          </div>
          <HomeActionCard
            title="Défi 10 notes"
            text="Teste ta lecture"
            icon={<AuroraMenuIcon name="challenge" />}
            href="/exercise?mode=challenge"
            tone="rose"
            featured
          />
          <HomeActionCard
            title="Révision"
            text="Retrouve tes erreurs"
            icon={<AuroraMenuIcon name="review" />}
            href="/exercise?mode=review"
            tone="lavender"
          />
          <HomeActionCard
            title="Vitesse"
            text="Suis le tempo"
            icon={<AuroraMenuIcon name="speed" />}
            href="/exercise?mode=speed"
            tone="lavender"
          />
          <HomeActionCard
            title="Symboles"
            text="Explore les signes"
            icon={<AuroraMenuIcon name="symbols" />}
            href="/symbols"
            tone="vanilla"
          />
        </section>

        <section className="home-summary" aria-labelledby="home-progress-title">
          <AppCard tone="cream" className="home-progress-card studio-progress-card">
            <div className="studio-section-heading">
              <div>
                <p className="studio-overline">Ton signal</p>
                <h2 id="home-progress-title">Ta progression</h2>
              </div>
              <span className="studio-progress-card__edition">Live</span>
            </div>
            <p className="studio-progress-card__lead">
              {totalViews > 0 ? "Chaque réponse renforce ton signal." : "Ta première session t’attend."}
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
                  <span aria-hidden="true">
                    <AuroraMenuIcon name={getProgressIconName(noteProgress)} />
                  </span>
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

function getProgressIconName(noteProgress: NoteProgress): AuroraMenuIconName {
  if (noteProgress.needsReview) {
    return "review-needed";
  }

  if (noteProgress.correct > 0) {
    return "complete";
  }

  return "undiscovered";
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
