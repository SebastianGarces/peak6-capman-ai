"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-md">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">CapMan AI</span>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in to your CapMan AI account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary-btn text-white border-0"
              disabled={pending}
            >
              {pending ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
