import { useState } from "react";
import { BassClef } from "../components/music/BassClef";
import { CClef } from "../components/music/CClef";
import { TrebleClef } from "../components/music/TrebleClef";
import { AppButton } from "../components/ui/AppButton";
import {
  CLEF_LABELS,
  CLEFS,
  READING_ZONE_LABELS,
  READING_ZONES,
  type Clef,
  type ReadingZone,
} from "../domain/notes";
import { useProgress } from "../hooks/useProgress";
import { useSettings } from "../hooks/useSettings";

type SettingsTab = "clef" | "reading-zone";

const CLEF_CONTEXT: Record<Clef, string> = {
  treble: "Pour les notes plus hautes.",
  bass: "Pour les notes plus basses.",
  tenor: "Pour certaines partitions de violoncelle, basson ou trombone.",
};

const READING_ZONE_CONTEXT: Record<ReadingZone, string> = {
  lower: "Les notes du bas de la portée.",
  upper: "Les notes du haut de la portée.",
  full: "Toutes les notes.",
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("clef");
  const { activeClef, switchActiveClef } = useProgress();
  const { settings, updateReadingZone } = useSettings();
  const activeReadingZone = settings.readingZones[activeClef];

  function chooseClef(clef: Clef) {
    switchActiveClef(clef);
  }

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
        <p className="page-eyebrow">Réglages</p>
        <h1 className="page-title">Paramètres</h1>
      </header>

      <div className="settings-tabs" role="tablist" aria-label="Réglages">
        <button
          className={`settings-tab${activeTab === "clef" ? " settings-tab--active" : ""}`}
          type="button"
          id="settings-clef-tab"
          role="tab"
          aria-selected={activeTab === "clef"}
          aria-controls="settings-clef-panel"
          onClick={() => setActiveTab("clef")}
        >
          Clé à travailler
        </button>
        <button
          className={`settings-tab${activeTab === "reading-zone" ? " settings-tab--active" : ""}`}
          type="button"
          id="settings-reading-zone-tab"
          role="tab"
          aria-selected={activeTab === "reading-zone"}
          aria-controls="settings-reading-zone-panel"
          onClick={() => setActiveTab("reading-zone")}
        >
          Zone de lecture
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
      ) : (
        <section
          className="style-section"
          id="settings-reading-zone-panel"
          role="tabpanel"
          aria-labelledby="settings-reading-zone-tab"
        >
          <h2 className="style-section__title">Zone de lecture</h2>
          <div className="reading-zone-choice-grid">
            {READING_ZONES.map((readingZone) => {
              const isActive = activeReadingZone === readingZone;

              return (
                <button
                  className={`reading-zone-choice-card${
                    isActive ? " reading-zone-choice-card--active" : ""
                  }`}
                  key={readingZone}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateReadingZone(activeClef, readingZone)}
                >
                  <ReadingZoneDiagram readingZone={readingZone} />
                  <span className="reading-zone-choice-card__content">
                    <span className="reading-zone-choice-card__title">
                      {READING_ZONE_LABELS[readingZone]}
                    </span>
                    <span className="reading-zone-choice-card__text">
                      {READING_ZONE_CONTEXT[readingZone]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
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

function ReadingZoneDiagram({ readingZone }: { readingZone: ReadingZone }) {
  const highlightY = readingZone === "upper" ? 16 : 52;
  const highlightHeight = readingZone === "full" ? 72 : 36;
  const notes = getReadingZoneNotes(readingZone);

  return (
    <svg className="reading-zone-diagram" viewBox="0 0 160 96" aria-hidden="true" focusable="false">
      <rect
        className="reading-zone-diagram__highlight"
        x="16"
        y={readingZone === "full" ? 16 : highlightY}
        width="128"
        height={highlightHeight}
        rx="12"
      />
      {[24, 36, 48, 60, 72].map((lineY) => (
        <line className="reading-zone-diagram__line" key={lineY} x1="20" y1={lineY} x2="140" y2={lineY} />
      ))}
      {notes.map((note, index) => (
        <ellipse
          className="reading-zone-diagram__note"
          key={`${note.cx}-${note.cy}-${index}`}
          cx={note.cx}
          cy={note.cy}
          rx="7"
          ry="5"
          transform={`rotate(-14 ${note.cx} ${note.cy})`}
        />
      ))}
    </svg>
  );
}

function getReadingZoneNotes(readingZone: ReadingZone): Array<{ cx: number; cy: number }> {
  if (readingZone === "lower") {
    return [
      { cx: 64, cy: 72 },
      { cx: 94, cy: 60 },
      { cx: 124, cy: 52 },
    ];
  }

  if (readingZone === "upper") {
    return [
      { cx: 64, cy: 44 },
      { cx: 94, cy: 32 },
      { cx: 124, cy: 24 },
    ];
  }

  return [
    { cx: 58, cy: 72 },
    { cx: 86, cy: 56 },
    { cx: 114, cy: 40 },
    { cx: 136, cy: 24 },
  ];
}
