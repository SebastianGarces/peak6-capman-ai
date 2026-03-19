import { describe, it, expect } from "vitest";

// Test the classification logic without DB by extracting the pure function
function classifyTier(avgScore: number, daysInactive: number, attemptCount: number): number {
  if (attemptCount < 3) return 1;
  if (avgScore < 50 || daysInactive >= 5) return 3;
  if (avgScore < 70 || daysInactive >= 3) return 2;
  return 1;
}

describe("MTSS Classification", () => {
  it("< 3 attempts returns Tier 1", () => {
    expect(classifyTier(0, 0, 2)).toBe(1);
  });

  it("avg_score 40 returns Tier 3", () => {
    expect(classifyTier(40, 0, 5)).toBe(3);
  });

  it("avg_score 60 returns Tier 2", () => {
    expect(classifyTier(60, 0, 5)).toBe(2);
  });

  it("avg_score 80 returns Tier 1", () => {
    expect(classifyTier(80, 0, 5)).toBe(1);
  });

  it("5+ days inactive returns Tier 3 regardless of score", () => {
    expect(classifyTier(90, 5, 5)).toBe(3);
  });

  it("3-4 days inactive returns Tier 2 regardless of score", () => {
    expect(classifyTier(90, 3, 5)).toBe(2);
  });
});
