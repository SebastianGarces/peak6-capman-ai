"use client";

import { InterventionQueue } from "@/components/mtss/intervention-queue";
import { sendNudge } from "@/actions/educator";

export function InterventionQueueClient({ initialQueue }: { initialQueue: any[] }) {
  return (
    <InterventionQueue
      items={initialQueue}
      onNudge={(userId) => sendNudge(userId, "Keep going! We're here to help.")}
    />
  );
}
