import type { summarizePracticeDays } from "../../domain/practiceDays";
import { AuroraMenuIcon } from "../ui/AuroraMenuIcon";

export type PracticeSummary = ReturnType<typeof summarizePracticeDays>;

export function habitMessage(summary: PracticeSummary) {
  if (summary.completedToday) return summary.current === 1 ? "Premier jour, bravo !" : `Bravo, ${summary.current} jours d’affilée !`;
  if (summary.current) return `${summary.current} jour${summary.current > 1 ? "s" : ""} d’affilée · On continue ?`;
  return summary.totalDays ? "Content de te revoir !" : "Un peu de musique chaque jour";
}

export function PracticeReward({ summary, perfect, total, storageAvailable = true }: { summary: PracticeSummary; perfect: boolean; total: number; storageAvailable?: boolean }) {
  return <aside className={`practice-reward${perfect ? " practice-reward--perfect" : ""}`} aria-label="Récompense de la série">
    <AuroraMenuIcon name={perfect ? "reward" : "complete"} />
    <strong>{perfect ? `${total}/${total} · Une étoile de lecture !` : "Ta série du jour est faite !"}</strong>
    <p>{habitMessage(summary)}</p>
    <small>Une série suffit pour aujourd’hui. Tu peux revenir demain.</small>
    {!storageAvailable && <p role="status">La sauvegarde locale est indisponible. Garde cette page ouverte pour conserver ce résultat.</p>}
    <a href="/journey">Voir mon parcours</a>
  </aside>;
}
