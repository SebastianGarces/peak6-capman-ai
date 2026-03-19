"use client";

import { useEffect } from "react";

export default function EducatorError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="glass-card rounded-xl p-8 text-center max-w-md glow-danger">
        <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred in the educator dashboard. Please try again.
        </p>
        <button
          onClick={unstable_retry}
          className="mt-6 rounded-lg gradient-primary-btn px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
