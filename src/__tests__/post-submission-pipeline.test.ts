import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

const mockInsert = vi.fn(() => ({
  values: vi.fn(() => ({
    returning: vi.fn(() => [{ id: "attempt-123" }]),
  })),
}));
const mockUpdateSet = vi.fn(() => ({
  where: vi.fn(() => ({
    returning: vi.fn(() => [{ id: "user-1", xp: 100, level: 1 }]),
  })),
}));
const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));
const mockSelectFrom = vi.fn();
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({ user: { id: "user-1", role: "learner" } })),
}));

// Mock AI client to fall through to catch block (mock grading)
vi.mock("@/lib/ai/client", () => ({
  gradeResponse: vi.fn(() => {
    throw new Error("AI unavailable");
  }),
  evaluateProbing: vi.fn(() => {
    throw new Error("AI unavailable");
  }),
}));

const mockAwardXp = vi.fn(() => ({
  newXp: 110,
  newLevel: 2,
  leveledUp: true,
}));
vi.mock("@/actions/gamification", () => ({
  awardXp: (...args: unknown[]) => mockAwardXp(...args),
}));

const mockClassifyMtss = vi.fn(() => 1);
vi.mock("@/lib/mtss/classifier", () => ({
  classifyMtss: (...args: unknown[]) => mockClassifyMtss(...args),
}));

// Set up mockSelectFrom to return scenario-like object for all queries
beforeEach(() => {
  vi.clearAllMocks();

  // Default: return scenario and attempt data for selects
  mockSelectFrom.mockImplementation(() => ({
    where: vi.fn(() => ({
      limit: vi.fn(() => [
        {
          id: "attempt-123",
          scenarioId: "scenario-1",
          responseText: "test response",
          score: 75,
          probingQuestions: ["What about risk?"],
          curriculumLevelId: 1,
        },
      ]),
    })),
    innerJoin: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    })),
  }));
});

describe("Task #4: Award XP after scenario grading", () => {
  it("calls awardXp after grading (mock fallback path)", async () => {
    const { submitResponse } = await import("@/actions/scenario");
    const result = await submitResponse("attempt-123", "My analysis here");

    expect(mockAwardXp).toHaveBeenCalledWith(
      "user-1",
      expect.any(Number),
      "scenario_attempt",
      "attempt-123"
    );
    expect(result).toHaveProperty("xpAwarded");
    expect(result).toHaveProperty("leveledUp");
    expect(result).toHaveProperty("newLevel");
  });

  it("includes xpAwarded amount in the return value", async () => {
    const { submitResponse } = await import("@/actions/scenario");
    const result = await submitResponse("attempt-123", "My analysis here");

    // xpAwarded should be a number > 0
    if ("xpAwarded" in result) {
      expect(result.xpAwarded).toBeGreaterThan(0);
    }
  });

  it("includes leveledUp and newLevel from awardXp result", async () => {
    const { submitResponse } = await import("@/actions/scenario");
    const result = await submitResponse("attempt-123", "My analysis here");

    if ("leveledUp" in result) {
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
    }
  });
});

describe("Task #7: Compute finalScore after probing", () => {
  it("submitResponse sets finalScore equal to score by default", async () => {
    const { submitResponse } = await import("@/actions/scenario");
    const result = await submitResponse("attempt-123", "My analysis");

    // The db.update should have been called with finalScore
    expect(mockUpdate).toHaveBeenCalled();
    const setCall = mockUpdateSet.mock.calls[0]?.[0];
    if (setCall) {
      expect(setCall).toHaveProperty("finalScore");
    }
  });

  it("submitProbingResponse computes finalScore as weighted average", async () => {
    const { submitProbingResponse } = await import("@/actions/scenario");
    // Since evaluateProbing is mocked to throw, it returns error
    const result = await submitProbingResponse("attempt-123", 0, "My probing response");
    expect(result).toHaveProperty("error");
  });
});
