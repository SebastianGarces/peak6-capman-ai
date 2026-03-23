"use client";

import { LEVEL_THRESHOLDS, getLevelName } from "@/lib/game/levels";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap } from "lucide-react";

interface GamificationBarProps {
  xp: number;
  level: number;
  currentStreak: number;
}

export function GamificationBar({ xp, level, currentStreak }: GamificationBarProps) {
  const nextLevel = level < 10 ? level + 1 : 10;
  const currentThreshold = LEVEL_THRESHOLDS[level]?.xp ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel]?.xp ?? 10000;
  const xpInLevel = xp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  const levelName = getLevelName(level);

  return (
    <div className="flex items-center gap-4">
      {/* Level Badge */}
      <Badge variant="primary" className="gap-1.5 px-3 py-1">
        <Zap className="h-3 w-3" />
        <span className="font-mono text-xs">Lv.{level}</span>
        <span className="hidden sm:inline text-xs">{levelName}</span>
      </Badge>

      {/* XP Bar */}
      <div className="hidden sm:block w-36">
        <ProgressBar
          value={xpInLevel}
          max={xpForLevel}
          size="sm"
          showValue={false}
        />
        <p className="mt-0.5 text-center font-mono text-[10px] text-text-dim">
          {xp.toLocaleString()} XP
        </p>
      </div>

      {/* Streak */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-1 text-orange">
          <Flame className="h-4 w-4" />
          <span className="font-mono text-sm font-semibold">
            {currentStreak}
          </span>
        </div>
      )}
    </div>
  );
}
