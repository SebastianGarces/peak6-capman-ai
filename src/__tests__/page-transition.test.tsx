import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageTransition } from "@/components/providers/page-transition";

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}));

describe("PageTransition", () => {
  it("renders children", () => {
    render(
      <PageTransition>
        <p>Hello</p>
      </PageTransition>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("wraps children in AnimatePresence", () => {
    render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    );
    expect(screen.getByTestId("animate-presence")).toBeInTheDocument();
  });
});
