"use client";

export function CohortProgressChart({ data }: { data?: any[] }) {
  const maxValue = data && data.length > 0 ? Math.max(...data.map((d) => d.mastery ?? 0), 1) : 100;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="mb-4 text-sm font-medium text-foreground">Cohort Progress</h3>
      {(!data || data.length === 0) ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No data available yet</p>
      ) : (
        <div className="flex gap-4">
          {/* Left axis */}
          <div className="flex flex-col justify-between py-1 text-right">
            {[100, 75, 50, 25, 0].map((tick) => (
              <span key={tick} className="font-mono text-xs text-muted-foreground">{tick}%</span>
            ))}
          </div>
          {/* Bars */}
          <div className="relative flex-1">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-px w-full bg-border/40" />
              ))}
            </div>
            <div className="relative h-48 flex items-end gap-1">
              {data.map((d, i) => {
                const heightPct = ((d.mastery ?? 0) / 100) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground">{d.mastery ?? 0}%</span>
                    <div
                      className="w-full bg-primary rounded-t-md transition-all"
                      style={{ height: `${heightPct}%` }}
                      title={`Level ${d.level}: ${d.mastery}%`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {data && data.length > 0 && (
        <div className="mt-2 flex gap-1 pl-10">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-xs text-muted-foreground truncate block">Lv{d.level}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
