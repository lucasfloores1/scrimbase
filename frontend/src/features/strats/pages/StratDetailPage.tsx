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
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            {s.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            Mapa: {s.map}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/app/strats")}
        >
          Volver
        </Button>

      </header>

      <Separator className="bg-accent" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Notes */}

        <Card>

          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">
              Notas
            </CardTitle>
          </CardHeader>

          <CardContent>

            {s.notes ? (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {s.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay notas para esta estrategia.
              </p>
            )}

          </CardContent>

        </Card>

        {/* Screenshot */}

        {s.screenshotUrl ? (
          <Card>

            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">
                Captura
              </CardTitle>
            </CardHeader>

            <CardContent>

              <div className="overflow-hidden rounded-lg border">
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