import { http } from "@/shared/api/http";
import type { PlayerStatsResponseDto } from "@/shared/types/dto";

export const playersApi = {
  async stats(teamId: string, userId: string): Promise<PlayerStatsResponseDto> {
    const { data } = await http.get<PlayerStatsResponseDto>(`/teams/${teamId}/members/${userId}/stats`);
    return data;
  },
};
