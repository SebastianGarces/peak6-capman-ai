"use client";

import { MarketDataPanel } from "@/components/trading/market-data-panel";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

interface ScenarioReaderProps {
  scenarioText: string;
  marketData: Record<string, unknown>;
  questionPrompt?: string;
  onBegin?: () => void;
}

export function ScenarioReader({
  scenarioText,
  questionPrompt,
  marketData,
  onBegin,
}: ScenarioReaderProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scenario text — takes 2 columns */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-surface-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Scenario
              </h3>
            </div>
            <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
              {scenarioText}
            </p>
          </div>

          {/* Question prompt */}
          {questionPrompt && (
            <div className="rounded-xl border border-primary/30 bg-primary-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Your Task
              </p>
              <p className="text-sm text-text leading-relaxed">{questionPrompt}</p>
            </div>
          )}
        </div>

        {/* Market data panel */}
        <div className="lg:col-span-1">
          {Object.keys(marketData).length > 0 ? (
            <MarketDataPanel marketData={marketData} />
          ) : (
            <div className="rounded-xl border border-surface-border bg-surface p-4 text-center">
              <p className="text-xs text-text-dim">No market data provided.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {onBegin && (
        <div className="flex justify-end pt-2">
          <Button variant="primary" size="lg" onClick={onBegin} className="gap-2">
            Begin Response
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
