import { useMemo, useRef, useState } from "react";
import { StaffNote } from "../components/music/StaffNote";
import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { FeedbackCard } from "../components/ui/FeedbackCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import type { ColorTokenId } from "../theme/tokens";
import type { NoteId } from "../domain/notes";
import {
  createQuestion,
  getQuestionPool,
  getReviewNotes,
  type ChallengeAnswer,
  type QuizMode,
  type QuizQuestion,
} from "../domain/quiz";
import { useProgress } from "../hooks/useProgress";
import { ResultPage } from "./ResultPage";

const CHALLENGE_LENGTH = 10;
const answerTones: ColorTokenId[] = ["rose", "lavender", "vanilla", "mint"];

const modeCopy: Record<QuizMode, { eyebrow: string; title: string }> = {
  training: {
    eyebrow: "Entraînement",
    title: "Une note à la fois",
  },
  challenge: {
    eyebrow: "Défi 10 notes",
    title: "Score en 10 notes",
  },
  review: {
    eyebrow: "Révision",
    title: "On reprend doucement",
  },
};

export function ExercisePage() {
  const mode = useMemo(() => readModeFromUrl(), []);
  const { progress, recordNoteAnswer } = useProgress();
  const reviewNotes = getReviewNotes(progress);
  const [question, setQuestion] = useState<QuizQuestion>(() => createQuestion(getQuestionPool(mode, progress)));
  const [selectedNoteId, setSelectedNoteId] = useState<NoteId | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<ChallengeAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const answeredRef = useRef(false);

  if (mode === "review" && reviewNotes.length === 0) {
    return <EmptyReviewState />;
  }

  if (mode === "challenge" && isFinished) {
    return <ResultPage answers={answers} onRestart={() => restartChallenge(progress)} />;
  }

  const copy = modeCopy[mode];
  const selectedAnswer = question.choices.find((choice) => choice.id === selectedNoteId);
  const isCorrect = selectedNoteId === question.note.id;

  function handleAnswer(noteId: NoteId) {
    if (answeredRef.current) {
      return;
    }

    answeredRef.current = true;
    setSelectedNoteId(noteId);
    recordNoteAnswer(question.note.id, noteId === question.note.id);

    if (mode === "challenge") {
      const selectedNote = question.choices.find((choice) => choice.id === noteId);

      if (selectedNote) {
        setAnswers((currentAnswers) => [
          ...currentAnswers,
          {
            questionNumber,
            noteId: question.note.id,
            noteLabel: question.note.label,
            selectedNoteId: selectedNote.id,
            selectedLabel: selectedNote.label,
            isCorrect: selectedNote.id === question.note.id,
          },
        ]);
      }
    }
  }

  function handleNextQuestion() {
    if (mode === "challenge" && questionNumber >= CHALLENGE_LENGTH) {
      setIsFinished(true);
      return;
    }

    const nextPool = getQuestionPool(mode, progress);

    setQuestion(createQuestion(nextPool, question.note.id));
    setSelectedNoteId(null);
    answeredRef.current = false;

    if (mode === "challenge") {
      setQuestionNumber((currentQuestionNumber) => currentQuestionNumber + 1);
    }
  }

  function restartChallenge(currentProgress = progress) {
    setAnswers([]);
    setQuestionNumber(1);
    setSelectedNoteId(null);
    setIsFinished(false);
    answeredRef.current = false;
    setQuestion(createQuestion(getQuestionPool("challenge", currentProgress)));
  }

  return (
    <main className="app-shell exercise-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton href="/" tone="cream">
          Accueil
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
      </header>

      <div className="exercise-layout">
        <AppCard tone="sky" className="question-card">
          <div className="exercise-meta">
            {mode === "challenge" ? (
              <ProgressChip label={`${questionNumber}/${CHALLENGE_LENGTH}`} status="current" />
            ) : (
              <ProgressChip label={mode === "training" ? "Sans chrono" : "Erreurs"} status="current" />
            )}
          </div>
          <h2 className="question-card__title">Quelle est cette note ?</h2>
          <StaffNote note={question.note} />
        </AppCard>

        <section className="answer-grid" aria-label="Réponses proposées">
          {question.choices.map((choice, index) => (
            <AppButton
              key={choice.id}
              tone={getAnswerTone(choice.id, question.note.id, selectedNoteId, index)}
              disabled={selectedNoteId !== null}
              onClick={() => handleAnswer(choice.id)}
            >
              {choice.label}
            </AppButton>
          ))}
        </section>

        {selectedNoteId ? (
          <section className="exercise-feedback" aria-live="polite">
            <FeedbackCard status={isCorrect ? "success" : "near"}>
              {isCorrect ? `C’est ${question.note.label}` : `C’était ${question.note.label}`}
            </FeedbackCard>
            <AppButton tone="plum" onClick={handleNextQuestion}>
              {mode === "challenge" && questionNumber >= CHALLENGE_LENGTH ? "Voir le score" : "Note suivante"}
            </AppButton>
            {selectedAnswer && !isCorrect ? (
              <p className="exercise-hint">Tu avais choisi {selectedAnswer.label}.</p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function EmptyReviewState() {
  return (
    <main className="app-shell exercise-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton href="/" tone="cream">
          Accueil
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Révision</p>
        <h1 className="page-title">Aucune erreur pour l’instant</h1>
      </header>

      <AppCard tone="mint">
        <h2 className="app-card__title">Bravo !</h2>
        <p className="app-card__body">Dès qu’une note sera presque trouvée, elle apparaîtra ici.</p>
        <div className="button-row">
          <AppButton href="/exercise?mode=training" tone="plum">
            Entraînement
          </AppButton>
          <AppButton href="/" tone="cream">
            Retour accueil
          </AppButton>
        </div>
      </AppCard>
    </main>
  );
}

function getAnswerTone(
  choiceId: NoteId,
  correctNoteId: NoteId,
  selectedNoteId: NoteId | null,
  index: number,
): ColorTokenId {
  if (!selectedNoteId) {
    return answerTones[index % answerTones.length];
  }

  if (choiceId === correctNoteId) {
    return "mint";
  }

  if (choiceId === selectedNoteId) {
    return "vanilla";
  }

  return "cream";
}

function readModeFromUrl(): QuizMode {
  const mode = new URLSearchParams(window.location.search).get("mode");

  if (mode === "challenge" || mode === "review") {
    return mode;
  }

  return "training";
}
