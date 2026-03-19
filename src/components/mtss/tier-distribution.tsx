"use client";

import { motion } from "motion/react";
import { progressFillTransition } from "@/lib/motion";

interface TierDistributionProps {
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}

export function TierDistribution({ tier1Count, tier2Count, tier3Count }: TierDistributionProps) {
  const total = tier1Count + tier2Count + tier3Count || 1;
  const tiers = [
    { label: "Tier 1", count: tier1Count, color: "bg-emerald-500", pct: Math.round((tier1Count / total) * 100) },
    { label: "Tier 2", count: tier2Count, color: "bg-amber-500", pct: Math.round((tier2Count / total) * 100) },
    { label: "Tier 3", count: tier3Count, color: "bg-red-500", pct: Math.round((tier3Count / total) * 100) },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Tier Distribution</h3>
      {tiers.map((tier) => (
        <div key={tier.label} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{tier.label}</span>
            <span className="font-mono text-sm text-foreground">
              {tier.count} <span className="text-muted-foreground">({tier.pct}%)</span>
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted">
            <motion.div
              className={`h-3 rounded-full ${tier.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${tier.pct}%` }}
              transition={progressFillTransition}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
