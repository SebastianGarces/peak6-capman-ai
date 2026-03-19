"use server";

import { db } from "@/lib/db";
import { scenarioAttempts, scenarios } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function startScenario(scenarioId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const [attempt] = await db
    .insert(scenarioAttempts)
    .values({
      userId: (session.user as any).id,
      scenarioId,
      responseText: "",
    })
    .returning();

  return { attemptId: attempt.id };
}

export async function submitResponse(attemptId: string, responseText: string) {
  if (!responseText.trim()) {
    return { error: "Response cannot be empty" };
  }

  // Mock grading: random score 50-100
  const score = Math.floor(Math.random() * 51) + 50;
  const feedback = "This is mock feedback. The AI grading service will replace this.";

  await db
    .update(scenarioAttempts)
    .set({
      responseText,
      score,
      aiFeedback: {
        feedback_summary: feedback,
        criteria_evaluation: [
          { criterion: "Market Analysis", score: Math.floor(score * 0.3), max_score: 30, feedback: "Mock criterion feedback" },
          { criterion: "Strategy Selection", score: Math.floor(score * 0.4), max_score: 40, feedback: "Mock criterion feedback" },
          { criterion: "Risk Assessment", score: Math.floor(score * 0.3), max_score: 30, feedback: "Mock criterion feedback" },
        ],
        total_score: score,
      },
      updatedAt: new Date(),
    })
    .where(eq(scenarioAttempts.id, attemptId));

  return {
    score,
    feedback: {
      feedback_summary: feedback,
      criteria_evaluation: [
        { criterion: "Market Analysis", score: Math.floor(score * 0.3), max_score: 30, feedback: "Mock criterion feedback" },
        { criterion: "Strategy Selection", score: Math.floor(score * 0.4), max_score: 40, feedback: "Mock criterion feedback" },
        { criterion: "Risk Assessment", score: Math.floor(score * 0.3), max_score: 30, feedback: "Mock criterion feedback" },
      ],
      total_score: score,
    },
  };
}
