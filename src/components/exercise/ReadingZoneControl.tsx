import { useEffect, useId, useRef, useState } from "react";
import { CLEF_LABELS, READING_ZONE_LABELS, type Clef, type ReadingZone } from "../../domain/notes";
import { ReadingZoneSelector } from "../settings/ReadingZoneSelector";

type ReadingZoneControlProps = {
  mode: "training" | "review";
  activeClef: Clef;
  value: ReadingZone;
  onSelect: (readingZone: ReadingZone) => void;
};

export function ReadingZoneControl({ mode, activeClef, value, onSelect }: ReadingZoneControlProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      wasOpenRef.current = true;
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
      }
      closeButtonRef.current?.focus();
    } else {
      if (dialog.open) {
        if (typeof dialog.close === "function") {
          dialog.close();
        } else {
          dialog.removeAttribute("open");
        }
      }
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        triggerRef.current?.focus();
      }
    }
  }, [open]);

  return (
    <>
      <button
        className="reading-zone-trigger"
        type="button"
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        Zone : {READING_ZONE_LABELS[value]}
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      <dialog
        className="notes-mode-dialog reading-zone-dialog"
        id={dialogId}
        ref={dialogRef}
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-context`}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <div className="notes-mode-dialog__sheet">
          <header className="notes-mode-dialog__header">
            <div>
              <h2 id={`${dialogId}-title`}>Zone de lecture</h2>
              <p id={`${dialogId}-context`}>
                {mode === "training" ? "Entraînement" : "Révision"} · {CLEF_LABELS[activeClef]}
              </p>
            </div>
            <button
              className="notes-mode-dialog__close"
              type="button"
              ref={closeButtonRef}
              aria-label="Fermer les réglages rapides"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>
          <ReadingZoneSelector
            value={value}
            onSelect={(readingZone) => {
              onSelect(readingZone);
              setOpen(false);
            }}
          />
          <p className="reading-zone-hint">Choix mémorisé pour la {CLEF_LABELS[activeClef].toLocaleLowerCase("fr-FR")}.</p>
        </div>
      </dialog>
    </>
  );
}
