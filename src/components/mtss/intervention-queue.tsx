"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sendNudge } from "@/actions/educator";
import { Bell, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface InterventionItem {
  userId: string;
  name: string;
  failingObjectives: string[];
  avgScore: number;
  daysInactive: number;
}

export interface InterventionQueueProps {
  items: InterventionItem[];
  /** Optional: override nudge handler (e.g., for testing or custom flows) */
  onNudge?: (userId: string) => void;
  /** Show at most this many items (for dashboard summary views) */
  limit?: number;
}

function LearnerRow({
  item,
  onNudge,
}: {
  item: InterventionItem;
  onNudge?: (userId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [nudged, setNudged] = useState(false);

  function handleNudge() {
    if (onNudge) {
      onNudge(item.userId);
      setNudged(true);
      return;
    }
    startTransition(async () => {
      const message = `Hi ${item.name.split(" ")[0]}, your educator wants to check in. Keep going — you can do it!`;
      await sendNudge(item.userId, message);
      setNudged(true);
    });
  }

  const initials = item.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const scoreColor =
    item.avgScore >= 70
      ? "text-green"
      : item.avgScore >= 50
        ? "text-amber"
        : "text-red";

  return (
    <div className="flex items-start gap-4 py-4 border-b border-surface-border last:border-0">
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-muted border border-red/20 text-sm font-bold text-red">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/educator/students/${item.userId}`}
            className="font-semibold text-text text-sm hover:text-amber transition-colors"
          >
            {item.name}
          </Link>
          {item.daysInactive >= 7 && (
            <Badge variant="red" className="text-[10px]">
              {item.daysInactive >= 999 ? "Never active" : `${item.daysInactive}d inactive`}
            </Badge>
          )}
          {item.daysInactive > 0 && item.daysInactive < 7 && (
            <span className="text-xs text-text-dim">{item.daysInactive}d inactive</span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {item.failingObjectives.map((code) => (
            <Badge key={code} variant="red" className="font-mono text-[10px]">
              {code}
            </Badge>
          ))}
        </div>
        <p className={cn("mt-1 text-xs font-mono font-semibold", scoreColor)}>
          avg {item.avgScore.toFixed(0)}%
        </p>
      </div>

      {/* Nudge */}
      <div className="shrink-0">
        {nudged ? (
          <div className="flex items-center gap-1.5 text-green text-xs font-semibold">
            <CheckCircle className="h-4 w-4" />
            Sent
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNudge}
            loading={isPending}
            className="gap-1.5"
          >
            <Bell className="h-3.5 w-3.5" />
            Send Nudge
          </Button>
        )}
      </div>
    </div>
  );
}

export function InterventionQueue({ items, onNudge, limit }: InterventionQueueProps) {
  const displayItems = limit ? items.slice(0, limit) : items;

  if (displayItems.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-surface-border p-10 text-center">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-green-muted mb-3">
          <CheckCircle className="h-6 w-6 text-green" />
        </div>
        <p className="font-semibold text-text">No Tier 3 learners — great job!</p>
        <p className="mt-1 text-sm text-text-muted">All learners are performing at Tier 1 or Tier 2.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-surface-border overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text">Intervention Queue</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {items.length} learner{items.length !== 1 ? "s" : ""} at Tier 3
            {limit && items.length > limit ? ` — showing top ${limit}` : ""}
          </p>
        </div>
        <Badge variant="red" className="font-mono">
          {items.length}
        </Badge>
      </div>
      <div className="px-5">
        {displayItems.map((item) => (
          <LearnerRow key={item.userId} item={item} onNudge={onNudge} />
        ))}
      </div>
    </div>
  );
}
