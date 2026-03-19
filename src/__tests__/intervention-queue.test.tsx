import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InterventionQueue } from "@/components/mtss/intervention-queue";

describe("InterventionQueue", () => {
  it("shows empty state when no items", () => {
    render(<InterventionQueue items={[]} />);
    expect(screen.getByText(/no tier 3/i)).toBeInTheDocument();
  });

  it("renders learner info", () => {
    render(
      <InterventionQueue
        items={[{
          userId: "1",
          name: "Dave",
          failingObjectives: ["OBJ-002"],
          avgScore: 38,
          daysInactive: 6,
        }]}
      />
    );
    expect(screen.getByText("Dave")).toBeInTheDocument();
    expect(screen.getByText(/OBJ-002/)).toBeInTheDocument();
    expect(screen.getByText("Send Nudge")).toBeInTheDocument();
  });
});
