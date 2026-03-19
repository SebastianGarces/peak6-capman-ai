import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "@/components/review/review-card";
import { ReviewRubricForm } from "@/components/review/review-rubric-form";

describe("ReviewCard", () => {
  it("renders scenario and response text", () => {
    render(<ReviewCard scenarioText="Market scenario" responseText="My analysis" />);
    expect(screen.getByText("Market scenario")).toBeInTheDocument();
    expect(screen.getByText("My analysis")).toBeInTheDocument();
  });
});

describe("ReviewRubricForm", () => {
  it("renders 3 rating criteria", () => {
    render(<ReviewRubricForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Correctness")).toBeInTheDocument();
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
    expect(screen.getByText("Risk Awareness")).toBeInTheDocument();
  });

  it("has submit button", () => {
    render(<ReviewRubricForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Submit Review")).toBeInTheDocument();
  });
});
