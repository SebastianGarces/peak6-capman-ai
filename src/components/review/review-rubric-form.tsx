"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { Star } from "lucide-react";

interface ReviewScores {
  correctness: number;
  reasoning: number;
  riskAwareness: number;
  comment?: string;
}

const CRITERIA = [
  {
    key: "correctness" as const,
    label: "Correctness",
    description: "Is the analysis factually accurate?",
    color: "text-green-400",
    activeBg: "bg-green-500/20 border border-green-500/50 text-green-300",
  },
  {
    key: "reasoning" as const,
    label: "Reasoning",
    description: "Is the logic well-structured and clear?",
    color: "text-blue-400",
    activeBg: "bg-blue-500/20 border border-blue-500/50 text-blue-300",
  },
  {
    key: "riskAwareness" as const,
    label: "Risk Awareness",
    description: "Does it identify key risks?",
    color: "text-amber-400",
    activeBg: "bg-amber-500/20 border border-amber-500/50 text-amber-300",
  },
] as const;

const SCORE_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Below avg",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

export function ReviewRubricForm({
  onSubmit,
}: {
  onSubmit: (scores: ReviewScores) => void;
}) {
  const [scores, setScores] = useState<Record<string, number>>({
    correctness: 3,
    reasoning: 3,
    riskAwareness: 3,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({
      correctness: scores.correctness,
      reasoning: scores.reasoning,
      riskAwareness: scores.riskAwareness,
      comment: comment || undefined,
    });
    setSubmitting(false);
  };

  return (
    <motion.div
      className="bg-surface border border-surface-border rounded-xl p-5 space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-text">Rate this response</h3>
      </motion.div>

      {CRITERIA.map(({ key, label, description, color, activeBg }) => (
        <motion.div key={key} variants={staggerItem} className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <label className={`text-sm font-semibold ${color}`}>{label}</label>
            <span className="text-xs text-text-muted text-right">{description}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const isActive = scores[key] === n;
              return (
                <button
                  key={n}
                  type="button"
                  title={SCORE_LABELS[n]}
                  onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                  className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all duration-150 border ${
                    isActive
                      ? activeBg
                      : "border-surface-border bg-muted/50 text-text-muted hover:bg-muted hover:text-text"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-muted px-0.5">
            <span>Poor</span>
            <span>{SCORE_LABELS[scores[key]]}</span>
            <span>Excellent</span>
          </div>
        </motion.div>
      ))}

      {/* Optional comment */}
      <motion.div variants={staggerItem} className="space-y-2">
        <label className="text-sm font-medium text-text">
          Comment{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          className="w-full rounded-lg border border-surface-border bg-background px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors"
          rows={3}
          placeholder="Share additional feedback or specific observations..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Button
          type="button"
          className="w-full bg-primary text-white border-0"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Review (+5 XP)"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
