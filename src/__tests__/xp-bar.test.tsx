import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { XpBar } from "@/components/game/xp-bar";

describe("XpBar", () => {
  it("renders current XP and threshold", () => {
    render(<XpBar currentXp={250} currentLevel={2} />);
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument(); // Next threshold
  });

  it("displays level name", () => {
    render(<XpBar currentXp={100} currentLevel={2} />);
    expect(screen.getByText("Analyst I")).toBeInTheDocument();
  });
});
