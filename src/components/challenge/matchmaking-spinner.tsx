"use client";

import { Swords } from "lucide-react";
import { motion } from "motion/react";

export function MatchmakingSpinner() {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full border border-primary/20 animate-ping" />
        <div className="absolute h-24 w-24 rounded-full border border-primary/30 animate-ping [animation-delay:0.5s]" />
        <div className="absolute h-16 w-16 rounded-full border border-primary/40 animate-ping [animation-delay:1s]" />
        <Swords className="h-8 w-8 text-primary" />
      </div>

      <div className="text-center space-y-1">
        <motion.p
          className="text-sm font-medium text-text"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Finding opponent...
        </motion.p>
        <p className="text-xs text-text-muted">Matching by skill level</p>
      </div>
    </div>
  );
}
