import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import type { ScrimDto, ScrimOutcome } from "@/shared/types/dto";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function outcomeStyle(outcome: ScrimOutcome): { text: string; className: string } {
  if (outcome === "WIN") {
    return {
      text: "Victoria",
      className: "bg-emerald-600/15 text-emerald-200 border-emerald-600/30",
    };
  }
  if (outcome === "LOSS") {
    return {
      text: "Derrota",
      className: "bg-red-600/15 text-red-200 border-red-600/30",
    };
  }
  return {
    text: "Empate",
    className: "bg-slate-600/15 text-slate-200 border-slate-600/30",
  };
}

function typeLabel(t: ScrimDto["type"]) {
  if (t === "SCRIM") return "Scrim";
  if (t === "PREMIER") return "Premier";
  return "Torneo";
}

export function ScrimsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const query = useQuery({
    queryKey: ["scrims", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      return scrimsApi.list(teamId);
    },
    enabled: !!teamId,
    staleTime: 15_000,
  });

  if (!teamId) {
    return (
      <EmptyState
        title="No hay equipo activo"
        description="Necesitás pertenecer a un equipo para ver scrims."
      />
    );
  }

  if (query.isLoading) {
    return <LoadingState title="Cargando scrims" description="Consultando registros del equipo..." />;
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Error inesperado";
    return (
      <ErrorState
        title="No se pudo cargar la lista"
        description={msg}
        actionLabel="Reintentar"
        onAction={() => query.refetch()}
      />
    );
  }

  const scrims = (query.data ?? []) as ScrimDto[];

  if (scrims.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay scrims"
        description="Subí tu primera scrim para empezar a construir historial y KPIs."
        actionLabel="Subir scrim"
        onAction={() => navigate("/app/scrims/new")}
      />
    );
  }

  return (
    <div className="space-y-4">

      <Card className="border-slate-800 bg-slate-950/30">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Mapa</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Resultado</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Score</th>
                </tr>
              </thead>

              <tbody>
                {scrims.map((s) => {
                  const out = outcomeStyle(s.outcome);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-slate-900 hover:bg-slate-900/30 cursor-pointer"
                      onClick={() => navigate(`/app/scrims/${s.id}`)}
                    >
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{s.map}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{typeLabel(s.type)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className={out.className}>
                          {out.text}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {s.teamRounds}–{s.enemyRounds}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScrimsListPage;