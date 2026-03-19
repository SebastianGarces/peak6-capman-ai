import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { curriculumLevels, skillObjectives, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { CurriculumMap } from "@/components/game/curriculum-map";

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  // Fetch user to get current curriculum level
  const [user] = await db
    .select({ currentCurriculumLevel: users.currentCurriculumLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) redirect("/login");

  // Fetch all curriculum levels
  const levels = await db.select().from(curriculumLevels).orderBy(curriculumLevels.levelNumber);

  // Fetch objective counts per level
  const objectiveCounts = await db
    .select({
      curriculumLevelId: skillObjectives.curriculumLevelId,
      count: count(),
    })
    .from(skillObjectives)
    .groupBy(skillObjectives.curriculumLevelId);

  const countMap = new Map(objectiveCounts.map((r) => [r.curriculumLevelId, Number(r.count)]));

  const levelsWithCounts = levels.map((level) => ({
    id: level.id,
    levelNumber: level.levelNumber,
    name: level.name,
    description: level.description,
    objectiveCount: countMap.get(level.id) ?? 0,
    masteryThreshold: level.masteryThreshold,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Curriculum"
        description="Progress through levels to master options trading concepts."
        icon={BookOpen}
      />
      <CurriculumMap
        levels={levelsWithCounts}
        currentLevel={user.currentCurriculumLevel}
      />
    </div>
  );
}
