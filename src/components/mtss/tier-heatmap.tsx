import Link from "next/link";
import { cn } from "@/lib/utils";

interface ObjectiveCell {
  objectiveId: string;
  code: string;
  tier: number | null;
  avgScore: number | null;
}

interface LearnerRow {
  userId: string;
  name: string;
  level: number;
  objectives: ObjectiveCell[];
}

interface SkillObjective {
  id: string;
  code: string;
  name: string;
}

interface HeatmapData {
  matrix: LearnerRow[];
  objectives: SkillObjective[];
}

interface TierHeatmapProps {
  /** Pass the full overview object from getMtssOverview() */
  data: HeatmapData;
}

function tierCell(tier: number | null) {
  if (tier === 1) return { bg: "bg-green-muted", border: "border-green/20", text: "text-green", label: "1" };
  if (tier === 2) return { bg: "bg-amber-muted", border: "border-amber/20", text: "text-amber", label: "2" };
  if (tier === 3) return { bg: "bg-red-muted", border: "border-red/20", text: "text-red", label: "3" };
  return { bg: "bg-surface", border: "border-surface-border", text: "text-text-dim", label: "—" };
}

export function TierHeatmap({ data }: TierHeatmapProps) {
  const { matrix, objectives } = data;
  if (matrix.length === 0) {
    return (
      <div className="rounded-xl bg-surface border border-surface-border p-8 text-center text-text-muted">
        No learner data available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-surface-border overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
        <h2 className="font-semibold text-text">Skill Tier Heatmap</h2>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-muted border border-green/20 inline-block" />
            Tier 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-muted border border-amber/20 inline-block" />
            Tier 2
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-muted border border-red/20 inline-block" />
            Tier 3
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="sticky left-0 z-10 bg-surface px-5 py-3 text-left font-semibold text-text-muted whitespace-nowrap min-w-[160px]">
                Learner
              </th>
              {objectives.map((obj) => (
                <th
                  key={obj.id}
                  className="px-3 py-3 text-center font-semibold text-text-muted whitespace-nowrap min-w-[64px]"
                  title={obj.name}
                >
                  <span className="font-mono text-xs">{obj.code}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((learner, rowIdx) => (
              <tr
                key={learner.userId}
                className={cn(
                  "border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors",
                  rowIdx % 2 === 1 && "bg-bg/40"
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-5 py-3 whitespace-nowrap">
                  <Link
                    href={`/educator/students/${learner.userId}`}
                    className="font-medium text-text hover:text-amber transition-colors"
                  >
                    {learner.name}
                  </Link>
                  <span className="ml-2 text-xs text-text-dim">Lv.{learner.level}</span>
                </td>
                {learner.objectives.map((cell) => {
                  const style = tierCell(cell.tier);
                  return (
                    <td key={cell.objectiveId} className="px-3 py-3 text-center">
                      <div
                        className={cn(
                          "group relative inline-flex h-8 w-10 items-center justify-center rounded-md border text-xs font-bold transition-transform hover:scale-110",
                          style.bg,
                          style.border,
                          style.text
                        )}
                        title={
                          cell.avgScore != null
                            ? `${cell.code}: Tier ${cell.tier}, avg score ${Math.round(cell.avgScore * 100)}%`
                            : `${cell.code}: No data`
                        }
                      >
                        {style.label}
                        {cell.avgScore != null && (
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-bg-deep px-2 py-1 text-xs text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100 border border-surface-border z-20">
                            {Math.round(cell.avgScore * 100)}%
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
