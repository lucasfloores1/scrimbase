import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { playersApi } from "@/shared/api/players.api";
import { useTeamId } from "@/shared/hooks/useTeam";
import { errorMessage, formatPercent, formatRelative, outcomeLabel } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { RoleBadge } from "@/shared/ui/data/RoleBadge";
import { StatTile } from "@/shared/ui/data/StatTile";
import { RecordBar } from "@/shared/ui/data/RecordBar";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { AgentChip } from "@/shared/ui/valorant/AgentChip";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { cn } from "@/lib/utils";

/**
 * Aporte de un integrante dentro del equipo. Es una vista secundaria: se llega
 * desde el roster, no desde el dashboard, que es puramente grupal.
 */
export default function PlayerStatsPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const teamId = useTeamId();

  const query = useQuery({
    queryKey: ["playerStats", teamId, userId],
    queryFn: () => playersApi.stats(teamId!, userId!),
    enabled: !!teamId && !!userId,
  });

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/app/team">
        <ArrowLeft data-icon="inline-start" />
        Equipo
      </Link>
    </Button>
  );

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <LoadingState variant="page" rows={4} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6">
        {back}
        <ErrorState
          title="No se pudieron cargar las estadísticas"
          description={errorMessage(query.error)}
          actionLabel="Volver al equipo"
          onAction={() => navigate("/app/team")}
        />
      </div>
    );
  }

  const { player, overview, last10, agents, maps, recentScrims } = query.data;

  return (
    <div className="space-y-6">
      {back}

      <PageHeader
        title={player.user.username}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <RoleBadge role={player.role} isAdmin={player.isAdmin} />
            {player.user.riotId ? <span>{player.user.riotId}</span> : null}
          </span>
        }
      />

      {overview.matches === 0 ? (
        <EmptyState title="Sin partidas todavía" description="Cuando aparezca en una scrim cargada, vas a ver su aporte acá." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Partidas"
              value={overview.matches}
              hint={
                <span className="space-y-2">
                  <RecordBar wins={overview.wins} losses={overview.losses} draws={overview.draws} />
                  <span className="block">
                    {overview.wins}V · {overview.losses}D · {formatPercent(overview.winrate)} winrate
                  </span>
                </span>
              }
            />
            <StatTile label="ACS promedio" value={overview.avgAcs} tone="amber" hint="por partida" />
            <StatTile
              label="K / D / A promedio"
              value={`${overview.avgKills} / ${overview.avgDeaths} / ${overview.avgAssists}`}
              hint={`K/D ${overview.kd}`}
            />
            <StatTile
              label="Últimas 10"
              value={`${last10.wins}-${last10.losses}${last10.draws ? `-${last10.draws}` : ""}`}
              hint={`ACS ${last10.avgAcs} · K/D ${last10.kd}`}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="surface p-4 md:p-5">
              <h2 className="eyebrow mb-4">Agentes</h2>
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos.</p>
              ) : (
                <ul className="space-y-2.5">
                  {agents.slice(0, 6).map((a) => (
                    <li key={a.name} className="flex items-center gap-3">
                      <AgentChip agent={a.name} className="w-28 justify-center" />
                      <span className="flex-1 text-xs text-muted-foreground">
                        {a.matches} {a.matches === 1 ? "partida" : "partidas"} · ACS {a.avgAcs} · K/D {a.kd}
                      </span>
                      <span className="num w-12 shrink-0 text-right text-sm text-amber">{a.winrate.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="surface p-4 md:p-5">
              <h2 className="eyebrow mb-4">Mapas</h2>
              {maps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos.</p>
              ) : (
                <ul className="space-y-2">
                  {maps.slice(0, 6).map((m) => (
                    <li key={m.name} className="surface-2 flex items-center gap-3 p-2">
                      <MapImage map={m.name} variant="strip" className="h-8 w-14 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-sm">{m.name}</span>
                      <span className="text-xs text-muted-foreground">ACS {m.avgAcs}</span>
                      <span className="num w-12 shrink-0 text-right text-sm text-amber">{m.winrate.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="space-y-3">
            <h2 className="eyebrow">Últimas partidas</h2>
            <div className="surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-xs tracking-wider text-muted-foreground uppercase">
                      <th className="px-4 py-2.5 text-left font-medium">Partida</th>
                      <th className="px-4 py-2.5 text-left font-medium">Agente</th>
                      <th className="px-3 py-2.5 text-right font-medium">K/D/A</th>
                      <th className="px-4 py-2.5 text-right font-medium">ACS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScrims.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2.5">
                          <Link to={`/app/scrims/${s.id}`} className="hover:text-amber">
                            <span
                              className={cn(
                                "font-display text-xs tracking-wider uppercase",
                                s.outcome === "WIN" ? "text-win" : s.outcome === "LOSS" ? "text-loss" : "text-draw"
                              )}
                            >
                              {outcomeLabel(s.outcome)}
                            </span>
                            <span className="ml-2">
                              {s.map} vs {s.opponentName}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">{formatRelative(s.createdAt)}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          <AgentChip agent={s.agent} />
                        </td>
                        <td className="num px-3 py-2.5 text-right text-base">
                          {s.kills}/{s.deaths}/{s.assists}
                        </td>
                        <td className="num px-4 py-2.5 text-right text-base text-amber">{s.acs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
