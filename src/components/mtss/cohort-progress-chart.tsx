import { TrendingUp } from "lucide-react";

export function CohortProgressChart() {
  return (
    <div className="rounded-xl bg-surface border border-surface-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-muted">
          <TrendingUp className="h-4.5 w-4.5 text-amber" />
        </div>
        <div>
          <h3 className="font-semibold text-text text-sm">Cohort Progress</h3>
          <p className="text-xs text-text-muted">Weekly tier movement</p>
        </div>
      </div>

      {/* Placeholder chart area */}
      <div className="flex h-48 items-end gap-2 pt-4">
        {[40, 55, 48, 62, 58, 70, 65, 72, 68, 80, 75, 82].map((height, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-amber to-amber/40 opacity-80 transition-all duration-500"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-text-dim">
        <span>12 weeks ago</span>
        <span className="text-amber font-semibold">Coming soon — real chart integration</span>
        <span>This week</span>
      </div>
    </div>
  );
}
