import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { curriculumLevels, skillObjectives, scenarios, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { ScenarioCard } from "@/components/trading/scenario-card";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default async function LevelDetailPage({ params }: PageProps) {
  const { levelId } = await params;

  const levelIdNum = parseInt(levelId, 10);
  if (isNaN(levelIdNum)) {
    redirect("/learn");
  }

  const session = await auth();
  const userId = (session?.user as any)?.id;

  // Fetch user's current curriculum level
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

  // Fetch level info
  const [level] = await db
    .select()
    .from(curriculumLevels)
    .where(eq(curriculumLevels.id, levelIdNum))
    .limit(1);

  if (!level) {
    redirect("/learn");
  }

  // Check if user has unlocked this level
  if (level.levelNumber > currentCurriculumLevel) {
    redirect("/learn");
  }

  // Fetch skill objectives for this level
  const objectives = await db
    .select()
    .from(skillObjectives)
    .where(eq(skillObjectives.curriculumLevelId, levelIdNum));

  // Fetch active scenarios for this level
  const levelScenarios = await db
    .select()
    .from(scenarios)
    .where(and(eq(scenarios.curriculumLevelId, levelIdNum), eq(scenarios.isActive, true)));

  return (
    <div>
      <nav className="mb-4 text-sm text-muted-foreground">
        <a href="/learn" className="hover:text-foreground">
          Learn
        </a>
        {" > "}
        <span className="text-foreground">
          Level {level.levelNumber}: {level.name}
        </span>
      </nav>

      <PageHeader
        title={`Level ${level.levelNumber}: ${level.name}`}
        description={level.description}
      />

      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span>Mastery Threshold: {level.masteryThreshold}%</span>
        <span>Min Attempts: {level.minAttemptsRequired}</span>
      </div>

      {/* Skill Objectives */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Skill Objectives</h2>
        {objectives.length === 0 ? (
          <p className="text-sm text-muted-foreground">No objectives for this level.</p>
        ) : (
          <ul className="space-y-2">
            {objectives.map((obj) => (
              <li
                key={obj.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                    {obj.code}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{obj.name}</p>
                    <p className="text-xs text-muted-foreground">{obj.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Scenarios */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Available Scenarios</h2>
        {levelScenarios.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No scenarios available yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scenarios are generated periodically. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {levelScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                id={scenario.id}
                levelId={levelIdNum}
                difficulty={scenario.difficulty}
                marketRegime={scenario.marketRegime}
                targetObjectives={scenario.targetObjectives as string[]}
                scenarioText={scenario.scenarioText}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
