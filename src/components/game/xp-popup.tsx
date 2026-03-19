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
          animate={{ opacity: 1, y: -30 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 1.5 }}
          className="pointer-events-none absolute text-lg font-bold text-primary"
        >
          +{amount} XP!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
