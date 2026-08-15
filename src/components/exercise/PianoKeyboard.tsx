import type { CSSProperties } from "react";
import { PIANO_KEYS, type PianoKeyDefinition, type PianoKeyId } from "../../domain/piano";

type PianoKeyboardProps = {
  selectedKeyId: PianoKeyId | null;
  correctKeyId: PianoKeyId;
  revealLabels: boolean;
  disabled: boolean;
  onKeyPress: (keyId: PianoKeyId) => void;
};

const WHITE_KEYS = PIANO_KEYS.filter((key) => key.color === "white");
const BLACK_KEYS = PIANO_KEYS.filter((key) => key.color === "black");
const BLACK_KEY_BOUNDARIES: Record<Extract<PianoKeyId, `${string}-sharp`>, number> = {
  "c-sharp": 1,
  "d-sharp": 2,
  "f-sharp": 4,
  "g-sharp": 5,
  "a-sharp": 6,
};

export function PianoKeyboard({
  selectedKeyId,
  correctKeyId,
  revealLabels,
  disabled,
  onKeyPress,
}: PianoKeyboardProps) {
  return (
    <div
      className={`piano-keyboard${revealLabels ? " piano-keyboard--revealed" : ""}`}
      aria-label="Clavier de piano, une octave de Do à Si"
      data-testid="piano-keyboard"
    >
      <div className="piano-keyboard__white-keys">
        {WHITE_KEYS.map((key) => (
          <PianoKey
            key={key.id}
            pianoKey={key}
            selectedKeyId={selectedKeyId}
            correctKeyId={correctKeyId}
            revealLabels={revealLabels}
            disabled={disabled}
            onKeyPress={onKeyPress}
          />
        ))}
      </div>
      <div className="piano-keyboard__black-keys">
        {BLACK_KEYS.map((key) => {
          const boundary = BLACK_KEY_BOUNDARIES[key.id as keyof typeof BLACK_KEY_BOUNDARIES];
          const style = { "--piano-key-boundary": boundary } as CSSProperties;

          return (
            <PianoKey
              key={key.id}
              pianoKey={key}
              selectedKeyId={selectedKeyId}
              correctKeyId={correctKeyId}
              revealLabels={revealLabels}
              disabled={disabled}
              onKeyPress={onKeyPress}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}

function PianoKey({
  pianoKey,
  selectedKeyId,
  correctKeyId,
  revealLabels,
  disabled,
  onKeyPress,
  style,
}: {
  pianoKey: PianoKeyDefinition;
  selectedKeyId: PianoKeyId | null;
  correctKeyId: PianoKeyId;
  revealLabels: boolean;
  disabled: boolean;
  onKeyPress: (keyId: PianoKeyId) => void;
  style?: CSSProperties;
}) {
  const isSelected = selectedKeyId === pianoKey.id;
  const isCorrect = revealLabels && correctKeyId === pianoKey.id;
  const isIncorrect = revealLabels && isSelected && !isCorrect;
  const classes = [
    "piano-key",
    `piano-key--${pianoKey.color}`,
    isSelected ? "piano-key--selected" : "",
    isCorrect ? "piano-key--correct" : "",
    isIncorrect ? "piano-key--incorrect" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      className={classes}
      type="button"
      aria-label={pianoKey.accessibleLabel}
      aria-pressed={isSelected}
      data-piano-key={pianoKey.id}
      disabled={disabled}
      style={style}
      onClick={() => onKeyPress(pianoKey.id)}
    >
      <span className="piano-key__label" aria-hidden={!revealLabels}>
        {pianoKey.label}
      </span>
    </button>
  );
}
