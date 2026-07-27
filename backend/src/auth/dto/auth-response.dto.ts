import { Exclude, Expose } from "class-transformer";

@Exclude()
export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;
}
