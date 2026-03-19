"use client";

import { motion } from "motion/react";

export function MatchmakingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-sm text-muted-foreground">Searching for an opponent...</p>
    </div>
  );
}
