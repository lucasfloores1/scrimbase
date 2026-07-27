import { http } from "@/shared/api/http";
import type { DashboardResponseDto } from "@/shared/types/dto";

export const dashboardApi = {
  myTeamDashboard: async (): Promise<DashboardResponseDto> => {
    const { data } = await http.get<DashboardResponseDto>("/dashboard");
    return data;
  },
};