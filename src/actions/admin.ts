"use server";

import { db } from "@/lib/db";
import { curriculumLevels, skillObjectives, scenarios } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth/utils";
import { generateScenario } from "@/lib/ai/client";

export async function generateScenariosForLevel(
  levelId: number,
  count: number = 3,
) {
  const session = await auth();
  requireRole(session, "educator");

  // Look up the curriculum level by levelNumber
  const [level] = await db
    .select()
    .from(curriculumLevels)
    .where(eq(curriculumLevels.levelNumber, levelId))
    .limit(1);

  if (!level) {
    return { generated: 0, errors: [`Curriculum level ${levelId} not found`] };
  }

  // Get skill objectives for this level
  const objectives = await db
    .select()
    .from(skillObjectives)
    .where(eq(skillObjectives.curriculumLevelId, level.id));

  const objectiveCodes = objectives.map((o) => o.code);

  if (objectiveCodes.length === 0) {
    return {
      generated: 0,
      errors: [`No skill objectives found for level ${levelId}`],
    };
  }

  const marketRegimes = [
    "bull_quiet",
    "bull_volatile",
    "bear_quiet",
    "bear_volatile",
    "sideways",
  ];

  let generated = 0;
  const errors: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const difficulty = Math.min(levelId * 2, 10);
      const regime = marketRegimes[i % marketRegimes.length];

      const result = await generateScenario({
        curriculumLevel: levelId,
        difficulty,
        marketRegime: regime,
        targetObjectives: objectiveCodes,
      });

      await db.insert(scenarios).values({
        curriculumLevelId: level.id,
        scenarioText: result.scenario_text,
        questionPrompt: result.question_prompt,
        marketData: result.market_data,
        rubric: result.rubric,
        targetObjectives: result.target_objectives,
        difficulty,
        marketRegime: regime,
        generatedBy: "ai",
        isActive: true,
        qualityScore: null,
      });

      generated++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Scenario ${i + 1}: ${message}`);
    }
  }

  return { generated, errors };
}
