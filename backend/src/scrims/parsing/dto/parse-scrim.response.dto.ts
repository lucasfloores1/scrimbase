import { Exclude, Expose, Transform, Type } from "class-transformer";
import { ScrimOutcome } from "../../enums/scrim-outcome.enum";
import { ScrimType } from "../../enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";
import { ScrimPlayerKind } from "../../enums/scrim-player-kind.enum";
import { toRefId } from "src/common/utils/serialize.utils";

@Exclude()
export class DraftScrimPlayerStatResponseDto {
  @Expose()
  @Transform(({ obj }) => (obj.userId != null ? toRefId(obj.userId) : undefined))
  userId?: string;

  @Expose()
  displayName?: string;

  @Expose()
  kind: ScrimPlayerKind;

  @Expose()
  matched: boolean;

  @Expose()
  agent: ValorantAgent;

  @Expose()
  kills: number;

  @Expose()
  deaths: number;

  @Expose()
  assists: number;

  @Expose()
  acs: number;
}

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
  map: ValorantMap;

  /** Filled by the user on review — AI draft may omit it. */
  @Expose()
  opponentName?: string;

  @Expose()
  teamRounds: number;

  @Expose()
  enemyRounds: number;

  @Expose()
  outcome: ScrimOutcome;

  @Expose()
  enemyComposition: ValorantAgent[];

  @Expose()
  @Type(() => DraftScrimPlayerStatResponseDto)
  teamStats: DraftScrimPlayerStatResponseDto[];
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
