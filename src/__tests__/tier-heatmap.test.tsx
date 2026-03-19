import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierHeatmap } from "@/components/mtss/tier-heatmap";

const mockData = {
  matrix: [
    {
      userId: "1",
      name: "Alice",
      level: 3,
      objectives: [
        { objectiveId: "o1", code: "OBJ-001", tier: 1, avgScore: 85 },
        { objectiveId: "o2", code: "OBJ-002", tier: 3, avgScore: 40 },
      ],
    },
  ],
  objectives: [
    { id: "o1", code: "OBJ-001", name: "Moneyness" },
    { id: "o2", code: "OBJ-002", name: "Intrinsic Value" },
  ],
};

describe("TierHeatmap", () => {
  it("renders correct number of rows and columns", () => {
    render(<TierHeatmap data={mockData} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("OBJ-001")).toBeInTheDocument();
    expect(screen.getByText("OBJ-002")).toBeInTheDocument();
  });

  it("Tier 1 cells show 1, Tier 3 cells show 3", () => {
    render(<TierHeatmap data={mockData} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
