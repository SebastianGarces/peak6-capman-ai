"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface InterventionItem {
  userId: string;
  name: string;
  failingObjectives: string[];
  avgScore: number;
  daysInactive: number;
}

export function InterventionQueue({
  items,
  onNudge,
}: {
  items: InterventionItem[];
  onNudge?: (userId: string) => void;
}) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-muted-foreground">No Tier 3 learners — great job!</p>;
  }

  return (
    <motion.div
      className="space-y-2"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.userId}
          variants={staggerItem}
          className="glass-card rounded-xl border-l-4 border-red-500 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-red-950 text-red-300 text-sm font-semibold">
                {item.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Failing: {item.failingObjectives.join(", ")} | Avg: {item.avgScore.toFixed(0)}% | {item.daysInactive}d inactive
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
              onClick={() => onNudge?.(item.userId)}
            >
              Send Nudge
            </Button>
            <Link href={`/educator/students/${item.userId}`}>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                View Detail
              </Button>
            </Link>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
