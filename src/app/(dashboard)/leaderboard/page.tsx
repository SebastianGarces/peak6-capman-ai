"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTabs } from "@/components/game/leaderboard-tabs";
import { LeaderboardTable } from "@/components/game/leaderboard-table";
import { LeaderboardPodium } from "@/components/game/leaderboard-podium";
import { getLeaderboard } from "@/actions/gamification";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const [tab, setTab] = useState("alltime");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(tab as any).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [tab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="See how you rank against other traders"
        icon={Trophy}
      />

      <div className="space-y-6">
        <LeaderboardTabs activeTab={tab} onTabChange={setTab} />

        {loading ? (
          <div className="space-y-4">
            {/* Podium skeleton */}
            <div className="flex items-end justify-center gap-3">
              {[1, 0, 2].map((i) => (
                <div key={i} className={`flex-1 max-w-[160px] bg-surface border border-surface-border rounded-lg p-4 text-center space-y-2 ${i === 0 ? "py-6" : "py-4"}`}>
                  <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                  <Skeleton className="mx-auto h-4 w-20" />
                  <Skeleton className="mx-auto h-3 w-14" />
                </div>
              ))}
            </div>
            {/* Table skeleton */}
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-surface border border-surface-border flex items-center gap-4 rounded-lg px-4 py-3">
                  <Skeleton className="h-4 w-6 shrink-0" />
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {entries.length >= 3 && (
              <LeaderboardPodium entries={entries.slice(0, 3)} />
            )}
            <LeaderboardTable entries={entries} />
          </>
        )}
      </div>
    </div>
  );
}
