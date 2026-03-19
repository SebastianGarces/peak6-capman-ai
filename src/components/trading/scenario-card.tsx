import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ScenarioCardProps {
  id: string;
  levelId: number;
  difficulty: number;
  marketRegime: string;
  targetObjectives: string[] | unknown;
  scenarioText?: string;
}

function getDifficultyVariant(difficulty: number): {
  variant: "green" | "amber" | "red";
  label: string;
} {
  if (difficulty <= 3) return { variant: "green", label: "Beginner" };
  if (difficulty <= 6) return { variant: "amber", label: "Intermediate" };
  return { variant: "red", label: "Advanced" };
}

function getObjectiveCodes(targetObjectives: unknown): string[] {
  if (!targetObjectives) return [];
  if (Array.isArray(targetObjectives)) {
    return targetObjectives
      .map((o) =>
        typeof o === "string" ? o : (o as { code?: string })?.code ?? "",
      )
      .filter(Boolean)
      .slice(0, 4);
  }
  return [];
}

export function ScenarioCard({
  id,
  levelId,
  difficulty,
  marketRegime,
  targetObjectives,
  scenarioText,
}: ScenarioCardProps) {
  const { variant, label } = getDifficultyVariant(difficulty);
  const objectiveCodes = getObjectiveCodes(targetObjectives);

  return (
    <Link
      href={`/learn/${levelId}/scenario/${id}`}
      className="group block"
      aria-label={`Open scenario: difficulty ${difficulty}, ${marketRegime} regime`}
    >
      <div
        className={cn(
          "bg-surface border border-surface-border rounded-2xl p-5 h-full",
          "transition-all duration-200",
          "hover:border-surface-border-hover hover:bg-surface-hover",
          "group-hover:shadow-lg group-hover:shadow-black/20",
        )}
      >
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={variant}>
              D{difficulty} · {label}
            </Badge>
            <Badge variant="default" className="capitalize">
              <TrendingUp className="mr-1 h-2.5 w-2.5" />
              {marketRegime}
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-text-dim flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-text-muted" />
        </div>

        {/* Scenario preview text */}
        {scenarioText && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-4">
            {scenarioText}
          </p>
        )}

        {/* Target objectives */}
        {objectiveCodes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {objectiveCodes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center rounded-md bg-lavender-muted border border-lavender/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-lavender"
              >
                {code}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
