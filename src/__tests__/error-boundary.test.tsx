import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardError from "@/app/(dashboard)/error";
import EducatorError from "@/app/educator/error";

describe("Error Boundaries", () => {
  it("DashboardError renders error message and retry button", () => {
    const reset = vi.fn();
    render(<DashboardError error={new Error("Test error")} reset={reset} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("DashboardError retry button calls reset", () => {
    const reset = vi.fn();
    render(<DashboardError error={new Error("Test error")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalled();
  });

  it("EducatorError renders error message and retry button", () => {
    const reset = vi.fn();
    render(<EducatorError error={new Error("Test error")} reset={reset} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("EducatorError retry button calls reset", () => {
    const reset = vi.fn();
    render(<EducatorError error={new Error("Test error")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalled();
  });
});
