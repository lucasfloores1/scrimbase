import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { playersApi } from "@/shared/api/players.api";
import type { PlayerStatsResponseDto, ScrimOutcome } from "@/shared/types/dto";
import type { TeamRole } from "@/shared/types/models";
import { PageHeader } from "@/shared/ui/PageHeader";
import { OutcomePill } from "@/shared/ui/OutcomePill";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { Button } from "@/components/ui/button";

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

function roleLabel(role: TeamRole, isAdmin: boolean) {
  if (isAdmin) return "Admin";
  if (role === "MANAGER") return "Manager";
  if (role === "COACH") return "Coach";
  return "Player";
}

export function PlayerStatsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId;

  const query = useQuery({
    queryKey: ["playerStats", teamId, userId],
    queryFn: () => playersApi.getStats(teamId!, userId!),
    enabled: Boolean(teamId && userId),
  });

  if (!teamId) {
    return <EmptyState title="No team" description="Join a team to see player stats." />;
  }

  if (query.isLoading) {
    return <LoadingState title="Loading player" description="Pulling roster stats…" />;
  }

  if (query.isError || !query.data) {
    const message = query.error instanceof Error ? query.error.message : "Unexpected error";
    return (
      <ErrorState
        title="Could not load player"
        description={message}
        actionLabel="Back to roster"
        onAction={() => navigate("/app/team")}
      />
    );
  }

  const data = query.data as PlayerStatsResponseDto;
  const username = data.player.user?.username ?? "Unknown player";
  const riotId = data.player.user?.riotId;
  const overview = data.overview;
  const last10 = data.last10;
  const hasMatches = overview.matches > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Player"
        title={username}
        description={
          riotId
            ? `${riotId} · ${roleLabel(data.player.role, data.player.isAdmin)} on this roster.`
            : `${roleLabel(data.player.role, data.player.isAdmin)} on this roster.`
        }
        actions={
          <Button variant="outline" onClick={() => navigate("/app/team")}>
            Back to roster
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "ACS",
            value: hasMatches ? overview.avgAcs.toFixed(1) : "—",
            hint: hasMatches ? `${overview.avgKills}/${overview.avgDeaths}/${overview.avgAssists} avg` : "No matched games",
          },
          {
            label: "K/D",
            value: hasMatches ? overview.kd.toFixed(2) : "—",
            hint: hasMatches ? `${overview.kills}K · ${overview.deaths}D` : "Needs linked stats",
          },
          {
            label: "Winrate",
            value: hasMatches ? formatPercent(overview.winrate) : "—",
            hint: last10.matches
              ? `Last 10 · ${formatPercent(last10.winrate)}`
              : "Team result in their games",
          },
          {
            label: "Matches",
            value: String(overview.matches),
            hint: `${overview.wins}W · ${overview.losses}L · ${overview.draws}D`,
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

      {!hasMatches ? (
        <EmptyState
          title="No stats yet"
          description="This teammate has no scoreboard rows linked to their account. Match Riot IDs when uploading scrims."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-display text-sm font-semibold tracking-tight">Agents</h2>
              </div>
              {data.agents.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No agent data.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium text-right">G</th>
                      <th className="px-4 py-3 font-medium text-right">WR</th>
                      <th className="px-4 py-3 font-medium text-right">ACS</th>
                      <th className="px-4 py-3 font-medium text-right">K/D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agents.map((agent) => (
                      <tr key={agent.name} className="border-b border-border/70 last:border-0">
                        <td className="px-4 py-3 font-medium">{agent.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{agent.matches}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPercent(agent.winrate)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{agent.avgAcs.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{agent.kd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-display text-sm font-semibold tracking-tight">Maps</h2>
              </div>
              {data.maps.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No map data.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Map</th>
                      <th className="px-4 py-3 font-medium text-right">G</th>
                      <th className="px-4 py-3 font-medium text-right">WR</th>
                      <th className="px-4 py-3 font-medium text-right">ACS</th>
                      <th className="px-4 py-3 font-medium text-right">K/D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.maps.map((map) => (
                      <tr key={map.name} className="border-b border-border/70 last:border-0">
                        <td className="px-4 py-3 font-medium">{map.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{map.matches}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPercent(map.winrate)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{map.avgAcs.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{map.kd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-sm font-semibold tracking-tight">Recent games</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Map</th>
                    <th className="px-4 py-3 font-medium">vs</th>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium">Agent</th>
                    <th className="px-4 py-3 font-medium text-right">KDA</th>
                    <th className="px-4 py-3 font-medium text-right">ACS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentScrims.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border/70 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/app/scrims/${s.id}`)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{s.map}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {s.opponentName}
                      </td>
                      <td className="px-4 py-3">
                        <OutcomePill outcome={s.outcome as ScrimOutcome} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{s.agent}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {s.kills}/{s.deaths}/{s.assists}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{s.acs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default PlayerStatsPage;
