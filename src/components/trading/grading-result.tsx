interface CriterionEvaluation {
  criterion: string;
  score: number;
  max_score: number;
  feedback: string;
}

interface FeedbackData {
  feedback_summary: string;
  criteria_evaluation: CriterionEvaluation[];
  total_score: number;
}

interface GradingResultProps {
  score: number;
  feedback: FeedbackData;
}

export function GradingResult({ score, feedback }: GradingResultProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Total Score
          </h3>
        </div>
        <div
          className={`text-4xl font-bold ${
            score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-red-500"
          }`}
        >
          {score}/100
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Feedback Summary
        </h3>
        <p className="text-sm text-foreground">{feedback.feedback_summary}</p>
      </div>

      {feedback.criteria_evaluation.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Criteria Breakdown
          </h3>
          <div className="space-y-3">
            {feedback.criteria_evaluation.map((criterion) => (
              <div key={criterion.criterion} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{criterion.criterion}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {criterion.score}/{criterion.max_score}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{
                      width: `${(criterion.score / criterion.max_score) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{criterion.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
