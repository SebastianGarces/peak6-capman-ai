"use client";

import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LevelBadge } from "./level-badge";
import { staggerContainer, staggerItem } from "@/lib/motion";

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
    return <p className="py-8 text-center text-muted-foreground">No data yet</p>;
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-2 pr-4" scope="col">Rank</th>
            <th className="pb-2 pr-4" scope="col">Name</th>
            <th className="pb-2 pr-4" scope="col">Level</th>
            <th className="pb-2 text-right" scope="col">XP</th>
          </tr>
        </thead>
        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry, i) => {
            const isCurrentUser = entry.id === currentUserId;
            return (
              <motion.tr
                key={entry.id}
                layout
                variants={staggerItem}
                className={`border-b border-border ${
                  isCurrentUser ? "bg-primary/5 glow-primary" : ""
                }`}
              >
                <td className="py-3 pr-4 font-mono text-sm">
                  {i < 3 ? (
                    <span role="img" aria-label={`Rank ${i + 1}`}>
                      {MEDALS[i]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{i + 1}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {entry.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <LevelBadge level={entry.level} />
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
