"use server";

import { db } from "@/lib/db";
import { users, xpEvents, userStreaks } from "@/lib/db/schema";
import { eq, sql, desc, gte } from "drizzle-orm";
import { calculateLevel } from "@/lib/game/levels";
import { calculateXpAward } from "@/lib/game/xp";

export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string
) {
  // Insert XP event
  await db.insert(xpEvents).values({
    userId,
    amount,
    reason,
    referenceId,
  });

  // Atomically increment user XP
  const [updated] = await db
    .update(users)
    .set({
      xp: sql`${users.xp} + ${amount}`,
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  // Check level-up
  const newLevel = calculateLevel(updated.xp);
  let leveledUp = false;
  if (newLevel > updated.level) {
    await db
      .update(users)
      .set({ level: newLevel, updatedAt: new Date() })
      .where(eq(users.id, userId));
    leveledUp = true;
  }

  // Update streak
  await updateStreak(userId);

  return {
    newXp: updated.xp,
    newLevel: leveledUp ? newLevel : updated.level,
    leveledUp,
  };
}

async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (!streak) {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
    });
    return;
  }

  if (streak.lastActivityDate === today) {
    return; // Same day, skip
  }

  let newStreak: number;
  if (streak.lastActivityDate === yesterday) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1; // Reset
  }

  const longestStreak = Math.max(newStreak, streak.longestStreak);

  await db
    .update(userStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStreaks.userId, userId));
}

export async function getLeaderboard(
  type: "alltime" | "weekly" | "skill",
  limit: number = 50,
  curriculumLevel?: number
) {
  if (type === "alltime") {
    return db
      .select({
        id: users.id,
        name: users.name,
        xp: users.xp,
        level: users.level,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .orderBy(desc(users.xp))
      .limit(limit);
  }

  if (type === "weekly") {
    const monday = getMonday();
    const results = await db
      .select({
        userId: xpEvents.userId,
        weeklyXp: sql<number>`cast(sum(${xpEvents.amount}) as integer)`,
      })
      .from(xpEvents)
      .where(gte(xpEvents.createdAt, monday))
      .groupBy(xpEvents.userId)
      .orderBy(desc(sql`sum(${xpEvents.amount})`))
      .limit(limit);

    // Enrich with user data
    const enriched = [];
    for (const r of results) {
      const [user] = await db.select().from(users).where(eq(users.id, r.userId)).limit(1);
      if (user) {
        enriched.push({
          id: user.id,
          name: user.name,
          xp: r.weeklyXp,
          level: user.level,
          avatarUrl: user.avatarUrl,
        });
      }
    }
    return enriched;
  }

  // skill-level: filter by curriculum level
  return db
    .select({
      id: users.id,
      name: users.name,
      xp: users.xp,
      level: users.level,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(curriculumLevel ? eq(users.currentCurriculumLevel, curriculumLevel) : undefined as any)
    .orderBy(desc(users.xp))
    .limit(limit);
}

function getMonday(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}
