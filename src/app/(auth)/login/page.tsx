"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp } from "@/lib/motion";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      {/* Branding */}
      <div className="text-center">
        <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-primary-muted p-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="rgba(67,56,255,0.2)" />
            <path
              d="M8 22L14 10L20 18L24 14"
              stroke="#4338FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="14" r="2.5" fill="#C4A8FF" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text">CapMan AI</h1>
        <p className="mt-1 text-sm text-text-muted">
          Gamified scenario training for capital markets
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-surface border border-surface-border p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text">Sign in</h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Welcome back — continue your training
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={isPending}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={isPending}
          />

          {state?.error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-muted border border-red/20 px-4 py-3 text-sm text-red"
            >
              {state.error}
            </motion.div>
          )}

          <Button
            type="submit"
            size="lg"
            loading={isPending}
            className="w-full mt-1"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
