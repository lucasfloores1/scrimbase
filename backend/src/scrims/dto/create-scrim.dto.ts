import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ScrimType } from "../enums/scrim-type.enum";
import { Expose, Type } from "class-transformer";
import { ScrimPlayerStatDto } from "./scrim-player-stat.dto";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";
import { MAX_SCRIM_TEAM_STATS, MIN_SCRIM_TEAM_STATS } from "../enums/scrim-player-kind.enum";

export class CreateScrimDto {
  @Expose()
  @IsEnum(ScrimType)
  type: ScrimType;

  @Expose()
  @IsEnum(ValorantMap)
  map: ValorantMap;

  @Expose()
  @IsString()
  @IsNotEmpty()
  opponentName: string;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(24)
  teamRounds: number;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(24)
  enemyRounds: number;

  @Expose()
  @IsArray()
  @ArrayMinSize(MIN_SCRIM_TEAM_STATS)
  @ArrayMaxSize(MAX_SCRIM_TEAM_STATS)
  @ValidateNested({ each: true })
  @Type(() => ScrimPlayerStatDto)
  teamStats: ScrimPlayerStatDto[];

  @Expose()
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @IsEnum(ValorantAgent, { each: true })
  enemyComposition: ValorantAgent[];
}
