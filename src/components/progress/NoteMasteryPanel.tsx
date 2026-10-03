import { CLEF_LABELS, READING_ZONE_LABELS, READING_ZONES, type Clef } from "../../domain/notes";
import { isNoteMastered, noteName, summarizeMastery } from "../../domain/noteMastery";
import type { ProgressState } from "../../domain/progress";
import { AuroraMenuIcon } from "../ui/AuroraMenuIcon";

export function NoteMasteryPanel({ progress, clef }: { progress: ProgressState; clef: Clef }) {
  const mastery = summarizeMastery(progress, clef);
  const stored = progress.clefs[clef];
  return <section className="journey-card" aria-labelledby="note-mastery-title">
    <p className="studio-overline">{CLEF_LABELS[clef]} · {noteName(mastery.notes[0])} à {noteName(mastery.notes[mastery.total - 1])}</p>
    <h2 id="note-mastery-title">Tes repères se construisent</h2>
    <p><strong>{mastery.mastered} / {mastery.total}</strong> notes confirmées, octave par octave.</p>
    <div className="journey-badges">{READING_ZONES.map((zone) => {
      const part = summarizeMastery(progress, clef, zone);
      const earned = Boolean(stored.badges?.[zone]);
      return <div key={zone} className={`journey-badge${earned ? " is-earned" : ""}`}>
        <AuroraMenuIcon name={earned ? "complete" : "note"} />
        <strong>{zone === "full" ? "Clé confirmée" : `Repères du ${READING_ZONE_LABELS[zone].toLowerCase()}`}</strong>
        <span>{earned ? "Badge obtenu" : `${part.mastered} / ${part.total} notes`}</span>
      </div>;
    })}</div>
    <ul className="journey-note-map" aria-label="Maîtrise par note et octave">{mastery.notes.map((note) => {
      const item = stored.notes[note.id];
      const mastered = isNoteMastered(item);
      const label = mastered ? "confirmée" : item?.needsReview ? "à retrouver" : item?.views ? "à consolider" : "à découvrir";
      return <li key={note.id} className={mastered ? "is-mastered" : item?.needsReview ? "needs-review" : ""}>
        <strong>{noteName(note)}</strong><small>{label}</small>
      </li>;
    })}</ul>
    <details className="journey-explanation"><summary>Comment gagner les badges ?</summary>
      <p>Une note se confirme après trois bonnes réponses consécutives réparties sur au moins deux jours. Les badges récompensent toutes les notes du bas, du haut, puis du parcours complet.</p>
      <p>Une erreur remet la note à travailler ; tes badges déjà obtenus restent avec toi. Tes anciens essais sont conservés et les nouveaux repères se confirment au fil des jours.</p>
      <p>Le parcours couvre les 15 notes naturelles affichées ici. Ce sont des repères de travail, à compléter avec ton professeur.</p>
    </details>
  </section>;
}
