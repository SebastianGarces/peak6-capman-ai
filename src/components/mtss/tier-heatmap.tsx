"use client";

import Link from "next/link";

interface HeatmapData {
  matrix: Array<{
    userId: string;
    name: string;
    level: number;
    objectives: Array<{
      objectiveId: string;
      code: string;
      tier: number | null;
      avgScore: number | null;
    }>;
  }>;
  objectives: Array<{ id: string; code: string; name: string }>;
}

const TIER_COLORS: Record<number, string> = {
  1: "bg-emerald-600",
  2: "bg-amber-500",
  3: "bg-red-600",
};

export function TierHeatmap({ data }: { data: HeatmapData }) {
  return (
    <div className="glass-card rounded-xl p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-card/80 pb-2 pr-4 text-left text-muted-foreground backdrop-blur-sm">
              Learner
            </th>
            {data.objectives.map((obj) => (
              <th
                key={obj.id}
                className="pb-2 px-1 text-center text-xs text-muted-foreground"
                title={obj.name}
              >
                {obj.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.matrix.map((row) => (
            <tr key={row.userId} className="hover:bg-white/[0.02] transition-colors">
              <td className="sticky left-0 bg-transparent py-2 pr-4 backdrop-blur-sm">
                <Link
                  href={`/educator/students/${row.userId}`}
                  className="text-foreground hover:text-amber-400 transition-colors"
                >
                  {row.name}
                </Link>
              </td>
              {row.objectives.map((obj) => (
                <td key={obj.objectiveId} className="py-2 px-1 text-center">
                  <div
                    className={`mx-auto rounded-md w-8 h-8 ${obj.tier ? TIER_COLORS[obj.tier] : "bg-muted"} flex items-center justify-center text-xs font-bold text-white`}
                    title={`Tier ${obj.tier || "N/A"} | Avg: ${obj.avgScore?.toFixed(0) || "N/A"}`}
                  >
                    {obj.tier || "—"}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
