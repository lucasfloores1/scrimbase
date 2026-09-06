import { http } from "@/shared/api/http";
import type { PlayerStatsResponseDto } from "@/shared/types/dto";

export const playersApi = {
  getStats(teamId: string, userId: string): Promise<PlayerStatsResponseDto> {
    return http
      .get<PlayerStatsResponseDto>(`/teams/${teamId}/members/${userId}/stats`)
      .then((r) => r.data);
  },
};
