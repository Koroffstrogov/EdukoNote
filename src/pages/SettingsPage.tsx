import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { BassClef } from "../components/music/BassClef";
import { CClef } from "../components/music/CClef";
import { TrebleClef } from "../components/music/TrebleClef";
import { NoteProgressPanel } from "../components/progress/NoteProgressPanel";
import { PianoProgressPanel } from "../components/progress/PianoProgressPanel";
import { ReadingZoneSelector } from "../components/settings/ReadingZoneSelector";
import { AppButton } from "../components/ui/AppButton";
import { StudioBrand } from "../components/ui/StudioBrand";
import {
  CLEF_LABELS,
  CLEFS,
  type Clef,
} from "../domain/notes";
import { useProgress } from "../hooks/useProgress";
import { usePianoProgress } from "../hooks/usePianoProgress";
import { useSettings } from "../hooks/useSettings";

type SettingsTab = "clef" | "reading-zone" | "progress";

const SETTINGS_TABS: SettingsTab[] = ["clef", "reading-zone", "progress"];

const CLEF_CONTEXT: Record<Clef, string> = {
  treble: "Pour les notes plus hautes.",
  bass: "Pour les notes plus basses.",
  tenor: "Pour certaines partitions de violoncelle, basson ou trombone.",
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("clef");
  const clefTabRef = useRef<HTMLButtonElement>(null);
  const readingZoneTabRef = useRef<HTMLButtonElement>(null);
  const progressTabRef = useRef<HTMLButtonElement>(null);
  const { progress, activeClef, switchActiveClef, resetStoredProgress } = useProgress();
  const { pianoProgress, resetStoredPianoProgress } = usePianoProgress();
  const { settings, updateReadingZone } = useSettings();
  const activeReadingZone = settings.readingZones[activeClef];

  function chooseClef(clef: Clef) {
    switchActiveClef(clef);
  }

  function selectTabFromKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>, currentTab: SettingsTab) {
    const currentIndex = SETTINGS_TABS.indexOf(currentTab);
    let nextTab: SettingsTab | undefined;

    if (event.key === "ArrowRight") {
      nextTab = SETTINGS_TABS[(currentIndex + 1) % SETTINGS_TABS.length];
    } else if (event.key === "ArrowLeft") {
      nextTab = SETTINGS_TABS[(currentIndex - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length];
    } else if (event.key === "Home") {
      nextTab = SETTINGS_TABS[0];
    } else if (event.key === "End") {
      nextTab = SETTINGS_TABS[SETTINGS_TABS.length - 1];
    }

    if (!nextTab) {
      return;
    }

    event.preventDefault();
    setActiveTab(nextTab);
    const nextTabRef = nextTab === "clef"
      ? clefTabRef
      : nextTab === "reading-zone"
        ? readingZoneTabRef
        : progressTabRef;

    nextTabRef.current?.focus();
  }

  return (
    <main className="app-shell studio-shell aurora-shell aurora-settings-page">
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <AppButton href="/" tone="cream">
          Accueil
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Ton espace</p>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-lead">Ajuste la lecture à ton instrument, ton niveau et ta progression.</p>
      </header>

      <div className="settings-tabs" role="tablist" aria-label="Réglages">
        <button
          className={`settings-tab${activeTab === "clef" ? " settings-tab--active" : ""}`}
          type="button"
          ref={clefTabRef}
          id="settings-clef-tab"
          role="tab"
          aria-selected={activeTab === "clef"}
          aria-controls="settings-clef-panel"
          tabIndex={activeTab === "clef" ? 0 : -1}
          onClick={() => setActiveTab("clef")}
          onKeyDown={(event) => selectTabFromKeyboard(event, "clef")}
        >
          Clé à travailler
        </button>
        <button
          className={`settings-tab${activeTab === "reading-zone" ? " settings-tab--active" : ""}`}
          type="button"
          ref={readingZoneTabRef}
          id="settings-reading-zone-tab"
          role="tab"
          aria-selected={activeTab === "reading-zone"}
          aria-controls="settings-reading-zone-panel"
          tabIndex={activeTab === "reading-zone" ? 0 : -1}
          onClick={() => setActiveTab("reading-zone")}
          onKeyDown={(event) => selectTabFromKeyboard(event, "reading-zone")}
        >
          Zone de lecture
        </button>
        <button
          className={`settings-tab${activeTab === "progress" ? " settings-tab--active" : ""}`}
          type="button"
          ref={progressTabRef}
          id="settings-progress-tab"
          role="tab"
          aria-selected={activeTab === "progress"}
          aria-controls="settings-progress-panel"
          tabIndex={activeTab === "progress" ? 0 : -1}
          onClick={() => setActiveTab("progress")}
          onKeyDown={(event) => selectTabFromKeyboard(event, "progress")}
        >
          Progression
        </button>
      </div>

      {activeTab === "clef" ? (
        <section
          className="style-section"
          id="settings-clef-panel"
          role="tabpanel"
          aria-labelledby="settings-clef-tab"
        >
          <h2 className="style-section__title">Clé à travailler</h2>
          <div className="clef-choice-grid">
            {CLEFS.map((clef) => {
              const isActive = activeClef === clef;

              return (
                <button
                  className={`clef-choice-card${isActive ? " clef-choice-card--active" : ""}`}
                  key={clef}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => chooseClef(clef)}
                >
                  <span className="clef-choice-card__symbol" aria-hidden="true">
                    <ClefSymbol clef={clef} />
                  </span>
                  <span className="clef-choice-card__content">
                    <span className="clef-choice-card__title">{CLEF_LABELS[clef]}</span>
                    <span className="clef-choice-card__text">{CLEF_CONTEXT[clef]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : activeTab === "reading-zone" ? (
        <section
          className="style-section settings-reading-zone"
          id="settings-reading-zone-panel"
          role="tabpanel"
          aria-labelledby="settings-reading-zone-tab"
        >
          <h2 className="style-section__title">Zone de lecture</h2>
          <p className="reading-zone-hint">
            <strong>{CLEF_LABELS[activeClef]}</strong> · Exercices de notes
          </p>
          <ReadingZoneSelector
            value={activeReadingZone}
            onSelect={(readingZone) => updateReadingZone(activeClef, readingZone)}
          />
          <p className="reading-zone-hint">Choix mémorisé pour cette clé.</p>
        </section>
      ) : (
        <section
          className="settings-progress-section"
          id="settings-progress-panel"
          role="tabpanel"
          aria-labelledby="settings-progress-tab"
        >
          <NoteProgressPanel
            progress={progress}
            activeClef={activeClef}
            headingId="settings-progress-title"
            eyebrow="Notes"
            title="Ta progression"
            className="settings-progress-card"
            onReset={resetStoredProgress}
          />
          <PianoProgressPanel
            progress={pianoProgress}
            activeClef={activeClef}
            onReset={() => resetStoredPianoProgress(activeClef)}
          />
        </section>
      )}
    </main>
  );
}

function ClefSymbol({ clef }: { clef: Clef }) {
  if (clef === "treble") {
    return <TrebleClef className="clef-choice-card__clef" height={72} />;
  }

  if (clef === "bass") {
    return <BassClef className="clef-choice-card__clef" height={64} />;
  }

  return <CClef className="clef-choice-card__clef" height={62} />;
}
