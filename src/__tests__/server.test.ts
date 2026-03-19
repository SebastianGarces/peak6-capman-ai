import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Custom server", () => {
  it("server.ts exists at project root", () => {
    expect(fs.existsSync(path.resolve(process.cwd(), "server.ts"))).toBe(true);
  });

  it("server.ts imports socket.io", () => {
    const content = fs.readFileSync(path.resolve(process.cwd(), "server.ts"), "utf-8");
    expect(content).toContain("socket.io");
    expect(content).toContain("/challenges");
    expect(content).toContain("/notifications");
  });
});
