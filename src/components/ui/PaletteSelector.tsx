import { PALETTE_LABELS, paletteTokens, type PaletteId } from "../../theme/tokens";

type PaletteSelectorProps = {
  activePalette: PaletteId;
  onChange: (palette: PaletteId) => void;
};

export function PaletteSelector({ activePalette, onChange }: PaletteSelectorProps) {
  return (
    <section className="palette-selector" aria-labelledby="palette-selector-title">
      <h2 className="palette-selector__title" id="palette-selector-title">
        Palette
      </h2>
      <div className="palette-selector__grid" role="group" aria-label="Choisir la palette graphique">
        {paletteTokens.map((palette) => {
          const isSelected = activePalette === palette.id;

          return (
            <button
              key={palette.id}
              type="button"
              className={`palette-option${isSelected ? " palette-option--selected" : ""}`}
              data-palette={palette.id}
              aria-pressed={isSelected}
              onClick={() => onChange(palette.id)}
            >
              <span className="palette-option__swatches" aria-hidden="true">
                <span className="palette-option__swatch palette-option__swatch--primary" />
                <span className="palette-option__swatch palette-option__swatch--accent-1" />
                <span className="palette-option__swatch palette-option__swatch--accent-2" />
              </span>
              <span className="palette-option__label">{PALETTE_LABELS[palette.id]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
