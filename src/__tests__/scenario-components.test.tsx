import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScenarioReader } from "@/components/trading/scenario-reader";
import { ResponseEditor } from "@/components/trading/response-editor";
import { GradingResult } from "@/components/trading/grading-result";

describe("ScenarioReader", () => {
  it("renders scenario text and market data", () => {
    render(
      <ScenarioReader
        scenarioText="A bull market scenario..."
        marketData={{ underlying: "SPY", underlying_price: 500 }}
      />
    );
    expect(screen.getByText(/bull market scenario/i)).toBeInTheDocument();
    expect(screen.getByText(/SPY/)).toBeInTheDocument();
  });
});

describe("ResponseEditor", () => {
  it("renders textarea and submit button", () => {
    render(<ResponseEditor onSubmit={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});

describe("GradingResult", () => {
  it("displays score and feedback", () => {
    render(
      <GradingResult
        score={85}
        feedback={{
          feedback_summary: "Good analysis",
          criteria_evaluation: [
            { criterion: "Market Analysis", score: 25, max_score: 30, feedback: "Well done" },
          ],
          total_score: 85,
        }}
      />
    );
    expect(screen.getByText(/85/)).toBeInTheDocument();
    expect(screen.getByText(/Good analysis/)).toBeInTheDocument();
  });
});
