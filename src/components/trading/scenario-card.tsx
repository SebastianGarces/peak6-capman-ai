import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ScenarioCardProps {
  id: string;
  levelId: number;
  difficulty: number;
  marketRegime: string;
  targetObjectives: string[];
  scenarioText?: string;
}

function getDifficultyBadgeClass(difficulty: number): string {
  if (difficulty <= 1) return "bg-emerald-500/20 text-emerald-400 border-0";
  if (difficulty <= 2) return "bg-amber-500/20 text-amber-400 border-0";
  return "bg-red-500/20 text-red-400 border-0";
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 1) return "Beginner";
  if (difficulty <= 2) return "Intermediate";
  return "Advanced";
}

function getRegimeClass(regime: string): string {
  const r = regime.toLowerCase();
  if (r === "bullish") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (r === "bearish") return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (r === "volatile") return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
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
      <div className="glass-card rounded-lg p-4 transition-all duration-200 hover:scale-[1.01] hover:glow-primary">
        <div className="flex items-center justify-between gap-2">
          <Badge className={getDifficultyBadgeClass(difficulty)}>
            {getDifficultyLabel(difficulty)}
          </Badge>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRegimeClass(marketRegime)}`}>
            {marketRegime}
          </span>
        </div>
        {scenarioText && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{scenarioText}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1">
          {targetObjectives.map((obj) => (
            <span key={obj} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
              {obj}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
