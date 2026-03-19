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
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({ user: { id: "user-1", role: "learner" } })),
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
