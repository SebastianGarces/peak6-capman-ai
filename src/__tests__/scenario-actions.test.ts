import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: "attempt-123" }]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => [{ id: "user-1", xp: 50, level: 1 }]),
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => [{ id: "attempt-123", scenarioId: "scenario-1", responseText: "", probingQuestions: [], currentCurriculumLevel: 1 }]),
        })),
      })),
    })),
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({ user: { id: "user-1", role: "learner" } })),
}));

// Mock AI client to fall through to catch block (mock grading)
vi.mock("@/lib/ai/client", () => ({
  gradeResponse: vi.fn(() => { throw new Error("AI unavailable"); }),
  evaluateProbing: vi.fn(() => { throw new Error("AI unavailable"); }),
}));

// Mock gamification
vi.mock("@/actions/gamification", () => ({
  awardXp: vi.fn(() => ({ newXp: 110, newLevel: 1, leveledUp: false })),
}));

// Mock MTSS classifier
vi.mock("@/lib/mtss/classifier", () => ({
  classifyMtss: vi.fn(() => 1),
}));

describe("Scenario server actions", () => {
  it("submitResponse rejects empty response", async () => {
    const { submitResponse } = await import("@/actions/scenario");
    const result = await submitResponse("attempt-1", "   ");
    expect(result.error).toBe("Response cannot be empty");
  });

  it("submitResponse returns score and feedback for valid response", async () => {
    const { submitResponse } = await import("@/actions/scenario");
    const result = await submitResponse("attempt-1", "My analysis of the market...");
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.feedback).toBeDefined();
  });
});
