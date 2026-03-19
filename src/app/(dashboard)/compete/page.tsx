"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ChallengeLobby } from "@/components/challenge/challenge-lobby";

export default function CompetePage() {
  return (
    <div>
      <PageHeader title="Compete" description="Challenge other traders head-to-head" />
      <ChallengeLobby />
    </div>
  );
}
