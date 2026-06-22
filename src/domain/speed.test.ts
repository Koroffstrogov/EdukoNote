import { describe, expect, it } from "vitest";
import { getSpeedTimeLimitSeconds } from "./speed";

describe("speed", () => {
  it("keeps the initial time for the first block", () => {
    expect(getSpeedTimeLimitSeconds(0)).toBe(3);
    expect(getSpeedTimeLimitSeconds(9)).toBe(3);
  });

  it("reduces the time after ten correct notes", () => {
    expect(getSpeedTimeLimitSeconds(10)).toBe(2.859375);
    expect(getSpeedTimeLimitSeconds(19)).toBe(2.859375);
  });

  it("applies the reduction again after twenty correct notes", () => {
    expect(getSpeedTimeLimitSeconds(20)).toBeCloseTo(2.7275390625);
  });

  it("stays positive and decreases over several blocks", () => {
    const timeLimits = [0, 10, 20, 30, 40].map(getSpeedTimeLimitSeconds);

    expect(timeLimits.every((timeLimit) => timeLimit > 0)).toBe(true);
    expect(timeLimits).toEqual([...timeLimits].sort((first, second) => second - first));
  });
});
