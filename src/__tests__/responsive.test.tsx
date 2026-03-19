import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Responsive design", () => {
  it("sidebar has hidden md:flex classes for mobile collapse", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/app-sidebar.tsx"),
      "utf-8"
    );
    expect(src).toContain("hidden md:flex");
    expect(src).toContain("md:hidden");
  });

  it("sidebar has mobile hamburger menu", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/app-sidebar.tsx"),
      "utf-8"
    );
    expect(src).toContain("Menu");
    expect(src).toContain("Open navigation");
  });

  it("leaderboard table has horizontal scroll wrapper", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/game/leaderboard-table.tsx"),
      "utf-8"
    );
    expect(src).toContain("overflow-x-auto");
    expect(src).toContain("min-w-");
  });

  it("heatmap table has horizontal scroll wrapper", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/mtss/tier-heatmap.tsx"),
      "utf-8"
    );
    expect(src).toContain("overflow-x-auto");
  });
});
