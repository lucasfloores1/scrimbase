import { http } from "@/shared/api/http";
import type {
  CreateScrimDto,
  ListScrimsQuery,
  ParseScrimScreenshotRequestDto,
  ParseScrimScreenshotResponseDto,
  ScrimDto,
} from "@/shared/types/dto";

/** Arma los query params tal como los espera ListScrimsQueryDto del backend. */
function toParams(q: ListScrimsQuery = {}) {
  const params: Record<string, string> = {};
  if (q.map) params.map = q.map;
  if (q.type) params.type = q.type;
  if (q.outcome) params.outcome = q.outcome;
  if (q.opponentName?.trim()) params.opponentName = q.opponentName.trim();
  if (q.agents?.length) params.agents = q.agents.join(",");
  if (q.exactComposition) params.exactComposition = "true";
  if (q.playerId) params.playerId = q.playerId;
  if (q.limit) params.limit = String(q.limit);
  if (q.from) params.from = q.from;
  if (q.to) params.to = q.to;
  return params;
}

export const scrimsApi = {
  async list(teamId: string, query: ListScrimsQuery = {}): Promise<ScrimDto[]> {
    const { data } = await http.get<ScrimDto[]>(`/teams/${teamId}/scrims`, { params: toParams(query) });
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

  async create(teamId: string, file: File, dto: CreateScrimDto): Promise<ScrimDto> {
    const fd = new FormData();
    fd.append("screenshot", file);
    fd.append("type", dto.type);
    fd.append("map", dto.map);
    fd.append("opponentName", dto.opponentName);
    fd.append("teamRounds", String(dto.teamRounds));
    fd.append("enemyRounds", String(dto.enemyRounds));
    fd.append("teamStats", JSON.stringify(dto.teamStats));
    fd.append("enemyComposition", JSON.stringify(dto.enemyComposition));
    const { data } = await http.post<ScrimDto>(`/teams/${teamId}/scrims`, fd);
    return data;
  },
};
