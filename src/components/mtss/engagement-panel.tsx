import { Users, Calendar, BarChart3, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface EngagementPanelProps {
  dau: number;
  wau: number;
  avgSessionsPerWeek: number;
  challengeRate: number;
}

interface StatCardProps {
  label: string;
  abbrev: string;
  value: string | number;
  colorText: string;
  colorBg: string;
  Icon: LucideIcon;
}

function StatCard({ label, abbrev, value, colorText, colorBg, Icon }: StatCardProps) {
  return (
    <div className={`rounded-xl p-5 ${colorBg} flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorText}`} />
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{abbrev}</p>
      </div>
      <p className={`font-mono text-3xl font-bold ${colorText}`}>{value}</p>
      <p className="text-xs text-text-dim">{label}</p>
    </div>
  );
}

export function EngagementPanel({ dau, wau, avgSessionsPerWeek, challengeRate }: EngagementPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        abbrev="DAU"
        label="Daily Active Users"
        value={dau}
        colorText="text-amber"
        colorBg="bg-amber-muted"
        Icon={Users}
      />
      <StatCard
        abbrev="WAU"
        label="Weekly Active Users"
        value={wau}
        colorText="text-lavender"
        colorBg="bg-lavender-muted"
        Icon={Calendar}
      />
      <StatCard
        abbrev="Sessions"
        label="Avg Sessions/Week"
        value={avgSessionsPerWeek.toFixed(1)}
        colorText="text-green"
        colorBg="bg-green-muted"
        Icon={BarChart3}
      />
      <StatCard
        abbrev="Challenge Rate"
        label="Learners in challenges"
        value={`${challengeRate}%`}
        colorText="text-orange"
        colorBg="bg-orange-muted"
        Icon={Trophy}
      />
    </div>
  );
}
