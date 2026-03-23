"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MatchmakingSpinner } from "./matchmaking-spinner";
import { useSocket } from "@/components/providers/socket-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Swords, Trophy, Clock, Wifi, WifiOff } from "lucide-react";

export function ChallengeLobby() {
  const [searching, setSearching] = useState(false);
  const [matched, setMatched] = useState<{
    challengeId: string;
    opponent: { name: string; level: number };
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { challengeSocket, isConnected } = useSocket();
  const router = useRouter();

  const findMatch = useCallback(() => {
    setSearching(true);

    if (!challengeSocket || !isConnected) {
      // Mock mode — socket not running; stay in searching state until cancelled
      return;
    }

    challengeSocket.emit("challenge:request", { curriculumLevelId: 1 });

    challengeSocket.on("challenge:matched", (data: any) => {
      setSearching(false);
      setMatched(data);
      let count = 5;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          router.push(`/compete/${data.challengeId}`);
        }
      }, 1000);
    });
  }, [challengeSocket, isConnected, router]);

  const cancelSearch = () => {
    setSearching(false);
    challengeSocket?.emit("challenge:cancel");
  };

  return (
    <div className="space-y-6 rounded-2xl bg-[radial-gradient(circle_at_50%_30%,hsl(142_71%_45%/0.06),transparent_60%)] p-2">
      {/* Connection status badge */}
      <div className="flex justify-end">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isConnected
              ? "bg-green-500/10 text-green-400"
              : "bg-surface text-text-muted"
          }`}
        >
          {isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {isConnected ? "Live matchmaking" : "Demo mode"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!searching && !matched && (
          <motion.div
            key="idle"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* CTA card */}
            <motion.div
              variants={staggerItem}
              className="bg-surface border border-surface-border rounded-xl p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/10">
                <Swords className="h-10 w-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to compete?</h2>
              <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                Match with a trader at your level and prove your skills head-to-head.
                Both traders answer the same scenario — highest score wins.
              </p>
              <Button
                size="lg"
                className="bg-primary text-white border-0 text-lg px-8 py-4 rounded-xl gap-2"
                onClick={findMatch}
              >
                <Swords className="h-5 w-5" />
                {isConnected ? "Find Match" : "Start Match"}
              </Button>
            </motion.div>

            {/* Info cards */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div className="bg-surface border border-surface-border rounded-xl p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Winner gets 50 XP</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Loser still earns 10 XP for participating
                  </p>
                </div>
              </div>
              <div className="bg-surface border border-surface-border rounded-xl p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-400/10">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">5-minute time limit</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Both traders answer the same scenario
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {searching && (
          <motion.div
            key="searching"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="bg-surface border border-surface-border rounded-xl p-8 text-center space-y-6"
          >
            <MatchmakingSpinner />
            <Button variant="secondary" onClick={cancelSearch}>
              Cancel Search
            </Button>
          </motion.div>
        )}

        {matched && countdown !== null && (
          <motion.div
            key="matched"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-surface border border-surface-border rounded-xl p-8 text-center space-y-6"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-widest">
              Match Found!
            </p>
            <div className="flex items-center gap-4">
              <div className="bg-surface border border-surface-border flex-1 rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">You</p>
                <p className="font-bold text-text">You</p>
              </div>
              <span className="text-gradient-primary text-4xl font-black shrink-0">
                VS
              </span>
              <div className="bg-surface border border-surface-border flex-1 rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">Opponent</p>
                <p className="font-bold text-text">{matched.opponent.name}</p>
                <p className="text-xs text-text-muted">
                  Lvl {matched.opponent.level}
                </p>
              </div>
            </div>
            <motion.p
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-6xl font-mono font-bold text-primary"
            >
              {countdown}
            </motion.p>
            <p className="text-sm text-text-muted">Starting in...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
