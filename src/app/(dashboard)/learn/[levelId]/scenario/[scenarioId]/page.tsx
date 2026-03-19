"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ScenarioReader } from "@/components/trading/scenario-reader";
import { ResponseEditor } from "@/components/trading/response-editor";
import { GradingResult } from "@/components/trading/grading-result";
import { startScenario, submitResponse } from "@/actions/scenario";

type Phase = "read" | "respond" | "grading" | "summary";

const PHASES: Phase[] = ["read", "respond", "grading", "summary"];
const PHASE_LABELS: Record<Phase, string> = {
  read: "Read",
  respond: "Respond",
  grading: "Grading",
  summary: "Summary",
};

interface ScenarioData {
  id: string;
  scenarioText: string;
  marketData: Record<string, unknown>;
  questionPrompt: string;
}

interface GradingData {
  score: number;
  feedback: {
    feedback_summary: string;
    criteria_evaluation: Array<{
      criterion: string;
      score: number;
      max_score: number;
      feedback: string;
    }>;
    total_score: number;
  };
}

function PhaseIndicator({ currentPhase }: { currentPhase: Phase }) {
  const currentIdx = PHASES.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-0">
      {PHASES.map((phase, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={phase} className="flex items-center">
            {/* Circle */}
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-primary/20 border-2 border-primary text-primary"
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            {/* Label below */}
            <span
              className={[
                "ml-1.5 text-xs",
                isCurrent ? "text-primary font-medium" : "text-muted-foreground",
              ].join(" ")}
            >
              {PHASE_LABELS[phase]}
            </span>
            {/* Connecting line */}
            {idx < PHASES.length - 1 && (
              <div
                className={[
                  "mx-2 h-0.5 w-12 transition-all duration-300",
                  idx < currentIdx ? "bg-primary" : "bg-muted",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ScenarioAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.levelId as string;
  const scenarioId = params.scenarioId as string;

  const [phase, setPhase] = useState<Phase>("read");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
  const [gradingData, setGradingData] = useState<GradingData | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch scenario data
    fetch(`/api/scenarios/${scenarioId}`)
      .then((res) => res.json())
      .then((data) => setScenarioData(data))
      .catch(() => {
        // Use placeholder data if API not available
        setScenarioData({
          id: scenarioId,
          scenarioText: "Loading scenario...",
          marketData: {},
          questionPrompt: "",
        });
      });
  }, [scenarioId]);

  const handleStartResponse = async () => {
    try {
      const result = await startScenario(scenarioId);
      setAttemptId(result.attemptId);
      setStartTime(Date.now());
      setPhase("respond");
    } catch (err) {
      setError("Failed to start scenario. Please try again.");
    }
  };

  const handleSubmitResponse = async (responseText: string) => {
    if (!attemptId) return;
    setPhase("grading");

    try {
      const result = await submitResponse(attemptId, responseText);
      if ("error" in result) {
        setError(result.error ?? null);
        setPhase("respond");
        return;
      }
      setGradingData(result as GradingData);
      setPhase("summary");
    } catch (err) {
      setError("Grading failed. Please try again.");
      setPhase("respond");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Phase stepper indicator */}
      <div className="flex items-center">
        <PhaseIndicator currentPhase={phase} />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Phase 1: Read */}
        {phase === "read" && (
          <motion.div
            key="read"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {scenarioData && (
              <ScenarioReader
                scenarioText={scenarioData.scenarioText}
                marketData={scenarioData.marketData as any}
              />
            )}
            {scenarioData?.questionPrompt && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Your Task
                </h3>
                <p className="text-sm">{scenarioData.questionPrompt}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleStartResponse}
              className="w-full rounded-md gradient-primary-btn py-3 text-sm font-semibold text-white border-0 transition-opacity hover:opacity-90"
            >
              Start Response
            </button>
          </motion.div>
        )}

        {/* Phase 2: Respond */}
        {phase === "respond" && (
          <motion.div
            key="respond"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {scenarioData && (
              <ScenarioReader
                scenarioText={scenarioData.scenarioText}
                marketData={scenarioData.marketData as any}
              />
            )}
            <ResponseEditor onSubmit={handleSubmitResponse} />
          </motion.div>
        )}

        {/* Phase 3: Grading */}
        {phase === "grading" && (
          <motion.div
            key="grading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <motion.div
              className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-muted-foreground">Analyzing your response...</p>
          </motion.div>
        )}

        {/* Phase 4: Summary */}
        {phase === "summary" && gradingData && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <GradingResult score={gradingData.score} feedback={gradingData.feedback} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`/learn/${levelId}`)}
                className="flex-1 rounded-md border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Back to Level
              </button>
              <button
                type="button"
                onClick={() => router.push(`/learn/${levelId}`)}
                className="flex-1 rounded-md gradient-primary-btn py-2.5 text-sm font-semibold text-white border-0 transition-opacity hover:opacity-90"
              >
                Next Scenario
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
