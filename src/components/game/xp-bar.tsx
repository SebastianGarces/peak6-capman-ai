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
      <div className="relative h-2.5 w-40 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: "linear-gradient(to right, hsl(142 71% 45%), hsl(160 60% 50%))",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
            boxShadow: "0 0 8px hsl(142 71% 45% / 0.6), 0 0 16px hsl(142 71% 45% / 0.3)",
          }}
        />
      </div>
      <span className="text-xs font-medium text-slate-300">
        {currentXp} / {nextThreshold} XP
      </span>
    </div>
  );
}
