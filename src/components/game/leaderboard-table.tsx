"use client";

import { motion } from "motion/react";
import { LevelBadge } from "./level-badge";

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

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No data yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-2 pr-4">Rank</th>
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Level</th>
            <th className="pb-2 text-right">XP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <motion.tr
              key={entry.id}
              layout
              className={`border-b border-border ${entry.id === currentUserId ? "bg-primary/5" : ""}`}
            >
              <td className="py-3 pr-4 font-mono text-sm">{i + 1}</td>
              <td className="py-3 pr-4 font-medium">{entry.name}</td>
              <td className="py-3 pr-4"><LevelBadge level={entry.level} /></td>
              <td className="py-3 text-right font-mono">{entry.xp.toLocaleString()}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
