"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-muted">
        <AlertTriangle className="h-7 w-7 text-red" />
      </div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} className="mt-6" variant="secondary">
        Try again
      </Button>
    </div>
  );
}
