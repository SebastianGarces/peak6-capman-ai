import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScenarioCard } from "@/components/trading/scenario-card";

describe("ScenarioCard", () => {
  it("renders difficulty, regime, and objectives", () => {
    render(
      <ScenarioCard
        id="test-id"
        levelId={1}
        difficulty={3}
        marketRegime="bull_quiet"
        targetObjectives={["OBJ-001", "OBJ-002"]}
      />
    );
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/bull_quiet/i)).toBeInTheDocument();
  });
});
