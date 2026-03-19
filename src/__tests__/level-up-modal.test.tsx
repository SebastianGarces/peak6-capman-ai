import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LevelUpModal } from "@/components/game/level-up-modal";

describe("LevelUpModal", () => {
  it("renders with new level and badge name", () => {
    render(<LevelUpModal open={true} onClose={vi.fn()} newLevel={5} />);
    expect(screen.getByText("LEVEL UP!")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Trader II")).toBeInTheDocument();
  });

  it("has continue button that calls onClose", () => {
    const onClose = vi.fn();
    render(<LevelUpModal open={true} onClose={onClose} newLevel={3} />);
    screen.getByText("Continue").click();
    expect(onClose).toHaveBeenCalled();
  });
});
