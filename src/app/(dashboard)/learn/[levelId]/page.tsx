import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { curriculumLevels, skillObjectives, scenarios, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { ScenarioCard } from "@/components/trading/scenario-card";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

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
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-foreground transition-colors">
          Learn
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-primary">
          Level {level.levelNumber}: {level.name}
        </span>
      </nav>

      {/* Level hero section */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {level.levelNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{level.name}</h1>
          <p className="mt-1 text-muted-foreground">{level.description}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Mastery threshold: {level.masteryThreshold}%
            </span>
            <Progress
              value={level.masteryThreshold}
              className="w-32"
            >
              <ProgressTrack className="h-1.5">
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
            <span className="text-xs text-muted-foreground">
              Min attempts: {level.minAttemptsRequired}
            </span>
          </div>
        </div>
      </div>

      {/* Skill Objectives */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Skill Objectives</h2>
        {objectives.length === 0 ? (
          <p className="text-sm text-muted-foreground">No objectives for this level.</p>
        ) : (
          <ul className="space-y-2">
            {objectives.map((obj) => (
              <li key={obj.id} className="glass-card rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="font-mono shrink-0">
                    {obj.code}
                  </Badge>
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
