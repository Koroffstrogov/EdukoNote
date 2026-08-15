import { CLEF_LABELS, type Clef } from "../../domain/notes";
import { PIANO_SPELLINGS } from "../../domain/piano";
import { summarizePianoProgress, type PianoProgressState } from "../../domain/pianoProgress";
import { AppCard } from "../ui/AppCard";
import { ResetProgressControl } from "../ui/ResetProgressControl";

type PianoProgressPanelProps = {
  progress: PianoProgressState;
  activeClef: Clef;
  onReset: () => void;
};

export function PianoProgressPanel({ progress, activeClef, onReset }: PianoProgressPanelProps) {
  const summary = summarizePianoProgress(progress, activeClef);

  return (
    <AppCard className="piano-progress-card" tone="sky" aria-labelledby="piano-progress-title">
      <div className="piano-progress-card__heading">
        <div>
          <p className="studio-overline">Clavier · {CLEF_LABELS[activeClef]}</p>
          <h2 id="piano-progress-title">Progression Piano</h2>
        </div>
        <span>17 écritures</span>
      </div>

      <div className="piano-progress-card__stats" aria-label="Statistiques Piano">
        <ProgressStat label="Tentatives" value={summary.views} />
        <ProgressStat label="Réussites" value={summary.correct} />
        <ProgressStat label="Erreurs" value={summary.errors} />
        <ProgressStat label="À revoir" value={summary.needsReview} />
      </div>

      <div className="piano-progress-card__spellings" aria-label="Maîtrise des écritures chromatiques">
        {PIANO_SPELLINGS.map((spelling) => {
          const spellingProgress = progress.clefs[activeClef].spellings[spelling.id];
          const state = spellingProgress.needsReview
            ? "review"
            : spellingProgress.correct > 0
              ? "complete"
              : "new";

          return (
            <span
              className={`piano-progress-chip piano-progress-chip--${state}`}
              key={spelling.id}
              title={`${spelling.label} : ${spellingProgress.correct} réussite(s), ${spellingProgress.errors} erreur(s)`}
            >
              {spelling.label}
            </span>
          );
        })}
      </div>

      <ResetProgressControl
        confirmationMessage={`Réinitialiser uniquement la progression Piano en ${CLEF_LABELS[activeClef]} ?`}
        onConfirm={onReset}
        triggerLabel="Réinitialiser le Piano"
      />
    </AppCard>
  );
}

function ProgressStat({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <strong>{value}</strong>
      <small>{label}</small>
    </span>
  );
}
