"use client";

import { use } from "react";
import { ChallengeRoom } from "@/components/challenge/challenge-room";

export default function ChallengeRoomPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  return <ChallengeRoom challengeId={challengeId} />;
}
