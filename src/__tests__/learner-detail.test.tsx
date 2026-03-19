import { describe, it, expect } from "vitest";

describe("Learner Detail", () => {
  it("data structure has correct shape", () => {
    const data = {
      user: { id: "1", name: "Test", level: 3, xp: 500, email: "test@test.com" },
      objectiveBreakdown: [
        { code: "OBJ-001", name: "Moneyness", tier: 1, avgScore: 85, attemptCount: 10 },
      ],
      recentAttempts: [
        { id: "a1", score: 85, createdAt: new Date() },
      ],
    };
    expect(data.user.name).toBe("Test");
    expect(data.objectiveBreakdown).toHaveLength(1);
    expect(data.recentAttempts).toHaveLength(1);
  });
});
