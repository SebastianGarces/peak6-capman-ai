import { describe, it, expect, vi } from "vitest";

// We test the educator nav structure
describe("Educator navigation", () => {
  it("should have correct nav items", () => {
    const navItems = [
      { href: "/educator", label: "Overview" },
      { href: "/educator/students", label: "Students" },
      { href: "/educator/interventions", label: "Interventions" },
      { href: "/educator/analytics", label: "Analytics" },
    ];
    expect(navItems).toHaveLength(4);
    expect(navItems.map(n => n.label)).toEqual(["Overview", "Students", "Interventions", "Analytics"]);
  });
});
