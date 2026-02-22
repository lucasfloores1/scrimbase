import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ScrimPlayerStatDto } from "../../dto/scrim-player-stat.dto";

export class LlmScrimExtractionDto {
  @IsInt()
  @Min(0)
  @Max(24)
  teamRounds: number;

  @IsInt()
  @Min(0)
  @Max(24)
  enemyRounds: number;

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ScrimPlayerStatDto)
  teamStats: ScrimPlayerStatDto[];

  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ScrimPlayerStatDto)
  enemyStats: ScrimPlayerStatDto[];
}