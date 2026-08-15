import { useEffect, useRef } from "react";
import { CLEF_LABELS, type Clef } from "../../domain/notes";
import { getPianoKey, type PianoKeyId, type PianoQuestion } from "../../domain/piano";
import { StaffNote } from "../music/StaffNote";
import { AppButton } from "../ui/AppButton";
import { FeedbackCard } from "../ui/FeedbackCard";
import { StudioBrand } from "../ui/StudioBrand";
import { PianoKeyboard } from "./PianoKeyboard";

type PianoExerciseViewProps = {
  activeClef: Clef;
  question: PianoQuestion;
  selectedKeyId: PianoKeyId | null;
  isMuted: boolean;
  onToggleMuted: () => void;
  onKeyPress: (keyId: PianoKeyId) => void;
  onNextQuestion: () => void;
};

export function PianoExerciseView({
  activeClef,
  question,
  selectedKeyId,
  isMuted,
  onToggleMuted,
  onKeyPress,
  onNextQuestion,
}: PianoExerciseViewProps) {
  const isAnswered = selectedKeyId !== null;
  const isCorrect = selectedKeyId === question.notation.keyId;
  const questionTitleRef = useRef<HTMLHeadingElement>(null);
  const previousQuestionIdRef = useRef(question.id);

  useEffect(() => {
    if (previousQuestionIdRef.current !== question.id) {
      questionTitleRef.current?.focus();
    }

    previousQuestionIdRef.current = question.id;
  }, [question.id]);

  return (
    <main className="studio-shell aurora-shell piano-exercise">
      <nav className="piano-exercise__topbar" aria-label="Navigation principale">
        <StudioBrand />
        <div className="piano-exercise__topbar-actions">
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
          <AppButton className="piano-exercise__exit" href="/" tone="cream">
            <span aria-hidden="true">←</span> Quitter
          </AppButton>
        </div>
      </nav>

      <section className="piano-exercise__question" aria-labelledby="piano-question-title">
        <div className="piano-exercise__prompt">
          <p className="studio-overline">Piano · {CLEF_LABELS[activeClef]}</p>
          <h1 id="piano-question-title" ref={questionTitleRef} tabIndex={-1}>
            Joue cette note
          </h1>
        </div>

        <div className="piano-exercise__notation">
          <StaffNote
            note={question.notation.baseNote}
            accidental={question.notation.accidental}
            accessibleLabel={getPianoQuestionAccessibleLabel(question)}
          />
        </div>

        <div className="piano-exercise__feedback">
          {isAnswered ? (
            <>
              <FeedbackCard status={isCorrect ? "success" : "near"}>
                {isCorrect
                  ? `Oui : ${question.notation.label}`
                  : `C’était ${question.notation.label}. Tu as joué ${getPianoKey(selectedKeyId).label}.`}
              </FeedbackCard>
              <AppButton className="piano-exercise__next" tone="plum" autoFocus onClick={onNextQuestion}>
                Note suivante
              </AppButton>
            </>
          ) : (
            <p>Écoute et repère la bonne touche.</p>
          )}
        </div>
      </section>

      <PianoKeyboard
        selectedKeyId={selectedKeyId}
        correctKeyId={question.notation.keyId}
        revealLabels={isAnswered}
        disabled={isAnswered}
        onKeyPress={onKeyPress}
      />
    </main>
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

function getPianoQuestionAccessibleLabel(question: PianoQuestion): string {
  const accidental = question.notation.accidental === "sharp"
    ? " avec un dièse"
    : question.notation.accidental === "flat"
      ? " avec un bémol"
      : " sans altération";

  return `Note à jouer en ${CLEF_LABELS[question.notation.clef].toLocaleLowerCase("fr-FR")}${accidental}, position ${describeStaffPosition(question.notation.baseNote.stepIndex)}.`;
}

function describeStaffPosition(stepIndex: number): string {
  if (stepIndex >= 0 && stepIndex <= 8) {
    return stepIndex % 2 === 0
      ? `ligne ${stepIndex / 2 + 1} depuis le bas`
      : `interligne ${(stepIndex + 1) / 2} depuis le bas`;
  }

  const distance = stepIndex < 0 ? Math.abs(stepIndex) : stepIndex - 8;
  const direction = stepIndex < 0 ? "sous la portée" : "au-dessus de la portée";

  return distance % 2 === 0
    ? `ligne supplémentaire ${distance / 2} ${direction}`
    : `espace ${Math.ceil(distance / 2)} ${direction}`;
}
