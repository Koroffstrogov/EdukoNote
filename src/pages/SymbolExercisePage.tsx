import { useMemo, useRef, useState } from "react";
import { MusicSymbolDisplay } from "../components/music/MusicSymbolDisplay";
import { AppButton } from "../components/ui/AppButton";
import { AppCard } from "../components/ui/AppCard";
import { FeedbackCard } from "../components/ui/FeedbackCard";
import { ProgressChip } from "../components/ui/ProgressChip";
import type { MusicSymbolId } from "../domain/musicSymbols";
import {
  generateNextSymbolQuestion,
  getSymbolQuestionPool,
  getSymbolsToReview,
  type SymbolChallengeAnswer,
  type SymbolQuizMode,
  type SymbolQuizQuestion,
} from "../domain/symbolQuiz";
import type { ColorTokenId } from "../theme/tokens";
import { useSymbolProgress } from "../hooks/useSymbolProgress";

const CHALLENGE_LENGTH = 10;
const answerTones: ColorTokenId[] = ["rose", "lavender", "vanilla", "mint"];

const modeLabels: Record<SymbolQuizMode, string> = {
  training: "Entraînement",
  challenge: "Défi",
  review: "Révision",
};

export function SymbolExercisePage() {
  const mode = useMemo(() => readSymbolModeFromUrl(), []);
  const { progress, recordAnswer, recordRecent } = useSymbolProgress();
  const reviewSymbols = mode === "review" ? getSymbolQuestionPool("review", progress) : [];
  const recentHistoryRef = useRef<MusicSymbolId[]>(progress.recentHistory);
  const questionIndexRef = useRef(1);
  const [question, setQuestion] = useState<SymbolQuizQuestion>(() =>
    generateNextSymbolQuestion(
      null,
      recentHistoryRef.current,
      getSymbolQuestionPool(mode, progress),
      mode,
      Math.random,
      questionIndexRef.current,
    ),
  );
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<SymbolChallengeAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (mode === "review" && reviewSymbols.length === 0) {
    return <EmptySymbolReviewState />;
  }

  if (mode === "challenge" && isFinished) {
    return <SymbolResultState answers={answers} onRestart={restartChallenge} />;
  }

  const isCorrect = selectedAnswerLabel === question.symbol.label;

  function handleAnswer(answerLabel: string) {
    if (selectedAnswerLabel !== null) {
      return;
    }

    const answerIsCorrect = answerLabel === question.symbol.label;

    setSelectedAnswerLabel(answerLabel);
    recordAnswer(question.symbol.id, answerIsCorrect);

    if (mode === "challenge") {
      setAnswers((currentAnswers) => [
        ...currentAnswers,
        {
          questionNumber,
          symbolId: question.symbol.id,
          symbolLabel: question.symbol.label,
          selectedLabel: answerLabel,
          isCorrect: answerIsCorrect,
        },
      ]);
    }
  }

  function handleNextQuestion() {
    recordRecent(question.symbol.id);

    if (mode === "challenge" && questionNumber >= CHALLENGE_LENGTH) {
      setIsFinished(true);
      return;
    }

    const nextPool = getSymbolQuestionPool(mode, progress);
    const nextHistory = [...recentHistoryRef.current, question.symbol.id].slice(-3);
    const nextQuestionIndex = questionIndexRef.current + 1;

    recentHistoryRef.current = nextHistory;
    questionIndexRef.current = nextQuestionIndex;

    setQuestion((currentQuestion) =>
      generateNextSymbolQuestion(currentQuestion, nextHistory, nextPool, mode, Math.random, nextQuestionIndex),
    );
    setSelectedAnswerLabel(null);

    if (mode === "challenge") {
      setQuestionNumber((currentQuestionNumber) => currentQuestionNumber + 1);
    }
  }

  function restartChallenge() {
    setAnswers([]);
    setQuestionNumber(1);
    setSelectedAnswerLabel(null);
    setIsFinished(false);
    recentHistoryRef.current = [];
    questionIndexRef.current = 1;
    setQuestion(
      generateNextSymbolQuestion(
        null,
        recentHistoryRef.current,
        getSymbolQuestionPool("challenge", progress),
        "challenge",
        Math.random,
        questionIndexRef.current,
      ),
    );
  }

  return (
    <main className="app-shell exercise-shell">
      <SymbolExerciseTopbar />

      <header className="page-hero">
        <p className="page-eyebrow">Symboles · {modeLabels[mode]}</p>
      </header>

      <div className="exercise-layout">
        <AppCard tone="sky" className="question-card symbol-question-card">
          {mode === "challenge" ? (
            <div className="exercise-meta">
              <ProgressChip label={`${questionNumber}/${CHALLENGE_LENGTH}`} status="current" />
            </div>
          ) : null}
          <h2 className="question-card__title">Quel est ce symbole ?</h2>
          <MusicSymbolDisplay symbol={question.symbol} />
        </AppCard>

        <section className="exercise-action-panel" aria-live="polite">
          {selectedAnswerLabel ? (
            <div className="exercise-feedback">
              <FeedbackCard status={isCorrect ? "success" : "near"}>
                {isCorrect ? `C’est ${question.symbol.label}` : `C’était ${question.symbol.label}`}
              </FeedbackCard>
              <AppButton tone="plum" onClick={handleNextQuestion}>
                {mode === "challenge" && questionNumber >= CHALLENGE_LENGTH ? "Voir le score" : "Symbole suivant"}
              </AppButton>
              {!isCorrect ? <p className="exercise-hint">Tu avais choisi {selectedAnswerLabel}.</p> : null}
            </div>
          ) : (
            <div className="answer-grid" aria-label="Réponses proposées">
              {question.choices.map((choice, index) => (
                <AppButton
                  key={choice}
                  tone={getAnswerTone(choice, question.symbol.label, selectedAnswerLabel, index)}
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

function EmptySymbolReviewState() {
  return (
    <main className="app-shell exercise-shell">
      <SymbolExerciseTopbar />

      <header className="page-hero">
        <p className="page-eyebrow">Symboles · Révision</p>
        <h1 className="page-title">Aucune erreur ici</h1>
      </header>

      <AppCard tone="mint">
        <h2 className="app-card__title">Bravo !</h2>
        <p className="app-card__body">Dès qu’un symbole sera presque trouvé, il apparaîtra ici.</p>
        <div className="button-row">
          <AppButton href="/symbols/exercise?mode=training" tone="plum">
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

type SymbolResultStateProps = {
  answers: SymbolChallengeAnswer[];
  onRestart: () => void;
};

function SymbolResultState({ answers, onRestart }: SymbolResultStateProps) {
  const score = answers.filter((answer) => answer.isCorrect).length;
  const symbolsToReview = getSymbolsToReview(answers);

  return (
    <main className="app-shell">
      <SymbolExerciseTopbar />

      <header className="page-hero">
        <p className="page-eyebrow">Défi symboles terminé</p>
        <h1 className="page-title">Score {score}/10</h1>
      </header>

      <div className="styleguide-layout">
        <AppCard tone={score >= 7 ? "mint" : "vanilla"}>
          <h2 className="app-card__title">{score >= 7 ? "Bravo !" : "Presque !"}</h2>
          <p className="app-card__body">
            {score >= 7 ? "Très belle série de symboles." : "Les symboles à revoir sont prêts."}
          </p>
          <div className="button-row">
            <AppButton tone="plum" onClick={onRestart}>
              Refaire le défi
            </AppButton>
            <AppButton href="/" tone="cream">
              Retour accueil
            </AppButton>
          </div>
        </AppCard>

        {symbolsToReview.length > 0 ? (
          <section className="style-section" aria-labelledby="symbol-review-list-title">
            <h2 className="style-section__title" id="symbol-review-list-title">
              Symboles à revoir
            </h2>
            <div className="chip-row">
              {symbolsToReview.map((answer, index) => (
                <ProgressChip key={`${answer.symbolId}-${index}`} label={answer.symbolLabel} status="missed" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function SymbolExerciseTopbar() {
  return (
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
  );
}

function getAnswerTone(
  choice: string,
  correctAnswer: string,
  selectedAnswer: string | null,
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

function readSymbolModeFromUrl(): SymbolQuizMode {
  const mode = new URLSearchParams(window.location.search).get("mode");

  if (mode === "challenge" || mode === "review") {
    return mode;
  }

  return "training";
}
