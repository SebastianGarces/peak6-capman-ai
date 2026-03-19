"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReviewScores {
  correctness: number;
  reasoning: number;
  riskAwareness: number;
  comment?: string;
}

const CRITERIA = [
  { key: "correctness", label: "Correctness", description: "Is the analysis factually accurate?" },
  { key: "reasoning", label: "Reasoning", description: "Is the logic well-structured and clear?" },
  { key: "riskAwareness", label: "Risk Awareness", description: "Does it identify key risks?" },
] as const;

export function ReviewRubricForm({ onSubmit }: { onSubmit: (scores: ReviewScores) => void }) {
  const [scores, setScores] = useState<Record<string, number>>({
    correctness: 3,
    reasoning: 3,
    riskAwareness: 3,
  });
  const [comment, setComment] = useState("");

  return (
    <div className="glass-card rounded-xl p-5 space-y-5">
      <h3 className="font-semibold">Rate this response</h3>

      {CRITERIA.map(({ key, label, description }) => (
        <div key={key} className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium">{label}</label>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                  scores[key] === n
                    ? "gradient-primary-btn text-white glow-primary"
                    : "bg-muted text-muted-foreground hover:bg-primary/20"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-0.5">
            <span>Poor</span>
            <span>Average</span>
            <span>Excellent</span>
          </div>
        </div>
      ))}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Comment (optional)</label>
        <div className="glass-card rounded-lg p-1">
          <textarea
            className="w-full rounded-md bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={3}
            placeholder="Share additional feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="button"
        className="gradient-primary-btn text-white border-0"
        onClick={() =>
          onSubmit({
            correctness: scores.correctness,
            reasoning: scores.reasoning,
            riskAwareness: scores.riskAwareness,
            comment: comment || undefined,
          })
        }
      >
        Submit Review (+5 XP)
      </Button>
    </div>
  );
}
