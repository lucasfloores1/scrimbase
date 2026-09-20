import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";

import { dashboardApi } from "@/shared/api/dashboard.api";
import { useScrims } from "@/shared/hooks/useScrims";
import { useMyTeam } from "@/shared/hooks/useTeam";
import { errorMessage, formatDate, formatPercent, formatSigned, outcomeLabel, scrimTypeLabel } from "@/shared/lib/format";
import {
  currentStreak,
  enemyAgentFrequency,
  mapBreakdown,
  opponentBreakdown,
  roundDiffSeries,
  roundsWonPct,
  sortByDateDesc,
} from "@/features/team/lib/stats";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { TiltCard } from "@/shared/ui/three/TiltCard";
import { AgentChip } from "@/shared/ui/valorant/AgentChip";
import { ScrimRow } from "@/shared/ui/data/ScrimRow";
import { StatTile } from "@/shared/ui/data/StatTile";
import { RecordBar } from "@/shared/ui/data/RecordBar";
import { Donut } from "@/shared/ui/data/Donut";
import { Sparkline } from "@/shared/ui/data/Sparkline";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { QuotaBanner } from "@/features/billing/components/QuotaBanner";
import { UpgradeDialog } from "@/features/billing/components/UpgradeDialog";
import { quotaExhausted, useSubscription } from "@/shared/hooks/useSubscription";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { cn } from "@/lib/utils";

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="eyebrow">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const team = useMyTeam();

  const { subscription, enforced } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.myTeamDashboard, staleTime: 30_000 });
  const scrims = useScrims();

  const sorted = useMemo(() => sortByDateDesc(scrims.data ?? []), [scrims.data]);
  const byMap = useMemo(() => mapBreakdown(sorted), [sorted]);
  const byOpponent = useMemo(() => opponentBreakdown(sorted), [sorted]);
  const enemyAgents = useMemo(() => enemyAgentFrequency(sorted), [sorted]);
  const streak = useMemo(() => currentStreak(sorted), [sorted]);
  const trend = useMemo(() => roundDiffSeries(sorted), [sorted]);
  const roundsPct = useMemo(() => roundsWonPct(sorted), [sorted]);
  const last = sorted[0];

  if (dashboard.isLoading || scrims.isLoading) return <LoadingState variant="page" />;

  if (dashboard.isError || scrims.isError) {
    return (
      <ErrorState
        title="No se pudo cargar el dashboard"
        description={errorMessage(dashboard.error ?? scrims.error)}
        actionLabel="Reintentar"
        onAction={() => {
          dashboard.refetch();
          scrims.refetch();
        }}
      />
    );
  }

  const data = dashboard.data!;
  const overview = data.overview;
  const total = overview?.total ?? 0;

  if (total === 0 || !last) {
    return (
      <div className="space-y-8">
        <PageHeader title="Dashboard" description={data.team ? `${data.team.name} · #${data.team.tag}` : undefined} />
        <EmptyState
          title="Empezá con la primera scrim"
          description="Subí la captura del scoreboard y el dashboard se arma solo."
          actionLabel="Subir scrim"
          onAction={() => navigate("/app/scrims/new")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description={
          <span className="inline-flex flex-wrap items-center gap-x-2">
            <span className="text-foreground">{data.team?.name}</span>
            <span className="text-amber">#{data.team?.tag}</span>
            <span>· {total} {total === 1 ? "partida" : "partidas"}</span>
          </span>
        }
        actions={
          <Button onClick={() => navigate("/app/scrims/new")}>
            <Plus data-icon="inline-start" />
            Subir scrim
          </Button>
        }
      />

      {enforced && quotaExhausted(subscription) ? (
        <QuotaBanner subscription={subscription} onUpgrade={() => setUpgradeOpen(true)} />
      ) : null}

      {/* Última partida: el mapa manda, los equipos son nombres */}
      <TiltCard max={4} className="rise">
        <Link
          to={`/app/scrims/${last.id}`}
          className="surface relative block overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
        >
        <MapImage map={last.map} variant="splash" className="absolute inset-0 opacity-40" eager />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/90 to-surface-1/35" aria-hidden="true" />
        <div className="layer-lift relative flex flex-col gap-5 p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Última partida</p>
            <p className="text-xs text-muted-foreground">
              {scrimTypeLabel(last.type)} · {formatDate(last.createdAt, "short")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-display text-xl font-semibold tracking-tight md:text-2xl">
              {team.data?.name ?? "Nosotros"}
            </span>
            <span className="num flex items-baseline gap-3 text-5xl md:text-6xl">
              <span className={cn(last.outcome === "WIN" && "text-win", last.outcome === "LOSS" && "text-loss")}>
                {last.teamRounds}
              </span>
              <span className="text-muted-foreground/50">:</span>
              <span className={cn(last.outcome === "LOSS" && "text-win", last.outcome === "WIN" && "text-loss")}>
                {last.enemyRounds}
              </span>
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-muted-foreground md:text-2xl">
              {last.opponentName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span
              className={cn(
                "font-display text-xs tracking-[0.16em] uppercase",
                last.outcome === "WIN" ? "text-win" : last.outcome === "LOSS" ? "text-loss" : "text-draw"
              )}
            >
              {outcomeLabel(last.outcome)}
            </span>
            <span className="text-muted-foreground">en {last.map}</span>
          </div>
        </div>
        </Link>
      </TiltCard>

      {/* Indicadores del equipo */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Winrate"
          value={formatPercent(overview.winrate)}
          tone="amber"
          hint={
            <span className="space-y-2">
              <RecordBar wins={overview.wins} losses={overview.losses} draws={overview.draws} />
              <span className="block">
                {overview.wins}V · {overview.losses}D{overview.draws ? ` · ${overview.draws}E` : ""}
              </span>
            </span>
          }
        />
        <StatTile
          label="Últimas 10"
          value={`${data.last10.wins}-${data.last10.losses}${data.last10.draws ? `-${data.last10.draws}` : ""}`}
          hint={`${formatPercent(data.last10.winrate)} de winrate reciente`}
        />
        <StatTile
          label="Diferencia de rondas"
          value={formatSigned(overview.roundDiff)}
          tone={overview.roundDiff > 0 ? "win" : overview.roundDiff < 0 ? "loss" : "default"}
          hint={trend.length >= 2 ? <Sparkline values={trend} /> : `Promedio ${overview.avgTeamRounds} a ${overview.avgEnemyRounds}`}
        />
        <StatTile
          label="Racha"
          value={streak === 0 ? "—" : Math.abs(streak)}
          tone={streak > 0 ? "win" : streak < 0 ? "loss" : "default"}
          hint={
            streak > 0
              ? streak === 1
                ? "victoria seguida"
                : "victorias seguidas"
              : streak < 0
                ? streak === -1
                  ? "derrota seguida"
                  : "derrotas seguidas"
                : "sin racha"
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Panel
          title="Últimas scrims"
          action={
            <Link to="/app/scrims" className="inline-flex items-center gap-1 text-xs text-amber hover:underline">
              Ver todas
              <ArrowRight className="size-3" />
            </Link>
          }
        >
          <div className="space-y-2">
            {sorted.slice(0, 5).map((s) => (
              <ScrimRow key={s.id} scrim={s} />
            ))}
          </div>
        </Panel>

        <Panel title="Rendimiento por mapa" action={<span className="text-xs text-muted-foreground">Winrate</span>}>
          <ul className="space-y-2">
            {byMap.slice(0, 6).map((m) => (
              <li key={m.map} className="surface-2 flex items-center gap-3 p-2">
                <MapImage map={m.map} variant="strip" className="h-9 w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.map}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.matches} {m.matches === 1 ? "partida" : "partidas"} ·{" "}
                    <span className={cn(m.roundDiff > 0 && "text-win", m.roundDiff < 0 && "text-loss")}>
                      {formatSigned(m.roundDiff)} rondas
                    </span>
                  </p>
                </div>
                <div className="w-20 shrink-0 space-y-1.5 text-right">
                  <span className="num text-base text-amber">{m.winrate.toFixed(0)}%</span>
                  <RecordBar wins={m.wins} losses={m.losses} draws={m.draws} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)]">
        <Panel title="Rivales">
          <ul className="divide-y divide-border/60">
            {byOpponent.slice(0, 5).map((o) => (
              <li key={o.name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.matches} {o.matches === 1 ? "partida" : "partidas"}
                  </p>
                </div>
                <span className="shrink-0 text-right text-sm">
                  <span className="text-win">{o.wins}</span>
                  <span className="text-muted-foreground"> - </span>
                  <span className="text-loss">{o.losses}</span>
                  {o.draws ? <span className="text-muted-foreground"> - {o.draws}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Rondas ganadas">
          <div className="flex items-center gap-4">
            <Donut value={roundsPct} size={76} stroke={7} />
            <div>
              <p className="num text-3xl text-amber">{roundsPct.toFixed(0)}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                del total de rondas jugadas por el equipo
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Promedio {overview.avgTeamRounds} a {overview.avgEnemyRounds} por partida
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Agentes que enfrentamos">
          {enemyAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
          ) : (
            <ul className="space-y-2">
              {enemyAgents.map((a) => (
                <li key={a.agent} className="flex items-center gap-3">
                  <AgentChip agent={a.agent} className="w-28 justify-center" />
                  <span className="h-1.5 flex-1 bg-muted">
                    <span className="block h-full bg-amber/70" style={{ width: `${a.pickRate}%` }} />
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{a.pickRate.toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} quota={subscription.quota} reason="quota" />
    </div>
  );
}

export default DashboardPage;
