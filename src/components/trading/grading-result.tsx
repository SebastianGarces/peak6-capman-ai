"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CriterionEvaluation {
  criterion: string;
  weight?: number;
  score: number;
  max_score?: number;
  evidence?: string;
  feedback?: string;
}

interface GradingFeedback {
  total_score: number;
  feedback_summary?: string;
  criteria_evaluation?: CriterionEvaluation[];
  probing_questions?: string[];
  skill_objectives_demonstrated?: string[];
  skill_objectives_failed?: string[];
}

interface GradingResultProps {
  score: number;
  feedback: GradingFeedback;
  levelNumber?: number;
  onAnswerProbing?: (questionIndex: number, response: string) => void;
  probingResults?: Record<number, { score: number; feedback: string }>;
  probingError?: string | null;
}

function ScoreDisplay({ score }: { score: number }) {
  const isGood = score >= 80;
  const isOk = score >= 60;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={cn(
          "relative flex h-28 w-28 items-center justify-center rounded-full border-4",
          isGood
            ? "border-green bg-green-muted"
            : isOk
              ? "border-amber bg-amber-muted"
              : "border-red bg-red-muted",
        )}
      >
        <span
          className={cn(
            "font-mono text-4xl font-black",
            isGood ? "text-green" : isOk ? "text-amber" : "text-red",
          )}
        >
          {score}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-text-muted">
        {isGood ? "Excellent work!" : isOk ? "Good effort!" : "Keep practicing!"}
      </p>
      <p className="text-xs text-text-dim mt-0.5">Score out of 100</p>
    </div>
  );
}

export function GradingResult({
  score,
  feedback,
  levelNumber,
  onAnswerProbing,
  probingResults,
  probingError,
}: GradingResultProps) {
  const [showCriteria, setShowCriteria] = useState(false);
  const [probingAnswers, setProbingAnswers] = useState<Record<number, string>>({});
  const [submittedProbing, setSubmittedProbing] = useState<Set<number>>(new Set());

  const criteria = feedback.criteria_evaluation ?? [];
  const probingQuestions = feedback.probing_questions ?? [];

  function handleProbingSubmit(index: number) {
    const answer = probingAnswers[index];
    if (!answer?.trim()) return;
    onAnswerProbing?.(index, answer);
    setSubmittedProbing((prev) => new Set(prev).add(index));
  }

  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="rounded-2xl border border-surface-border bg-surface">
        <ScoreDisplay score={score} />
      </div>

      {/* Feedback summary */}
      {feedback.feedback_summary && (
        <div className="rounded-xl border border-surface-border bg-surface p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Feedback
          </h3>
          <p className="text-sm text-text leading-relaxed">{feedback.feedback_summary}</p>
        </div>
      )}

      {/* Objectives summary */}
      {((feedback.skill_objectives_demonstrated?.length ?? 0) > 0 ||
        (feedback.skill_objectives_failed?.length ?? 0) > 0) && (
        <div className="rounded-xl border border-surface-border bg-surface p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Skill Objectives
          </h3>
          <div className="space-y-2">
            {(feedback.skill_objectives_demonstrated ?? []).map((code) => (
              <div key={code} className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green flex-shrink-0" />
                <span className="font-mono text-xs text-green">{code}</span>
                <span className="text-xs text-text-dim">demonstrated</span>
              </div>
            ))}
            {(feedback.skill_objectives_failed ?? []).map((code) => (
              <div key={code} className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-red flex-shrink-0" />
                <span className="font-mono text-xs text-red">{code}</span>
                <span className="text-xs text-text-dim">not demonstrated</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Criteria breakdown (collapsible) */}
      {criteria.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors text-left"
            onClick={() => setShowCriteria((v) => !v)}
            aria-expanded={showCriteria}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Criteria Breakdown ({criteria.length})
            </span>
            {showCriteria ? (
              <ChevronUp className="h-4 w-4 text-text-dim" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-dim" />
            )}
          </button>

          {showCriteria && (
            <div className="border-t border-surface-border divide-y divide-surface-border">
              {criteria.map((c, i) => {
                const pct = c.max_score ? Math.round((c.score / c.max_score) * 100) : c.score;
                const isPass = pct >= 60;
                return (
                  <div key={i} className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">{c.criterion}</span>
                      <div className="flex items-center gap-2">
                        {c.max_score ? (
                          <span
                            className={cn(
                              "font-mono text-sm font-bold",
                              isPass ? "text-green" : "text-red",
                            )}
                          >
                            {c.score}/{c.max_score}
                          </span>
                        ) : (
                          <Badge variant={isPass ? "green" : "red"}>
                            {c.score}%
                          </Badge>
                        )}
                        {c.weight !== undefined && (
                          <span className="text-[10px] text-text-dim">
                            weight {c.weight}
                          </span>
                        )}
                      </div>
                    </div>
                    {c.evidence && (
                      <p className="text-xs text-text-dim italic border-l-2 border-surface-border-hover pl-3">
                        &ldquo;{c.evidence}&rdquo;
                      </p>
                    )}
                    {c.feedback && (
                      <p className="text-xs text-text-muted leading-relaxed">{c.feedback}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Probing questions */}
      {probingQuestions.length > 0 && onAnswerProbing && (
        <div className="rounded-xl border border-lavender/30 bg-lavender-muted p-5 space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-lavender" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-lavender">
              Follow-up Questions
            </h3>
          </div>
          {probingError && (
            <div className="rounded-lg border border-red/30 bg-red-muted px-3 py-2 text-xs text-red">
              {probingError}
            </div>
          )}
          {probingQuestions.map((q, i) => (
            <div key={i} className="space-y-2">
              <p className="text-sm text-text leading-relaxed font-medium">{q}</p>
              {submittedProbing.has(i) ? (
                probingResults?.[i] ? (
                  <div className="rounded-lg border border-surface-border bg-surface p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green flex-shrink-0" />
                      <span className="text-xs font-semibold text-text">
                        Score: <span className={cn(
                          "font-mono",
                          probingResults[i].score >= 70 ? "text-green" : probingResults[i].score >= 40 ? "text-amber" : "text-red"
                        )}>{probingResults[i].score}/100</span>
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {probingResults[i].feedback}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-green">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Answer submitted
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-surface-border-hover bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-lavender/50 transition-colors"
                    rows={3}
                    placeholder="Your response..."
                    value={probingAnswers[i] ?? ""}
                    onChange={(e) =>
                      setProbingAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                    }
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleProbingSubmit(i)}
                    disabled={!probingAnswers[i]?.trim()}
                  >
                    Submit Answer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      {levelNumber !== undefined && (
        <div className="flex items-center justify-between pt-2">
          <Link href={`/learn/${levelNumber}`}>
            <Button variant="secondary" size="md">
              Back to Level
            </Button>
          </Link>
          <Link href={`/learn/${levelNumber}`}>
            <Button variant="primary" size="md">
              Next Scenario
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
