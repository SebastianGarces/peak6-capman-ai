import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChallengeLobby } from "@/components/challenge/challenge-lobby";
import { MatchmakingSpinner } from "@/components/challenge/matchmaking-spinner";

vi.mock("@/components/providers/socket-provider", () => ({
  useSocket: () => ({ challengeSocket: null, isConnected: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ChallengeLobby", () => {
  it("renders Find Match button", () => {
    render(<ChallengeLobby />);
    expect(screen.getByText("Find Match")).toBeInTheDocument();
  });
});

describe("MatchmakingSpinner", () => {
  it("renders searching text", () => {
    render(<MatchmakingSpinner />);
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });
});
