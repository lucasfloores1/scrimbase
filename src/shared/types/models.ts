export type TeamRole = "PLAYER" | "COACH" | "MANAGER";

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  isAdmin: boolean;
  joinedAt?: string;
}

export interface TeamMemberUser {
  id: string;
  username: string;
  riotId?: string;
  altAccountId?: string;
}

export interface TeamMemberListItem {
  id: string;
  teamId: string;
  role: TeamRole;
  isAdmin: boolean;
  joinedAt?: string;
  user: TeamMemberUser;
}

export interface AuthUser {
  userId: string;
  email: string;
  username?: string;
  riotId?: string;
  altAccountId?: string;
  teamMember: TeamMember | null;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  createdBy: string;
  inviteCode: string;
  createdAt?: string;
}
