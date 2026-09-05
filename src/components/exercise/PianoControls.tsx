export function PianoSoundToggle({
  isMuted,
  onToggleMuted,
}: {
  isMuted: boolean;
  onToggleMuted: () => void;
}) {
  return (
    <button
      className="piano-sound-toggle"
      type="button"
      aria-pressed={isMuted}
      aria-label={isMuted ? "Activer le son du piano" : "Couper le son du piano"}
      onClick={onToggleMuted}
    >
      <SoundIcon muted={isMuted} />
      <span>{isMuted ? "Son coupé" : "Son actif"}</span>
    </button>
  );
}

export function PianoLabelsToggle({
  labelsVisible,
  onToggleLabels,
}: {
  labelsVisible: boolean;
  onToggleLabels: () => void;
}) {
  return (
    <button
      className="piano-labels-toggle"
      type="button"
      aria-pressed={labelsVisible}
      aria-label={labelsVisible ? "Masquer les repères du piano" : "Afficher les repères du piano"}
      onClick={onToggleLabels}
    >
      <LabelsIcon />
      <span>{labelsVisible ? "Repères actifs" : "Repères masqués"}</span>
    </button>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path d="M4 11h5l6-5v16l-6-5H4v-6Z" />
      {muted ? (
        <path d="m19 11 5 6m0-6-5 6" />
      ) : (
        <>
          <path d="M19 10.5a5 5 0 0 1 0 7" />
          <path d="M22 7.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  );
}

function LabelsIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path d="M5 6h18v16H5z" />
      <path d="M9 10h10M9 14h7M9 18h5" />
    </svg>
  );
}
