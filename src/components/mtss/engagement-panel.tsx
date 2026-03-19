interface EngagementPanelProps {
  dau: number;
  wau: number;
  avgSessionsPerWeek: number;
  challengeRate: number;
}

export function EngagementPanel({ dau, wau, avgSessionsPerWeek, challengeRate }: EngagementPanelProps) {
  const stats = [
    { label: "DAU", value: dau },
    { label: "WAU", value: wau },
    { label: "Avg Sessions/Week", value: avgSessionsPerWeek.toFixed(1) },
    { label: "Challenge Rate", value: `${challengeRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
