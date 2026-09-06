import { Expose } from "class-transformer";
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsString, Min, ValidateIf } from "class-validator";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";

export class ScrimPlayerStatDto {
  @Expose()
  @ValidateIf((o) => !o.displayName)
  @IsMongoId()
  userId: string;

  @Expose()
  @ValidateIf((o) => !o.userId)
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @Expose()
  @IsEnum(ValorantAgent)
  agent: ValorantAgent;

  @Expose()
  @IsInt()
  @Min(0)
  kills: number;

  @Expose()
  @IsInt()
  @Min(0)
  deaths: number;

  @Expose()
  @IsInt()
  @Min(0)
  assists: number;

  @Expose()
  @IsInt()
  @Min(0)
  acs: number;
}
