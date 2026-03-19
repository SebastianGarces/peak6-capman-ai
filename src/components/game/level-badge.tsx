import { getLevelName } from "@/lib/game/levels";

interface LevelBadgeProps {
  level: number;
}

function getTierClasses(level: number): { bg: string; text: string } {
  if (level >= 10) {
    return { bg: "bg-cyan-950 border border-cyan-700", text: "text-cyan-300" };
  }
  if (level >= 7) {
    return { bg: "bg-yellow-950 border border-yellow-700", text: "text-yellow-300" };
  }
  if (level >= 4) {
    return { bg: "bg-slate-800 border border-slate-600", text: "text-slate-200" };
  }
  return { bg: "bg-amber-950 border border-amber-800", text: "text-amber-400" };
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const { bg, text } = getTierClasses(level);
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${bg}`}>
      <span className={`text-sm font-bold ${text}`}>{level}</span>
      <span className={`text-xs font-medium ${text}`}>
        {getLevelName(level)}
      </span>
    </div>
  );
}
