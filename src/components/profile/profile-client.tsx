"use client";

import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { Zap, Trophy, Flame, Target } from "lucide-react";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    role: string;
    xp: number;
    currentCurriculumLevel: number;
    createdAt: string;
  };
  gameLevel: number;
  levelName: string;
  totalAttempts: number;
  avgScore: number | null;
  currentStreak: number;
  curriculumProgress: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 36; // radius=36

export function ProfileClient({
  user,
  gameLevel,
  levelName,
  totalAttempts,
  avgScore,
  currentStreak,
  curriculumProgress,
}: ProfileClientProps) {
  const avgScoreDisplay = avgScore !== null ? avgScore.toFixed(1) : "N/A";
  const gaugeOffset =
    avgScore !== null
      ? CIRCUMFERENCE - (avgScore / 100) * CIRCUMFERENCE
      : CIRCUMFERENCE;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Profile hero */}
      <motion.div variants={staggerItem} className="glass-card rounded-lg overflow-hidden">
        <div className="h-24 rounded-t-lg gradient-primary-btn opacity-80" />
        <div className="flex flex-col items-center pb-6 px-6 -mt-12">
          <Avatar size="lg" className="size-20 text-2xl ring-4 ring-background">
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge variant="secondary" className="mt-2 capitalize">{user.role}</Badge>
          <p className="mt-3 text-xs text-muted-foreground">
            Member since {user.createdAt}
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {/* XP */}
        <div className="stat-card-green rounded-lg p-4 text-center">
          <Zap className="mx-auto mb-2 size-5 text-green-400" />
          <p className="font-mono text-3xl font-bold text-green-400">
            {user.xp.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Total XP</p>
        </div>

        {/* Level */}
        <div className="stat-card-gold rounded-lg p-4 text-center">
          <Trophy className="mx-auto mb-2 size-5 text-amber-400" />
          <p className="font-mono text-3xl font-bold text-amber-400">{gameLevel}</p>
          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{levelName}</p>
        </div>

        {/* Streak */}
        <div className="stat-card-orange rounded-lg p-4 text-center">
          <Flame className="mx-auto mb-2 size-5 text-orange-400" />
          <p className="font-mono text-3xl font-bold text-orange-400">{currentStreak}</p>
          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Day Streak</p>
        </div>

        {/* Attempts */}
        <div className="stat-card-blue rounded-lg p-4 text-center">
          <Target className="mx-auto mb-2 size-5 text-blue-400" />
          <p className="font-mono text-3xl font-bold text-blue-400">{totalAttempts}</p>
          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Attempts</p>
        </div>
      </motion.div>

      {/* Curriculum progress */}
      <motion.div variants={staggerItem} className="glass-card rounded-lg p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Curriculum Progress</p>
          <p className="text-sm text-muted-foreground">
            Level {user.currentCurriculumLevel} / 10
          </p>
        </div>
        <Progress value={curriculumProgress} />
        <div className="mt-2 flex justify-between">
          {Array.from({ length: 11 }, (_, i) => (
            <span
              key={i}
              className={`text-[10px] ${
                i <= user.currentCurriculumLevel
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {i}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Scenario performance */}
      <motion.div variants={staggerItem} className="glass-card rounded-lg p-5">
        <h3 className="mb-4 text-sm font-semibold">Scenario Performance</h3>
        <div className="flex items-center gap-6">
          {/* Circular gauge */}
          <div className="relative flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="36"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={gaugeOffset}
                transform="rotate(-90 48 48)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-xl font-bold">{avgScoreDisplay}</span>
              <span className="text-[10px] text-muted-foreground uppercase">avg</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Total Attempts</span>
              <span className="font-medium">{totalAttempts}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">Average Score</span>
              <span className="font-medium">{avgScoreDisplay}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
