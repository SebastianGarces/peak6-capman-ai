import { db } from "@/lib/db";
import { users, scenarioAttempts, userStreaks } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, avg, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { calculateLevel, getLevelName } from "@/lib/game/levels";

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
  const avgScore = stats?.avgScore ? Number(stats.avgScore).toFixed(1) : "N/A";
  const currentStreak = streak?.currentStreak ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Your learning progress and stats." />

      {/* User info */}
      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
              {user.role}
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Member since {user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{user.xp}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{gameLevel}</p>
          <p className="text-xs text-muted-foreground">{levelName}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
          <p className="text-xs text-muted-foreground">Attempts</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Curriculum Progress</p>
          <p className="text-sm text-muted-foreground">
            Level {user.currentCurriculumLevel} / 10
          </p>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${(user.currentCurriculumLevel / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Scenario stats */}
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Scenario Performance</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Attempts</span>
          <span className="font-medium">{totalAttempts}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Average Score</span>
          <span className="font-medium">{avgScore}</span>
        </div>
      </div>
    </div>
  );
}
