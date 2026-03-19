import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LevelBadge } from "@/components/game/level-badge";

describe("LevelBadge", () => {
  it("renders level number and badge name", () => {
    render(<LevelBadge level={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Recruit")).toBeInTheDocument();
  });

  it("Level 10 shows CapMan Pro", () => {
    render(<LevelBadge level={10} />);
    expect(screen.getByText("CapMan Pro")).toBeInTheDocument();
  });
});
