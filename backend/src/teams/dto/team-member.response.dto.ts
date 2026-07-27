import { Exclude, Expose, Transform, Type } from "class-transformer";
import { TeamRole } from "src/common/enums/team-role.enum";
import { toIdString, toIsoDate, toRefId } from "src/common/utils/serialize.utils";

@Exclude()
export class TeamMemberResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.userId))
  userId: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.teamId))
  teamId: string;

  @Expose()
  role: TeamRole;

  @Expose()
  isAdmin: boolean;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.joinedAt))
  joinedAt?: string;
}

/** Public profile fields shown on the team roster (no email). */
@Exclude()
export class TeamMemberUserResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  username: string;

  @Expose()
  riotId?: string;

  @Expose()
  altAccountId?: string;
}

/** Roster row: membership + populated public user profile */
@Exclude()
export class TeamMemberListItemResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.teamId))
  teamId: string;

  @Expose()
  role: TeamRole;

  @Expose()
  isAdmin: boolean;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.joinedAt))
  joinedAt?: string;

  @Expose()
  @Type(() => TeamMemberUserResponseDto)
  user: TeamMemberUserResponseDto;
}
