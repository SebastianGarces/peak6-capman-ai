"use client";

import { motion } from "motion/react";
import { progressFillTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  gradient?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  size = "md",
  gradient = true,
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-text-muted">{label}</span>}
          {showValue && (
            <span className="font-mono text-text-dim">
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface",
          heights[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            gradient
              ? "bg-gradient-to-r from-primary to-lavender"
              : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={progressFillTransition}
        />
      </div>
    </div>
  );
}
