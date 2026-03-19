import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  lastActivityDate?: string;
}

export function StreakCounter({ currentStreak, longestStreak, lastActivityDate }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-1" title={`Longest: ${longestStreak || 0} | Last: ${lastActivityDate || "Never"}`}>
      <Flame
        className={`h-4 w-4 ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`}
        style={{ transform: currentStreak > 5 ? "scale(1.2)" : undefined }}
      />
      <span className={`text-sm font-bold ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
        {currentStreak}
      </span>
    </div>
  );
}
