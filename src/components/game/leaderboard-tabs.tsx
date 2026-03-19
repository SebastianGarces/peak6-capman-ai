"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  const tabs = [
    { value: "alltime", label: "All-Time" },
    { value: "weekly", label: "Weekly" },
    { value: "skill", label: "Skill Level" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="flex h-auto w-full rounded-none border-b border-border bg-transparent p-0 justify-start gap-0">
        {tabs.map(({ value, label }) => {
          const isActive = activeTab === value;
          return (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary-btn rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
