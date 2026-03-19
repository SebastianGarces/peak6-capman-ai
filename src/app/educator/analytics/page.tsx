import { PageHeader } from "@/components/layout/page-header";
import { CohortProgressChart } from "@/components/mtss/cohort-progress-chart";
import { ScenarioAnalytics } from "@/components/mtss/scenario-analytics";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Cohort progress and scenario performance" />
      <CohortProgressChart />
      <ScenarioAnalytics />
    </div>
  );
}
