import { useCallback, useEffect, useRef, useState } from "react";
import { PianoLabelsToggle, PianoSoundToggle } from "../components/exercise/PianoControls";
import { PianoKeyboard } from "../components/exercise/PianoKeyboard";
import { PianoOrientationPrompt } from "../components/exercise/PianoOrientationPrompt";
import { AppButton } from "../components/ui/AppButton";
import { StudioBrand } from "../components/ui/StudioBrand";
import {
  FREE_PIANO_KEYS,
  getFreePianoKeyByKeyboardCode,
  type FreePianoKeyId,
  type FreePianoOctave,
} from "../domain/piano";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePianoAudio } from "../hooks/usePianoAudio";
import { PIANO_ROTATION_MEDIA_QUERY } from "./PianoExercisePage";

export function FreePianoPage() {
  const rotationRequired = useMediaQuery(PIANO_ROTATION_MEDIA_QUERY);

  if (rotationRequired) {
    return <PianoOrientationPrompt exitHref="/piano" />;
  }

  return <FreePianoSession />;
}

function FreePianoSession() {
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [largeKeys, setLargeKeys] = useState(false);
  const [octave, setOctave] = useState<FreePianoOctave>(4);
  const [activeKeyIds, setActiveKeyIds] = useState<Set<FreePianoKeyId>>(() => new Set());
  const sourcesRef = useRef(new Map<string, FreePianoKeyId>());
  const audio = usePianoAudio();
  const displayedKeys = largeKeys
    ? FREE_PIANO_KEYS.filter((key) => key.octave === octave).map((key) => ({
      ...key,
      blackKeyBoundary: key.blackKeyBoundary === null ? null : key.blackKeyBoundary - (octave - 4) * 7,
    }))
    : FREE_PIANO_KEYS;

  const startSource = useCallback((sourceId: string, keyId: FreePianoKeyId) => {
    if (sourcesRef.current.has(sourceId)) {
      return;
    }

    const alreadyActive = hasActiveSource(sourcesRef.current, keyId);
    const key = FREE_PIANO_KEYS.find((candidate) => candidate.id === keyId);

    if (!key) {
      return;
    }

    sourcesRef.current.set(sourceId, keyId);

    if (!alreadyActive) {
      audio.startNote(keyId, key.frequency);
      setActiveKeyIds((current) => new Set(current).add(keyId));
    }
  }, [audio.startNote]);

  const stopSource = useCallback((sourceId: string) => {
    const keyId = sourcesRef.current.get(sourceId);

    if (!keyId) {
      return;
    }

    sourcesRef.current.delete(sourceId);

    if (!hasActiveSource(sourcesRef.current, keyId)) {
      audio.stopNote(keyId);
      setActiveKeyIds((current) => {
        const next = new Set(current);
        next.delete(keyId);
        return next;
      });
    }
  }, [audio.stopNote]);

  const stopAllSources = useCallback(() => {
    sourcesRef.current.clear();
    audio.stopAllNotes();
    setActiveKeyIds(new Set());
  }, [audio.stopAllNotes]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || isEditableTarget(event.target)
      ) {
        return;
      }

      const pianoKey = getFreePianoKeyByKeyboardCode(event.code);

      if (!pianoKey || (largeKeys && pianoKey.octave !== octave)) {
        return;
      }

      event.preventDefault();
      startSource(`keyboard:${event.code}`, pianoKey.id);
    }

    function handleKeyUp(event: KeyboardEvent) {
      const pianoKey = getFreePianoKeyByKeyboardCode(event.code);

      if (!pianoKey) {
        return;
      }

      event.preventDefault();
      stopSource(`keyboard:${event.code}`);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        stopAllSources();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", stopAllSources);
    window.addEventListener("pagehide", stopAllSources);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", stopAllSources);
      window.removeEventListener("pagehide", stopAllSources);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startSource, stopAllSources, stopSource, largeKeys, octave]);

  useEffect(() => () => {
    sourcesRef.current.clear();
    audio.stopAllNotes();
  }, [audio.stopAllNotes]);

  function handleToggleMuted() {
    stopAllSources();
    audio.toggleMuted();
  }

  return (
    <main className="studio-shell aurora-shell free-piano">
      <nav className="free-piano__topbar" aria-label="Navigation principale">
        <StudioBrand />
        <div className="free-piano__topbar-actions">
          <button
            className="piano-labels-toggle piano-size-toggle"
            type="button"
            aria-pressed={largeKeys}
            aria-label={largeKeys ? "Afficher les deux octaves" : "Agrandir les touches"}
            onClick={() => { stopAllSources(); setLargeKeys((current) => !current); }}
          >
            <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="m17 17 7 7M8 12h8" />{!largeKeys && <path d="M12 8v8" />}</svg>
            <span>{largeKeys ? "Deux octaves" : "Grandes touches"}</span>
          </button>
          <PianoLabelsToggle
            labelsVisible={labelsVisible}
            onToggleLabels={() => setLabelsVisible((current) => !current)}
          />
          <PianoSoundToggle isMuted={audio.isMuted} onToggleMuted={handleToggleMuted} />
          <AppButton className="free-piano__exit" href="/piano" tone="cream">
            <span aria-hidden="true">←</span> Quitter
          </AppButton>
        </div>
      </nav>

      <header className="free-piano__intro">
        <div>
          <p className="studio-overline">Piano · Jeu libre</p>
          <h1>Joue à ton rythme</h1>
        </div>
        <div className="free-piano__hints">
          {largeKeys ? (
            <div className="piano-octaves" role="group" aria-label="Octave visible">
              {([4, 5] as const).map((value) => (
                <button key={value} type="button" aria-pressed={octave === value} onClick={() => { stopAllSources(); setOctave(value); }}>
                  Do{value}–Si{value}
                </button>
              ))}
            </div>
          ) : <p className="free-piano__tip">Essaie : Do · Do · Sol · Sol · La · La · Sol</p>}
          <p className="free-piano__notes" aria-label="Notes jouées">
            {activeKeyIds.size ? FREE_PIANO_KEYS.filter((key) => activeKeyIds.has(key.id)).map((key) => key.label.split(" / ")[0]).join(" · ") : "Touche, glisse… et compose !"}
          </p>
        </div>
      </header>

      <PianoKeyboard
        key={largeKeys ? octave : "full"}
        keys={displayedKeys}
        activeKeyIds={activeKeyIds}
        revealLabels={labelsVisible}
        className={`piano-keyboard--free-play${largeKeys ? " piano-keyboard--large" : ""}`}
        ariaLabel={largeKeys ? `Clavier de piano libre, octave de Do${octave} à Si${octave}` : "Clavier de piano libre, deux octaves de Do4 à Si5"}
        onKeyPress={(keyId) => audio.playFrequency(FREE_PIANO_KEYS.find((key) => key.id === keyId)!.frequency)}
        onPointerStart={(keyId, pointerId) => startSource(`pointer:${pointerId}`, keyId)}
        onPointerEnd={(pointerId) => stopSource(`pointer:${pointerId}`)}
      />
    </main>
  );
}

function hasActiveSource(
  sources: ReadonlyMap<string, FreePianoKeyId>,
  keyId: FreePianoKeyId,
): boolean {
  return Array.from(sources.values()).includes(keyId);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || !!target.closest('[contenteditable="true"]')
    || target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement;
}
