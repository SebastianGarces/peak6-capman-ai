import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaderboardTable } from "@/components/game/leaderboard-table";
import { LeaderboardTabs } from "@/components/game/leaderboard-tabs";

describe("LeaderboardTable", () => {
  it("renders rows with rank, name, XP", () => {
    const entries = [
      { id: "1", name: "Alice", xp: 2340, level: 5, avatarUrl: null },
      { id: "2", name: "Bob", xp: 1890, level: 4, avatarUrl: null },
    ];
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("2,340")).toBeInTheDocument();
  });

  it("highlights current user row", () => {
    const entries = [{ id: "me", name: "Me", xp: 100, level: 1, avatarUrl: null }];
    render(<LeaderboardTable entries={entries} currentUserId="me" />);
    const row = screen.getByText("Me").closest("tr");
    expect(row?.className).toContain("bg-primary");
  });

  it("shows empty state when no data", () => {
    render(<LeaderboardTable entries={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});

describe("LeaderboardTabs", () => {
  it("renders all three tab options", () => {
    render(<LeaderboardTabs activeTab="alltime" onTabChange={vi.fn()} />);
    expect(screen.getByText("All-Time")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Skill Level")).toBeInTheDocument();
  });
});
