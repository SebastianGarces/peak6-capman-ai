interface MarketData {
  underlying?: string;
  underlying_price?: number;
  [key: string]: unknown;
}

interface ScenarioReaderProps {
  scenarioText: string;
  marketData: MarketData;
}

function isNegativeNumber(val: unknown): boolean {
  return typeof val === "number" && val < 0;
}

function isPositiveNumber(val: unknown): boolean {
  return typeof val === "number" && val > 0;
}

function formatValue(val: unknown): string {
  if (typeof val === "number") return val.toString();
  if (typeof val === "string") return val;
  return String(val);
}

export function ScenarioReader({ scenarioText, marketData }: ScenarioReaderProps) {
  // Extract well-known fields first, then render remaining keys
  const { underlying, underlying_price, ...rest } = marketData ?? {};

  return (
    <div className="space-y-4">
      {/* Scenario text card with header bar */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="border-b border-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Scenario
        </div>
        <div className="p-4">
          <p className="text-sm leading-relaxed text-foreground">{scenarioText}</p>
        </div>
      </div>

      {/* Market data */}
      {marketData && (
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="border-b border-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Market Data
          </div>
          <div className="p-4 space-y-1 font-mono text-sm">
            {underlying !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Underlying</span>
                <span className="font-semibold">{String(underlying)}</span>
              </div>
            )}
            {underlying_price !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span
                  className={
                    isNegativeNumber(underlying_price)
                      ? "font-semibold text-red-400"
                      : isPositiveNumber(underlying_price)
                        ? "font-semibold text-emerald-400"
                        : "font-semibold"
                  }
                >
                  ${formatValue(underlying_price)}
                </span>
              </div>
            )}
            {Object.entries(rest).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span
                  className={
                    isNegativeNumber(val)
                      ? "font-semibold text-red-400"
                      : isPositiveNumber(val)
                        ? "font-semibold text-emerald-400"
                        : "font-semibold"
                  }
                >
                  {formatValue(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
