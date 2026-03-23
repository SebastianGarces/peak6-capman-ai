"use client";

import { motion } from "motion/react";
import { LevelBadge } from "./level-badge";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatarUrl?: string | null;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const MEDALS = ["🥇", "🥈", "🥉"] as const;

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-text-muted">No data yet</p>;
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-surface-border text-left text-sm text-text-dim">
            <th className="pb-2 pr-4" scope="col">Rank</th>
            <th className="pb-2 pr-4" scope="col">Name</th>
            <th className="pb-2 pr-4" scope="col">Level</th>
            <th className="pb-2 text-right" scope="col">XP</th>
          </tr>
        </thead>
        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {entries.map((entry, i) => {
            const isCurrentUser = entry.id === currentUserId;
            return (
              <motion.tr
                key={entry.id}
                layout
                variants={staggerItem}
                className={cn(
                  "border-b border-surface-border",
                  isCurrentUser && "bg-primary-muted"
                )}
              >
                <td className="py-3 pr-4 font-mono text-sm">
                  {i < 3 ? (
                    <span role="img" aria-label={`Rank ${i + 1}`}>
                      {MEDALS[i]}
                    </span>
                  ) : (
                    <span className="text-text-dim">{i + 1}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <LevelBadge level={entry.level} size="sm" />
                </td>
                <td className="py-3 text-right font-mono">
                  {entry.xp.toLocaleString()}
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}
