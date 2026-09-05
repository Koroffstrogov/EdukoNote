import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { PIANO_KEYS, type PianoKeyId } from "../../domain/piano";

export type PianoKeyboardKeyDefinition<KeyId extends string> = {
  id: KeyId;
  label: string;
  accessibleLabel: string;
  color: "white" | "black";
  shortcut?: string;
  blackKeyBoundary: number | null;
};

type PianoKeyboardProps<KeyId extends string> = {
  keys?: readonly PianoKeyboardKeyDefinition<KeyId>[];
  selectedKeyId?: KeyId | null;
  correctKeyId?: KeyId | null;
  activeKeyIds?: ReadonlySet<KeyId>;
  revealLabels: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onKeyPress?: (keyId: KeyId) => void;
  onPointerStart?: (keyId: KeyId, pointerId: number) => void;
  onPointerEnd?: (pointerId: number) => void;
};

const QUIZ_BLACK_KEY_BOUNDARIES: Partial<Record<PianoKeyId, number>> = {
  "c-sharp": 1,
  "d-sharp": 2,
  "f-sharp": 4,
  "g-sharp": 5,
  "a-sharp": 6,
};

const QUIZ_KEYS: PianoKeyboardKeyDefinition<PianoKeyId>[] = PIANO_KEYS.map((key) => ({
  id: key.id,
  label: key.label,
  accessibleLabel: key.accessibleLabel,
  color: key.color,
  blackKeyBoundary: QUIZ_BLACK_KEY_BOUNDARIES[key.id] ?? null,
}));

const EMPTY_ACTIVE_KEYS = new Set<string>();

