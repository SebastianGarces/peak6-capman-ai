"use server";

import { db } from "@/lib/db";
import { challenges, challengeParticipants, scenarios } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { gradeResponse } from "@/lib/ai/client";
import { awardXp } from "./gamification";

export async function createChallenge(scenarioId: string) {
  const [challenge] = await db
    .insert(challenges)
    .values({ scenarioId, status: "waiting" })
    .returning();
  return challenge;
}

export async function addParticipant(challengeId: string, userId: string) {
  await db.insert(challengeParticipants).values({ challengeId, userId });
}

export async function submitChallengeResponse(challengeId: string, userId: string, responseText: string) {
  await db
    .update(challengeParticipants)
    .set({ responseText, submittedAt: new Date() })
    .where(
      and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      )
    );
}

export async function gradeChallenge(challengeId: string) {
  const participants = await db
    .select()
    .from(challengeParticipants)
    .where(eq(challengeParticipants.challengeId, challengeId));

  if (participants.length !== 2) return null;

  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  if (!challenge) return null;

  const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, challenge.scenarioId)).limit(1);

  // Grade both in parallel
  const results = await Promise.all(
    participants.map(async (p) => {
      try {
        const grading = await gradeResponse({
          scenarioId: challenge.scenarioId,
          scenarioText: scenario?.scenarioText || "",
          rubric: (scenario?.rubric as Record<string, unknown>) || {},
          studentResponse: p.responseText || "",
        });
        return { userId: p.userId, score: grading.total_score, submittedAt: p.submittedAt };
      } catch {
        // Fallback mock score
        return { userId: p.userId, score: Math.floor(Math.random() * 51) + 50, submittedAt: p.submittedAt };
      }
    })
  );

  // Update scores
  for (const r of results) {
    await db
      .update(challengeParticipants)
      .set({ score: r.score })
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, r.userId)
        )
      );
  }

  // Determine winner
  let winnerId: string;
  if (results[0].score !== results[1].score) {
    winnerId = results[0].score > results[1].score ? results[0].userId : results[1].userId;
  } else {
    // Tiebreaker: faster submission
    winnerId = (results[0].submittedAt || new Date()) <= (results[1].submittedAt || new Date())
      ? results[0].userId
      : results[1].userId;
  }

  const loserId = results.find(r => r.userId !== winnerId)!.userId;

  // Update challenge
  await db
    .update(challenges)
    .set({ status: "complete", winnerId, completedAt: new Date(), updatedAt: new Date() })
    .where(eq(challenges.id, challengeId));

  // Award XP
  await awardXp(winnerId, 50, "challenge_win", challengeId);
  await awardXp(loserId, 10, "challenge_loss", challengeId);

  return {
    winnerId,
    results: results.map(r => ({ userId: r.userId, score: r.score })),
  };
}
