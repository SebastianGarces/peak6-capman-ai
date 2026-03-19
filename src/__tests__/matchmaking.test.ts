import { describe, it, expect, beforeEach } from "vitest";
import { isCompatible, addToQueue, removeFromQueue, findMatch, clearQueue } from "@/lib/challenge/matchmaking";

describe("Matchmaking", () => {
  beforeEach(() => clearQueue());

  it("isCompatible returns true for same level, XP within 400", () => {
    const a = { socketId: "a", userId: "u1", curriculumLevel: 3, xp: 500, joinedAt: Date.now() };
    const b = { socketId: "b", userId: "u2", curriculumLevel: 3, xp: 800, joinedAt: Date.now() };
    expect(isCompatible(a, b)).toBe(true);
  });

  it("isCompatible returns false for different levels", () => {
    const a = { socketId: "a", userId: "u1", curriculumLevel: 3, xp: 500, joinedAt: Date.now() };
    const b = { socketId: "b", userId: "u2", curriculumLevel: 4, xp: 500, joinedAt: Date.now() };
    expect(isCompatible(a, b)).toBe(false);
  });

  it("isCompatible rejects XP difference > 400 before 30s", () => {
    const a = { socketId: "a", userId: "u1", curriculumLevel: 3, xp: 100, joinedAt: Date.now() };
    const b = { socketId: "b", userId: "u2", curriculumLevel: 3, xp: 600, joinedAt: Date.now() };
    expect(isCompatible(a, b, 0)).toBe(false);
  });

  it("relaxed matching at 30s allows ±800 XP", () => {
    const a = { socketId: "a", userId: "u1", curriculumLevel: 3, xp: 100, joinedAt: Date.now() };
    const b = { socketId: "b", userId: "u2", curriculumLevel: 3, xp: 800, joinedAt: Date.now() };
    expect(isCompatible(a, b, 31000)).toBe(true);
  });

  it("after 60s, any same-level player matches", () => {
    const a = { socketId: "a", userId: "u1", curriculumLevel: 3, xp: 100, joinedAt: Date.now() };
    const b = { socketId: "b", userId: "u2", curriculumLevel: 3, xp: 9999, joinedAt: Date.now() };
    expect(isCompatible(a, b, 61000)).toBe(true);
  });

  it("cancel removes player from queue", () => {
    addToQueue({ socketId: "a", userId: "u1", curriculumLevel: 3, xp: 500, joinedAt: Date.now() });
    removeFromQueue("a");
    const match = findMatch({ socketId: "b", userId: "u2", curriculumLevel: 3, xp: 500, joinedAt: Date.now() });
    expect(match).toBeNull();
  });
});
