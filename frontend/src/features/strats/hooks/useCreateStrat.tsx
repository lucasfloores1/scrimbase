import { stratsApi } from "@/shared/api/strats.api";
import type { CreateStratDto } from "@/shared/types/dto";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useCreateStrat() {
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (vars: {file : File, dto : CreateStratDto, teamId : string}) => {
            const res = await stratsApi.create(vars.teamId, vars.file, vars.dto);
            return res
        },
        onSuccess: () => {
            navigate("/app/strats", { replace: true });
        }
    });

    return {
        create: mutation.mutate,
        createAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}