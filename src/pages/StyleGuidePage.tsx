import type { CSSProperties } from "react";
import { StaffPreview } from "../components/music/StaffPreview";
import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { FeedbackCard } from "../components/ui/FeedbackCard";
import { HomeActionCard } from "../components/ui/HomeActionCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import { colorTokens } from "../theme/tokens";

function paletteStyle(cssVariable: string): CSSProperties {
  return {
    "--palette-swatch": `var(${cssVariable})`,
  } as CSSProperties;
}

export function StyleGuidePage() {
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
        <p className="page-eyebrow">Design system</p>
        <h1 className="page-title">Style guide EdukoNote</h1>
        <p className="page-lead">
          Une page unique pour vérifier la palette, les composants et le rendu mobile.
        </p>
      </header>

      <div className="styleguide-layout">
        <section className="style-section" aria-labelledby="palette-title">
          <h2 className="style-section__title" id="palette-title">
            Palette
          </h2>
          <div className="palette-grid">
            {colorTokens.map((color) => (
              <article className="palette-card" key={color.id} style={paletteStyle(color.cssVariable)}>
                <span className="palette-card__sample" aria-hidden="true" />
                <p className="palette-card__name">{color.name}</p>
                <p className="palette-card__code">{color.hex}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="style-section" aria-labelledby="buttons-title">
          <h2 className="style-section__title" id="buttons-title">
            Boutons
          </h2>
          <div className="button-row">
            <AppButton tone="rose">Do</AppButton>
            <AppButton tone="lavender">Ré</AppButton>
            <AppButton tone="vanilla">Mi</AppButton>
            <AppButton tone="mint">Fa</AppButton>
          </div>
        </section>

        <section className="styleguide-grid styleguide-grid--wide" aria-label="Cartes question et feedback">
          <AppCard tone="sky" className="question-card">
            <h2 className="question-card__title">Quelle est cette note ?</h2>
            <StaffPreview note="mi4" />
          </AppCard>
          <AppCard tone="sky" className="question-card">
            <h2 className="question-card__title">Quelle est cette note ?</h2>
            <StaffPreview note="bass-fa3" />
          </AppCard>
          <div className="styleguide-layout">
            <FeedbackCard status="success">C’est Mi</FeedbackCard>
            <FeedbackCard status="near">C’était Fa</FeedbackCard>
          </div>
        </section>

        <section className="style-section" aria-labelledby="chips-title">
          <h2 className="style-section__title" id="chips-title">
            Chips
          </h2>
          <div className="chip-row">
            <ProgressChip label="Do" status="complete" />
            <ProgressChip label="Ré" status="complete" />
            <ProgressChip label="Mi" status="current" />
            <ProgressChip label="Fa" status="missed" />
          </div>
        </section>

        <section className="style-section" aria-labelledby="home-cards-title">
          <h2 className="style-section__title" id="home-cards-title">
            Cartes d’accueil
          </h2>
          <div className="home-actions">
            <HomeActionCard title="Entraînement" text="Démarrer avec quelques notes." icon="♪" tone="rose" />
            <HomeActionCard title="Défi 10 notes" text="Un défi court pour rester concentrée." icon="10" tone="lavender" />
            <HomeActionCard title="Révision des erreurs" text="Reprendre les notes presque trouvées." icon="↺" tone="vanilla" />
          </div>
        </section>

        <section className="style-section" aria-labelledby="mobile-preview-title">
          <h2 className="style-section__title" id="mobile-preview-title">
            Prévisualisation mobile
          </h2>
          <div className="mini-preview-wrap">
            <div className="phone-preview" aria-label="Mini prévisualisation iPhone">
              <div className="phone-preview__screen">
                <div className="phone-preview__header">
                  <h3 className="phone-preview__title">EdukoNote</h3>
                  <ProgressChip label="Mi" status="current" />
                </div>
                <AppCard tone="sky" className="question-card">
                  <h3 className="question-card__title">Quelle est cette note ?</h3>
                  <StaffPreview note="fa4" />
                </AppCard>
                <FeedbackCard status="near">C’était Fa</FeedbackCard>
                <HomeActionCard title="Entraînement" text="Doux et lisible." icon="♪" tone="rose" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
