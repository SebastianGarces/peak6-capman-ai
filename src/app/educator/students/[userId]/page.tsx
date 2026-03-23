import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getLearnerDetail } from "@/actions/educator";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function LearnerDetailPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;
  const detail = await getLearnerDetail(userId);

  if (!detail) notFound();

  const { user, objectiveBreakdown, recentAttempts } = detail;

  function tierBadgeVariant(tier: number | null): "green" | "amber" | "red" | "default" {
    if (tier === 1) return "green";
    if (tier === 2) return "amber";
    if (tier === 3) return "red";
    return "default";
  }

  function scoreColor(score: number | null) {
    if (score == null) return "text-text-dim";
    if (score >= 0.7) return "text-green";
    if (score >= 0.5) return "text-amber";
    return "text-red";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/educator"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-amber transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to MTSS Dashboard
      </Link>

      <PageHeader title={user.name} description={`Learner detail — Level ${user.level}`} />

      {/* User info card */}
      <div className="rounded-xl bg-surface border border-surface-border p-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Profile
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-text-dim">Name</p>
            <p className="mt-1 font-semibold text-text">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-dim">Email</p>
            <p className="mt-1 text-sm text-text-muted break-all">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-text-dim">Level</p>
            <p className="mt-1 font-mono font-bold text-amber text-lg">{user.level}</p>
          </div>
          <div>
            <p className="text-xs text-text-dim">Total XP</p>
            <p className="mt-1 font-mono font-bold text-amber text-lg">
              {user.xp.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Objectives table */}
      <div className="rounded-xl bg-surface border border-surface-border overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-text">Skill Objectives</h2>
          <p className="text-xs text-text-muted mt-0.5">MTSS tier classification per objective</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="px-5 py-3 font-semibold text-text-muted">Code</th>
                <th className="px-5 py-3 font-semibold text-text-muted">Name</th>
                <th className="px-5 py-3 font-semibold text-text-muted text-center">Tier</th>
                <th className="px-5 py-3 font-semibold text-text-muted text-right">Avg Score</th>
                <th className="px-5 py-3 font-semibold text-text-muted text-right">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {objectiveBreakdown.map((obj, i) => (
                <tr
                  key={obj.code}
                  className={cn(
                    "border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors",
                    i % 2 === 1 && "bg-bg/40"
                  )}
                >
                  <td className="px-5 py-3 font-mono text-xs text-text-muted">{obj.code}</td>
                  <td className="px-5 py-3 text-text">{obj.name}</td>
                  <td className="px-5 py-3 text-center">
                    {obj.tier != null ? (
                      <Badge variant={tierBadgeVariant(obj.tier)}>
                        Tier {obj.tier}
                      </Badge>
                    ) : (
                      <span className="text-text-dim text-xs">—</span>
                    )}
                  </td>
                  <td className={cn("px-5 py-3 text-right font-mono text-sm font-semibold", scoreColor(obj.avgScore))}>
                    {obj.avgScore != null ? `${Math.round(obj.avgScore * 100)}%` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-sm text-text-muted">
                    {obj.attemptCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent attempts */}
      <div className="rounded-xl bg-surface border border-surface-border p-5">
        <h2 className="font-semibold text-text mb-4">Recent Attempts</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-text-muted">No attempts recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentAttempts.map((attempt) => {
              const score = attempt.score ?? 0;
              const pct = Math.round(score * 100);
              const color =
                pct >= 70 ? "text-green" : pct >= 50 ? "text-amber" : "text-red";
              const barColor =
                pct >= 70 ? "bg-green" : pct >= 50 ? "bg-amber" : "bg-red";

              return (
                <div
                  key={attempt.id}
                  className="flex items-center gap-4 py-2 border-b border-surface-border last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} opacity-80`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn("font-mono text-sm font-bold w-12 text-right", color)}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-text-dim whitespace-nowrap">
                    {attempt.createdAt
                      ? new Date(attempt.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
