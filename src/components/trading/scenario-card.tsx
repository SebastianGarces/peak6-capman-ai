import Link from "next/link";

interface ScenarioCardProps {
  id: string;
  levelId: number;
  difficulty: number;
  marketRegime: string;
  targetObjectives: string[];
  scenarioText?: string;
}

export function ScenarioCard({
  id,
  levelId,
  difficulty,
  marketRegime,
  targetObjectives,
  scenarioText,
}: ScenarioCardProps) {
  return (
    <Link href={`/learn/${levelId}/scenario/${id}`}>
      <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Difficulty
            </span>
            <span className="font-mono text-sm font-semibold">{difficulty}</span>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {marketRegime}
          </span>
        </div>
        {scenarioText && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{scenarioText}</p>
        )}
        <div className="mt-3">
          <span className="text-xs text-muted-foreground">Objectives: </span>
          <span className="text-xs font-medium">{targetObjectives.join(", ")}</span>
        </div>
      </div>
    </Link>
  );
}
