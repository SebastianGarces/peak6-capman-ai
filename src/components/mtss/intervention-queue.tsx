"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.userId} className="flex items-center justify-between rounded-lg border border-red-900/30 bg-red-950/20 p-3">
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              Failing: {item.failingObjectives.join(", ")} | Avg: {item.avgScore.toFixed(0)}% | {item.daysInactive}d inactive
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onNudge?.(item.userId)}>
              Send Nudge
            </Button>
            <Link href={`/educator/students/${item.userId}`}>
              <Button size="sm" variant="ghost">View Detail</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
