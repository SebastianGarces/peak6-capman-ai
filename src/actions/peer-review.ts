"use server";

import { db } from "@/lib/db";
import { peerReviews, scenarioAttempts, scenarios, users } from "@/lib/db/schema";
import { eq, ne, and, notInArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { awardXp } from "./gamification";

export async function getReviewableAttempt() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = (session.user as any).id;

  // Get IDs already reviewed by this user
  const reviewed = await db
    .select({ attemptId: peerReviews.attemptId })
    .from(peerReviews)
    .where(eq(peerReviews.reviewerId, userId));
  const reviewedIds = reviewed.map(r => r.attemptId);

  // Find a random attempt not by this user and not already reviewed
  const query = db
    .select({
      id: scenarioAttempts.id,
      responseText: scenarioAttempts.responseText,
      scenarioId: scenarioAttempts.scenarioId,
    })
    .from(scenarioAttempts)
    .where(
      and(
        ne(scenarioAttempts.userId, userId),
        scenarioAttempts.score ? sql`${scenarioAttempts.score} IS NOT NULL` : sql`1=1`,
        reviewedIds.length > 0 ? notInArray(scenarioAttempts.id, reviewedIds) : sql`1=1`
      )
    )
    .limit(1);

  const attempts = await query;
  if (attempts.length === 0) return null;

  const attempt = attempts[0];
  const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, attempt.scenarioId)).limit(1);

  return {
    attemptId: attempt.id,
    responseText: attempt.responseText,
    scenarioText: scenario?.scenarioText || "",
    questionPrompt: scenario?.questionPrompt || "",
  };
}

export async function submitPeerReview(
  attemptId: string,
  scores: { correctness: number; reasoning: number; riskAwareness: number; comment?: string }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const userId = (session.user as any).id;

  // Validate scores 1-5
  for (const [key, val] of Object.entries({ correctness: scores.correctness, reasoning: scores.reasoning, riskAwareness: scores.riskAwareness })) {
    if (val < 1 || val > 5) throw new Error(`${key} must be between 1 and 5`);
  }

  await db.insert(peerReviews).values({
    reviewerId: userId,
    attemptId,
    correctnessScore: scores.correctness,
    reasoningScore: scores.reasoning,
    riskAwarenessScore: scores.riskAwareness,
    comment: scores.comment || null,
  });

  // Award 5 XP
  await awardXp(userId, 5, "peer_review", attemptId);

  return { success: true };
}
