import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { dashboardApi } from "@/shared/api/dashboard.api";
import type { DashboardResponseDto, ScrimOutcome } from "@/shared/types/dto";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const percent = value <= 1 ? value * 100 : value; // solo formato
  return Math.max(0, Math.min(100, percent));
}

function formatPercent(value: number): string {
  return `${clampPercent(value).toFixed(0)}%`;
}

function formatDate(iso: string): string {
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

export function DashboardPage() {
  const navigate = useNavigate();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.myTeamDashboard,
    staleTime: 30_000,
  });

  if (dashboardQuery.isLoading) {
    return <LoadingState title="Cargando dashboard" description="Consultando el resumen del equipo..." />;
  }

  if (dashboardQuery.isError) {
    const message =
      dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Error inesperado";
    return (
      <ErrorState
        title="No se pudo cargar el dashboard"
        description={message}
        actionLabel="Reintentar"
        onAction={() => dashboardQuery.refetch()}
      />
    );
  }

  const data = dashboardQuery.data as DashboardResponseDto;

  const teamName = data?.team?.name ?? "Equipo";
  const overview = data?.overview;
  const bestMap = data?.bestMap ?? null;
  const recentScrims = Array.isArray(data?.recentScrims) ? data.recentScrims : [];

  const winrate = typeof overview?.winrate === "number" ? overview.winrate : 0;
  const totalScrims = typeof overview?.total === "number" ? overview.total : 0;

  return (
    <div className="space-y-6">
      {/* 1) Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
            {teamName}
          </h1>
          <p className="text-sm text-slate-400">
            Dashboard · Resumen del equipo
          </p>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-500 text-white"
          onClick={() => navigate("/app/scrims/new")}
        >
          Subir scrim
        </Button>
      </header>

      <Separator className="bg-slate-800" />

      {/* 2) Grid de KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Winrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-100">{formatPercent(winrate)}</div>
            <p className="mt-1 text-xs text-slate-400">Dato provisto por el backend</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total scrims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-100">{totalScrims}</div>
            <p className="mt-1 text-xs text-slate-400">Scrims registradas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Mejor mapa</CardTitle>
          </CardHeader>
          <CardContent>
            {bestMap ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-slate-100">{bestMap.name}</div>
                  <Badge
                    variant="outline"
                    className="border-blue-600/30 bg-blue-600/10 text-blue-200"
                  >
                    {formatPercent(bestMap.winrate)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">Basado en {bestMap.matches} scrims</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Todavía no hay suficiente información.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 3) Últimas scrims */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Últimas scrims</h2>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
            onClick={() => navigate("/app/scrims")}
          >
            Ver todas
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-950/30">
          <CardContent className="p-0">
            {recentScrims.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Todavía no hay scrims registradas"
                  description="Subí una scrim para empezar a ver el resumen del equipo."
                  actionLabel="Subir scrim"
                  onAction={() => navigate("/app/scrims/new")}
                />
              </div>
            ) : (
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
                    {recentScrims.map((s) => {
                      const out = outcomeStyle(s.outcome);
                      return (
                        <tr key={s.id} className="border-b border-slate-900 hover:bg-slate-900/30">
                          <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                            {formatDate(s.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{s.map}</td>
                          <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{s.type}</td>
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
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default DashboardPage;