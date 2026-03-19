interface MarketData {
  underlying?: string;
  underlying_price?: number;
  [key: string]: unknown;
}

interface ScenarioReaderProps {
  scenarioText: string;
  marketData: MarketData;
}

export function ScenarioReader({ scenarioText, marketData }: ScenarioReaderProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Scenario
        </h3>
        <p className="text-sm leading-relaxed text-foreground">{scenarioText}</p>
      </div>
      {marketData && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Market Data
          </h3>
          <div className="space-y-1 font-mono text-sm">
            {marketData.underlying && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Underlying</span>
                <span className="font-semibold">{marketData.underlying}</span>
              </div>
            )}
            {marketData.underlying_price !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold">${marketData.underlying_price}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
