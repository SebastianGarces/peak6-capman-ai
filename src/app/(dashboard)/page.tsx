import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userStreaks, scenarioAttempts, challengeParticipants, challenges } from "@/lib/db/schema";
import { eq, count, and, gte, desc } from "drizzle-orm";
import { calculateLevel, getLevelName, LEVEL_THRESHOLDS } from "@/lib/game/levels";
import { MotionDiv } from "@/components/motion-div";
import { DiagonalStreaks } from "@/components/decorative/diagonal-streaks";
import { staggerContainer, staggerItem } from "@/lib/motion";
import {
  BookOpen,
  Swords,
  Star,
  Zap,
  Trophy,
  Flame,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Crown,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  // Fetch user record
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) redirect("/login");

  // Fetch streak
  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  // Fetch total completed attempts
  const [attemptsResult] = await db
    .select({ total: count() })
    .from(scenarioAttempts)
    .where(eq(scenarioAttempts.userId, userId));

  // Check if user has done a challenge today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailyResult] = await db
    .select({ count: count() })
    .from(challengeParticipants)
    .innerJoin(challenges, eq(challengeParticipants.challengeId, challenges.id))
    .where(and(
      eq(challengeParticipants.userId, userId),
      gte(challenges.createdAt, today)
    ));
  const hasDoneDaily = (dailyResult?.count ?? 0) > 0;

  // Fetch top 5 users for mini leaderboard
  const topUsers = await db
    .select({ id: users.id, name: users.name, xp: users.xp, level: users.level })
    .from(users)
    .orderBy(desc(users.xp))
    .limit(5);

  const currentLevel = calculateLevel(user.xp);
  const levelName = getLevelName(currentLevel);
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel + 1]?.xp ?? user.xp;
  const prevLevelXp = LEVEL_THRESHOLDS[currentLevel]?.xp ?? 0;
  const xpIntoLevel = user.xp - prevLevelXp;
  const xpNeeded = nextLevelXp - prevLevelXp;
  const xpPercent = xpNeeded > 0 ? Math.min((xpIntoLevel / xpNeeded) * 100, 100) : 100;

  const firstName = user.name.split(" ")[0];
  const totalAttempts = attemptsResult?.total ?? 0;
  const currentStreak = streak?.currentStreak ?? 0;

  const stats = [
    {
      label: "Total XP",
      value: user.xp.toLocaleString(),
      icon: Zap,
      color: "text-amber",
      bg: "bg-amber-muted",
      border: "border-amber/20",
    },
    {
      label: "Level",
      value: currentLevel.toString(),
      sub: levelName,
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary-muted",
      border: "border-primary/20",
    },
    {
      label: "Day Streak",
      value: currentStreak.toString(),
      icon: Flame,
      color: "text-orange",
      bg: "bg-orange-muted",
      border: "border-orange/20",
    },
    {
      label: "Scenarios Done",
      value: totalAttempts.toString(),
      icon: Star,
      color: "text-lavender",
      bg: "bg-lavender-muted",
      border: "border-lavender/20",
    },
  ];

  const quickActions = [
    {
      href: "/learn",
      icon: BookOpen,
      title: "Start Learning",
      description: "Work through curriculum scenarios at your own pace",
      accent: "text-primary",
      accentBg: "bg-primary-muted",
      cta: "Go to Curriculum",
    },
    {
      href: "/compete",
      icon: Swords,
      title: "Challenge a Peer",
      description: "Compete head-to-head on live scenarios and earn bonus XP",
      accent: "text-orange",
      accentBg: "bg-orange-muted",
      cta: "Find a Match",
    },
    {
      href: "/review",
      icon: TrendingUp,
      title: "Review Responses",
      description: "Give peer feedback and earn 5 XP per review submitted",
      accent: "text-lavender",
      accentBg: "bg-lavender-muted",
      cta: "Start Reviewing",
    },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      <DiagonalStreaks variant="section" />

      {/* Welcome header */}
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <p className="text-sm font-medium text-text-muted mb-1">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
          ,
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-text">
          {firstName}{" "}
          <span className="text-primary">— keep up the momentum.</span>
        </h1>

        {/* XP progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1.5 text-xs text-text-muted">
              <span>Level {currentLevel} · {levelName}</span>
              <span className="font-mono text-text-dim">
                {user.xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-lavender transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-muted border border-orange/20 px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-orange" />
              <span className="text-xs font-semibold text-orange font-mono">
                {currentStreak}d
              </span>
            </div>
          )}
        </div>
      </MotionDiv>

      {/* Stats grid */}
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8"
      >
        {stats.map((stat) => (
          <MotionDiv
            key={stat.label}
            variants={staggerItem}
            className={`bg-surface border ${stat.border} rounded-2xl p-5 flex flex-col gap-3`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
            </div>
            <div>
              <p className={`font-mono text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-xs text-text-muted mt-0.5">{stat.sub}</p>
              )}
              <p className="text-xs text-text-dim mt-0.5">{stat.label}</p>
            </div>
          </MotionDiv>
        ))}
      </MotionDiv>

      {/* Quick actions */}
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group block">
              <div className="bg-surface border border-surface-border rounded-2xl p-5 h-full transition-colors duration-200 hover:border-surface-border-hover hover:bg-surface-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.accentBg}`}>
                    <action.icon className={`h-5 w-5 ${action.accent}`} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-dim mt-1 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
                <h3 className="font-semibold text-text mb-1">{action.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                  {action.description}
                </p>
                <span className={`text-xs font-semibold ${action.accent}`}>
                  {action.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </MotionDiv>

      {/* Daily Challenge + Mini Leaderboard */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-8">
        {/* Daily Challenge CTA */}
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {hasDoneDaily ? (
            <div className="bg-surface border border-green/20 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-muted">
                  <CheckCircle className="h-5 w-5 text-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">Daily Challenge</h3>
                  <p className="text-xs text-green font-semibold">Completed today</p>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Great job! You&apos;ve already completed a challenge today. Come back tomorrow for a new one.
              </p>
            </div>
          ) : (
            <Link href="/compete" className="group block h-full">
              <div className="bg-surface border border-orange/20 rounded-2xl p-6 h-full transition-colors duration-200 hover:border-orange/40 hover:bg-surface-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-muted">
                    <Swords className="h-5 w-5 text-orange" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-dim mt-1 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
                <h3 className="font-semibold text-text mb-1">Daily Challenge</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-3">
                  You haven&apos;t competed today. Jump into a head-to-head challenge and earn bonus XP!
                </p>
                <span className="text-xs font-semibold text-orange">
                  Start Challenge →
                </span>
              </div>
            </Link>
          )}
        </MotionDiv>

        {/* Mini Leaderboard */}
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-surface border border-surface-border rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber" />
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                  Top 5
                </h3>
              </div>
              <Link href="/leaderboard" className="text-xs font-semibold text-primary hover:underline">
                View All →
              </Link>
            </div>
            <MotionDiv
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {topUsers.map((u, i) => (
                <MotionDiv
                  key={u.id}
                  variants={staggerItem}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${u.id === userId ? "bg-primary-muted border border-primary/20" : "bg-surface-hover/50"}`}
                >
                  <span className={`font-mono text-sm font-bold w-5 text-center ${i === 0 ? "text-amber" : i === 1 ? "text-text-muted" : i === 2 ? "text-orange" : "text-text-dim"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-text truncate">
                    {u.name}{u.id === userId ? " (you)" : ""}
                  </span>
                  <span className="text-xs text-text-dim font-mono">Lv.{u.level}</span>
                  <span className="text-xs font-semibold text-amber font-mono">
                    {u.xp.toLocaleString()} XP
                  </span>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
