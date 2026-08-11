import { useEffect, useRef, type RefObject } from "react";
import { CLEF_LABELS, type Clef } from "../../domain/notes";
import { AuroraMenuIcon } from "../ui/AuroraMenuIcon";

export type NotesModeDialogProps = {
  open: boolean;
  activeClef: Clef;
  notesToReview: number;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onRequestClose: () => void;
};

export function NotesModeDialog({
  open,
  activeClef,
  notesToReview,
  triggerRef,
  onRequestClose,
}: NotesModeDialogProps) {
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
      return;
    }

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
  }, [open, triggerRef]);

  return (
    <dialog
      className="notes-mode-dialog"
      id="notes-mode-dialog"
      ref={dialogRef}
      aria-labelledby="notes-mode-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onRequestClose();
        }
      }}
      onClose={onRequestClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onRequestClose();
        }
      }}
    >
      <div className="notes-mode-dialog__sheet">
        <header className="notes-mode-dialog__header">
          <div>
            <p>{CLEF_LABELS[activeClef]}</p>
            <h2 id="notes-mode-dialog-title">Jouer les notes</h2>
          </div>
          <button
            className="notes-mode-dialog__close"
            type="button"
            ref={closeButtonRef}
            aria-label="Fermer les modes Notes"
            onClick={onRequestClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <nav className="notes-mode-dialog__modes" aria-label="Modes Notes">
          <ModeLink
            href="/exercise?mode=training"
            icon="note"
            title="Entraînement"
            text="Joue librement"
          />
          <ModeLink
            href="/exercise?mode=review"
            icon="review"
            title="Révision"
            text={notesToReview > 0 ? `${notesToReview} à revoir` : "Tout est à jour"}
          />
          <ModeLink
            href="/exercise?mode=speed"
            icon="speed"
            title="Vitesse"
            text="Suis le tempo"
          />
        </nav>
      </div>
    </dialog>
  );
}

function ModeLink({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: "note" | "review" | "speed";
  title: string;
  text: string;
}) {
  return (
    <a className="notes-mode-dialog__mode" href={href}>
      <span className="notes-mode-dialog__mode-icon" aria-hidden="true">
        <AuroraMenuIcon name={icon} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <AuroraMenuIcon name="arrow" />
    </a>
  );
}
