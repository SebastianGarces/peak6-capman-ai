"use client";

import { Button } from "@/components/ui/button";
import { XpPopup } from "@/components/game/xp-popup";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/motion";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface ChallengeResultsProps {
  isWinner: boolean;
  yourScore: number;
  opponentScore: number;
  xpAwarded: number;
  opponentResponse?: string;
  challengeId: string;
}

export function ChallengeResults({
  isWinner,
  yourScore,
  opponentScore,
  xpAwarded,
  opponentResponse,
  challengeId,
}: ChallengeResultsProps) {
  const [showOpponent, setShowOpponent] = useState(false);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-lg space-y-6"
    >
      {/* Win/Lose banner */}
      <motion.div
        variants={scaleIn}
        className={`bg-surface border border-surface-border rounded-xl p-8 text-center relative overflow-hidden ${
          isWinner
            ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/5"
            : ""
        }`}
      >
        <XpPopup amount={xpAwarded} show={true} />
        <Trophy
          className={`mx-auto mb-3 h-14 w-14 ${isWinner ? "text-amber-400" : "text-text-muted"}`}
        />
        <h2
          className={`text-4xl font-bold ${
            isWinner ? "text-gradient-primary" : "text-text-muted"
          }`}
        >
          {isWinner ? "Victory!" : "Good Effort"}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {isWinner ? "Outstanding trading analysis!" : "Keep practicing — you'll get there!"}
        </p>
      </motion.div>

      {/* Score comparison */}
      <motion.div variants={staggerItem} className="bg-surface border border-surface-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Your Score</p>
            <p className={`font-mono text-5xl font-bold ${isWinner ? "text-primary" : "text-text"}`}>
              {yourScore}
            </p>
          </div>
          <div className="text-2xl font-bold text-text-muted px-4">vs</div>
          <div className="text-center flex-1">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Opponent</p>
            <p className={`font-mono text-5xl font-bold ${!isWinner ? "text-primary" : "text-text"}`}>
              {opponentScore}
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400">
            +{xpAwarded} XP earned
          </span>
        </div>
      </motion.div>

      {/* Opponent response reveal */}
      {opponentResponse && (
        <motion.div variants={staggerItem} className="bg-surface border border-surface-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowOpponent(!showOpponent)}
            className="inline-link w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <span>View Opponent&apos;s Response</span>
            {showOpponent ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>
          {showOpponent && (
            <div className="border-t border-surface-border p-4">
              <p className="whitespace-pre-wrap text-sm text-text-muted leading-relaxed">
                {opponentResponse}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div variants={staggerItem} className="flex gap-3 justify-center">
        <Link href="/compete">
          <Button className="bg-primary text-white border-0">Rematch</Button>
        </Link>
        <Link href="/review">
          <Button variant="secondary">Review Responses</Button>
        </Link>
        <Link href="/compete">
          <Button variant="ghost">Back to Lobby</Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
