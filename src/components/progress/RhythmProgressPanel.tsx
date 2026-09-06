import { useRef, useState } from "react";
import { getRhythmPattern, RHYTHM_MODE_LABELS, RHYTHM_MODES, type RhythmSettings } from "../../domain/rhythmExercise";
import { summarizeRhythmProgress, type RhythmProgress } from "../../domain/rhythmProgress";
import { formatRhythmOffset } from "../exercise/RhythmResultPanel";

export function RhythmProgressPanel({ progress, onPractice, onReset }: { progress: RhythmProgress; onPractice: (settings: RhythmSettings) => void; onReset: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const total = Object.values(progress.entries).reduce((sum, entry) => sum + entry.attempts, 0);
  return <details className="rhythm-progress">
    <summary ref={summaryRef}>Ma progression · {total} séance{total !== 1 ? "s" : ""}</summary>
    {total === 0 ? <p>Termine une première séance pour retrouver tes résultats ici.</p> : RHYTHM_MODES.map((mode) => {
      const summary = summarizeRhythmProgress(progress, mode);
      const entries = Object.values(progress.entries).filter((entry) => entry.settings.mode === mode).sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt));
      return <section key={mode}>
        <h3>{RHYTHM_MODE_LABELS[mode]}</h3>
        <p>{summary.attempts} séance{summary.attempts !== 1 ? "s" : ""} · {summary.correct} repère{summary.correct !== 1 ? "s atteints" : " atteint"} · À reprendre : {summary.toReview}</p>
        {entries.map((entry) => <button type="button" className="rhythm-progress-entry" key={`${mode}-${entry.settings.patternId}-${entry.settings.tempo}-${entry.settings.visualGuide}-${entry.settings.metronome}`} onClick={() => onPractice(entry.settings)}>
          <strong>{mode === "pulse" ? "Pulsation" : `${entry.settings.patternId} · ${getRhythmPattern(entry.settings.patternId).title}`} · {entry.settings.tempo} bpm</strong>
          <span>{entry.settings.visualGuide ? "Repères visuels" : "Sans repères"} · {mode === "pulse" || entry.settings.metronome ? "Avec métronome" : "Sans métronome"}</span>
          <span>{entry.attempts} essai{entry.attempts !== 1 ? "s" : ""} · {entry.needsReview ? "À reprendre" : "Repère atteint"} · Dernière médiane : {formatRhythmOffset(entry.lastMedianOffsetMs)}</span>
          <span>Reprendre cet exercice →</span>
        </button>)}
      </section>;
    })}
    {total > 0 && (confirmReset ? <div className="rhythm-reset-confirm" role="group" aria-label="Effacer la progression Rythmes">
      <p>Effacer uniquement la progression des trois exercices de rythmes ?</p>
      <button type="button" onClick={() => { onReset(); setConfirmReset(false); summaryRef.current?.focus(); }}>Effacer les rythmes</button>
      <button type="button" onClick={() => setConfirmReset(false)}>Annuler</button>
    </div> : <button className="rhythm-reset-button" type="button" onClick={() => setConfirmReset(true)}>Réinitialiser les rythmes</button>)}
  </details>;
}
