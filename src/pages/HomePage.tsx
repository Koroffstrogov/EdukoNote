import { MobileHomeLauncher } from "../components/home/MobileHomeLauncher";
import { NoteProgressPanel } from "../components/progress/NoteProgressPanel";
import { AuroraMenuIcon } from "../components/ui/AuroraMenuIcon";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { SettingsButton } from "../components/ui/SettingsButton";
import { StudioBrand } from "../components/ui/StudioBrand";
import { CLEF_LABELS, type Clef } from "../domain/notes";
import type { ProgressState } from "../domain/progress";
import { countAnswerLabelsToReview } from "../domain/progressSummary";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useProgress } from "../hooks/useProgress";

export const HOME_MOBILE_MEDIA_QUERY = "(max-width: 47.99rem)";

export function HomePage() {
  const { progress, activeClef, resetStoredProgress } = useProgress();
  const isMobileHome = useMediaQuery(HOME_MOBILE_MEDIA_QUERY);
  const notesToReview = countAnswerLabelsToReview(progress, activeClef);

  if (isMobileHome) {
    return <MobileHomeLauncher activeClef={activeClef} notesToReview={notesToReview} />;
  }

  return (
    <DesktopHomeDashboard
      progress={progress}
      activeClef={activeClef}
      onResetProgress={resetStoredProgress}
    />
  );
}

type DesktopHomeDashboardProps = {
  progress: ProgressState;
  activeClef: Clef;
  onResetProgress: () => void;
};

function DesktopHomeDashboard({ progress, activeClef, onResetProgress }: DesktopHomeDashboardProps) {
  return (
    <main className="app-shell studio-shell aurora-shell studio-home aurora-home">
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <SettingsButton />
      </nav>

      <header className="studio-home-hero">
        <div className="studio-home-hero__copy">
          <p className="studio-overline">Session active · {CLEF_LABELS[activeClef]}</p>
          <h1>Entre dans le rythme</h1>
          <p>Lis les notes, reconnais les signes et avance à ton tempo.</p>
          <a className="aurora-play-cta" href="/exercise?mode=training" aria-label="Lancer l’entraînement">
            <span>
              <strong>Jouer</strong>
              <small>Entraînement libre</small>
            </span>
            <span className="aurora-play-cta__icon" aria-hidden="true">
              <AuroraMenuIcon name="play" />
            </span>
          </a>
        </div>
        <div className="studio-home-poster" aria-hidden="true">
          <span className="studio-home-poster__number">Aurora</span>
          <span className="studio-home-poster__note">
            <AuroraMenuIcon name="note" />
          </span>
        </div>
      </header>

      <div className="home-layout studio-home-layout">
        <section className="home-actions studio-setlist" aria-labelledby="home-sessions-title">
          <div className="studio-section-heading studio-setlist__heading">
            <div>
              <p className="studio-overline">Choisis ton mode</p>
              <h2 id="home-sessions-title">Ta prochaine session</h2>
            </div>
            <span>5 options</span>
          </div>
          <HomeActionCard
            title="Défi 10 notes"
            text="Teste ta lecture"
            icon={<AuroraMenuIcon name="challenge" />}
            href="/exercise?mode=challenge"
            tone="rose"
            featured
          />
          <HomeActionCard
            title="Révision"
            text="Retrouve tes erreurs"
            icon={<AuroraMenuIcon name="review" />}
            href="/exercise?mode=review"
            tone="lavender"
          />
          <HomeActionCard
            title="Vitesse"
            text="Suis le tempo"
            icon={<AuroraMenuIcon name="speed" />}
            href="/exercise?mode=speed"
            tone="lavender"
          />
          <HomeActionCard
            title="Symboles"
            text="Explore les signes"
            icon={<AuroraMenuIcon name="symbols" />}
            href="/symbols"
            tone="vanilla"
          />
          <HomeActionCard
            title="Piano"
            text="Joue la bonne touche"
            icon={<AuroraMenuIcon name="piano" />}
            href="/exercise?mode=piano"
            tone="lavender"
          />
        </section>

        <section className="home-summary" aria-labelledby="home-progress-title">
          <NoteProgressPanel
            progress={progress}
            activeClef={activeClef}
            headingId="home-progress-title"
            edition="Live"
            onReset={onResetProgress}
          />
        </section>
      </div>
    </main>
  );
}
