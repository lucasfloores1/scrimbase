export type TeamRole = "PLAYER" | "COACH" | "MANAGER";

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  isAdmin: boolean;
  joinedAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  teamMember: TeamMember | null;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  createdBy: string;
  createdAt: string;
}
