import { useEffect, useRef } from "react";
import { ChallengeResultView } from "../components/exercise/ChallengeResultView";
import { ExercisePageLayout } from "../components/exercise/ExercisePageLayout";
import { NoteExerciseView } from "../components/exercise/NoteExerciseView";
import { NoteMasteryPanel } from "../components/progress/NoteMasteryPanel";
import { PracticeReward, habitMessage } from "../components/progress/PracticeReward";
import { AppButton } from "../components/ui/AppButton";
import { AuroraMenuIcon } from "../components/ui/AuroraMenuIcon";
import { dayNumber } from "../domain/calendar";
import { JOURNEY_LABELS, type JourneyMode } from "../domain/noteJourney";
import { noteName } from "../domain/noteMastery";
import { CLEFS, CLEF_LABELS, READING_ZONES, READING_ZONE_LABELS, getNoteById } from "../domain/notes";
import { useJourneySession } from "../hooks/useJourneySession";
import { usePracticeDays } from "../hooks/usePracticeDays";
import { useProgress } from "../hooks/useProgress";
import { useSettings } from "../hooks/useSettings";
import "../theme/journey.css";

export function NoteJourneyPage() {
  const notes = useProgress();
  const practice = usePracticeDays();
  const { settings, updateReadingZone } = useSettings();
  const clef = notes.activeClef;
  const zone = settings.readingZones[clef];
  const session = useJourneySession({
    progress: notes.progress,
    recordNoteAnswer: notes.recordNoteAnswer,
    onComplete: (result) => {
      practice.completeSeries({ id: result.id, score: result.score, total: result.answers.length });
      if (result.plan.mode !== "daily") notes.saveReadingAward(result.plan.clef, result.plan.mode, result.answers, result.medianMs, result.plan.zone);
    },
  });
  const autoStarted = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { trial } = session;
  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    const play = new URLSearchParams(window.location.search).get("play");
    if (play === "daily" || play === "fluency" || play === "exam") session.start(play, clef, zone);
  }, []);
  useEffect(() => {
    if (!trial) titleRef.current?.focus();
  }, [Boolean(trial)]);

  if (trial?.paused) return <ExercisePageLayout eyebrow={JOURNEY_LABELS[trial.plan.mode]} title="Une petite pause" className="journey-page">
    <section className="journey-card">
      <p>Ta série t’attend à la note {trial.index + 1}. Aucun chrono ne te presse.</p>
      {trial.plan.mode === "fluency" && <p>Le temps de cette série ne sera pas comparé à ton record.</p>}
      <div className="button-row"><AppButton tone="plum" onClick={session.resume}>Reprendre la série</AppButton><AppButton tone="cream" onClick={session.close}>Revenir au parcours</AppButton></div>
    </section>
  </ExercisePageLayout>;

  if (trial?.phase === "result" && trial.result) {
    const result = trial.result;
    const perfect = result.score === result.answers.length;
    const missed = [...new Set(result.answers.filter((answer) => !answer.isCorrect).map((answer) => answer.noteId))];
    return <ChallengeResultView eyebrow={`${JOURNEY_LABELS[trial.plan.mode]} · ${CLEF_LABELS[trial.plan.clef]}`} score={result.score} total={result.answers.length}
      resultStates={result.answers.map((answer) => answer.isCorrect)} itemLabel={{ singular: "note trouvée", plural: "notes trouvées" }}
      reviewTitle="Tes prochaines notes à retrouver" reviewItems={missed.map((id) => noteName(getNoteById(id)))}
      onRestart={() => session.start(trial.plan.mode, trial.plan.clef, trial.plan.zone)}
      perfectMessage={trial.plan.mode === "exam" && perfect ? "Passeport de lecture obtenu !" : "Cette série est sans faute"}
      reward={<>
        <PracticeReward summary={practice.summary} perfect={perfect} total={result.answers.length} storageAvailable={practice.storageAvailable && notes.storageAvailable} />
        {READING_ZONES.filter((item) => notes.progress.clefs[trial.plan.clef].badges?.[item] && !trial.plan.badgesAtStart.includes(item)).map((item) => <p className="journey-passport" key={item}><AuroraMenuIcon name="reward" />Nouveau badge : {item === "full" ? "Clé confirmée" : `Repères du ${READING_ZONE_LABELS[item].toLowerCase()}`} !</p>)}
        {trial.plan.mode === "exam" && perfect && <p className="journey-passport"><AuroraMenuIcon name="challenge" /> Passeport {CLEF_LABELS[trial.plan.clef]} : les 15 notes du parcours retrouvées !</p>}
        {trial.plan.mode === "fluency" && <p className="journey-result-time">{perfect && result.medianMs !== null
          ? `Sans faute : ${(result.medianMs / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} s par note en médiane. La justesse passe avant la vitesse.`
          : "Consolide d’abord les notes. Seules les séries sans faute et sans interruption comptent pour ton repère de vitesse."}</p>}
      </>} />;
  }

  if (trial) return <NoteExerciseView mode="challenge" seriesTitle={JOURNEY_LABELS[trial.plan.mode]} seriesLength={trial.plan.questions.length} hideCorrection={trial.plan.mode === "exam"}
    activeClef={trial.plan.clef} activeReadingZone={trial.plan.zone} question={trial.plan.questions[trial.index]}
    selectedAnswerLabel={trial.phase === "feedback" ? trial.answers[trial.index].selectedLabel : null} questionNumber={trial.index + 1}
    speedScore={0} speedTimeLeftMs={0} onAnswer={session.answer} onNextQuestion={session.next} />;

  const stored = notes.progress.clefs[clef];
  const start = (mode: JourneyMode) => session.start(mode, clef, zone);
  const week = Array.from({ length: 7 }, (_, index) => new Date((dayNumber(practice.today) - 6 + index) * 86_400_000).toISOString().slice(0, 10));
  return <ExercisePageLayout eyebrow="Ton rendez-vous musical" className="journey-page">
    <header className="journey-heading"><h1 ref={titleRef} tabIndex={-1}>Un peu chaque jour</h1><p>Dix notes, à ton rythme. Une série suffit.</p></header>
    {(!practice.storageAvailable || !notes.storageAvailable) && <p role="status" className="journey-footer">La sauvegarde locale est indisponible. Tes nouveaux résultats restent dans cette page tant qu’elle est ouverte.</p>}
    <section className="journey-card journey-today" aria-labelledby="journey-today-title">
      <div className="journey-today-heading"><AuroraMenuIcon name="challenge" /><h2 id="journey-today-title">{habitMessage(practice.summary)}</h2></div>
      <p>{practice.summary.completedToday ? "Ton rendez-vous est déjà validé. À demain, ou encore un peu pour le plaisir !" : "Termine une série pour valider ta journée, même si tu fais des erreurs."}</p>
      <ol className="journey-week" aria-label="Tes sept derniers jours">{week.map((day) => {
        const done = practice.progress.days.includes(day);
        const date = new Date(`${day}T12:00:00Z`);
        return <li key={day} className={done ? "is-done" : ""} aria-label={`${date.toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "UTC" })} : ${done ? "série faite" : "pas de série"}`} aria-current={day === practice.today ? "date" : undefined}>
          <span>{date.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" })}</span><strong aria-hidden="true">{done ? "✓" : "·"}</strong>
        </li>;
      })}</ol>
      <p className="journey-records">{practice.summary.totalDays} jour{practice.summary.totalDays !== 1 ? "s" : ""} de musique · Record : {practice.summary.best} · {practice.summary.perfectSeries} série{practice.summary.perfectSeries !== 1 ? "s" : ""} sans faute</p>
      <AppButton tone="plum" onClick={() => start("daily")}>{practice.summary.completedToday ? "Une autre série, pour le plaisir" : "Commencer mes 10 notes"}</AppButton>
    </section>
    <section className="journey-card journey-options" aria-label="Choisir les notes du parcours">
      <fieldset><legend>Ma clé</legend><div className="journey-choices">{CLEFS.map((item) => <button key={item} type="button" aria-pressed={clef === item} onClick={() => notes.switchActiveClef(item)}>{CLEF_LABELS[item]}</button>)}</div></fieldset>
      <fieldset><legend>Ma zone de lecture</legend><div className="journey-choices">{READING_ZONES.map((item) => <button key={item} type="button" aria-pressed={zone === item} onClick={() => updateReadingZone(clef, item)}>{READING_ZONE_LABELS[item]}</button>)}</div></fieldset>
      <p>Ta série reprend les notes à consolider et en introduit progressivement de nouvelles.</p>
    </section>
    <NoteMasteryPanel progress={notes.progress} clef={clef} />
    <section className="journey-next" aria-label="Aller plus loin">
      <article className="journey-card"><AuroraMenuIcon name="challenge" /><h2>La petite scène</h2><p>Ton mini-examen : 15 notes, chacune une fois, sans limite de temps. Les réponses se découvrent au bilan.</p>
        {stored.examPassedAt && <p className="journey-earned">Passeport de lecture obtenu !</p>}
        <AppButton tone="plum" disabled={!stored.badges?.full} onClick={() => start("exam")}>{stored.examPassedAt ? "Rejouer la petite scène" : "Entrer en scène"}</AppButton>
        {!stored.badges?.full && <small>Disponible après le badge « Clé confirmée ».</small>}
      </article>
      <article className="journey-card"><AuroraMenuIcon name="speed" /><h2>Lecture fluide</h2><p>Dix notes pour gagner en aisance. Pas de compte à rebours ni d’élimination : ton temps se découvre après la série.</p>
        {stored.bestFluencyMsByZone?.[zone] && <p className="journey-earned">Ton meilleur repère ({READING_ZONE_LABELS[zone]}) : {(stored.bestFluencyMsByZone[zone]! / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} s par note en médiane.</p>}
        <AppButton tone="cream" onClick={() => start("fluency")}>Jouer en lecture fluide</AppButton>
      </article>
    </section>
    <p className="journey-footer">Une journée manquée ? Reviens quand tu veux : tes badges restent acquis. <a href="/exercise?mode=training">Entraînement libre</a></p>
  </ExercisePageLayout>;
}
