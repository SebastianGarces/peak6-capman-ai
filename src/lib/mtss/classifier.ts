import { db } from "@/lib/db";
import { mtssClassifications, attemptObjectives, scenarioAttempts, users, skillObjectives } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function classifyMtss(userId: string, objectiveId: string): Promise<number> {
  // Get last 10 attempts for this user+objective
  const attempts = await db
    .select({ score: attemptObjectives.score })
    .from(attemptObjectives)
    .innerJoin(scenarioAttempts, eq(attemptObjectives.attemptId, scenarioAttempts.id))
    .where(
      and(
        eq(scenarioAttempts.userId, userId),
        eq(attemptObjectives.objectiveId, objectiveId)
      )
    )
    .orderBy(desc(scenarioAttempts.createdAt))
    .limit(10);

  if (attempts.length < 3) return 1; // Insufficient data

  const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;

  // Check days inactive
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const daysInactive = user?.lastActiveAt
    ? Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / 86400000)
    : 999;

  let tier: number;
  if (avgScore < 50 || daysInactive >= 5) {
    tier = 3;
  } else if (avgScore < 70 || daysInactive >= 3) {
    tier = 2;
  } else {
    tier = 1;
  }

  // Upsert classification
  const existing = await db
    .select()
    .from(mtssClassifications)
    .where(
      and(
        eq(mtssClassifications.userId, userId),
        eq(mtssClassifications.objectiveId, objectiveId)
      )
    )
    .orderBy(desc(mtssClassifications.classifiedAt))
    .limit(1);

  if (existing.length > 0 && existing[0].tier === tier) {
    // Same tier, update existing
    await db
      .update(mtssClassifications)
      .set({
        avgScore,
        attemptCount: attempts.length,
        classifiedAt: new Date(),
      })
      .where(eq(mtssClassifications.id, existing[0].id));
  } else {
    // New tier or first classification
    await db.insert(mtssClassifications).values({
      userId,
      objectiveId,
      tier,
      avgScore,
      attemptCount: attempts.length,
    });
  }

  return tier;
}
