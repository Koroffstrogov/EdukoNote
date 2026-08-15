import { useEffect, useRef, useState } from "react";
import type { Clef } from "../domain/notes";
import {
  generateNextPianoQuestion,
  type PianoKeyId,
  type PianoQuestion,
  type PianoSpellingId,
} from "../domain/piano";
import type { PianoProgressState } from "../domain/pianoProgress";

type UsePianoExerciseSessionOptions = {
  activeClef: Clef;
  pianoProgress: PianoProgressState;
  recordPianoAnswer: (clef: Clef, spellingId: PianoSpellingId, isCorrect: boolean) => void;
  recordRecentPianoQuestion: (clef: Clef, spellingId: PianoSpellingId) => void;
};

export function usePianoExerciseSession({
  activeClef,
  pianoProgress,
  recordPianoAnswer,
  recordRecentPianoQuestion,
}: UsePianoExerciseSessionOptions) {
  const recentHistoryRef = useRef<PianoSpellingId[]>(pianoProgress.clefs[activeClef].recentHistory);
  const questionIndexRef = useRef(1);
  const answeredRef = useRef(false);
  const activeClefRef = useRef(activeClef);
  const [question, setQuestion] = useState<PianoQuestion>(() =>
    generateNextPianoQuestion(null, recentHistoryRef.current, activeClef, Math.random, questionIndexRef.current),
  );
  const [selectedKeyId, setSelectedKeyId] = useState<PianoKeyId | null>(null);

  useEffect(() => {
    if (activeClefRef.current === activeClef) {
      return;
    }

    activeClefRef.current = activeClef;
    recentHistoryRef.current = pianoProgress.clefs[activeClef].recentHistory;
    questionIndexRef.current = 1;
    answeredRef.current = false;
    setSelectedKeyId(null);
    setQuestion(generateNextPianoQuestion(null, recentHistoryRef.current, activeClef, Math.random, 1));
  }, [activeClef, pianoProgress]);

  function selectKey(keyId: PianoKeyId) {
    if (answeredRef.current) {
      return;
    }

    answeredRef.current = true;
    setSelectedKeyId(keyId);
    recordPianoAnswer(activeClef, question.notation.id, keyId === question.notation.keyId);
  }

  function nextQuestion() {
    const answeredSpellingId = question.notation.id;
    const nextHistory = [...recentHistoryRef.current, answeredSpellingId].slice(-3);
    const nextQuestionIndex = questionIndexRef.current + 1;

    recordRecentPianoQuestion(activeClef, answeredSpellingId);
    recentHistoryRef.current = nextHistory;
    questionIndexRef.current = nextQuestionIndex;
    setQuestion((currentQuestion) =>
      generateNextPianoQuestion(currentQuestion, nextHistory, activeClef, Math.random, nextQuestionIndex),
    );
    setSelectedKeyId(null);
    answeredRef.current = false;
  }

  return {
    question,
    selectedKeyId,
    isAnswered: selectedKeyId !== null,
    isCorrect: selectedKeyId === question.notation.keyId,
    selectKey,
    nextQuestion,
  };
}
