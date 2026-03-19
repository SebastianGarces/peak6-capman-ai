import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-0.5 w-24 rounded-full" />
      </div>

      {/* Tab switcher skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Top 3 podium skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center space-y-2">
          <Skeleton className="mx-auto h-10 w-10 rounded-full" />
          <Skeleton className="mx-auto h-4 w-20" />
          <Skeleton className="mx-auto h-3 w-14" />
        </div>
        <div className="glass-card rounded-xl p-6 text-center space-y-2">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-20" />
          <Skeleton className="mx-auto h-3 w-14" />
        </div>
        <div className="glass-card rounded-xl p-4 text-center space-y-2">
          <Skeleton className="mx-auto h-10 w-10 rounded-full" />
          <Skeleton className="mx-auto h-4 w-20" />
          <Skeleton className="mx-auto h-3 w-14" />
        </div>
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="glass-card flex items-center gap-4 rounded-lg px-4 py-3"
          >
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
