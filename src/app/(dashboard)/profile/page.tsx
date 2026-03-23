import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userStreaks, scenarioAttempts } from "@/lib/db/schema";
import { eq, count, avg } from "drizzle-orm";
import { calculateLevel, getLevelName, LEVEL_THRESHOLDS } from "@/lib/game/levels";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PageHeader } from "@/components/layout/page-header";
import { MotionDiv } from "@/components/motion-div";
import { staggerContainer, staggerItem } from "@/lib/motion";
import {
  User,
  Zap,
  Trophy,
  Flame,
  Target,
  BarChart2,
  Calendar,
  Shield,
} from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  // Fetch user
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

  // Fetch attempt stats: count and avg score
  const [attemptStats] = await db
    .select({
      total: count(),
      avgScore: avg(scenarioAttempts.score),
    })
    .from(scenarioAttempts)
    .where(eq(scenarioAttempts.userId, userId));

  const currentLevel = calculateLevel(user.xp);
  const levelName = getLevelName(currentLevel);
  const nextLevel = currentLevel < 10 ? currentLevel + 1 : null;
  const nextLevelXp = nextLevel ? LEVEL_THRESHOLDS[nextLevel].xp : LEVEL_THRESHOLDS[10].xp;
  const prevLevelXp = LEVEL_THRESHOLDS[currentLevel].xp;

  const totalAttempts = Number(attemptStats?.total ?? 0);
  const avgScoreRaw = Number(attemptStats?.avgScore ?? 0);
  const avgScore = Math.round(avgScoreRaw);
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  const roleLabels: Record<string, string> = {
    learner: "Learner",
    educator: "Educator",
    admin: "Admin",
  };

  const roleColors: Record<string, string> = {
    learner: "bg-primary-muted text-primary border-primary/20",
    educator: "bg-green-muted text-green border-green/20",
    admin: "bg-amber-muted text-amber border-amber/20",
  };

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  const stats = [
    {
      label: "Total Attempts",
      value: totalAttempts.toString(),
      icon: Target,
      color: "text-lavender",
      bg: "bg-lavender-muted",
      border: "border-lavender/20",
    },
    {
      label: "Average Score",
      value: totalAttempts > 0 ? `${avgScore}%` : "—",
      icon: BarChart2,
      color: "text-primary",
      bg: "bg-primary-muted",
      border: "border-primary/20",
    },
    {
      label: "Current Streak",
      value: currentStreak.toString(),
      icon: Flame,
      color: "text-orange",
      bg: "bg-orange-muted",
      border: "border-orange/20",
    },
    {
      label: "Longest Streak",
      value: longestStreak.toString(),
      icon: Trophy,
      color: "text-amber",
      bg: "bg-amber-muted",
      border: "border-amber/20",
    },
  ];

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Profile"
        description="Your training progress and account details"
        icon={User}
      />

      {/* User info card */}
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-surface border border-surface-border rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-muted text-2xl font-bold text-primary select-none">
            {initial}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-text truncate">{user.name}</h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  roleColors[user.role] ?? "bg-surface text-text-muted border-surface-border"
                }`}
              >
                <Shield className="mr-1 h-3 w-3" />
                {roleLabels[user.role] ?? user.role}
              </span>
            </div>
            <p className="text-sm text-text-muted truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-text-dim">
              <Calendar className="h-3.5 w-3.5" />
              <span>Member since {memberSince}</span>
            </div>
          </div>

          {/* Level badge */}
          <div className="hidden sm:flex flex-col items-center rounded-xl bg-primary-muted border border-primary/20 px-4 py-3 gap-1">
            <span className="font-mono text-2xl font-bold text-primary">{currentLevel}</span>
            <span className="text-xs text-text-muted">{levelName}</span>
          </div>
        </div>
      </MotionDiv>

      {/* XP Progress */}
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="bg-surface border border-surface-border rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-muted">
            <Zap className="h-4 w-4 text-amber" />
          </div>
          <h3 className="font-semibold text-text">XP Progress</h3>
        </div>

        <div className="mb-1 flex items-end gap-2">
          <span className="font-mono text-3xl font-bold text-amber">
            {user.xp.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted mb-1">XP earned</span>
        </div>

        {nextLevel ? (
          <ProgressBar
            value={user.xp - prevLevelXp}
            max={nextLevelXp - prevLevelXp}
            label={`Level ${currentLevel} → ${nextLevel}`}
            size="lg"
          />
        ) : (
          <div className="mt-2 rounded-lg bg-amber-muted border border-amber/20 px-4 py-3 text-sm text-amber font-semibold">
            Max level reached — CapMan Pro
          </div>
        )}
      </MotionDiv>

      {/* Stats grid */}
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4"
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
              <p className={`font-mono text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-text-dim mt-0.5">{stat.label}</p>
            </div>
          </MotionDiv>
        ))}
      </MotionDiv>

      {/* Curriculum progress */}
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="bg-surface border border-surface-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-muted">
            <Trophy className="h-4 w-4 text-green" />
          </div>
          <h3 className="font-semibold text-text">Curriculum Progress</h3>
        </div>

        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="font-mono text-3xl font-bold text-green">
              {user.currentCurriculumLevel}
            </span>
            <span className="text-sm text-text-muted ml-2">of 10 levels</span>
          </div>
          <span className="text-sm text-text-muted">
            {getLevelName(calculateLevel(user.xp))} tier
          </span>
        </div>

        <ProgressBar
          value={user.currentCurriculumLevel}
          max={10}
          label="Curriculum Levels"
          size="md"
          gradient={false}
        />

        {/* Level pip track */}
        <div className="mt-4 grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
            <div
              key={lvl}
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                lvl <= user.currentCurriculumLevel
                  ? "bg-green"
                  : "bg-surface-border"
              }`}
              title={`Level ${lvl}`}
            />
          ))}
        </div>
      </MotionDiv>
    </div>
  );
}
