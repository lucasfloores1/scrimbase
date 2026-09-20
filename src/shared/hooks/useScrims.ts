import { useQuery } from "@tanstack/react-query";
import { scrimsApi } from "@/shared/api/scrims.api";
import { useTeamId } from "@/shared/hooks/useTeam";
import type { ListScrimsQuery } from "@/shared/types/dto";

/** Listado de scrims del equipo. El filtrado lo hace el backend. */
export function useScrims(query: ListScrimsQuery = {}) {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["scrims", teamId, query],
    queryFn: () => scrimsApi.list(teamId!, query),
    enabled: !!teamId,
    staleTime: 15_000,
  });
}
