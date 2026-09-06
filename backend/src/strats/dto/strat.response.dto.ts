import { Exclude, Expose, Transform } from "class-transformer";
import { MatchSide } from "src/common/enums/team-role.enum";
import { toIdString, toIsoDate, toRefId } from "src/common/utils/serialize.utils";
import { ValorantMap } from "src/common/enums/valorant-map.enum";

@Exclude()
export class StratResponseDto {
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
  name: string;

  @Expose()
  map: ValorantMap;

  @Expose()
  side?: MatchSide;

  @Expose()
  notes?: string;

  @Expose()
  screenshotUrl: string;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.createdAt))
  createdAt?: string;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.updatedAt))
  updatedAt?: string;
}
