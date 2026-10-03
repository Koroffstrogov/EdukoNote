import { describe, expect, it } from "vitest";
import { dayNumber, isDay, localDay } from "./calendar";
import { emptyPracticeDays, normalizePracticeDays, recordPracticeDay, summarizePracticeDays } from "./practiceDays";

function finish(day: string, id = day, score = 8) { return { day, id, score, total: 10 }; }
describe("daily practice calendar", () => {
  it("counts a completed series with mistakes once per local day, with a separate perfect reward", () => {
    const once = recordPracticeDay(emptyPracticeDays(), finish("2026-10-02"));
    const twice = recordPracticeDay(once, finish("2026-10-02", "again", 10));
    expect(twice.days).toEqual(["2026-10-02"]);
    expect(twice.perfectSeries).toBe(1);
    expect(recordPracticeDay(twice, finish("2026-10-02", "again", 10))).toBe(twice);
    expect(summarizePracticeDays(twice, "2026-10-02")).toMatchObject({ current: 1, best: 1, completedToday: true });
    expect(recordPracticeDay(twice, { ...finish("2026-10-03"), total: 9 })).toBe(twice);
  });
  it("keeps yesterday's streak available, restarts after a gap and preserves the best", () => {
    let progress = emptyPracticeDays();
    for (const day of ["2026-09-29", "2026-09-30", "2026-10-01"]) progress = recordPracticeDay(progress, finish(day));
    expect(summarizePracticeDays(progress, "2026-10-02")).toMatchObject({ current: 3, completedToday: false });
    expect(summarizePracticeDays(progress, "2026-10-03")).toMatchObject({ current: 0, best: 3 });
    progress = recordPracticeDay(progress, finish("2026-10-03"));
    expect(summarizePracticeDays(progress, "2026-10-03")).toMatchObject({ current: 1, best: 3, totalDays: 4 });
  });
  it("uses calendar dates through leap years, DST and year boundaries, not 24-hour elapsed time", () => {
    expect(dayNumber("2026-03-30") - dayNumber("2026-03-29")).toBe(1);
    expect(dayNumber("2027-01-01") - dayNumber("2026-12-31")).toBe(1);
    expect(isDay("2024-02-29")).toBe(true);
    expect(isDay("2026-02-29")).toBe(false);
    expect(isDay("2026-10-32")).toBe(false);
    expect(localDay(new Date(2026, 9, 2, 23, 59))).toBe("2026-10-02");
  });
  it("normalizes malformed data and ignores future days when computing streaks", () => {
    const progress = normalizePracticeDays({ version: 1, days: ["2026-10-02", "invalid", "2026-10-02", "2099-01-01"], perfectSeries: -2, recentSessions: [null, "id"] });
    expect(progress.days).toHaveLength(2);
    expect(progress.perfectSeries).toBe(0);
    expect(summarizePracticeDays(progress, "2026-10-02")).toMatchObject({ current: 1, totalDays: 1 });
    expect(normalizePracticeDays({ version: 2 })).toEqual(emptyPracticeDays());
  });
});
