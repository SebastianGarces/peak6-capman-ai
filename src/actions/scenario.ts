"use server";

import { db } from "@/lib/db";
import { scenarioAttempts, scenarios, attemptObjectives, skillObjectives } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { gradeResponse, evaluateProbing } from "@/lib/ai/client";

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

  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  // Get the attempt and scenario
  const [attempt] = await db.select().from(scenarioAttempts).where(eq(scenarioAttempts.id, attemptId)).limit(1);
  if (!attempt) return { error: "Attempt not found" };

  const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, attempt.scenarioId)).limit(1);

  let score: number;
  let feedback: any;

  try {
    // Try real AI grading
    const gradingResult = await gradeResponse({
      scenarioId: attempt.scenarioId,
      scenarioText: scenario?.scenarioText || "",
      rubric: (scenario?.rubric as Record<string, unknown>) || {},
      studentResponse: responseText,
    });

    score = gradingResult.total_score;
    feedback = gradingResult;

    // Create attempt_objectives rows from grading response
    if (gradingResult.skill_objectives_demonstrated?.length > 0 || gradingResult.skill_objectives_failed?.length > 0) {
      const allObjCodes = [
        ...gradingResult.skill_objectives_demonstrated,
        ...gradingResult.skill_objectives_failed,
      ];

      if (allObjCodes.length > 0) {
        const objectives = await db
          .select()
          .from(skillObjectives)
          .where(inArray(skillObjectives.code, allObjCodes));

        for (const obj of objectives) {
          const demonstrated = gradingResult.skill_objectives_demonstrated.includes(obj.code);
          await db.insert(attemptObjectives).values({
            attemptId,
            objectiveId: obj.id,
            score: demonstrated ? score : Math.floor(score * 0.3),
            demonstrated,
          });
        }
      }
    }
  } catch {
    // Fall back to mock grading
    score = Math.floor(Math.random() * 51) + 50;
    feedback = {
      feedback_summary: "AI grading unavailable. Mock score assigned.",
      criteria_evaluation: [],
      total_score: score,
      probing_questions: [],
    };
  }

  await db
    .update(scenarioAttempts)
    .set({
      responseText,
      score,
      aiFeedback: feedback,
      probingQuestions: feedback.probing_questions || [],
      updatedAt: new Date(),
    })
    .where(eq(scenarioAttempts.id, attemptId));

  return { score, feedback };
}

export async function submitProbingResponse(
  attemptId: string,
  questionIndex: number,
  response: string
) {
  if (!response.trim()) return { error: "Response cannot be empty" };

  const [attempt] = await db.select().from(scenarioAttempts).where(eq(scenarioAttempts.id, attemptId)).limit(1);
  if (!attempt) return { error: "Attempt not found" };

  const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, attempt.scenarioId)).limit(1);
  const questions = (attempt.probingQuestions as string[]) || [];
  const question = questions[questionIndex];

  if (!question) return { error: "Invalid question index" };

  try {
    const result = await evaluateProbing({
      originalScenario: scenario?.scenarioText || "",
      originalResponse: attempt.responseText,
      probingQuestion: question,
      probingResponse: response,
    });

    await db
      .update(scenarioAttempts)
      .set({
        probingResponse: response,
        probingScore: result.score,
        updatedAt: new Date(),
      })
      .where(eq(scenarioAttempts.id, attemptId));

    return { score: result.score, feedback: result.feedback };
  } catch {
    return { error: "Probing evaluation unavailable" };
  }
}
