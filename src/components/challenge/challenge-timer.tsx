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
  const color = timeLeft <= 60 ? "text-red-500" : timeLeft <= 120 ? "text-amber-500" : "text-green-500";

  return (
    <div className={`text-2xl font-mono font-bold ${color}`}>
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
