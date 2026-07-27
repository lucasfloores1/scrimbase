import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { env } from "@/shared/config/env";

import { useAuth } from "@/app/providers/AuthProvider";
import { stratsApi } from "@/shared/api/strats.api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";

export default function StratDetailPage() {

  const navigate = useNavigate();
  const { stratId } = useParams();

  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const query = useQuery({
    queryKey: ["strat", teamId, stratId],
    queryFn: async () => {
      if (!teamId) throw new Error("No hay teamId.");
      if (!stratId) throw new Error("No hay stratId.");

      return stratsApi.getOne(teamId, stratId);
    },
    enabled: !!teamId && !!stratId,
  });

  if (query.isLoading) {
    return <LoadingState title="Cargando strat" />;
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Error inesperado";

    return (
      <ErrorState
        title="No se pudo cargar la strat"
        description={msg}
        actionLabel="Volver"
        onAction={() => navigate("/app/strats")}
      />
    );
  }

  const s = query.data!;

  return (
    <div className="space-y-6">

      {/* Header */}

      <header className="flex items-start justify-between gap-3">

        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
            {s.name}
          </h1>

          <p className="text-sm text-slate-400">
            Mapa: {s.map}
          </p>
        </div>

        <Button
          variant="outline"
          className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
          onClick={() => navigate("/app/strats")}
        >
          Volver
        </Button>

      </header>

      <Separator className="bg-slate-800" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Notes */}

        <Card className="border-slate-800 bg-slate-950/30">

          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">
              Notas
            </CardTitle>
          </CardHeader>

          <CardContent>

            {s.notes ? (
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {s.notes}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                No hay notas para esta estrategia.
              </p>
            )}

          </CardContent>

        </Card>

        {/* Screenshot */}

        {s.screenshotUrl ? (
          <Card className="border-slate-800 bg-slate-950/30">

            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-200">
                Captura
              </CardTitle>
            </CardHeader>

            <CardContent>

              <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
                <img
                  src={env.assetsUrl + s.screenshotUrl}
                  alt="Strat screenshot"
                  className="block w-full"
                />
              </div>

            </CardContent>

          </Card>
        ) : null}

      </div>

    </div>
  );
}