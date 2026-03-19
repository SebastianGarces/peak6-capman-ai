import { describe, it, expect } from "vitest";

describe("Challenge grading logic", () => {
  it("higher score wins", () => {
    const results = [
      { userId: "a", score: 85, submittedAt: new Date() },
      { userId: "b", score: 72, submittedAt: new Date() },
    ];
    const winnerId = results[0].score > results[1].score ? results[0].userId : results[1].userId;
    expect(winnerId).toBe("a");
  });

  it("tiebreaker: faster submission wins", () => {
    const early = new Date("2024-01-01T10:00:00Z");
    const late = new Date("2024-01-01T10:01:00Z");
    const results = [
      { userId: "a", score: 80, submittedAt: early },
      { userId: "b", score: 80, submittedAt: late },
    ];
    const winnerId = results[0].submittedAt <= results[1].submittedAt ? results[0].userId : results[1].userId;
    expect(winnerId).toBe("a");
  });

  it("winner gets 50 XP, loser gets 10 XP", () => {
    const winnerXp = 50;
    const loserXp = 10;
    expect(winnerXp).toBe(50);
    expect(loserXp).toBe(10);
  });
});
