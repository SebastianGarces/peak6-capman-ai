import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CohortProgressChart } from "@/components/mtss/cohort-progress-chart";
import { ScenarioAnalytics } from "@/components/mtss/scenario-analytics";

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Analytics"
        description="Cohort performance insights and scenario effectiveness"
        icon={BarChart3}
      />

      {/* Coming soon banner */}
      <div className="rounded-xl bg-amber-muted border border-amber/20 px-5 py-4 flex items-start gap-3">
        <BarChart3 className="h-5 w-5 text-amber shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber text-sm">Analytics coming soon</p>
          <p className="text-xs text-amber/70 mt-0.5">
            Full analytics with real-time charts and exportable reports are in development.
            The data below is placeholder.
          </p>
        </div>
      </div>

      {/* Mock metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Attempts", value: "1,247", color: "text-amber" },
          { label: "Avg Score", value: "68%", color: "text-green" },
          { label: "Completion Rate", value: "82%", color: "text-lavender" },
          { label: "Active This Week", value: "34", color: "text-orange" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-surface border border-surface-border p-5"
          >
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {card.label}
            </p>
            <p className={`font-mono text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CohortProgressChart />
        <ScenarioAnalytics />
      </div>
    </div>
  );
}
