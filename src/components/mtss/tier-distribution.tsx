export interface TierDistributionProps {
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}

interface TierRowProps {
  label: string;
  count: number;
  total: number;
  colorBar: string;
  colorText: string;
  colorBg: string;
}

function TierRow({ label, count, total, colorBar, colorText, colorBg }: TierRowProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold w-14 ${colorText}`}>{label}</span>
      <div className="flex-1 h-5 rounded-full bg-surface-hover overflow-hidden">
        <div
          className={`h-full rounded-full ${colorBar} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 min-w-[72px] text-right">
        <span className={`font-mono font-bold text-sm ${colorText}`}>{count}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${colorBg} ${colorText} font-semibold`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function TierDistribution({ tier1Count, tier2Count, tier3Count }: TierDistributionProps) {
  const total = tier1Count + tier2Count + tier3Count || 1;
  return (
    <div className="rounded-xl bg-surface border border-surface-border p-5 space-y-4">
      <h3 className="font-semibold text-text text-sm">Tier Distribution</h3>
      <div className="space-y-3">
        <TierRow
          label="Tier 1"
          count={tier1Count}
          total={total}
          colorBar="bg-green"
          colorText="text-green"
          colorBg="bg-green-muted"
        />
        <TierRow
          label="Tier 2"
          count={tier2Count}
          total={total}
          colorBar="bg-amber"
          colorText="text-amber"
          colorBg="bg-amber-muted"
        />
        <TierRow
          label="Tier 3"
          count={tier3Count}
          total={total}
          colorBar="bg-red"
          colorText="text-red"
          colorBg="bg-red-muted"
        />
      </div>
      <p className="text-xs text-text-dim pt-1">
        Based on most recent MTSS classifications across all skill objectives.
      </p>
    </div>
  );
}
