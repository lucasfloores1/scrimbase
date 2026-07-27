import { Exclude, Expose, Transform } from "class-transformer";
import { toIdString, toIsoDate, toRefId } from "src/common/utils/serialize.utils";

@Exclude()
export class TeamResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.createdBy))
  createdBy: string;

  @Expose()
  inviteCode: string;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.createdAt))
  createdAt?: string;
}
