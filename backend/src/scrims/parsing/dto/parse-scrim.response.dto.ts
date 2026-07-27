import { Exclude, Expose, Type } from "class-transformer";
import { ScrimOutcome } from "../../enums/scrim-outcome.enum";
import { ScrimType } from "../../enums/scrim-type.enum";
import { ScrimPlayerStatResponseDto } from "../../dto/scrim.response.dto";

/**
 * Draft payload returned by parse-screenshot.
 * Kept separate from CreateScrimDto (input/validation) so serialization
 * never depends on class-validator input DTOs.
 */
@Exclude()
export class DraftScrimResponseDto {
  @Expose()
  type: ScrimType;

  @Expose()
  map: string;

  @Expose()
  teamRounds: number;

  @Expose()
  enemyRounds: number;

  @Expose()
  outcome: ScrimOutcome;

  @Expose()
  enemyComposition: string[];

  @Expose()
  @Type(() => ScrimPlayerStatResponseDto)
  teamStats: ScrimPlayerStatResponseDto[];
}

@Exclude()
export class ParseScrimScreenshotResponseDto {
  @Expose()
  rawOutputId: string;

  @Expose()
  warnings: string[];

  @Expose()
  @Type(() => DraftScrimResponseDto)
  draft: DraftScrimResponseDto;
}
