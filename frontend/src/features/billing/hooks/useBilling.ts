import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/app/providers/AuthProvider";
import { billingApi } from "@/shared/api/billing.api";

export const billingQueryKey = (teamId: string | null) => ["billing", teamId] as const;

export function useBilling() {
  const { user } = useAuth();
  const teamId = user?.teamMember?.teamId ?? null;

  const query = useQuery({
    queryKey: billingQueryKey(teamId),
    queryFn: async () => {
      if (!teamId) throw new Error("No team");
      return billingApi.status(teamId);
    },
    enabled: !!teamId,
    staleTime: 30_000,
  });

  const status = query.data ?? null;

  return {
    teamId,
    isAdmin: !!user?.teamMember?.isAdmin,
    status,
    isPro: status?.plan === "PRO",
    canUpload: status?.canUploadScrim ?? true,
    query,
  };
}
