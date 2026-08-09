export function StudioBrand() {
  return (
    <a className="brand-mark studio-brand" href="/" aria-label="Accueil EdukoNote">
      <span className="studio-brand__sign" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <circle className="studio-brand__orbit" cx="24" cy="24" r="16.5" />
          <path className="studio-brand__wave" d="M4 29c8-7 13-8 20-3s13 5 20-2" />
          <path className="studio-brand__note" d="M28 11v22.5c0 4.1-3.4 7.5-7.5 7.5S13 37.6 13 33.5s3.4-7.5 7.5-7.5c1.4 0 2.7.4 3.8 1.1V14.4L38 11.5v5.2l-10 2.2V11Z" />
        </svg>
      </span>
      <span className="studio-brand__copy">
        <span className="studio-brand__name">
          Eduko<span>Note</span>
        </span>
        <span className="studio-brand__tagline">Aurora Session</span>
      </span>
    </a>
  );
}
