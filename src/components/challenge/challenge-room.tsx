"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChallengeTimer } from "./challenge-timer";
import { ChallengeResults } from "./challenge-results";
import { useSocket } from "@/components/providers/socket-provider";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp } from "@/lib/motion";
import { CheckCircle, User, Clock, FileText } from "lucide-react";

type OpponentStatus = "writing" | "submitted" | "waiting" | "disconnected";

interface ChallengeRoomProps {
  challengeId: string;
  initialScenario?: any;
  userId?: string;
}

export function ChallengeRoom({ challengeId, initialScenario, userId }: ChallengeRoomProps) {
  const [scenario, setScenario] = useState<any>(initialScenario ?? null);
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState<OpponentStatus>("writing");
  const [results, setResults] = useState<any>(null);
  const { challengeSocket } = useSocket();

  // Set up socket listeners — stable effect, no dependency on `submitted`
  useEffect(() => {
    if (!challengeSocket) return;

    challengeSocket.on("challenge:start", (data: any) => {
      setScenario(data.scenario);
    });

    challengeSocket.on("challenge:opponent_submitted", () => {
      setOpponentStatus("submitted");
    });

    challengeSocket.on("challenge:results", (data: any) => {
      console.log("Received challenge:results", data);
      setResults(data);
    });

    challengeSocket.on("challenge:timeout", () => {
      // timeout handling done via timer component
    });

    // Ensure auth is current and request scenario
    if (userId) {
      challengeSocket.emit("auth", { userId });
    }
    challengeSocket.emit("challenge:get_scenario", { challengeId });

    return () => {
      challengeSocket.off("challenge:start");
      challengeSocket.off("challenge:opponent_submitted");
      challengeSocket.off("challenge:results");
      challengeSocket.off("challenge:timeout");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeSocket]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    setOpponentStatus("waiting");
    challengeSocket?.emit("challenge:submit", { challengeId, response, userId });
  }, [challengeSocket, challengeId, response, submitted, userId]);

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
          ? "bg-text-muted"
          : "bg-amber-500 animate-pulse";

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
      <div className="bg-surface border border-surface-border rounded-xl px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-text-muted" />
          <ChallengeTimer duration={300} onExpire={handleSubmit} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-text-muted" />
          <span className="text-text-muted hidden sm:inline">Opponent:</span>
          <span className={`h-2 w-2 rounded-full ${opponentDotColor}`} />
          <span
            className={
              opponentStatus === "submitted"
                ? "text-blue-400 font-medium"
                : "text-text-muted"
            }
          >
            {opponentLabel}
          </span>
          {opponentStatus === "submitted" && (
            <CheckCircle className="h-4 w-4 text-blue-400" />
          )}
        </div>
      </div>

      {/* Split-pane: scenario (left) + response (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        {/* Scenario panel */}
        <AnimatePresence mode="wait">
          {scenario ? (
            <motion.div
              key="scenario-content"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-surface border border-surface-border rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Scenario
                </p>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                {scenario.scenario_text}
              </p>
              {scenario.question_prompt && (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary-muted p-3">
                  <p className="text-sm font-medium text-primary">
                    {scenario.question_prompt}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="scenario-loading"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-surface border border-surface-border rounded-xl p-8 text-center space-y-3"
            >
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 animate-pulse">
                <FileText className="h-6 w-6 text-primary/60" />
              </div>
              <p className="text-sm text-text-muted">Loading scenario...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response area */}
        <div className="bg-surface border border-surface-border rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Your Response
            </p>
            <span
              className={`text-xs tabular-nums ${
                response.length > 800
                  ? "text-amber-400"
                  : "text-text-muted"
              }`}
            >
              {response.length} chars
            </span>
          </div>
          <textarea
            className="flex-1 w-full min-h-[220px] rounded-lg border border-surface-border bg-background p-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-sans transition-colors"
            rows={9}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={submitted}
            placeholder="Write your analysis and trading decision here..."
          />
          <Button
            onClick={handleSubmit}
            disabled={submitted || !response.trim()}
            className={`w-full ${submitted ? "" : "bg-primary text-white border-0"}`}
          >
            {submitted ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Submitted — awaiting results
              </span>
            ) : (
              "Submit Response"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
