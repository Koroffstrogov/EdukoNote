export function StudioBrand() {
  return (
    <a className="brand-mark studio-brand" href="/" aria-label="Accueil EdukoNote">
      <span className="studio-brand__sign" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <g className="studio-brand__staff">
            <path d="M5 10h38M5 17h38M5 24h38M5 31h38M5 38h38" />
          </g>
          <path className="studio-brand__letter" d="M14 8v32M14 9h23M14 24h18M14 39h23" />
          <circle className="studio-brand__note" cx="35" cy="24" r="3.4" />
        </svg>
      </span>
      <span className="studio-brand__copy">
        <span className="studio-brand__name">EdukoNote</span>
        <span className="studio-brand__tagline">Le club de musique</span>
      </span>
    </a>
  );
}
