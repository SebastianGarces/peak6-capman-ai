"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChallengeTimer } from "./challenge-timer";
import { useSocket } from "@/components/providers/socket-provider";

interface ChallengeRoomProps {
  challengeId: string;
}

export function ChallengeRoom({ challengeId }: ChallengeRoomProps) {
  const [scenario, setScenario] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState("Writing...");
  const [results, setResults] = useState<any>(null);
  const { challengeSocket } = useSocket();

  useEffect(() => {
    if (!challengeSocket) return;

    challengeSocket.on("challenge:start", (data: any) => {
      setScenario(data.scenario);
    });

    challengeSocket.on("challenge:opponent_submitted", () => {
      setOpponentStatus("Submitted");
    });

    challengeSocket.on("challenge:results", (data: any) => {
      setResults(data);
    });

    challengeSocket.on("challenge:timeout", () => {
      if (!submitted) handleSubmit();
    });

    return () => {
      challengeSocket.off("challenge:start");
      challengeSocket.off("challenge:opponent_submitted");
      challengeSocket.off("challenge:results");
      challengeSocket.off("challenge:timeout");
    };
  }, [challengeSocket, submitted]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    challengeSocket?.emit("challenge:submit", { challengeId, response });
    setOpponentStatus("Waiting for results...");
  }, [challengeSocket, challengeId, response, submitted]);

  if (results) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">
          {results.winner === "you" ? "You Win!" : "You Lose"}
        </h2>
        <div className="flex justify-center gap-8">
          <div>
            <p className="text-sm text-muted-foreground">Your Score</p>
            <p className="text-3xl font-bold">{results.yourScore}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Opponent Score</p>
            <p className="text-3xl font-bold">{results.opponentScore}</p>
          </div>
        </div>
        <p className="text-primary">+{results.xpAwarded} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ChallengeTimer duration={300} onExpire={handleSubmit} />
        <span className="text-sm text-muted-foreground">Opponent: {opponentStatus}</span>
      </div>

      {scenario && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="whitespace-pre-wrap">{scenario.scenario_text || "Waiting for scenario..."}</p>
        </div>
      )}

      <textarea
        className="w-full rounded-lg border border-border bg-card p-4 text-foreground"
        rows={8}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        disabled={submitted}
        placeholder="Write your analysis..."
      />

      <Button onClick={handleSubmit} disabled={submitted || !response.trim()}>
        {submitted ? "Submitted" : "Submit Response"}
      </Button>
    </div>
  );
}
