import { AppButton } from "../ui/AppButton";
import { StudioBrand } from "../ui/StudioBrand";

export function PianoOrientationPrompt() {
  return (
    <main className="studio-shell aurora-shell piano-orientation-prompt">
      <nav className="piano-orientation-prompt__topbar" aria-label="Navigation principale">
        <StudioBrand />
        <AppButton href="/" tone="cream">Quitter</AppButton>
      </nav>
      <section className="piano-orientation-prompt__content">
        <svg className="piano-orientation-prompt__icon" viewBox="0 0 180 150" aria-hidden="true" focusable="false">
          <rect x="58" y="25" width="64" height="104" rx="12" />
          <path d="M28 71a62 62 0 0 1 25-42" />
          <path d="m43 23 12 4-3 13" />
          <path d="M152 79a62 62 0 0 1-25 42" />
          <path d="m137 127-12-4 3-13" />
          <circle cx="90" cy="116" r="3" />
        </svg>
        <p className="studio-overline">Mode Piano</p>
        <h1>Tourne ton appareil</h1>
        <p>Le clavier a besoin du format paysage pour afficher toute l’octave confortablement.</p>
      </section>
    </main>
  );
}
