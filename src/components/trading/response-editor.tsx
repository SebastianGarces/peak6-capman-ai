"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_CHARS = 100;

interface ResponseEditorProps {
  onSubmit: (responseText: string) => void;
  loading?: boolean;
}

export function ResponseEditor({ onSubmit, loading = false }: ResponseEditorProps) {
  const [text, setText] = useState("");

  const charCount = text.length;
  const meetsMin = charCount >= MIN_CHARS;
  const remaining = MIN_CHARS - charCount;

  function handleSubmit() {
    if (!meetsMin || loading) return;
    onSubmit(text);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden focus-within:border-primary/40 transition-colors duration-200">
        <textarea
          className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm text-text leading-relaxed placeholder:text-text-dim focus:outline-none font-sans"
          rows={12}
          placeholder="Write your analysis here. Be specific — address the market conditions, risk, and your recommended trade structure..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          aria-label="Scenario response"
        />
        {/* Footer bar */}
        <div className="flex items-center justify-between border-t border-surface-border px-5 py-3 bg-surface-active/30">
          <div className="flex items-center gap-2">
            {!meetsMin && charCount > 0 && (
              <AlertCircle className="h-3.5 w-3.5 text-amber" />
            )}
            <span
              className={cn(
                "text-xs font-mono",
                charCount === 0
                  ? "text-text-dim"
                  : meetsMin
                    ? "text-green"
                    : "text-amber",
              )}
            >
              {charCount.toLocaleString()} chars
            </span>
            {!meetsMin && charCount > 0 && (
              <span className="text-xs text-text-dim">
                ({remaining} more to meet minimum)
              </span>
            )}
            {meetsMin && (
              <span className="text-xs text-text-dim">
                Minimum met
              </span>
            )}
          </div>
          <span className="text-[10px] text-text-dim">
            Min {MIN_CHARS} characters
          </span>
        </div>
      </div>

      {/* Validation hint */}
      {!meetsMin && charCount === 0 && (
        <p className="text-xs text-text-dim px-1">
          Write at least {MIN_CHARS} characters to submit your analysis.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!meetsMin}
          loading={loading}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Submit Analysis
        </Button>
      </div>
    </div>
  );
}
