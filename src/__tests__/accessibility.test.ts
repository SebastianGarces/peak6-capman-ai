import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Accessibility", () => {
  it("root layout has skip navigation", () => {
    const src = fs.readFileSync(path.resolve(process.cwd(), "src/app/layout.tsx"), "utf-8");
    expect(src).toContain("skip-nav");
    expect(src).toContain("Skip to main content");
    expect(src).toContain("#main-content");
  });

  it("dashboard layout has main-content id", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/(dashboard)/layout.tsx"),
      "utf-8"
    );
    expect(src).toContain('id="main-content"');
  });

  it("sidebar navigation has aria-label", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/app-sidebar.tsx"),
      "utf-8"
    );
    expect(src).toContain('aria-label');
  });

  it("active sidebar link has aria-current", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/app-sidebar.tsx"),
      "utf-8"
    );
    expect(src).toContain("aria-current");
  });

  it("leaderboard table has proper th with scope", () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/game/leaderboard-table.tsx"),
      "utf-8"
    );
    expect(src).toContain('scope="col"');
  });

  it("globals.css has skip-nav styling", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(css).toContain(".skip-nav");
  });
});
