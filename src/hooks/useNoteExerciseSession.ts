import { useCallback, useEffect, useRef, useState } from "react";
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
import { getSpeedTimeLimitSeconds, type SpeedFailure } from "../domain/speed";

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
  const speedDeadlineAtRef = useRef<number | null>(
    mode === "speed"
      ? Date.now() + secondsToMs(getSpeedTimeLimitSeconds(0))
      : null,
  );
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    generateQuestion(null, mode, recentHistoryRef.current, questionIndexRef.current),
  );
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<AnswerLabel | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<ChallengeAnswer[]>([]);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedFailure, setSpeedFailure] = useState<SpeedFailure | null>(null);
  const [speedTimeLeftMs, setSpeedTimeLeftMs] = useState(() =>
    secondsToMs(getSpeedTimeLimitSeconds(0)),
  );
  const finishSpeedFailure = useCallback(
    (reason: SpeedFailure["reason"], selectedLabel: AnswerLabel | null) => {
      recordNoteAnswer(question.note.id, false);
      recordRecentNote(question.note.id);
      setSpeedFailure({
        reason,
        noteId: question.note.id,
        correctLabel: question.note.answerLabel,
        selectedLabel,
      });
    },
    [question.note, recordNoteAnswer, recordRecentNote],
  );

  useEffect(() => {
    if (mode !== "speed" || speedFailure) {
      return undefined;
    }

    const timeLimitMs = secondsToMs(getSpeedTimeLimitSeconds(speedScore));
    const startedAt = Date.now();
    const deadlineAt = startedAt + timeLimitMs;
    let isActive = true;

    answeredRef.current = false;
    speedDeadlineAtRef.current = deadlineAt;
    setSpeedTimeLeftMs(timeLimitMs);

    const timerId = window.setInterval(() => {
      const timeLeftMs = Math.max(0, deadlineAt - Date.now());

      if (!isActive) {
        return;
      }

      setSpeedTimeLeftMs(timeLeftMs);

      if (timeLeftMs <= 0 && !answeredRef.current) {
        answeredRef.current = true;
        finishSpeedFailure("timeout", null);
        window.clearInterval(timerId);
      }
    }, SPEED_TIMER_TICK_MS);

    return () => {
      isActive = false;
      window.clearInterval(timerId);

      if (speedDeadlineAtRef.current === deadlineAt) {
        speedDeadlineAtRef.current = null;
      }
    };
  }, [finishSpeedFailure, mode, question.id, speedFailure, speedScore]);

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

    if (
      mode === "speed" &&
      speedDeadlineAtRef.current !== null &&
      Date.now() >= speedDeadlineAtRef.current
    ) {
      answeredRef.current = true;
      finishSpeedFailure("timeout", null);
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
    const isCorrect = answerLabel === question.note.answerLabel;

    if (!isCorrect) {
      finishSpeedFailure("incorrect", answerLabel);
      return;
    }

    recordNoteAnswer(question.note.id, true);
    recordRecentNote(question.note.id);

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
    setSpeedFailure(null);
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
    speedFailure,
    speedFinished: speedFailure !== null,
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
