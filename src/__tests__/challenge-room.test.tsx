import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChallengeTimer } from "@/components/challenge/challenge-timer";

describe("ChallengeTimer", () => {
  it("starts at 5:00", () => {
    render(<ChallengeTimer duration={300} onExpire={vi.fn()} />);
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });
});
