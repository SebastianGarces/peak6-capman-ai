"use client";

interface TierDistributionProps {
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}

export function TierDistribution({ tier1Count, tier2Count, tier3Count }: TierDistributionProps) {
  const total = tier1Count + tier2Count + tier3Count || 1;
  const tiers = [
    { label: "Tier 1", count: tier1Count, color: "bg-green-600", pct: Math.round((tier1Count / total) * 100) },
    { label: "Tier 2", count: tier2Count, color: "bg-amber-500", pct: Math.round((tier2Count / total) * 100) },
    { label: "Tier 3", count: tier3Count, color: "bg-red-600", pct: Math.round((tier3Count / total) * 100) },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Tier Distribution</h3>
      {tiers.map((tier) => (
        <div key={tier.label} className="flex items-center gap-3">
          <span className="w-12 text-xs text-muted-foreground">{tier.label}</span>
          <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
            <div
              className={`h-full ${tier.color} flex items-center justify-end pr-2 text-xs font-bold text-white`}
              style={{ width: `${tier.pct}%` }}
            >
              {tier.pct > 10 ? `${tier.pct}%` : ""}
            </div>
          </div>
          <span className="w-8 text-right text-xs text-muted-foreground">{tier.count}</span>
        </div>
      ))}
    </div>
  );
}
