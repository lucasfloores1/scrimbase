import { http } from "@/shared/api/http";
import type {
  CreateScrimDto,
  ListScrimsQuery,
  ParseScrimScreenshotResponseDto,
  ParseScrimScreenshotRequestDto,
  ScrimDto,
} from "@/shared/types/dto";

function toSearchParams(query?: ListScrimsQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();

  if (query.map) params.set("map", query.map);
  if (query.type) params.set("type", query.type);
  if (query.outcome) params.set("outcome", query.outcome);
  if (query.opponentName) params.set("opponentName", query.opponentName);
  if (query.playerId) params.set("playerId", query.playerId);
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.exactComposition) params.set("exactComposition", "true");
  if (query.agents?.length) params.set("agents", query.agents.join(","));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const scrimsApi = {
  async list(teamId: string, query?: ListScrimsQuery): Promise<ScrimDto[]> {
    const { data } = await http.get<ScrimDto[]>(
      `/teams/${teamId}/scrims${toSearchParams(query)}`,
    );
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
      fd,
    );
    return data;
  },

  async create(teamId: string, file: File, dto: CreateScrimDto) {
    const fd = new FormData();
    fd.append("screenshot", file);

    fd.append("type", dto.type);
    fd.append("map", dto.map);
    fd.append("opponentName", dto.opponentName);

    fd.append("teamRounds", String(dto.teamRounds));
    fd.append("enemyRounds", String(dto.enemyRounds));

    fd.append("teamStats", JSON.stringify(dto.teamStats));
    fd.append("enemyComposition", JSON.stringify(dto.enemyComposition));

    const { data } = await http.post(`/teams/${teamId}/scrims`, fd);
    return data;
  },
};
