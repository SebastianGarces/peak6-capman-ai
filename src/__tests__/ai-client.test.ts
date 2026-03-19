import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("AI client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  it("sends correct request to grading endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total_score: 85, criteria_evaluation: [], feedback_summary: "Good", probing_questions: [], skill_objectives_demonstrated: [], skill_objectives_failed: [] }),
    });

    const { gradeResponse } = await import("@/lib/ai/client");
    await gradeResponse({
      scenarioId: "s1",
      scenarioText: "test",
      rubric: {},
      studentResponse: "response",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/grading/evaluate");
    expect(opts.headers["x-internal-token"]).toBeDefined();
  });

  it("returns error when service unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

    const { gradeResponse } = await import("@/lib/ai/client");
    await expect(
      gradeResponse({ scenarioId: "s1", scenarioText: "t", rubric: {}, studentResponse: "r" })
    ).rejects.toThrow();
  });
});
