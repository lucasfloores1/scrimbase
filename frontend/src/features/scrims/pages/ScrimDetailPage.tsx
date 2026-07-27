import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { env } from "@/shared/config/env";
import { useAuth } from "@/app/providers/AuthProvider";
import { scrimsApi } from "@/shared/api/scrims.api";
import type { ScrimOutcome } from "@/shared/types/dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";

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

function typeLabel(t: string) {
  if (t === "SCRIM") return "Scrim";
  if (t === "PREMIER") return "Premier";
  return "Torneo";
}

export default function ScrimDetailPage() {
  const navigate = useNavigate();
  const { scrimId } = useParams();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const query = useQuery({
    queryKey: ["scrim", teamId, scrimId],
    queryFn: async () => {
      if (!teamId) throw new Error("No hay teamId.");
      if (!scrimId) throw new Error("No hay scrimId.");
      return scrimsApi.getOne(teamId, scrimId);

    },
    enabled: !!teamId && !!scrimId,
  });

  if (query.isLoading) {
    return <LoadingState title="Cargando scrim" />;
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Error inesperado";
    return (
      <ErrorState
        title="No se pudo cargar la scrim"
        description={msg}
        actionLabel="Volver"
        onAction={() => navigate("/app/scrims")}
      />
    );
  }

  const s = query.data!;
  const out = outcomeStyle(s.outcome);
  

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
            {s.map} · {typeLabel(s.type)}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={out.className}>
              {out.text}
            </Badge>
            <span className="text-sm text-slate-300">
              {s.teamRounds}–{s.enemyRounds}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
          onClick={() => navigate("/app/scrims")}
        >
          Volver
        </Button>
      </header>

      <Separator className="bg-slate-800" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Composición rival</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {s.enemyComposition?.map((a, idx) => (
                <Badge
                  key={`${a}-${idx}`}
                  variant="outline"
                  className="border-slate-700 bg-slate-950 text-slate-200"
                >
                  {a}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Team stats</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left font-medium text-slate-400">Jugador</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">Agente</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">K</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">D</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">A</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-400">ACS</th>
                  </tr>
                </thead>
                <tbody>
                  {s.teamStats?.map((p, idx) => (
                    <tr key={idx} className="border-b border-slate-900">
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                        {p.displayName ?? p.userId ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{p.agent}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{p.kills}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{p.deaths}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{p.assists}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{p.acs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {s.screenshotUrl ? (
        <Card className="border-slate-800 bg-slate-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">Captura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
              <img src={ env.assetsUrl+s.screenshotUrl } alt="Captura" className="block w-full" />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}