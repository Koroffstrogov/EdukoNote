import { useEffect, useRef, useState } from "react";
import { ExercisePageLayout } from "../components/exercise/ExercisePageLayout";
import { RhythmQuickSettings } from "../components/exercise/RhythmQuickSettings";
import { RhythmResultPanel } from "../components/exercise/RhythmResultPanel";
import { RhythmPatternDisplay } from "../components/music/RhythmPatternDisplay";
import { RhythmProgressPanel } from "../components/progress/RhythmProgressPanel";
import { AppButton } from "../components/ui/AppButton";
import { buildRhythmPlan, getRhythmPattern, RHYTHM_MODES, RHYTHM_MODE_LABELS, type RhythmSettings } from "../domain/rhythmExercise";
import { RHYTHM_NOTIONS, RHYTHM_PATTERNS } from "../domain/rhythmPatterns";
import { summarizeRhythmProgress } from "../domain/rhythmProgress";
import { useRhythmPractice } from "../hooks/useRhythmPractice";
import { useRhythmSession } from "../hooks/useRhythmSession";
import "../theme/rhythms.css";

export function RhythmsPage() {
  const practice = useRhythmPractice();
  const { settings } = practice;
  const session = useRhythmSession(practice.recordCompleted);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLHeadingElement>(null);
  const active = ["starting", "count-in", "listening", "playing"].includes(session.phase);
  const plan = session.plan ?? buildRhythmPlan(settings);
  const pattern = getRhythmPattern(settings.patternId);
  const pulse = settings.mode === "pulse";
  const playing = session.phase === "playing";
  const stage = plan.stages.find((item) => session.beat >= item.from && session.beat < item.from + item.length) ?? plan.stages[0];
  const stageBeat = Math.max(-1, session.beat - stage.from);
  const responseBeat = Math.max(0, session.beat - plan.responseAt);
  const barIndex = Math.min(pattern.bars.length - 1, Math.floor(responseBeat / pattern.beatsPerBar));

  useEffect(() => {
    if (settingsOpen) return;
    if (session.phase === "count-in" || session.phase === "playing") padRef.current?.focus();
    if (["result", "interrupted", "error"].includes(session.phase)) statusRef.current?.focus();
  }, [session.phase]);

  const changeSettings = (next: RhythmSettings) => { session.reset(); practice.updateSettings(next); };
  const choosePractice = (next: RhythmSettings) => { changeSettings(next); settingsTriggerRef.current?.focus(); };
  const nextPattern = () => {
    const group = RHYTHM_PATTERNS.filter((item) => item.notion === pattern.notion);
    changeSettings({ ...settings, patternId: group[(group.findIndex((item) => item.id === pattern.id) + 1) % group.length].id });
  };
  const status = session.phase === "starting" ? "Le son se prépare…"
    : session.phase === "count-in" ? `Prépare-toi : ${stage.length} temps`
    : session.phase === "listening" ? "Écoute la formule"
    : playing ? (pulse ? "À toi, suis le son" : "À toi, tape les notes")
    : session.phase === "interrupted" ? "La séance est arrêtée"
    : session.phase === "error" ? "Le son n’a pas démarré"
    : session.phase === "result" ? "Ta séance est terminée"
    : pulse ? "Un son, une frappe" : settings.mode === "echo" ? "Écoute, puis reproduis" : "Lis, puis joue le rythme";

  return <ExercisePageLayout eyebrow="Rythmes" title={RHYTHM_MODE_LABELS[settings.mode]} className={`pulse-page${active ? " rhythm-active" : ""}`}
    contextAction={<button type="button" className="reading-zone-trigger" ref={settingsTriggerRef} aria-haspopup="dialog" aria-controls="rhythm-quick-settings" aria-expanded={settingsOpen}
      onClick={() => { setSettingsOpen(true); session.stop(); }}>Réglages · {settings.tempo} bpm</button>}>
    {!active && <nav className="rhythm-modes" aria-label="Choisir un exercice de rythmes">{RHYTHM_MODES.map((mode) => {
      const attempts = summarizeRhythmProgress(practice.progress, mode).attempts;
      return <button key={mode} type="button" aria-pressed={settings.mode === mode} onClick={() => changeSettings({ ...settings, mode })}>
        <strong>{RHYTHM_MODE_LABELS[mode]}</strong><span>{attempts} séance{attempts !== 1 ? "s" : ""}</span>
      </button>;
    })}</nav>}
    <section className="pulse-workshop" aria-label="Exercice de rythmes">
      {!active && <>
        <p className="pulse-intro">{pulse ? "Écoute quatre temps, puis tape avec le son pendant seize pulsations."
          : settings.mode === "echo" ? "Écoute deux mesures. Après un nouveau décompte, reproduis-les de mémoire."
          : "Après le décompte, tape une fois au début de chaque note. Garde les silences et les liaisons."}</p>
        {!pulse && <p className="rhythm-current-formula">{pattern.id} · {pattern.title} · {pattern.beatsPerBar}/4 <button type="button" onClick={nextPattern}>Formule suivante</button></p>}
      </>}
      <div className="pulse-stage">
        <h2 ref={statusRef} tabIndex={-1} className="pulse-status" aria-live="polite">{status}</h2>
        {settings.mode === "read" && !session.completed && <div className={active ? "rhythm-current-score" : "rhythm-score-preview"}>
          <RhythmPatternDisplay pattern={pattern} barIndex={active ? barIndex : undefined} />
          {active && <small>Mesure {barIndex + 1} / {pattern.bars.length}</small>}
        </div>}
        {active && <>
          <div className="pulse-cue" aria-hidden="true">
            <div className="pulse-lights">{Array.from({ length: plan.beatsPerBar }, (_, index) => <span key={index} className={settings.visualGuide && session.beat >= 0 && stageBeat % plan.beatsPerBar === index ? "is-current" : ""} />)}</div>
            <p className="pulse-position">{settings.visualGuide ? `${Math.min(stage.length, stageBeat + 1)} / ${stage.length}` : `${settings.tempo} bpm`}</p>
          </div>
          <button ref={padRef} type="button" className="pulse-pad" disabled={session.phase === "starting" || session.phase === "listening"} aria-label="Frapper le rythme" aria-describedby="rhythm-input-help"
            onPointerDown={(event) => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); session.tap(event.timeStamp); }}
            onKeyDown={(event) => { if (event.key !== " " && event.key !== "Enter") return; event.preventDefault(); if (!event.repeat) session.tap(event.timeStamp); }}
            onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") event.preventDefault(); }}
            onClick={(event) => { if (event.detail === 0) session.tap(event.timeStamp); }}>
            <strong>{playing ? "Tape ici" : "Écoute…"}</strong><span aria-hidden="true">{session.tapCount} frappe{session.tapCount !== 1 ? "s" : ""}</span>
          </button>
          <p id="rhythm-input-help" className="pulse-input-help">Avec un doigt, ou la touche Espace.</p>
        </>}
        {session.completed && <>
          <RhythmResultPanel result={session.completed.result} pulse={pulse} />
          {!pulse && <RhythmPatternDisplay pattern={getRhythmPattern(session.completed.plan.settings.patternId)} />}
        </>}
        {session.phase === "interrupted" && <p>Cette tentative n’est pas enregistrée. Recommence quand tu es prêt.</p>}
        {session.phase === "error" && <p>Vérifie le volume et la sortie audio, puis réessaie de démarrer.</p>}
      </div>
      <div className="pulse-actions">{active ? <AppButton tone="cream" onClick={session.stop}>Arrêter</AppButton>
        : <AppButton tone="plum" onClick={() => { void session.start(settings); }}>{session.phase === "idle" ? "Commencer" : "Recommencer"}</AppButton>}</div>
      {!active && <p className="pulse-footnote">{pulse ? "" : "Seuls les débuts de notes sont évalués. "}Utilise de préférence le haut-parleur ; le Bluetooth peut décaler le son.</p>}
      {!practice.storageAvailable && <p role="status" className="pulse-footnote">Le stockage local est indisponible. Tes résultats restent dans cette page jusqu’à sa fermeture.</p>}
    </section>
    {!active && <>
      <RhythmProgressPanel progress={practice.progress} onPractice={choosePractice} onReset={practice.resetProgress} />
      <details className="rhythm-catalog"><summary>20 formules à découvrir avec ton professeur</summary>
        <p>Propositions pour une deuxième année de premier cycle, à confronter au cours. Ici, la noire vaut un temps.</p>
        {Object.entries(RHYTHM_NOTIONS).map(([notion, label]) => <section key={notion} aria-labelledby={`notion-${notion}`}>
          <h2 id={`notion-${notion}`}>{label}</h2>
          {RHYTHM_PATTERNS.filter((item) => item.notion === notion).map((item) => <article key={item.id} className="rhythm-pattern">
            <h3>{item.id} · {item.title}</h3><p>{item.objective}{item.extension && <span className="rhythm-extension">Selon le cours</span>}</p>
            <RhythmPatternDisplay pattern={item} />
            <div className="rhythm-catalog-actions"><button type="button" onClick={() => choosePractice({ ...settings, mode: "echo", patternId: item.id })}>Jouer en écho</button><button type="button" onClick={() => choosePractice({ ...settings, mode: "read", patternId: item.id })}>Lire et frapper</button></div>
          </article>)}
        </section>)}
      </details>
    </>}
    <RhythmQuickSettings open={settingsOpen} value={settings} triggerRef={settingsTriggerRef} onChange={changeSettings} onClose={() => setSettingsOpen(false)} />
  </ExercisePageLayout>;
}
