import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/shared/api/dashboard.api";
import type { DashboardResponseDto, ScrimOutcome } from "@/shared/types/dto";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { OutcomePill } from "@/shared/ui/OutcomePill";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { Plus } from "lucide-react";

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, percent));
}

function formatPercent(value: number): string {
  return `${clampPercent(value).toFixed(0)}%`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function DashboardPage() {
  const navigate = useNavigate();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.myTeamDashboard,
    staleTime: 30_000,
  });

  if (dashboardQuery.isLoading) {
    return <LoadingState title="Loading overview" description="Pulling team performance…" />;
  }

  if (dashboardQuery.isError) {
    const message =
      dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Unexpected error";
    return (
      <ErrorState
        title="Could not load dashboard"
        description={message}
        actionLabel="Retry"
        onAction={() => dashboardQuery.refetch()}
      />
    );
  }

  const data = dashboardQuery.data as DashboardResponseDto;
  const teamName = data?.team?.name ?? "Team";
  const teamTag = data?.team?.tag;
  const overview = data?.overview;
  const bestMap = data?.bestMap ?? null;
  const recentScrims = Array.isArray(data?.recentScrims) ? data.recentScrims : [];
  const winrate = typeof overview?.winrate === "number" ? overview.winrate : 0;
  const totalScrims = typeof overview?.total === "number" ? overview.total : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={teamTag ? `${teamName} · ${teamTag}` : teamName}
        description="Practice pulse for your roster."
        actions={
          <Button className="gap-1.5" onClick={() => navigate("/app/scrims/new")}>
            <Plus className="h-4 w-4" />
            Upload scrim
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Winrate", value: formatPercent(winrate), hint: "All recorded scrims" },
          { label: "Scrims", value: String(totalScrims), hint: "Logged matches" },
          {
            label: "Best map",
            value: bestMap?.name ?? "—",
            hint: bestMap ? `${formatPercent(bestMap.winrate)} · ${bestMap.matches} matches` : "Need more data",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-surface px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold tracking-tight">Recent scrims</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/scrims")}>
            View all
          </Button>
        </div>

        {recentScrims.length === 0 ? (
          <EmptyState
            title="No scrims yet"
            description="Upload a scoreboard to start building your history."
            actionLabel="Upload scrim"
            onAction={() => navigate("/app/scrims/new")}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Map</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {recentScrims.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/scrims/${s.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{s.map}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{s.type}</td>
                    <td className="px-4 py-3">
                      <OutcomePill outcome={s.outcome as ScrimOutcome} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {s.teamRounds}–{s.enemyRounds}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
