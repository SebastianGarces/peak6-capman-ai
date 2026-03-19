import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngagementPanel } from "@/components/mtss/engagement-panel";

describe("EngagementPanel", () => {
  it("renders DAU and WAU counts", () => {
    render(<EngagementPanel dau={34} wau={45} avgSessionsPerWeek={4.2} challengeRate={67} />);
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("DAU")).toBeInTheDocument();
    expect(screen.getByText("WAU")).toBeInTheDocument();
  });
});
