import { Exclude, Expose, Transform, Type } from "class-transformer";
import { toIdString, toIsoDate, toRefId } from "src/common/utils/serialize.utils";

@Exclude()
export class ScrimPlayerStatResponseDto {
  @Expose()
  @Transform(({ obj }) => (obj.userId != null ? toRefId(obj.userId) : undefined))
  userId?: string;

  @Expose()
  displayName?: string;

  @Expose()
  agent: string;

  @Expose()
  kills: number;

  @Expose()
  deaths: number;

  @Expose()
  assists: number;

  @Expose()
  acs: number;
}

@Exclude()
export class ScrimResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.teamId))
  teamId: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.createdBy))
  createdBy: string;

  @Expose()
  type: string;

  @Expose()
  map: string;

  @Expose()
  teamRounds: number;

  @Expose()
  enemyRounds: number;

  @Expose()
  outcome: string;

  @Expose()
  screenshotUrl: string;

  @Expose()
  enemyComposition: string[];

  @Expose()
  @Type(() => ScrimPlayerStatResponseDto)
  teamStats: ScrimPlayerStatResponseDto[];

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.createdAt))
  createdAt?: string;
}
