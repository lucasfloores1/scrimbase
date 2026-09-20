// src/features/auth/hooks/useRegister.tsx
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { usersApi } from "@/shared/api/users.api";
import { useAuth } from "@/app/providers/AuthProvider";

export function useRegister() {
  const navigate = useNavigate();
  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: async (vars: { email: string; password: string; username: string; riotId: string }) => {
      await usersApi.register({
        email: vars.email,
        password: vars.password,
        username: vars.username,
        riotId: vars.riotId,
      });

      const me = await auth.login(vars.email, vars.password);
      return me;
    },
    onSuccess: (me) => {
      if (me.teamMember?.teamId) navigate("/app", { replace: true });
      else navigate("/onboarding", { replace: true });
    },
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export default useRegister;