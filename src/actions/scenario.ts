"use server";

import { db } from "@/lib/db";
import { scenarioAttempts, scenarios, attemptObjectives, skillObjectives, users, curriculumLevels } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, inArray, isNotNull, sql } from "drizzle-orm";
import { gradeResponse, evaluateProbing } from "@/lib/ai/client";
import { calculateXpAward } from "@/lib/game/xp";
import { awardXp } from "./gamification";
import { classifyMtss } from "@/lib/mtss/classifier";

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

        // Task #5: Call MTSS classifier after creating attempt_objectives
        try {
          for (const obj of objectives) {
            await classifyMtss((session.user as any).id, obj.id);
          }
        } catch {
          // Classification failure should not block the response
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

  // Task #7: Set finalScore = score as default
  await db
    .update(scenarioAttempts)
    .set({
      responseText,
      score,
      finalScore: score,
      aiFeedback: feedback,
      probingQuestions: feedback.probing_questions || [],
      updatedAt: new Date(),
    })
    .where(eq(scenarioAttempts.id, attemptId));

  // Task #4: Award XP after grading
  const xpResult = calculateXpAward(score);
  const xpAwardResult = await awardXp(
    (session.user as any).id,
    xpResult.total,
    "scenario_attempt",
    attemptId
  );

  // Task #6: Check level progression
  const progression = await checkLevelProgression((session.user as any).id);

  return {
    score,
    feedback,
    xpAwarded: xpResult.total,
    leveledUp: xpAwardResult.leveledUp,
    newLevel: xpAwardResult.newLevel,
    levelAdvanced: progression.advanced,
    newCurriculumLevel: progression.newLevel,
  };
}

// Task #6: Level progression check
async function checkLevelProgression(userId: string): Promise<{ advanced: boolean; newLevel?: number }> {
  try {
    // Get user's current curriculum level
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return { advanced: false };

    const currentLevel = user.currentCurriculumLevel;
    if (currentLevel >= 10) return { advanced: false };

    // Get the curriculum level record for mastery threshold and min attempts
    const [levelRecord] = await db
      .select()
      .from(curriculumLevels)
      .where(eq(curriculumLevels.levelNumber, currentLevel))
      .limit(1);
    if (!levelRecord) return { advanced: false };

    // Get all scenarios for this curriculum level
    const levelScenarios = await db
      .select({ id: scenarios.id })
      .from(scenarios)
      .where(eq(scenarios.curriculumLevelId, levelRecord.id));

    if (levelScenarios.length === 0) return { advanced: false };

    const scenarioIds = levelScenarios.map((s) => s.id);

    // Count user's graded attempts for those scenarios
    const [attemptStats] = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
        avgScore: sql<number>`cast(avg(${scenarioAttempts.score}) as integer)`,
      })
      .from(scenarioAttempts)
      .where(
        and(
          eq(scenarioAttempts.userId, userId),
          inArray(scenarioAttempts.scenarioId, scenarioIds),
          isNotNull(scenarioAttempts.score)
        )
      );

    if (!attemptStats) return { advanced: false };

    const { count, avgScore } = attemptStats;

    if (
      count >= levelRecord.minAttemptsRequired &&
      avgScore >= levelRecord.masteryThreshold
    ) {
      const newLevel = currentLevel + 1;
      await db
        .update(users)
        .set({ currentCurriculumLevel: newLevel, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return { advanced: true, newLevel };
    }

    return { advanced: false };
  } catch {
    return { advanced: false };
  }
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

    // Task #7: Compute finalScore as weighted average of initial score and probing score
    const finalScore = Math.round((attempt.score || 0) * 0.7 + result.score * 0.3);

    await db
      .update(scenarioAttempts)
      .set({
        probingResponse: response,
        probingScore: result.score,
        finalScore,
        updatedAt: new Date(),
      })
      .where(eq(scenarioAttempts.id, attemptId));

    return { score: result.score, feedback: result.feedback, finalScore };
  } catch {
    return { error: "Probing evaluation unavailable" };
  }
}
