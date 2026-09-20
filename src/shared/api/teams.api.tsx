import { http } from "@/shared/api/http";
import type { CreateTeamDto, JoinByInviteCodeDto } from "@/shared/types/dto";
import type { Team, TeamMember, TeamMemberListItem, TeamRole } from "@/shared/types/models";

export const teamsApi = {
  create(dto: CreateTeamDto) {
    return http.post<Team>("/teams", dto).then((r) => r.data);
  },
  myTeam() {
    return http.get<Team>("/teams/me").then((r) => r.data);
  },
  joinByCode(dto: JoinByInviteCodeDto) {
    return http.post<TeamMember>("/teams/join", dto).then((r) => r.data);
  },

  // ----- miembros (GET para todos, el resto requiere ser admin) -----
  getTeamMembers() {
    return http.get<TeamMemberListItem[]>("/teams/member").then((r) => r.data);
  },
  removeMember(userId: string) {
    return http.delete(`/teams/member/${userId}`).then((r) => r.data);
  },
  setMemberRole(userId: string, role: TeamRole) {
    return http.patch<TeamMember>(`/teams/member/${userId}/role`, { role }).then((r) => r.data);
  },
  setMemberAdmin(userId: string, isAdmin: boolean) {
    return http.patch<TeamMember>(`/teams/member/${userId}/admin`, { isAdmin }).then((r) => r.data);
  },
  transferAdmin(userId: string) {
    return http.post(`/teams/member/${userId}/transfer-admin`).then((r) => r.data);
  },
};
