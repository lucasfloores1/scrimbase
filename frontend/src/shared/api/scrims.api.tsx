import { http } from "@/shared/api/http";
import type {
  CreateScrimDto,
  ParseScrimScreenshotResponseDto,
  ParseScrimScreenshotRequestDto,
  ScrimDto,
} from "@/shared/types/dto";

export const scrimsApi = {
  async list(teamId: string): Promise<ScrimDto[]> {
    const { data } = await http.get<ScrimDto[]>(`/teams/${teamId}/scrims`);
    return data;
  },

  async getOne(teamId: string, scrimId: string): Promise<ScrimDto> {
    const { data } = await http.get<ScrimDto>(`/teams/${teamId}/scrims/${scrimId}`);
    return data;
  },

  async parseScreenshot(teamId: string, file: File, dto: ParseScrimScreenshotRequestDto) {
    const fd = new FormData();
    fd.append("screenshot", file);
    fd.append("type", dto.type);
    fd.append("map", dto.map);

    const { data } = await http.post<ParseScrimScreenshotResponseDto>(
      `/teams/${teamId}/scrims/parse-screenshot`,
      fd
    );
    return data;
  },

  async create(teamId: string, file: File, dto: CreateScrimDto) {
    const fd = new FormData();
    fd.append("screenshot", file);

    fd.append("type", dto.type);
    fd.append("map", dto.map);

    fd.append("teamRounds", String(dto.teamRounds));
    fd.append("enemyRounds", String(dto.enemyRounds));

    fd.append("teamStats", JSON.stringify(dto.teamStats));
    fd.append("enemyComposition", JSON.stringify(dto.enemyComposition));

    const { data } = await http.post(`/teams/${teamId}/scrims`, fd);
    return data;
  },
};