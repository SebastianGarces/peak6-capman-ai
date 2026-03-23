"use client";

import { useState, useEffect } from "react";

interface ChallengeTimerProps {
  duration: number; // seconds
  onExpire: () => void;
}

export function ChallengeTimer({ duration, onExpire }: ChallengeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeColor =
    timeLeft <= 30
      ? "hsl(0,72%,51%)"
      : timeLeft <= 60
        ? "hsl(48,96%,53%)"
        : "hsl(142,71%,45%)";
  const dashOffset = circumference * (1 - timeLeft / duration);

  return (
    <svg width="64" height="64" aria-label={`Time remaining: ${formatted}`}>
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="4"
      />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 32 32)"
        className="transition-all duration-1000 ease-linear"
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-xs font-mono font-bold"
        fontSize="10"
      >
        {formatted}
      </text>
    </svg>
  );
}
