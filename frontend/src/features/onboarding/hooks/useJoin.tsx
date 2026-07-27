import { useAuth } from "@/app/providers/AuthProvider";
import { teamsApi } from "@/shared/api/teams.api";
import type { JoinByInviteCodeDto } from "@/shared/types/dto";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useJoin(){
    const navigate = useNavigate();
    const { bootstrap } = useAuth();


    const mutation = useMutation({
        mutationFn: async ( dto : JoinByInviteCodeDto ) => {
            const response = await teamsApi.joinByCode(dto)         
            return response;
        },
        onSuccess: async () => {            
            await bootstrap();
            navigate("/app")
        },
        onError: () => {            
            navigate("/login")
        }
    })

    return {
        join: mutation.mutate,
        joinAsync: mutation.mutateAsync,
        isPending : mutation.isPending,
        error: mutation.error
    }

}

export default useJoin;