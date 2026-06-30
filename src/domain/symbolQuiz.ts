import {
  INITIAL_SYMBOL_IDS,
  MUSIC_SYMBOL_DEFINITIONS,
  getSymbolById,
  type MusicSymbolDefinition,
  type MusicSymbolId,
} from "./musicSymbols";
import { countTotalSymbolCorrect, getSymbolReviewPool, type SymbolProgressState } from "./symbolProgress";

export type SymbolQuizMode = "training" | "challenge" | "review";

export type SymbolQuizQuestion = {
  id: string;
  questionIndex: number;
  symbol: MusicSymbolDefinition;
  choices: string[];
};

export type SymbolChallengeAnswer = {
  questionNumber: number;
  symbolId: MusicSymbolId;
  symbolLabel: string;
  selectedLabel: string;
  isCorrect: boolean;
};

export function getUnlockedTrainingSymbols(progress: SymbolProgressState): MusicSymbolDefinition[] {
  const totalCorrect = countTotalSymbolCorrect(progress);
  const initialSymbolIds = new Set(INITIAL_SYMBOL_IDS);
  const unlockedSymbols = MUSIC_SYMBOL_DEFINITIONS.filter(
    (symbol) => initialSymbolIds.has(symbol.id) || symbol.unlockAfterCorrect <= totalCorrect,
  );

  return unlockedSymbols.length > 0
    ? unlockedSymbols
    : MUSIC_SYMBOL_DEFINITIONS.filter((symbol) => symbol.unlockAfterCorrect === 0);
}

export function getSymbolQuestionPool(
  mode: SymbolQuizMode,
  progress: SymbolProgressState,
): MusicSymbolDefinition[] {
  if (mode === "review") {
    return getSymbolReviewPool(progress);
  }

  if (mode === "challenge") {
    return MUSIC_SYMBOL_DEFINITIONS;
  }

  return getUnlockedTrainingSymbols(progress);
}

export function generateNextSymbolQuestion(
  previousQuestion: SymbolQuizQuestion | null,
  recentHistory: MusicSymbolId[],
  availableSymbols: MusicSymbolDefinition[],
  mode: SymbolQuizMode,
  random: () => number = Math.random,
  questionIndex = 1,
): SymbolQuizQuestion {
  const safePool = availableSymbols.length > 0 ? availableSymbols : MUSIC_SYMBOL_DEFINITIONS;
  const symbol = pickNextSymbol(safePool, previousQuestion?.symbol.id, recentHistory, random);
  const choices = createSymbolChoices(symbol, random);

  return {
    id: `${mode}-${questionIndex}-${symbol.id}`,
    questionIndex,
    symbol,
    choices,
  };
}

export function createSymbolChoices(
  correctSymbol: MusicSymbolDefinition,
  random: () => number = Math.random,
): string[] {
  const groupedDistractors = MUSIC_SYMBOL_DEFINITIONS.filter(
    (symbol) => symbol.id !== correctSymbol.id && symbol.distractorGroup === correctSymbol.distractorGroup,
  ).map((symbol) => symbol.label);
  const fallbackDistractors = MUSIC_SYMBOL_DEFINITIONS.filter((symbol) => symbol.id !== correctSymbol.id).map(
    (symbol) => symbol.label,
  );
  const distractors = fillSymbolDistractors(uniqueLabels(groupedDistractors), fallbackDistractors, correctSymbol.label);

  return shuffle([correctSymbol.label, ...distractors], random);
}

export function getSymbolsToReview(answers: SymbolChallengeAnswer[]): SymbolChallengeAnswer[] {
  return answers.filter((answer) => !answer.isCorrect);
}

function pickNextSymbol(
  pool: MusicSymbolDefinition[],
  previousSymbolId: MusicSymbolId | undefined,
  recentHistory: MusicSymbolId[],
  random: () => number,
): MusicSymbolDefinition {
  const recentSet = new Set(recentHistory.slice(-3));
  const withoutPreviousAndRecent = pool.filter(
    (symbol) => symbol.id !== previousSymbolId && !recentSet.has(symbol.id),
  );
  const withoutPrevious = pool.filter((symbol) => symbol.id !== previousSymbolId);
  const candidates = withoutPreviousAndRecent.length > 0 ? withoutPreviousAndRecent : withoutPrevious.length > 0 ? withoutPrevious : pool;
  const index = Math.floor(random() * candidates.length);

  return candidates[Math.min(index, candidates.length - 1)];
}

function fillSymbolDistractors(
  groupedDistractors: string[],
  fallbackDistractors: string[],
  correctLabel: string,
): string[] {
  const labels = groupedDistractors.filter((label) => label !== correctLabel);

  for (const label of fallbackDistractors) {
    if (labels.length >= 3) {
      break;
    }

    if (label !== correctLabel && !labels.includes(label)) {
      labels.push(label);
    }
  }

  return labels.slice(0, 3);
}

function uniqueLabels(labels: string[]): string[] {
  return labels.filter((label, index) => labels.indexOf(label) === index);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];

    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

export function createPreviousSymbolQuestion(symbolId: MusicSymbolId): SymbolQuizQuestion {
  const symbol = getSymbolById(symbolId);

  return {
    id: `previous-${symbol.id}`,
    questionIndex: 0,
    symbol,
    choices: createSymbolChoices(symbol),
  };
}
