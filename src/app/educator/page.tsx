import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { getMtssOverview, getInterventionQueue } from "@/actions/educator";
import { TierHeatmap } from "@/components/mtss/tier-heatmap";
import { TierDistribution } from "@/components/mtss/tier-distribution";
import { InterventionQueue } from "@/components/mtss/intervention-queue";
import { EngagementPanel } from "@/components/mtss/engagement-panel";
import { ScenarioGenerator } from "@/components/mtss/scenario-generator";

export default async function EducatorPage() {
  const [overview, queue] = await Promise.all([
    getMtssOverview(),
    getInterventionQueue(),
  ]);

  const { matrix } = overview;

  // Compute tier counts across all learner×objective cells
  let tier1Count = 0;
  let tier2Count = 0;
  let tier3Count = 0;

  for (const learner of matrix) {
    for (const obj of learner.objectives) {
      if (obj.tier === 1) tier1Count++;
      else if (obj.tier === 2) tier2Count++;
      else if (obj.tier === 3) tier3Count++;
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="MTSS Dashboard"
        description="Multi-Tiered System of Supports — learner skill classifications"
        icon={LayoutDashboard}
      />

      {/* Engagement stats — DAU/WAU are not yet tracked; show learner counts as proxies */}
      <EngagementPanel
        dau={matrix.length}
        wau={matrix.length}
        avgSessionsPerWeek={0}
        challengeRate={0}
      />

      {/* Tier distribution + heatmap row */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <TierDistribution
            tier1Count={tier1Count}
            tier2Count={tier2Count}
            tier3Count={tier3Count}
          />
        </div>
        <div className="lg:col-span-3">
          <TierHeatmap data={overview} />
        </div>
      </div>

      {/* AI scenario generation */}
      <ScenarioGenerator />

      {/* Intervention summary */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-text">Priority Interventions</h2>
          {queue.length > 5 && (
            <a
              href="/educator/interventions"
              className="text-xs font-semibold text-amber hover:text-amber/80 transition-colors"
            >
              View all {queue.length} →
            </a>
          )}
        </div>
        <InterventionQueue items={queue} limit={5} />
      </div>
    </div>
  );
}
