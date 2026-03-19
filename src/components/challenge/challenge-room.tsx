"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChallengeTimer } from "./challenge-timer";
import { ChallengeResults } from "./challenge-results";
import { useSocket } from "@/components/providers/socket-provider";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp } from "@/lib/motion";
import { CheckCircle, User } from "lucide-react";

type OpponentStatus = "writing" | "submitted" | "waiting" | "disconnected";

interface ChallengeRoomProps {
  challengeId: string;
}

export function ChallengeRoom({ challengeId }: ChallengeRoomProps) {
  const [scenario, setScenario] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState<OpponentStatus>("writing");
  const [results, setResults] = useState<any>(null);
  const { challengeSocket } = useSocket();

  useEffect(() => {
    if (!challengeSocket) return;

    challengeSocket.on("challenge:start", (data: any) => {
      setScenario(data.scenario);
    });

    challengeSocket.on("challenge:opponent_submitted", () => {
      setOpponentStatus("submitted");
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
    setOpponentStatus("waiting");
    challengeSocket?.emit("challenge:submit", { challengeId, response });
  }, [challengeSocket, challengeId, response, submitted]);

  if (results) {
    return (
      <ChallengeResults
        isWinner={results.winner === "you"}
        yourScore={results.yourScore}
        opponentScore={results.opponentScore}
        xpAwarded={results.xpAwarded}
        opponentResponse={results.opponentResponse}
        challengeId={challengeId}
      />
    );
  }

  const opponentDotColor =
    opponentStatus === "writing"
      ? "bg-green-500 animate-pulse"
      : opponentStatus === "submitted"
        ? "bg-blue-500"
        : opponentStatus === "disconnected"
          ? "bg-muted-foreground"
          : "bg-amber-500";

  const opponentLabel =
    opponentStatus === "writing"
      ? "Writing..."
      : opponentStatus === "submitted"
        ? "Submitted"
        : opponentStatus === "disconnected"
          ? "Disconnected"
          : "Waiting for results...";

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header row: timer + opponent status */}
      <div className="glass-card rounded-xl px-5 py-3 flex items-center justify-between">
        <ChallengeTimer duration={300} onExpire={handleSubmit} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Opponent:</span>
          <span className={`h-2 w-2 rounded-full ${opponentDotColor}`} />
          <span className={opponentStatus === "submitted" ? "text-blue-400" : "text-muted-foreground"}>
            {opponentLabel}
          </span>
          {opponentStatus === "submitted" && (
            <CheckCircle className="h-4 w-4 text-blue-400" />
          )}
        </div>
      </div>

      {/* Split-pane: scenario + response */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scenario panel */}
        <AnimatePresence>
          {scenario ? (
            <motion.div
              key="scenario"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-xl p-5"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Scenario</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{scenario.scenario_text}</p>
              {scenario.question_prompt && (
                <p className="mt-3 text-sm font-medium text-primary">{scenario.question_prompt}</p>
              )}
            </motion.div>
          ) : (
            <div className="glass-card rounded-xl p-5 text-center text-sm text-muted-foreground">
              Waiting for scenario...
            </div>
          )}
        </AnimatePresence>

        {/* Response area */}
        <div className="glass-card rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Response</p>
            <span className="text-xs text-muted-foreground">{response.length} chars</span>
          </div>
          <textarea
            className="flex-1 w-full min-h-[200px] rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={8}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={submitted}
            placeholder="Write your analysis and trading decision..."
          />
          <Button
            onClick={handleSubmit}
            disabled={submitted || !response.trim()}
            className={submitted ? "" : "gradient-primary-btn text-white border-0"}
          >
            {submitted ? "Submitted — waiting for results" : "Submit Response"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
