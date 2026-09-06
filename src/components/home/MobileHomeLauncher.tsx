import { useRef, useState } from "react";
import { CLEF_LABELS, type Clef } from "../../domain/notes";
import { SettingsButton } from "../ui/SettingsButton";
import { AuroraMenuIcon } from "../ui/AuroraMenuIcon";
import { HomeLauncherIcon } from "./HomeLauncherIcon";
import { HomeModeTile } from "./HomeModeTile";
import { HomeMusicScene } from "./HomeMusicScene";
import { NotesModeDialog } from "./NotesModeDialog";

export type MobileHomeLauncherProps = {
  activeClef: Clef;
  notesToReview: number;
};

export function MobileHomeLauncher({ activeClef, notesToReview }: MobileHomeLauncherProps) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const notesButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <main className="studio-shell aurora-shell mobile-home-launcher">
      <nav className="mobile-home-launcher__topbar" aria-label="Navigation principale">
        <SettingsButton />
      </nav>

      <h1 className="mobile-home-wordmark" aria-label="EdukoNote">
        <span>Eduko</span><span>Note</span>
        <svg className="mobile-home-wordmark__note" viewBox="0 0 24 36" aria-hidden="true" focusable="false">
          <path d="M13 4v22" />
          <path d="M13 5c5.5 1 8 4.4 8 8.8-3-2.4-5.4-3.4-8-3.6" />
          <ellipse cx="8" cy="27" rx="6" ry="4.5" transform="rotate(-18 8 27)" />
        </svg>
      </h1>

      <section className="mobile-home-launcher__stage" aria-label="Démarrer une session">
        <HomeMusicScene />
        <a
          className="mobile-home-play"
          href="/exercise?mode=training"
          aria-label={`Jouer les notes en ${CLEF_LABELS[activeClef]}`}
        >
          <span>Jouer</span>
          <AuroraMenuIcon name="play" />
        </a>
      </section>

      <nav className="mobile-home-modes" aria-label="Choisir une activité">
        <HomeModeTile
          label="Notes"
          icon={<HomeLauncherIcon name="notes" />}
          buttonRef={notesButtonRef}
          expanded={notesDialogOpen}
          controls="notes-mode-dialog"
          onClick={() => setNotesDialogOpen(true)}
        />
        <HomeModeTile
          label="Symboles"
          icon={<HomeLauncherIcon name="symbols" />}
          href="/symbols"
        />
        <HomeModeTile
          label="Défi"
          icon={<HomeLauncherIcon name="challenge" />}
          href="/exercise?mode=challenge"
        />
      </nav>

      <a className="mobile-home-rhythms" href="/rhythms">
        <AuroraMenuIcon name="rhythm" />
        <span><strong>Rythmes</strong> · Trois exercices</span>
        <AuroraMenuIcon name="arrow" />
      </a>

      <NotesModeDialog
        open={notesDialogOpen}
        activeClef={activeClef}
        notesToReview={notesToReview}
        triggerRef={notesButtonRef}
        onRequestClose={() => setNotesDialogOpen(false)}
      />
    </main>
  );
}
