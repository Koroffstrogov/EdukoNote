import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import {
  countTotalSymbolCorrect,
  countTotalSymbolErrors,
  countTotalSymbolViews,
} from "../domain/symbolProgress";
import { useSymbolProgress } from "../hooks/useSymbolProgress";

export function SymbolsPage() {
  const { progress, resetStoredProgress } = useSymbolProgress();
  const totalViews = countTotalSymbolViews(progress);
  const totalCorrect = countTotalSymbolCorrect(progress);
  const totalErrors = countTotalSymbolErrors(progress);

  return (
    <main className="app-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton href="/" tone="cream">
          Accueil
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Symboles</p>
        <h1 className="page-title">Symboles musicaux</h1>
      </header>

      <div className="home-layout">
        <section className="home-actions" aria-label="Modes symboles">
          <HomeActionCard
            title="Entraînement"
            text="Reconnaître"
            icon="?"
            href="/symbols/exercise?mode=training"
            tone="rose"
            featured
          />
          <HomeActionCard
            title="Défi 10 symboles"
            text="10 symboles"
            icon="10"
            href="/symbols/exercise?mode=challenge"
            tone="lavender"
          />
          <HomeActionCard
            title="Révision des erreurs"
            text="Reprendre"
            icon="↺"
            href="/symbols/exercise?mode=review"
            tone="vanilla"
          />
        </section>

        <section className="home-summary" aria-label="Résumé de progression des symboles">
          <AppCard tone="sky" className="home-progress-card">
            <h2 className="app-card__title">Progression symboles</h2>
            <p className="app-card__body">
              {totalViews > 0 ? "Les symboles deviennent familiers." : "Prête pour découvrir les symboles."}
            </p>
            <div className="home-progress-stats" aria-label="Statistiques symboles">
              <span className="home-progress-stat">
                <span className="home-progress-stat__value">{totalCorrect}</span>
                <span className="home-progress-stat__label">Bonnes</span>
              </span>
              <span className="home-progress-stat">
                <span className="home-progress-stat__value">{totalErrors}</span>
                <span className="home-progress-stat__label">Erreurs</span>
              </span>
              <span className="home-progress-stat">
                <span className="home-progress-stat__value">{totalViews}</span>
                <span className="home-progress-stat__label">Vus</span>
              </span>
            </div>
            <div className="chip-row">
              <ProgressChip label={`Réussis ${totalCorrect}`} status={totalCorrect > 0 ? "complete" : "current"} />
              <ProgressChip label={`À revoir ${totalErrors}`} status={totalErrors > 0 ? "missed" : "current"} />
            </div>
            {totalViews > 0 ? (
              <div className="button-row">
                <AppButton tone="cream" onClick={resetStoredProgress}>
                  Réinitialiser
                </AppButton>
              </div>
            ) : null}
          </AppCard>
        </section>
      </div>
    </main>
  );
}
