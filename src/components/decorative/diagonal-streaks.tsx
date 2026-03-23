"use client";

import { cn } from "@/lib/utils";

interface DiagonalStreaksProps {
  variant?: "hero" | "card" | "section";
  className?: string;
}

export function DiagonalStreaks({
  variant = "hero",
  className,
}: DiagonalStreaksProps) {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className
        )}
        aria-hidden="true"
      >
        {/* Blue streak — top right */}
        <div className="streak streak-blue streak-disperse w-[320px] h-[48px] top-[10%] right-[-5%] opacity-80" />
        {/* Lavender streak — center */}
        <div className="streak streak-lavender streak-disperse w-[400px] h-[44px] top-[35%] right-[10%] opacity-70" />
        {/* Amber streak — center left */}
        <div className="streak streak-amber streak-disperse w-[380px] h-[44px] top-[50%] left-[5%] opacity-70" />
        {/* Orange streak — bottom */}
        <div className="streak streak-orange streak-disperse w-[350px] h-[44px] bottom-[15%] right-[5%] opacity-70" />
        {/* Subtle blue — far left */}
        <div className="streak streak-blue w-[200px] h-[32px] bottom-[30%] left-[-3%] opacity-40" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-2xl",
          className
        )}
        aria-hidden="true"
      >
        <div className="streak streak-blue streak-disperse w-[120px] h-[16px] top-[20%] right-[-10%] opacity-30" />
        <div className="streak streak-lavender streak-disperse w-[100px] h-[14px] bottom-[25%] right-[-5%] opacity-25" />
      </div>
    );
  }

  // section variant
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <div className="streak streak-amber streak-disperse w-[200px] h-[20px] top-[50%] right-[-3%] opacity-25" />
      <div className="streak streak-orange streak-disperse w-[160px] h-[18px] top-[60%] right-[5%] opacity-20" />
    </div>
  );
}
