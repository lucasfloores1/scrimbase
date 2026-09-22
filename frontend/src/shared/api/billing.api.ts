import { http } from "@/shared/api/http";
import type { BillingCheckoutDto, BillingCycle, BillingStatusDto } from "@/shared/types/dto";

export const billingApi = {
  async status(teamId: string): Promise<BillingStatusDto> {
    const { data } = await http.get<BillingStatusDto>(`/teams/${teamId}/billing`);
    return data;
  },

  async startCheckout(teamId: string, cycle: BillingCycle): Promise<BillingCheckoutDto> {
    const { data } = await http.post<BillingCheckoutDto>(`/teams/${teamId}/billing/checkout`, { cycle });
    return data;
  },

  async getCheckout(teamId: string, checkoutId: string): Promise<BillingCheckoutDto> {
    const { data } = await http.get<BillingCheckoutDto>(`/teams/${teamId}/billing/checkout/${checkoutId}`);
    return data;
  },

  async confirmCheckout(teamId: string, checkoutId: string): Promise<BillingStatusDto> {
    const { data } = await http.post<BillingStatusDto>(
      `/teams/${teamId}/billing/checkout/${checkoutId}/confirm`
    );
    return data;
  },

  async cancel(teamId: string): Promise<BillingStatusDto> {
    const { data } = await http.post<BillingStatusDto>(`/teams/${teamId}/billing/cancel`);
    return data;
  },

  async resume(teamId: string): Promise<BillingStatusDto> {
    const { data } = await http.post<BillingStatusDto>(`/teams/${teamId}/billing/resume`);
    return data;
  },
};
