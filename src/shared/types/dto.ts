import type { TeamMemberListItem, TeamRole } from "@/shared/types/models";

// ------------------------------------------------------------------ auth
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
export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  riotId: string;
}
export interface UpdateMeDto {
  username?: string;
  password?: string;
  altAccountId?: string;
}

// ----------------------------------------------------------------- teams
export interface CreateTeamDto {
  name: string;
  tag: string;
}
export interface JoinByInviteCodeDto {
  inviteCode: string;
}
export interface UpdateMemberRoleDto {
  role: TeamRole;
}
export interface UpdateMemberAdminDto {
  isAdmin: boolean;
}

// ----------------------------------------------------------------- scrims
export type ScrimOutcome = "WIN" | "LOSS" | "DRAW";
export type ScrimType = "SCRIM" | "TOURNAMENT" | "PREMIER";
export type MatchSide = "ATTACK" | "DEFENSE";

export interface ScrimPlayerStatDto {
  userId?: string;
  displayName?: string;
  agent: string;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
}

export interface CreateScrimDto {
  type: ScrimType;
  map: string;
  opponentName: string;
  teamRounds: number;
  enemyRounds: number;
  teamStats: ScrimPlayerStatDto[];
  enemyComposition: string[];
}

export interface ScrimDto {
  id: string;
  teamId: string;
  createdBy: string;
  type: ScrimType;
  map: string;
  opponentName: string;
  teamRounds: number;
  enemyRounds: number;
  outcome: ScrimOutcome;
  screenshotUrl: string;
  enemyComposition: string[];
  teamStats: ScrimPlayerStatDto[];
  createdAt?: string;
}

/** Query de GET /teams/:teamId/scrims — se resuelve en el backend, no en el cliente. */
export interface ListScrimsQuery {
  map?: string;
  type?: ScrimType;
  outcome?: ScrimOutcome;
  opponentName?: string;
  agents?: string[];
  exactComposition?: boolean;
  playerId?: string;
  limit?: number;
  from?: string;
  to?: string;
}

export interface ParseScrimScreenshotRequestDto {
  type: ScrimType;
  map: string;
}

export interface ParseScrimScreenshotResponseDto {
  rawOutputId: string;
  warnings?: string[];
  draft: {
    type: ScrimType;
    map: string;
    opponentName?: string;
    teamRounds: number;
    enemyRounds: number;
    outcome: ScrimOutcome;
    enemyComposition: string[];
    teamStats: ScrimPlayerStatDto[];
  };
}

// ----------------------------------------------------------------- strats
export interface StratDto {
  id: string;
  teamId: string;
  createdBy: string;
  name: string;
  map: string;
  side: MatchSide;
  notes?: string;
  screenshotUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStratDto {
  name: string;
  map: string;
  side: MatchSide;
  notes?: string;
}

// -------------------------------------------------------------- dashboard
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
  type: ScrimType;
  map: string;
  outcome: ScrimOutcome;
  teamRounds: number;
  enemyRounds: number;
  createdAt: string;
}
export interface DashboardResponseDto {
  team: DashboardTeamDto | null;
  overview: DashboardOverviewDto;
  last10: DashboardLast10Dto;
  bestMap: DashboardBestMapDto | null;
  recentScrims: DashboardRecentScrimDto[];
}

// ---------------------------------------------------------------- players
export interface PlayerCombatOverviewDto {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  kills: number;
  deaths: number;
  assists: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgAcs: number;
  kd: number;
}
export interface PlayerAgentStatsDto {
  name: string;
  matches: number;
  wins: number;
  winrate: number;
  avgAcs: number;
  kd: number;
}
export interface PlayerMapStatsDto {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  avgAcs: number;
  kd: number;
}
export interface PlayerRecentScrimDto {
  id: string;
  type: ScrimType;
  map: string;
  outcome: ScrimOutcome;
  opponentName: string;
  teamRounds: number;
  enemyRounds: number;
  agent: string;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
  createdAt: string;
}
export interface PlayerStatsResponseDto {
  player: TeamMemberListItem;
  overview: PlayerCombatOverviewDto;
  last10: PlayerCombatOverviewDto;
  agents: PlayerAgentStatsDto[];
  maps: PlayerMapStatsDto[];
  recentScrims: PlayerRecentScrimDto[];
}

// ------------------------------------------------------------ suscripción
export type PlanCode = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";
/** El cupo gratis se renueva por día; el pago, por mes. */
export type QuotaPeriod = "DAY" | "MONTH";

export interface QuotaDto {
  period: QuotaPeriod;
  /** null = sin tope. */
  limit: number | null;
  used: number;
  /** null cuando limit es null. */
  remaining: number | null;
  /** Cuándo vuelve a cero el contador. */
  resetsAt: string;
}

export interface SubscriptionDto {
  plan: PlanCode;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  quota: QuotaDto;
}

export interface CheckoutSessionDto {
  /** URL del proveedor de pagos a la que hay que redirigir. */
  url: string;
}
