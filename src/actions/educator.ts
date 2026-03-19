"use server";

import { db } from "@/lib/db";
import { mtssClassifications, users, skillObjectives, scenarioAttempts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth/utils";

export async function getMtssOverview(levelFilter?: number) {
  const session = await auth();
  requireRole(session, 'educator');

  // Get all learners
  const learners = await db
    .select({ id: users.id, name: users.name, level: users.level, xp: users.xp })
    .from(users)
    .where(eq(users.role, "learner"));

  // Get all skill objectives
  const objectives = await db.select().from(skillObjectives);

  // Get latest classifications
  const classifications = await db
    .select()
    .from(mtssClassifications);

  // Build matrix
  const matrix = learners.map((learner) => ({
    userId: learner.id,
    name: learner.name,
    level: learner.level,
    objectives: objectives.map((obj) => {
      const cls = classifications.find(
        (c) => c.userId === learner.id && c.objectiveId === obj.id
      );
      return {
        objectiveId: obj.id,
        code: obj.code,
        tier: cls?.tier || null,
        avgScore: cls?.avgScore || null,
      };
    }),
  }));

  return { matrix, objectives };
}

export async function getInterventionQueue() {
  const session = await auth();
  requireRole(session, 'educator');

  // Get Tier 3 classifications
  const tier3 = await db
    .select({
      userId: mtssClassifications.userId,
      objectiveId: mtssClassifications.objectiveId,
      avgScore: mtssClassifications.avgScore,
      tier: mtssClassifications.tier,
    })
    .from(mtssClassifications)
    .where(eq(mtssClassifications.tier, 3));

  // Enrich with user data
  const queue = [];
  const userIds = [...new Set(tier3.map(t => t.userId))];

  for (const uid of userIds) {
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!user) continue;

    const userTier3 = tier3.filter(t => t.userId === uid);
    const objectiveIds = userTier3.map(t => t.objectiveId);
    const objectives = await db.select().from(skillObjectives);
    const failingObjectives = objectives.filter(o => objectiveIds.includes(o.id));

    const daysInactive = user.lastActiveAt
      ? Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / 86400000)
      : 999;

    queue.push({
      userId: user.id,
      name: user.name,
      failingObjectives: failingObjectives.map(o => o.code),
      avgScore: userTier3.reduce((s, t) => s + (t.avgScore || 0), 0) / userTier3.length,
      daysInactive,
    });
  }

  return queue.sort((a, b) => b.daysInactive - a.daysInactive);
}

export async function sendNudge(userId: string, message: string) {
  const session = await auth();
  requireRole(session, 'educator');
  // For now, just log it. In production, this would send via WebSocket or notification system.
  console.log(`Nudge sent to ${userId}: ${message}`);
  return { success: true };
}

export async function getLearnerDetail(userId: string) {
  const session = await auth();
  requireRole(session, 'educator');
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const objectives = await db.select().from(skillObjectives);
  const classifications = await db
    .select()
    .from(mtssClassifications)
    .where(eq(mtssClassifications.userId, userId));

  const attempts = await db
    .select()
    .from(scenarioAttempts)
    .where(eq(scenarioAttempts.userId, userId))
    .orderBy(desc(scenarioAttempts.createdAt))
    .limit(10);

  return {
    user: { id: user.id, name: user.name, level: user.level, xp: user.xp, email: user.email },
    objectiveBreakdown: objectives.map(obj => {
      const cls = classifications.find(c => c.objectiveId === obj.id);
      return {
        code: obj.code,
        name: obj.name,
        tier: cls?.tier || null,
        avgScore: cls?.avgScore || null,
        attemptCount: cls?.attemptCount || 0,
      };
    }),
    recentAttempts: attempts.map(a => ({
      id: a.id,
      score: a.score,
      createdAt: a.createdAt,
    })),
  };
}
