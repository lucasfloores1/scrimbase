import { Exclude, Expose, Type } from "class-transformer";
import { TeamMemberResponseDto } from "src/teams/dto/team-member.response.dto";

@Exclude()
export class MeResponseDto {
  @Expose()
  userId: string;

  @Expose()
  email: string;

  @Expose()
  username?: string;

  @Expose()
  riotId?: string;

  @Expose()
  altAccountId?: string;

  @Expose()
  @Type(() => TeamMemberResponseDto)
  teamMember: TeamMemberResponseDto | null;
}
