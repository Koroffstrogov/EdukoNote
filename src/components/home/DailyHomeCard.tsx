import { habitMessage, type PracticeSummary } from "../progress/PracticeReward";
import { AuroraMenuIcon } from "../ui/AuroraMenuIcon";

export function DailyHomeCard({ summary }: { summary: PracticeSummary }) {
  return <a className="daily-home-card" href="/journey">
    <AuroraMenuIcon name={summary.completedToday ? "complete" : "challenge"} />
    <span><strong>{habitMessage(summary)}</strong><small>{summary.completedToday ? "Aujourd’hui, c’est fait" : "10 notes suffisent"} · Mon parcours</small></span>
    <AuroraMenuIcon name="arrow" />
  </a>;
}
