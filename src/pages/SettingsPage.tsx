import { BassClef } from "../components/music/BassClef";
import { CClef } from "../components/music/CClef";
import { TrebleClef } from "../components/music/TrebleClef";
import { AppButton } from "../components/ui/AppButton";
import { CLEF_LABELS, CLEFS, type Clef } from "../domain/notes";
import { useProgress } from "../hooks/useProgress";

const CLEF_CONTEXT: Record<Clef, string> = {
  treble: "Pour les notes plus hautes.",
  bass: "Pour les notes plus basses.",
  tenor: "Pour certaines partitions de violoncelle, basson ou trombone.",
};

export function SettingsPage() {
  const { activeClef, switchActiveClef } = useProgress();

  function chooseClef(clef: Clef) {
    switchActiveClef(clef);
    window.location.href = "/";
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

      <section className="style-section" aria-labelledby="clef-choice-title">
        <h2 className="style-section__title" id="clef-choice-title">
          Clé à travailler
        </h2>
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
