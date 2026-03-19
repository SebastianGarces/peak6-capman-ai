"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="alltime">All-Time</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="skill">Skill Level</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
