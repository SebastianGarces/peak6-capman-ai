import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierDistribution } from "@/components/mtss/tier-distribution";

describe("TierDistribution", () => {
  it("renders 3 tier bars", () => {
    render(<TierDistribution tier1Count={20} tier2Count={5} tier3Count={2} />);
    expect(screen.getByText("Tier 1")).toBeInTheDocument();
    expect(screen.getByText("Tier 2")).toBeInTheDocument();
    expect(screen.getByText("Tier 3")).toBeInTheDocument();
  });

  it("shows correct counts", () => {
    render(<TierDistribution tier1Count={20} tier2Count={5} tier3Count={2} />);
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
