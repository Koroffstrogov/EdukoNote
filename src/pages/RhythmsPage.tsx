import { useEffect, useRef, useState } from "react";
import { ExercisePageLayout } from "../components/exercise/ExercisePageLayout";
import { RhythmPatternDisplay } from "../components/music/RhythmPatternDisplay";
import { AppButton } from "../components/ui/AppButton";
import { COUNT_IN_BEATS, PRACTICE_BEATS, PULSE_TEMPOS, type PulseTempo } from "../domain/pulse";
import { RHYTHM_NOTIONS, RHYTHM_PATTERNS } from "../domain/rhythmPatterns";
import { usePulseSession } from "../hooks/usePulseSession";
import "../theme/rhythms.css";

function formatOffsetMs(value: number | null) {
  if (value === null) return "—";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} ms`;
}

export function RhythmsPage() {
  const [tempo, setTempo] = useState<PulseTempo>(72);
  const [visualGuide, setVisualGuide] = useState(true);
  const session = usePulseSession();
  const padRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLHeadingElement>(null);
  const active = ["starting", "count-in", "playing"].includes(session.phase);
  const playing = session.phase === "playing";
  const currentPulse = Math.min(PRACTICE_BEATS, Math.max(0, session.beat - COUNT_IN_BEATS + 1));

  useEffect(() => {
    if (session.phase === "count-in") padRef.current?.focus();
    if (["result", "interrupted", "error"].includes(session.phase)) statusRef.current?.focus();
  }, [session.phase]);

  const status = session.phase === "starting" ? "Le son se prépare…"
    : session.phase === "count-in" ? "Écoute quatre temps"
    : playing ? "À toi, suis le son"
    : session.phase === "interrupted" ? "La séance est arrêtée"
    : session.phase === "error" ? "Le son n’a pas démarré"
    : session.phase === "result" ? "Ta séance est terminée"
    : "Un son, une frappe";

  return (
    <ExercisePageLayout eyebrow="Rythmes · Atelier" title="Garde la pulsation" className="pulse-page">
      <section className="pulse-workshop" aria-label="Exercice de pulsation">
        {!active && <p className="pulse-intro">Écoute quatre temps, puis tape avec le son pendant seize pulsations.</p>}
        {!active && <fieldset className="pulse-settings">
          <legend>Choisis ton tempo</legend>
          <div className="pulse-tempos">
            {PULSE_TEMPOS.map((value) => <button key={value} type="button" aria-pressed={tempo === value} onClick={() => setTempo(value)}>
              {value} <span>bpm</span>
            </button>)}
          </div>
          <label className="pulse-guide-choice"><input type="checkbox" checked={visualGuide} onChange={(event) => setVisualGuide(event.target.checked)} /> Afficher les repères visuels</label>
        </fieldset>}

        <div className="pulse-stage">
          <h2 ref={statusRef} tabIndex={-1} className="pulse-status" aria-live="polite">{status}</h2>
          {active && <>
            <div className="pulse-lights" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => <span key={index} className={visualGuide && session.beat >= 0 && session.beat % 4 === index ? "is-current" : ""} />)}
            </div>
            <p className="pulse-position" aria-hidden="true">{visualGuide ? (playing ? `${currentPulse} / ${PRACTICE_BEATS}` : `${Math.max(0, session.beat + 1)} / ${COUNT_IN_BEATS}`) : `${tempo} bpm · Écoute le son`}</p>
            <button
              ref={padRef}
              type="button"
              className="pulse-pad"
              disabled={session.phase === "starting"}
              aria-label="Frapper la pulsation"
              aria-describedby="pulse-input-help"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.focus();
                session.tap(event.timeStamp);
              }}
              onKeyDown={(event) => {
                if (event.key !== " " && event.key !== "Enter") return;
                event.preventDefault();
                if (!event.repeat) session.tap(event.timeStamp);
              }}
              onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") event.preventDefault(); }}
              onClick={(event) => { if (event.detail === 0) session.tap(event.timeStamp); }}
            >
              <strong>{playing ? "Tape ici" : "Écoute…"}</strong>
              <span aria-hidden="true">{session.tapCount} frappe{session.tapCount !== 1 ? "s" : ""}</span>
            </button>
            <p id="pulse-input-help" className="pulse-input-help">Avec un doigt, ou la touche Espace.</p>
          </>}
          {session.result && <div className="pulse-result">
            <p className="pulse-result__message">{session.result.message}</p>
            <dl>
              <div><dt>Pulsations retrouvées</dt><dd>{session.result.matched} / {PRACTICE_BEATS}</dd></div>
              <div><dt>Sans frappe</dt><dd>{session.result.missed}</dd></div>
              <div><dt>Frappes en plus</dt><dd>{session.result.extra}</dd></div>
              <div><dt>Écart moyen</dt><dd>{formatOffsetMs(session.result.meanOffsetMs)}</dd></div>
              <div><dt>Écart médian</dt><dd>{formatOffsetMs(session.result.medianOffsetMs)}</dd></div>
            </dl>
            <p className="pulse-input-help">{session.result.matched
              ? `Écarts estimés sur ${session.result.matched} frappe${session.result.matched > 1 ? "s associées" : " associée"} : + = après le son ; − = avant le son.`
              : "Aucune frappe associée : les écarts ne sont pas disponibles."}</p>
            <p>Régularité : {session.result.regularity === "steady" ? "stable" : session.result.regularity === "variable" ? "à travailler" : "pas assez de frappes pour conclure"}.</p>
            <small>Ces repères sont provisoires. Ils ne sont pas enregistrés dans ta progression.</small>
          </div>}
          {session.phase === "interrupted" && <p>Recommence quand tu es prêt. Cette tentative n’est pas évaluée.</p>}
          {session.phase === "error" && <p>Vérifie le volume et la sortie audio, puis réessaie de démarrer.</p>}
        </div>

        <div className="pulse-actions">
          {active ? <AppButton tone="cream" onClick={session.stop}>Arrêter</AppButton>
            : <AppButton tone="rose" onClick={() => { void session.start(tempo); }}>{session.phase === "idle" ? "Commencer" : "Recommencer"}</AppButton>}
        </div>
        {!active && <p className="pulse-footnote">Pour ce premier essai, utilise le haut-parleur de l’iPhone. Le Bluetooth peut décaler le son.</p>}
      </section>

      {!active && <details className="rhythm-catalog">
        <summary>20 formules à découvrir avec ton professeur</summary>
        <p>Propositions pour une deuxième année de premier cycle, à confronter au cours suivi. Ici, la noire vaut un temps. Les formules sont à lire ensemble ; leur mise en jeu viendra ensuite.</p>
        {Object.entries(RHYTHM_NOTIONS).map(([notion, label]) => <section key={notion} aria-labelledby={`notion-${notion}`}>
          <h2 id={`notion-${notion}`}>{label}</h2>
          {RHYTHM_PATTERNS.filter((pattern) => pattern.notion === notion).map((pattern) => <article key={pattern.id} className="rhythm-pattern">
            <h3>{pattern.id} · {pattern.title}</h3>
            <p>{pattern.objective}{pattern.extension && <span className="rhythm-extension"> Selon le cours</span>}</p>
            <RhythmPatternDisplay pattern={pattern} />
          </article>)}
        </section>)}
      </details>}
    </ExercisePageLayout>
  );
}
