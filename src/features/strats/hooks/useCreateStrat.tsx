import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { stratsApi } from "@/shared/api/strats.api";
import { useToast } from "@/shared/ui/toast/useToast";
import type { CreateStratDto } from "@/shared/types/dto";

export function useCreateStrat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (vars: { file: File; dto: CreateStratDto; teamId: string }) =>
      stratsApi.create(vars.teamId, vars.file, vars.dto),
    onSuccess: async (_res, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["strats", vars.teamId] });
      toast.success("Strat guardada.");
      navigate("/app/strats", { replace: true });
    },
  });

  return {
    create: mutation.mutate,
    createAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
