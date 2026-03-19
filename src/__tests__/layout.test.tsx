import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "@/components/providers";
import RootLayout from "@/app/layout";
import fs from "fs";
import path from "path";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("Root Layout", () => {
  it("renders children within html > body", () => {
    const layout = RootLayout({ children: <div data-testid="child">Hello</div> });
    expect(layout).toBeTruthy();
    expect(layout.props.lang).toBe("en");
    expect(layout.props.suppressHydrationWarning).toBe(true);
  });
});

describe("Providers", () => {
  it("wraps children without error", () => {
    render(
      <Providers>
        <div data-testid="test-child">Test</div>
      </Providers>
    );
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });
});

describe("Dark theme CSS variables", () => {
  it("are defined in globals.css", () => {
    const cssPath = path.resolve(__dirname, "../app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");
    expect(css).toContain("--background:");
    expect(css).toContain("--card:");
    expect(css).toContain("--primary:");
    expect(css).toContain("--destructive:");
    expect(css).toContain("--foreground:");
  });
});

describe("ThemeProvider defaults to dark", () => {
  it("renders with dark class by default", () => {
    const layout = RootLayout({ children: <div>Test</div> });
    expect(layout.props.className).toContain("dark");
  });
});
