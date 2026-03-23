"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface p-1 border border-surface-border",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer",
            activeTab === tab.value
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
