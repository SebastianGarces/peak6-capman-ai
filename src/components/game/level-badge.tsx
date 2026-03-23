import { Zap } from "lucide-react";
import { getLevelName } from "@/lib/game/levels";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getTierStyle(level: number): {
  containerClass: string;
  textClass: string;
  iconClass: string;
} {
  if (level >= 10) {
    // Amber / gold — max rank
    return {
      containerClass: "bg-amber-muted border border-amber/30",
      textClass: "text-amber",
      iconClass: "text-amber",
    };
  }
  if (level >= 7) {
    // Lavender — strategist
    return {
      containerClass: "bg-lavender-muted border border-lavender/30",
      textClass: "text-lavender",
      iconClass: "text-lavender",
    };
  }
  if (level >= 4) {
    // Primary — trader
    return {
      containerClass: "bg-primary-muted border border-primary/30",
      textClass: "text-primary",
      iconClass: "text-primary",
    };
  }
  // Green — recruit / analyst
  return {
    containerClass: "bg-green-muted border border-green/30",
    textClass: "text-green",
    iconClass: "text-green",
  };
}

const sizeConfig = {
  sm: {
    container: "gap-1 px-2 py-0.5 rounded-full",
    levelText: "text-xs font-bold",
    nameText: "text-xs font-medium",
    icon: "h-3 w-3",
  },
  md: {
    container: "gap-1.5 px-3 py-1 rounded-full",
    levelText: "text-sm font-bold",
    nameText: "text-xs font-semibold",
    icon: "h-3.5 w-3.5",
  },
  lg: {
    container: "gap-2 px-4 py-1.5 rounded-full",
    levelText: "text-base font-bold",
    nameText: "text-sm font-semibold",
    icon: "h-4 w-4",
  },
};

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  const { containerClass, textClass, iconClass } = getTierStyle(level);
  const sizes = sizeConfig[size];

  return (
    <div
      className={cn(
        "inline-flex items-center transition-colors",
        containerClass,
        sizes.container,
        className
      )}
    >
      <Zap className={cn(iconClass, sizes.icon)} aria-hidden="true" />
      <span className={cn(textClass, sizes.levelText)}>Lv.{level}</span>
      <span className={cn(textClass, sizes.nameText, "opacity-80")}>
        {getLevelName(level)}
      </span>
    </div>
  );
}
