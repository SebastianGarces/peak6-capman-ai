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
      <DialogContent className="sm:max-w-md">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-primary">LEVEL UP!</h2>
              <div className="text-5xl font-black text-foreground">{newLevel}</div>
              <p className="text-lg font-medium text-muted-foreground">
                {getLevelName(newLevel)}
              </p>
              <p className="text-sm text-muted-foreground">
                New curriculum content unlocked!
              </p>
              <Button onClick={onClose} className="mt-4">Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
