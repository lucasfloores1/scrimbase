import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { stratsApi } from "@/shared/api/strats.api";
import type { StratDto } from "@/shared/types/dto";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

export function StratsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const query = useQuery({
    queryKey: ["strats", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      return stratsApi.list(teamId);
    },
    enabled: !!teamId,
    staleTime: 15000,
  });

  if (!teamId) {
    return (
      <EmptyState
        title="No hay equipo activo"
        description="Necesitás pertenecer a un equipo para ver strats."
      />
    );
  }

  if (query.isLoading) {
    return (
      <LoadingState
        title="Cargando strats"
        description="Consultando estrategias del equipo..."
      />
    );
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

  const strats = (query.data ?? []) as StratDto[];

  if (strats.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay strats"
        description="Creá tu primera estrategia para empezar."
        actionLabel="Crear strat"
        onAction={() => navigate("/app/strats/new")}
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
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">
                    Mapa
                  </th>
                </tr>
              </thead>

              <tbody>
                {strats.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-900 hover:bg-slate-900/30 cursor-pointer"
                    onClick={() => navigate(`/app/strats/${s.id}`)}
                  >
                    <td className="px-4 py-3 text-slate-200">
                      {s.name}
                    </td>

                    <td className="px-4 py-3 text-slate-200">
                      {s.map}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default StratsListPage;