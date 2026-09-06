import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { MatchSide } from "src/common/enums/team-role.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";

export class CreateStratDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ValorantMap)
  map: ValorantMap;

  @IsEnum(MatchSide)
  side: MatchSide;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;
}
