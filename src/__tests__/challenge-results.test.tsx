import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChallengeResults } from "@/components/challenge/challenge-results";

describe("ChallengeResults", () => {
  it("shows winner status correctly", () => {
    render(
      <ChallengeResults
        isWinner={true}
        yourScore={85}
        opponentScore={72}
        xpAwarded={50}
        challengeId="c1"
      />
    );
    expect(screen.getByText("You Win!")).toBeInTheDocument();
  });

  it("shows both scores", () => {
    render(
      <ChallengeResults
        isWinner={false}
        yourScore={60}
        opponentScore={85}
        xpAwarded={10}
        challengeId="c1"
      />
    );
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("shows XP amount", () => {
    render(
      <ChallengeResults
        isWinner={true}
        yourScore={85}
        opponentScore={72}
        xpAwarded={50}
        challengeId="c1"
      />
    );
    expect(screen.getByText("+50 XP")).toBeInTheDocument();
  });

  it("has rematch button", () => {
    render(
      <ChallengeResults
        isWinner={true}
        yourScore={85}
        opponentScore={72}
        xpAwarded={50}
        challengeId="c1"
      />
    );
    expect(screen.getByText("Rematch")).toBeInTheDocument();
  });
});
