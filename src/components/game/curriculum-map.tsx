"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface Level {
  id: number;
  levelNumber: number;
  name: string;
  description: string;
  objectiveCount: number;
}

interface CurriculumMapProps {
  levels: Level[];
  currentLevel: number;
}

export function CurriculumMap({ levels, currentLevel }: CurriculumMapProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {levels.map((level) => {
        const isUnlocked = level.levelNumber <= currentLevel;
        const isCurrent = level.levelNumber === currentLevel;

        const cardContent = (
          <div
            data-testid={`level-card-${level.levelNumber}`}
            className={[
              "relative overflow-hidden rounded-lg p-4 transition-all duration-200",
              isCurrent
                ? "glass-card glow-primary"
                : isUnlocked
                  ? "glass-card hover:scale-[1.02] hover:glow-primary"
                  : "bg-card/30 opacity-40 border border-white/[0.04]",
            ]
              .filter(Boolean)
              .join(" ")}
            style={isCurrent ? { animation: "glow-pulse 3s ease-in-out infinite" } : undefined}
          >
            {/* Large level number watermark */}
            <span className="absolute right-3 top-2 font-mono text-4xl font-black text-muted-foreground/20 select-none">
              {level.levelNumber}
            </span>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Level {level.levelNumber}
              </span>
              {!isUnlocked && (
                <Lock className="h-4 w-4 text-muted-foreground" aria-label="Locked" />
              )}
              {isCurrent && (
                <span className="rounded-full gradient-primary-btn px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Current
                </span>
              )}
            </div>
            <h3 className="mt-2 font-semibold">{level.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {level.description}
            </p>
            <div className="mt-3">
              <Badge variant="secondary">
                {level.objectiveCount} objective{level.objectiveCount !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        );

        if (isUnlocked) {
          return (
            <motion.div key={level.id} variants={staggerItem}>
              <Link href={`/learn/${level.id}`}>{cardContent}</Link>
            </motion.div>
          );
        }

        return (
          <motion.div key={level.id} variants={staggerItem}>
            {cardContent}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
