export const SPEED_INITIAL_TIME_SECONDS = 3;
export const SPEED_BLOCK_SIZE = 10;
export const SPEED_DECAY_RATIO = 15 / 16;
export const SPEED_DECAY_OFFSET_SECONDS = 0.05;

export type SpeedReward = {
  title: string;
  message: string;
  badge: string;
};

export function getSpeedTimeLimitSeconds(score: number): number {
  const completedBlocks = Math.max(0, Math.floor(score / SPEED_BLOCK_SIZE));
  let timeLimit = SPEED_INITIAL_TIME_SECONDS;

  for (let blockIndex = 0; blockIndex < completedBlocks; blockIndex += 1) {
    timeLimit = SPEED_DECAY_RATIO * (SPEED_DECAY_OFFSET_SECONDS + timeLimit);
  }

  return timeLimit;
}

export function getSpeedReward(score: number): SpeedReward {
  if (score >= 20) {
    return {
      title: "Championne du tempo !",
      message: "Quelle série rapide.",
      badge: "20+",
    };
  }

  if (score >= 10) {
    return {
      title: "Super réflexes !",
      message: "Tu as passé un palier de vitesse.",
      badge: "10",
    };
  }

  if (score >= 4) {
    return {
      title: "Belle série !",
      message: "Tu gardes le rythme.",
      badge: "★",
    };
  }

  if (score >= 1) {
    return {
      title: "Bon départ !",
      message: "Tu as déjà trouvé des notes sous pression.",
      badge: "♪",
    };
  }

  return {
    title: "Bel essai !",
    message: "Tu as osé le mode rapide.",
    badge: "✓",
  };
}
