"use client";

import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getLevelName } from "@/lib/game/levels";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
}

export function LevelUpModal({ open, onClose, newLevel }: LevelUpModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md glass-card glow-gold border-amber-400/20">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              {/* Golden glow background overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-lg"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, hsl(48 96% 53% / 0.12) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />

              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                🎉
              </motion.div>

              <h2 className="text-3xl font-bold text-amber-400">LEVEL UP!</h2>

              <div className="font-mono text-7xl font-black text-foreground glow-gold rounded-full size-32 flex items-center justify-center border border-amber-400/30 bg-amber-400/5">
                {newLevel}
              </div>

              <p className="text-xl font-semibold text-foreground">
                {getLevelName(newLevel)}
              </p>
              <p className="text-sm text-muted-foreground">
                New curriculum content unlocked!
              </p>
              <Button onClick={onClose} className="mt-4 gradient-primary-btn text-white border-0">
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
