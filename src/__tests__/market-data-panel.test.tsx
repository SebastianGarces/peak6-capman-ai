import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketDataPanel } from "@/components/trading/market-data-panel";

describe("MarketDataPanel", () => {
  it("renders underlying ticker and price", () => {
    render(<MarketDataPanel data={{ underlying: "SPY", underlying_price: 500.50 }} />);
    expect(screen.getByText("SPY")).toBeInTheDocument();
    expect(screen.getByText("500.50")).toBeInTheDocument();
  });

  it("renders IV rank and VIX when present", () => {
    render(<MarketDataPanel data={{ underlying: "SPY", underlying_price: 500, iv_rank: 45, vix: 18.5 }} />);
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("18.5")).toBeInTheDocument();
  });

  it("handles missing optional fields without error", () => {
    render(<MarketDataPanel data={{ underlying: "AAPL", underlying_price: 180 }} />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
  });
});
