import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  real,
  serial,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vector } from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "learner",
  "educator",
  "admin",
]);

export const challengeStatusEnum = pgEnum("challenge_status", [
  "waiting",
  "active",
  "grading",
  "complete",
  "cancelled",
]);

export const leaderboardPeriodEnum = pgEnum("leaderboard_period", [
  "weekly",
  "monthly",
]);

// ─── 1. users ────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("learner"),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    avatarUrl: text("avatar_url"),
    currentCurriculumLevel: integer("current_curriculum_level")
      .notNull()
      .default(1),
    lastActiveAt: timestamp("last_active_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

// ─── 2. curriculum_levels ────────────────────────────────

export const curriculumLevels = pgTable(
  "curriculum_levels",
  {
    id: serial("id").primaryKey(),
    levelNumber: integer("level_number").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    prerequisiteLevel: integer("prerequisite_level"),
    masteryThreshold: integer("mastery_threshold").notNull().default(80),
    minAttemptsRequired: integer("min_attempts_required").notNull().default(10),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

// ─── 3. skill_objectives ─────────────────────────────────

export const skillObjectives = pgTable(
  "skill_objectives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    curriculumLevelId: integer("curriculum_level_id")
      .notNull()
      .references(() => curriculumLevels.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

// ─── 4. scenarios ────────────────────────────────────────

export const scenarios = pgTable(
  "scenarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    curriculumLevelId: integer("curriculum_level_id")
      .notNull()
      .references(() => curriculumLevels.id),
    scenarioText: text("scenario_text").notNull(),
    marketData: jsonb("market_data").notNull(),
    questionPrompt: text("question_prompt").notNull(),
    targetObjectives: jsonb("target_objectives").notNull(),
    rubric: jsonb("rubric").notNull(),
    difficulty: integer("difficulty").notNull(),
    marketRegime: text("market_regime").notNull(),
    qualityScore: real("quality_score"),
    isActive: boolean("is_active").notNull().default(true),
    generatedBy: text("generated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("scenarios_level_active_quality_idx").on(
      table.curriculumLevelId,
      table.isActive,
      table.qualityScore,
    ),
  ],
);

// ─── 5. scenario_attempts ────────────────────────────────

export const scenarioAttempts = pgTable(
  "scenario_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    scenarioId: uuid("scenario_id")
      .notNull()
      .references(() => scenarios.id),
    responseText: text("response_text").notNull().default(""),
    score: integer("score"),
    aiFeedback: jsonb("ai_feedback"),
    probingQuestions: jsonb("probing_questions"),
    probingResponse: text("probing_response"),
    probingScore: integer("probing_score"),
    finalScore: integer("final_score"),
    timeSpentSeconds: integer("time_spent_seconds"),
    challengeId: uuid("challenge_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("attempts_user_created_idx").on(table.userId, table.createdAt),
  ],
);

// ─── 6. attempt_objectives ───────────────────────────────

export const attemptObjectives = pgTable(
  "attempt_objectives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => scenarioAttempts.id),
    objectiveId: uuid("objective_id")
      .notNull()
      .references(() => skillObjectives.id),
    score: integer("score").notNull(),
    demonstrated: boolean("demonstrated").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("attempt_obj_score_idx").on(table.objectiveId, table.score),
  ],
);

// ─── 7. xp_events ───────────────────────────────────────

export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    referenceId: uuid("reference_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("xp_events_user_created_idx").on(table.userId, table.createdAt),
  ],
);

// ─── 8. user_streaks ─────────────────────────────────────

export const userStreaks = pgTable(
  "user_streaks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id),
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastActivityDate: date("last_activity_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

// ─── 9. challenges ───────────────────────────────────────

export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scenarioId: uuid("scenario_id")
      .notNull()
      .references(() => scenarios.id),
    status: challengeStatusEnum("status").notNull().default("waiting"),
    timeLimitSeconds: integer("time_limit_seconds").notNull().default(300),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    winnerId: uuid("winner_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
);

// ─── 10. challenge_participants ──────────────────────────

export const challengeParticipants = pgTable(
  "challenge_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => challenges.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    responseText: text("response_text"),
    score: integer("score"),
    submittedAt: timestamp("submitted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("challenge_user_unique_idx").on(
      table.challengeId,
      table.userId,
    ),
  ],
);

// ─── 11. peer_reviews ────────────────────────────────────

export const peerReviews = pgTable(
  "peer_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => scenarioAttempts.id),
    correctnessScore: integer("correctness_score").notNull(),
    reasoningScore: integer("reasoning_score").notNull(),
    riskAwarenessScore: integer("risk_awareness_score").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reviewer_attempt_unique_idx").on(
      table.reviewerId,
      table.attemptId,
    ),
  ],
);

// ─── 12. mtss_classifications ────────────────────────────

export const mtssClassifications = pgTable(
  "mtss_classifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    objectiveId: uuid("objective_id")
      .notNull()
      .references(() => skillObjectives.id),
    tier: integer("tier").notNull(),
    avgScore: real("avg_score").notNull(),
    attemptCount: integer("attempt_count").notNull(),
    classifiedAt: timestamp("classified_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("mtss_user_obj_classified_idx").on(
      table.userId,
      table.objectiveId,
      table.classifiedAt,
    ),
    index("mtss_tier_classified_idx").on(table.tier, table.classifiedAt),
  ],
);

