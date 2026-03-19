import { notFound } from "next/navigation";
import { getLearnerDetail } from "@/actions/educator";
import { PageHeader } from "@/components/layout/page-header";

export default async function LearnerDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const data = await getLearnerDetail(userId);

  if (!data) notFound();

  return (
    <div>
      <PageHeader title={data.user.name} description={`Level ${data.user.level} | ${data.user.xp} XP`} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 font-medium">Skill Objectives</h3>
          <div className="space-y-2">
            {data.objectiveBreakdown.map((obj) => (
              <div key={obj.code} className="flex items-center justify-between text-sm">
                <span>{obj.code}: {obj.name}</span>
                <span className={`font-bold ${obj.tier === 3 ? "text-red-500" : obj.tier === 2 ? "text-amber-500" : "text-green-500"}`}>
                  {obj.tier ? `T${obj.tier}` : "—"} ({obj.avgScore?.toFixed(0) || "N/A"}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 font-medium">Recent Attempts</h3>
          {data.recentAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attempts yet</p>
          ) : (
            <div className="space-y-2">
              {data.recentAttempts.map((a) => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
                  <span className="font-mono">{a.score || "—"}/100</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
