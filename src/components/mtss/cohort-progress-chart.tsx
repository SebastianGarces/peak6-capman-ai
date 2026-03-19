"use client";

export function CohortProgressChart({ data }: { data?: any[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Cohort Progress</h3>
      {(!data || data.length === 0) ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No data available yet</p>
      ) : (
        <div className="h-48 flex items-end gap-1">
          {data.map((d, i) => (
            <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${d.mastery}%` }} title={`Level ${d.level}: ${d.mastery}%`} />
          ))}
        </div>
      )}
    </div>
  );
}
