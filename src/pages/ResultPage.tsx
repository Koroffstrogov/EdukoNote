import { type AnswerLabel } from "../domain/notes";
import type { ReactNode } from "react";
import { NOTE_CHALLENGE_LENGTH, type ChallengeAnswer, getNotesToReview } from "../domain/quiz";
import { ChallengeResultView } from "../components/exercise/ChallengeResultView";

export type ResultPageProps = {
  answers: ChallengeAnswer[];
  onRestart: () => void;
  reward?: ReactNode;
};

export function ResultPage({ answers, onRestart, reward }: ResultPageProps) {
  const score = answers.filter((answer) => answer.isCorrect).length;
  const notesToReview = uniqueLabelsToReview(answers);

  return (
    <ChallengeResultView
      eyebrow="Défi notes terminé"
      score={score}
      total={NOTE_CHALLENGE_LENGTH}
      resultStates={answers.map((answer) => answer.isCorrect)}
      itemLabel={{ singular: "note trouvée", plural: "notes trouvées" }}
      reviewTitle="Notes à rejouer"
      reviewItems={notesToReview}
      onRestart={onRestart}
      reward={reward}
    />
  );
}

function uniqueLabelsToReview(answers: ChallengeAnswer[]): AnswerLabel[] {
  return Array.from(new Set(getNotesToReview(answers).map((answer) => answer.noteLabel)));
}
