"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MatchmakingSpinner } from "./matchmaking-spinner";
import { useSocket } from "@/components/providers/socket-provider";
import { useRouter } from "next/navigation";

export function ChallengeLobby() {
  const [searching, setSearching] = useState(false);
  const [matched, setMatched] = useState<{ challengeId: string; opponent: { name: string; level: number } } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { challengeSocket } = useSocket();
  const router = useRouter();

  const findMatch = useCallback(() => {
    setSearching(true);
    challengeSocket?.emit("challenge:request", { curriculumLevelId: 1 });

    challengeSocket?.on("challenge:matched", (data: any) => {
      setSearching(false);
      setMatched(data);
      // 5 second countdown
      let count = 5;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          router.push(`/compete/${data.challengeId}`);
        }
      }, 1000);
    });
  }, [challengeSocket, router]);

  const cancelSearch = () => {
    setSearching(false);
    challengeSocket?.emit("challenge:cancel");
  };

  return (
    <div className="space-y-6">
      {!searching && !matched && (
        <Button size="lg" onClick={findMatch}>Find Match</Button>
      )}

      {searching && (
        <div className="space-y-4">
          <MatchmakingSpinner />
          <Button variant="outline" onClick={cancelSearch}>Cancel</Button>
        </div>
      )}

      {matched && countdown !== null && (
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Matched with {matched.opponent.name}!</p>
          <p className="text-4xl font-bold text-primary">{countdown}</p>
        </div>
      )}
    </div>
  );
}
