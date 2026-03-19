import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Dark theme", () => {
  it("CSS variables define all required theme colors", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(css).toContain("--background:");
    expect(css).toContain("--foreground:");
    expect(css).toContain("--card:");
    expect(css).toContain("--primary:");
    expect(css).toContain("--destructive:");
    expect(css).toContain("--warning:");
    expect(css).toContain("--muted:");
    expect(css).toContain("--ring:");
  });

  it("focus-visible styles defined", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(css).toContain("focus-visible");
  });

  it("card surface uses correct dark value", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(css).toContain("--card: 222 30% 10%");
  });
});
