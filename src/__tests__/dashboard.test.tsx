import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageHeader } from "@/components/layout/page-header";

describe("AppSidebar", () => {
  it("contains all 6 navigation links with correct hrefs", () => {
    render(<AppSidebar />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/learn");
    expect(hrefs).toContain("/compete");
    expect(hrefs).toContain("/review");
    expect(hrefs).toContain("/leaderboard");
    expect(hrefs).toContain("/profile");
  });

  it("renders CapMan AI branding", () => {
    render(<AppSidebar />);
    const brandElements = screen.getAllByText("CapMan AI");
    expect(brandElements.length).toBeGreaterThan(0);
  });
});

describe("PageHeader", () => {
  it("renders title and description", () => {
    render(<PageHeader title="Test Title" description="Test desc" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test desc")).toBeInTheDocument();
  });
});
