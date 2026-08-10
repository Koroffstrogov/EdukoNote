import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { AuroraMenuIcon } from "../components/ui/AuroraMenuIcon";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import { ResetProgressControl } from "../components/ui/ResetProgressControl";
import { StudioBrand } from "../components/ui/StudioBrand";
import {
  countTotalSymbolCorrect,
  countTotalSymbolErrors,
  countTotalSymbolViews,
  countSymbolsToReview,
} from "../domain/symbolProgress";
import { useSymbolProgress } from "../hooks/useSymbolProgress";

export function SymbolsPage() {
  const { progress, resetStoredProgress } = useSymbolProgress();
  const totalViews = countTotalSymbolViews(progress);
  const totalCorrect = countTotalSymbolCorrect(progress);
  const totalErrors = countTotalSymbolErrors(progress);
  const symbolsToReview = countSymbolsToReview(progress);

  return (
    <main className="app-shell studio-shell aurora-shell aurora-symbols-page">
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <AppButton href="/" tone="cream">
          Accueil
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Exploration</p>
        <h1 className="page-title">Signes &amp; symboles</h1>
        <p className="page-lead">Repère les formes qui donnent vie à la musique.</p>
      </header>

      <div className="home-layout aurora-secondary-layout">
        <section className="home-actions aurora-mode-grid" aria-label="Modes symboles">
          <HomeActionCard
            title="Entraînement"
            text="Explore librement"
            icon={<AuroraMenuIcon name="note" />}
            href="/symbols/exercise?mode=training"
            tone="rose"
            featured
          />
          <HomeActionCard
            title="Défi 10 symboles"
            text="Teste tes repères"
            icon={<AuroraMenuIcon name="challenge" />}
            href="/symbols/exercise?mode=challenge"
            tone="lavender"
          />
          <HomeActionCard
            title="Révision"
            text="Retrouve tes erreurs"
            icon={<AuroraMenuIcon name="review" />}
            href="/symbols/exercise?mode=review"
            tone="vanilla"
          />
        </section>

        <section className="home-summary" aria-label="Résumé de progression des symboles">
          <AppCard tone="sky" className="home-progress-card studio-progress-card aurora-symbol-progress">
            <p className="studio-overline">Ton signal</p>
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
              <ProgressChip
                label={`À revoir ${symbolsToReview}`}
                status={symbolsToReview > 0 ? "missed" : "current"}
              />
            </div>
            {totalViews > 0 ? (
              <div className="button-row">
                <ResetProgressControl
                  confirmationMessage="Effacer toute la progression des symboles ? Cette action est définitive."
                  onConfirm={resetStoredProgress}
                />
              </div>
            ) : null}
          </AppCard>
        </section>
      </div>
    </main>
  );
}
