import { useEffect, useRef, useState } from "react";
import type { AnswerLabel, Clef, NoteId, ReadingZone } from "../domain/notes";
import {
  NOTE_CHALLENGE_LENGTH,
  generateNextQuestion,
  getQuestionPool,
  type ChallengeAnswer,
  type QuizMode,
  type QuizQuestion,
} from "../domain/quiz";
import type { ProgressState } from "../domain/progress";
import { getSpeedTimeLimitSeconds } from "../domain/speed";

const SPEED_TIMER_TICK_MS = 100;

type UseNoteExerciseSessionOptions = {
  mode: QuizMode;
  progress: ProgressState;
  activeClef: Clef;
  activeReadingZone: ReadingZone;
  recordNoteAnswer: (noteId: NoteId, isCorrect: boolean) => void;
  recordRecentNote: (noteId: NoteId) => void;
};

export function useNoteExerciseSession({
  mode,
  progress,
  activeClef,
  activeReadingZone,
  recordNoteAnswer,
  recordRecentNote,
}: UseNoteExerciseSessionOptions) {
  const recentHistoryRef = useRef<NoteId[]>(
    mode === "speed" ? [] : progress.clefs[activeClef].recentHistory,
  );
  const questionIndexRef = useRef(1);
  const answeredRef = useRef(false);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    generateQuestion(null, mode, recentHistoryRef.current, questionIndexRef.current),
  );
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<AnswerLabel | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<ChallengeAnswer[]>([]);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedFinished, setSpeedFinished] = useState(false);
  const [speedTimeLeftMs, setSpeedTimeLeftMs] = useState(() =>
    secondsToMs(getSpeedTimeLimitSeconds(0)),
  );

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

  function generateQuestion(
    previousQuestion: QuizQuestion | null,
    questionMode: QuizMode,
    recentHistory: NoteId[],
    questionIndex: number,
    currentProgress = progress,
  ) {
    return generateNextQuestion(
      previousQuestion,
      recentHistory,
      getQuestionPool(questionMode, activeClef, currentProgress, activeReadingZone),
      questionMode,
      Math.random,
      questionIndex,
    );
  }

  function selectAnswer(answerLabel: AnswerLabel) {
    if (answeredRef.current) {
      return;
    }

    answeredRef.current = true;

    if (mode === "speed") {
      handleSpeedAnswer(answerLabel);
      return;
    }

    const isCorrect = answerLabel === question.note.answerLabel;

    setSelectedAnswerLabel(answerLabel);
    recordNoteAnswer(question.note.id, isCorrect);

    if (mode === "challenge") {
      setAnswers((currentAnswers) => [
        ...currentAnswers,
        {
          questionNumber,
          noteId: question.note.id,
          noteLabel: question.note.answerLabel,
          selectedLabel: answerLabel,
          isCorrect,
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
    const nextHistory = appendToRecentHistory(question.note.id);
    const nextQuestionIndex = questionIndexRef.current + 1;

    recentHistoryRef.current = nextHistory;
    questionIndexRef.current = nextQuestionIndex;
    setSpeedScore(nextScore);
    setQuestion((currentQuestion) =>
      generateQuestion(currentQuestion, "speed", nextHistory, nextQuestionIndex),
    );
  }

  function nextQuestion() {
    recordRecentNote(question.note.id);

    if (mode === "challenge" && questionNumber >= NOTE_CHALLENGE_LENGTH) {
      setChallengeFinished(true);
      return;
    }

    const nextHistory = appendToRecentHistory(question.note.id);
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
    resetQuestionState("challenge");
    setAnswers([]);
    setQuestionNumber(1);
    setChallengeFinished(false);
  }

  function restartSpeed() {
    resetQuestionState("speed");
    setSpeedScore(0);
    setSpeedFinished(false);
    setSpeedTimeLeftMs(secondsToMs(getSpeedTimeLimitSeconds(0)));
  }

  function resetQuestionState(questionMode: QuizMode) {
    setSelectedAnswerLabel(null);
    answeredRef.current = false;
    recentHistoryRef.current = [];
    questionIndexRef.current = 1;
    setQuestion(generateQuestion(null, questionMode, recentHistoryRef.current, questionIndexRef.current));
  }

  function appendToRecentHistory(noteId: NoteId): NoteId[] {
    return [...recentHistoryRef.current, noteId].slice(-3);
  }

  return {
    question,
    selectedAnswerLabel,
    questionNumber,
    answers,
    challengeFinished,
    speedScore,
    speedFinished,
    speedTimeLeftMs,
    selectAnswer,
    nextQuestion,
    restartChallenge,
    restartSpeed,
  };
}

function secondsToMs(seconds: number): number {
  return Math.round(seconds * 1000);
}
