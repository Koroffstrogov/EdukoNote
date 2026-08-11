import type { AuroraMenuIconName } from "../ui/AuroraMenuIcon";
import { AuroraMenuIcon } from "../ui/AuroraMenuIcon";
import { AppCard } from "../ui/AppCard";
import { ResetProgressControl } from "../ui/ResetProgressControl";
import { CLEF_LABELS, type Clef } from "../../domain/notes";
import { countTotalCorrect, countTotalViews, type NoteProgress, type ProgressState } from "../../domain/progress";
import { summarizeProgressByAnswer } from "../../domain/progressSummary";

export type NoteProgressPanelProps = {
  progress: ProgressState;
  activeClef: Clef;
  headingId: string;
  onReset: () => void;
  eyebrow?: string;
  title?: string;
  edition?: string;
  className?: string;
};

export function NoteProgressPanel({
  progress,
  activeClef,
  headingId,
  onReset,
  eyebrow = "Ton signal",
  title = "Ta progression",
  edition = CLEF_LABELS[activeClef],
  className = "",
}: NoteProgressPanelProps) {
  const totalViews = countTotalViews(progress, activeClef);
  const totalCorrect = countTotalCorrect(progress, activeClef);
  const progressByLabel = summarizeProgressByAnswer(progress, activeClef);
  const notesToReview = progressByLabel.filter(({ noteProgress }) => noteProgress.needsReview).length;
  const classes = ["home-progress-card", "studio-progress-card", className].filter(Boolean).join(" ");

  return (
    <AppCard tone="cream" className={classes} aria-labelledby={headingId}>
      <div className="studio-section-heading">
        <div>
          <p className="studio-overline">{eyebrow}</p>
          <h2 id={headingId}>{title}</h2>
        </div>
        <span className="studio-progress-card__edition">{edition}</span>
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
            onConfirm={onReset}
          />
        </div>
      ) : null}
    </AppCard>
  );
}

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