export function PianoKeyboard<KeyId extends string = PianoKeyId>({
  keys,
  selectedKeyId = null,
  correctKeyId = null,
  activeKeyIds = EMPTY_ACTIVE_KEYS as unknown as ReadonlySet<KeyId>,
  revealLabels,
  disabled = false,
  className = "",
  ariaLabel = "Clavier de piano, une octave de Do à Si",
  onKeyPress,
  onPointerStart,
  onPointerEnd,
}: PianoKeyboardProps<KeyId>) {
  const pointers = useRef(new Map<number, KeyId | null>());
  const endPointerRef = useRef(onPointerEnd);
  endPointerRef.current = onPointerEnd;
  useEffect(() => {
    const releaseAll = () => {
      pointers.current.forEach((_, id) => endPointerRef.current?.(id));
      pointers.current.clear();
    };
    const onHidden = () => { if (document.visibilityState === "hidden") releaseAll(); };
    window.addEventListener("blur", releaseAll);
    window.addEventListener("pagehide", releaseAll);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("blur", releaseAll);
      window.removeEventListener("pagehide", releaseAll);
      document.removeEventListener("visibilitychange", onHidden);
      releaseAll();
    };
  }, []);
  const displayedKeys = (keys ?? QUIZ_KEYS) as readonly PianoKeyboardKeyDefinition<KeyId>[];
  const whiteKeys = displayedKeys.filter((key) => key.color === "white");
  const blackKeys = displayedKeys.filter((key) => key.color === "black");
  const keyboardStyle = { "--piano-white-key-count": whiteKeys.length } as CSSProperties;

  function keyAtElement(root: HTMLElement, element: Element | null): KeyId | null {
    const button = element?.closest<HTMLButtonElement>("[data-piano-key]");
    if (!button || !root.contains(button) || button.disabled) return null;
    return displayedKeys.find((key) => key.id === button.dataset.pianoKey)?.id ?? null;
  }

  function releasePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    onPointerEnd?.(event.pointerId);
  }

  return (
    <div
      className={[
        "piano-keyboard",
        revealLabels ? "piano-keyboard--revealed" : "",
        className,
      ].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      data-testid="piano-keyboard"
      style={keyboardStyle}
      onContextMenu={onPointerStart ? (event) => event.preventDefault() : undefined}
      onPointerDown={onPointerStart ? (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const keyId = keyAtElement(event.currentTarget, event.target as Element);
        if (!keyId) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        pointers.current.set(event.pointerId, keyId);
        onPointerStart(keyId, event.pointerId);
      } : undefined}
      onPointerMove={onPointerStart ? (event) => {
        if (!pointers.current.has(event.pointerId)) return;
        event.preventDefault();
        // Pointer capture keeps the gesture alive; hit-testing still follows the visible keys.
        const keyId = keyAtElement(event.currentTarget, document.elementFromPoint(event.clientX, event.clientY));
        if (pointers.current.get(event.pointerId) === keyId) return;
        pointers.current.set(event.pointerId, keyId);
        onPointerEnd?.(event.pointerId);
        if (keyId) onPointerStart(keyId, event.pointerId);
      } : undefined}
      onPointerUp={onPointerEnd ? releasePointer : undefined}
      onPointerCancel={onPointerEnd ? releasePointer : undefined}
      onLostPointerCapture={onPointerEnd ? releasePointer : undefined}
      onPointerLeave={onPointerEnd ? (event) => {
        if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) releasePointer(event);
      } : undefined}
    >
      <div className="piano-keyboard__white-keys">
        {whiteKeys.map((key) => (
          <PianoKey
            key={key.id}
            pianoKey={key}
            selectedKeyId={selectedKeyId}
            correctKeyId={correctKeyId}
            activeKeyIds={activeKeyIds}
            revealLabels={revealLabels}
            disabled={disabled}
            onKeyPress={onKeyPress}
            onPointerStart={onPointerStart}
          />
        ))}
      </div>
      <div className="piano-keyboard__black-keys">
        {blackKeys.map((key) => {
          const style = { "--piano-key-boundary": key.blackKeyBoundary ?? 0 } as CSSProperties;

          return (
            <PianoKey
              key={key.id}
              pianoKey={key}
              selectedKeyId={selectedKeyId}
              correctKeyId={correctKeyId}
              activeKeyIds={activeKeyIds}
              revealLabels={revealLabels}
              disabled={disabled}
              onKeyPress={onKeyPress}
              onPointerStart={onPointerStart}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}

function PianoKey<KeyId extends string>({
  pianoKey,
  selectedKeyId,
  correctKeyId,
  activeKeyIds,
  revealLabels,
  disabled,
  onKeyPress,
  onPointerStart,
  style,
}: {
  pianoKey: PianoKeyboardKeyDefinition<KeyId>;
  selectedKeyId: KeyId | null;
  correctKeyId: KeyId | null;
  activeKeyIds: ReadonlySet<KeyId>;
  revealLabels: boolean;
  disabled: boolean;
  onKeyPress?: (keyId: KeyId) => void;
  onPointerStart?: (keyId: KeyId, pointerId: number) => void;
  style?: CSSProperties;
}) {
  const isSelected = selectedKeyId === pianoKey.id;
  const isActive = activeKeyIds.has(pianoKey.id);
  const isCorrect = revealLabels && correctKeyId === pianoKey.id;
  const isIncorrect = revealLabels && isSelected && correctKeyId !== null && !isCorrect;
  const classes = [
    "piano-key",
    `piano-key--${pianoKey.color}`,
    isSelected ? "piano-key--selected" : "",
    isActive ? "piano-key--active" : "",
    isCorrect ? "piano-key--correct" : "",
    isIncorrect ? "piano-key--incorrect" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      className={classes}
      type="button"
      aria-label={pianoKey.accessibleLabel}
      aria-pressed={isSelected || isActive}
      data-piano-key={pianoKey.id}
      disabled={disabled}
      style={style}
      onClick={onKeyPress ? (event) => {
        // Assistive-technology / Enter activation has no preceding pointer gesture.
        if (!onPointerStart || event.detail === 0) onKeyPress(pianoKey.id);
      } : undefined}
    >
      <span className="piano-key__label" aria-hidden={!revealLabels}>
        <span className="piano-key__spellings">
          {pianoKey.label.split(" / ").map((label) => <span key={label}>{label}</span>)}
        </span>
        {pianoKey.shortcut ? <kbd>{pianoKey.shortcut}</kbd> : null}
      </span>
    </button>
  );
}
