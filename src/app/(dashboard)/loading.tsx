import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero greeting skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      {/* Stats row — 4 glass-card tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 text-center space-y-2">
            <Skeleton className="mx-auto h-5 w-5 rounded-full" />
            <Skeleton className="mx-auto h-8 w-16" />
            <Skeleton className="mx-auto h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
