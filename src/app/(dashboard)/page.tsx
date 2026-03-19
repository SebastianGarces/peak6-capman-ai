import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, scenarioAttempts, userStreaks, scenarios, curriculumLevels } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateLevel, getLevelName } from "@/lib/game/levels";
import { PageHeader } from "@/components/layout/page-header";
import { MotionDiv } from "@/components/motion-div";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { Zap, Trophy, Flame, Target, BookOpen, Swords, MessageSquare } from "lucide-react";

export default async function DashboardHome() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    redirect("/login");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  const recentAttempts = await db
    .select({
      id: scenarioAttempts.id,
      score: scenarioAttempts.finalScore,
      createdAt: scenarioAttempts.createdAt,
      curriculumLevelName: curriculumLevels.name,
    })
    .from(scenarioAttempts)
    .innerJoin(scenarios, eq(scenarioAttempts.scenarioId, scenarios.id))
    .innerJoin(curriculumLevels, eq(scenarios.curriculumLevelId, curriculumLevels.id))
    .where(eq(scenarioAttempts.userId, userId))
    .orderBy(desc(scenarioAttempts.createdAt))
    .limit(5);

  const gameLevel = calculateLevel(user.xp);
  const levelName = getLevelName(gameLevel);
  const currentStreak = streak?.currentStreak ?? 0;

  function getScoreColor(score: number | null) {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  }

  function formatRelativeDate(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero greeting */}
      <MotionDiv variants={fadeInUp} initial="hidden" animate="visible">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
            <h1 className="text-3xl font-bold text-gradient-primary">{user.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>{currentStreak} day streak</span>
            </div>
          </div>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium gradient-primary-btn text-white border-0 self-start sm:self-auto transition-opacity hover:opacity-90"
          >
            Continue Learning
          </Link>
        </div>
      </MotionDiv>

      {/* Stats row */}
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <MotionDiv variants={staggerItem} className="stat-card-green rounded-xl p-4 text-center">
          <Zap className="mx-auto mb-2 h-5 w-5 text-green-400" />
          <p className="font-mono text-3xl font-bold">{user.xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </MotionDiv>
        <MotionDiv variants={staggerItem} className="stat-card-gold rounded-xl p-4 text-center">
          <Trophy className="mx-auto mb-2 h-5 w-5 text-amber-400" />
          <p className="font-mono text-3xl font-bold">{gameLevel}</p>
          <p className="text-xs text-muted-foreground">{levelName}</p>
        </MotionDiv>
        <MotionDiv variants={staggerItem} className="stat-card-orange rounded-xl p-4 text-center">
          <Flame className="mx-auto mb-2 h-5 w-5 text-orange-400" />
          <p className="font-mono text-3xl font-bold">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </MotionDiv>
        <MotionDiv variants={staggerItem} className="stat-card-blue rounded-xl p-4 text-center">
          <Target className="mx-auto mb-2 h-5 w-5 text-blue-400" />
          <p className="font-mono text-3xl font-bold">{recentAttempts.length}</p>
          <p className="text-xs text-muted-foreground">Scenarios Done</p>
        </MotionDiv>
      </MotionDiv>

      {/* Recent activity */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <Link href="/profile" className="inline-link text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentAttempts.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-sm text-muted-foreground">
            No attempts yet. Start learning to see your activity here.
          </div>
        ) : (
          <div className="space-y-2">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="glass-card flex items-center justify-between rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm font-bold ${getScoreColor(attempt.score)}`}>
                    {attempt.score !== null ? `${attempt.score}%` : "—"}
                  </span>
                  <span className="text-sm text-foreground">{attempt.curriculumLevelName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(attempt.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/learn"
            className="glass-card group flex flex-col gap-2 rounded-xl p-5 hover:scale-[1.02] transition-transform"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <p className="font-semibold">Continue Learning</p>
            <p className="text-xs text-muted-foreground">Pick up where you left off</p>
          </Link>
          <Link
            href="/compete"
            className="glass-card group flex flex-col gap-2 rounded-xl p-5 hover:scale-[1.02] transition-transform"
          >
            <Swords className="h-6 w-6 text-amber-400" />
            <p className="font-semibold">Challenge a Trader</p>
            <p className="text-xs text-muted-foreground">Test your skills head-to-head</p>
          </Link>
          <Link
            href="/review"
            className="glass-card group flex flex-col gap-2 rounded-xl p-5 hover:scale-[1.02] transition-transform"
          >
            <MessageSquare className="h-6 w-6 text-blue-400" />
            <p className="font-semibold">Review Responses</p>
            <p className="text-xs text-muted-foreground">Learn from past attempts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
