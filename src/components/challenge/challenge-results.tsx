"use client";

import { Button } from "@/components/ui/button";
import { XpPopup } from "@/components/game/xp-popup";
import { useState } from "react";
import Link from "next/link";

interface ChallengeResultsProps {
  isWinner: boolean;
  yourScore: number;
  opponentScore: number;
  xpAwarded: number;
  opponentResponse?: string;
  challengeId: string;
}

export function ChallengeResults({
  isWinner,
  yourScore,
  opponentScore,
  xpAwarded,
  opponentResponse,
  challengeId,
}: ChallengeResultsProps) {
  const [showOpponent, setShowOpponent] = useState(false);

  return (
    <div className="space-y-6 text-center">
      <div className="relative">
        <h2 className={`text-3xl font-bold ${isWinner ? "text-green-500" : "text-red-500"}`}>
          {isWinner ? "You Win!" : "You Lose"}
        </h2>
        <XpPopup amount={xpAwarded} show={true} />
      </div>

      <div className="flex justify-center gap-12">
        <div>
          <p className="text-sm text-muted-foreground">Your Score</p>
          <p className="text-4xl font-bold text-foreground">{yourScore}</p>
        </div>
        <div className="text-2xl font-bold text-muted-foreground self-center">vs</div>
        <div>
          <p className="text-sm text-muted-foreground">Opponent</p>
          <p className="text-4xl font-bold text-foreground">{opponentScore}</p>
        </div>
      </div>

      <p className="text-primary font-medium">+{xpAwarded} XP</p>

      {opponentResponse && (
        <div>
          <Button variant="outline" onClick={() => setShowOpponent(!showOpponent)}>
            {showOpponent ? "Hide" : "View"} Opponent&apos;s Response
          </Button>
          {showOpponent && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4 text-left">
              <p className="whitespace-pre-wrap text-sm">{opponentResponse}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <Link href="/compete">
          <Button>Rematch</Button>
        </Link>
        <Link href="/compete">
          <Button variant="outline">Back to Lobby</Button>
        </Link>
      </div>
    </div>
  );
}
