"use client";

import Link from "next/link";
import { Lock, CheckCircle, ChevronRight, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MotionDiv } from "@/components/motion-div";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CurriculumLevel {
  id: number;
  levelNumber: number;
  name: string;
  description: string;
  objectiveCount: number;
  masteryThreshold?: number;
}

interface CurriculumMapProps {
  levels: CurriculumLevel[];
  currentLevel: number;
}

export function CurriculumMap({ levels, currentLevel }: CurriculumMapProps) {
  return (
    <MotionDiv
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {levels.map((level) => {
        const isLocked = level.levelNumber > currentLevel;
        const isCurrent = level.levelNumber === currentLevel;
        const isUnlocked = level.levelNumber < currentLevel;

        const card = (
          <MotionDiv
            variants={staggerItem}
            data-testid={`level-card-${level.levelNumber}`}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-surface p-6 transition-all duration-200",
              isLocked
                ? "opacity-50 cursor-not-allowed border-surface-border"
                : isCurrent
                  ? "border-primary/40 ring-2 ring-primary/20 cursor-pointer hover:border-primary/60"
                  : "border-surface-border hover:border-surface-border-hover hover:bg-surface-hover cursor-pointer",
            )}
          >
            {/* Level number watermark */}
            <span
              className={cn(
                "absolute right-4 top-2 font-mono text-7xl font-black leading-none select-none pointer-events-none",
                isLocked
                  ? "text-text-dim/20"
                  : isCurrent
                    ? "text-primary/10"
                    : "text-white/5",
              )}
              aria-hidden="true"
            >
              {level.levelNumber}
            </span>

            {/* Status icon */}
            <div className="mb-4 flex items-center justify-between">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  isLocked
                    ? "bg-surface-active"
                    : isCurrent
                      ? "bg-primary-muted"
                      : "bg-green-muted",
                )}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4 text-text-dim" />
                ) : isUnlocked ? (
                  <CheckCircle className="h-4 w-4 text-green" />
                ) : (
                  <Target className="h-4 w-4 text-primary" />
                )}
              </div>

              {isCurrent && (
                <Badge variant="primary" className="text-[10px]">
                  Current Level
                </Badge>
              )}
              {isLocked && (
                <Badge variant="default" className="text-[10px]">
                  Locked
                </Badge>
              )}
            </div>

            {/* Level info */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-1">
                Level {level.levelNumber}
              </p>
              <h3
                className={cn(
                  "text-base font-bold leading-snug",
                  isLocked ? "text-text-muted" : "text-text",
                )}
              >
                {level.name}
              </h3>
              <p className="mt-1.5 text-sm text-text-muted leading-relaxed line-clamp-2">
                {level.description}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-text-dim">
                <Target className="h-3 w-3" />
                <span>
                  {level.objectiveCount}{" "}
                  {level.objectiveCount === 1 ? "objective" : "objectives"}
                </span>
              </div>

              {!isLocked && (
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isCurrent
                      ? "text-primary group-hover:translate-x-0.5"
                      : "text-text-dim group-hover:translate-x-0.5 group-hover:text-text-muted",
                  )}
                />
              )}
            </div>

            {/* Current level glow */}
            {isCurrent && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(67,56,255,0.08) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
            )}
          </MotionDiv>
        );

        if (isLocked) {
          return <div key={level.id}>{card}</div>;
        }

        return (
          <Link
            key={level.id}
            href={`/learn/${level.levelNumber}`}
            className="block"
            aria-label={`Level ${level.levelNumber}: ${level.name}`}
          >
            {card}
          </Link>
        );
      })}
    </MotionDiv>
  );
}
