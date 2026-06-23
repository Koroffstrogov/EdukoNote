import { useEffect, useMemo, useRef, useState } from "react";
import { StaffNote } from "../components/music/StaffNote";
import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { FeedbackCard } from "../components/ui/FeedbackCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import type { ColorTokenId } from "../theme/tokens";
import { CLEF_LABELS, READING_ZONE_LABELS, getOtherClef, type AnswerLabel, type Clef, type NoteId } from "../domain/notes";
import {
  generateNextQuestion,
  getQuestionPool,
  getReviewNotes,
  type ChallengeAnswer,
  type QuizMode,
  type QuizQuestion,
} from "../domain/quiz";
import { getSpeedTimeLimitSeconds } from "../domain/speed";
import { useProgress } from "../hooks/useProgress";
import { useSettings } from "../hooks/useSettings";
import { ResultPage } from "./ResultPage";

const CHALLENGE_LENGTH = 10;
const SPEED_TIMER_TICK_MS = 100;
const answerTones: ColorTokenId[] = ["rose", "lavender", "vanilla", "mint"];

const modeCopy: Record<QuizMode, { title: string }> = {
  training: {
    title: "Une note à la fois",
  },
  challenge: {
    title: "Score en 10 notes",
  },
  review: {
    title: "On reprend doucement",
  },
  speed: {
    title: "Série rapide",
  },
};

