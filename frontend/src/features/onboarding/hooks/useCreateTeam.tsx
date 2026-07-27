import { useAuth } from "@/app/providers/AuthProvider";
import { teamsApi } from "@/shared/api/teams.api";
import type { CreateTeamDto } from "@/shared/types/dto";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useCreateTeam(){
    const navigate = useNavigate();
    const { bootstrap } = useAuth();

    const mutation = useMutation({
        mutationFn: async ( dto : CreateTeamDto ) => {
            const response = await teamsApi.create(dto)
            return response;
        },
        onSuccess: async () => {
            await bootstrap()
            navigate("/app")
        },
        onError: () => {
            navigate("/login")
        }
    })

    return {
        create: mutation.mutate,
        createAsync: mutation.mutateAsync,
        isPending : mutation.isPending,
        error: mutation.error
    }

}

export default useCreateTeam;