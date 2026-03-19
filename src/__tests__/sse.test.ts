import { describe, it, expect, vi } from "vitest";

// Mock the DB module
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => [{ id: "1", name: "Test", xp: 100, level: 1 }]),
        })),
      })),
    })),
  },
}));

describe("SSE Leaderboard Stream", () => {
  it("returns correct content-type headers", async () => {
    const { GET } = await import("@/app/api/leaderboard/stream/route");
    const response = await GET();
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
  });
});
