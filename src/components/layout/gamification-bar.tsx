"use client";

import { XpBar } from "@/components/game/xp-bar";
import { LevelBadge } from "@/components/game/level-badge";
import { StreakCounter } from "@/components/game/streak-counter";

interface GamificationBarProps {
  xp: number;
  level: number;
  streak: number;
  levelName: string;
}

export function GamificationBar({ xp, level, streak, levelName }: GamificationBarProps) {
  return (
    <div className="flex items-center gap-4">
      <XpBar currentXp={xp} currentLevel={level} />
      <LevelBadge level={level} />
      <StreakCounter currentStreak={streak} />
    </div>
  );
}
