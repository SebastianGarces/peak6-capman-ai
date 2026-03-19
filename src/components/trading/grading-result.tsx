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

function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(142, 71%, 45%)";
  if (score >= 60) return "hsl(48, 96%, 53%)";
  return "hsl(0, 72%, 51%)";
}

function getCriteriaBarColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.8) return "from-emerald-500 to-green-400";
  if (pct >= 0.6) return "from-amber-500 to-yellow-400";
  return "from-red-500 to-rose-400";
}

const CIRCUMFERENCE = 2 * Math.PI * 52;

export function GradingResult({ score, feedback }: GradingResultProps) {
  const scoreColor = getScoreColor(score);
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="space-y-4">
      {/* Circular score ring */}
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <svg width="120" height="120" className="mx-auto">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={`${dashOffset}`}
            transform="rotate(-90 60 60)"
            className="transition-all duration-1000 ease-out"
          />
          <text
            x="60"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            fontSize="28"
            fontWeight="bold"
            className="fill-foreground"
          >
            {score}
          </text>
          <text
            x="60"
            y="75"
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--muted-foreground))"
            fontSize="11"
          >
            /100
          </text>
        </svg>
        <p className="mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Total Score
        </p>
      </div>

      {/* Feedback summary */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Feedback Summary
        </h3>
        <p className="border-l-2 border-primary pl-4 text-sm text-foreground leading-relaxed">
          {feedback.feedback_summary}
        </p>
      </div>

      {/* Criteria breakdown */}
      {feedback.criteria_evaluation.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Criteria Breakdown
          </h3>
          <div className="space-y-4">
            {feedback.criteria_evaluation.map((criterion) => (
              <div key={criterion.criterion} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{criterion.criterion}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {criterion.score}/{criterion.max_score}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${getCriteriaBarColor(criterion.score, criterion.max_score)} transition-all duration-700`}
                    style={{
                      width: `${criterion.max_score > 0 ? (criterion.score / criterion.max_score) * 100 : 0}%`,
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
