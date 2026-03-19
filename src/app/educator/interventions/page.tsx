import { PageHeader } from "@/components/layout/page-header";
import { getInterventionQueue } from "@/actions/educator";
import { InterventionQueueClient } from "./client";

export default async function InterventionsPage() {
  const queue = await getInterventionQueue();
  return (
    <div>
      <PageHeader title="Intervention Queue" description="Tier 3 learners requiring immediate attention" />
      <InterventionQueueClient initialQueue={queue} />
    </div>
  );
}
