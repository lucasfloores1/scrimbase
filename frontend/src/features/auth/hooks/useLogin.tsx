import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function useLogin() {
  const navigate = useNavigate();
  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      const me = await auth.login(vars.email, vars.password);
      return me;
    },
    onSuccess: (me) => {      
      if (me.teamMember?.teamId) navigate("/app", { replace: true });
      else navigate("/onboarding", { replace: true });
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export default useLogin;