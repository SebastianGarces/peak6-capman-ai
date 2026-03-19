"use client";

import { AnimatePresence, motion } from "motion/react";

interface XpPopupProps {
  amount: number;
  show: boolean;
}

export function XpPopup({ amount, show }: XpPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -40 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 18,
            mass: 0.8,
          }}
          className="pointer-events-none absolute text-2xl font-bold text-amber-400 glow-gold"
        >
          +{amount} XP!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
