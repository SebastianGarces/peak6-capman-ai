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
  { key: "correctness", label: "Correctness" },
  { key: "reasoning", label: "Reasoning" },
  { key: "riskAwareness", label: "Risk Awareness" },
] as const;

export function ReviewRubricForm({ onSubmit }: { onSubmit: (scores: ReviewScores) => void }) {
  const [scores, setScores] = useState<Record<string, number>>({
    correctness: 3,
    reasoning: 3,
    riskAwareness: 3,
  });
  const [comment, setComment] = useState("");

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <h3 className="font-medium">Rate this response</h3>
      {CRITERIA.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <label className="text-sm">{label}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                className={`h-8 w-8 rounded text-sm font-bold ${
                  scores[key] === n ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
      <textarea
        className="w-full rounded border border-border bg-background p-2 text-sm"
        rows={3}
        placeholder="Optional comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        onClick={() =>
          onSubmit({
            correctness: scores.correctness,
            reasoning: scores.reasoning,
            riskAwareness: scores.riskAwareness,
            comment: comment || undefined,
          })
        }
      >
        Submit Review
      </Button>
    </div>
  );
}
