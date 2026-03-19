"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTabs } from "@/components/game/leaderboard-tabs";
import { LeaderboardTable } from "@/components/game/leaderboard-table";
import { getLeaderboard } from "@/actions/gamification";

export default function LeaderboardPage() {
  const [tab, setTab] = useState("alltime");
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    getLeaderboard(tab as any).then(setEntries);
  }, [tab]);

  return (
    <div>
      <PageHeader title="Leaderboard" description="See how you rank against other traders" />
      <div className="space-y-4">
        <LeaderboardTabs activeTab={tab} onTabChange={setTab} />
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
}
