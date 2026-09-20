import { http } from "@/shared/api/http";
import type { CheckoutSessionDto, PlanCode, SubscriptionDto } from "@/shared/types/dto";

export const billingApi = {
  /** Plan y cupo del equipo. */
  async subscription(teamId: string): Promise<SubscriptionDto> {
    const { data } = await http.get<SubscriptionDto>(`/teams/${teamId}/subscription`);
    return data;
  },

  /** Arranca el pago; el backend devuelve la URL del proveedor. */
  async checkout(teamId: string, plan: PlanCode = "PRO"): Promise<CheckoutSessionDto> {
    const { data } = await http.post<CheckoutSessionDto>(`/teams/${teamId}/subscription/checkout`, { plan });
    return data;
  },
};
