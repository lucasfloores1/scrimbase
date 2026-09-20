import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { env } from "@/shared/config/env";
import { scrimsApi } from "@/shared/api/scrims.api";
import { useTeamId, useMyTeam, useTeamMembers } from "@/shared/hooks/useTeam";
import { errorMessage, formatDate, scrimTypeLabel } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { Lightbox } from "@/shared/ui/valorant/Lightbox";
import { AgentComposition } from "@/shared/ui/valorant/AgentChip";
import { AgentChip } from "@/shared/ui/valorant/AgentChip";
import { OutcomeBadge } from "@/shared/ui/data/OutcomeBadge";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { cn } from "@/lib/utils";

function kd(kills: number, deaths: number) {
  return (deaths === 0 ? kills : kills / deaths).toFixed(2);
}

export default function ScrimDetailPage() {
  const navigate = useNavigate();
  const { scrimId } = useParams();
  const teamId = useTeamId();
  const team = useMyTeam();
  const members = useTeamMembers();

  const query = useQuery({
    queryKey: ["scrim", teamId, scrimId],
    queryFn: () => scrimsApi.getOne(teamId!, scrimId!),
    enabled: !!teamId && !!scrimId,
  });

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/app/scrims">
        <ArrowLeft data-icon="inline-start" />
        Scrims
      </Link>
    </Button>
  );

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <LoadingState variant="page" rows={5} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6">
        {back}
        <ErrorState
          title="No se pudo cargar la scrim"
          description={errorMessage(query.error)}
          actionLabel="Volver al listado"
          onAction={() => navigate("/app/scrims")}
        />
      </div>
    );
  }

  const s = query.data;
  const stats = [...(s.teamStats ?? [])].sort((a, b) => b.acs - a.acs);
  const maxAcs = Math.max(1, ...stats.map((p) => p.acs));
  const author = members.data?.find((m) => m.user.id === s.createdBy)?.user.username;
  const totals = stats.reduce(
    (a, p) => ({ kills: a.kills + p.kills, deaths: a.deaths + p.deaths, assists: a.assists + p.assists }),
    { kills: 0, deaths: 0, assists: 0 }
  );

  return (
    <div className="space-y-8">
      {back}

      {/* Cabecera con el mapa de fondo y los dos nombres */}
      <header className="surface relative overflow-hidden">
        <MapImage map={s.map} variant="splash" className="absolute inset-0 opacity-30" eager />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/88 to-surface-1/35" aria-hidden="true" />
        <div className="relative space-y-5 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <OutcomeBadge outcome={s.outcome} />
            <span className="text-sm text-muted-foreground">
              {scrimTypeLabel(s.type)} · {formatDate(s.createdAt)}
              {author ? ` · subida por ${author}` : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {team.data?.name ?? "Nuestro equipo"}
            </span>
            <span className="num flex items-baseline gap-3 text-5xl md:text-6xl">
              <span className={cn(s.outcome === "WIN" && "text-win", s.outcome === "LOSS" && "text-loss")}>
                {s.teamRounds}
              </span>
              <span className="text-muted-foreground/50">:</span>
              <span className={cn(s.outcome === "LOSS" && "text-win", s.outcome === "WIN" && "text-loss")}>
                {s.enemyRounds}
              </span>
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-muted-foreground md:text-3xl">
              {s.opponentName}
            </span>
          </div>

          <p className="eyebrow text-primary">{s.map}</p>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="eyebrow">Nuestro equipo</h2>
          <span className="text-sm text-muted-foreground">
            {totals.kills} / {totals.deaths} / {totals.assists} del equipo
          </span>
        </div>
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 text-left font-medium">Jugador</th>
                  <th className="px-4 py-2.5 text-left font-medium">Agente</th>
                  <th className="px-3 py-2.5 text-right font-medium">K</th>
                  <th className="px-3 py-2.5 text-right font-medium">D</th>
                  <th className="px-3 py-2.5 text-right font-medium">A</th>
                  <th className="px-3 py-2.5 text-right font-medium">K/D</th>
                  <th className="px-4 py-2.5 text-right font-medium">ACS</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((p, idx) => (
                  <tr key={`${p.userId ?? p.displayName ?? idx}`} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5 font-medium">
                      {p.userId ? (
                        <Link to={`/app/team/${p.userId}`} className="hover:text-amber hover:underline underline-offset-4">
                          {p.displayName}
                        </Link>
                      ) : (
                        p.displayName || <span className="text-muted-foreground italic">sin identificar</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <AgentChip agent={p.agent} />
                    </td>
                    <td className="num px-3 py-2.5 text-right text-base">{p.kills}</td>
                    <td className="num px-3 py-2.5 text-right text-base">{p.deaths}</td>
                    <td className="num px-3 py-2.5 text-right text-base">{p.assists}</td>
                    <td
                      className={cn(
                        "num px-3 py-2.5 text-right text-base",
                        p.kills > p.deaths ? "text-win" : p.kills < p.deaths ? "text-loss" : "text-muted-foreground"
                      )}
                    >
                      {kd(p.kills, p.deaths)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex flex-col items-end gap-1">
                        <span className="num text-base text-amber">{p.acs}</span>
                        <span className="block h-[3px] w-16 bg-muted">
                          <span className="block h-full bg-amber/70" style={{ width: `${(p.acs / maxAcs) * 100}%` }} />
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow">Composición de {s.opponentName}</h2>
        <AgentComposition agents={s.enemyComposition ?? []} />
      </section>

      {s.screenshotUrl ? (
        <section className="space-y-3">
          <h2 className="eyebrow">Captura</h2>
          <Lightbox src={env.assetsUrl + s.screenshotUrl} alt={`Scoreboard de ${s.map} vs ${s.opponentName}`} />
        </section>
      ) : null}
    </div>
  );
}
