import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { challenges, scenarios } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ChallengeRoom } from "@/components/challenge/challenge-room";

export default async function ChallengeRoomPage(props: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await props.params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch challenge and its scenario from DB
  const [challenge] = await db
    .select({ scenarioId: challenges.scenarioId, status: challenges.status })
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  if (!challenge) notFound();

  const [scenario] = await db
    .select({
      id: scenarios.id,
      scenarioText: scenarios.scenarioText,
      questionPrompt: scenarios.questionPrompt,
      marketData: scenarios.marketData,
      difficulty: scenarios.difficulty,
    })
    .from(scenarios)
    .where(eq(scenarios.id, challenge.scenarioId))
    .limit(1);

  const scenarioData = scenario
    ? {
        id: scenario.id,
        scenario_text: scenario.scenarioText,
        question_prompt: scenario.questionPrompt,
        market_data: scenario.marketData,
        difficulty: scenario.difficulty,
      }
    : null;

  const userId = (session.user as any).id as string;

  return (
    <ChallengeRoom
      challengeId={challengeId}
      initialScenario={scenarioData}
      userId={userId}
    />
  );
}
