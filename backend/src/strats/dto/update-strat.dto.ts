import { IsEnum, IsOptional, IsString } from "class-validator";
import { MatchSide } from "src/common/enums/team-role.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";

export class UpdateStratDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ValorantMap)
  @IsOptional()
  map?: ValorantMap;

  @IsEnum(MatchSide)
  @IsOptional()
  side?: MatchSide;

  @IsString()
  @IsOptional()
  notes?: string;
}
