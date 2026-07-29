import { useRef, useState } from "react";
import type { MusicSymbolId } from "../domain/musicSymbols";
import {
  SYMBOL_CHALLENGE_LENGTH,
  generateNextSymbolQuestion,
  getSymbolQuestionPool,
  type SymbolChallengeAnswer,
  type SymbolQuizMode,
  type SymbolQuizQuestion,
} from "../domain/symbolQuiz";
import type { SymbolProgressState } from "../domain/symbolProgress";

type UseSymbolExerciseSessionOptions = {
  mode: SymbolQuizMode;
  progress: SymbolProgressState;
  recordAnswer: (symbolId: MusicSymbolId, isCorrect: boolean) => void;
  recordRecent: (symbolId: MusicSymbolId) => void;
};

export function useSymbolExerciseSession({
  mode,
  progress,
  recordAnswer,
  recordRecent,
}: UseSymbolExerciseSessionOptions) {
  const recentHistoryRef = useRef<MusicSymbolId[]>(progress.recentHistory);
  const questionIndexRef = useRef(1);
  const answeredRef = useRef(false);
  const [question, setQuestion] = useState<SymbolQuizQuestion>(() =>
    generateQuestion(null, mode, recentHistoryRef.current, questionIndexRef.current),
  );
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<SymbolChallengeAnswer[]>([]);
  const [challengeFinished, setChallengeFinished] = useState(false);

  function generateQuestion(
    previousQuestion: SymbolQuizQuestion | null,
    questionMode: SymbolQuizMode,
    recentHistory: MusicSymbolId[],
    questionIndex: number,
    currentProgress = progress,
  ) {
    return generateNextSymbolQuestion(
      previousQuestion,
      recentHistory,
      getSymbolQuestionPool(questionMode, currentProgress),
      questionMode,
      Math.random,
      questionIndex,
    );
  }

  function selectAnswer(answerLabel: string) {
    if (answeredRef.current) {
      return;
    }

    answeredRef.current = true;

    const isCorrect = answerLabel === question.symbol.label;

    setSelectedAnswerLabel(answerLabel);
    recordAnswer(question.symbol.id, isCorrect);

    if (mode === "challenge") {
      setAnswers((currentAnswers) => [
        ...currentAnswers,
        {
          questionNumber,
          symbolId: question.symbol.id,
          symbolLabel: question.symbol.label,
          selectedLabel: answerLabel,
          isCorrect,
        },
      ]);
    }
  }

  function nextQuestion() {
    recordRecent(question.symbol.id);

    if (mode === "challenge" && questionNumber >= SYMBOL_CHALLENGE_LENGTH) {
      setChallengeFinished(true);
      return;
    }

    const nextHistory = appendToRecentHistory(question.symbol.id);
    const nextQuestionIndex = questionIndexRef.current + 1;

    recentHistoryRef.current = nextHistory;
    questionIndexRef.current = nextQuestionIndex;
    setQuestion((currentQuestion) =>
      generateQuestion(currentQuestion, mode, nextHistory, nextQuestionIndex),
    );
    setSelectedAnswerLabel(null);
    answeredRef.current = false;

    if (mode === "challenge") {
      setQuestionNumber((currentQuestionNumber) => currentQuestionNumber + 1);
    }
  }

  function restartChallenge() {
    setAnswers([]);
    setQuestionNumber(1);
    setSelectedAnswerLabel(null);
    setChallengeFinished(false);
    answeredRef.current = false;
    recentHistoryRef.current = [];
    questionIndexRef.current = 1;
    setQuestion(generateQuestion(null, "challenge", recentHistoryRef.current, questionIndexRef.current));
  }

  function appendToRecentHistory(symbolId: MusicSymbolId): MusicSymbolId[] {
    return [...recentHistoryRef.current, symbolId].slice(-3);
  }

  return {
    question,
    selectedAnswerLabel,
    questionNumber,
    answers,
    challengeFinished,
    selectAnswer,
    nextQuestion,
    restartChallenge,
  };
}
