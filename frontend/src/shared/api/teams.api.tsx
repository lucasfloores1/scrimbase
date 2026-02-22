import { http } from "@/shared/api/http";
import type { CreateTeamDto, JoinByInviteCodeDto } from "@/shared/types/dto";
import type { Team } from "@/shared/types/models";

export const teamsApi = {
  create(dto: CreateTeamDto) {
    return http.post<Team>("/teams", dto).then((r) => r.data);
  },
  myTeam() {
    return http.get<Team>("/teams/me").then((r) => r.data);
  },
  join(teamId: string) {
    return http.post(`/teams/${teamId}/join`).then((r) => r.data);
  },
  joinByCode(dto: JoinByInviteCodeDto) {
    return http.post(`/teams/join`, dto).then((r) => r.data);
  },
};