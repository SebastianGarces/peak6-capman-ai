"use client";

import { motion } from "motion/react";
import { getLevelName, LEVEL_THRESHOLDS } from "@/lib/game/levels";
import { progressFillTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface XpBarProps {
  /** Current total XP */
  xp?: number;
  /** Alias for xp (legacy prop name) */
  currentXp?: number;
  /** Current level number */
  level?: number;
  /** Alias for level (legacy prop name) */
  currentLevel?: number;
  className?: string;
}

export function XpBar({ xp, currentXp, level, currentLevel, className }: XpBarProps) {
  const resolvedXp = xp ?? currentXp ?? 0;
  const resolvedLevel = level ?? currentLevel ?? 1;

  const currentThreshold = LEVEL_THRESHOLDS[resolvedLevel]?.xp ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[resolvedLevel + 1]?.xp ?? LEVEL_THRESHOLDS[10].xp;
  const xpIntoLevel = resolvedXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const percent = xpNeeded > 0 ? Math.min((xpIntoLevel / xpNeeded) * 100, 100) : 100;
  const isMaxLevel = resolvedLevel >= 10;

  return (
    <div className={cn("w-full", className)}>
      {/* Label row */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {getLevelName(resolvedLevel)}
        </span>
        {isMaxLevel ? (
          <span className="font-mono text-xs text-amber">MAX LEVEL</span>
        ) : (
          <span className="font-mono text-xs text-text-dim">
            {resolvedXp.toLocaleString()} / {nextThreshold.toLocaleString()} XP
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(to right, var(--color-primary), var(--color-lavender))",
            boxShadow: "0 0 8px var(--color-primary), 0 0 20px rgba(67,56,255,0.3)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${percent}%` }}
          transition={progressFillTransition}
        />
      </div>
    </div>
  );
}
