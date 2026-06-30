import {
  MUSIC_SYMBOL_DEFINITIONS,
  getSymbolById,
  isMusicSymbolId,
  type MusicSymbolDefinition,
  type MusicSymbolId,
} from "./musicSymbols";

export const SYMBOL_PROGRESS_STORAGE_KEY = "edukonote.symbolProgress.v1";

export type SymbolProgress = {
  views: number;
  correct: number;
  errors: number;
  lastSeenAt: string | null;
};

export type SymbolProgressState = {
  version: 1;
  symbols: Partial<Record<MusicSymbolId, SymbolProgress>>;
  recentHistory: MusicSymbolId[];
};

export function createEmptySymbolProgress(): SymbolProgress {
  return {
    views: 0,
    correct: 0,
    errors: 0,
    lastSeenAt: null,
  };
}

export function createEmptySymbolProgressState(): SymbolProgressState {
  return {
    version: 1,
    symbols: MUSIC_SYMBOL_DEFINITIONS.reduce(
      (accumulator, symbol) => ({
        ...accumulator,
        [symbol.id]: createEmptySymbolProgress(),
      }),
      {} as Partial<Record<MusicSymbolId, SymbolProgress>>,
    ),
    recentHistory: [],
  };
}

export function normalizeSymbolProgress(value: unknown): SymbolProgressState {
  if (!value || typeof value !== "object") {
    return createEmptySymbolProgressState();
  }

  const candidate = value as Partial<SymbolProgressState>;
  const candidateSymbols =
    candidate.symbols && typeof candidate.symbols === "object"
      ? (candidate.symbols as Record<string, Partial<SymbolProgress> | undefined>)
      : {};
  const recentHistory = Array.isArray(candidate.recentHistory) ? candidate.recentHistory : [];

  return {
    version: 1,
    symbols: normalizeSymbols(candidateSymbols),
    recentHistory: recentHistory.filter(isMusicSymbolId).slice(-3),
  };
}

export function recordSymbolAnswer(
  progress: SymbolProgressState,
  symbolId: MusicSymbolId,
  isCorrect: boolean,
  seenAt = new Date().toISOString(),
): SymbolProgressState {
  const current = progress.symbols[symbolId] ?? createEmptySymbolProgress();

  return {
    ...progress,
    symbols: {
      ...progress.symbols,
      [symbolId]: {
        views: current.views + 1,
        correct: current.correct + (isCorrect ? 1 : 0),
        errors: current.errors + (isCorrect ? 0 : 1),
        lastSeenAt: seenAt,
      },
    },
  };
}

export function recordRecentSymbol(progress: SymbolProgressState, symbolId: MusicSymbolId): SymbolProgressState {
  return {
    ...progress,
    recentHistory: [...progress.recentHistory, symbolId].filter(isMusicSymbolId).slice(-3),
  };
}

export function resetSymbolProgress(): SymbolProgressState {
  return createEmptySymbolProgressState();
}

export function countTotalSymbolCorrect(progress: SymbolProgressState): number {
  return MUSIC_SYMBOL_DEFINITIONS.reduce((total, symbol) => total + getStoredSymbolProgress(progress, symbol.id).correct, 0);
}

export function countTotalSymbolViews(progress: SymbolProgressState): number {
  return MUSIC_SYMBOL_DEFINITIONS.reduce((total, symbol) => total + getStoredSymbolProgress(progress, symbol.id).views, 0);
}

export function countTotalSymbolErrors(progress: SymbolProgressState): number {
  return MUSIC_SYMBOL_DEFINITIONS.reduce((total, symbol) => total + getStoredSymbolProgress(progress, symbol.id).errors, 0);
}

export function getSymbolReviewPool(progress: SymbolProgressState): MusicSymbolDefinition[] {
  return MUSIC_SYMBOL_DEFINITIONS.filter((symbol) => getStoredSymbolProgress(progress, symbol.id).errors > 0).sort(
    (first, second) => {
      const firstProgress = getStoredSymbolProgress(progress, first.id);
      const secondProgress = getStoredSymbolProgress(progress, second.id);
      const errorDifference = secondProgress.errors - firstProgress.errors;

      if (errorDifference !== 0) {
        return errorDifference;
      }

      return firstProgress.correct - secondProgress.correct;
    },
  );
}

function normalizeSymbols(
  candidateSymbols: Record<string, Partial<SymbolProgress> | undefined>,
): Partial<Record<MusicSymbolId, SymbolProgress>> {
  return MUSIC_SYMBOL_DEFINITIONS.reduce((accumulator, symbol) => {
    const symbolProgress = candidateSymbols[symbol.id];

    accumulator[symbol.id] = {
      views: asCount(symbolProgress?.views),
      correct: asCount(symbolProgress?.correct),
      errors: asCount(symbolProgress?.errors),
      lastSeenAt: typeof symbolProgress?.lastSeenAt === "string" ? symbolProgress.lastSeenAt : null,
    };

    return accumulator;
  }, {} as Partial<Record<MusicSymbolId, SymbolProgress>>);
}

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function getStoredSymbolProgress(progress: SymbolProgressState, symbolId: MusicSymbolId): SymbolProgress {
  return progress.symbols[getSymbolById(symbolId).id] ?? createEmptySymbolProgress();
}
