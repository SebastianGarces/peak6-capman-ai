import { db } from "@/lib/db";
import { curriculumLevels, skillObjectives, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { CurriculumMap } from "@/components/game/curriculum-map";

export default async function LearnPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  // Fetch current user's curriculum level
  let currentCurriculumLevel = 1;
  if (userId) {
    const [user] = await db
      .select({ currentCurriculumLevel: users.currentCurriculumLevel })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user) {
      currentCurriculumLevel = user.currentCurriculumLevel;
    }
  }

  // Fetch all curriculum levels with objective count
  const levels = await db
    .select({
      id: curriculumLevels.id,
      levelNumber: curriculumLevels.levelNumber,
      name: curriculumLevels.name,
      description: curriculumLevels.description,
      objectiveCount: sql<number>`count(${skillObjectives.id})::int`,
    })
    .from(curriculumLevels)
    .leftJoin(skillObjectives, eq(skillObjectives.curriculumLevelId, curriculumLevels.id))
    .groupBy(
      curriculumLevels.id,
      curriculumLevels.levelNumber,
      curriculumLevels.name,
      curriculumLevels.description,
    )
    .orderBy(curriculumLevels.levelNumber);

  return (
    <div>
      <PageHeader
        title="Curriculum Map"
        description="Progress through levels to master options trading."
      />
      <CurriculumMap levels={levels} currentLevel={currentCurriculumLevel} />
    </div>
  );
}
