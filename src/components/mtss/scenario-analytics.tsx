"use client";

export function ScenarioAnalytics({ data }: { data?: any[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Scenario Analytics</h3>
      {(!data || data.length === 0) ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No scenario data available yet</p>
      ) : (
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-mono">{d.passRate}% pass rate</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
