import { getLevelName } from "@/lib/game/levels";

interface LevelBadgeProps {
  level: number;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
      <span className="text-sm font-bold text-primary">{level}</span>
      <span className="text-xs font-medium text-primary">
        {getLevelName(level)}
      </span>
    </div>
  );
}
