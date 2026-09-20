import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RotateCcw } from "lucide-react";

import { env } from "@/shared/config/env";
import { stratsApi } from "@/shared/api/strats.api";
import { useTeamId } from "@/shared/hooks/useTeam";
import type { MatchSide, StratDto } from "@/shared/types/dto";
import { SIDES, VALORANT_MAPS } from "@/shared/constants/valorant";
import { errorMessage, sideLabel } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { TiltCard } from "@/shared/ui/three/TiltCard";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { cn } from "@/lib/utils";

const ALL = "__all__";

function SideTag({ side, className }: { side: MatchSide; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded border px-2 text-xs font-medium backdrop-blur",
        side === "ATTACK" ? "border-loss/50 bg-loss/10 text-loss" : "border-chart-4/50 bg-chart-4/10 text-chart-4",
        className
      )}
    >
      {sideLabel(side)}
    </span>
  );
}

function StratCard({ strat }: { strat: StratDto }) {
  return (
    <TiltCard max={8}>
    <Link
      to={`/app/strats/${strat.id}`}
      className="surface surface-hover group block overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      <div className="relative aspect-video bg-black/40">
        {strat.screenshotUrl ? (
          <img
            src={env.assetsUrl + strat.screenshotUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <MapImage map={strat.map} variant="minimap" className="size-full" imgClassName="object-contain p-3" />
        )}
        <span className="absolute top-2 left-2">
          <SideTag side={strat.side} />
        </span>
      </div>
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate font-medium group-hover:text-primary">{strat.name}</p>
          <p className="text-xs text-muted-foreground">{strat.map}</p>
        </div>
      </div>
    </Link>
    </TiltCard>
  );
}

export function StratsListPage() {
  const navigate = useNavigate();
  const teamId = useTeamId();
  const [map, setMap] = useState<string>(ALL);
  const [side, setSide] = useState<string>(ALL);

  const query = useQuery({
    queryKey: ["strats", teamId],
    queryFn: () => stratsApi.list(teamId!),
    enabled: !!teamId,
    staleTime: 15_000,
  });

  const strats = useMemo(() => query.data ?? [], [query.data]);

  /** Agrupado por mapa (en el orden del juego) y, dentro, por lado. */
  const groups = useMemo(() => {
    const visible = strats.filter((s) => (map === ALL || s.map === map) && (side === ALL || s.side === side));
    return VALORANT_MAPS.map((m) => ({
      map: m,
      attack: visible.filter((s) => s.map === m && s.side === "ATTACK"),
      defense: visible.filter((s) => s.map === m && s.side === "DEFENSE"),
    })).filter((g) => g.attack.length + g.defense.length > 0);
  }, [strats, map, side]);

  const visibleCount = groups.reduce((a, g) => a + g.attack.length + g.defense.length, 0);
  const countByMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of strats) m.set(s.map, (m.get(s.map) ?? 0) + 1);
    return m;
  }, [strats]);
  const hasFilters = map !== ALL || side !== ALL;

  const header = (
    <PageHeader
      title="Strats"
      description="Setups del equipo, por mapa y por lado."
      actions={
        <Button onClick={() => navigate("/app/strats/new")}>
          <Plus data-icon="inline-start" />
          Nueva strat
        </Button>
      }
    />
  );

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <LoadingState variant="cards" rows={6} />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState description={errorMessage(query.error)} actionLabel="Reintentar" onAction={() => query.refetch()} />
      </div>
    );
  }

  if (strats.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          title="Todavía no hay strats"
          description="Guardá el primer setup con su captura, mapa y lado para que todo el equipo lo tenga a mano."
          actionLabel="Nueva strat"
          onAction={() => navigate("/app/strats/new")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {/* Filtro por mapa */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar por mapa">
          <button
            role="tab"
            aria-selected={map === ALL}
            onClick={() => setMap(ALL)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
              map === ALL ? "border-primary/50 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          {VALORANT_MAPS.filter((m) => countByMap.has(m)).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={map === m}
              onClick={() => setMap(m)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                map === m ? "border-primary/50 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
              <span className="ml-1.5 text-xs opacity-60">{countByMap.get(m)}</span>
            </button>
          ))}
        </div>

        {/* Filtro por lado */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar por lado">
          {[{ value: ALL, label: "Ambos lados" }, ...SIDES].map((s) => (
            <button
              key={s.value}
              role="tab"
              aria-selected={side === s.value}
              onClick={() => setSide(s.value)}
              className={cn(
                "rounded-md border px-3 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                side === s.value
                  ? "border-foreground/60 bg-foreground/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {visibleCount} {visibleCount === 1 ? "strat" : "strats"}
          </span>
          {hasFilters ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setMap(ALL);
                setSide(ALL);
              }}
            >
              <RotateCcw data-icon="inline-start" />
              Limpiar
            </Button>
          ) : null}
        </div>
      </div>

      {visibleCount === 0 ? (
        <EmptyState
          title="Nada con esos filtros"
          description="No hay strats para esa combinación de mapa y lado."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setMap(ALL);
            setSide(ALL);
          }}
        />
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.map} className="space-y-4">
              <div className="flex items-center gap-3">
                <MapImage map={g.map} variant="minimap" className="size-10 shrink-0" imgClassName="object-contain" />
                <h2 className="font-display text-xl font-semibold tracking-tight">{g.map}</h2>
                <span className="h-px flex-1 bg-border/70" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">
                  {g.attack.length + g.defense.length} {g.attack.length + g.defense.length === 1 ? "strat" : "strats"}
                </span>
              </div>

              {(["ATTACK", "DEFENSE"] as MatchSide[]).map((sd) => {
                const list = sd === "ATTACK" ? g.attack : g.defense;
                if (!list.length) return null;
                return (
                  <div key={sd} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <SideTag side={sd} />
                      <span className="text-xs text-muted-foreground">
                        {list.length} {list.length === 1 ? "setup" : "setups"}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((s) => (
                        <StratCard key={s.id} strat={s} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default StratsListPage;
