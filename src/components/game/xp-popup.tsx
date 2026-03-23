"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { xpPopup } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface XpPopupProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
  className?: string;
}

export function XpPopup({ amount, show, onComplete, className }: XpPopupProps) {
  // Auto-call onComplete after the animation duration
  useEffect(() => {
    if (!show || !onComplete) return;
    // visible (spring ~400ms) + exit (400ms) + buffer
    const id = setTimeout(onComplete, 900);
    return () => clearTimeout(id);
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 select-none",
            className
          )}
          variants={xpPopup}
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-live="polite"
          aria-label={`+${amount} XP`}
        >
          <span
            className="font-mono text-2xl font-black text-amber"
            style={{
              textShadow:
                "0 0 12px var(--color-amber), 0 0 24px rgba(251,191,36,0.4)",
            }}
          >
            +{amount} XP!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
