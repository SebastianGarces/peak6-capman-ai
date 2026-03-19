import { describe, it, expect } from "vitest";
import { calculateLevel, getLevelName, LEVEL_THRESHOLDS } from "@/lib/game/levels";

describe("Level system", () => {
  it("calculateLevel(0) = 1", () => expect(calculateLevel(0)).toBe(1));
  it("calculateLevel(100) = 2", () => expect(calculateLevel(100)).toBe(2));
  it("calculateLevel(10000) = 10", () => expect(calculateLevel(10000)).toBe(10));
  it("calculateLevel(99) = 1", () => expect(calculateLevel(99)).toBe(1));
  it("calculateLevel(5999) = 8", () => expect(calculateLevel(5999)).toBe(8));

  it("getLevelName(1) = Recruit", () => expect(getLevelName(1)).toBe("Recruit"));
  it("getLevelName(10) = CapMan Pro", () => expect(getLevelName(10)).toBe("CapMan Pro"));
});
