"use client";

import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatarUrl?: string | null;
}

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

const MEDAL = ["🥇", "🥈", "🥉"] as const;

// Display order: 2nd, 1st, 3rd
const DISPLAY_ORDER = [1, 0, 2];

const PODIUM_CONFIG = [
  {
    glow: "shadow-[0_0_24px_rgba(161,161,170,0.15)] border border-white/10",
    avatarBg: "bg-surface-hover text-text-muted",
    xpColor: "text-text-dim",
    cardPad: "py-5 px-4",
    avatarSize: "h-12 w-12 text-lg",
    nameClass: "text-sm font-semibold",
    rankLabel: "2nd",
    rankColor: "text-text-dim",
    barHeight: "h-16",
    barBg: "bg-gradient-to-t from-surface-hover/60 to-surface/40",
  },
  {
    glow: "shadow-[0_0_32px_rgba(251,191,36,0.25)] border border-amber/30",
    avatarBg: "bg-amber-muted text-amber",
    xpColor: "text-amber font-semibold",
    cardPad: "py-7 px-5",
    avatarSize: "h-16 w-16 text-2xl",
    nameClass: "text-base font-bold",
    rankLabel: "1st",
    rankColor: "text-amber",
    barHeight: "h-24",
    barBg: "bg-gradient-to-t from-amber/20 to-amber/5",
  },
  {
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)] border border-orange/20",
    avatarBg: "bg-orange-muted text-orange",
    xpColor: "text-text-dim",
    cardPad: "py-5 px-4",
    avatarSize: "h-12 w-12 text-lg",
    nameClass: "text-sm font-semibold",
    rankLabel: "3rd",
    rankColor: "text-orange",
    barHeight: "h-10",
    barBg: "bg-gradient-to-t from-orange/15 to-orange/5",
  },
] as const;

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length < 3) return null;

  return (
    <motion.div
      className="flex items-end justify-center gap-3 pb-2"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {DISPLAY_ORDER.map((entryIndex) => {
        const entry = entries[entryIndex];
        const config = PODIUM_CONFIG[entryIndex];

        return (
          <motion.div
            key={entry.id}
            variants={staggerItem}
            className={`flex-1 max-w-[200px] bg-surface rounded-xl ${config.glow} ${config.cardPad} flex flex-col items-center gap-2 relative overflow-hidden`}
          >
            <div
              className={`absolute bottom-0 left-0 right-0 ${config.barHeight} ${config.barBg} opacity-50`}
            />

            <div className="relative z-10 flex flex-col items-center gap-2 w-full">
              <span className="text-2xl" role="img" aria-label={`Rank ${entryIndex + 1}`}>
                {MEDAL[entryIndex]}
              </span>

              <div className={`flex items-center justify-center rounded-full font-bold ${config.avatarSize} ${config.avatarBg}`}>
                {entry.name.charAt(0).toUpperCase()}
              </div>

              <div className="text-center">
                <p className={`${config.nameClass} truncate max-w-[140px]`}>
                  {entry.name}
                </p>
                <p className={`font-mono text-xs mt-0.5 ${config.xpColor}`}>
                  {entry.xp.toLocaleString()} XP
                </p>
              </div>

              <span className={`text-xs font-bold uppercase tracking-widest ${config.rankColor}`}>
                {config.rankLabel}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
