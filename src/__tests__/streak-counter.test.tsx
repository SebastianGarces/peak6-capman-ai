import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StreakCounter } from "@/components/game/streak-counter";

describe("StreakCounter", () => {
  it("renders streak count", () => {
    render(<StreakCounter currentStreak={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 0 streak for new user", () => {
    render(<StreakCounter currentStreak={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
