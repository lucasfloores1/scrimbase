import { Exclude, Expose, Type } from "class-transformer";
import { ScrimOutcome } from "src/scrims/enums/scrim-outcome.enum";
import { ScrimType } from "src/scrims/enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";

@Exclude()
export class DashboardTeamDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  tag: string;
}

@Exclude()
export class DashboardOverviewDto {
  @Expose()
  total: number;

  @Expose()
  wins: number;

  @Expose()
  losses: number;

  @Expose()
  draws: number;

  @Expose()
  winrate: number;

  @Expose()
  roundDiff: number;

  @Expose()
  avgTeamRounds: number;

  @Expose()
  avgEnemyRounds: number;
}

@Exclude()
export class DashboardLast10Dto {
  @Expose()
  total: number;

  @Expose()
  wins: number;

  @Expose()
  losses: number;

  @Expose()
  draws: number;

  @Expose()
  winrate: number;
}

@Exclude()
export class DashboardBestMapDto {
  @Expose()
  name: string;

  @Expose()
  matches: number;

  @Expose()
  winrate: number;

  @Expose()
  wins: number;

  @Expose()
  losses: number;

  @Expose()
  draws: number;

  @Expose()
  roundDiff: number;
}

@Exclude()
export class DashboardRecentScrimDto {
  @Expose()
  id: string;

  @Expose()
  type: ScrimType;

  @Expose()
  map: ValorantMap;

  @Expose()
  outcome: ScrimOutcome;

  @Expose()
  teamRounds: number;

  @Expose()
  enemyRounds: number;

  @Expose()
  createdAt: string;
}

@Exclude()
export class DashboardResponseDto {
  @Expose()
  @Type(() => DashboardTeamDto)
  team: DashboardTeamDto | null;

  @Expose()
  @Type(() => DashboardOverviewDto)
  overview: DashboardOverviewDto;

  @Expose()
  @Type(() => DashboardLast10Dto)
  last10: DashboardLast10Dto;

  @Expose()
  @Type(() => DashboardBestMapDto)
  bestMap: DashboardBestMapDto | null;

  @Expose()
  @Type(() => DashboardRecentScrimDto)
  recentScrims: DashboardRecentScrimDto[];
}
