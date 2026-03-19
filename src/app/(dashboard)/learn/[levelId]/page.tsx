import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, Target, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { curriculumLevels, skillObjectives, scenarios, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ScenarioCard } from "@/components/trading/scenario-card";

export default async function LevelDetailPage(props: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await props.params;
  const levelNumber = parseInt(levelId, 10);

  if (isNaN(levelNumber)) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  // Fetch user to check access
  const [user] = await db
    .select({ currentCurriculumLevel: users.currentCurriculumLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) redirect("/login");

  // Redirect if level is locked
  if (levelNumber > user.currentCurriculumLevel) {
    redirect("/learn");
  }

  // Fetch the curriculum level
  const [level] = await db
    .select()
    .from(curriculumLevels)
    .where(eq(curriculumLevels.levelNumber, levelNumber))
    .limit(1);

  if (!level) notFound();

  // Fetch skill objectives for this level
  const objectives = await db
    .select()
    .from(skillObjectives)
    .where(eq(skillObjectives.curriculumLevelId, level.id))
    .orderBy(skillObjectives.code);

  // Fetch active scenarios for this level
  const activeScenarios = await db
    .select()
    .from(scenarios)
    .where(
      and(
        eq(scenarios.curriculumLevelId, level.id),
        eq(scenarios.isActive, true),
      ),
    )
    .orderBy(scenarios.difficulty);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Curriculum</span>
        </Link>
      </div>

      <PageHeader
        title={level.name}
        description={`Level ${level.levelNumber}`}
        icon={BookOpen}
      />

      {/* Level description */}
      <div className="mb-8 rounded-2xl border border-surface-border bg-surface p-6">
        <p className="text-sm text-text-muted leading-relaxed">{level.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-text-dim">
          <span>
            Mastery threshold:{" "}
            <span className="font-semibold text-green font-mono">
              {level.masteryThreshold}%
            </span>
          </span>
          <span>
            Min attempts:{" "}
            <span className="font-semibold text-amber font-mono">
              {level.minAttemptsRequired}
            </span>
          </span>
        </div>
      </div>

      {/* Skill objectives */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Skill Objectives
          </h2>
          <Badge variant="default">{objectives.length}</Badge>
        </div>

        {objectives.length === 0 ? (
          <p className="text-sm text-text-dim">No objectives defined for this level yet.</p>
        ) : (
          <div className="space-y-3">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className="flex items-start gap-4 rounded-xl border border-surface-border bg-surface p-4"
              >
                <span className="inline-flex items-center rounded-md bg-lavender-muted border border-lavender/20 px-2.5 py-1 text-xs font-mono font-bold text-lavender flex-shrink-0">
                  {obj.code}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{obj.name}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    {obj.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scenarios */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Scenarios
          </h2>
          <Badge variant="default">{activeScenarios.length}</Badge>
        </div>

        {activeScenarios.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
            <FileText className="h-10 w-10 text-text-dim mx-auto mb-3" />
            <p className="text-sm font-semibold text-text-muted">
              No scenarios available for this level yet.
            </p>
            <p className="text-xs text-text-dim mt-1">
              Check back soon — new scenarios are generated regularly.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                id={scenario.id}
                levelId={levelNumber}
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
