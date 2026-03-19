import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { XpPopup } from "@/components/game/xp-popup";

describe("XpPopup", () => {
  it("renders XP amount text when shown", () => {
    render(<XpPopup amount={50} show={true} />);
    expect(screen.getByText("+50 XP!")).toBeInTheDocument();
  });

  it("does not render when hidden", () => {
    render(<XpPopup amount={50} show={false} />);
    expect(screen.queryByText("+50 XP!")).not.toBeInTheDocument();
  });
});
