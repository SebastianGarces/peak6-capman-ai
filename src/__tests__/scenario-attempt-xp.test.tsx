import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock the server actions
const mockStartScenario = vi.fn(() => Promise.resolve({ attemptId: "attempt-1" }));
const mockSubmitResponse = vi.fn(() =>
  Promise.resolve({
    score: 85,
    feedback: {
      total_score: 85,
      feedback_summary: "Good analysis",
      criteria_evaluation: [],
      probing_questions: [],
    },
    xpAwarded: 20,
    leveledUp: true,
    newLevel: 3,
  })
);
const mockSubmitProbingResponse = vi.fn();

vi.mock("@/actions/scenario", () => ({
  startScenario: mockStartScenario,
  submitResponse: mockSubmitResponse,
  submitProbingResponse: mockSubmitProbingResponse,
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        const Component = ({ children, ...props }: any) => {
          const { variants, initial, animate, exit, whileHover, whileTap, transition, layout, layoutId, ...rest } = props;
          const tag = String(prop);
          if (tag === "div") return <div {...rest}>{children}</div>;
          if (tag === "span") return <span {...rest}>{children}</span>;
          if (tag === "p") return <p {...rest}>{children}</p>;
          if (tag === "h2") return <h2 {...rest}>{children}</h2>;
          if (tag === "button") return <button {...rest}>{children}</button>;
          return <div {...rest}>{children}</div>;
        };
        Component.displayName = `motion.${String(prop)}`;
        return Component;
      },
    }
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

// Mock sub-components
vi.mock("@/components/trading/scenario-reader", () => ({
  ScenarioReader: ({ onBegin }: any) => (
    <div data-testid="scenario-reader">
      <button onClick={onBegin}>Begin Response</button>
    </div>
  ),
}));

vi.mock("@/components/trading/response-editor", () => ({
  ResponseEditor: ({ onSubmit }: any) => (
    <div data-testid="response-editor">
      <button onClick={() => onSubmit("My analysis text")}>Submit</button>
    </div>
  ),
}));

vi.mock("@/components/trading/grading-result", () => ({
  GradingResult: ({ score }: any) => (
    <div data-testid="grading-result">Score: {score}</div>
  ),
}));

vi.mock("@/components/motion-div", () => ({
  MotionDiv: ({ children, ...props }: any) => {
    const { initial, animate, exit, transition, ...rest } = props;
    return <div {...rest}>{children}</div>;
  },
}));

vi.mock("@/lib/motion", () => ({
  xpPopup: {},
  scaleIn: {},
  overlayFade: {},
}));

vi.mock("@/lib/game/levels", () => ({
  getLevelName: (level: number) => `Level ${level}`,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { ScenarioAttempt } from "@/app/(dashboard)/learn/[levelId]/scenario/[scenarioId]/scenario-attempt";

const scenario = {
  id: "scenario-1",
  scenarioText: "Market scenario",
  questionPrompt: "What would you do?",
  marketData: {},
  difficulty: 5,
  marketRegime: "bull",
  curriculumLevelId: 1,
};

describe("Task #8: XP popup and level-up modal in scenario UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStartScenario.mockResolvedValue({ attemptId: "attempt-1" });
  });

  it("renders XpPopup after submitResponse returns xpAwarded", async () => {
    render(
      <ScenarioAttempt scenario={scenario} levelNumber={1} levelName="Basics" />
    );

    // Go through read -> respond -> submit
    const beginBtn = await screen.findByText("Begin Response");
    fireEvent.click(beginBtn);

    const submitBtn = await screen.findByText("Submit");
    fireEvent.click(submitBtn);

    // XP popup should show
    await waitFor(() => {
      expect(screen.getByText(/\+20 XP/)).toBeTruthy();
    });
  });

  it("renders LevelUpModal when leveledUp is true", async () => {
    render(
      <ScenarioAttempt scenario={scenario} levelNumber={1} levelName="Basics" />
    );

    const beginBtn = await screen.findByText("Begin Response");
    fireEvent.click(beginBtn);

    const submitBtn = await screen.findByText("Submit");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Level Up!")).toBeTruthy();
    });
  });

  it("does not render XpPopup when xpAwarded is 0", async () => {
    mockSubmitResponse.mockResolvedValueOnce({
      score: 85,
      feedback: {
        total_score: 85,
        feedback_summary: "Good analysis",
        criteria_evaluation: [],
        probing_questions: [],
      },
      xpAwarded: 0,
      leveledUp: false,
      newLevel: 1,
    });

    render(
      <ScenarioAttempt scenario={scenario} levelNumber={1} levelName="Basics" />
    );

    const beginBtn = await screen.findByText("Begin Response");
    fireEvent.click(beginBtn);

    const submitBtn = await screen.findByText("Submit");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("grading-result")).toBeTruthy();
    });

    expect(screen.queryByText(/\+0 XP/)).toBeNull();
  });
});