// ─── 13. leaderboard_snapshots ───────────────────────────

export const leaderboardSnapshots = pgTable(
  "leaderboard_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    periodType: leaderboardPeriodEnum("period_type").notNull(),
    periodStart: date("period_start").notNull(),
    xpEarned: integer("xp_earned").notNull(),
    rank: integer("rank").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("leaderboard_period_rank_idx").on(
      table.periodType,
      table.periodStart,
      table.rank,
    ),
  ],
);

// ─── 14. document_chunks (pgvector) ──────────────────────

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentName: text("document_name").notNull(),
    documentType: text("document_type").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

// ─── Relations ───────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  scenarioAttempts: many(scenarioAttempts),
  xpEvents: many(xpEvents),
  streak: one(userStreaks),
  challengeParticipations: many(challengeParticipants),
  peerReviews: many(peerReviews),
  mtssClassifications: many(mtssClassifications),
  leaderboardSnapshots: many(leaderboardSnapshots),
}));

export const curriculumLevelsRelations = relations(
  curriculumLevels,
  ({ many }) => ({
    skillObjectives: many(skillObjectives),
    scenarios: many(scenarios),
  }),
);

export const skillObjectivesRelations = relations(
  skillObjectives,
  ({ one, many }) => ({
    curriculumLevel: one(curriculumLevels, {
      fields: [skillObjectives.curriculumLevelId],
      references: [curriculumLevels.id],
    }),
    attemptObjectives: many(attemptObjectives),
    mtssClassifications: many(mtssClassifications),
  }),
);

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  curriculumLevel: one(curriculumLevels, {
    fields: [scenarios.curriculumLevelId],
    references: [curriculumLevels.id],
  }),
  attempts: many(scenarioAttempts),
}));

export const scenarioAttemptsRelations = relations(
  scenarioAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [scenarioAttempts.userId],
      references: [users.id],
    }),
    scenario: one(scenarios, {
      fields: [scenarioAttempts.scenarioId],
      references: [scenarios.id],
    }),
    attemptObjectives: many(attemptObjectives),
    peerReviews: many(peerReviews),
  }),
);

export const attemptObjectivesRelations = relations(
  attemptObjectives,
  ({ one }) => ({
    attempt: one(scenarioAttempts, {
      fields: [attemptObjectives.attemptId],
      references: [scenarioAttempts.id],
    }),
    objective: one(skillObjectives, {
      fields: [attemptObjectives.objectiveId],
      references: [skillObjectives.id],
    }),
  }),
);

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, {
    fields: [xpEvents.userId],
    references: [users.id],
  }),
}));

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
  user: one(users, {
    fields: [userStreaks.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  scenario: one(scenarios, {
    fields: [challenges.scenarioId],
    references: [scenarios.id],
  }),
  participants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(
  challengeParticipants,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeParticipants.challengeId],
      references: [challenges.id],
    }),
    user: one(users, {
      fields: [challengeParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const peerReviewsRelations = relations(peerReviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [peerReviews.reviewerId],
    references: [users.id],
  }),
  attempt: one(scenarioAttempts, {
    fields: [peerReviews.attemptId],
    references: [scenarioAttempts.id],
  }),
}));

export const mtssClassificationsRelations = relations(
  mtssClassifications,
  ({ one }) => ({
    user: one(users, {
      fields: [mtssClassifications.userId],
      references: [users.id],
    }),
    objective: one(skillObjectives, {
      fields: [mtssClassifications.objectiveId],
      references: [skillObjectives.id],
    }),
  }),
);

export const leaderboardSnapshotsRelations = relations(
  leaderboardSnapshots,
  ({ one }) => ({
    user: one(users, {
      fields: [leaderboardSnapshots.userId],
      references: [users.id],
    }),
  }),
);
