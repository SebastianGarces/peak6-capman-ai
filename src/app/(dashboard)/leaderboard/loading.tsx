import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Podium skeleton */}
      <div className="flex items-end justify-center gap-4 mb-8">
        <Skeleton className="h-20 w-24 rounded-xl" />
        <Skeleton className="h-28 w-28 rounded-xl" />
        <Skeleton className="h-16 w-24 rounded-xl" />
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface p-4"
          >
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
