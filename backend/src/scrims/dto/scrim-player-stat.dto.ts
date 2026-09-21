import { Expose } from "class-transformer";
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, ValidateIf } from "class-validator";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";
import { ScrimPlayerKind } from "../enums/scrim-player-kind.enum";

export class ScrimPlayerStatDto {
  @Expose()
  @ValidateIf((o) => o.kind !== ScrimPlayerKind.SUB && !o.displayName)
  @IsMongoId()
  userId?: string;

  @Expose()
  @ValidateIf((o) => o.kind === ScrimPlayerKind.SUB || !o.userId)
  @IsString()
  @IsNotEmpty()
  displayName?: string;

  /** Omit to infer: userId => MEMBER, displayName only => SUB. */
  @Expose()
  @IsOptional()
  @IsEnum(ScrimPlayerKind)
  kind?: ScrimPlayerKind;

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
