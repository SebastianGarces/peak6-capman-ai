import { describe, it, expect } from "vitest";
import { calculateXpAward } from "@/lib/game/xp";
import { calculateLevel } from "@/lib/game/levels";

describe("XP calculation", () => {
  it("score 95 gets 25 bonus", () => {
    const result = calculateXpAward(95);
    expect(result).toEqual({ base: 10, bonus: 25, total: 35 });
  });

  it("score 85 gets 10 bonus", () => {
    const result = calculateXpAward(85);
    expect(result).toEqual({ base: 10, bonus: 10, total: 20 });
  });

  it("score 70 gets 0 bonus", () => {
    const result = calculateXpAward(70);
    expect(result).toEqual({ base: 10, bonus: 0, total: 10 });
  });
});

describe("Level calculation", () => {
  it("calculateLevel(0) = 1", () => expect(calculateLevel(0)).toBe(1));
  it("calculateLevel(100) = 2", () => expect(calculateLevel(100)).toBe(2));
  it("calculateLevel(10000) = 10", () => expect(calculateLevel(10000)).toBe(10));
});
