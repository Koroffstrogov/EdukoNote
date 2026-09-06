import { useId } from "react";
import { READING_ZONE_LABELS, READING_ZONES, type ReadingZone } from "../../domain/notes";

const READING_ZONE_CONTEXT: Record<ReadingZone, string> = {
  lower: "Les notes du bas de la portée.",
  upper: "Les notes du haut de la portée.",
  full: "Les notes du bas et du haut de la portée.",
};

type ReadingZoneSelectorProps = {
  value: ReadingZone;
  onSelect: (readingZone: ReadingZone) => void;
};

export function ReadingZoneSelector({ value, onSelect }: ReadingZoneSelectorProps) {
  const descriptionId = useId();

  return (
    <div className="reading-zone-selector">
      <div className="reading-zone-choice-grid" role="group" aria-label="Choisir la zone de lecture">
        {READING_ZONES.map((readingZone) => (
          <button
            className={`reading-zone-choice-card${value === readingZone ? " reading-zone-choice-card--active" : ""}`}
            key={readingZone}
            type="button"
            aria-pressed={value === readingZone}
            aria-describedby={`${descriptionId}-${readingZone}`}
            onClick={() => onSelect(readingZone)}
          >
            <ReadingZoneDiagram readingZone={readingZone} />
            <span className="reading-zone-choice-card__title">{READING_ZONE_LABELS[readingZone]}</span>
            <svg className="reading-zone-choice-card__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </button>
        ))}
      </div>
      {READING_ZONES.map((readingZone) => (
        <p
          className="reading-zone-choice-card__text"
          id={`${descriptionId}-${readingZone}`}
          key={readingZone}
          hidden={readingZone !== value}
        >
          {READING_ZONE_CONTEXT[readingZone]}
        </p>
      ))}
    </div>
  );
}

function ReadingZoneDiagram({ readingZone }: { readingZone: ReadingZone }) {
  const highlightY = readingZone === "lower" ? 48 : 16;
  const highlightHeight = readingZone === "full" ? 64 : 32;
  const notePositions = readingZone === "lower" ? [66] : readingZone === "upper" ? [30] : [66, 30];

  return (
    <svg className="reading-zone-diagram" viewBox="0 0 160 96" aria-hidden="true" focusable="false">
      <rect className="reading-zone-diagram__highlight" x="16" y={highlightY} width="128" height={highlightHeight} rx="8" />
      {[24, 36, 48, 60, 72].map((lineY) => (
        <line className="reading-zone-diagram__line" key={lineY} x1="20" y1={lineY} x2="140" y2={lineY} />
      ))}
      {notePositions.map((cy) => (
        <ellipse className="reading-zone-diagram__note" key={cy} cx="80" cy={cy} rx="8" ry="6" transform={`rotate(-14 80 ${cy})`} />
      ))}
    </svg>
  );
}
