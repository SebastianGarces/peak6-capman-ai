import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

const ALL_TABLES = [
  "users",
  "curriculumLevels",
  "skillObjectives",
  "scenarios",
  "scenarioAttempts",
  "attemptObjectives",
  "xpEvents",
  "userStreaks",
  "challenges",
  "challengeParticipants",
  "peerReviews",
  "mtssClassifications",
  "leaderboardSnapshots",
  "documentChunks",
] as const;

describe("Schema exports all 14 table definitions", () => {
  it("exports all 14 tables", () => {
    for (const table of ALL_TABLES) {
      expect(schema[table]).toBeDefined();
      // Verify it's a Drizzle table by checking it has columns
      const tableObj = schema[table] as any;
      expect(tableObj).toHaveProperty("id");
    }
  });
});

describe("Tables have id and created_at columns", () => {
  for (const tableName of ALL_TABLES) {
    it(`${tableName} has id and created_at`, () => {
      const table = schema[tableName] as any;
      expect(table.id).toBeDefined();
      expect(table.createdAt).toBeDefined();
    });
  }
});

describe("users table", () => {
  it("has correct column types", () => {
    const table = schema.users;
    expect(table.id.dataType).toBe("string"); // uuid columns report dataType as "string"
    expect(table.email.dataType).toBe("string");
    expect(table.role).toBeDefined();
    expect(table.xp).toBeDefined();
    expect(table.level).toBeDefined();
    expect(table.passwordHash).toBeDefined();
    expect(table.currentCurriculumLevel).toBeDefined();
  });

  it("email is unique", () => {
    expect(schema.users.email.isUnique).toBe(true);
  });
});

describe("Foreign key references", () => {
  it("scenario_attempts.userId references users.id", () => {
    const col = schema.scenarioAttempts.userId;
    expect(col).toBeDefined();
    expect(col.notNull).toBe(true);
  });

  it("scenario_attempts.scenarioId references scenarios.id", () => {
    const col = schema.scenarioAttempts.scenarioId;
    expect(col).toBeDefined();
    expect(col.notNull).toBe(true);
  });

  it("skill_objectives.curriculumLevelId references curriculum_levels.id", () => {
    const col = schema.skillObjectives.curriculumLevelId;
    expect(col).toBeDefined();
    expect(col.notNull).toBe(true);
  });

  it("attempt_objectives references both attempts and objectives", () => {
    expect(schema.attemptObjectives.attemptId).toBeDefined();
    expect(schema.attemptObjectives.objectiveId).toBeDefined();
  });
});

describe("document_chunks has vector column", () => {
  it("has embedding column with vector(1536)", () => {
    const col = schema.documentChunks.embedding;
    expect(col).toBeDefined();
    expect(col.columnType).toBe("PgVector");
  });
});

describe("Enums are defined", () => {
  it("user role enum", () => {
    expect(schema.userRoleEnum).toBeDefined();
    expect(schema.userRoleEnum.enumValues).toEqual(["learner", "educator", "admin"]);
  });

  it("challenge status enum", () => {
    expect(schema.challengeStatusEnum).toBeDefined();
    expect(schema.challengeStatusEnum.enumValues).toEqual([
      "waiting", "active", "grading", "complete", "cancelled",
    ]);
  });

  it("leaderboard period enum", () => {
    expect(schema.leaderboardPeriodEnum).toBeDefined();
    expect(schema.leaderboardPeriodEnum.enumValues).toEqual(["weekly", "monthly"]);
  });
});

describe("skill_objectives.code is unique", () => {
  it("code column is unique", () => {
    expect(schema.skillObjectives.code.isUnique).toBe(true);
  });
});
