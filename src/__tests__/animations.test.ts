import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Staggered List Animations", () => {
  it("leaderboard-table uses motion for layout animations", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/game/leaderboard-table.tsx"),
      "utf-8"
    );
    expect(src).toContain("motion");
    expect(src).toContain("layout");
  });

  it("scenario-card component exists with hover transitions", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/trading/scenario-card.tsx"),
      "utf-8"
    );
    expect(src).toContain("hover:");
  });

  it("tier-heatmap renders table with cells", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/mtss/tier-heatmap.tsx"),
      "utf-8"
    );
    expect(src).toContain("table");
    expect(src).toContain("TIER_COLORS");
  });
});
