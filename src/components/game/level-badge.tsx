import { getLevelName } from "@/lib/game/levels";

interface LevelBadgeProps {
  level: number;
}

function getTierClasses(level: number): { bg: string; text: string } {
  if (level >= 10) {
    return { bg: "bg-cyan-400/20", text: "text-cyan-300" };
  }
  if (level >= 7) {
    return { bg: "bg-yellow-500/20", text: "text-yellow-400" };
  }
  if (level >= 4) {
    return { bg: "bg-slate-400/20", text: "text-slate-300" };
  }
  return { bg: "bg-amber-700/20", text: "text-amber-500" };
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
