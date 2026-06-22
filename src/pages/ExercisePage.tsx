import { useMemo, useRef, useState } from "react";
import { StaffNote } from "../components/music/StaffNote";
import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { FeedbackCard } from "../components/ui/FeedbackCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import type { ColorTokenId } from "../theme/tokens";
import { CLEF_LABELS, getOtherClef, type AnswerLabel, type Clef, type NoteId } from "../domain/notes";
import {
  generateNextQuestion,
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
  const { progress, activeClef, switchActiveClef, recordNoteAnswer, recordRecentNote } = useProgress();
  const nextClef = getOtherClef(activeClef);
  const reviewNotes = getReviewNotes(activeClef, progress);
  const recentHistoryRef = useRef<NoteId[]>(progress.clefs[activeClef].recentHistory);
  const questionIndexRef = useRef(1);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    generateNextQuestion(null, recentHistoryRef.current, getQuestionPool(mode, activeClef, progress), mode, Math.random, questionIndexRef.current),
  );
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<AnswerLabel | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<ChallengeAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const answeredRef = useRef(false);

  if (mode === "review" && reviewNotes.length === 0) {
    return <EmptyReviewState />;
  }

  if (mode === "challenge" && isFinished) {
    return <ResultPage answers={answers} activeClef={activeClef} onToggleClef={() => switchClefAndGoHome(nextClef)} onRestart={() => restartChallenge(progress)} />;
  }

  const copy = modeCopy[mode];
  const isCorrect = selectedAnswerLabel === question.note.answerLabel;

  function handleAnswer(answerLabel: AnswerLabel) {
    if (answeredRef.current) {
      return;
    }

    answeredRef.current = true;
    setSelectedAnswerLabel(answerLabel);
    recordNoteAnswer(question.note.id, answerLabel === question.note.answerLabel);

    if (mode === "challenge") {
      setAnswers((currentAnswers) => [
        ...currentAnswers,
        {
          questionNumber,
          noteId: question.note.id,
          noteLabel: question.note.answerLabel,
          selectedLabel: answerLabel,
          isCorrect: answerLabel === question.note.answerLabel,
        },
      ]);
    }
  }

  function handleNextQuestion() {
    recordRecentNote(question.note.id);

    if (mode === "challenge" && questionNumber >= CHALLENGE_LENGTH) {
      setIsFinished(true);
      return;
    }

    const nextPool = getQuestionPool(mode, activeClef, progress);
    const nextHistory = [...recentHistoryRef.current, question.note.id].slice(-3);
    const nextQuestionIndex = questionIndexRef.current + 1;

    recentHistoryRef.current = nextHistory;
    questionIndexRef.current = nextQuestionIndex;

    setQuestion((currentQuestion) => {
      return generateNextQuestion(currentQuestion, nextHistory, nextPool, mode, Math.random, nextQuestionIndex);
    });
    setSelectedAnswerLabel(null);
    answeredRef.current = false;

    if (mode === "challenge") {
      setQuestionNumber((currentQuestionNumber) => currentQuestionNumber + 1);
    }
  }

  function restartChallenge(currentProgress = progress) {
    setAnswers([]);
    setQuestionNumber(1);
    setSelectedAnswerLabel(null);
    setIsFinished(false);
    answeredRef.current = false;
    recentHistoryRef.current = [];
    questionIndexRef.current = 1;
    setQuestion(generateNextQuestion(null, recentHistoryRef.current, getQuestionPool("challenge", activeClef, currentProgress), "challenge", Math.random, questionIndexRef.current));
  }

  function switchClefAndGoHome(clef: Clef) {
    switchActiveClef(clef);
    window.location.href = "/";
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
        <AppButton tone="cream" onClick={() => switchClefAndGoHome(nextClef)} aria-label={`Passer en ${CLEF_LABELS[nextClef]}`}>
          {CLEF_LABELS[nextClef]}
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

        <section className="exercise-action-panel" aria-live="polite">
          {selectedAnswerLabel ? (
            <div className="exercise-feedback">
              <FeedbackCard status={isCorrect ? "success" : "near"}>
                {isCorrect ? `C’est ${question.note.answerLabel}` : `C’était ${question.note.answerLabel}`}
              </FeedbackCard>
              <AppButton tone="plum" onClick={handleNextQuestion}>
                {mode === "challenge" && questionNumber >= CHALLENGE_LENGTH ? "Voir le score" : "Note suivante"}
              </AppButton>
              {!isCorrect ? (
                <p className="exercise-hint">Tu avais choisi {selectedAnswerLabel}.</p>
              ) : null}
            </div>
          ) : (
            <div className="answer-grid" aria-label="Réponses proposées">
              {question.choices.map((choice, index) => (
                <AppButton
                  key={choice}
                  tone={getAnswerTone(choice, question.note.answerLabel, selectedAnswerLabel, index)}
                  disabled={selectedAnswerLabel !== null}
                  onClick={() => handleAnswer(choice)}
                >
                  {choice}
                </AppButton>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyReviewState() {
  const { activeClef, switchActiveClef } = useProgress();
  const nextClef = getOtherClef(activeClef);

  function switchClefAndGoHome(clef: Clef) {
    switchActiveClef(clef);
    window.location.href = "/";
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
        <AppButton tone="cream" onClick={() => switchClefAndGoHome(nextClef)} aria-label={`Passer en ${CLEF_LABELS[nextClef]}`}>
          {CLEF_LABELS[nextClef]}
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
  choice: AnswerLabel,
  correctAnswer: AnswerLabel,
  selectedAnswer: AnswerLabel | null,
  index: number,
): ColorTokenId {
  if (!selectedAnswer) {
    return answerTones[index % answerTones.length];
  }

  if (choice === correctAnswer) {
    return "mint";
  }

  if (choice === selectedAnswer) {
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
