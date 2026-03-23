"use client";

import { motion, AnimatePresence } from "motion/react";
import { getLevelName } from "@/lib/game/levels";
import { Button } from "@/components/ui/button";
import { scaleIn, overlayFade } from "@/lib/motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
}

// Particle positions: [top%, left%, delay(ms), size(px)]
const PARTICLES: Array<[number, number, number, number]> = [
  [10, 15, 0, 5],
  [20, 80, 100, 4],
  [5, 50, 200, 6],
  [35, 5, 50, 3],
  [15, 65, 300, 5],
  [45, 90, 150, 4],
  [60, 20, 250, 6],
  [70, 70, 80, 3],
  [80, 40, 350, 5],
  [25, 35, 180, 4],
  [55, 55, 120, 6],
  [90, 10, 400, 3],
  [5, 88, 220, 5],
  [75, 85, 60, 4],
  [40, 50, 280, 3],
];

export function LevelUpModal({ open, onClose, newLevel }: LevelUpModalProps) {
  const rankName = getLevelName(newLevel);
  const isMaxLevel = newLevel >= 10;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "relative z-10 w-full max-w-sm rounded-3xl border border-primary/30 bg-surface",
              "overflow-hidden p-8 text-center shadow-2xl"
            )}
            style={{
              boxShadow:
                "0 0 0 1px rgba(67,56,255,0.2), 0 0 60px rgba(67,56,255,0.25), 0 25px 50px rgba(0,0,0,0.6)",
            }}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Level Up!"
          >
            {/* Radial glow background */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(67,56,255,0.18) 0%, transparent 65%)",
              }}
              aria-hidden="true"
            />

            {/* CSS-only sparkle particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {PARTICLES.map(([top, left, delay, size], i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-primary"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: size,
                    height: size,
                    opacity: 0,
                    animation: `particle-pop 1.2s ease-out ${delay}ms forwards`,
                  }}
                />
              ))}
            </div>

            {/* Star icon */}
            <motion.div
              className="mb-4 flex justify-center"
              initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted"
                style={{
                  boxShadow: "0 0 24px rgba(67,56,255,0.5), 0 0 48px rgba(67,56,255,0.2)",
                }}
              >
                <Star className="h-8 w-8 fill-primary text-primary" aria-hidden="true" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="mb-2 text-3xl font-black tracking-widest uppercase"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-lavender))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Level Up!
            </motion.h2>

            {/* Large level number with glow */}
            <motion.div
              className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full border border-primary/30 bg-primary-muted"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(67,56,255,0.2), 0 0 30px rgba(67,56,255,0.35), 0 0 60px rgba(67,56,255,0.15)",
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="font-mono text-6xl font-black text-primary">
                {newLevel}
              </span>
            </motion.div>

            {/* Rank name */}
            <motion.p
              className="mb-1 text-xl font-bold text-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {rankName}
            </motion.p>

            <motion.p
              className="mb-6 text-sm text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {isMaxLevel
                ? "You've reached the pinnacle. Elite status unlocked."
                : "New scenarios and challenges unlocked."}
            </motion.p>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onClose}
                className="w-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), #6366f1)",
                  boxShadow: "0 0 20px rgba(67,56,255,0.4)",
                }}
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Keyframe for CSS particles — injected via style tag */}
      <style>{`
        @keyframes particle-pop {
          0%   { transform: scale(0) translate(0, 0); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: scale(1.5) translate(var(--tx, 0px), var(--ty, -30px)); opacity: 0; }
        }
      `}</style>
    </AnimatePresence>
  );
}
