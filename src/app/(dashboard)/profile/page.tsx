import { db } from "@/lib/db";
import { users, scenarioAttempts, userStreaks } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, avg, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { calculateLevel, getLevelName } from "@/lib/game/levels";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    redirect("/login");
  }

  // Fetch user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  // Fetch attempt stats
  const [stats] = await db
    .select({
      totalAttempts: count(scenarioAttempts.id),
      avgScore: avg(scenarioAttempts.score),
    })
    .from(scenarioAttempts)
    .where(eq(scenarioAttempts.userId, userId));

  // Fetch streak
  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  const gameLevel = calculateLevel(user.xp);
  const levelName = getLevelName(gameLevel);
  const totalAttempts = Number(stats?.totalAttempts ?? 0);
  const avgScore = stats?.avgScore ? Number(stats.avgScore) : null;
  const currentStreak = streak?.currentStreak ?? 0;
  const curriculumProgress = (user.currentCurriculumLevel / 10) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Your learning progress and stats." />
      <ProfileClient
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          xp: user.xp,
          currentCurriculumLevel: user.currentCurriculumLevel,
          createdAt: user.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }}
        gameLevel={gameLevel}
        levelName={levelName}
        totalAttempts={totalAttempts}
        avgScore={avgScore}
        currentStreak={currentStreak}
        curriculumProgress={curriculumProgress}
      />
    </div>
  );
}
