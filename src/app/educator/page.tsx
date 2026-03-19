import { PageHeader } from "@/components/layout/page-header";
import { getMtssOverview, getInterventionQueue } from "@/actions/educator";
import { TierHeatmap } from "@/components/mtss/tier-heatmap";
import { TierDistribution } from "@/components/mtss/tier-distribution";
import { InterventionQueue } from "@/components/mtss/intervention-queue";
import { EngagementPanel } from "@/components/mtss/engagement-panel";

export default async function EducatorOverview() {
  const overview = await getMtssOverview();
  const queue = await getInterventionQueue();

  // Calculate tier counts
  let tier1 = 0, tier2 = 0, tier3 = 0;
  overview.matrix.forEach((row) => {
    row.objectives.forEach((obj) => {
      if (obj.tier === 1) tier1++;
      else if (obj.tier === 2) tier2++;
      else if (obj.tier === 3) tier3++;
    });
  });

  return (
    <div className="space-y-6">
      <PageHeader title="MTSS Overview" description="Monitor learner progress and tier classifications" />

      <EngagementPanel dau={0} wau={0} avgSessionsPerWeek={0} challengeRate={0} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TierDistribution tier1Count={tier1} tier2Count={tier2} tier3Count={tier3} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">Cohort Heatmap</h3>
        <TierHeatmap data={overview} />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">Intervention Queue</h3>
        <InterventionQueue items={queue} />
      </div>
    </div>
  );
}
