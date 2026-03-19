import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurriculumMap } from "@/components/game/curriculum-map";

const mockLevels = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  levelNumber: i + 1,
  name: `Level ${i + 1}`,
  description: `Description ${i + 1}`,
  objectiveCount: 2,
}));

describe("CurriculumMap", () => {
  it("renders 10 level cards", () => {
    render(<CurriculumMap levels={mockLevels} currentLevel={3} />);
    expect(screen.getAllByTestId(/level-card/)).toHaveLength(10);
  });

  it("levels 1-3 are unlocked (have links), 4-10 are locked", () => {
    render(<CurriculumMap levels={mockLevels} currentLevel={3} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(3); // Only levels 1-3 have links
  });

  it("current level card has distinct visual treatment", () => {
    render(<CurriculumMap levels={mockLevels} currentLevel={3} />);
    const currentCard = screen.getByTestId("level-card-3");
    expect(currentCard.className).toContain("ring");
  });
});
