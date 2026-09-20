import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/AuthProvider";
import { teamsApi } from "@/shared/api/teams.api";

export function useTeamId() {
  const { user } = useAuth();
  return user?.teamMember?.teamId ?? null;
}

export function useMyTeam() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamsApi.myTeam(),
    enabled: !!teamId,
    staleTime: 5 * 60_000,
  });
}

export function useTeamMembers() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => teamsApi.getTeamMembers(),
    enabled: !!teamId,
    staleTime: 60_000,
  });
}
