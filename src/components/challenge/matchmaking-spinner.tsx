"use client";

import { Swords } from "lucide-react";

export function MatchmakingSpinner() {
  return (
    <div className="relative flex items-center justify-center py-8">
      <div className="absolute h-32 w-32 rounded-full border border-primary/20 animate-ping" />
      <div className="absolute h-24 w-24 rounded-full border border-primary/30 animate-ping [animation-delay:0.5s]" />
      <div className="absolute h-16 w-16 rounded-full border border-primary/40 animate-ping [animation-delay:1s]" />
      <Swords className="h-8 w-8 text-primary" />
    </div>
  );
}
