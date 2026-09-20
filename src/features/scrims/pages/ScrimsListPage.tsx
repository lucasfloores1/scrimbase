import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RotateCcw, Search } from "lucide-react";

import { useScrims } from "@/shared/hooks/useScrims";
import { useMyTeam } from "@/shared/hooks/useTeam";
import type { ListScrimsQuery, ScrimOutcome, ScrimType } from "@/shared/types/dto";
import { OUTCOMES, SCRIM_TYPES, VALORANT_MAPS } from "@/shared/constants/valorant";
import { errorMessage, formatPercent, ratio } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { ScrimRow } from "@/shared/ui/data/ScrimRow";
import { AgentSelect } from "@/shared/ui/valorant/AgentSelect";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { useDebounced } from "@/shared/hooks/useDebounced";

const ALL = "__all__";

export function ScrimsListPage() {
  const navigate = useNavigate();
  const team = useMyTeam();

  const [map, setMap] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [outcome, setOutcome] = useState<string>(ALL);
  const [opponent, setOpponent] = useState("");
  const [agent, setAgent] = useState<string>("");
  const debouncedOpponent = useDebounced(opponent, 350);

  const query: ListScrimsQuery = useMemo(
    () => ({
      map: map === ALL ? undefined : map,
      type: type === ALL ? undefined : (type as ScrimType),
      outcome: outcome === ALL ? undefined : (outcome as ScrimOutcome),
      opponentName: debouncedOpponent || undefined,
      agents: agent ? [agent] : undefined,
    }),
    [map, type, outcome, debouncedOpponent, agent]
  );

  const scrims = useScrims(query);
  const filtered = scrims.data ?? [];
  const hasFilters = map !== ALL || type !== ALL || outcome !== ALL || !!opponent || !!agent;

  const wins = filtered.filter((s) => s.outcome === "WIN").length;
  const decided = filtered.filter((s) => s.outcome !== "DRAW").length;

  function reset() {
    setMap(ALL);
    setType(ALL);
    setOutcome(ALL);
    setOpponent("");
    setAgent("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scrims"
        description={team.data ? `Historial de ${team.data.name}` : "Historial del equipo."}
        actions={
          <Button onClick={() => navigate("/app/scrims/new")}>
            <Plus data-icon="inline-start" />
            Subir scrim
          </Button>
        }
      />

      {/* Filtros: los resuelve el backend vía query params */}
      <section className="surface space-y-3 p-3 md:p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={map} onValueChange={setMap}>
            <SelectTrigger size="sm" aria-label="Filtrar por mapa">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value={ALL}>Todos los mapas</SelectItem>
              {VALORANT_MAPS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger size="sm" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todo tipo</SelectItem>
              {SCRIM_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger size="sm" aria-label="Filtrar por resultado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todo resultado</SelectItem>
              {OUTCOMES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Rival"
              aria-label="Filtrar por rival"
              className="h-8 pl-8"
            />
          </div>

          <AgentSelect
            value={agent}
            onChange={setAgent}
            ariaLabel="Filtrar por agente rival"
            placeholder="Agente rival"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {scrims.isFetching ? (
              "Buscando…"
            ) : (
              <>
                <span className="text-foreground">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "partida" : "partidas"}
                {decided > 0 ? ` · ${formatPercent(ratio(wins, decided))} de winrate` : ""}
              </>
            )}
          </p>
          {hasFilters ? (
            <Button variant="ghost" size="xs" onClick={reset}>
              <RotateCcw data-icon="inline-start" />
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </section>

      {scrims.isLoading ? (
        <LoadingState rows={8} />
      ) : scrims.isError ? (
        <ErrorState description={errorMessage(scrims.error)} actionLabel="Reintentar" onAction={() => scrims.refetch()} />
      ) : filtered.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Nada con esos filtros"
            description="Probá con otra combinación de mapa, tipo, resultado, rival o agente."
            actionLabel="Limpiar filtros"
            onAction={reset}
          />
        ) : (
          <EmptyState
            title="Todavía no hay scrims"
            description="Subí la primera captura y empezá a construir el historial del equipo."
            actionLabel="Subir scrim"
            onAction={() => navigate("/app/scrims/new")}
          />
        )
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <ScrimRow key={s.id} scrim={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScrimsListPage;
