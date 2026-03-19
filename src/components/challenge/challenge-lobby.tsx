"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MatchmakingSpinner } from "./matchmaking-spinner";
import { useSocket } from "@/components/providers/socket-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Swords, Trophy, Clock } from "lucide-react";

export function ChallengeLobby() {
  const [searching, setSearching] = useState(false);
  const [matched, setMatched] = useState<{ challengeId: string; opponent: { name: string; level: number } } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { challengeSocket } = useSocket();
  const router = useRouter();

  const findMatch = useCallback(() => {
    setSearching(true);
    challengeSocket?.emit("challenge:request", { curriculumLevelId: 1 });

    challengeSocket?.on("challenge:matched", (data: any) => {
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
  }, [challengeSocket, router]);

  const cancelSearch = () => {
    setSearching(false);
    challengeSocket?.emit("challenge:cancel");
  };

  return (
    <div className="space-y-6 rounded-2xl bg-[radial-gradient(circle_at_50%_30%,hsl(142_71%_45%/0.06),transparent_60%)] p-2">
      <AnimatePresence mode="wait">
        {!searching && !matched && (
          <motion.div
            key="idle"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* CTA card */}
            <motion.div
              variants={staggerItem}
              className="glass-card rounded-xl p-8 text-center"
            >
              <Swords className="mx-auto mb-4 h-12 w-12 text-amber-400" />
              <h2 className="text-xl font-bold mb-2">Ready to compete?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Match with a trader at your level and prove your skills head-to-head.
              </p>
              <Button
                size="lg"
                className="gradient-primary-btn text-white border-0 text-lg px-8 py-4 rounded-xl animate-[glow-pulse_3s_ease-in-out_infinite] flex items-center gap-2"
                onClick={findMatch}
              >
                <Swords className="h-5 w-5" />
                Find Match
              </Button>
            </motion.div>

            {/* Info cards */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                <Trophy className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Winner gets 50 XP</p>
                  <p className="text-xs text-muted-foreground">Loser still earns 10 XP for participating</p>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">5-minute time limit</p>
                  <p className="text-xs text-muted-foreground">Both traders answer the same scenario</p>
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
            className="glass-card rounded-xl p-8 text-center space-y-4"
          >
            <MatchmakingSpinner />
            <Button variant="outline" onClick={cancelSearch}>
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
            className="glass-card rounded-xl p-8 text-center space-y-6"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Match Found!</p>
            <div className="flex items-center gap-4">
              <div className="glass-card flex-1 rounded-xl p-4 text-center glow-primary">
                <p className="text-xs text-muted-foreground mb-1">You</p>
                <p className="font-bold text-foreground">You</p>
              </div>
              <span className="text-gradient-primary text-4xl font-black shrink-0">VS</span>
              <div className="glass-card flex-1 rounded-xl p-4 text-center glow-primary">
                <p className="text-xs text-muted-foreground mb-1">Opponent</p>
                <p className="font-bold text-foreground">{matched.opponent.name}</p>
                <p className="text-xs text-muted-foreground">Lvl {matched.opponent.level}</p>
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
            <p className="text-sm text-muted-foreground">Starting in...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
