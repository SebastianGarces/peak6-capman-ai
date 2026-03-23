"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObjectiveCardProps {
  code: string;
  name: string;
  description: string;
  studyGuide?: string | null;
}

export function ObjectiveCard({ code, name, description, studyGuide }: ObjectiveCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasGuide = !!studyGuide;

  return (
    <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
      <button
        className={cn(
          "w-full flex items-start gap-4 p-4 text-left transition-colors",
          hasGuide && "hover:bg-surface-hover cursor-pointer",
          !hasGuide && "cursor-default",
        )}
        onClick={() => hasGuide && setExpanded((v) => !v)}
        aria-expanded={hasGuide ? expanded : undefined}
        disabled={!hasGuide}
      >
        <span className="inline-flex items-center rounded-md bg-lavender-muted border border-lavender/20 px-2.5 py-1 text-xs font-mono font-bold text-lavender flex-shrink-0">
          {code}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">{name}</p>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
        {hasGuide && (
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <BookOpen className="h-3.5 w-3.5 text-lavender" />
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-text-dim" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-dim" />
            )}
          </div>
        )}
      </button>

      {expanded && studyGuide && (
        <div className="border-t border-surface-border bg-lavender-muted/30 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-lavender" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-lavender">
              Study Guide
            </h4>
          </div>
          <div className="space-y-3">
            {studyGuide.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm text-text leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
