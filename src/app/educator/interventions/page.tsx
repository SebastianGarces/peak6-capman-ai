import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { getInterventionQueue } from "@/actions/educator";
import { InterventionQueue } from "@/components/mtss/intervention-queue";

export default async function InterventionsPage() {
  const queue = await getInterventionQueue();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Interventions"
        description="Learners classified at Tier 3 across one or more skill objectives"
        icon={AlertTriangle}
      />
      <InterventionQueue items={queue} />
    </div>
  );
}
