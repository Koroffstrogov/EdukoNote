export const SPEED_INITIAL_TIME_SECONDS = 3;
export const SPEED_BLOCK_SIZE = 10;
export const SPEED_DECAY_RATIO = 15 / 16;
export const SPEED_DECAY_OFFSET_SECONDS = 0.05;

export function getSpeedTimeLimitSeconds(score: number): number {
  const completedBlocks = Math.max(0, Math.floor(score / SPEED_BLOCK_SIZE));
  let timeLimit = SPEED_INITIAL_TIME_SECONDS;

  for (let blockIndex = 0; blockIndex < completedBlocks; blockIndex += 1) {
    timeLimit = SPEED_DECAY_RATIO * (SPEED_DECAY_OFFSET_SECONDS + timeLimit);
  }

  return timeLimit;
}
