import { Exclude, Expose, Type } from "class-transformer";
import { TeamMemberListItemResponseDto } from "src/teams/dto/team-member.response.dto";
import { ScrimOutcome } from "src/scrims/enums/scrim-outcome.enum";
import { ScrimType } from "src/scrims/enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";

@Exclude()
export class PlayerCombatOverviewDto {
  @Expose()
  matches: number;

  @Expose()
  wins: number;

  @Expose()
  losses: number;

  @Expose()
  draws: number;

  @Expose()
  winrate: number;

  @Expose()
  kills: number;

  @Expose()
  deaths: number;

  @Expose()
  assists: number;

  @Expose()
  avgKills: number;

  @Expose()
  avgDeaths: number;

  @Expose()
  avgAssists: number;

  @Expose()
  avgAcs: number;

  @Expose()
  kd: number;
}

@Exclude()
export class PlayerAgentStatsDto {
  @Expose()
  name: string;

  @Expose()
  matches: number;

  @Expose()
  wins: number;

  @Expose()
  winrate: number;

  @Expose()
  avgAcs: number;

  @Expose()
  kd: number;
}

@Exclude()
export class PlayerMapStatsDto {
  @Expose()
  name: string;

  @Expose()
  matches: number;

  @Expose()
  wins: number;

  @Expose()
  losses: number;

  @Expose()
  draws: number;

  @Expose()
  winrate: number;

  @Expose()
  avgAcs: number;

  @Expose()
  kd: number;
}

@Exclude()
export class PlayerRecentScrimDto {
  @Expose()
  id: string;

  @Expose()
  type: ScrimType;

  @Expose()
  map: ValorantMap;

  @Expose()
  outcome: ScrimOutcome;

  @Expose()
  opponentName: string;

  @Expose()
  teamRounds: number;

  @Expose()
  enemyRounds: number;

  @Expose()
  agent: ValorantAgent;

  @Expose()
  kills: number;

  @Expose()
  deaths: number;

  @Expose()
  assists: number;

  @Expose()
  acs: number;

  @Expose()
  createdAt: string;
}

@Exclude()
export class PlayerStatsResponseDto {
  @Expose()
  @Type(() => TeamMemberListItemResponseDto)
  player: TeamMemberListItemResponseDto;

  @Expose()
  @Type(() => PlayerCombatOverviewDto)
  overview: PlayerCombatOverviewDto;

  @Expose()
  @Type(() => PlayerCombatOverviewDto)
  last10: PlayerCombatOverviewDto;

  @Expose()
  @Type(() => PlayerAgentStatsDto)
  agents: PlayerAgentStatsDto[];

  @Expose()
  @Type(() => PlayerMapStatsDto)
  maps: PlayerMapStatsDto[];

  @Expose()
  @Type(() => PlayerRecentScrimDto)
  recentScrims: PlayerRecentScrimDto[];
}
