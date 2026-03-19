import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scenarios, curriculumLevels, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ScenarioAttempt } from "./scenario-attempt";

export default async function ScenarioPage(props: {
  params: Promise<{ levelId: string; scenarioId: string }>;
}) {
  const { levelId, scenarioId } = await props.params;
  const levelNumber = parseInt(levelId, 10);
  if (isNaN(levelNumber)) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  // Verify user access
  const [user] = await db
    .select({ currentCurriculumLevel: users.currentCurriculumLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) redirect("/login");
  if (levelNumber > user.currentCurriculumLevel) redirect("/learn");

  // Fetch scenario
  const [scenario] = await db
    .select()
    .from(scenarios)
    .where(eq(scenarios.id, scenarioId))
    .limit(1);

  if (!scenario) notFound();
  if (!scenario.isActive) notFound();

  // Fetch level for breadcrumb
  const [level] = await db
    .select({ name: curriculumLevels.name })
    .from(curriculumLevels)
    .where(eq(curriculumLevels.levelNumber, levelNumber))
    .limit(1);

  return (
    <ScenarioAttempt
      scenario={{
        id: scenario.id,
        scenarioText: scenario.scenarioText,
        questionPrompt: scenario.questionPrompt,
        marketData: (scenario.marketData as Record<string, unknown>) ?? {},
        difficulty: scenario.difficulty,
        marketRegime: scenario.marketRegime,
        curriculumLevelId: scenario.curriculumLevelId,
      }}
      levelNumber={levelNumber}
      levelName={level?.name ?? `Level ${levelNumber}`}
    />
  );
}
