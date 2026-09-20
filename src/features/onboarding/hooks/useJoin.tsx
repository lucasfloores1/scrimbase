import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { teamsApi } from "@/shared/api/teams.api";
import type { JoinByInviteCodeDto } from "@/shared/types/dto";

export function useJoin() {
  const navigate = useNavigate();
  const { bootstrap } = useAuth();

  const mutation = useMutation({
    mutationFn: (dto: JoinByInviteCodeDto) => teamsApi.joinByCode(dto),
    onSuccess: async () => {
      await bootstrap();
      navigate("/app", { replace: true });
    },
  });

  return {
    join: mutation.mutate,
    joinAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export default useJoin;
