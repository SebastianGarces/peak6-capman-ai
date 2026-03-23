"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ChallengeLobby } from "@/components/challenge/challenge-lobby";
import { Swords } from "lucide-react";

export default function CompetePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Arena"
        description="Challenge other traders head-to-head"
        icon={Swords}
      />
      <ChallengeLobby />
    </div>
  );
}
