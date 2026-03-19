import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardLoading from "@/app/(dashboard)/loading";
import LearnLoading from "@/app/(dashboard)/learn/loading";
import LeaderboardLoading from "@/app/(dashboard)/leaderboard/loading";
import EducatorLoading from "@/app/educator/loading";

// Mock the Skeleton component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("Loading states", () => {
  it("DashboardLoading renders skeleton elements", () => {
    render(<DashboardLoading />);
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("LearnLoading renders skeleton elements for level cards", () => {
    render(<LearnLoading />);
    const skeletons = screen.getAllByTestId("skeleton");
    // 10 level cards + header skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(10);
  });

  it("LeaderboardLoading renders skeleton rows", () => {
    render(<LeaderboardLoading />);
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(10);
  });

  it("EducatorLoading renders skeleton elements", () => {
    render(<EducatorLoading />);
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
