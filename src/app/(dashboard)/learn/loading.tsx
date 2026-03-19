import { Skeleton } from "@/components/ui/skeleton";

export default function LearnLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header skeleton */}
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Curriculum map skeleton — 2 cols sm / 3 cols lg */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4"
          >
            {/* Icon + badge row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            {/* Level label */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            {/* Footer */}
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
