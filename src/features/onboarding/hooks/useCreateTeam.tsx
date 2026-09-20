import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { teamsApi } from "@/shared/api/teams.api";
import type { CreateTeamDto } from "@/shared/types/dto";

export function useCreateTeam() {
  const navigate = useNavigate();
  const { bootstrap } = useAuth();

  const mutation = useMutation({
    mutationFn: (dto: CreateTeamDto) => teamsApi.create(dto),
    onSuccess: async () => {
      await bootstrap();
      navigate("/app", { replace: true });
    },
  });

  return {
    create: mutation.mutate,
    createAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export default useCreateTeam;
