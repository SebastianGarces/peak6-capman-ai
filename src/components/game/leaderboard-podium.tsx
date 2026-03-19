"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const PODIUM_STYLES = [
  // 2nd place (left)
  {
    order: "order-first",
    card: "glass-card rounded-lg p-4 flex flex-col items-center gap-2",
    shadow: "shadow-[0_0_20px_hsl(220_10%_60%/0.15)]",
    size: "size-12 text-lg",
    nameClass: "text-sm font-semibold",
    xpClass: "font-mono text-xs text-muted-foreground",
    height: "py-4",
  },
  // 1st place (center)
  {
    order: "order-none",
    card: "glass-card glow-gold rounded-lg p-5 flex flex-col items-center gap-2",
    shadow: "",
    size: "size-16 text-xl",
    nameClass: "text-base font-bold",
    xpClass: "font-mono text-sm text-amber-400",
    height: "py-6",
  },
  // 3rd place (right)
  {
    order: "order-last",
    card: "glass-card rounded-lg p-4 flex flex-col items-center gap-2",
    shadow: "shadow-[0_0_20px_hsl(30_60%_40%/0.15)]",
    size: "size-12 text-lg",
    nameClass: "text-sm font-semibold",
    xpClass: "font-mono text-xs text-muted-foreground",
    height: "py-4",
  },
] as const;

// Display order: 2nd (index 1), 1st (index 0), 3rd (index 2)
const DISPLAY_ORDER = [1, 0, 2];

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  return (
    <div className="flex items-end justify-center gap-3">
      {DISPLAY_ORDER.map((entryIndex) => {
        const entry = entries[entryIndex];
        const style = PODIUM_STYLES[entryIndex];
        return (
          <div
            key={entry.id}
            className={`flex-1 max-w-[160px] ${style.card} ${style.shadow} ${style.height}`}
          >
            <span className="text-2xl" role="img" aria-label={`Rank ${entryIndex + 1}`}>
              {MEDAL[entryIndex]}
            </span>
            <Avatar className={style.size}>
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {entry.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className={`text-center ${style.nameClass} truncate max-w-full`}>
              {entry.name}
            </p>
            <p className={style.xpClass}>{entry.xp.toLocaleString()} XP</p>
          </div>
        );
      })}
    </div>
  );
}
