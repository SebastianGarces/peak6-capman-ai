"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { scaleIn } from "@/lib/motion";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="glass-card glow-danger rounded-xl p-10 text-center max-w-md w-full space-y-5"
      >
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Your progress is safe — try again or go home.
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-muted-foreground/60 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium gradient-primary-btn text-white border-0 transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
