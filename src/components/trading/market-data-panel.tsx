interface MarketData {
  underlying: string;
  underlying_price: number;
  iv_rank?: number;
  vix?: number;
  [key: string]: unknown;
}

interface MarketDataPanelProps {
  data: MarketData;
}

export function MarketDataPanel({ data }: MarketDataPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Market Data
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Underlying</p>
          <p className="font-mono text-sm font-semibold text-foreground">{data.underlying}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {Number.isInteger(data.underlying_price)
              ? data.underlying_price
              : data.underlying_price.toFixed(2)}
          </p>
        </div>
        {data.iv_rank !== undefined && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">IV Rank</p>
            <p className="font-mono text-sm font-semibold text-foreground">{data.iv_rank}</p>
          </div>
        )}
        {data.vix !== undefined && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">VIX</p>
            <p className="font-mono text-sm font-semibold text-foreground">{data.vix}</p>
          </div>
        )}
      </div>
    </div>
  );
}
