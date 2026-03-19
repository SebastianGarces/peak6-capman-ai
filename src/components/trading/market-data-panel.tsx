"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketData {
  underlying?: string;
  underlying_price?: number;
  iv_rank?: number;
  vix?: number;
  [key: string]: unknown;
}

interface MarketDataPanelProps {
  data?: MarketData;
  /** Alternative prop name — both accepted */
  marketData?: Record<string, unknown>;
}

function formatNumber(value: unknown, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(decimals);
}

function ChangeIndicator({ value }: { value: unknown }) {
  const num = Number(value);
  if (isNaN(num) || num === 0) return <Minus className="h-3 w-3 text-text-dim" />;
  if (num > 0) return <TrendingUp className="h-3 w-3 text-green" />;
  return <TrendingDown className="h-3 w-3 text-red" />;
}

function DataRow({
  label,
  value,
  mono = true,
  highlight,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
  highlight?: "green" | "red" | "amber" | "lavender";
}) {
  const colorMap = {
    green: "text-green",
    red: "text-red",
    amber: "text-amber",
    lavender: "text-lavender",
  } as const;

  const formatted =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "—");

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-border last:border-0">
      <span className="text-xs text-text-dim">{label}</span>
      <span
        className={cn(
          "text-xs",
          mono && "font-mono",
          highlight ? colorMap[highlight] : "text-text",
        )}
      >
        {formatted}
      </span>
    </div>
  );
}

export function MarketDataPanel({ data, marketData: marketDataProp }: MarketDataPanelProps) {
  // Accept either `data` (test contract) or `marketData` (internal usage)
  const raw: Record<string, unknown> = (data as Record<string, unknown> | undefined) ?? marketDataProp ?? {};

  const underlying = raw?.underlying ?? raw?.ticker ?? raw?.symbol;
  const price =
    raw?.underlying_price ?? raw?.price ?? raw?.spot ?? raw?.current_price;
  const change = raw?.change ?? raw?.price_change;
  const changePercent = raw?.change_percent ?? raw?.price_change_pct;
  const ivRank =
    raw?.iv_rank ?? raw?.ivr ?? raw?.implied_volatility_rank;
  const vix = raw?.vix ?? raw?.VIX;
  const volume = raw?.volume ?? raw?.daily_volume;
  const openInterest = raw?.open_interest ?? raw?.oi;

  const shownKeys = new Set([
    "underlying",
    "underlying_price",
    "ticker",
    "symbol",
    "price",
    "spot",
    "current_price",
    "change",
    "price_change",
    "change_percent",
    "price_change_pct",
    "iv_rank",
    "ivr",
    "implied_volatility_rank",
    "vix",
    "VIX",
    "volume",
    "daily_volume",
    "open_interest",
    "oi",
  ]);
  const extraFields = Object.entries(raw).filter(([k]) => !shownKeys.has(k));

  const changeNum = Number(change);
  const changePositive = !isNaN(changeNum) && changeNum > 0;
  const changeNegative = !isNaN(changeNum) && changeNum < 0;

  return (
    <div className="rounded-xl border border-surface-border bg-bg-deep overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Market Data
        </span>
        {underlying != null && (
          <span className="font-mono text-sm font-bold text-text">
            {String(underlying)}
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-0">
        {/* Price */}
        {price !== undefined && (
          <div className="flex items-baseline justify-between py-2 border-b border-surface-border">
            <span className="text-xs text-text-dim">Price</span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  changePositive
                    ? "text-green"
                    : changeNegative
                      ? "text-red"
                      : "text-text",
                )}
              >
                {typeof price === "number"
                  ? Number.isInteger(price)
                    ? price.toString()
                    : price.toFixed(2)
                  : formatNumber(price)}
              </span>
              {(change !== undefined || changePercent !== undefined) && (
                <div className="flex items-center gap-0.5">
                  <ChangeIndicator value={change ?? changePercent} />
                  {changePercent !== undefined && (
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        changePositive
                          ? "text-green"
                          : changeNegative
                            ? "text-red"
                            : "text-text-dim",
                      )}
                    >
                      {changePositive ? "+" : ""}
                      {formatNumber(changePercent, 2)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* IV Rank */}
        {ivRank !== undefined && (
          <DataRow
            label="IV Rank"
            value={
              typeof ivRank === "number" ? ivRank.toString() : formatNumber(ivRank, 0)
            }
            highlight={
              Number(ivRank) >= 60
                ? "red"
                : Number(ivRank) >= 30
                  ? "amber"
                  : "green"
            }
          />
        )}

        {/* VIX */}
        {vix !== undefined && (
          <DataRow
            label="VIX"
            value={
              typeof vix === "number" ? vix.toString() : formatNumber(vix, 1)
            }
            highlight={
              Number(vix) >= 30 ? "red" : Number(vix) >= 20 ? "amber" : "green"
            }
          />
        )}

        {/* Volume */}
        {volume !== undefined && (
          <DataRow label="Volume" value={Number(volume).toLocaleString()} />
        )}

        {/* Open Interest */}
        {openInterest !== undefined && (
          <DataRow
            label="Open Interest"
            value={Number(openInterest).toLocaleString()}
          />
        )}

        {/* Extra fields */}
        {extraFields.map(([key, val]) => {
          const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <DataRow
              key={key}
              label={label}
              value={typeof val === "object" ? JSON.stringify(val) : (val as string | number)}
            />
          );
        })}
      </div>
    </div>
  );
}
