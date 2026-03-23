import { BarChart3 } from "lucide-react";

interface MockScenarioStat {
  name: string;
  attempts: number;
  avgScore: number;
}

const MOCK_STATS: MockScenarioStat[] = [
  { name: "Market Making Basics", attempts: 142, avgScore: 0.74 },
  { name: "Options Pricing", attempts: 98, avgScore: 0.61 },
  { name: "Risk Management", attempts: 87, avgScore: 0.68 },
  { name: "Volatility Arbitrage", attempts: 53, avgScore: 0.55 },
  { name: "Delta Hedging", attempts: 45, avgScore: 0.72 },
];

export function ScenarioAnalytics() {
  return (
    <div className="rounded-xl bg-surface border border-surface-border p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-muted">
          <BarChart3 className="h-4.5 w-4.5 text-amber" />
        </div>
        <div>
          <h3 className="font-semibold text-text text-sm">Top Scenarios by Attempt Volume</h3>
          <p className="text-xs text-text-muted">Mock data — live analytics coming soon</p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_STATS.map((stat) => {
          const scoreColor =
            stat.avgScore >= 0.7 ? "text-green" : stat.avgScore >= 0.6 ? "text-amber" : "text-red";
          const barColor =
            stat.avgScore >= 0.7 ? "bg-green" : stat.avgScore >= 0.6 ? "bg-amber" : "bg-red";

          return (
            <div key={stat.name} className="flex items-center gap-3">
              <span className="text-sm text-text-muted w-48 truncate shrink-0">{stat.name}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} opacity-80 transition-all duration-700`}
                  style={{ width: `${stat.avgScore * 100}%` }}
                />
              </div>
              <span className={`font-mono text-xs font-bold ${scoreColor} w-10 text-right shrink-0`}>
                {Math.round(stat.avgScore * 100)}%
              </span>
              <span className="text-xs text-text-dim w-16 text-right shrink-0">
                {stat.attempts} tries
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
