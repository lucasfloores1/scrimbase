import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing.api";
import { useTeamId } from "@/shared/hooks/useTeam";
import type { SubscriptionDto } from "@/shared/types/dto";

/**
 * Plan y cupo del equipo.
 *
 * Tolerante a que el backend todavía no exponga /subscription: si el endpoint
 * no existe o falla, se asume "sin tope" y la interfaz no bloquea nada. Así el
 * front sigue funcionando contra la API actual y las pantallas de plan se
 * encienden solas cuando el endpoint esté publicado.
 */
const UNLIMITED: SubscriptionDto = {
  plan: "PRO",
  status: "ACTIVE",
  quota: { period: "MONTH", limit: null, used: 0, remaining: null, resetsAt: new Date().toISOString() },
};

export function useSubscription() {
  const teamId = useTeamId();

  const query = useQuery({
    queryKey: ["subscription", teamId],
    queryFn: () => billingApi.subscription(teamId!),
    enabled: !!teamId,
    staleTime: 30_000,
    retry: false,
  });

  return {
    ...query,
    /** Nunca undefined: si no se pudo leer, no se limita al usuario. */
    subscription: query.data ?? UNLIMITED,
    /** true solo cuando el backend confirmó el cupo. */
    enforced: !!query.data,
  };
}

export function quotaExhausted(sub: SubscriptionDto) {
  return sub.quota.limit !== null && sub.quota.remaining !== null && sub.quota.remaining <= 0;
}

/** true si el error de la API es por cupo agotado. */
export function isQuotaError(err: unknown) {
  if (typeof err !== "object" || err === null || !("response" in err)) return false;
  const res = (err as { response?: { status?: number; data?: { error?: { code?: string } } } }).response;
  return res?.status === 402 || res?.data?.error?.code === "QUOTA_EXCEEDED";
}