export function ExercisePage() {
  const mode = useMemo(() => readModeFromUrl(), []);
  const { progress, activeClef, switchActiveClef, recordNoteAnswer, recordRecentNote } = useProgress();
  const { settings } = useSettings();
  const activeReadingZone = settings.readingZones[activeClef];
  const nextClef = getOtherClef(activeClef);
  const reviewNotes = mode === "review" ? getReviewNotes(activeClef, progress, activeReadingZone) : [];
  const recentHistoryRef = useRef<NoteId[]>(mode === "speed" ? [] : progress.clefs[activeClef].recentHistory);
  const questionIndexRef = useRef(1);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    generateNextQuestion(null, recentHistoryRef.current, getQuestionPool(mode, activeClef, progress, activeReadingZone), mode, Math.random, questionIndexRef.current),
  );
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<AnswerLabel | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<ChallengeAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedFinished, setSpeedFinished] = useState(false);
  const [speedTimeLeftMs, setSpeedTimeLeftMs] = useState(() => secondsToMs(getSpeedTimeLimitSeconds(0)));
  const answeredRef = useRef(false);

  useEffect(() => {
    if (mode !== "speed" || speedFinished) {
      return undefined;
    }

    const timeLimitMs = secondsToMs(getSpeedTimeLimitSeconds(speedScore));
    const startedAt = Date.now();
    let isActive = true;

    answeredRef.current = false;
    setSpeedTimeLeftMs(timeLimitMs);

    const timerId = window.setInterval(() => {
      const timeLeftMs = Math.max(0, timeLimitMs - (Date.now() - startedAt));

      if (!isActive) {
        return;
      }

      setSpeedTimeLeftMs(timeLeftMs);

      if (timeLeftMs <= 0) {
        answeredRef.current = true;
        setSpeedFinished(true);
        window.clearInterval(timerId);
      }
    }, SPEED_TIMER_TICK_MS);

    return () => {
      isActive = false;
      window.clearInterval(timerId);
    };
  }, [mode, question.id, speedFinished, speedScore]);

  if (mode === "review" && reviewNotes.length === 0) {
    return <EmptyReviewState />;
  }

  if (mode === "challenge" && isFinished) {
    return <ResultPage answers={answers} activeClef={activeClef} onToggleClef={() => switchClefAndGoHome(nextClef)} onRestart={() => restartChallenge(progress)} />;
  }

  if (mode === "speed" && speedFinished) {
    return <SpeedResultState score={speedScore} activeClef={activeClef} onToggleClef={() => switchClefAndGoHome(nextClef)} onRestart={restartSpeed} />;
  }

  const copy = modeCopy[mode];
  const isCorrect = selectedAnswerLabel === question.note.answerLabel;

  function handleAnswer(answerLabel: AnswerLabel) {
    if (answeredRef.current) {
      return;
    }

    answeredRef.current = true;

    if (mode === "speed") {
      handleSpeedAnswer(answerLabel);
      return;
    }

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

  function handleSpeedAnswer(answerLabel: AnswerLabel) {
    if (answerLabel !== question.note.answerLabel) {
      setSpeedFinished(true);
      return;
    }

    const nextScore = speedScore + 1;
    const nextHistory = [...recentHistoryRef.current, question.note.id].slice(-3);
    const nextQuestionIndex = questionIndexRef.current + 1;
    const nextPool = getQuestionPool("speed", activeClef, progress, activeReadingZone);

    recentHistoryRef.current = nextHistory;
    questionIndexRef.current = nextQuestionIndex;
    setSpeedScore(nextScore);
    setQuestion((currentQuestion) =>
      generateNextQuestion(currentQuestion, nextHistory, nextPool, "speed", Math.random, nextQuestionIndex),
    );
  }

  function handleNextQuestion() {
    recordRecentNote(question.note.id);

    if (mode === "challenge" && questionNumber >= CHALLENGE_LENGTH) {
      setIsFinished(true);
      return;
    }

    const nextPool = getQuestionPool(mode, activeClef, progress, activeReadingZone);
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
    setQuestion(generateNextQuestion(null, recentHistoryRef.current, getQuestionPool("challenge", activeClef, currentProgress, activeReadingZone), "challenge", Math.random, questionIndexRef.current));
  }

  function restartSpeed() {
    setSpeedScore(0);
    setSpeedFinished(false);
    setSpeedTimeLeftMs(secondsToMs(getSpeedTimeLimitSeconds(0)));
    setSelectedAnswerLabel(null);
    answeredRef.current = false;
    recentHistoryRef.current = [];
    questionIndexRef.current = 1;
    setQuestion(generateNextQuestion(null, recentHistoryRef.current, getQuestionPool("speed", activeClef, progress, activeReadingZone), "speed", Math.random, questionIndexRef.current));
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
        <p className="page-eyebrow">
          {CLEF_LABELS[activeClef]} · {READING_ZONE_LABELS[activeReadingZone]}
        </p>
        <h1 className="page-title">{copy.title}</h1>
      </header>

      <div className="exercise-layout">
        <AppCard tone="sky" className="question-card">
          <div className="exercise-meta">
            {mode === "speed" ? (
              <>
                <ProgressChip label={`Score ${speedScore}`} status="current" />
                <ProgressChip label={`${formatSpeedTime(speedTimeLeftMs)}s`} status={speedTimeLeftMs <= 1000 ? "missed" : "current"} />
              </>
            ) : mode === "challenge" ? (
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
  const { settings } = useSettings();
  const activeReadingZone = settings.readingZones[activeClef];
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
        <p className="page-eyebrow">
          {CLEF_LABELS[activeClef]} · {READING_ZONE_LABELS[activeReadingZone]}
        </p>
        <h1 className="page-title">Aucune erreur ici</h1>
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

type SpeedResultStateProps = {
  score: number;
  activeClef: Clef;
  onToggleClef: () => void;
  onRestart: () => void;
};

function SpeedResultState({ score, activeClef, onToggleClef, onRestart }: SpeedResultStateProps) {
  const nextClef = getOtherClef(activeClef);

  return (
    <main className="app-shell">
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton tone="cream" onClick={onToggleClef} aria-label={`Passer en ${CLEF_LABELS[nextClef]}`}>
          {CLEF_LABELS[nextClef]}
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">Vitesse</p>
        <h1 className="page-title">Score {score}</h1>
      </header>

      <AppCard tone="vanilla">
        <h2 className="app-card__title">{score} notes à la suite</h2>
        <div className="button-row">
          <AppButton tone="plum" onClick={onRestart}>
            Rejouer
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

  if (mode === "challenge" || mode === "review" || mode === "speed") {
    return mode;
  }

  return "training";
}

function secondsToMs(seconds: number): number {
  return Math.round(seconds * 1000);
}

function formatSpeedTime(timeLeftMs: number): string {
  return (Math.ceil(timeLeftMs / 100) / 10).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
