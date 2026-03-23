import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  className,
}: StreakCounterProps) {
  const isActive = currentStreak > 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* Flame icon — pulses when streak is active */}
      <span
        className={cn(
          "relative flex h-5 w-5 items-center justify-center",
          isActive && "animate-[pulse_2s_ease-in-out_infinite]"
        )}
        aria-hidden="true"
      >
        <Flame
          className={cn(
            "h-5 w-5 transition-colors",
            isActive ? "text-orange" : "text-text-dim"
          )}
          style={
            isActive
              ? {
                  filter:
                    "drop-shadow(0 0 6px var(--color-orange)) drop-shadow(0 0 12px rgba(249,115,22,0.3))",
                }
              : undefined
          }
        />
      </span>

      {/* Count */}
      <span
        className={cn(
          "font-mono text-base font-bold tabular-nums",
          isActive ? "text-orange" : "text-text-dim"
        )}
      >
        {currentStreak}
      </span>

      {/* Longest streak hint */}
      {longestStreak !== undefined && longestStreak > 0 && (
        <span
          className="text-xs text-text-dim"
          title={`Longest streak: ${longestStreak} day${longestStreak !== 1 ? "s" : ""}`}
          aria-label={`Longest streak: ${longestStreak}`}
        >
          / {longestStreak} best
        </span>
      )}
    </div>
  );
}
