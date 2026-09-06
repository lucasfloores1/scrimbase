import type { ValorantAgentOrUnknown, ValorantMap } from "@/shared/constants/valorant";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateTeamDto {
  name: string;
  tag: string;
}

export interface JoinByInviteCodeDto {
  inviteCode: string;
}

export interface RegisterDto {
    email: string; 
    password: string; 
    username : string;
    riotId: string;
}

// ---------- Dashboard (GET /dashboard) ----------

export type ScrimOutcome = "WIN" | "LOSS" | "DRAW";

export interface DashboardTeamDto {
  id: string;
  name: string;
  tag: string;
}

export interface DashboardOverviewDto {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  roundDiff: number;
  avgTeamRounds: number;
  avgEnemyRounds: number;
}

export interface DashboardLast10Dto {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
}

export interface DashboardBestMapDto {
  name: string;
  matches: number;
  winrate: number;
  wins: number;
  losses: number;
  draws: number;
  roundDiff: number;
}

export interface DashboardRecentScrimDto {
  id: string;
  createdAt: string;
  map: ValorantMap;
  type: string;
  outcome: ScrimOutcome;
  teamRounds: number;
  enemyRounds: number;
}

export interface DashboardResponseDto {
  team: DashboardTeamDto | null;
  overview: DashboardOverviewDto;
  last10: DashboardLast10Dto;
  bestMap: DashboardBestMapDto | null;
  recentScrims: DashboardRecentScrimDto[];
}

// ---------------- Scrim -----------------------

export type ScrimType = "SCRIM" | "TOURNAMENT" | "PREMIER";

export interface ScrimPlayerStatDto {
  userId?: string;
  displayName?: string;

  agent: ValorantAgentOrUnknown;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
}

export interface CreateScrimDto {
  type: ScrimType;
  map: ValorantMap;
  opponentName: string;
  teamRounds: number;
  enemyRounds: number;
  teamStats: ScrimPlayerStatDto[];
  enemyComposition: ValorantAgentOrUnknown[];
}

export interface ParseScrimScreenshotRequestDto {
  type: ScrimType;
  map: ValorantMap;
}

export interface ParseScrimScreenshotResponseDto {
  rawOutputId: string;
  warnings?: string[];
  draft: Omit<CreateScrimDto, "opponentName"> & {
    opponentName?: string;
    outcome: ScrimOutcome;
  };
}

export interface ScrimDto {
  id: string;
  teamId: string;
  createdBy: string;

  type: ScrimType;
  map: ValorantMap;
  opponentName: string;

  teamRounds: number;
  enemyRounds: number;
  outcome: ScrimOutcome;

  screenshotUrl: string;

  teamStats: Array<{
    userId?: string;
    displayName?: string;
    agent: ValorantAgentOrUnknown;
    kills: number;
    deaths: number;
    assists: number;
    acs: number;
  }>;

  enemyComposition: ValorantAgentOrUnknown[];

  createdAt?: string;
  updatedAt?: string;
}

/** Query params for GET /teams/:teamId/scrims */
export interface ListScrimsQuery {
  map?: ValorantMap;
  type?: ScrimType;
  outcome?: ScrimOutcome;
  opponentName?: string;
  agents?: ValorantAgentOrUnknown[];
  exactComposition?: boolean;
  playerId?: string;
  limit?: number;
  from?: string;
  to?: string;
}

// ---------- Users (PUT /users/me) ----------

export interface UpdateMeDto {
  username?: string;
  password?: string;
  altAccountId?: string;
}

// ------------------ Strat ------------------

export interface StratDto {
  id: string;
  teamId: string;
  createdBy: string;
  name: string;
  map: ValorantMap;
  side?: "ATTACK" | "DEFENSE";
  notes?: string;
  screenshotUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStratDto {
  name: string;
  notes?: string;
  map: ValorantMap;
  side: "ATTACK" | "DEFENSE";
}