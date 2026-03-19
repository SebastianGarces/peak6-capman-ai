import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  lastActivityDate?: string;
}

function getFlameClasses(streak: number): { color: string; scale: boolean; glow: boolean } {
  if (streak >= 14) {
    return { color: "text-amber-300", scale: false, glow: true };
  }
  if (streak >= 7) {
    return { color: "text-amber-400", scale: true, glow: false };
  }
  if (streak >= 3) {
    return { color: "text-orange-500", scale: false, glow: false };
  }
  if (streak >= 1) {
    return { color: "text-orange-500", scale: false, glow: false };
  }
  return { color: "text-muted-foreground", scale: false, glow: false };
}

export function StreakCounter({ currentStreak, longestStreak, lastActivityDate }: StreakCounterProps) {
  const { color, scale, glow } = getFlameClasses(currentStreak);

  return (
    <div
      className="flex items-center gap-1"
      title={`Longest: ${longestStreak || 0} | Last: ${lastActivityDate || "Never"}`}
    >
      <Flame
        className={`h-4 w-4 ${color} ${glow ? "glow-gold" : ""}`}
        style={{ transform: scale ? "scale(1.1)" : undefined }}
      />
      <span className={`text-sm font-bold ${color}`}>
        {currentStreak}
      </span>
    </div>
  );
}
