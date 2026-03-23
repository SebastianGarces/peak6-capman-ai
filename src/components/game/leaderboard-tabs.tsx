"use client";

import { Tabs } from "@/components/ui/tabs";

interface LeaderboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { value: "alltime", label: "All-Time" },
  { value: "weekly", label: "Weekly" },
  { value: "skill", label: "Skill Level" },
];

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />;
}
