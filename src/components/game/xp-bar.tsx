"use client";

import { motion } from "motion/react";
import { getLevelName, LEVEL_THRESHOLDS } from "@/lib/game/levels";

interface XpBarProps {
  currentXp: number;
  currentLevel: number;
}

export function XpBar({ currentXp, currentLevel }: XpBarProps) {
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel]?.xp || 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1]?.xp || LEVEL_THRESHOLDS[10].xp;
  const progress = nextThreshold > currentThreshold
    ? ((currentXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-primary">
        {getLevelName(currentLevel)}
      </span>
      <div className="relative h-2 w-32 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {currentXp} / {nextThreshold} XP
      </span>
    </div>
  );
}
