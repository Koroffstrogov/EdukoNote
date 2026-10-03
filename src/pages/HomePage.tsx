import { MobileHomeLauncher } from "../components/home/MobileHomeLauncher";
import { DailyHomeCard } from "../components/home/DailyHomeCard";
import type { PracticeSummary } from "../components/progress/PracticeReward";
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
import { usePracticeDays } from "../hooks/usePracticeDays";
import "../theme/journey.css";

export const HOME_MOBILE_MEDIA_QUERY = "(max-width: 47.99rem)";

export function HomePage() {
  const { progress, activeClef, resetStoredProgress } = useProgress();
  const practice = usePracticeDays();
  const isMobileHome = useMediaQuery(HOME_MOBILE_MEDIA_QUERY);
  const notesToReview = countAnswerLabelsToReview(progress, activeClef);

  if (isMobileHome) {
    return <MobileHomeLauncher activeClef={activeClef} notesToReview={notesToReview} practice={practice.summary} />;
  }

  return (
    <DesktopHomeDashboard
      progress={progress}
      activeClef={activeClef}
      onResetProgress={resetStoredProgress}
      practice={practice.summary}
    />
  );
}

type DesktopHomeDashboardProps = {
  progress: ProgressState;
  activeClef: Clef;
  onResetProgress: () => void;
  practice: PracticeSummary;
};

function DesktopHomeDashboard({ progress, activeClef, onResetProgress, practice }: DesktopHomeDashboardProps) {
  return (
    <main className="app-shell studio-shell aurora-shell studio-home aurora-home daily-desktop-home">
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <SettingsButton />
      </nav>

      <header className="studio-home-hero">
        <div className="studio-home-hero__copy">
          <p className="studio-overline">Session active · {CLEF_LABELS[activeClef]}</p>
          <h1>Un peu chaque jour</h1>
          <p>Dix notes pour prendre confiance et lire plus facilement.</p>
          <a className="aurora-play-cta" href="/journey?play=daily" aria-label="Commencer ma série du jour">
            <span>
              <strong>Ma série du jour</strong>
              <small>10 notes, sans chrono</small>
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
      <DailyHomeCard summary={practice} />

      <div className="home-layout studio-home-layout">
        <section className="home-actions studio-setlist" aria-labelledby="home-sessions-title">
          <div className="studio-section-heading studio-setlist__heading">
            <div>
              <p className="studio-overline">Choisis ton mode</p>
              <h2 id="home-sessions-title">Ta prochaine session</h2>
            </div>
            <span>7 options</span>
          </div>
          <HomeActionCard title="Entraînement libre" text="Choisis ton rythme et ta zone" icon={<AuroraMenuIcon name="note" />} href="/exercise?mode=training" tone="lavender" />
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
            text="Joue ou trouve la touche"
            icon={<AuroraMenuIcon name="piano" />}
            href="/piano"
            tone="lavender"
          />
          <HomeActionCard
            title="Rythmes"
            text="Pulsation, écho et lecture"
            icon={<AuroraMenuIcon name="rhythm" />}
            href="/rhythms"
            tone="vanilla"
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
