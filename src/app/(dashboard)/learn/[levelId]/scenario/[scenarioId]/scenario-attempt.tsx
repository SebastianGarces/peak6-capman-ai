"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/motion-div";
import { ScenarioReader } from "@/components/trading/scenario-reader";
import { ResponseEditor } from "@/components/trading/response-editor";
import { GradingResult } from "@/components/trading/grading-result";
import { startScenario, submitResponse, submitProbingResponse } from "@/actions/scenario";

type Phase = "read" | "respond" | "grading" | "summary";

interface ScenarioData {
  id: string;
  scenarioText: string;
  questionPrompt: string;
  marketData: Record<string, unknown>;
  difficulty: number;
  marketRegime: string;
  curriculumLevelId: number;
}

interface GradingFeedback {
  total_score: number;
  feedback_summary?: string;
  criteria_evaluation?: Array<{
    criterion: string;
    weight?: number;
    score: number;
    max_score?: number;
    evidence?: string;
    feedback?: string;
  }>;
  probing_questions?: string[];
  skill_objectives_demonstrated?: string[];
  skill_objectives_failed?: string[];
}

interface ScenarioAttemptProps {
  scenario: ScenarioData;
  levelNumber: number;
  levelName: string;
}

const PHASE_STEPS: { id: Phase; label: string }[] = [
  { id: "read", label: "Read" },
  { id: "respond", label: "Respond" },
  { id: "grading", label: "Grading" },
  { id: "summary", label: "Summary" },
];

const PHASE_ORDER: Phase[] = ["read", "respond", "grading", "summary"];

function PhaseStep({
  step,
  currentPhase,
}: {
  step: { id: Phase; label: string };
  currentPhase: Phase;
}) {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const stepIdx = PHASE_ORDER.indexOf(step.id);
  const isComplete = stepIdx < currentIdx;
  const isCurrent = step.id === currentPhase;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
          isComplete
            ? "bg-green text-white"
            : isCurrent
              ? "bg-primary text-white ring-2 ring-primary/30"
              : "bg-surface border border-surface-border text-text-dim",
        )}
      >
        {isComplete ? <CheckCircle className="h-3.5 w-3.5" /> : stepIdx + 1}
      </div>
      <span
        className={cn(
          "text-xs font-medium hidden sm:block",
          isCurrent ? "text-text" : isComplete ? "text-green" : "text-text-dim",
        )}
      >
        {step.label}
      </span>
    </div>
  );
}

function PhaseStepper({ currentPhase }: { currentPhase: Phase }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {PHASE_STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2 sm:gap-4">
          <PhaseStep step={step} currentPhase={currentPhase} />
          {i < PHASE_STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-6 sm:w-8 transition-colors duration-300",
                PHASE_ORDER.indexOf(currentPhase) > i
                  ? "bg-green/50"
                  : "bg-surface-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ScenarioAttempt({
  scenario,
  levelNumber,
  levelName,
}: ScenarioAttemptProps) {
  const [phase, setPhase] = useState<Phase>("read");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number | null>(null);
  const [gradingFeedback, setGradingFeedback] = useState<GradingFeedback | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedRef = useRef(false);

  // Start the attempt on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    startScenario(scenario.id)
      .then(({ attemptId }) => setAttemptId(attemptId))
      .catch((err) => console.error("Failed to start scenario:", err));
  }, [scenario.id]);

  async function handleBeginResponse() {
    setPhase("respond");
  }

  async function handleSubmitResponse(responseText: string) {
    if (!attemptId) {
      setSubmitError("Attempt not initialized. Please refresh and try again.");
      return;
    }

    setPhase("grading");
    setSubmitError(null);

    try {
      const result = await submitResponse(attemptId, responseText);

      if ("error" in result) {
        setSubmitError(result.error ?? "Unknown error");
        setPhase("respond");
        return;
      }

      setGradingScore(result.score);
      setGradingFeedback(result.feedback as GradingFeedback);
      setPhase("summary");
    } catch {
      setSubmitError("Submission failed. Please try again.");
      setPhase("respond");
    }
  }

  async function handleProbingResponse(questionIndex: number, response: string) {
    if (!attemptId) return;
    try {
      await submitProbingResponse(attemptId, questionIndex, response);
    } catch {
      // Silent fail for probing — user already sees their answer submitted
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with breadcrumb and stepper */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <Link
            href="/learn"
            className="hover:text-text transition-colors"
          >
            Curriculum
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-text-dim" />
          <Link
            href={`/learn/${levelNumber}`}
            className="hover:text-text transition-colors"
          >
            {levelName}
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-text-dim" />
          <span className="text-text-dim">Scenario</span>
        </div>
        <PhaseStepper currentPhase={phase} />
      </div>

      {/* Difficulty + regime badges */}
      <div className="flex items-center gap-2 text-xs text-text-dim">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold border",
            scenario.difficulty <= 3
              ? "bg-green-muted text-green border-green/20"
              : scenario.difficulty <= 6
                ? "bg-amber-muted text-amber border-amber/20"
                : "bg-red-muted text-red border-red/20",
          )}
        >
          Difficulty {scenario.difficulty}
        </span>
        <span className="inline-flex items-center rounded-full border border-surface-border bg-surface px-2.5 py-0.5 font-medium capitalize">
          {scenario.marketRegime}
        </span>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="rounded-xl border border-red/30 bg-red-muted px-4 py-3 text-sm text-red">
          {submitError}
        </div>
      )}

      {/* Phase content */}
      <AnimatePresence mode="wait">
        <div className="relative" key={phase}>
          {phase === "read" && (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ScenarioReader
                scenarioText={scenario.scenarioText}
                questionPrompt={scenario.questionPrompt}
                marketData={scenario.marketData}
                onBegin={handleBeginResponse}
              />
            </MotionDiv>
          )}

          {phase === "respond" && (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-surface-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Your Task
                </p>
                <p className="text-sm text-text leading-relaxed">
                  {scenario.questionPrompt}
                </p>
              </div>
              <ResponseEditor
                onSubmit={handleSubmitResponse}
                loading={false}
              />
            </MotionDiv>
          )}

          {phase === "grading" && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text">Analyzing your response&hellip;</p>
                <p className="text-sm text-text-muted mt-1">
                  Our AI is evaluating your analysis against the rubric criteria.
                </p>
              </div>
            </MotionDiv>
          )}

          {phase === "summary" && gradingScore !== null && gradingFeedback !== null && (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <GradingResult
                score={gradingScore}
                feedback={gradingFeedback}
                levelNumber={levelNumber}
                onAnswerProbing={
                  (gradingFeedback.probing_questions?.length ?? 0) > 0
                    ? handleProbingResponse
                    : undefined
                }
              />
            </MotionDiv>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
