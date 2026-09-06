import { useEffect, useRef, type RefObject } from "react";
import { getRhythmPattern, RHYTHM_TEMPOS, type RhythmSettings } from "../../domain/rhythmExercise";
import { RHYTHM_NOTIONS, RHYTHM_PATTERNS } from "../../domain/rhythmPatterns";

type Props = { open: boolean; value: RhythmSettings; triggerRef: RefObject<HTMLButtonElement>; onChange: (settings: RhythmSettings) => void; onClose: () => void };

export function RhythmQuickSettings({ open, value, triggerRef, onChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const pattern = getRhythmPattern(value.patternId);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      wasOpenRef.current = true;
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      closeRef.current?.focus();
    } else {
      if (dialog.open) {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      }
      if (wasOpenRef.current) { wasOpenRef.current = false; triggerRef.current?.focus(); }
    }
  }, [open, triggerRef]);
  return <dialog ref={dialogRef} id="rhythm-quick-settings" className="notes-mode-dialog rhythm-settings-dialog" aria-labelledby="rhythm-settings-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose}
    onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="notes-mode-dialog__sheet">
      <header className="notes-mode-dialog__header">
        <h2 id="rhythm-settings-title">Réglages rapides</h2>
        <button ref={closeRef} type="button" className="notes-mode-dialog__close" aria-label="Fermer les réglages rapides" onClick={onClose}>×</button>
      </header>
      <fieldset className="pulse-settings">
        <legend>Tempo</legend>
        <div className="pulse-tempos">{RHYTHM_TEMPOS.map((tempo) => <button key={tempo} type="button" aria-pressed={tempo === value.tempo} onClick={() => onChange({ ...value, tempo })}>{tempo} bpm</button>)}</div>
      </fieldset>
      {value.mode !== "pulse" && <>
        <label className="rhythm-select">Notion
          <select value={pattern.notion} onChange={(event) => onChange({ ...value, patternId: RHYTHM_PATTERNS.find((item) => item.notion === event.target.value)!.id })}>
            {Object.entries(RHYTHM_NOTIONS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label className="rhythm-select">Formule
          <select value={value.patternId} onChange={(event) => onChange({ ...value, patternId: event.target.value })}>
            {RHYTHM_PATTERNS.filter((item) => item.notion === pattern.notion).map((item) => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}
          </select>
        </label>
        {pattern.extension && <p className="pulse-input-help">À choisir si cette notion a déjà été abordée en cours.</p>}
        <label className="pulse-guide-choice"><input type="checkbox" checked={value.metronome} onChange={(event) => onChange({ ...value, metronome: event.target.checked })} /> Métronome pendant la formule</label>
      </>}
      <label className="pulse-guide-choice"><input type="checkbox" checked={value.visualGuide} onChange={(event) => onChange({ ...value, visualGuide: event.target.checked })} /> Repères visuels de pulsation</label>
      <p className="pulse-input-help">Tes choix sont mémorisés. Une tentative en cours est arrêtée à l’ouverture des réglages.</p>
      <button className="app-button app-button--plum" type="button" onClick={onClose}>Terminé</button>
    </div>
  </dialog>;
}
