import { Exclude, Expose, Transform } from "class-transformer";
import { toIdString } from "src/common/utils/serialize.utils";

@Exclude()
export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  riotId?: string;

  @Expose()
  altAccountId?: string;

  @Expose()
  isEmailVerified: boolean;
}
